# Deploying a Kubernetes Service on on NYU HSRN

## Overview
```
.kube
├── config          # Kubeconfig 
├── deployment.yaml # Deployment configuration, creates a pod called `bdiviz`
├── service.yaml    # Service configuration, exposes the `bdiviz` pod on port 3000
├── ingress.yaml    # Ingress configuration, routes traffic to the `bdiviz` service
```

## Getting Started

### 0. Prerequisites
Before you begin, make sure the kubeconfig file is in the `.kube` directory. You can download the kubeconfig file from the [NYU HSRN dashboard](https://config.hsrn.nyu.edu/).
```bash
kubectl config set-context --current --namespace bdiviz
```

### 1. Deploy the Service
To deploy the service, run the following commands:
```bash
kubectl apply -f .kube/deployment.yaml

kubectl apply -f .kube/service.yaml

kubectl apply -f .kube/ingress.yaml
```

### 2. Check the Status

To check the status of the deployment, run the following command:
```bash
kubectl get pods
```

To check the status of the service, run the following command:
```bash
kubectl get svc
```

To check the status of the ingress, run the following command:
```bash
kubectl get ingress
```

### 3. Access the Service

To access the service, navigate to the following URL:
```
http://bdiviz.users.hsrn.nyu.edu
```