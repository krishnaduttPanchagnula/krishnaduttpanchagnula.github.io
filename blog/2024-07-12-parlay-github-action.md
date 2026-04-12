---
slug: parlay-github-action
title: "DevOps Wizardry: Crafting Your Parlay GitHub Action  - Improve your Development Process with Personalized Custom Automation"
last_modified_at: Friday, July 12, 2024 10:48:28 AM GMT+05:30
categories:
  - Blog
tags:
  - Python
  - Diagrams as Code
  - CI/CD
  - Github
  - Devops
  - Security
  - AWS
  - Cloud
  - IAC
  - Infrastructure
---

# DevOps Wizardry: Crafting Your Parlay GitHub Action  - Improve your Development Process with Personalized Custom Automation


Recently while trying to integrate a devsecops tool in my pipeline, i was trying to find the GitHub action which would simplify my workflow. Since i could not find it, i have to write the commands inline to run the command. Although it is not a hassle to write it within the script, it would be beneficial to have an action which we could directly call, pass parameters and run the action within the pipeline.

In this blog, i will walk you through different steps on how you can create a custom GitHub actions which would satisfy your requirement. The blog will be of 2 parts:

*   Understanding what the GitHub action are
*   Creating your custom GitHub actions

## GitHub actions:


Often when we write pipelines, we would have a set of actions which we would like to perform based on the type of application that we are developing. In order for us to run these actions across the repos in our organization, we would have to copy + paste this code across the repositories, which would make this process error prone and maintenance tussle. It would be better if we take DRY principle of software engineering and apply it to CI/CD world.

GitHub action is exactly this principle in practice. We create and host the required action in a certain GitHub public repository and this action is used across the pipeline to perform the action defined in the action. Now that we understand what GitHub action is, lets explore how we can build a custom GitHub action which can help automate set of actions. For this blog, i illustrate it with an example of SBOM enrichment tool Parlay, for which i have built a custom action.

## Creating Custom Action — A case on Parlay

We will be creating our custom action in the following steps:

*   Defining inputs and outputs in action.yml
*   Developing business logic in bash script
*   Dockerize the bash application
*   Test the action
*   Publish it in GitHub action Marketplace

Defining inputs and outputs in action.yml


To start creating custom action create a custom git repository, clone that repo in your local system and open it up in your favourite code editor. We start by creation a file named actions.yml. This actions.yml defines the inputs that the action would take, the outputs that it would give and the environment it will run. For our use case we have 3 inputs and 1 output. The actions.yml should have following arguments:

*   **name**: This would be the name of the action, which would be used to search in GitHub action marketplace. Since it would be published in marketplace, it’s name should be globally unique like s3 bucket.
*   **description**: This describes what your action would do. This would be helpful to identify which action would be the right fit for our use case.
*   **inputs**: Defines the list of options which would be used within the action. These can be compulsory or optional, which can be defined using “required” argument. In our current use case we are passing 3 arguments, input_file_name, enricher and output_file_name.
*   **outputs**: This enlists the list of outputs that the action gives.
*   **runs**: defines the environment in which action will execute , which in our case is docker

The action.yml will look something like this:

```yaml
\# action.yaml  
name: "Parlay Github Action"  
description: "Runs Parlay on the given input file using the given enricher and outputs it in your given output file"  
branding:  
  icon: "shield"  
  color: "gray-dark"  
inputs:  
  input_file_name:  
    description: "Name of the input SBOM file to enrich"  
    required: true  
  enricher:  
    description: "The enricher used to enrich the parlay sbom. Currently parlay supports ecosystems, snyk, scorecard(openssf scorecard)"  
    required: true  
    default: ecosystems  
  output_file_name:  
    description: "Name of the output file to save the SBOM enriched using the parlay's enricher"  
    required: true  
outputs:  
  output_file_name:  
    description: "Prints the output file"  
runs:  
  using: "docker"  
  image: "Dockerfile"  
  args:  
    - ${{ inputs.input_file_name }}  
    - ${{ inputs.enricher }}  
    - ${{ inputs.output_file_name }}
```

## Developing business logic in bash script


