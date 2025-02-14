# `operator`

## Development

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

### Run it locally

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
kubectl describe voicemodels
```

## More

Read [CONTRIBUTING.md](CONTRIBUTING.md) for more information on how to develop, build and publish this operator.
