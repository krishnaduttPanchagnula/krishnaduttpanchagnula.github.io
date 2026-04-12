---
slug: terraform-state-drift
title: "Deploy and Run Hashicorp Vault With TLS Security in AWS Cloud"
last_modified_at: Friday, July 12, 2024 10:48:28 AM GMT+05:30
categories:
  - Blog
tags:
  - Hashicorp Terraform
  - Terrraform
  - Terraform State Drift
  - Hashicorp
  - AWS
  - Cloud
  - IAC
  - Infrastructure
---

In an ideal IaC world, all our infrastructure implementation and updates are written and implemented by pushing the updated code to GitHub, which would trigger a CI/CD pipeline either in Jenkins or Circle-Ci, and changes are reflected in our favorite public cloud. But reality is far from this, even in companies in stage four of cloud maturity. It can be for a plethora of reasons, such as the following:

*   The company is still in its initial stages of cloud automation
*   There are multiple stakeholders across different teams who are developing proofs-of-concept via console.
*   An ad-hoc manual hot-fix is introduced to stabilize the current production.
*   The user is not aware of IAC tools

Given these reasons, different categories of drift are introduced into the system, each of which has its own remediation actions. This article explains terraform drift, its categories, remediation strategies, and tools to monitor terraform drift.

To understand these concepts better, let’s first explore what terraform drift is and how Terraform detects this drift.

## What is Terraform Drift?


When we create resources (i.e., `terraform apply`) using Terraform, it stores information about current infrastructure, either locally or remote backed in a file named `terraform.tfstate`. On subsequent `terraform apply`, this file gets updated with the current state of the infrastructure. But when we make manual changes via console or CLI, those changes are applied in the cloud environment but not seen in the state file.

> Terraform drift can be understood as a drift /difference that is observed from the actual state of infrastructure defined in our terraform to the state of infrastructure present in our cloud environment.

In any of the above situations, having the infrastructure changes outside Terraform code causes our Terraform state file to have a very different state than the cloud environment. So when we apply the Terraform code next time, we would see a drift, which might cause the Terraform resources to either change or destroy the resources. So understanding how different kinds of drift creeps into our infrastructure helps us mitigate such risks.

## Types of Drifts


We can categorize the Terraform configuration drift into three categories:

1.  Emergent drift — Drift observed when infrastructure changes are made outside of the Terraform ecosystem, which was initially applied via Terraform (So their state is present in the Terraform state file).
2.  Pseudo drift — “Changes” seen in the plan/apply cycle due to ordering items in the list and other provider idiosyncrasies.
3.  Introduced drift — New infrastructure created outside of Terraform.

Sometimes it is debated that introduced drift should not be considered as the infrastructure is entirely set up via the console. But the idea of using Terraform entirely automates infrastructure processes via code. So any manual/hybrid is considered as drift.

## Managing Emergent Drift


As mentioned, emergent drift is observed when infrastructure applied and managed by Terraform is modified outside of the Terraform ecosystem. This can be managed based on the state that we prefer :

*   Infrastructure state preferred: If our preferred state is the state that is in the cloud, then we would make changes to our Terraform configuration figure ( usually `[main.tf](http://main.tf)` file ) and its dependent modules so that next time we run `terraform apply`, the state of the configuration file and Terraform state file are in sync.
*   Configuration state preferred: If our preferred state is the one in our configuration file, we just run `terraform apply` using our configuration file. This would negate all the changes in the cloud and apply the configuration in the Terraform configuration file.

## Managing Pseudo Drift


Pseudo drift can be observed when the ordering of certain resources or certain arguments for a resource is different in the configuration file from the state file. This drift is not so common but can seldom be observed with some providers. To understand this better, let’s take an example of creating a multi-availability zone RDS.

```go
resource "aws\_db\_instance" "default" {  
  allocated\_storage    = 10  
  engine               = "mysql"  
  engine\_version       = "5.7"  
  instance\_class       = "db.t3.micro"  
	availability\_zone    = \["us-east-1b","us-east-1c","us-east-1a"\]# Us-east -1a was added later   
  name                 = "mydb"  
  username             = "foo"  
  password             = "foobarbaz"  
  parameter\_group\_name = "default.mysql5.7"  
  skip\_final\_snapshot  = true  
}
```

Initially, we only wanted east-1b and 1c, but later added the 1a. When we applied this configuration, it ran successfully. Being careful SRE engineers that we are, we run a `terraform plan` to confirm that everything is the way we wanted. But to our surprise, we might see it adding this resource again with changes in the “availability zone” line. And when we apply this change again, this change log can be shown in the subsequent `terraform apply` lifecycles.

