import React from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Platform/Devops/SRE/Cloud Engineer"
    >
      <main className="container margin-vert--xl">
        <section className="hero-section">
          <h1>
            Hey there, I'm Krishnadutt. <span className="wave">👋</span>
          </h1>
          <p className="hero-subtitle">
            I'm a <b>Platform/Devops/SRE/Cloud Engineer</b> with 4.5+ years of
            experience. I love building scalable infrastructure, exploring
            cultures, and drinking coffee.
          </p>
          <div className="social-links">
            <Link className="button button--primary" to="/posts">
              Read My Blog 📜
            </Link>
          </div>
        </section>

        <section className="margin-top--xl">
          <h2>Latest Blog Posts</h2>
          <div className="listing-item">
            <Link to="/posts/accelerating-cloud-migration">
              Accelerating cloud migration using “Terraform Import”
            </Link>
            <div className="listing-metadata">July 12, 2024 • 10 min read</div>
          </div>
          <div className="listing-item">
            <Link to="/posts/deploy-and-run-hashicorp-vault">
              Deploy and Run Hashicorp Vault With TLS Security in AWS
            </Link>
            <div className="listing-metadata">July 12, 2024 • 15 min read</div>
          </div>
          <Link className="view-all" to="/posts">
            View all posts →
          </Link>
        </section>

        <section id="projects" className="margin-top--xl">
          <h2>Projects</h2>
          <div className="listing-item">
            <Link href="https://github.com/krishnaduttPanchagnula/TerraViz">
              TerraViz
            </Link>{" "}
            <span className="badge-lang">Go</span>
            <p>
              A tool for visualizing Terraform plans and infrastructure graphs.
            </p>
          </div>
          <div className="listing-item">
            <Link href="https://github.com/krishnaduttPanchagnula/terracost">
              terracost
            </Link>{" "}
            <span className="badge-lang">Go</span>
            <p>Cloud cost estimation for Terraform plans.</p>
          </div>
          <div className="listing-item">
            <Link href="https://github.com/krishnaduttPanchagnula/ecs2k8s">
              ecs2k8s
            </Link>{" "}
            <span className="badge-lang">Python</span>
            <p>
              A migration tool to convert AWS ECS task definitions to Kubernetes
              manifests.
            </p>
          </div>
          <div className="listing-item">
            <Link href="https://github.com/krishnaduttpanchagnula/tfblueprintgen">
              tfblueprintgen
            </Link>{" "}
            <span className="badge-lang">Go</span>
            <p>A tool to simplify Terraform project structure generation.</p>
          </div>
          <div className="listing-item">
            <Link href="https://github.com/krishnaduttpanchagnula/parlay">
              parlay-github-action
            </Link>{" "}
            <span className="badge-lang">Typescript</span>
            <p>GitHub Action for Parlay to analyze SBOMs.</p>
          </div>
        </section>
      </main>
    </Layout>
  );
}
