package main

import (
	"context"
	"fmt"
	"encoding/json"
	"flag"
	"log/slog"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	batchv1 "k8s.io/api/batch/v1"
	corev1 "k8s.io/api/core/v1"
	k8serrors "k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/client-go/dynamic" // Import Dynamic Client
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
	"k8s.io/client-go/util/homedir"
)

// Server holds dependencies to avoid global state
type Server struct {
	KubeClient    kubernetes.Interface
	DynamicClient dynamic.Interface // Add Dynamic Client here
	Logger        *slog.Logger
}

type BuildRequest struct {
	ContainerID string `json:"containerID"`
	ProjectID   string `json:"projectID"`
	Name        string `json:"name"`    // App name
	Image       string `json:"image"`   // Destination Image
	RepoURL     string `json:"repoUrl"` // Source Git URL
	Branch      string `json:"branch"`  // Git Branch
	Port        int    `json:"port"`    // Optional: App Port
}

type Response struct {
	Namespace string `json:"namespace"`
	JobName   string `json:"job_name,omitempty"`
	AppName   string `json:"app_name,omitempty"`
	Message   string `json:"message"`
	Existed   bool   `json:"existed"`
}

// Regex for DNS-1123 validation
var validNameRegex = regexp.MustCompile(`^[a-z0-9]([-a-z0-9]*[a-z0-9])?$`)

