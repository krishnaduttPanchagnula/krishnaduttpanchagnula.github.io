---
slug: deploy-and-run-hashicorp-vault
title: "Deploy and Run Hashicorp Vault With TLS Security in AWS Cloud"
last_modified_at: Friday, July 12, 2024 10:48:28 AM GMT+05:30
categories:
  - Blog
tags:
  - Hashicorp Vault
  - Agile
  - Security
  - Hashicorp
---


Often in software engineering, when we are developing new features, it is quite a common feature that we would encode certain sensitive information, such as passwords, secret keys, or tokens, for our code to do its intended functionality. Different professionals within the IT realm use it in different ways, such as the following:

*   Developers use secrets from API tokens, Database credentials, or other sensitive information within the code.
*   Dev-ops engineers might have to export certain values as environment variables and write the values in the YAML file for CI/CD pipeline to run efficiently.
*   The cloud engineers might have to pass the credentials, secret tokens, and other secret information for them to access their respective cloud (In the case of AWS, even if we save these in a `.credentials` file, we still have to pass the filename in terraform block, which would indicate that the credentials are available locally within the computer.)
*   The system administrators might have to send different logins and passwords to the people for the employees to access different services

But writing it in plain text or sharing it in plain text is quite a security problem, as anyone logging in to the code-base might access the secret or pull up a Man-in-the-Middle attack. To counter this, in the developing world, we have different options like Importing secrets from another file ( YAML, .py, etc.) or exporting them as an environment variable. But both of these still have a problem: a person having access to a singular config file or the machine can echo out the password ( read print). Given these problems, it would be very useful if we could deploy a single solution that would provide solutions to all the IT professionals mentioned above and more. This is the ideal place for introducing Vault.

## HashiCorp Vault — an Introduction


HashiCorp Vault is a secrets and encryption management system based on user identity. If we have to compare it with AWS, it is like an IAM user-based resource (read Vault here) management system which secures your sensitive information. This sensitive information can be API encryption keys, passwords, and certificates.

Its workflow can be visualized as follows:

## Hosting Cost of Vault


