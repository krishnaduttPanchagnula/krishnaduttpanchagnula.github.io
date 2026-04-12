---
slug: addressing-technical-debt
title: "Product-Management in Agile Projects: Addressing Technical Debt in DevOps Projects"
last_modified_at: Friday, July 12, 2024 10:48:28 AM GMT+05:30
categories:
  - Blog
tags:
  - Devops
  - Agile
  - Tech debt
  - Product-Management
---

While developing products in DevOps teams, we take decisions on which features to develop, how to ship them quite quickly, in order to meet the customer requirements. Often these decisions causes more problems in the long run. These kind of decisions lead to “Technical Debt”.

Tech debt is phenomenon which happens when we prioritise the speed of delivery now, by forgoing everything like code-quality or maintainability. Although the agility of delivery of products is key to stay relevent in this agile world, but we have to make decisions also that the changes are sustainable.

In this article, we’ll talk about what technical debt is, how to handle quick decisions during development, and give examples to help you understand how to avoid future issues.

Tech debt is the extra work we has to be done later because of the technical decisions that we make now. Although it was coined by software developer Ward Cunningham in 1992, but it’s still holds relevance .

Usually, Technical debt occurs when teams rush to push new features within deadlines, by writing write code, without thinking about other considerations such as security, extensibility etc. Over the time the tech debt increases and becomes difficult to manage. The only way to deal with tit then becomes to overhaul the entire system and rewrite everything from scratch. To prevent this scenario we need to continuously groom the tech debt and to that we need to understand the type of tech debt we are dealing with.

## Causes of Tech Debts:


**Prudent and deliberate**: Opting for swift shipping and deferring consequences signifies deliberate debt. This approach is favoured when the product’s significance is relatively low, and the benefits of quick delivery outweigh potential risks.

**Reckless and deliberate:** Despite knowing how to craft superior code, prioritising rapid delivery over quality leads to reckless and deliberate debt.

**Prudent and inadvertent:** Prudent and inadvertent debt occurs when there’s a commitment to producing top-tier code, but a superior solution is discovered post-implementation.

**Reckless and inadvertent:** Reckless and inadvertent debt arises when a team strives for excellence in code without possessing the necessary expertise. Often, the team remains unaware of the mistakes they’re making.

Given these different causes for tech debts, lets try to understand the types of tech debts. These can be broadly categorised under three main heads

## Types of Tech Debts:


### Code Related Debts:


*   **Code Debt:** When we talk about talk debt, code debt is the first thing that comes to the mind. It is due to bad coding practices, not following proper coding standards , insufficinet code documentation etc. This type of causes problem in terms of maintainability, extensibility, security etc.
*   **Testing Debt:** This occurs when the entire testing strategy is inadequate , which includes the absence of unit tests, integration tests, and adequate test coverage. This kind of debt causes us to loose confidence pushing new code changes and increases the risk of defects and bugs surfacing in production, potentially leading to system failures and customer dissatisfaction.
*   **Documentation Debt:** This manifests when documentation is either insufficient or outdated. It poses challenges for both new and existing team members in comprehending the system and the rationale behind certain decisions, thereby impeding efficiency in maintenance and development efforts.

### Architecture Debt:


*   **Design Debt:** This results from flawed or outdated software architecture or design choices. It includes overly complex designs, improper use of patterns, and a lack of modularity. Design debt creates obstacles to scalability and the smooth incorporation of new features.
*   **Infrastructure Debt:** This is linked to the operational environment of the software, encompassing issues such as outdated servers, inadequate deployment practices, or the absence of comprehensive disaster recovery plans. Infrastructure debt can result in performance bottlenecks and increased periods of downtime.
*   **Dependency Debt**: This arises from reliance on outdated or unsupported third-party libraries, frameworks, or tools. Such dependency exposes the software to potential security vulnerabilities and integration complexities.

### People/Management Debt:


*   **Process Debt**: This relates to inefficient or outdated development processes and methodologies. It includes poor communication practices, a lack of adoption of agile methodologies, and a lack of robust collaboration tools. Additionally, not automating the process can greatly affect the software delivery’s agility.
*   **People/Technical Skills Debt**: This occurs when the team lacks essential skills or knowledge, resulting in the implementation of sub-optimal solutions. Investing in training and development initiatives can help reduce this type of debt.

### Managing and Prioritising Tech Debt


Technical debt is something that happens when teams are developing products in aglie way. It’s like borrowing against the future by taking shortcuts now. But if the team knows about this debt and has a plan to deal with it later, it can actually help prioritise tasks. Whether the debt was intentional or not, it is crucial that the team grooms the technical debt during a backlog refinement session.

Value to customer vs Cost of solving it

1.  **Do It Right Away**: These tasks are crucial for the product’s smooth operation.
2.  **A Worthy Investment**: These tasks contribute to the product’s long-term health, such as upgrading outdated systems.
3.  **Quick and Easy Wins**: These are minor tasks that can be fixed easily. They’re great for familiarising new team members with the product.
4.  **Not Worth Considering**: Sometimes, the problem might solve itself or it might not be worth the time and effort to fix, especially if a system upgrade or retirement is planned.

While facing deadlines and working on new products, it’s easy to overlook accumulating technical debts. But if left unchecked, these debts can cause long-term problems. It’s key to balance the need for quick solutions with the importance of long-term stability.

While fast delivery and continuous improvement are central to agile development, it’s important to be mindful of accruing technical debts. Effectively managing technical debt can help ensure your projects’ long-term success.

Liked my content ? Feel free to reach out to my [LinkedIn](https://www.linkedin.com/in/krishnadutt/) for interesting content and productive discussions.
