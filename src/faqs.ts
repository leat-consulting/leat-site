// Questions buyers ask about each package. Rendered as a visible FAQ and as
// FAQPage structured data from this one list, so the two can never differ.
// Each answer starts with the direct answer.
export type Faq = { q: string; a: string };

export const faqs: Record<string, Faq[]> = {
  "platform-review/": [
    { q: "What does a platform review cover?", a: "It covers the whole path from a developer's laptop to production: source control and review rules, CI/CD pipelines, how pipelines reach the cloud, infrastructure as code, and any AI tools in the pipeline." },
    { q: "Do you work with GitLab as well as GitHub?", a: "Yes. The review covers GitHub or GitLab, and the cloud side focuses on AWS." },
    { q: "Do you need access to production?", a: "No. The review works from read-only access to your repositories, pipelines and cloud configuration wherever possible." },
    { q: "What do we get at the end?", a: "You get a written report with each finding ranked blocking, should-fix or low, a prioritised plan, and a walkthrough session with your team." },
  ],
  "platform-setup/": [
    { q: "What does a delivery platform setup include?", a: "It includes shared CI/CD pipelines, protection for your main branches and releases, automatic dependency updates, and short-lived OIDC access from your pipelines to AWS, built in your own repositories." },
    { q: "Do you work with GitLab as well as GitHub?", a: "Yes. On GitLab we build CI/CD components, protected branches with merge request approvals, and OIDC from GitLab to AWS. On GitHub we build reusable workflows and rulesets." },
    { q: "What happens after the handover?", a: "Your team owns and runs everything from the handover. There is no retainer or support contract, and nothing that depends on us." },
    { q: "Do you replace our cloud access keys?", a: "Yes. Pipelines get short-lived credentials through OIDC, with each pipeline's access scoped to what it needs, so long-lived keys can be removed." },
  ],
  "ai-code-review/": [
    { q: "Which AI do you use for code review?", a: "We use Anthropic's Claude, running in your own CI with your own Anthropic account and key." },
    { q: "Can the AI approve or merge changes?", a: "No. Review is comment-only. A person remains the reviewer of record and approves every change." },
    { q: "Does it work on GitLab?", a: "Yes, through the Claude Code GitLab CI/CD integration, which is currently in beta and maintained by GitLab. On GitHub it uses Anthropic's official action." },
    { q: "How are costs controlled?", a: "Each review has a timeout and a turn limit, and the API key has a monthly spend limit. Anthropic bills your own account, so you see every cost directly." },
  ],
};
