---
slug: alerting-with-server-less-architecture
title: "Developing Real-time log monitoring and email — alerting with Server-less Architecture using Terraform"
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
---

## Why Log Monitoring ?

Lets say that you have build a certain app ( Here we are building an app based on micro-service architecture) using containerized solution in EKS (Elastic Kubernetes Service) or running an standalone app in EC2 (Elastic Cloud Compute) instance. And to monitor this app, we are sending the application logs to cloud watch-logs. But having to keep a constant eye on the this resource log group is tiresome and sometimes technically challenging, as there are hundred other micro-services that send their own logs to their log groups. And as this app scales up, we need to invest more human resources to perform mundane tasks such as monitor these logs, which could be better utilized in developing new business frontiers.

What if we can build an automated solution, which scales efficiently in terms of cost and performance, help us with monitor and alert if there are any issues within the logs ? We can build this tool in one of the two architecture styles mentioned below :

1. Using Server based architecture (or)
2. Server-less architecture.

## Server-Centric (or) Server-less Architecture?

With the advent of the cloud technologies, we have moved from server-centric to on demand servers to now the server-less. Before we choose server-centric, on-demand servers or server-less architecture, we must ask ourselves few questions:

1. How am i going to serve the feature that i am developing? ( Is it extension of available Eco-system or a stand-alone feature?)
2. What should be its availability and Scalability? What is it runtime requirement?
3. Does the feature have stateful or stateless functionality?
4. What is my budget of running this feature?

If the your answers to above questions are quite ambiguous, always remember one thing **Prefer Server-less over Server-Centric,** if your solution can be build as server-less ( Your Cloud Architect might help you with decision).

In my case, as my log-Monitoring system is

1. A Standalone system
2. It is event-based ( the event here is log), which needs to be highly available and should be scalable for logs from different services.
3. The feature is Stateless.
4. Budget is Minimum.

Given the above answers, i have chosen **Server-less** Architecture.

## Case Example

This system can be better illustrated by an example. Let say that we have built our application in JAVA ( application is running in tomcat within a node in EKS) and this application in deployed within the EKS cluster.

> Example Log -1

```bash
java.sql.SQLTransientConnectionException: HikariPool-1 — Connection is not available, request timed out after 30000ms.  
 at org.springframework.transaction.interceptor.TransactionAspectSupport.invokeWithin Transaction(TransactionAspectSupport.java:367)
```

> Example Log -2

```bash
at org.springframework.transaction.interceptor.TransactionInterceptor.invoke(Transaction Interceptor.java:118) 
at org.apache.catalina.core.StandardHostValve.invoke(StandardHostValve.java:143) 
at org.apache.catalina.valves.ErrorReportValve.invoke(ErrorReportValve.java:92)
```

We would like to get notified every time the application log reads the keyword “**ERROR**” or “**Connection Exception**”, as seen in the log above.To achieve this, lets build our monitoring and alerting system.

## Key components to build Log Monitoring and Alerting System

1. AWS Cloud-watch Logs
2. AWS log filter pattern
3. AWS Lambda
4. Simple Notification Service (SNS)
5. Email Subscription

We combine the above AWS resources, as shown in the architecture diagram above, to create a Real-time server-less log monitoring system.

## Building Infrastructure and Working with Terraform

1. Lets first create a log group, which would receive all the application logs

```go
terraform {
 required_providers {
  aws = {
   source = "hashicorp/aws"
   version = "~> 3.0"
  }
 }
}

# Configure the AWS Provider
provider "aws" {
 region = var.region
}

# Extract the current account details
data "aws_caller_identity" "current" {}

data "aws_region" "current" {}

# Create a Log group to send your application logs
resource "aws_cloudwatch_log_group" "logs" {
 name = "Feature_Logs"
}
```

Once this resource is created, we expose all our log traffic from application layer in EKS to this log group. As the application starts working, all its outputs and errors are sent as log stream to this log group.

