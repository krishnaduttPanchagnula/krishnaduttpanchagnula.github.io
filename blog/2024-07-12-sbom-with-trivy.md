---
slug: sbom-with-trivy
title: "Vulnerability Identification of Images and Files using SBOM with Trivy"
last_modified_at: Friday, July 12, 2024 10:48:28 AM GMT+05:30
categories:
 - Blog
tags:
 - Docker
 - SBOM
 - Aquasecurity
 - CLI
 - Trivy
 - Kubernetes
 - Devsecops
 - Security
 - Best Practices
---


As we embrace digital progress and shift to using containers for our applications, we’re dealing with a variety of core images that form the basis of our apps. These images vary based on our app’s needs, given the different ways we build them. Unfortunately, in companies with a moderate level of DEVOPS experience (maturity levels 2 to 3), the focus often leans heavily towards getting new features out quickly, sometimes overlooking security.

For us developers, the challenge is keeping up with the ever-changing world of software. This includes the extra pieces they need (dependencies), the building blocks (components), and the tools (libraries) that make them work together across our whole system. All these parts combined are what we call the Software Bill of Materials (SBOM). To tackle this, we need to understand the SBOM of each image before we use it as a foundation for our apps. But doing this manually is complex and time-consuming. Plus, every time we want to update to a newer image version, we have to go through the whole process again, slowing down our ability to deliver our products.

The solution? Automation. By using automation, we can navigate the intricate process of understanding the SBOM. It helps us make organized lists of all the parts, find any known problems, and suggest ways to fix them — all done with tools like Trivy. Before we dive into the detailed steps, let’s make sure we’re all on the same page about what the SBOM really means.

## What is SBoM?

SBOM stands for Software Bill of Materials. Think of it like a detailed list of all the parts that make up our software. This list includes things like tools from other people, building blocks, and even the rules that guide how they’re used, all with exact version details.

SBOM is important because it gives us a big picture of all the different parts that come together to create a specific software. This helps our DevSecOps teams find out if there are any possible risks, understand how they could affect us, and take steps to fix them. All of this makes our software strong and secure.

## Why create SBOM?

1. Finding and Managing Outside Parts: SBOM helps us see all the software we use from others. It shows us different versions and even points out any possible security issues. With this info, we can make smart choices about what we use, especially when it comes to libraries and tools from other sources.
2. Making Our Supply Chain Secure: SBOM acts like a detailed map for our software. This map helps us make sure everything is safe and guards against any tricks or attacks on our software supply chain. We can even use SBOM to check if the people we get our software from follow good security rules.

## SBOM format

- [Software Package Data Exchange (SPDX)](https://spdx.github.io/spdx-spec/): This open standard serves as a software bill of materials (SBOM), identifying and cataloging components, licenses, copyrights, security references, and other metadata related to software. While its primary purpose is to enhance license compliance, it also contributes to software supply-chain transparency and security improvement.
- [Software Identification Tags (SWID)](https://www.iso.org/standard/65666.html): These tags contain descriptive details about a specific software release, including its product and version. They also specify the organizations and individuals involved in producing and distributing the product. These tags establish a product’s lifecycle, from installation on an endpoint to deletion.
- [CycloneDX (CDX)](https://cyclonedx.org/docs/1.2/): The CycloneDX project establishes standards in XML, JSON, and protocol buffers. It offers an array of official and community-supported tools that either generate or work with this standard. While similar to SPDX, CycloneDX is a more lightweight alternative.

In addition to creating SBOM, trivy has the capability to SCAN the SBOM generated either by trivy or other tools, to identify the severity of the problem. In addition to the vulnerability detection, it also suggests the possible fixes for the identified vulnerability.

## SBOM with TRIVY

Trivy is a comprehensive security scanner, maintained and built by aqua security team. It is reliable, fast, and has several in-built scanners to scan for has different security issues, and different targets where it can find those issues. It can be used to scan following use cases:

- OS packages and software dependencies in use (SBOM)
- Known vulnerabilities (CVEs)
- IaC misconfigurations
- Sensitive information and secrets

Today we will be focusing on the SBOM scanning capabilities of the Trivy. In this tutorial, we would doing the following :

- First, Create the SBOM using trivy
- Analyze the created SBOM to scan and find the vulnerabilites

For the sake of the demo we will be using one of the most used docker images, NGINX, particularly nginx:1.21.5. We would using its Docker hub image and run scanner to generate the SBOM. Once the SBOM is generated, we would use this SBOM to get the list of Vulnerabilities and possible fixes for the same.

## Generating SBOM

To generate the SBOM, make sure the trivy is first installed in you workbench. If not you can install using commands in this [link](https://aquasecurity.github.io/trivy/v0.33/getting-started/installation/). In my case , my pc is debian based, so i installed using following command

```bash
sudo apt-get install wget apt-transport-https gnupg lsb-release  
wget -qO - <https://aquasecurity.github.io/trivy-repo/deb/public.key> | gpg --dearmor | sudo tee /usr/share/keyrings/trivy.gpg > /dev/null  
echo "deb \[signed-by=/usr/share/keyrings/trivy.gpg\] <https://aquasecurity.github.io/trivy-repo/deb> $(lsb\_release -sc) main" | sudo tee -a /etc/apt/sources.list.d/trivy.list  
sudo apt-get update  
sudo apt-get install trivy
```

If you are using any flavour of debian, you might face issue with “lsb\_release -sc” in the command. To overcome the issue you can use one of the following values: wheezy, jessie, stretch, buster, trusty, xenial, bionic.

Once installed you should see the following, when you run

```bash
trivy --version
```

Once the trivy is installed, we can scan the vulnerabilities in two ways, either for image, for the whole directory containing the files or an single file.

- For a folder containing group of language specific files

```bash
trivy fs --format cyclonedx --output result.json /path/to/your\_project
```

- For a specific file

```bash
trivy fs --format cyclonedx --output result.json ./trivy-ci-test/Pipfile.lock
```

- For a container image

```basg
trivy image --format spdx-json --output result.json nginx:1.21.5
```

Once done, the scanner will scan the files/image and determine which language is the application written. Once determined, it will download the database pertaining to that specific language and get the list of libraries that are present in that language and check against which are being used in the current context.

These libraries are listed down along with OS level libraries in an SBOM in the format that we have requested in.

## Listing Vulnerabilities of SBOM

Once the SBOM are generated, we can create the list of known vulnerabilities of the dependencies in the image/files such as libraries, OS packages etc. In addition to identifying these, trivy also suggests the version in which these vulnerabilities are fixed, making it not an effective tool to identify the vulnerabilities but also to resolve them.

In order for us to generate this list, we use the following command

```bash
trivy sbom results.json
```

This will generate the following list

As you can observe, we get the name of the library, the CVE vulnerability Number, Its Severity (HIGH,MEDIUM,LOW), The status of Vulnerability fix( fixed, not fixed or will\_not fix) , if its fixed then the fixed version and along with the details on the vulnerability.

Based on this information ,we can upgrade the fixed vulnerable libraries, understand the vulnerability level in not fixed libraries and remove them if they are not required. In-addition to that, we would have the opportunity to look into the alternatives to the vulnerable libraries.

For more information and documentation, visit this [site](https://aquasecurity.github.io/trivy/v0.33/).

Liked my content ? Feel free to reach out to my [LinkedIn](https://www.linkedin.com/in/krishnadutt/) for interesting content and productive discussions.