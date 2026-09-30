---
title: Why every action in our pipelines is pinned to a commit
description: A tag on a GitHub Action can be moved to different code at any time. Here is how we pin every action to a commit, enforce it, and still stay up to date.
date: 2026-09-30
tags: [github-actions, supply-chain]
---

When a workflow says `uses: some-owner/some-action@v4`, it trusts whoever controls that repository to keep `v4` pointing at safe code. A tag is only a label. Anyone who can push to the action's repository, including an attacker who has stolen a maintainer's token, can move it. The next time your workflow runs, it runs the new code, with whatever secrets and permissions the job has.

This has happened in real attacks on popular actions. Workflows that referenced a tag picked up malicious code without any change on their side. Workflows that referenced a full commit SHA did not.

## Pin to the commit

A full commit SHA cannot be moved. It names exactly one tree of files, so the code you reviewed is the code that runs. We keep the version in a comment next to it, so people can still read it:

```yaml
uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
```

We do this for every action, including GitHub's own, and for reusable workflows called from other repositories. Our [zizmor configuration](https://github.com/leat-consulting/platform-workflows/blob/1580c16870f66b71da005ccf146c2eaf8fb91c20/zizmor.yml) sets the pinning policy to require a hash for every `uses:`, and the security scan fails any pull request that adds a tag reference.

## Enforce it, not just lint it

A linter only catches what it scans. GitHub now lets an organisation refuse to run any action that is not pinned to a full SHA, and we have that switched on. Together with an allowlist of which actions may run at all, it means an unpinned reference fails before the job starts, in any repository, whether or not the scan ran. Both settings are recorded in our [governance definitions](https://github.com/leat-consulting/platform-workflows/blob/1580c16870f66b71da005ccf146c2eaf8fb91c20/governance/actions-policy.json), and a drift check reports if anyone changes them.

## Stay current without trusting tags

Pinning only helps if the pins are kept up to date, otherwise you trade one risk for another. Dependabot opens a pull request when a pinned action has a new release, updating both the SHA and the version comment. We set a seven-day cooldown, so a release has been public for a week before we are offered it, which gives others time to spot a malicious release before we adopt it.

Each update then goes through the same checks and review as any other change. The version bump is small, visible and deliberate.

## Where we go further

Some tools are single binaries that happen to be wrapped in an action. For those, such as our secret and vulnerability scanners, we download the release binary directly and check it against a SHA-256 checksum recorded in the workflow. That removes the action wrapper, and the repository behind it, from what we have to trust.

The same thinking applies to our own workflows. Callers pin [platform-workflows](https://github.com/leat-consulting/platform-workflows) by commit rather than by a moving `v1` tag, and our releases are immutable, so a published version can never be changed underneath anyone.
