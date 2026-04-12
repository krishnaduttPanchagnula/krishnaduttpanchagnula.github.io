---
slug: object-oriented-jenkins-pipeline
title: "Exploring an Object-Oriented Jenkins Pipeline for Terraform:A novel architecture design in Jenkin's multi-stage Terraform CD pipeline to improve CI/CD granularity"
last_modified_at: Friday, July 12, 2024 10:48:28 AM GMT+05:30
categories:
  - Blog
tags:
  - Python
  - Terraform
  - CI/CD
  - Github
  - Devops
  - Jenkins
  - AWS
  - Cloud
  - IAC
  - Infrastructure
  - OOP
---

Usually, when we perform `terraform plan`, `terraform destroy`, or `terraform apply`, we apply these actions to all the resources in our target files, often `main.tf` (you can use any name for the file, but this name is just used as a convention).

In the age of CI/CD, when we have everything as pipelines right from data, and application code to infrastructure code, it is usually difficult to this granularity. Usually, at least in Terraform, to achieve these three different actions, we have three different pipelines to perform `terraform plan`: `terraform apply` and `terraform destroy`. And when we select a certain action (let's say `terraform plan`), this action is performed on all the stages and on all resources within the pipeline.

But when we observe all these pipelines, there is a commonality that can be abstracted out to create a generality, on which the dynamic nature can be inherited. Just as we create a class, using different objects with different attribute values can be built, is it possible to create a similar base class (read pipelines) which when instantiated can create different pipeline objects?

> ###One Pipeline to create them all###

##The Modular Infrastructure


In order to build this class-based pipeline, we first need to create a terraform script. This script developed should be loosely coupled and should be modular in nature. For this, we have created this modular script, which has three modules named “Networking,” “Compute,” and “Notifications.” The components that each of these modules create is as follows:

1.  Networking: 1 VPC and 1 subnet
2.  Compute : 1 IAM role, 1 Lambda, 1 EC2 t2.micro instance
3.  Notifications: 1 SNS topic and 1 email subscription

And the file structure is as follows:

Once we have this ready, let’s create a groovy script in declarative style in a Jenkins file.

## Class-Based Jenkins Pipeline


To create this class-based architecture style to flexibly create pipeline objects at the action and resource level, we are going to utilize a feature called “parameters” in Jenkins. This feature helps us create multiple objects using a single base class Jenkins pipeline. In this example, let’s create three actions namely:

*   `terraform plan`: This creates and prints out a plan of the resources that we are going to create in the respective provider ( can be AWS, Kubernetes, GCP, Azure, etc.)
*   `terraform apply`: This command creates the resources in the respective provider and creates a state-file that saves the current state of resources in it.
*   `terraform destroy`: This removes all the resources that are listed within the state-file.

These actions are performed on three modules/resources namely “Networking,” “Compute,” and “Notifications.”

The above parameters create a UI for the end user, as shown below, which would help the end user to create objects of the base pipeline on the fly.

Based on the actions selected and the resources on which these actions have to be done, Jenkins will create a dynamic pipeline according to your requirement. In the picture below, we see that we have applied terraform for the networking and compute resources in #24, and run `terraform apply` on networking and notification in run #25. To clean the infrastructure, we ran `terraform destroy` on run #26.

The present approach implemented is more in line with Continuous delivery principles than continuous deployment.

For the Jenkins file and Terraform code, refer to this [link](https://github.com/krishnaduttPanchagnula/Multifunctional-terraform-Jenkins-pipeline).

```
**Want to Connect?**Feel free to reach out to my [LinkedIn](https://www.linkedin.com/in/krishnadutt/) for interesting content and productive discussions.
```