To manage this, we should run `terraform show` which will show us the current state file. Locate the availability zone argument and see the order in which these arguments are passed as a list. Copy these values to the Terraform configuration file, and you should be good to go.

Managing Introduced Drift


Introduced drift happens when new infrastructure is provisioned outside the Terraform ecosystem in the cloud. This is the most gruesome drift, which would require a conscientious effort from the engineer to detect and handle, as there is no track of these changes in the Terraform state file. Unless viewed via console by going through each resource, reading the cloud-watch logs, checking the billing console, or learning from the person who has done this change, it is quite difficult to detect this drift. This can also happen when we run `terraform destroy`, and some resources fail to destroy.

If we can identify the resource which is manually provisioned, there are two approaches based on which environment it is present:

1.  Provisioning anew: If the resource is not in a production-grade environment, it is recommended that we destroy that resource and then create a module for the same within our Terraform configuration file. This way, the infrastructure is logged, tracked, and monitored via Terraform state file, and all the resources are created via Terraform.
2.  Terraform import: If the resource is present in the production-grade environment, it is difficult to create it anew. In this case, we import the resources using the “terraform import.” Terraform import helps us create Terraform HCL code for the resource in question. Once we get this resource, we can copy this code into the Terraform configuration file, which, when applied, would update the state file with the same configuration as the state present in the cloud.

## Drift Identification and Monitoring


All this management of the drift can be done only when we can detect that there is a drift. In the case of emergent and pseudo drift, we can identify them using the “Terraform Plan” command, which would compare the current state file with resources in the cloud (previously created with Terraform). But this would fail in the case of introduced drift, as there is no state for the resource created outside the Terraform ecosystem. So it would serve us better if we can detect this kind of drift beforehand and automate it via IAC tools. This drift can be done using two tools:

### CloudQuery


If you like to use a data-centric approach with visualization dashboard, this solution is for you. CloudQuery is an open source tool that compares the state file with the resources in our desired cloud provider, then formats and loads this data into a [PostgreSQL](https://www.postgresql.org/) database. As a drift detection command is created on top of PostgreSQL with a column as managed or unmanaged, we can use this flag as a filter to visualize in our favorite dashboard solution, such as Tableau or Power BI, to monitor infrastructure state drift. (For more information, refer to [https://www.cloudquery.io/docs/cli/commands/cloudquery](https://www.cloudquery.io/docs/cli/commands/cloudquery).)

```yaml
providers:  
  # provider configurations  
  - name: aws  
    configuration:  
       accounts:  
	      - id: <UNIQUE ACCOUNT IDENTIFIER>  
      # Optional. Role ARN we want to assume when accessing this account  
      #     role\_arn: < YOUR\_ROLE\_ARN >  
      # Named profile in config or credential file from where CQ should grab credentials  
      local\_profile =  default  
      # By default assumes all regions  
	    regions:  
	      - us-east-1  
	      - us-west-2  
        
      # The maximum number of times that a request will be retried for failures.   
	    max\_retries: 5  
      # The maximum back off delay between attempts. The backoff delays exponentially with a jitter based on the number of attempts. Defaults to 30 seconds.  
      max\_backoff: 20  
      #    
    # list of resources to fetch  
	    resources:  
	      - "\*"
```

## Driftctl


If you are more of a CLI kind of person who loves working with the terminal, this tool is for you. Driftctl helps us track and detect managed and unmanaged drifts that may happen with a single command.

Since this is a CLI-based tool, this can be easily integrated into the CI/CD pipeline written in the Jenkins pipeline, and the results can be pushed as output to the PR in GitHub. If that is not your cup of coffee, run this as a cron job within your system. Create a log group that would collect the logs and then use log monitoring solutions such as Fleuentd or Prometheus/graphana packages to visualize and create alerting solutions. For more information, read [https://docs.driftctl.com/0.35.0/installation](https://docs.driftctl.com/0.35.0/installation).

```bash
#to scan local filedriftctl scan# To scan backend in AWS 
S3driftctl scan --from tfstate+s3://my-bucket/path/to/state.tfstate
```

## Conclusion

It always prevents the drift from creeping into our code rather than creating remediations after they have crept in. Finally, I would like to suggest that it is always better to write better code and coding practices.

*   Always try to build automated infrastructure. Even if you perform manual steps, try to import them into Terraform script and then apply them.
*   Write and apply code incrementally.
*   Implement a drift-tracking system with a custom alerting system that would mail the SRE about the infra-drift observed.

```
**Liked my content?**Feel free to reach out to my [LinkedIn](https://www.linkedin.com/in/krishnadutt/) for interesting content and productive discussions.
```