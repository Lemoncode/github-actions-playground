# Working with Build Artifacts

In this demo we're going to use build artifacts to reuse data, that is already done by other job on workflow.

If we have a look in our current workflow, we're executing the build and test job on parallel, which is the default behaviour for jobs. Because of this we're installing dependencies twice.Let's try to reuse these dependencies on test job.

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

To work with artifacts, we're going to use [Upload a Build Artifact](https://github.com/marketplace/actions/upload-a-build-artifact)

* Update `ci.yml`

```yml
jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v6
      - name: build
        working-directory: ./hangman-api
        run: |
          npm ci 
          npm run build --if-present
      # diff #
      - uses: actions/upload-artifact@v6
        with: 
          name: dependencies
          path: hangman-api/node_modules/
          include-hidden-files: true
      # diff #
```

We're creating an artifact `dependencies`, and we're grabbing the content for this artifact from `node_modules`

Now we need the symmetric operation: [Download a Build Artifact](https://github.com/marketplace/actions/download-a-build-artifact)

* Update `ci.yml`

```yml
jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v6
      - name: build
        working-directory: ./hangman-api
        run: |
          npm ci 
          npm run build --if-present
      - uses: actions/upload-artifact@v6
        with: 
          name: dependencies
          path: hangman-api/node_modules/
          include-hidden-files: true

  test:
    runs-on: ubuntu-latest
    needs: build
    
    steps: 
      - uses: actions/checkout@v6
      # diff
      - uses: actions/download-artifact@v7
        with: 
          name: dependencies
          path: hangman-api/node_modules
          include-hidden-files: true
      - name: test
        working-directory: ./hangman-api
        run: |
          chmod -R +x node_modules
          npm test
      # diff
```

Let's push the changes done.

```bash
git add .
git commit -m "added artifacts"
git push
```

And trigger the workflow from project site.

**DEPRECATED.** ~~If we check the workflow, we will notice that is taking a long time to resolve the dependencies upload~~. **Both actions in version 4 improve significantly the performance. Check this article: <https://github.blog/changelog/2024-04-16-deprecation-notice-v3-of-the-artifact-actions/>**.

However, this approach is not the proper way to manage this, let's try something different: using the cache.

* [Caching dependencies to speed up workflows](https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows)

* [Caching global packages data](https://github.com/actions/setup-node#caching-global-packages-data)

```diff
jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v6
+     - uses: actions/setup-node@v6
+       with: 
+         node-version: 16
+         cache: 'npm'
+         cache-dependency-path: hangman-api/package-lock.json
      - name: build
        working-directory: ./hangman-api
        run: |
          npm ci 
          npm run build --if-present
-     - uses: actions/upload-artifact@v6
-       with: 
-         name: dependencies
-         path: hangman-api/node_modules/
-         include-hidden-files: true

  test:
    runs-on: ubuntu-latest
    needs: build

    steps: 
      - uses: actions/checkout@v6
-     - uses: actions/download-artifact@v7
-       with: 
-         name: dependencies
-         path: hangman-api/node_modules
-         include-hidden-files: true
+     - uses: actions/setup-node@v6
+       with:
+         node-version: 16
      - name: test
        working-directory: ./hangman-api
        run: |
-         chmod -R +x node_modules
+         npm ci 
          npm test
```

Let's push these changes.

```bash
git add .
git commit -m "added caching for npm"
git push
```
