---
slug: tfblueprintgen-in-homebrew
title: "From Scratch to Brew: Creating Personalized Formulae using tfblueprintgen in Homebrew"
last_modified_at: Friday, July 12, 2024 10:48:28 AM GMT+05:30
categories:
  - Blog
tags:
  - Ruby
  - MAC
  - Cloud
  - Homebrew
  - OOP
---

Homebrew has become defacto way to get and install the open source apps in the apple ecosystem. While homebrew has a vast repository of the appplications that it supports, it is sometimes required to create and publish our own packages to be installed be consumed by other people. In this blog, we are going to discuss how we can create the custom brew package for an app named tfblueprintgen, how do we test it and how can we install it as a homebrew package. The blog will be divided into following sections:

- Understanding tfblueprintgen
- Setting up the development environment
- Creating and Testing Homebrew formula
- Testing it locally
- Pushing it to up stream and installing it from the upstream repos.

## Understanding tfblueprintgen

Tfblueprintgen is an open-source command-line tool developed using the Charmbracelet CLI assets. It generates a modular file structure with code for your Terraform projects, speeding up the development process. By automating the creation of boilerplate files and directory structures, Tfblueprintgen streamlines setting new Terraform projects. To learn more about the project , refer [this](https://medium.com/@krishnaduttpanchagnula/tfblueprintgen-a-tool-to-simplify-terraform-folder-setup-and-provide-base-resource-modules-a1c6bfb09993).

## Setting up the development environment

Once you have your application up in the github environment, package your application for release by pushing it .

Once the release is complete we can see our application is avaliable in compressed format such as .tar.gz or .zip.

First lets setup our dev environment:

- Set `HOMEBREW_NO_INSTALL_FROM_API=1` in your shell environment,
- Run `brew tap homebrew/core` and wait for the clone to complete. If clone fails run the following commands before running the `brew tap homebrew/core` again.

```bash  
git config --global core.compression 0  
git clone --depth 1 <https://github.com/Homebrew/homebrew-core.git>  
git fetch --depth=2147483647  
git pull --all
```

One this is done we are good to create the homebrew formula

## Creating and Testing Homebrew formula

To create the boilerplate homebrew formula run “brew create <url of .tar.gz>” in my case it is

```bash
brew create <https://github.com/krishnaduttPanchagnula/tfblueprintgen/archive/refs/tags/0.3.tar.gz>
```

Running the above command opens a file to edit in vim. This formula file contains following:

- `desc` provides a brief description of the package.
- `homepage` is left blank in this case.
- `url` specifies the download URL for the package source code.
- `sha256` is the SHA-256 checksum of the package, which Home-brew uses to verify the integrity of the downloaded zip.
- `license` declares the software license for the package.
- `depends_on` specifies the dependencies that current formula depends on.
- `install` contains the instructions for building and installing the package.
- `test` defines a test to ensure that the package was installed correctly by checking the version output.

Make changes to the install and test function so it reflects the installation and testing for your application. In my case i have made changes as follows:

```ruby
class Tfblueprintgen < Formula  
  desc "This contains the formula for installing tfblueprintgen. tfblueprintgen cli utility developed using charmbracelet CLI assets, which generates the Modular file structure with the code for your Terraform code to speed up the development."  
  homepage ""  
  url "<https://github.com/krishnaduttPanchagnula/tfblueprintgen/archive/refs/tags/0.3.tar.gz>"  
  sha256 "0ef05a67fa416691c849bd61d312bfd2e2194aadb14d9ac39ea2716ce6a834a6"  
  license "MIT"  
  depends\_on "go" => :build  
  def install  
      puts \`ls\`  
      # system ("cd tfblueprintgen-0.2")  
       system ("go build -o tfblueprintgen main.go  ")  
      bin.install "tfblueprintgen"  
  end  
  test do  
    system "#{bin}/tfblueprintgen  --version"  
    expected\_version = "Tfblueprintgen version: 0.3"  
    actual\_version = shell\_output("#{bin}/tfblueprintgen --version").strip  
    assert\_match expected\_version, actual\_version  
  end  
end
```

Once the formula is defined, install the formula using following command

```bash
brew install tfblueprintgen.rb
```

This command installs the package source, build it according to the formula instructions ( defined in the install function), and install the resulting binary. To test the binary installed run “brew test <binaryname>”. In my case the command will be

```bash
brew test tfblueprintgen
```

If he tests goes well, you should be seeing the test process running without any errors

## Pushing it to up stream and installing it from the upstream repo

Once the formula has been written and tested, now it is time to publish the formula. Create a repository with prefix homebrew like “homebrew-<yourreponame>”, which in my case is “homebrew-tfblueprintgen”. Clone this repo locally and move your formula to that folder and push it to github.

To install your tap locally from the formula stored in github

- Run brew tap <yourgithubusername>/homebrew-<your repo given name>
- Then run brew install <your package name>

In my case this is

```bash
brew tap krishnaduttPanchagnula/homebrew-tfblueprintgen 

brew install tfblueprintgen
```

Voila, your package can now be installed via homebrew.