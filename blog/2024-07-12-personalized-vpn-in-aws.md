---
slug: personalized-vpn-in-aws
title: "Secure your data and internet traffic with your Personalized VPN in AWS"
last_modified_at: Friday, July 12, 2024 10:48:28 AM GMT+05:30
categories:
 - Blog
tags:
 - Monitoring
 - Observability
 - Serverless
 - Lambda
 - SNS
 - AWS
 - Cloud
 - Terraform
 - VPN
 - Security
 - OpenVPN
---

## Introduction

In today’s era, the internet has become embedded into the very fabric of our lives. It has revolutionized the way we communicate, work, shop, and entertain ourselves. With the increasing amount of personal information that we share online, data security has become a major concern. Cyber-criminals are constantly on the lookout for sensitive data such as credit card information, social security numbers, and login credentials to use it for identity theft, fraud, or other malicious activities.

Moreover, governments and companies also collect large amounts of data on individuals, including browsing history, location, and personal preferences, to model the behavior of the users using deep-learning clustering models. This data can be used to coerce users psychologically to buy their products or form an opinion that they want us to form.

To overcome this issue, we can use a VPN which can be used to mask the user’s identity and route our traffic through a remote server. In addition, we can bypass internet censorship and access content that may be restricted in our region, which enables us to access our freedom to consume the data we want rather than what the governments/legal entities want us to consume. The VPNs we will discuss are of two types: Public VPNs such as Nord VPN, Proton VPN, etc., and private VPNs. Let’s try to understand the differences amongst them.

## Private vs Public VPN

Public VPNs are VPN services that are available to the general public for a fee or for free. These services typically have servers located all around the world, and users can connect to any of these servers to access the internet.

Private VPNs, on the other hand, are VPNs that are created and managed by individuals or organizations for their own use. Private VPNs are typically used by businesses to allow remote employees to securely access company resources, or by individuals to protect their online privacy and security.

Not all VPNs are created equal, and there are risks associated with using public VPN services over private VPN as follows:

## Risks of Using Private VPNs

1. Trustworthiness of the VPN Provider

When using a private VPN, you are essentially entrusting your online security to the VPN provider. If the provider is untrustworthy or has a history of privacy breaches, your data could be compromised. Unfortunately, many private VPN providers have been caught logging user data or even selling it to third-party companies for profit.

2. Potential for Malware or Adware

Some private VPNs have been found to include malware or adware in their software. This can be particularly dangerous, as malware can be used to steal sensitive information, while adware can slow down your computer and make browsing the web more difficult.

3. Unreliable Security of your Data

Private VPNs may not always provide reliable security. As the service is managed by the third-party service, it is difficult to understand how their system is working behind the closed doors. There may be logging data which can be easily used to identify the user, which would straight away remove the idea of anonymity of use.

## Benefits of Creating Your Own Personal VPN

1. Complete Control Over Your Online Security

By creating your own personal VPN, you have complete control over your online security. You can choose the encryption protocol, server locations, and other security features, ensuring that your data is protected to the fullest extent possible.

2. No Third-Party Involvement

When using a private VPN provider, you are relying on a third-party to protect your online security. By creating your own personal VPN, you eliminate this risk entirely, as there are no third parties involved in your online security.

3. Cost-Effective

While some private VPN providers charge high monthly fees for their services, creating your own personal VPN can be a cost-effective solution. By using open-source software and free server software, you can create a VPN that is just as secure as a private VPN provider, but without worrying about your browsing history privacy or the excessive costs.

## Setting up OpenVPN in AWS

[OpenVPN](https://openvpn.net/) is an open-source project that can be used to create your custom VPN using their community edition and setting things up on your VPN server. Once the VPN server is set up, we use the Open-VPN client to connect to our VPN server and tunnel our traffic through the instance. For setting up the Open-VPN server, we are going to need the following things:

1. An AWS account
2. A little bit of curiosity..!

We are going to set up the VPN server in an AWS EC2 instance, which would be used to connect with our Open-VPN client on all our devices.The Open-VPN company also provides a [purpose-built OpenVPN Access Server as an EC2 AMI](https://openvpn.net/index.php/access-server/on-amazon-cloud.html) which comes out of the box with AWS-friendly integration , which we are going to use in this blog.

## Setup Open-VPN server in AWS:

1. Once you have setup the AWS, login to your AWS account and search for EC2.
2. Once you are in the AWS EC2 console, switch to the region you want you VPN to be in and then click “Launch instances” button on the right side of the screen.

3. In the Ec2 creation console, search for AMI named “openvpn”. You will see a lot of AMI images. Based on the number of VPN connections you require, select the AMI. For the Current demonstration, I am choosing AMI which serves two VPN connection.

4. Choosing the above VPN, sets the Security group by itself. Ensure that the Ec2 is publicly accessible ( Either with EIP or setting Ec2 in public-subset). Once done press “Launch Instance”.

5. When we connect to the Ec2 instance, we are greeted with the OpenVPN server agreement. Create the settings as shown below and at the end, create an password.

6. Once done, open https://<Ec-2-Instance-IP>:943/admin’ where you would see an login page. Enter your user name and login that you have set in the VPN server, which in my case, username is openvpn and enter your previously set password.

7. You would enter the openVPN settings page. In configuration>Vpn settings, scroll to the bottom and toggle “Have clients use specific DNS servers” to ON. In the primary DNS enter 1.1.1.1 and in secondary dns enter 8.8.8.8. After this, click save changes on the bottom of the screen.

8. If you scroll to the top you will see a banner with “Update Running Server”, click on it.

9. You are set on the Open-VPN server side !

## Connecting to Open-VPN server from our device:

1. Once the server is configured, we would require client to connect to out openVPN server. For that purpose we need to install “Open-VPN connect”

- **For Windows** : Download and install the open-VPN connect from [here](https://openvpn.net/client-connect-vpn-for-windows/)
- **For Mobile** : Search for “openvpn connect” in the play-store (for Android) and in app-store(for apple)
- **For Linux**:

First ensure that your apt supports the HTTPS transport:

```bash
apt install apt-transport-https
```

Install the Open-VPN repository key used by the OpenVPN 3 Linux packages

```bash
curl -fsSL <https://swupdate.openvpn.net/repos/openvpn-repo-pkg-key.pub> | gpg --dearmor > /etc/apt/trusted.gpg.d/openvpn-repo-pkg-keyring.gpg
```

Then you need to install the proper repository. Replace $DISTRO with the release name depending on your Debian/Ubuntu distribution. For distro list, refer [here](https://www.notion.so/Secure-your-data-and-internet-traffic-with-your-Personalized-VPN-in-AWS-3f5e619598664880bfe2b496eef98741)

```bash
curl -fsSL <https://swupdate.openvpn.net/community/openvpn3/repos/openvpn3-$DISTRO.list> >/etc/apt/sources.list.d/openvpn3.list 
apt update 
apt install openvpn3
```

1. Once installed open “Open-VPN connect“ , we should see the something like below.

2. In the URL form, enter the IP of your EC2 instance and click NEXT. Accept the certificate pop-ups you would get during this process.

3. In the user name form, enter the username that you have set in the server and same for the password. Then click IMPORT.

4. Once imported, click on the radio button and enter your credentials again.

5. Once connected you should see the screen link this. Voila ! enjoy using your private VPN in EC2.

Liked my content ? Feel free to reach out to my [LinkedIn](https://www.linkedin.com/in/krishnadutt/) for interesting content and productive discussions.