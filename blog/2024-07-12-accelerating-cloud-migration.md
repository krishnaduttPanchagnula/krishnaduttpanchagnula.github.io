---
slug: accelerating-cloud-migration
title: "Accelerating cloud migration from console to IAC tools using “Terraform Import”"
---

# Accelerating cloud migration from console to IAC tools using “Terraform Import”

With the advantages such as reduced upfront cost, little to no maintenance costs, organizations both large and small are moving to cloud, for their storage, compute and sometimes their complete end-to end business operations.

hese different stages are based upon the Cloud maturity of the organization, which is divided into 5 progressive cloud maturity stages ( Although stage 4 is quite new). To simplify,

**Stage 0** — When all the data storage, web/data hosting and operations are done entirely done in the legacy/local systems

**Stage 1** — When the company has all the data storage, web/data hosting, and most of the operations are in legacy and only a few costly operations are moved to the cloud.

**Stage 2** — When the company chooses to migrate certain part, which might be operations or storage or compute needs to the cloud and the rest are provided from legacy back-end systems.

**Stage 3** — When the company has completed its migration and have its entire business in the cloud

**Stage 4** — When the company has created multi-cloud deployment either in active-active or active-passive implementation mode.

## What is Infrastructure as Code(IAC)

When the company is in the initial stages of cloud, like stage 1 and stage 2, the development of cloud infrastructure can be done entirely from console. But as our infrastructure scales, in stage 3 and stage 4, we can no longer do it from the console, as the infrastructure we have to manage, maintain and update is in a very large scale. Creating and maintaining it at that large scale is quite difficult. To reduce this problem, we have “Infrastructure as Code (IAC) “ tools such as Terraform, Ansible etc. (The Terraform is better suited for infrastructure provisioning while the Ansible is better suited for Configuring provisioned infrastructure / Configuration Management).

The Infrastructure as Code is a concept in which the process of provisioning, maintaining, and managing infrastructure(networks, virtual machines, load balancers, and connection topology), is done through machine-readable definition files (usually written in YAML or JSON), rather than physical hardware configuration or interactive configuration tools.

Implementing IAC tools within the existing development environment sometimes can be daunting as their resources and knowledge to implement, would be, at the moment quite scarce. To overcome this problem, we are going to talk about a certain method, which would ease your Terraforming journey. The tool is a command within the terraform environment called `terraform import`. In this post, for the sake of demonstration, we are will be using AWS ( as it takes the largest share among cloud providers).

## What is Terraform import and how it can help us?


Before we explore the implementation, let's try to understand what this command is and what it does.

Terraform import is one of the commands within the terraform environment, which would help us import the configuration settings, preferred storage selections, security configuration of our already created resources into the terraform state file(The terraform state file is like a treasurer of the terraform environment, who keeps track of what resources are up and running and what are destroyed)

Importing the state file helps us understand:

1. How our preferences in the console can be translated to the commands within the terraform syntax
2. To understand which roles or policies a resource needs for its successful working.
3. How can I create multiple resources, given that we are able to leverage the existing roles and policies, within the cloud environment?

To understand this better, Lets implement an example in AWS environment.

## Terraform import implementation in AWS

For the example, let us create an EC2 with t2.micro instance :

## EC2 instance:

Lets first create a EC2 in the console and later use terraform import to import resource state into terraform state-file.

**Launching EC2 from console:**

1. First log into terraform console and type EC2 in the search bar
2. Create EC2 instance with t2.micro and Ubuntu image.
3  After couple of minutes the EC2 is created along with its IAM role, and EC2 status is changed into running.
4. Now, in-order to import , lets open our favorite IDE (which in my case is VS code).

5. Before we can use terraform in AWS , we need to configure AWS CLI and terraform CLI (Please refer this link, to do it : [https://alexander.holbreich.org/2019-terraforming-aws/](https://alexander.holbreich.org/2019-terraforming-aws/))

6. Once AWS and terraform are configured, create a empty resource as shown below in VS Code.

7. Initialize the terraform within the directory, within the directory using **terraform init**

8. Then type **terraform import aws\_instance.test i-0cc2507156b9510c1**( The general form is “terraform import aws\_instance.<name of the resource in terraform file> <ID of EC2 in AWS>”) and press enter. You will get the following message, once the resource has been imported.

9\. You can view your resources in your local terraform statefile using terraform state show aws\_instance.web ( form is “terraform import aws\_instance.<name of the resource in terraform file> <ID of EC2 in AWS>)

**Hope this tip accelerates your AWS journey and help you build amazing infrastructure. Happy Building !**

If you would like to connect with me, you can follow my [blog here](https://medium.com/@krishnaduttpanchagnula) or on [linked-in](https://www.linkedin.com/in/krishnadutt/) or on [Git-hub](https://github.com/krishnaduttPanchagnula).