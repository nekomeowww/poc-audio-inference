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

package v1alpha1

import (
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// VoiceModelSpec defines the desired state of VoiceModel.
type VoiceModelSpec struct {
	// PodTemplateSpec describes the data a pod should have when created from a template
	// +optional
	PodTemplate *corev1.PodTemplateSpec `json:"podTemplate" protobuf:"bytes,1,opt,name=podTemplate"`
}

// VoiceModelStatus defines the observed state of VoiceModel.
type VoiceModelStatus struct {
	// +kubebuilder:validation:Optional
	Conditions []metav1.Condition `json:"conditions,omitempty"`
}

// +kubebuilder:object:root=true
// +kubebuilder:subresource:status

// VoiceModel is the Schema for the voicemodels API.
type VoiceModel struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   VoiceModelSpec   `json:"spec,omitempty"`
	Status VoiceModelStatus `json:"status,omitempty"`
}

// +kubebuilder:object:root=true

// VoiceModelList contains a list of VoiceModel.
type VoiceModelList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []VoiceModel `json:"items"`
}

func init() {
	SchemeBuilder.Register(&VoiceModel{}, &VoiceModelList{})
}
