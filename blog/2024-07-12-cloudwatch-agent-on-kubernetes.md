---
slug: cloudwatch-agent-on-kubernetes
title: "How AWS CloudWatch Agent on Kubernetes Blew Our AWS Bill"
last_modified_at: Friday, July 12, 2024 10:48:28 AM GMT+05:30
categories:
  - Blog
tags:
  - Cloud
  - AWS
  - CloudWatch
  - Kubernetes
---

When running a microservice-based architecture, traffic flows from the front-end, passes through multiple microservices, and eventually receives the final response from the back-end. Kubernetes is a container orchestrating service that helps us run and manage these numerous microservices, including multiple copies of them if necessary.

During the lifecycle of a request, if it fails at a specific microservice while moving from one service to another, pinpointing the exact point of failure becomes challenging. Observability is a paradigm that allows us to understand the system end-to-end. It provides insights into the “what,” “where,” and “why” of any event within the system, and how it may impact application performance.

There are various monitoring tools available for microservice setups in Kubernetes, both open-source (such as Prometheus and Grafana) and enterprise solutions (such as App Dynamics, DataDog, and AWS CloudWatch). Each tool may serve a specific purpose.

## Story Time — How we built our Kubernetes

In one of our projects, we decided to build a lower environment on an AWS Kubernetes cluster using Amazon Elastic Kubernetes Service (EKS) on Amazon Elastic Compute Cloud (EC2). We had around 80+ microservices running on EKS, which were built and deployed into the Kubernetes cluster using GitLab pipelines. During the initial development phase, we had poorly developed Docker images that consumed a significant amount of disk space and included unnecessary components. Additionally, we were not utilizing multi-stage builds, further increasing the image size. For monitoring purposes, we deployed the AWS CloudWatch agent, which utilizes Fluentd to aggregate logs from all the nodes and sends them to CloudWatch Logs.


## Setting up Container Insights on Amazon EKS and Kubernetes


### How to install and set up CloudWatch Container Insights on Amazon EKS or Kubernetes.

During a routine cost check, we made a startling discovery. The billing for AWS CloudWatch Logs (where the CloudWatch agent sends logs) in our setup was typically around 20–30 dollars per day, but it had spiked to 700–900 dollars per day. This had been going on for five days, resulting in a bill of 4500 dollars solely for the CloudWatch Logs and NAT gateway (used for sending logs to CloudWatch via public HTTPS). As an initial response, we stopped the CloudWatch agent daemon set and refreshed the entire EKS setup with new nodes.

### What went wrong

As a temporary fix, we halted the CloudWatch agent running as a daemon set in our cluster to prevent further billing. Upon investigation, we discovered that a large number of pods were in an evicted state. The new pods attempting to start (as Kubernetes tries to match the desired state specified in manifests/Helm charts) were also going into the evicted state. This led to a high volume of logs, which were then sent to CloudWatch Logs via the CloudWatch agent. Since log billing is based on ingestion and storage, it significantly contributed to our AWS bill. This eviction was caused by a condition called “**node disk pressure**.” The node disk pressure occurred due to the following reasons:

- The existing pod had generated a large number of logs, occupying significant disk space.
- When a new version of the app was deployed in the cluster, the new container (approximately 3 GB in size) could not start due to insufficient available space.
- After multiple attempts to start the pod, it went into an evicted state.
- As the current pod was evicted, the deployment controller deployed another pod to match the desired state specified in the deployment.
- These events generated more logs, further consuming available disk space.
- This cycle continued for five days, exacerbating the situation.

## How we resolved it

To address the problem, we implemented the following solutions:

- Once we identified the issue, we refreshed Kubernetes by replacing the existing nodes with a new set. This action cleared up all the disk space on the nodes, and since all our logs are stored in CloudWatch Logs, we resolved the log-related concerns.
- Additionally, we implemented multi-stage builds, which reduced the overall image size for deployment.
- Lastly, we set up CloudWatch alarms to trigger when the disk usage percentage exceeds a certain threshold.