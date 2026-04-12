---
slug: tfblueprintgen-a-tool-to-simplify-terraform
title: "Tfblueprintgen: A Tool to Simplify Terraform Folder Setup and Provide Base Resource Modules"
last_modified_at: Friday, July 12, 2024 10:48:28 AM GMT+05:30
categories:
 - Blog
tags:
 - Golang
 - Go
 - IAC
 - CLI
 - AWS
 - Cloud
 - Terraform
 - Automation
 - Best Practices
---

Whether it’s a React front-end app, a Go CLI tool, or a UI design project, there is always initial toil to figure out the optimal folder structure. As this initial decision influences a lot of flexibility, extensibility, self-explanation, and easy maintenance in our projects, it is key decision to ensure a smooth developer experience.

When working with a new tool/technology/framework, our journey typically starts with reading official “getting started” handbook from their official website or even reading some articles on the same topic. We use these resources and start getting our hands dirty with hands-on experience, often using its structure as a foundation for more complex real-world projects. But these articles or tutorials are often serve us good in initial phases of the project, when the complexity is low. When we are solving complex problem involving multiple actors, the legibility and maintainability takes precedence. It becomes a daunting task to later refactor or sometimes rewrite everything from the scratch. To reduce this hassle and tackle this issue head on, I’ve distilled my Terraform experience into a CLI tool. This tool generates a battle-tested folder structure along with basic modules, allowing us to quickly hit the ground running.

## Structuring Terraform Folders

Most companies and their ops teams find it cumbersome to manage multiple environments across multiple regions for their applications. We can structure our terraform folders as follows:

- Folder structure organized by Region
- Folder structure by Resources ( like AWS EC2, or Azure Functions etc)
- Folder structure on use case ( like front-end app, networking etc)
- Folder structure organized by Account
- Folder structure organized by environment and
- A Hybrid of all the above

Given the above options it quite becomes confusing to the teams starting with terraform to decide how to structure their projects. Based on my experience here are my 2 cents on how to structure a terraform project:

- Create a modular style code with each module containing all the resources required to create for each use-case. These modules would serve as base blueprints which can be utilized across different environments.
- For ex: In case of AWS, The front-end module should consist of Cloud-front, S3 bucket, cloud-front origin access control, s3 policy bucket policy and s3 bucket public access block.
- Create a folder structure for each of the environments that you are deploying. This statement would be true, if the architecture across all the environments doesn’t change and their deployment strategies does not change.

## Tfblueprintgen: A Terraform tool to generate folder structure and base blueprints


Based on the above postulates, i have created a CLI tool called Tfblueprintgen, which generates the folder structure along with the modular working blocks to create AWS building blocks. In terms of folder structure, the structure will look something like below.

Image 1 : Generated Terraform folder structure with base modules

To run the tool download the both windows and Linux binaries from [here](https://github.com/krishnaduttPanchagnula/Tfblueprintgen/releases/download/0.1/tfblueprintgen.exe?ref=hackernoon.com) or you can build your own binary from [here](https://github.com/krishnaduttPanchagnula/Tfblueprintgen/archive/refs/tags/0.1.zip?ref=hackernoon.com). Use the the binary ( if in Windows double-click to run Tfblueprintgen.exe or if it is Linux run the binary using ./Tfblueprintgen)

Image 2 : Running the tfblueprintgen tool

As described in the image 1, the tool generates two things:

- A Parent folder which contains all the main terraform files ( [outputs.tf](http://outputs.tf/?ref=hackernoon.com), variables[.tf](http://providers.tf/?ref=hackernoon.com) and [main.tf](http://main.tf/?ref=hackernoon.com) )for each environment separated in their own folders.
- A Module folder which contains all the different basic resources, segregated in their own separate folders.

These modules can be leveraged within each of the environment folders, by calling those modules using module block and these can be applied using “terraform apply”

With this setup, you can hit the ground up and running in no time. Feel free to add more ideas as issues and Stay tuned to project.

Liked my content ? Feel free to reach out to my [LinkedIn](https://www.linkedin.com/in/krishnadutt/) for interesting content and productive discussions.