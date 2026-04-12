---
title: "Passing an file to Dockerized application from helm charts"
last_modified_at: Friday, July 12, 2024 10:48:28 AM GMT+05:30
categories:
  - Blog
tags:
  - Python
  - CI/CD
  - Docker
  - Dockerfile
  - Multi-stage
  - Kuberentes
  - Helm
  - Helm charts
---

Often when we build enterprise software solutions meant for independent deployment across different customer environments, we leverage a central image repository. This repository is exposed to the enterprise, who then installs it in their environment. These applications may require variables or files specific to the client’s environment, which need to be injected into the image for it to run. As it’s impractical to have a separate image for each customer, we use a single image that is customized and injected with required files or variables during deployment.

This blog explores how to create a standardized image, inject necessary variables in the form of a file, and deploy it on a Kubernetes cluster.For this we will create a python app , dockerize it, build it and push it to a repository. Once pushed we will be creating standard k8 manifests and Helm charts where we will be injecting our file/variables into it.

## Application and Image Creation

Let’s create a simple Python program which retrieves the variables “DB_HOST” and “DB_PASSWORD”, then uses them to print both of these variables to the console.

```python
import os  
from dotenv import load_dotenv  
  
# Load environment variables from .env file  
load_dotenv()  
  
db_host = os.getenv("DB_HOST")  
db_password = os.getenv("DB_PASSWORD")  
  
pyprint(db_host)  
print(db_password)
```

Next, we’ll create a Docker image which packages our application using _python:3.9-slim_ and adds all the required packages to the image. The entry point for the image is the above Python file named [main.py](http://main.py/). Once completed, we’ll push our image to an image repository such as ECR or Docker Hub.

```dockerfile
# Use an official Python runtime as the base image  
FROM python:3.9-slim  
  
# Set the working directory in the container  
WORKDIR /app  
  
# Copy the current directory contents into the container at /app  
COPY . /app  
  
# Install any needed dependencies  
RUN pip install --no-cache-dir python-dotenv  
  
# Run the Python script when the container launches  
CMD \["python", "main.py"\]
```

## Creating Deployment Files

Once we have the image ready in our preferred image repository, we need to deploy these images on a server. Nowadays, most deployments have moved to Kubernetes, so we’ll use it as our deployment platform. Deployment in Kubernetes can be achieved by creating Kubernetes manifests directly or creating HELM charts (or Kustomize), which act like package managers to deploy applications. Let’s explore both options:

### Creating standard manifest files

Below, we’re creating a deployment of one replica, a service of type NodePort to expose the application, and a secret object that takes the content of our .env file and injects it into the pod when we deploy the application.

```yaml
apiVersion: apps/v1  
kind: Deployment  
metadata:  
  name: python-app  
spec:  
  replicas: 1  
  selector:  
    matchLabels:  
      app: python-app  
  template:  
    metadata:  
      labels:  
        app: python-app  
    spec:  
      containers:  
      - name: your-container-name  
        image: your-image-name:your-image-tag  
        ports:  
        - containerPort: 80  
        volumeMounts:  
        - name: env-volume  
          mountPath: /app/.env  
          subPath: .env  
      volumes:  
      - name: env-volume  
        secret:  
          secretName: python-app-env-secret  
---  
  
apiVersion: v1  
kind: Service  
metadata:  
  name: python-app-service  
spec:  
  selector:  
    app: python-app  
  ports:  
    - protocol: TCP  
      port: 80  
      targetPort: 80  
      nodePort: 30001  
  type: NodePort  
  
---  
  
apiVersion: v1  
kind: Secret  
metadata:  
  name: python-app-env-secret  
type: Opaque  
data:  
  .env: |  
    DB_HOST=test  
    DB_PASSWORD=password
```

### Creating HELM chart

To create a helm chart, simply run

```bash
helm create <app-name>
```

For our project here, we’ll run `helm create python-app`. This should create a python-app folder, which contains the standard HELM template that can be modified according to our requirements. The generated folder should have the following folder/file structure:

```bash
my-chart/  
  ├── charts/  
  ├── templates/  
  │   ├── deployment.yaml  
  │   ├── hpa.yaml  
  │   ├── ingress.yaml  
  │   ├── NOTES.txt  
  │   ├── service.yaml  
  │   └── serviceaccount.yaml  
  │   ├── hpa.yaml  
  │   ├── _helpers.tpl  
  ├── values.yaml  
  └── Chart.yaml
```

We need to create a configmap.yaml file in the templates folder and add the following content to it:

```yaml
# templates/configmap.yaml  
apiVersion: v1  
kind: ConfigMap  
metadata:  
  name: {{ .Release.Name }}-configmap  
data:  
  .env: |  
    DB_HOST={{ .Values.env.DB_HOST }}  
    DB_PASSWORD={{ .Values.env.DB_PASSWORD }}
```

The deployments.yaml should look something like this:

```yaml
# templates/deployment.yaml  
apiVersion: apps/v1  
kind: Deployment  
metadata:  
  name: {{ include "python-app.name" . }}  
  labels:  
    app: {{ include "python-app.name" . }}  
spec:  
  replicas: {{ .Values.replicaCount }}  
  selector:  
    matchLabels:  
      app: {{ include "python-app.name" . }}  
  template:  
    metadata:  
      labels:  
        app: {{ include "python-app.name" . }}  
    spec:  
      containers:  
      - name: {{ .Chart.Name }}  
        image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"  
        ports:  
        - containerPort: 80  
        volumeMounts:  
        - name: cm-volume  
          mountPath: /app/.env  
          subPath: .env  
      volumes:  
      - name: cm-volume  
        configMap:  
          name: {{ include "python-app.name" . }}
```

The service.yaml:

```yaml
# templates/service.yaml  
apiVersion: v1  
kind: Service  
metadata:  
  name: {{ include "python-app.name" . }}  
spec:  
  selector:  
    app: {{ include "python-app.name" . }}  
  ports:  
    - protocol: TCP  
      port: 80  
      targetPort: 80  
      nodePort: 30001  
  type: NodePort
```

The _helpers.tpl should have the following content:

```go
# templates/_helpers.tpl.yaml  
{{- define "python-app.fullname" -}}  
{{- printf "%s-%s" .Release.Name .Chart.Name }}  
{{- end }}{{- define "python-app.name" -}}  
{{- printf "%s" .Chart.Name }}  
{{- end }}
```

In values.yaml, pass your secrets and image repository and tag:

```yaml
# values.yaml  
image:  
  repository: krishnadutt/my-python-app  
  tag: latest  
replicaCount: 1  
env:  
  DB_HOST: test  
  DB_PASSWORD: your_database_password
```

For this project, delete the rest of the files in the templates folder. Once done, apply all the manifest files or simply add the helm repository and install it in your k8s.

Once deployed, if we execute into the image in Kubernetes, we should see the file and if we search the logs, we should find that .env values are used and those values are printed out by the program.

Liked my content ? Feel free to reach out to my [LinkedIn](https://www.linkedin.com/in/krishnadutt/) for interesting content and productive discussions.