2. After the above step, we start receiving the logs. Every time the application layer throws an _error_ or _connection exception_, we would like to get notified, so our desired keywords are “**Error**” and “**Connection Exception**” within the log stream of the Cloud watch log group.

3. We can do this, using the **cloud-watch log subscription filter** which helps parse all those logs and find the logs which contain either the keyword “**Error**” or such keywords.

```go
resource "aws_cloudwatch_log_subscription_filter" "logs_lambdafunction_logfilter" {
 name = "logs_lambdafunction_logfilter"

 # role_arn = aws_iam_role.iam_for_moni_pre.arn
 change_log_group_name = aws_cloudwatch_log_group.logs.name

 filter_pattern = "?SQLTransientConnectionException ?Error" // Change the error patterns here

 destination_arn = aws_lambda_function.logmonitoring_lambda.arn
}
```

4. When the **cloud-watch log subscription filter** sends logs to any receiving service such as AWS lambda , they are base64 encoded and compressed with the gzip format. In order for us to unzip , decode the logs and send them to SNS, we need **AWS Lambda service**.

We create this Lambda service, as a log based triggered event(Thanks to cloudwatch logs), which receives the log events from log group, _Unzips it_, _decodes it base 64,_ and sends the log to the SNS topic, whose arn is passed as Environment variable to the lambda function.

```go
resource "aws_lambda_function" "logmonitoring_lambda" {
 function_name = "logmonitoring_lambda"
 filename   = data.archive_file.Resource_monitoring_lambda.script.output_path
 script     = data.archive_file.Resource_monitoring_lambda.script
 output_path  = data.archive_file.Resource_monitoring_lambda.script.output_path
 handler    = "lambda_function.lambda_handler"
 package_type = "Zip"
 role      = aws_iam_role.iam_for_moni_pre.arn
 runtime    = "python3.9"
 source_code_hash = filebase64sha256(data.archive_file.Resource_monitoring_lambda.script.output_path)

 timeouts {}

 tracing_config {
  mode = "PassThrough"
 }

 environment {
  variables = {
   sns_arn = "${aws_sns_topic.logsns.arn}"
  }
 }
}

resource "aws_lambda_permission" "allow_cloudwatch" {
 statement_id = "AllowExecutionFromCloudWatch"
 action    = "lambda:InvokeFunction"
 function_name = aws_lambda_function.logmonitoring_lambda.function_name
 principal   = "logs.${data.aws_region.current.name}.amazonaws.com"
 source_arn  = "arn:aws:logs:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:*"
}
```

5. Having received the decoded logs from lambda, the SNS (Simple Notification Service) topic sends this filtered log to its email subscription and the subscribed email owner gets the email about the filtered log.

```go
resource "aws_sns_topic" "logsns" {
 name = "logsns"
}

resource "aws_sns_topic_subscription" "snstoemail_email_target" {
 topic_arn = aws_sns_topic.logsns.arn
 protocol = "email"
 endpoint = var.email
}
```

The resources in this architecture, as it it is **server-less**, are only invoked when there there are such key words in the logs. Hence this method is **cost optimized**.

If you would like to connect with me , you can follow my [blog here](https://medium.com/@krishnaduttpanchagnula) (or) on [linked-in](https://www.linkedin.com/in/krishnadutt/) and you can find all the code in my [Git-hub](https://github.com/krishnaduttPanchagnula).

> Here is the lambda python script:

```python
import gzip
import json
import base64
import boto3
import os

def lambda_handler(event, context):
  log_data = str(gzip.decompress(base64.b64decode(event["awslogs"]["data"])), "utf-8")
  json_body = json.loads(log_data)
  print(json_body)

  sns = boto3.client('sns')
  print(os.environ['snsarn'])
  response = sns.publish(
    TopicArn=str(os.environ['snsarn']),
    Message=str(json_body)
  )
  print(response)
```