# Set Up CI

In this demo we're going to set up the basic CI for backend API project. First of all if we visit `Actions` in our project, and there's no one setting up yet, we can find many recipes depending on the type of technology, for example `Deployment to Amazon ECS` or  `Deployment to Azure`.

In our case we're going to set up CI for a Node.js project. Let's start by creating a new file on root of the project:

* Create `.github/workflows/ci.yml`

```bash
mkdir -p .github/workflows
touch .github/workflows/ci.yml
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
      - name: Inspect machine
        run: |
          ls -al
          whoami
          pwd
          node -v
```

Let's commit this file to a new branch:

```bash
git checkout -b add-basic-workflow
git push -u origin add-basic-workflow
git add .
git commit -m "added ci workflow file"
git push
```

Now if we move to GitHub web site, we will find a message to create a new pull request. Let's click on `Compare & pull request`. Now click on `Create pull request`.

We can see that a new action starts, and by default is going to check if CI process has succeded before allow us to merge this branch into main branch.

> The workflow is triggered by `pull_request` event.

If we open the action job audit from website and have a look into the steps, we can notice a couple of things:

```bash
drwxr-xr-x 2 runner docker 4096 Oct  9 18:03 .
drwxr-xr-x 3 runner docker 4096 Oct  9 18:03 ..
runner
/home/runner/work/github-actions-playground/github-actions-playground
v16.17.1
```

* There's no contents inside the current directory.
* Our user is runner
* Node is already installed

Now, let's get the code into workflow context.

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
+     - name: Checkout # This field is optional
+     - uses: actions/checkout@v6
      - name: inspect
        run: |
          ls -al
          whoami
          pwd
          node -v

```

Recall that on job steps we can use an action or run a command. Here we're using an action `actions/checkout@v6` that needs no further configuration.

```bash
git add .
git commit -m "added checkout"
git push
```

Now if we go back to the last action job, we will find out that our code has been download:

```bash
total 44
drwxr-xr-x 11 runner docker 4096 Oct  9 18:17 .
drwxr-xr-x  3 runner docker 4096 Oct  9 18:17 ..
drwxr-xr-x  8 runner docker 4096 Oct  9 18:17 .git
drwxr-xr-x  3 runner docker 4096 Oct  9 18:17 .github
drwxr-xr-x  4 runner docker 4096 Oct  9 18:17 .start-code
drwxr-xr-x  2 runner docker 4096 Oct  9 18:17 01-setup-ci
drwxr-xr-x  2 runner docker 4096 Oct  9 18:17 02-multiple-target-environments
drwxr-xr-x  2 runner docker 4096 Oct  9 18:17 03-running-multiple-jobs
drwxr-xr-x  2 runner docker 4096 Oct  9 18:17 04-working-with-build-artifacts
drwxr-xr-x  2 runner docker 4096 Oct  9 18:17 05-integration-tests
drwxr-xr-x  4 runner docker 4096 Oct  9 18:17 hangman-api
runner
/home/runner/work/github-actions-playground/github-actions-playground
v16.17.1
```

Really nice, but our target is that this workflow implements the CI process.

> **Continous Integration (CI)** - The process of automating the build and testing of changes when a commit is pushed to a branch.

Lets remove the current job and add new one that builds and tests our code:

```diff
name: CI 

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
-   audit:
-     runs-on: ubuntu-latest

-     steps:
-       - uses: actions/checkout@v6
-       - name: inspect
-         run: |
-           ls -al
-           whoami
-           pwd
-           node -v
```

```yaml
name: CI 

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  # diff #
  build-test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v6
      - name: build and test
        working-directory: ./hangman-api
        run: |
          npm ci
          npm run build --if-present
          ls ./dist
          npm test
   # diff #
```

```bash
git add .
git commit -m "added build and test step"
git push
```

We can check the results in actions (GitHub website). Since we're going to add more projects to the current solution, it seems a good idea that the workflow only starts if the contents of api project are updated.

* Update `ci.yml`

```diff
name: CI 

on:
  push:
    branches: [ main ]
+   paths: [ 'hangman-api/**' ]
  pull_request:
    branches: [ main ]
+   paths: [ 'hangman-api/**' ]

jobs:
  build-test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v6
      - name: build and test
        working-directory: ./hangman-api
        run: |
          npm ci 
          npm run build --if-present
          npm test
```

* With `paths` we filter the directories that are able to trigger a new workflow.

> Check the [filter pattern cheat sheet](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#filter-pattern-cheat-sheet) for a better understanding.

```bash
git add .
git commit -m "added path filter"
git push
```

If we check again 'Actions' tab, we will not see a new trigger. Why? Because the latest changes did not modify `hangman-api` folder.
