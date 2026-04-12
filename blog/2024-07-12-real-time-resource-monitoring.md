---
slug: real-time-resource-monitoring
title: "Developing Real-time resource monitoring via email on AWS using Terraform"
last_modified_at: Friday, July 12, 2024 10:48:28 AM GMT+05:30
categories:
  - Blog
tags:
  - Hashicorp Terraform
  - Terrraform
  - Monitoring
  - Observability
  - Hashicorp
  - Resource Monitoring
  - AWS
  - Cloud
  - IAC
  - Infrastructure
---

# 

One of the main tasks as an SRE engineer is to maintain the infrastructure that is developed for the deployment of the application. As each of the service exposes the logs in different way, we need plethora of sns and lambdas to monitor the infrastructure. This increases the cost of monitoring, which would compel management to drop this monitoring system.

But what if i say that, we can develop this monitoring system for less than 24 cents ? And what if i say that you can deploy this entire monitoring system with just a single command “Terraform apply”? Sounds like something that you would like to know? Hop on the Terraform ride !

## Key components to build the infrastructure

In order to create an monitoring system to send email alerts, we need 3 components:

1. Event Bridge
2. SNS
3. Email subscription

We can build a rudimentary monitoring system, by combining all these components. But the logs we get as email, would be as following:

```json
{
  "version": "1.0",
  "timestamp": "2022-02-01T12:58:45.181Z",
  "requestContext": {
    "requestId": "a4ac706f-1aea-4b1d-a6d2-5e6bb58c4f3e",
    "functionArn": "arn:aws:lambda:ap-south-1:498830417177:function:gggg:$LATEST",
    "condition": "Success",
    "approximateInvokeCount": 1
  },
  "requestPayload": {
    "Records": [
      {
        "eventVersion": "2.1",
        "eventSource": "aws:s3",
        "awsRegion": "ap-south-1",
        "eventTime": "2022-02-01T12:58:43.330Z",
        "eventName": "ObjectCreated:Put",
        "userIdentity": {
          "principalId": "A341B33DQLH0UH"
        },
        "requestParameters": {
          "sourceIPAddress": "43.241.67.169"
        },
        "responseElements": {
          "x-amz-request-id": "GX86AGXCNXB5ZYVQ",
          "x-amz-id-2": "CPVpR8MNcPsNBzxcF8nOFqXbAIU60/zQlNC6njLp+wNFtC/ZnZF0SFhfMuhLOSpEqMFvvPqLA+tyvaXJSYMXAByR5EuDM0VF"
        },
        "s3": {
          "s3SchemaVersion": "1.0",
          "configurationId": "09dae0eb-9352-4d8a-964f-1026c76a5dcc",
          "bucket": {
            "name": "sddsdsbbb",
            "ownerIdentity": {
              "principalId": "A341B33DQLH0UH"
            },
            "arn": "arn:aws:s3:::sddsdsbbb"
          },
          "object": {
            "key": "[variables.tf]",
            "size": 402,
            "eTag": "09ba37f25be43729dc12f2b01a32b8e8",
            "sequencer": "0061F92E834A4ECD4B"
          }
        }
      }
    ]
  },
  "responseContext": {
    "statusCode": 200,
    "executedVersion": "$LATEST"
  },
  "responsePayload": "binary/octet-stream"
}
```

Not so easy to read right ? What if we can improve it, making it legible for anyone to understand what is happening?

To make it easy to read, we use the feature in the Event bridge called **input transformer** and **input template**. This feature helps us in transforming the log in our desired format **without** using any **lambda function.**

## Infrastructure Working

The way our infrastructure works is as follows:

1. Our event bridge will collect all the logs from all the events from the AWS account, using event filter.


2. Once collected, these are sent to input transformer to parse and read our desired components.

3. After this, we use this parsed data to create our desired format using input template.

Input transformer and input templete for event bridge rule

4. This transformed data is published to the SNS that we have created.


5. We create a subscription for this SNS, via email,SMS or HTTP.


And Voila ! you have your infrastructure ready to update the changes…!


Here is the entire terraform code:

```go
terraform {  
  required_providers {  
    aws = {  
      source  = "hashicorp/aws"  
      version = "~> 3.0"  
    }  
  }  
}\# Configure the AWS Provider  
provider "aws" {  
  region = "ap-south-1" #insert your region code  
}resource "aws_cloudwatch_event_rule" "eventtosns" {  
  name = "eventtosns"  
  event_pattern = jsonencode(  
    {  
      account = [ 
        var.account,#insert  your account number  
     ]  
    }  
  )}resource "aws_cloudwatch_event_target" "eventtosns" {\# arn of the target and rule id of the eventrule  
  arn  = aws_sns_topic.eventtosns.arn  
  rule = aws_cloudwatch_event_rule.eventtosns.idinput_transformer {  
    input_paths = {  
      Source      = "$.source",  
      detail-type = "$.detail-type",  
      resources   = "$.resources",  
      state       = "$.detail.state",  
      status      = "$.detail.status"  
    }  
    input_template = "\\"Resource name : <Source> , Action name : <detail-type>,  
      details : <status> <state>, Arn : <resources>\\""  
  }  
}resource "aws_sns_topic" "eventtosns" {  
  name = "eventtosns"  
}resource "aws_sns_topic_subscription" "snstoemail_email-target" {  
  topic_arn = aws_sns_topic.eventtosns.arn  
  protocol  = "email"  
  endpoint  = var.email  
}\# aws_sns_topic_policy.eventtosns:  
resource "aws_sns_topic_policy" "eventtosns" {  
  arn = aws_sns_topic.eventtosns.arnpolicy = jsonencode(  
    {  
      Id = "default_policy_ID"  
      Statement = [ 
        {  
          Action = [ 
            "SNS:GetTopicAttributes",  
            "SNS:SetTopicAttributes",  
            "SNS:AddPermission",  
            "SNS:RemovePermission",  
            "SNS:DeleteTopic",  
            "SNS:Subscribe",  
            "SNS:ListSubscriptionsByTopic",  
            "SNS:Publish",  
            "SNS:Receive",  
         ]  
          condition = {  
            test     = "StringEquals"  
            variable = "AWS:SourceOwner"  
            values = [ 
              var.account,  
           ]  
          }Effect = "Allow"  
          Principal = {  
            AWS = "\*"  
          }  
          Resource = aws_sns_topic.eventtosns.arn  
          Sid      = "__default_statement_ID"  
        },  
        {  
          Action = "sns:Publish"  
          Effect = "Allow"  
          Principal = {  
            Service = "events.amazonaws.com"  
          }  
          Resource = aws_sns_topic.eventtosns.arn  
          Sid      = "AWSEvents_lambdaless_Idcb618e86-b782-4e67-b507-8d10aaca5f09"  
        },  
     ]  
      Version = "2008-10-17"  
    }  
  )  
}
```

This entire infrastructure can be deployed using _Terraform apply_ on above code.

Liked my content ? Feel free to reach out to my [LinkedIn](https://www.linkedin.com/in/krishnadutt/) for interesting content and productive discussions.