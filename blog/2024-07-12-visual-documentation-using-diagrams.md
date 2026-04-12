---
slug: visual-documentation-using-diagrams
title: "Developing Visual Documentation using diagrams in python : Diagrams as Code - a novel approach for graphics"
last_modified_at: Friday, July 12, 2024 10:48:28 AM GMT+05:30
categories:
  - Blog
tags:
  - Python
  - Diagrams as Code
  - Documentation
  - Observability
  - Hashicorp
  - Resource Monitoring
  - AWS
  - Cloud
  - IAC
  - Infrastructure
---

We as developers, have read the documentation for different frameworks/libraries, while developing features. But when it comes to us developing documentation for the feature, we usually are in hurry, as our sprint ended or the project has pushed way beyond the deadline.

In addition to that, when we develop the documentation in black ink( just reminiscing the previous version of documentation, in literal ink!), sometimes it very difficult to communicate complex cloud architecture or even systems design via text. So we overcome this problem using images, but we have to leave our beloved IDEs to create them in illustrator/photoshop. What if i tell you that we can develop awesome graphics right from our IDEs, using python.

Introducing [**Diagrams**](https://diagrams.mingrammer.com/docs/getting-started/installation#quick-start)**,** a python library which lets you create cloud architecture diagrams using **code**!!!

**Diagrams**

Diagrams is an python library, which offers Diagrams as Code (DaC) purpose. It helps us build architecture of our system as code and track changes in our architecture. Presently it covers some of major providers such as AWS, Azure, GCP and other providers such as Digital ocean, Alibaba cloud etc. In addition to that they also support onPrem covering several services such as apache,Docker, Hadoop etc.


**Advantages of using Diagrams**

Still considering whether to use diagrams or not? How about the following reasons:

1.  **No** **Additional Software Overhead:** To create diagrams traditionally, we might want to use softwares such as illustrator or photoshop, which requires additional licenses. Even if we choose open source such as inkscape or Gimp, we still need to install these resources. With diagrams, there is no such thing, just **pip install diagrams** , you are good to go!
2.  **No need to search for high resolution images:** When developing these images, we would like to have high resolution images, which can be exported to screen of any size. And often it is a hassle to get these kind of images. Thanks to diagrams in-built repository of images , we are able to build high resolution architecture diagrams with ease.
3.  **Ease of Editing:** Lets say the your architecture changes during the project timeline( Hey, I know it happens in a project), but changing each of these components manually takes lot of time and effort. Thanks to the _Diagrams as code_ framework, we do this work with ease with few lines of the code.
4.  **Reusability:** Creating diagrams via code helps us in replicating the product, without any additional effort. All we need to do is import code and lo, behold, we have have our work ready in front of us. Thanks to the power of coding, we are able to replicate and create reusability with our code.

Now that we have seen the reasons why to use it, let’s get our hands dirty working with diagrams in python environment.

## **Diagrams Implementation example with custom node development and clustering:**

Here i am going to create the diagram for project on [**Developing Real-time resource monitoring via email on AWS using Terraform**](https://medium.com/@krishnaduttpanchagnula/developing-real-time-resource-monitoring-via-email-on-aws-using-terraform-a89fe79e366d)**.** To brief the project, I have developed serverless architecture to create notifications for any state change or status change etc. in a clean readable format (rather than in complicated json) in real time via email service. This architecture is developed in the **AWS** and deployed using **terraform**. For more details, read this [**article**](https://medium.com/@krishnaduttpanchagnula/developing-real-time-resource-monitoring-via-email-on-aws-using-terraform-a89fe79e366d)**.**

At highend architecture , the components involved are:

1.  Eventbridge
2.  SNS and
3.  Email

The email component is not available in the diagrams library. To create it, we can create our custom email node using **custom node development** method, where we pass our local image as new node, using following code.

```
from diagrams.custom import Customemail = Custom(‘Name that you want to see’, ‘path of the image’)
```

Now that we have our components ready, lets code:

```
with Diagram(“AWS resource monitoring via email notification”) as diagram1: email = ‘/content/drive/MyDrive/gmail-new-icon-vector-34182308.jpg’ emailicon = Custom(‘Email notification’, email) Eventbridge(“Event bridge rule”) >> Lambda(“Lambda”) >> SNS(‘SNS’) >> emailicon
```

By implementing the above code, we get the following:

As we have developed this is AWS environment using Terraform, I would like to create a cluster wrapping on the above code,using _diagrams.Cluster_.

```python
with Diagram(“AWS resource monitoring via email notification”) as diag: email = ‘/content/drive/MyDrive/gmail-new-icon-vector-34182308.jpg’ emailicon = Custom(‘Email notification’, email) with Cluster (“Terraform”): with Cluster (‘AWS’): Eventbridge(“Event bridge rule”) >> Lambda(“Lambda”) >> SNS(‘SNS’) >> emailicon
```

After embedding it in the cluster, the final image looks like:

Final image for the entire architecture

Here is the Final code in totality:

```python
from diagrams import Diagram  
from diagrams.aws.compute import Lambda  
from diagrams.aws.integration import SNS  
from diagrams.aws.integration import Eventbridge  
from diagrams import Cluster, Diagram  
from diagrams.custom import Customwith Diagram(“AWS resource monitoring via email notification”) as diag:  
  email = ‘/content/drive/MyDrive/gmail-new-icon-vector-34182308.jpg’  
  emailicon = Custom(‘Email notification’, email) with Cluster (“Terraform”): with Cluster (‘AWS’): Eventbridge(“Event bridge rule”) >> Lambda(“Lambda”) >> SNS(‘SNS’) >> emailicon
```

Follow me on [Medium](https://medium.com/@krishnaduttpanchagnula) and [Github](https://github.com/krishnaduttPanchagnula) for more Cloud, Dev-ops related content.

Happy Learning and Good Day..!