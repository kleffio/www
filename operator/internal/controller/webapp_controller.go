package controller

import (
	"context"

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

	kleffv1 "kleff.io/api/v1" // Assuming this matches your go.mod
)

type WebAppReconciler struct {
	client.Client
	Scheme *runtime.Scheme
}

//+kubebuilder:rbac:groups=kleff.kleff.io,resources=webapps,verbs=get;list;watch;create;update;patch;delete
//+kubebuilder:rbac:groups=kleff.kleff.io,resources=webapps/status,verbs=get;update;patch
//+kubebuilder:rbac:groups=apps,resources=deployments,verbs=get;list;watch;create;update;patch;delete
//+kubebuilder:rbac:groups="",resources=services,verbs=get;list;watch;create;update;patch;delete

func (r *WebAppReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	logger := log.FromContext(ctx)

	// 1. Fetch WebApp
	webapp := &kleffv1.WebApp{} // FIXED: Use the correct package alias
	err := r.Get(ctx, req.NamespacedName, webapp)
	if err != nil {
		return ctrl.Result{}, client.IgnoreNotFound(err)
	}

	// 2. Sync Deployment
	deployment := &appsv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{Name: webapp.Name, Namespace: webapp.Namespace},
	}

	op, err := controllerutil.CreateOrUpdate(ctx, r.Client, deployment, func() error {
		labels := map[string]string{
			"app":        webapp.Name,
			"controller": "webapp",
		}

		// Immutable Selector Check
		if deployment.CreationTimestamp.IsZero() {
			deployment.Spec.Selector = &metav1.LabelSelector{MatchLabels: labels}
		}

		// Use a pointer to int32 (inline helper)
		replicas := int32(1)
		deployment.Spec.Replicas = &replicas

		if deployment.Spec.Template.ObjectMeta.Labels == nil {
			deployment.Spec.Template.ObjectMeta.Labels = make(map[string]string)
		}
		for k, v := range labels {
			deployment.Spec.Template.ObjectMeta.Labels[k] = v
		}

		deployment.Spec.Template.Spec.Containers = []corev1.Container{{
			Name:  "app",
			Image: webapp.Spec.Image,
			// Add ImagePullPolicy to ensure updates to 'latest' tag work
			ImagePullPolicy: corev1.PullAlways,
			Ports: []corev1.ContainerPort{{
				Name:          "http",
				ContainerPort: int32(webapp.Spec.Port),
				Protocol:      corev1.ProtocolTCP,
			}},
			// Best Practice: Add Liveness probe
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

	// Log change only if actual change happened
	if op != controllerutil.OperationResultNone {
		logger.Info("Deployment reconciled", "operation", op)
	}

	// 3. Sync Service
	service := &corev1.Service{
		ObjectMeta: metav1.ObjectMeta{Name: webapp.Name, Namespace: webapp.Namespace},
	}

	op, err = controllerutil.CreateOrUpdate(ctx, r.Client, service, func() error {
		labels := map[string]string{
			"app":        webapp.Name,
			"controller": "webapp",
		}
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

	// 4. Update Status
	// We check if the deployment is actually ready before saying "Available"
	// (Optional but recommended improvement)
	if deployment.Status.ReadyReplicas > 0 {
		return r.updateStatus(ctx, webapp, metav1.ConditionTrue, "Available", "WebApp is running")
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
		// Watch WebApp resources (the primary resource)
		For(&kleffv1.WebApp{}).
		// Watch Deployments (so if the Deployment is deleted, Reconcile is triggered)
		Owns(&appsv1.Deployment{}).
		// Watch Services (so if the Service is deleted, Reconcile is triggered)
		Owns(&corev1.Service{}).
		Complete(r)
}
