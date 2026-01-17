package controller

import (
	"context"
	"fmt"

	appsv1 "k8s.io/api/apps/v1"
	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/meta"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/util/intstr"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/controller/controllerutil"
	"sigs.k8s.io/controller-runtime/pkg/log"

	istionetworking "istio.io/client-go/pkg/apis/networking/v1beta1"
	istioapi "istio.io/api/networking/v1beta1"
	
	kleffv1 "kleff.io/api/v1"
)

type WebAppReconciler struct {
	client.Client
	Scheme *runtime.Scheme
}

//+kubebuilder:rbac:groups=kleff.kleff.io,resources=webapps,verbs=get;list;watch;create;update;patch;delete
//+kubebuilder:rbac:groups=kleff.kleff.io,resources=webapps/status,verbs=get;update;patch
//+kubebuilder:rbac:groups=apps,resources=deployments,verbs=get;list;watch;create;update;patch;delete
//+kubebuilder:rbac:groups="",resources=services,verbs=get;list;watch;create;update;patch;delete
//+kubebuilder:rbac:groups=networking.istio.io,resources=virtualservices,verbs=get;list;watch;create;update;patch;delete

func (r *WebAppReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	logger := log.FromContext(ctx)

	// 1. Fetch WebApp
	webapp := &kleffv1.WebApp{}
	err := r.Get(ctx, req.NamespacedName, webapp)
	if err != nil {
		return ctrl.Result{}, client.IgnoreNotFound(err)
	}

	// --- DEFINE LABELS ---
	// We define common labels here to reuse them for Deployment, Pods, and Service.
	// We inject the ContainerID here so we can find resources by UUID later.
	labels := map[string]string{
		"app":        webapp.Name,
		"controller": "webapp",
	}
	if webapp.Spec.ContainerID != "" {
		labels["container-id"] = webapp.Spec.ContainerID
	}
	// ---------------------

	// 2. Sync Deployment
	deployment := &appsv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{Name: webapp.Name, Namespace: webapp.Namespace},
	}

	op, err := controllerutil.CreateOrUpdate(ctx, r.Client, deployment, func() error {
		// Update Deployment metadata labels
		deployment.Labels = labels

		if deployment.CreationTimestamp.IsZero() {
			// Selector must correspond to the Pod template labels.
			// Note: We usually keep selectors immutable/simple, but here we match the labels map.
			deployment.Spec.Selector = &metav1.LabelSelector{MatchLabels: labels}
		}

		replicas := int32(1)
		deployment.Spec.Replicas = &replicas

		if deployment.Spec.Template.ObjectMeta.Labels == nil {
			deployment.Spec.Template.ObjectMeta.Labels = make(map[string]string)
		}
		// Apply labels to the Pod Template
		for k, v := range labels {
			deployment.Spec.Template.ObjectMeta.Labels[k] = v
		}

		deployment.Spec.Template.Spec.ImagePullSecrets = []corev1.LocalObjectReference{
			{Name: "acr-creds"},
		}

		// Build environment variables from WebApp spec
		var envVars []corev1.EnvVar
		if webapp.Spec.EnvVariables != nil {
			for key, value := range webapp.Spec.EnvVariables {
				envVars = append(envVars, corev1.EnvVar{
					Name:  key,
					Value: value,
				})
			}
		}

		deployment.Spec.Template.Spec.Containers = []corev1.Container{{
			Name:            "app",
			Image:           webapp.Spec.Image,
			ImagePullPolicy: corev1.PullAlways,
			Env:             envVars,
			Ports: []corev1.ContainerPort{{
				Name:          "http",
				ContainerPort: int32(webapp.Spec.Port),
				Protocol:      corev1.ProtocolTCP,
			}},
			LivenessProbe: &corev1.Probe{
				ProbeHandler: corev1.ProbeHandler{
					TCPSocket: &corev1.TCPSocketAction{Port: intstr.FromInt(webapp.Spec.Port)},
				},
			},
		}}

		return controllerutil.SetControllerReference(webapp, deployment, r.Scheme)
	})

	if err != nil {
		logger.Error(err, "Failed to reconcile Deployment")
		return r.updateStatus(ctx, webapp, metav1.ConditionFalse, "DeploymentFailed", err.Error())
	}
	if op != controllerutil.OperationResultNone {
		logger.Info("Deployment reconciled", "operation", op)
	}

	// 3. Sync Service
	service := &corev1.Service{
		ObjectMeta: metav1.ObjectMeta{Name: webapp.Name, Namespace: webapp.Namespace},
	}

	op, err = controllerutil.CreateOrUpdate(ctx, r.Client, service, func() error {
		// Apply labels to Service metadata
		service.Labels = labels

		service.Spec.Selector = labels
		service.Spec.Type = corev1.ServiceTypeClusterIP
		service.Spec.Ports = []corev1.ServicePort{{
			Name:       "http",
			Port:       80,
			TargetPort: intstr.FromInt(webapp.Spec.Port),
			Protocol:   corev1.ProtocolTCP,
		}}
		return controllerutil.SetControllerReference(webapp, service, r.Scheme)
	})

	if err != nil {
		return r.updateStatus(ctx, webapp, metav1.ConditionFalse, "ServiceFailed", err.Error())
	}

	// 4. Sync VirtualService
	virtualService := &istionetworking.VirtualService{
		ObjectMeta: metav1.ObjectMeta{Name: webapp.Name + "-vs", Namespace: webapp.Namespace},
	}

	op, err = controllerutil.CreateOrUpdate(ctx, r.Client, virtualService, func() error {
		// Apply labels to VirtualService metadata
		virtualService.Labels = labels

		host := fmt.Sprintf("%s.kleff.io", webapp.Name)
		
		if virtualService.Annotations == nil {
			virtualService.Annotations = make(map[string]string)
		}
		
		virtualService.Annotations["external-dns.alpha.kubernetes.io/target"] = "66.130.187.229"
		virtualService.Annotations["external-dns.alpha.kubernetes.io/cloudflare-proxied"] = "false"
		virtualService.Annotations["external-dns.alpha.kubernetes.io/ttl"] = "3600"

		virtualService.Spec = istioapi.VirtualService{
			Hosts:    []string{host},
			Gateways: []string{"istio-system/kleff-gateway"},
			Http: []*istioapi.HTTPRoute{
				{
					Match: []*istioapi.HTTPMatchRequest{
						{
							Uri: &istioapi.StringMatch{
								MatchType: &istioapi.StringMatch_Prefix{
									Prefix: "/",
								},
							},
						},
					},
					Route: []*istioapi.HTTPRouteDestination{
						{
							Destination: &istioapi.Destination{
								Host: webapp.Name,
								Port: &istioapi.PortSelector{
									Number: 80,
								},
							},
						},
					},
				},
			},
		}

		return controllerutil.SetControllerReference(webapp, virtualService, r.Scheme)
	})

	if err != nil {
		logger.Error(err, "Failed to reconcile VirtualService")
		return r.updateStatus(ctx, webapp, metav1.ConditionFalse, "VirtualServiceFailed", err.Error())
	}
	
	if op != controllerutil.OperationResultNone {
		logger.Info("VirtualService reconciled", "operation", op)
	}

	// 5. Update Status
	if deployment.Status.ReadyReplicas > 0 {
		return r.updateStatus(ctx, webapp, metav1.ConditionTrue, "Available", "WebApp is running and exposed")
	} else {
		return r.updateStatus(ctx, webapp, metav1.ConditionFalse, "Progressing", "Waiting for pods to be ready")
	}
}

func (r *WebAppReconciler) updateStatus(ctx context.Context, webapp *kleffv1.WebApp, status metav1.ConditionStatus, reason, message string) (ctrl.Result, error) {
	currentCond := meta.FindStatusCondition(webapp.Status.Conditions, "Available")

	if currentCond != nil &&
		currentCond.Status == status &&
		currentCond.Reason == reason &&
		currentCond.Message == message {
		return ctrl.Result{}, nil
	}

	meta.SetStatusCondition(&webapp.Status.Conditions, metav1.Condition{
		Type:               "Available",
		Status:             status,
		Reason:             reason,
		Message:            message,
		LastTransitionTime: metav1.Now(),
	})

	if err := r.Status().Update(ctx, webapp); err != nil {
		return ctrl.Result{}, err
	}

	return ctrl.Result{}, nil
}

// SetupWithManager sets up the controller with the Manager.
func (r *WebAppReconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		For(&kleffv1.WebApp{}).
		Owns(&appsv1.Deployment{}).
		Owns(&corev1.Service{}).
		Owns(&istionetworking.VirtualService{}). 
		Complete(r)
}