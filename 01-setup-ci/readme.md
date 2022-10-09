# Set Up CI

In this demo we're going to set up the basic CI for backend API project. First of all if we visit `Actions` in our project, and there's no one setting up yet, we can find many recipes depending on the type of technology, for example `Deployment to Amazon ECS` or  `Deployment to Azure`.

In our case we're going to set up CI for a Node.js project. Let's start by creating a new file on root of the project:

* Create `.github/workflows/ci.yml`

```bash
mkdir -p .gitub/workflows
touch .gitub/workflows/ci.yml
```

```yaml
name: CI 

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  audit:
    runs-on: ubuntu-latest

    steps:
      - name: inspect
        run: |
          ls -al
          whoami
          pwd
          node -v


```

Let's commit this file to a new branch:

```bash
git checkout -b added-basic-workflow
git push -u origin added-basic-workflow
git add .
git commit -m "added ci file"
git push
```

Now if we move to GitHub web site, we will find a message to create a new pull request. Let's click on `Compare & pull request`. Now click on `Create pull request`.

We can see that a new action starts, and by default is going to check if CI process has succeded before allow us to merge this branch into main branch.

> The workflow is triggered by `pull_request` event. 

If we open the action job audit from website and have a look into the steps, we can notice a couple of things:

```
drwxr-xr-x 2 runner docker 4096 Oct  9 18:03 .
drwxr-xr-x 3 runner docker 4096 Oct  9 18:03 ..
runner
/home/runner/work/github-actions-playground/github-actions-playground
v16.17.1
```

* Node is already installed
* Our user is runner
* There's no contents inside the current directory.

Let's solve this by getting the code into workflow context.

* Update `ci.yml`

```diff
name: CI 

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  audit:
    runs-on: ubuntu-latest

    steps:
+     - uses: actions/checkout@v3
      - name: inspect
        run: |
          ls -al
          whoami
          pwd
          node -v

```

Recall that on job steps we can use and action or run a command, here we're using an action `actions/checkout@v3`, that no needs further configuration.

```bash
git add .
git commit -m "added checkout"
git push
```