Once we have defined the inputs, outputs and environment that we are going to use, we would like to define what we are going to do with those inputs ( basically our logic) in a file. We can either define this in JavaScript or bash. For my current use case, i am using bash.

In my current logic, i am going to check if all the inputs are first given, if not the action fails. Once i have these 3 arguments, i am going to construct the command to run the action and save the output in an output file. This file is printed in stdout and formatted using jq utility.

```bash
#!/bin/bash  
\# Check if all three arguments are provided  
if [ "$#" -ne 3 ]; then  
    echo "Usage: $0 <input> <input_file_name> <output_file_name>"  
    exit 1  
fi  
\# Extract arguments  
INPUT_INPUT_FILE_NAME=$1  
INPUT_ENRICHER=$2  
INPUT_OUTPUT_FILE_NAME=$3  
\# Construct command  
full_command="parlay $INPUT_ENRICHER enrich $INPUT_INPUT_FILE_NAME > $INPUT_OUTPUT_FILE_NAME"  
eval "$full_command"  
\# Check if the command was successful  
if [ $? -eq 0 ]; then  
    echo "Command executed successfully: $full_command"  
    cat $INPUT_OUTPUT_FILE_NAME | jq .  
else  
    echo "Error executing command: $full_command"  
fi
```

## Dockerize the bash application
Once we have the bash script ready, we will be dockerizing it using the following script. Whenever we invoke the action, this action which is defined in the bash script runs in an isolated docker container. In addition to the bash script in entrypoint.sh, we would also be adding the the required libraries such as wget, jq and installing parlay binary.

```dockerfile
\# Base image  
FROM --platform=linux/amd64 alpine:latest  
\# installes required packages for our script  
RUN apk add --no-cache bash wget jq  
\# Install parlay  
RUN wget <https://github.com/snyk/parlay/releases/download/v0.1.4/parlay_Linux_x86_64.tar.gz>   
RUN tar -xvf parlay_Linux_x86_64.tar.gz   
RUN mv parlay /usr/bin/parlay  
RUN ls /usr/bin | grep parlay  
RUN parlay  
\# Copies your code file  repository to the filesystem  
COPY . .  
\# change permission to execute the script and  
RUN chmod +x /entrypoint.sh  
\# file to execute when the docker container starts up  
ENTRYPOINT ["/entrypoint.sh"]
```

## Test the action


No amount of software is good without running some tests on it. To test the action, lets first push the code to GitHub. Once pushed, lets define the pipeline in pipeline.yaml file in .github/workflows folder. For the sake of input file, i am using a sample sbom [file](https://github.com/krishnaduttPanchagnula/parlayaction/blob/main/cyclonedx.json) in cyclonedx format and have pushed it to GitHub. In my pipeline.yaml file, i am cloning the GitHub repo and using my action called krishnaduttPanchagnula/parlayaction@main on cyclonedx.json.

```yaml
on: [push]  
jobs:  
  custom_test:  
    runs-on: ubuntu-latest  
    name: We test it locally with act  
    steps:  
      - name: Checkout git branch  
        uses: actions/checkout@v1  
          
      - name: Run Parlay locally and get result  
        uses: krishnaduttPanchagnula/parlayaction@main  
        id: parlay  
        with:  
          input_file_name: ./cyclonedx.json  
          enricher: ecosystems  
          output_file_name: enriched_cyclonedx.json
```

Once the pipeline runs, this should give output in the std-out in pipeline console as follows.

Parlay Github action Output

Publish it in GitHub action Marketplace


Once we have tested the action and that is running fine, we are going to publish it GitHub actions market place. TO do so, our custom app should have globally unique name. To make it more unique we can add icon with our custom [symbol and colour](https://docs.github.com/en/actions/creating-actions/metadata-syntax-for-github-actions#branding) to uniquely identify the action in marketplace.

Once that is done you would see the button, “Draft a Release”. Ensure that your action.yml file has Name, description, Icon and color.

Once you have tick marks, you would be guided to release page where you can mention the title and version of the release. After that, click on “publish release” and you should be able to see your action in GitHub Actions marketplace.

Liked my content ? Feel free to reach out to my [LinkedIn](https://www.linkedin.com/in/krishnadutt/) for interesting content and productive discussions.