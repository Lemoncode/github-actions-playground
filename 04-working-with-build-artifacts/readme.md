# Working with Build Artifacts

In this demo we're going to use build artifacts to reuse data, that is already done by other job on workflow.

If we have a look in our current workflow, we're executing the build and test job, on parallel, this is the default behaviour forjobs. Because of this we're stalling dependencies twice, let's try to reuse these dependencies on test job.

First of all, we're going to do the updates on `main` branch, at last we're on a demo and we can take some licenses 😈. 

* Update `ci.yml`

```diff
name: CI 

on:
- push:
-   branches: [ main ]
-   paths: [ 'hangman-api/**' ]
+ workflow_dispatch:
    
  pull_request:
    branches: [ main ]
    paths: [ 'hangman-api/**' ]
```

```bash
git add .
git commit -m "set up manual dispatch"
git push
```

Now if we visit the `Actions` tab and select `CI`, we have and option to run it manually. That's perfect for us, right now, when we get the results that we want, we will back and change it again.

To work with artifacts, we're going to use [Upload Build Artifact](https://github.com/marketplace/actions/upload-a-build-artifact)

* Update `ci.yml`

```yml
jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - name: build
        working-directory: ./hangman-api
        run: |
          npm ci 
          npm run build --if-present
      # diff #
      - uses: actions/upload-artifact@v3
        with: 
          name: dependencies
          path: hangman-api/node_modules/
      # diff #
```

We're creating an artifact `dependencies`, and we're grabbing the content for this artifact from `node_modules`

Now we need the simmetric operation [Download a Build Artifact](https://github.com/marketplace/actions/download-a-build-artifact)


* Update `ci.yml`

```yml
jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - name: build
        working-directory: ./hangman-api
        run: |
          npm ci 
          npm run build --if-present
      - uses: actions/upload-artifact@v3
        with: 
          name: dependencies
          path: hangman-api/node_modules/

  test:
    runs-on: ubuntu-latest
    # diff #
    needs: build
    # diff #
    
    steps: 
      - uses: actions/checkout@v3
      # diff #
      - uses: actions/download-artifact@v3.0.0
        with: 
          name: dependencies
          path: hangman-api/node_modules
      # diff #
      - name: test
        working-directory: ./hangman-api
        run: |
          npm ci 
          npm test
```

* We have added `needs: build`, since this job depends now on the artifact generated on build job.

Lets try it 

```bash
git add .
git commit -m "added artifacts"
git push
```

And trigger from project site

If we check the workflow, we will notice that is taking a long time to resolve the dependencies upload. This is not the way to manage this, let's try something different.

* [Caching dependencies to speed up workflows](https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows)

* [Caching global packages data](https://github.com/actions/setup-node#caching-global-packages-data)

```diff
jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
+     - uses: actions/setup-node@v3
+       with: 
+         node-version: 16
+         cache: 'npm'
+         cache-dependency-path: hangman-api/package-lock.json
      - name: build
        working-directory: ./hangman-api
        run: |
          npm ci 
          npm run build --if-present
-     - uses: actions/upload-artifact@v3
-       with: 
-         name: dependencies
-         path: hangman-api/node_modules/

  test:
    runs-on: ubuntu-latest
    needs: build

    steps: 
      - uses: actions/checkout@v3
-     - uses: actions/download-artifact@v3.0.0
-       with: 
-         name: dependencies
-         path: hangman-api/node_modules
+     - uses: actions/setup-node@v3
+       with:
+         node-version: 16
      - name: test
        working-directory: ./hangman-api
        run: |
          npm ci 
          npm test
```
