package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"
	"path/filepath"
	"strings"
	"time"

	appsv1 "k8s.io/api/apps/v1"
	batchv1 "k8s.io/api/batch/v1"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/util/intstr"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
	"k8s.io/client-go/util/homedir"
)

type BuildRequest struct {
	RepoURL   string `json:"repo_url"`
	Branch    string `json:"branch"` 
	ImageName string `json:"image_name"`
	AppPort   int32  `json:"app_port"`
}

type BuildResponse struct {
	JobID   string `json:"job_id"`
	Message string `json:"message"`
}

var clientset *kubernetes.Clientset

const (
	Namespace  = "kleff-deployment"
	Registry   = "kleff.azurecr.io"
	SecretName = "acr-creds"
)

func main() {
	var config *rest.Config
	var err error
	config, err = rest.InClusterConfig()
	if err != nil {
		var kubeconfig *string
		if home := homedir.HomeDir(); home != "" {
			kubeconfig = flag.String("kubeconfig", filepath.Join(home, ".kube", "config"), "(optional) absolute path to the kubeconfig file")
		} else {
			kubeconfig = flag.String("kubeconfig", "", "absolute path to the kubeconfig file")
		}
		flag.Parse()
		config, err = clientcmd.BuildConfigFromFlags("", *kubeconfig)
		if err != nil {
			panic(err.Error())
		}
	}
	clientset, err = kubernetes.NewForConfig(config)
	if err != nil {
		panic(err.Error())
	}

	http.HandleFunc("/api/v1/deployment/build", enableCors(handleBuildTrigger))

	log.Println("PaaS Backend started on port 8080...")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func handleBuildTrigger(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	var req BuildRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Default port if missing
	if req.AppPort == 0 {
		req.AppPort = 80
	}

	// Default branch if missing
	if req.Branch == "" {
		req.Branch = "main"
	}

	jobName, err := createKanikoJob(req.RepoURL, req.Branch, req.ImageName)
	if err != nil {
		http.Error(w, "Failed to create build job: "+err.Error(), http.StatusInternalServerError)
		return
	}

	go monitorJobAndDeploy(jobName, req.ImageName, req.AppPort)

	// return response
	resp := BuildResponse{
		JobID:   jobName,
		Message: "Build started. Deployment will trigger automatically upon success.",
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

// --- ASYNC WORKFLOW ---

func monitorJobAndDeploy(jobName, rawImageName string, appPort int32) {
	log.Printf("Starting background monitor for Job: %s", jobName)

	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	timeout := time.After(10 * time.Minute)

	for {
		select {
		case <-timeout:
			log.Printf("Timeout waiting for job %s", jobName)
			return
		case <-ticker.C:
			job, err := clientset.BatchV1().Jobs(Namespace).Get(context.TODO(), jobName, metav1.GetOptions{})
			if err != nil {
				log.Printf("Error monitoring job: %v", err)
				return
			}

			// if successful
			if job.Status.Succeeded > 0 {
				log.Printf("Job %s succeeded! Starting Deployment...", jobName)

				// create deployment
				if err := createDeployment(rawImageName, appPort); err != nil {
					log.Printf("Deployment failed: %v", err)
					return
				}

				// create service
				if err := createService(rawImageName, appPort); err != nil {
					log.Printf("Service creation failed: %v", err)
					return
				}

				log.Printf("Successfully deployed %s", rawImageName)
				return
			}

			if job.Status.Failed > 0 {
				log.Printf("Job %s failed. Aborting deployment.", jobName)
				return
			}
		}
	}
}


// Helper to ensure Service and Deployment always use the exact same name/label
func sanitizeName(name string) string {
	return strings.ToLower(strings.ReplaceAll(name, "_", "-"))
}

func createDeployment(rawImageName string, appPort int32) error {
	deploymentName := sanitizeName(rawImageName)
	fullImage := fmt.Sprintf("%s/%s:latest", Registry, rawImageName) 
	replicas := int32(1)

	deployment := &appsv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{Name: deploymentName, Namespace: Namespace},
		Spec: appsv1.DeploymentSpec{
			Replicas: &replicas,
			Selector: &metav1.LabelSelector{MatchLabels: map[string]string{"app": deploymentName}},
			Template: corev1.PodTemplateSpec{
				ObjectMeta: metav1.ObjectMeta{
					Labels: map[string]string{"app": deploymentName},
					Annotations: map[string]string{
						"kubectl.kubernetes.io/restartedAt": time.Now().Format(time.RFC3339),
					},
				},
				Spec: corev1.PodSpec{
					ImagePullSecrets: []corev1.LocalObjectReference{{Name: SecretName}},
					Containers: []corev1.Container{
						{
							Name:            deploymentName,
							Image:           fullImage,
							ImagePullPolicy: corev1.PullAlways,
							Ports:           []corev1.ContainerPort{{ContainerPort: appPort}},
						},
					},
				},
			},
		},
	}

	depClient := clientset.AppsV1().Deployments(Namespace)
	_, err := depClient.Create(context.TODO(), deployment, metav1.CreateOptions{})

	if err != nil && strings.Contains(err.Error(), "already exists") {
		log.Printf("Deployment %s exists, updating...", deploymentName)
		existing, getErr := depClient.Get(context.TODO(), deploymentName, metav1.GetOptions{})
		if getErr != nil {
			return getErr
		}

		// Update the existing object
		existing.Spec.Template.Spec.Containers[0].Image = fullImage
		// Update annotation to force rollout
		if existing.Spec.Template.Annotations == nil {
			existing.Spec.Template.Annotations = make(map[string]string)
		}
		existing.Spec.Template.Annotations["kubectl.kubernetes.io/restartedAt"] = time.Now().Format(time.RFC3339)

		_, err = depClient.Update(context.TODO(), existing, metav1.UpdateOptions{})
	}
	return err
}

func createService(rawImageName string, appPort int32) error {

	serviceName := sanitizeName(rawImageName)

	service := &corev1.Service{
		ObjectMeta: metav1.ObjectMeta{
			Name:      serviceName,
			Namespace: Namespace,
		},
		Spec: corev1.ServiceSpec{
			Selector: map[string]string{
				"app": serviceName, 
			},
			Ports: []corev1.ServicePort{
				{
					Protocol:   corev1.ProtocolTCP,
					Port:       80,                       
					TargetPort: intstr.FromInt(int(appPort)), 
				},
			},
			Type: corev1.ServiceTypeClusterIP,
		},
	}

	_, err := clientset.CoreV1().Services(Namespace).Create(context.TODO(), service, metav1.CreateOptions{})

	if err != nil && strings.Contains(err.Error(), "already exists") {
		
		return nil
	}
	return err
}

func createKanikoJob(rawUrl, branch, imageName string) (string, error) {
	if branch == "" {
		branch = "main"
	}

	// remove https http prefixes
	rawUrl = strings.TrimPrefix(rawUrl, "https://")
	rawUrl = strings.TrimPrefix(rawUrl, "http://")
	rawUrl = strings.TrimSuffix(rawUrl, "/")

	if !strings.HasSuffix(rawUrl, ".git") {
		rawUrl = rawUrl + ".git"
	}

	gitContext := fmt.Sprintf("git://%s#refs/heads/%s", rawUrl, branch)

	destination := fmt.Sprintf("%s/%s:latest", Registry, imageName)
	ttlSeconds := int32(300)
	backoffLimit := int32(0)

	jobName := fmt.Sprintf("build-%s-%d", sanitizeName(imageName), time.Now().Unix())

	job := &batchv1.Job{
		ObjectMeta: metav1.ObjectMeta{
			Name:      jobName,
			Namespace: Namespace,
		},
		Spec: batchv1.JobSpec{
			TTLSecondsAfterFinished: &ttlSeconds,
			BackoffLimit:            &backoffLimit,
			Template: corev1.PodTemplateSpec{
				ObjectMeta: metav1.ObjectMeta{
					Labels: map[string]string{"sidecar.istio.io/inject": "false"},
				},
				Spec: corev1.PodSpec{
					RestartPolicy: corev1.RestartPolicyNever,
					Volumes: []corev1.Volume{
						{
							Name: "kaniko-secret",
							VolumeSource: corev1.VolumeSource{
								Secret: &corev1.SecretVolumeSource{
									SecretName: SecretName,
									Items:      []corev1.KeyToPath{{Key: ".dockerconfigjson", Path: "config.json"}},
								},
							},
						},
					},
					Containers: []corev1.Container{
						{
							Name:  "kaniko",
							Image: "gcr.io/kaniko-project/executor:latest",
							Args: []string{
								"--context=" + gitContext,
								"--dockerfile=Dockerfile",
								"--destination=" + destination,
								"--cache=true",
								// If you are using a Private Repo, you might need to skip TLS verify or add credentials
								// "--git.insecure-skip-tls-verify", 
							},
							VolumeMounts: []corev1.VolumeMount{
								{Name: "kaniko-secret", MountPath: "/kaniko/.docker/"},
							},
						},
					},
				},
			},
		},
	}

	createdJob, err := clientset.BatchV1().Jobs(Namespace).Create(context.TODO(), job, metav1.CreateOptions{})
	if err != nil {
		return "", err
	}
	return createdJob.Name, nil
}

func enableCors(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if origin != "" {
			w.Header().Set("Access-Control-Allow-Origin", origin)
		} else {
			w.Header().Set("Access-Control-Allow-Origin", "*")
		}
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next(w, r)
	}
}