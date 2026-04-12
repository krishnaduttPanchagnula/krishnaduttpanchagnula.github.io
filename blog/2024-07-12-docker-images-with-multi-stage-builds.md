---
slug: docker-images-with-multi-stage-builds
title: "Optimizing Golang Docker images with multi-stage build"
last_modified_at: Friday, July 12, 2024 10:48:28 AM GMT+05:30
categories:
  - Blog
tags:
  - Go
  - Golang
  - CI/CD
  - Docker
  - Dockerfile
  - Multi-stage
  - Kuberentes
---

With the increasing scale of development required to build an product, a large number of developers are required to develop, share and maintain the code. And as each of the developer’s environment are different from one another, it becomes quite a hassle to create similar environments with similar library versions. To solve this issue we use Docker, which creates similar environment experience for all the developers. When using docker, often we face problem of creating a large docker images sometimes racking up to some GBs of space. This idea very much defeats the idea that Docker has evolved beyond the classic VMs — “To create light weight and resource-light images that the developers can work easily ”

To solve this problem of docker image bloating, we have several solutions such as using dockerignore to not add unnecessary files, using distroless/minimal base images or Minimizing the number of layers. But when we are building an application, we would different tools which would rule out the possibility of using distroless images. And when building we would be dealing with several steps so there is so much availability to reduce the layers within the dockerfile.

The tools that we use to build the application are often not used when running application. So what if we can somehow separate/remove these build tools and have only the tools which will run the application? Enter the _Multi-stage_ builds in docker.

## Docker : Multi-Stage Builds

Multi-stage builds is an implementation of Builder Pattern in a Dockerfile which helps in minimizing the size of the final container, improving run time performance, allowing for better organization of Docker commands. A multi-stage build is done by breaking the single-stage dockerfile into different sections (You can think them as different jobs like build, stage etc) within the same dockerfile, thereby creating separation of environments. As each of this step would use base image that is only useful to that step while passing its outputs to next step, we can keep the docker image lean. This can also be done using different dockerfiles in a CI (Continuous Integration pipeline), by passing the output of one stage to another. But the Multi-stage feature from docker remove the need to create all these steps with our pipeline and helps keep it clean.

## Creating the Multi-Stage Docker file

For explaining this, we will be building and running a Movie application written in Golang, which performs basic crud operations. The code for the app can be found [here](https://github.com/krishnaduttPanchagnula/Golang_projects/tree/main/CRUD_api_GO).

As we know in Go, in order for the app to run we need to compile it. On compilation it will create a executable ( pertaining to that OS) and only this executable is required to run the application. To illustrate the power of multi-stage build let’s first build it as a single stage Docker file.

Once we run docker build on the above file, we get the following executable which is around 350 MB.

Now lets separate build stage and execution stage into two different environments. For build-stage environment, lets use the Golang image based on alpine which comes loaded with all the tools required to run, test, build and validate the Golang. We build our application using the tools using this environment tools. Once this is done we pass the executable to environment which is execution/production environment which will run the executable.

Since the executable is created, we would not require much of the previous environment tools and can work with a base alpine image. Once we run docker build on this file, we observe that size of the file is around 13 MB ( named **crud\_multistage** in the below picture) compared to 350 MB (named **crud** in the below picture) from single-stage Dockerfile. This multi-stage build offered around 95% reduction in total sie of the docker image

Since this image is very small, it easier for portability and can be easily to deploy in production. Although the multi-stage build sounds like a fantastic idea, there are certain scenarios when this should be used and certain scenarios when this should be avoided.

**When not to use Multi-stage build:**

- When the language you are writing completely packages requirements into a single file ( like in case of GO etc) or at-least as a group of file ( in case of JavaScript etc).
- If you are not planning to run docker exec commands on final artifact to explore the application code.
- If you don’t require the tools and files used in build stage, further down the line to debug the final artifact.

**When to use Multi-stage build:**

- When you want to minimize the total size of the final Docker image that you deploy into production.
- When you want to speed up your CI/CD processes by running steps/stages in the Docker file in parallel.
- When different layers in Your Docker file are straight-forward and standardized.
- When you are fine with loosing the build intermediaries and only want the final docker artifact.