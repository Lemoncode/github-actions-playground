# Working with Build Artifacts

In this demo we're going to use build artifacts to reuse data, that is laready done by other job on workflow.

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
