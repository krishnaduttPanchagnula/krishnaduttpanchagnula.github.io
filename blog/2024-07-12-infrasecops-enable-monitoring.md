---
slug: infrasecops-enable-monitoring
title: "InfraSecOps : Enable Monitoring and automated continuous Compliance of Security Groups using Cloud-watch and Lambda"
last_modified_at: Friday, July 12, 2024 10:48:28 AM GMT+05:30
categories:
  - Blog
tags:
  - Cloud
  - AWS
  - CloudWatch
  - Serverless
  - Lambda
  - Devsecops
  - Monitoring
  - Observability
  - Cloud
---

As a Dev-ops engineer, we use different compute resources in our cloud, to make sure that different workloads are working efficiently. And in order to restrict the traffic accessing our compute resources ( EC2/ECS/EKS instance in case of AWS) , we create stateful firewalls ( like Security groups in AWS). And as a lead engineer, we often describe the best practices for configuring the Security groups.But when we have large organization working on cloud, monitoring and ensuring each team follows these best practices is quite a tedious task and often eats up lot of productive hours. And it is not as if we can ignore this, this causes security compliance issues.

For example, the Security group might be configured with following configuration by a new developer ( or some rogue engineer). If we observe the below , security group which is supposed to restrict the traffic to different AWS resources is configured to allow all kinds of traffic on all protocols from the entire internet. This beats the logic of configuring the securing the resource with security group and might as well remove it.

```json
{  
    "version": "0",  
    "detail-type": "AWS API Call via CloudTrail",  
      "responseElements": {  
        "securityGroupRuleSet": {  
          "items": \[  
            {  
              "groupOwnerId": "XXXXXXXXXXXXX",  
              "groupId": "sg-0d5808ef8c4eh8bf5a",  
              "securityGroupRuleId": "sgr-035hm856ly1e097d5",  
              "isEgress": false,  
              "ipProtocol": "-1",  --> It allows traffic from all protocols  
              "fromPort": -1, --> to all the ports  
              "toPort": -1,  
              "cidrIpv4": "0.0.0.0/0" --> from entire internet, which is a bad practice.  
            }  
          \]  
        }  
      },  
    }  
  }
```

This kind of mistake can be done while building a Proof Of Concept or While testing a feature, which would cost us lot in terms of security. And Monitoring these kind of things by Cloud Engineers takes a toll and consumes a lot of time.What if we can automate this monitoring and create a self-healing mechanism, which would detect the deviations from best practices and remediate them?

System’s Architecture and Working:
==================================

The present solution that i have built in AWS, watches the each Security group ingress rule ( can be extended to even egress rules too) the ports that it is allowing, the protocol its using and the IP range that it communicating with. These security group rules are compared with the baseline rules that we define for our security compliance, and any deviations are automatically removed. These base-rules are configured in the python code( which can be modified to our liking, based on the requirement).

Components used to build this system
====================================

1.  AWS Cloud trail
2.  AWS event bridge rule
3.  AWS lambda
4.  AWS SNS
5.  S3 Bucket

1.  Whenever a new activity ( either creation/modification/deletion of rule) is performed in the security group, its event log not sent as event log to cloud watch ,but as api call to cloud trail. So to monitor these events, we need to first enable cloud trail. This cloud trail will monitor all the api cloud trails from EC2 source and save them in a log file in S3 bucket.
2.  Once these api calls are being recorded, we need to filter only those which are related to the Security group api calls. This can be done by directly sending all the api call to another lambda or via AWS event bridge rule. The former solution using lambda is costly as each api call will invoke lambda, so we create a event bridge rule to only cater the api calls from ec2 instance.

3\. These filtered API events are sent to the lambda, which will check for the port, protocol and traffic we have previously configured in the python code( In this example, i am checking for wildcard IP — which is entire internet, all the ports on ingress rule. You can also filter with with the protocol that you don't want to allow. Refer the [code](https://github.com/krishnaduttPanchagnula/AWS_Terraform_scripts/blob/master/Auto%20Delete%20insecure%20securitygroup%20ingress%20rules/lambda_function.py) for details)

4\. This python code will filter all the security groups and find the security group rules, which violate them and delete them.

Creating a rouge security group ruleThe lambda taking action and deleting the rouge rule

5\. Once these are deleted, SNS is used to send email event details such as arn of security group rule, the role arn of the person creating this rule, the violations that the rule group has done in reference to baseline security compliance. This email altering can help us to understand the actors causing these deviations and give proper training on the security compliance. The details are also logged in the cloud-watch log groups created in the present architecture.

For entire python code along with terraform code, please refer the following [Github repo](https://github.com/krishnaduttPanchagnula/AWS_Terraform_scripts/tree/master/Auto%20Delete%20insecure%20securitygroup%20ingress%20rules). To replicate this system in your environment, change the base security rules that you want to monitor for in python and type **_terraform apply_** in the terminal. Sit back and have a cup of coffee, while the terraform builds this system in your AWS account.

Liked my content ? Feel free to reach out to my [LinkedIn](https://www.linkedin.com/in/krishnadutt/) for interesting content and productive discussions.