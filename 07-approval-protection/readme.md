# Approval Protection

* Branch protections
* Required reviews
* Obvious approvals

These last three remaining items don't really belong in a code, build, and test pipeline because they have more to do with the processes that involve human interaction rather than build and test automation. 

However, configuration as code is important, and improving how you automate and version control your configurations is going to be key in how you are able to scale and innovate moving forward. So because of this, GitHub Actions allow you to run multiple workflows for different event triggers, which allow you to create separate workflow files within the same project repository. So let's create a new approval workflow to satisfy the remaining items on our list.

Let's start by creating a new branch

```bash
git checkout -b team-workflow
git push -u origin team-workflow
```

Let's create a simple `markdown` that recall us the automation process goals.

* Create `automation.md` om root project:

```
# Automation Goals

* Branch protections
* Required reviews
* Obvious approvals
```

```bash
git add .
git commit -m "added automation notes"
git push
```