*   Local hosting: This method is usually done if the secrets are to be accessed only by the local users or during the development phase. This method has to be shunned if these secret engines have to be shared with other people. As it is within the local development environment, there is no additional investment for deployment. This can be hosted directly in [a local machine](https://www.vaultproject.io/downloads) or by its [official docker image](https://hub.docker.com/_/vault/)
*   Public Cloud Hosting ( EC2 in AWS/Virtual Machine in Azure): If the idea is to set up Vault to share with people across different regions, hosting it on Public cloud is a good idea. Although we can achieve the same with the on-prem servers, upfront costs and scalability is quite a hassle. In the case of AWS, we can easily secure the endpoint by hosting Vault in the EC2 instance and creating a Security group on which IPs can access the EC2. If you feel more adventurous, you can map this to a domain name and route from Route 53 so the vault is accessible on a domain as a service to the end users. In the case of EC2 hosting with an AWS-defined domain, the cost is $0.0116/hr.
*   Vault cloud Hosting (HashiCorp Cloud Platform): If you don’t want to set up infrastructure in the Public Cloud Environments, there is an option of choosing the cloud hosted by vault. We can think of it as a SaaS-based cloud platform that enables us to use the Vault as a service on a subscription basis. Since hashicorp itself manages the cloud, we can expect a consistent user experience. For the cost, it has three production grade [options](https://cloud.hashicorp.com/products/vault/pricing): Starter at $ 0.50/hr, Standard at $1.58/hr, and Plus at $1.84/hr (as seen in July 2022).

## Example of Self-Hosting in AWS Cloud


Our goal in this Project is to create a Vault instance in EC2 and store static secrets in the Key—Value secrets engine. These secrets are later retrieved into the terraform script, which, when applied, would pull the secrets from the Vault Secrets Engine and use them to create infrastructure in AWS.

To create a ready-to-use Vault, we are going to follow these steps:

1.  Create an EC2 Linux instance with ssh keys to access it.
2.  SSH into the instance and install the Vault to get it up and running
3.  Configure the Valve Secrets Manager

### Step 1: Create an EC2 Linux instance with ssh keys to access it


To create an EC2 instance and access it remotely via SSH, we need to create the Key pair. First, let's create an SSH key via the AWS console.

Once the Keys have been created and downloaded into the local workbench, we create an EC2 (t2.micro) Linux instance and associate it with the above keys. The size of the EC2 can be selected based on your requirements, but usually, a t2.micro is more than enough.

### Step 2: SSH into the instance and install the secrets to get it up and running


Once the status of the EC2 changes to running, open the directory in which you have saved the SSH(.pem) key. Open a terminal and type `ssh -i <keyname.pem> ec2-user @<publicdns IP4>` . Once we have established a successful SSH session into our Ec2 instance, we can install the Vault using the following commands:

```bash
wget -O- <https://apt.releases.hashicorp.com/gpg> | gpg — dearmor | sudo tee /usr/share/keyrings/hashicorp-archive-keyring.gpg  
  
echo "deb \[signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg\] <https://apt.releases.hashicorp.com> $(lsb\release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list  
  
sudo apt update && sudo apt install vault
```

The above command would install the vault in the EC2 environment. Sometimes the second command is known to throw some errors. In case of an error, replace `$(lsb_release -cs)` with “`jammy`”. \[This entire process can be automated by copying the above commands to EC2 user data while creating an EC2 instance\].

### Step 3: Configure the Hashicorp valve


Before initializing the vault, let's ensure it is properly installed by following the command:

```bash
vault
```

Let's make sure there is no environment variable called `VAULT_TOKEN`. To do this, use the following command:

```bash
$ unset VAULT_TOKEN
```

Once we have installed the Vault, we need to configure the Vault, which is done using HCL files. These HCL files contain data such as backed, listeners, cluster address, UI settings, etc. As we have discussed in the Vault’s Architecture, the back end on which the data is stored is very different from the vault engine, which is to be persisted even when the vault is locked (Stateful resource). In addition to that, we need to specify the following details:

*   Listener Ports: the port/s on which the Vault listens for API requests.
*   API address: Specifies the address to advertise to route client requests.
*   Cluster address: Indicates the address and port to be used for communication between the Vault nodes in a cluster. To secure it much further, we can use TLS-based communication. This step is optional and can only be tried if you want to secure your environment further. The TLS Certificate can be generated using openssl in Linux.

```bash
# Installs openssl  
sudo apt install openssl  
  
#Generates TLS Certificate and Private Key  
openssl req -newkey rsa:4096 -x509 -sha512 -days 365 -nodes -out certificate.pem -keyout privatekey.pem 

```

Insert the TLS Certificate and Private Key file paths in their respective arguments in the listener “tcp” block.

*   `tls_cert_file`: Specifies the path to the certificate for TLS in PEM encoded file format.
*   `tls_key_file`: Specifies the path to the private key for the certificate in PEM-encoded file format.

```hcl
#Configuration in config.hcl file  
  
storage "raft" {   
path = "./vault/data"   
node\id = "node1"   
}  
listener "tcp" {  
 address = "127.0.0.1:8200"   
tls\disable = "true"  
tls\cert\file = certificate.pem  
tls\key\file = privatekey.pem  
}  
disable\mlock = true  
api_addr = "http://127.0.0.1:8200"   
cluster_addr = "https://127.0.0.1:8201"  
 ui = true
```

Once these are created, we create the folder where our backend will rest: vault/data.

```bash
mkdir -p ./vault/data
```

Once done, we can start the vault server using the following command:

```bash
vault server -config=config.hcl
```

Once done, we can start our Vault instance with the backend mentioned in the config file and all its settings.

```bash
export VAULT_ADDR='http://127.0.0.1:8200'  
  
vault operator init
```

After it is initialized, it creates five Unseal keys called shamir keys (out of which three are used to unseal the Vault by default settings) and an Initial root token. This is the only time ever that all of this data is known by Vault, and these details are to be saved securely to unseal the vault. In reality, these shamir keys are to be distributed among key stakeholders in the project, and the Key threshold should be set in such a fashion that Vault can be unsealed when the majority are in consensus to do so.

Once we have created these Keys and the initial token, we need to unseal the vault:

```bash
vault operator unseal
```

Here we need to supply the threshold number of keys to unseal. Once we supply that, the sealed status changes to false.

Then we log in to the Vault using the Initial root token.

```bash
vault login
```

Once authenticated successfully, you can easily explore different encryption engines, such as Transit secrets Engine. This helps encrypt the data in transit, such as the Key-Value Store, which is used to securely store Key-value pairs such as passwords, credentials, etc.

As seen from the process, Vault is pretty robust in terms of encryption, and as long as the shamir keys and initial token are handled in a sensitive way, we can ensure the security and integrity

And you have a pretty secure Vault engine (protected by its own shamir keys) running on a free AWS EC2 instance (which is, in turn, guarded by the security groups)!

```
**Want to Connect?**  
  
If you want to connect with me, you can do so on [LinkedIn](https://www.linkedin.com/in/krishnadutt/).
```