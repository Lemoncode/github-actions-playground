# Creating a reusable workflow

What we're going to do is create a reusable Node build process.

* Create `.github/workflows/reusable-node-build.yml`

```yml
name: Reusable Node Build 

on: 
  workflow_call:
    inputs:
      node-version: 
        required: true
        type: number
      working-directory:
        required: true
        type: string
```

We're feeding two inputs, `node-version` that we will use to handle the desired Node version, and `working-directory`, that will be very pretty handy for us, but maybe we can make this more generic and make this field optional.

Now we can create the jobs:

```yml
# diff #
jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with: 
          node-version: ${{ inputs.node-version }}
          cache: 'npm'
          cache-dependency-path: ${{ inputs.working-directory }}/package-lock.json
      - name: build 
        working-directory: ${{ inputs.working-directory }}
        run: |
          npm ci 
          npm run build --if-present
      - uses: actions/upload-artifact@v3 
        with:
          name: build-code
          path: ${{ inputs.working-directory }}/dist/
# diff #
```

Now we're going to consume it on `.github/workflows/cd-docker.yml`

```diff
name: Docker Image hangman API CD

on:
  workflow_dispatch:

jobs:
  build:
+   uses: ./.github/workflows/reusable-node-build.yml
+   with:
+     node-version: 16
+     working-directory: hangman-api
-     runs-on: ubuntu-latest

-     steps:
-       - uses: actions/checkout@v3
-       - uses: actions/setup-node@v3
-         with: 
-           node-version: 16
-           cache: 'npm'
-           cache-dependency-path: hangman-api/package-lock.json
-         - name: build
-           working-directory: ./hangman-api
-           run: |
-             npm ci 
-             npm run build --if-present
-         - uses: actions/upload-artifact@v3 
-           with:
-             name: build-code
-             path: hangman-api/dist/
```

Push the new changes

```bash
git add .
git commit -m "added workflow call"
git push
```

And we can give it a try from GitHub site.
