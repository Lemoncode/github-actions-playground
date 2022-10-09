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

```

Let's commit this file to a new branch:

```bash
git checkout -b added-basic-workflow
git push -u origin added-basic-workflow
git add .
git commit -m "added ci file"
```
