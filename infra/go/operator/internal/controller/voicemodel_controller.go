/*
Copyright 2025.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package controller

import (
	"context"

	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/client-go/tools/record"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/reconcile"

	streamingaudiov1alpha1 "github.com/sizigi/streaming-audio-backend/infra/go/operator/api/v1alpha1"
	"github.com/sizigi/streaming-audio-backend/infra/go/operator/pkg/operator"
)

// VoiceModelReconciler reconciles a VoiceModel object
type VoiceModelReconciler struct {
	client.Client
	Scheme   *runtime.Scheme
	Recorder record.EventRecorder
}

// +kubebuilder:rbac:groups=streaming-audio.sizigistudios.com,resources=voicemodels,verbs=get;list;watch;create;update;patch;delete
// +kubebuilder:rbac:groups=streaming-audio.sizigistudios.com,resources=voicemodels/status,verbs=get;update;patch
// +kubebuilder:rbac:groups=streaming-audio.sizigistudios.com,resources=voicemodels/finalizers,verbs=update

// Reconcile is part of the main kubernetes reconciliation loop which aims to
// move the current state of the cluster closer to the desired state.
// TODO(user): Modify the Reconcile function to compare the state specified by
// the VoiceModel object against the actual cluster state, and then
// perform operations to make the cluster state reflect the state specified by
// the user.
//
// For more details, check Reconcile and its Result here:
// - https://pkg.go.dev/sigs.k8s.io/controller-runtime@v0.19.4/pkg/reconcile
func (r *VoiceModelReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	var m streamingaudiov1alpha1.VoiceModel

	err := r.Get(ctx, req.NamespacedName, &m)
	if err != nil {
		return reconcile.Result{}, client.IgnoreNotFound(err)
	}

	ctx = operator.WithWrappedRecorder(ctx, operator.NewWrappedRecorder(r.Recorder, &m))
	ctx = operator.WithClient(ctx, r.Client)

	res, err := operator.ResultFromError(r.reconcile(ctx, req, &m))

	return operator.HandleError(ctx, res, err)
}

func (r *VoiceModelReconciler) reconcile(ctx context.Context, req ctrl.Request, m *streamingaudiov1alpha1.VoiceModel) error {
	// client := operator.ClientFromContext(ctx)
	// recorder := operator.WrappedRecorderFromContext[*streamingaudiov1alpha1.VoiceModel](ctx)

	return operator.NewSubReconcilers[*streamingaudiov1alpha1.VoiceModel]().Reconcile(ctx, req, m)
}

// SetupWithManager sets up the controller with the Manager.
func (r *VoiceModelReconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		For(&streamingaudiov1alpha1.VoiceModel{}).
		Named("voicemodel").
		Complete(r)
}