// Define the GVR (Group Version Resource) for your CRD
var webAppGVR = schema.GroupVersionResource{
	Group:    "kleff.kleff.io",
	Version:  "v1",
	Resource: "webapps", // Plural name of the resource
}

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))

	var kubeconfig *string
	if home := homedir.HomeDir(); home != "" {
		kubeconfig = flag.String("kubeconfig", filepath.Join(home, ".kube", "config"), "(optional) absolute path to the kubeconfig file")
	} else {
		kubeconfig = flag.String("kubeconfig", "", "absolute path to the kubeconfig file")
	}
	flag.Parse()

	config, err := rest.InClusterConfig()
	if err != nil {
		config, err = clientcmd.BuildConfigFromFlags("", *kubeconfig)
		if err != nil {
			logger.Error("Error building kubeconfig", "error", err)
			os.Exit(1)
		}
	}

	// 1. Standard Client
	clientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		logger.Error("Error creating clientset", "error", err)
		os.Exit(1)
	}

	// 2. Dynamic Client (For CRDs)
	dynClient, err := dynamic.NewForConfig(config)
	if err != nil {
		logger.Error("Error creating dynamic client", "error", err)
		os.Exit(1)
	}

	server := &Server{
		KubeClient:    clientset,
		DynamicClient: dynClient,
		Logger:        logger,
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/api/v1/build/create", enableCors(server.handleCreateBuild))

	srv := &http.Server{
		Addr:         ":8080",
		Handler:      mux,
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	logger.Info("Build Manager started on port 8080...")
	if err := srv.ListenAndServe(); err != nil {
		logger.Error("Server failed", "error", err)
	}
}

func (s *Server) handleCreateBuild(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, 1048576)

	var req BuildRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON body", http.StatusBadRequest)
		return
	}

	// Basic Validation
	if req.ProjectID == "" || req.RepoURL == "" || req.Image == "" {
		http.Error(w, "projectID, repoUrl, and image are required", http.StatusBadRequest)
		return
	}

	// Sanitize ProjectID for Namespace
	namespaceName, err := validateAndSanitize(req.ProjectID)
	if err != nil {
		http.Error(w, fmt.Sprintf("Invalid Project ID: %v", err), http.StatusBadRequest)
		return
	}

	// Sanitize Name for WebApp (default to projectID if empty)
	appName := req.Name
	if appName == "" {
		appName = namespaceName
	}
	appName, err = validateAndSanitize(appName)
	if err != nil {
		http.Error(w, fmt.Sprintf("Invalid App Name: %v", err), http.StatusBadRequest)
		return
	}

	// 1. Create Target Namespace
	existed, err := s.createNamespace(r.Context(), namespaceName)
	if err != nil {
		s.Logger.Error("Failed to create namespace", "namespace", namespaceName, "error", err)
		http.Error(w, "Failed to create namespace", http.StatusInternalServerError)
		return
	}

	// 2. Create Kaniko Build Job (in default namespace)
	jobName := fmt.Sprintf("build-%s-%d", namespaceName, time.Now().Unix())
	if err := s.createKanikoJob(r.Context(), "default", jobName, req.RepoURL, req.Branch, req.Image); err != nil {
		s.Logger.Error("Failed to create build job", "error", err)
		http.Error(w, "Failed to create build job", http.StatusInternalServerError)
		return
	}

	// 3. Create WebApp CRD (in the Target Namespace)
	// We do this immediately. K8s will try to start the pod, get 'ImagePullBackOff'
	// until Kaniko finishes pushing, then it will auto-recover and start running.
	if err := s.createWebApp(r.Context(), namespaceName, appName, req); err != nil {
		s.Logger.Error("Failed to create WebApp CR", "error", err)
		http.Error(w, fmt.Sprintf("Build started, but failed to create WebApp: %v", err), http.StatusInternalServerError)
		return
	}

	// 4. Return Response
	msg := "Build started and WebApp created"
	if existed {
		msg = "Namespace existed, new build started and WebApp updated/created"
	}

	s.Logger.Info("Build job submitted and WebApp created", "job", jobName, "app", appName)

	resp := Response{
		Namespace: namespaceName,
		JobName:   jobName,
		AppName:   appName,
		Message:   msg,
		Existed:   existed,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

// createWebApp uses the Dynamic Client to create the Custom Resource
func (s *Server) createWebApp(ctx context.Context, namespace, name string, req BuildRequest) error {
	// Set default port if not provided
	port := req.Port
	if port == 0 {
		port = 8080
	}

	// Construct the Unstructured object
	// This maps exactly to the YAML structure of your CRD
	webApp := &unstructured.Unstructured{
		Object: map[string]interface{}{
			"apiVersion": "kleff.kleff.io/v1",
			"kind":       "WebApp",
			"metadata": map[string]interface{}{
				"name":      name,
				"namespace": namespace,
			},
			"spec": map[string]interface{}{
				"displayName": req.Name,
				"image":       req.Image,   // The image Kaniko is pushing to
				"port":        int64(port), // Ensure int64 for json serialization numbers
				"repoURL":     req.RepoURL,
				"branch":      req.Branch,
			},
		},
	}

	// Create or Update logic
	// We try to create first
	_, err := s.DynamicClient.Resource(webAppGVR).Namespace(namespace).Create(ctx, webApp, metav1.CreateOptions{})
	if err != nil {
		if k8serrors.IsAlreadyExists(err) {
			// If it exists, we might want to update the image field
			s.Logger.Info("WebApp already exists, updating image...", "name", name)
			
			// Get existing
			existing, getErr := s.DynamicClient.Resource(webAppGVR).Namespace(namespace).Get(ctx, name, metav1.GetOptions{})
			if getErr != nil {
				return getErr
			}

			// Update fields
			existing.Object["spec"].(map[string]interface{})["image"] = req.Image
			existing.Object["spec"].(map[string]interface{})["branch"] = req.Branch
			
			// Submit Update
			_, updateErr := s.DynamicClient.Resource(webAppGVR).Namespace(namespace).Update(ctx, existing, metav1.UpdateOptions{})
			return updateErr
		}
		return err
	}

	return nil
}

// ... [Keep createNamespace, createKanikoJob, validateAndSanitize, enableCors as they were] ...

func (s *Server) createNamespace(ctx context.Context, name string) (bool, error) {
	// ... [Same as your original code] ...
    nsSpec := &corev1.Namespace{
		ObjectMeta: metav1.ObjectMeta{
			Name: name,
			Labels: map[string]string{
				"managed-by": "paas-backend",
				"project-id": name,
			},
		},
	}

	_, err := s.KubeClient.CoreV1().Namespaces().Create(ctx, nsSpec, metav1.CreateOptions{})

	if err != nil {
		if k8serrors.IsAlreadyExists(err) {
			return true, nil
		}
		return false, err
	}
	return false, nil
}

func (s *Server) createKanikoJob(ctx context.Context, namespace, jobName, gitRepo, branch, destinationImage string) error {
	// ... [Same as your original code] ...
    // Ensure you use the git:// fix and branch logic provided in the previous turn
    
    // 1. Fix Git Context
    gitContext := gitRepo
	if strings.HasPrefix(gitContext, "https://") {
		gitContext = "git://" + strings.TrimPrefix(gitContext, "https://")
	} else if !strings.HasPrefix(gitContext, "git://") {
		gitContext = "git://" + gitContext
	}
	if branch != "" {
		gitContext = fmt.Sprintf("%s#refs/heads/%s", gitContext, branch)
	}

    job := &batchv1.Job{
		ObjectMeta: metav1.ObjectMeta{
			Name:      jobName,
			Namespace: namespace,
		},
		Spec: batchv1.JobSpec{
			BackoffLimit: func(i int32) *int32 { return &i }(2),
			Template: corev1.PodTemplateSpec{
				Spec: corev1.PodSpec{
					RestartPolicy: corev1.RestartPolicyNever,
					Containers: []corev1.Container{
						{
							Name:  "kaniko",
							Image: "gcr.io/kaniko-project/executor:latest",
							Args: []string{
								"--dockerfile=Dockerfile",
								"--context=" + gitContext,
								"--destination=" + destinationImage,
							},
							VolumeMounts: []corev1.VolumeMount{
								{
									Name:      "acr-creds-vol",
									MountPath: "/kaniko/.docker",
								},
							},
						},
					},
					Volumes: []corev1.Volume{
						{
							Name: "acr-creds-vol",
							VolumeSource: corev1.VolumeSource{
								Secret: &corev1.SecretVolumeSource{
									SecretName: "acr-creds",
									Items: []corev1.KeyToPath{
										{
											Key:  ".dockerconfigjson",
											Path: "config.json",
										},
									},
								},
							},
						},
					},
				},
			},
		},
	}

	_, err := s.KubeClient.BatchV1().Jobs(namespace).Create(ctx, job, metav1.CreateOptions{})
	return err
}

func validateAndSanitize(name string) (string, error) {
	name = strings.ToLower(name)
	name = strings.ReplaceAll(name, "_", "-")
	name = strings.ReplaceAll(name, " ", "-")
	name = strings.Trim(name, "-")

	if len(name) > 63 {
		return "", fmt.Errorf("name too long (max 63 chars)")
	}
	if len(name) == 0 {
		return "", fmt.Errorf("name cannot be empty")
	}

	if !validNameRegex.MatchString(name) {
		return "", fmt.Errorf("name must consist of alphanumeric characters or '-', and start/end with alphanumeric")
	}

	return name, nil
}

func enableCors(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if origin != "" {
			w.Header().Set("Access-Control-Allow-Origin", origin)
		}

		w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Authorization")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next(w, r)
	}
}