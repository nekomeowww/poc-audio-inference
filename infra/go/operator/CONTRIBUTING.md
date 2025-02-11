# Contributing Guide

### Prerequisites

- `go` version `v1.23.0+`
- `docker` version `17.03+`.
- `kubectl` version `v1.11.3+`.
- Access to a Kubernetes `v1.11.3+` cluster (Either kind, minikube is suitable for local development).

## Development

```shell
cd infra/go/operator
```

### Develop with `kind`

We have pre-defined `kind` configurations in the `hack` directory to help you get started with the development environment.

> [!NOTE]
> Install kind if you haven't already. You can install it using the following command:
>
> ```shell
> go install sigs.k8s.io/kind@latest
> ```

To create a `kind` cluster with the configurations defined in `hack/kind-config.yaml`, run the following command:

```sh
kind create cluster --config hack/kind-config.yaml --name kind-streaming-backend
```

### Prepare it with GPU resources

#### Label all nodes

```shell
kubectl label node <node-name> run.ai/simulated-gpu-node-pool=default
```

For kind cluster:

```shell
kubectl label node kind-worker run.ai/simulated-gpu-node-pool=default
kubectl label node kind-worker2 run.ai/simulated-gpu-node-pool=default
kubectl label node kind-worker3 run.ai/simulated-gpu-node-pool=default
```

#### Install `fake-gpu-operator` for device plugin

```shell
helm repo add fake-gpu-operator https://fake-gpu-operator.storage.googleapis.com
helm repo update
helm upgrade -i gpu-operator fake-gpu-operator/fake-gpu-operator --namespace gpu-operator --create-namespace
```

### Test controller locally

#### Build essential workload images

```shell
docker buildx build --platform linux/arm64 --load . -f ./apps/streaming-web/Dockerfile -t test.sizigi.local/streaming-audio/web:0.0.1
docker buildx build --platform linux/arm64 --load . -f ./services/streaming-backend/Dockerfile -t test.sizigi.local/streaming-audio/backend:0.0.1
docker buildx build --platform linux/arm64 --load . -f ./services/inference-server/Dockerfile -t test.sizigi.local/streaming-audio/inference-server:0.0.1
```

> [!NOTE]
>
> For x86_64 (amd64)
>
> ```
> docker buildx build --platform linux/arm64 --load . -f ./apps/streaming-web/Dockerfile -t test.sizigi.local/streaming-audio/web:0.0.1
> docker buildx build --platform linux/arm64 --load . -f ./services/streaming-backend/Dockerfile -t test.sizigi.local/streaming-audio/backend:0.0.1
> docker buildx build --platform linux/arm64 --load . -f ./services/inference-server/Dockerfile -t test.sizigi.local/streaming-audio/inference-server:0.0.1
> ```

> [!NOTE]
>
> To test the deployment of the images
>
> ```shell
> docker run -dit -p 8080:80 test.sizigi.local/streaming-audio/web:0.0.1
> docker run -dit -p 8081:8081 test.sizigi.local/streaming-audio/backend:0.0.1
> docker run -dit -p 8082:8082 test.sizigi.local/streaming-audio/inference-server:0.0.1
> ```

#### Load the images into kind cluster

```shell
kind load docker-image test.sizigi.local/streaming-audio/web:0.0.1 --name kind-streaming-backend
kind load docker-image test.sizigi.local/streaming-audio/backend:0.0.1 --name kind-streaming-backend
kind load docker-image test.sizigi.local/streaming-audio/inference-server:0.0.1 --name kind-streaming-backend
```

#### Build and install CRD to local cluster

```shell
make manifests && make install
```

#### Run the controller locally

```shell
make run
```

#### Create a CRD to test the controller

```shell
kubectl apply -f hack/voice-model-test-kind-cluster.yaml
```

#### Verify the resources is reconciling

```shell
kubectl describe models
```

## Deployment

### To Deploy on the cluster

**Build and push your image to the location specified by `IMG`:**

```sh
make docker-build docker-push IMG=<some-registry>/streaming-backend-operator:tag
```

> [!NOTE]
> This image ought to be published in the personal registry you specified.
> And it is required to have access to pull the image from the working environment.
> Make sure you have the proper permission to the registry if the above commands don’t work.

**Install the CRDs into the cluster:**

```sh
make install
```

**Deploy the Manager to the cluster with the image specified by `IMG`:**

```sh
make deploy IMG=<some-registry>/streaming-backend-operator:tag
```

> [!NOTE]
> If you encounter RBAC errors, you may need to grant yourself cluster-admin
> privileges or be logged in as admin.

**Create instances of your solution**
You can apply the samples (examples) from the config/sample:

```sh
kubectl apply -k config/samples/
```

> [!NOTE]
> Ensure that the samples has default values to test it out.

### To Uninstall

**Delete the instances (CRs) from the cluster:**

```sh
kubectl delete -k config/samples/
```

**Delete the APIs(CRDs) from the cluster:**

```sh
make uninstall
```

**UnDeploy the controller from the cluster:**

```sh
make undeploy
```

> [!NOTE]
> Run `make help` for more information on all potential `make` targets

## Project Distribution

### Test your build locally

Developers should test their builds locally before pushing the changes to the repository.

#### Test the build of `streaming-backend-operator` locally

To build the image for `streaming-backend-operator` locally, run the following command:

```shell
docker buildx build --platform linux/amd64,linux/arm64 .
```

### Build and distribute the project

Following are the steps to build the installer and distribute this project to users.

1. Build the installer for the image built and published in the registry:

```sh
make build-installer IMG=<some-registry>/streaming-backend-operator:tag
```

NOTE: The makefile target mentioned above generates an 'install.yaml'
file in the dist directory. This file contains all the resources built
with Kustomize, which are necessary to install this project without
its dependencies.

2. Using the installer

Users can just run `kubectl apply -f <URL for YAML BUNDLE>` to install the project, i.e.:

```sh
kubectl apply -f https://raw.githubusercontent.com/sizigi/streaming-audio-backend/main/infra/go/operator/dist/install.yaml
```

> [!NOTE]
>
> The makefile target mentioned above generates an 'install.yaml'
> file in the dist directory. This file contains all the resources built
> with Kustomize, which are necessary to install this project without its
> dependencies.

### By providing a Helm Chart

1. Build the chart using the optional helm plugin

```sh
kubebuilder edit --plugins=helm/v1-alpha
```

2. See that a chart was generated under 'dist/chart', and users
   can obtain this solution from there.

> [!NOTE]
>
> If you change the project, you need to update the Helm Chart
> using the same command above to sync the latest changes. Furthermore,
> if you create webhooks, you need to use the above command with
> the '--force' flag and manually ensure that any custom configuration
> previously added to 'dist/chart/values.yaml' or 'dist/chart/manager/manager.yaml'
> is manually re-applied afterwards.
