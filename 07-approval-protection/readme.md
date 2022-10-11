# Approval Protection

* Branch protections
* Required reviews
* Obvious approvals

These last three remaining items don't really belong in a code, build, and test pipeline because they have more to do with the processes that involve human interaction rather than build and test automation. 

However, configuration as code is important, and improving how you automate and version control your configurations is going to be key in how you are able to scale and innovate moving forward. So because of this, GitHub Actions allow you to run multiple workflows for different event triggers, which allow you to create separate workflow files within the same project repository. So let's create a new approval workflow to satisfy the remaining items on our list.

Let's start by updating the `ci.yml` trigger events

```yml
name: CI 

on:
  push:
    branches: [ main ]
    
  pull_request:
    branches: [ main ]
```

```bash
git add .
git commit -m "back to original triggers"
git push
```

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

Once the push is completed, let's navigate back to the Code tab of our repository on GitHub. 

GitHub now notices that we've recently pushed up a new branch to our project with a helpful prompt to then create a pull request as a common next step. But for now, let's hold off on creating a pull request from this branch and let's add a workflow file to it. 

The file that is being introduced to this branch is an `automation.md` file. This is just a markdown file with the list of the items that we need to be checked off. We haven't added a new workflow file to this branch as of yet, so let's do that right now. 

Even though we just pushed up a new branch, we're still on the default main branch. 

So let's switch to the **team‑workflow branch** on GitHub by clicking on the branch drop‑down button below the Code tab and selecting our **team‑workflow branch**. 

> TODO: Add image 01

Now that we're working on our new branch, let's add a new workflow file by navigating to the `.github/workflows` folder and creating a new file called `approval‑workflow.yml`. 

* Create `.github/workflows/approval-workflow.yml`

> TODO: Add image 02

* Submit the file from GitHub site.

> TODO: Add image 03

And returning to the Code tab, let's click on the prompt to create the pull request from this branch. 

* Create a new pull request from tab code

Now it's worth mentioning that after a period of time, this pull request prompt will disappear so it doesn't persist if you intend to push up a branch, but not open up a pull request right away. So if the prompt doesn't show or it disappears, you can always navigate to the Pull requests tab and then create your pull requests from there. 

* Let's give our pull request with:
    * PR title - *"Approval Workflow"*
    * PR body - *"This pull request adds an approval workflow to the project"*
    * Create PR

Notice that although we don't have anything other than a name in our workflow file, our CI checks are running from our previous workflow. 

Since we merged those changes to our main branch and, in our previous workflow, our event triggers are a push to main or a pull request into main, our CI checks will run, which is why we're seeing them here. So this is running exactly as expected.

Workflows can be configured to run by using events from GitHub, such as event webhooks. This is what we did in our workflow file with configuring it to run on a push or a pull request event. You can also configure it to run at a scheduled time with scheduled events or when an event outside of GitHub occurs with `repository_dispatch`.

Now for a review‑type workflow, we want to engage with human interaction and reviews.

* Update `apprval-workflow.yml`

```yml
name: Team approval workflow
# diff #
on:
  - pull_request_review
# diff #
```

```bash
git add .
git commit -m "triggers on pull request review"
git push
```

> Our approval workflow will now initiate when a pull request review occurs.

What we're going to do next is add an approved label when the PR is approved. Now let's add a new job:

* Update `apprval-workflow.yml`

```yml
name: Team approval workflow

on:
  - pull_request_review
# diff #
jobs:
  label-when-approved:
    runs-on: ubuntu-latest
# diff #
```

```bash
git add .
git commit -m "added trigger event"
```

Let's use a community‑created action for a next step. So let's navigate to the GitHub Marketplace at [github.com/marketplace](https://github.com/marketplace). 

From here, we can search for community actions from the search bar or by narrowing our search by selecting actions on the left sidebar and then searching for the action that you want. Let's search for the action *label approved pull requests*.

* [Label approved pull request](https://github.com/marketplace/actions/label-approved-pull-requests)

This action will apply a label of our choosing to a pull request that reaches a specified number of approvals. With the use of this action, when a pull request is approved, it will automate the process of applying this label to the pull request. And at the top of this page, you can copy the necessary code snippet on the latest version of this action that we will then need to add to our workflow file. 

* Update `.github/workflows/approval-workflow.yml`

```yml
jobs:
  label-when-approved:
    runs-on: ubuntu-latest
    # diff #
    steps:
      - name: Label approved pull requests
        uses: abinoda/label-when-approved-action@1.0.5
        env: 
          APPROVALS: "1"
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          ADD_LABEL: "approved"
    # diff #     
```

As a side note, if we have another action that applies, let's say, a needs review label to a new pull request, we could add another environment variable, such as `remove_label` as the key and then the name of the label as the value that would be removed when this action is validated. Now let's commit these changes.

```bash
git add .
git commit 
```




