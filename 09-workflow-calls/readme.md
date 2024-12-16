# Workflow calls

Reusable workflows offer a simple and powerful way to avoid copying and pasting workflows across your repositories.

## How to make any GitHub Actions workflow reusable

### Step 1: Add a workflow_call trigger

A reusable workflow is just like any GitHub Actions workflow with one key difference: it includes a `workflow_call` trigger.

```yaml
on:
  workflow_call:
```

You can then reference this workflow in another workflow by adding in this syntax:

```yaml
uses:
  USER_OR_ORG_NAME/REPO_NAME/.github/workflows/REUSABLE_WORKFLOW_FILE.yml@TAG_OR_BRANCH
```

You can also pass data such as job information or passwords to a reusable workflow by using inputs and secret triggers. Inputs are used to pass non-sensitive information while secrets are used to pass along sensitive information such as passwords and credentials.

### Step 2: Make your actions accessible across your organization

After you add a `workflow_call` trigger, you need to make sure that your repositories in your organization have access to it. To do this, go to your repository settings, select **Actions**, and enable access to repositories in your organization.

## Some limitations with reusable workflows

There are [limitations](https://docs.github.com/en/actions/using-workflows/reusing-workflows#limitations). Some of them are:

* **You can't reference a reusable workflow that's in a private repository**. If you have a reusable workflow in a private repository, only other workflows in that private repository can use it.
* **Reusable workflows can't be stacked on top of one another, but there is a limit**. You can connect a maximum of four levels of workflows - that is, the top-level caller workflow and up to three levels of reusable workflows. For example: caller-workflow.yml → called-workflow-1.yml → called-workflow-2.yml → called-workflow-3.yml. Loops in the workflow tree are not permitted. More info [here](https://docs.github.com/en/actions/sharing-automations/reusing-workflows#nesting-reusable-workflows)
* **You can call a maximum of 20 unique reusable workflows from a single workflow file**. This limit includes nested/stacked reusable workflows.

## Reusable workflows vs composite actions

When we launched reusable workflows, one of the first questions we got was around how they’re different from composite actions.

For the uninitiated, composite actions enable you to combine multiple actions into a single action that you can then insert into any workflow. This means you can refactor long YAML workflow files into much smaller files—and you can also save yourself a fair amount of copying and pasting. Plus, if something like your credentials change, you won’t have to update an entire YAML file.

In practice, there are kinds of problems you can solve with either reusable workflows or a composite workflow. Both approaches have individual strengths and weaknesses. 80% of the time you can probably use either one. But 20% of the time, you’ll need to use one or the other.

For example, if your job needs to run on a specific runner or machine, you need to use reusable workflows. Composite actions don’t specify this type of thing. Composite actions are intended to be more isolated and generic.

## Key difference between reusable workflows and composite actions

| Reusable workflows                                | Composite actions                                                |
|---------------------------------------------------|------------------------------------------------------------------|
| Cannot call another reusable workflow             | Can be nested to have up to 10 composite actions in one workflow |
| Can use secrets                                   | Cannot use secrets                                               |
| Can use if: conditionals                          | Cannot use if: conditionals                                      |
| Can be stored as normal YAML files in you project | Requieres individual folders for each composite action           |
| Can use multiple jobs                             | Cannot use multiple jobs                                         |
| Each step is logged in real-time                  | Logged as one step even if contains multiple steps               |

With reusable workflows, you can have multiple jobs and that gives you a lot of more granular control—and power. They allow you to specify any number of things and customize them more to your liking.

Reusable workflows also don’t require individual folders for each workflow like composite actions do. This can make using reusable workflows simpler since you can avoid nesting a bunch of different folders like you’d need to do with composite actions.

## Creating a reusable workflow

Reusable workflows are YAML-formatted files, very similar to any other workflow file. As with other workflow files, you locate reusable workflows in the `.github/workflows` directory of a repository. Subdirectories of the `workflows` directory are not supported.

For a workflow to be reusable, the values for on must include `workflow_call:`

```yaml
on:
  workflow_call:
```

1. In the reusable workflow, use the `inputs` and `secrets` keywords to define inputs or secrets that will be passed from a caller workflow.

```yml
on:
  workflow_call:
    inputs:
      username:
        required: true
        type: string
    secrets:
      envPAT:
        required: true
```

2. In the reusable workflow, reference the input or secret that you defined in the on key in the previous step.

> Note: If the secrets are inherited by using secrets: inherit in the calling workflow, you can reference them even if they are not explicitly defined in the on key. For more information, see ["Workflow syntax for GitHub Actions."](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idsecretsinherit)

```yaml
jobs:
  reusable_workflow_job:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: octo-org/my-action@v1
        with:
          username: ${{ inputs.username }}
          token: ${{ secrets.envPAT }}
```

In the example above, `envPAT` is an environment secret that's been added to the `production` environment. This environment is therefore referenced within the job.

> Note: Environment secrets are encrypted strings that are stored in an environment that you've defined for a repository. Environment secrets are only available to workflow jobs that reference the appropriate environment. For more information, see ["Using environments for deployment."](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment#environment-secrets)

3. Pass the input or secret from the callerworkflow.

To pass named inputs to a called workflow, use the `with` keyword in a job. Use the `secrets` keyword to pass named secrets. For inputs, the data type of the input value must match the type specified in the called workflow (either boolean, number, or string).

```yaml
jobs:
  call-workflow-passing-data:
    uses: octo-org/example-repo/.github/workflows/reusable-workflow.yml@main
    with:
      username: mona
    secrets:
      envPAT: ${{ secrets.envPAT }}
```

Workflows that call reusable workflows in the same organization or enterprise can use the `inherit` keyword to implicitly pass the secrets.

```yaml
jobs:
  call-workflow-passing-data:
    uses: octo-org/example-repo/.github/workflows/reusable-workflow.yml@main
    with:
      username: mona
    secrets: inherit
```

## Calling a reusable workflow

You call a reusable workflow by using the uses keyword. Unlike when you are using actions within a workflow, you call reusable workflows directly within a job, and not from within job steps.

[jobs.<job_id>.uses](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_iduses)

You reference reusable workflow files using on of the following syntaxes:

* `{owner}/{repo}/.github/workflows/{filename}@{ref}` - reusable workflows on public repositories
* `./.github/workflows/{filename}` for reusable workflows in the same repository.

`{ref}` can be a SHA, a release tag, or a branch name. Using the commit SHA is the safest for stability and security.

You can call multiple workflows, referencing each in a separate job.

```yaml
jobs:
  call-workflow-1-in-local-repo:
    uses: octo-org/this-repo/.github/workflows/workflow-1.yml@172239021f7ba04fe7327647b213799853a9eb89
  call-workflow-2-in-local-repo:
    uses: ./.github/workflows/workflow-2.yml
  call-workflow-in-another-repo:
    uses: octo-org/another-repo/.github/workflows/workflow.yml@v1
```

## Demo: Creating a reusable workflow

[Demo: Creating a reusable workflow](01-creating-reusable-workflow/readme.md)
