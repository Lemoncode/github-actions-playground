# Running Multiple Jobs

In this demo we will set up multiple jobs in the same workflow. By now we're running a single job that is doing the the build and also is running the unit tests, let's split it into two different jobs.

Let's merge the previous pull request `added-basic-workflow`, and create a new branch.

* Visit the project page and merge `added-basic-workflow` and delete it.

```bash
git checkout main
git branch -d added-basic-workflow
```

* Create a new branch `fix-test`

```bash
git checkout -b fix-test
git push -u origin fix-test
```

* Update `ci.yml`

```diff
name: CI 

on:
  push:
    branches: [ main ]
    paths: [ 'hangman-api/**' ]
  pull_request:
    branches: [ main ]
    paths: [ 'hangman-api/**' ]

jobs:
  build-test:
    runs-on: ubuntu-latest

-   strategy:
-     matrix:
-       node-version: [14.x, 15.x, 16.x]

    steps:
      - uses: actions/checkout@v3
-     - name: Setup Node.js environment
-       uses: actions/setup-node@v3
-       with:
-         node-version: ${{ matrix.node-version }}
      - name: build and test
        working-directory: ./hangman-api
        run: |
          npm ci 
          npm run build --if-present
          ls ./dist
          npm test

```

We have removed the matrix to reduce the number of running workflows.Now lets remove the test step and rename the job:

```diff
jobs:
- # build-test:
+ build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
-     - name: build and test
+     - name: build
        working-directory: ./hangman-api
        run: |
          npm ci 
          npm run build --if-present
-         ls ./dist
-         npm test

```

Now we're ready to add the `test` job:

```yaml
name: CI 

on:
  push:
    branches: [ main ]
    paths: [ 'hangman-api/**' ]
  pull_request:
    branches: [ main ]
    paths: [ 'hangman-api/**' ]

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
  test:
    runs-on: ubuntu-latest

    steps: 
      - uses: actions/checkout@v3 
      - name: test
        working-directory: ./hangman-api
        run: |
          npm ci 
          npm test
   # diff #
```

Let's push our changes 

```bash
git add .
git commit -m "added new job"
git push
```

* Let's update `hangman-api/src/services/word-provider.service.spec.ts` and breake the test:

```diff
    .......
    // Act
    const selectedWord = selectWord();
+   expect(true).toBe(false);
    expect(selectedWord.categoryIndex).toBeLessThanOrEqual(categoryLength - 1);
    expect(selectedWord.wordIndex).toBeLessThanOrEqual(categories[selectedWord.categoryIndex].words.length - 1);
  });
});
```

And create a new pull request and recall to push the changes with the broken test:

```bash
git add .
git commit -m "added broken test"
git push
```

Now if we visit, the pull request page, we can check that the test job has failed and we can navigate to the details. And we can check the exact line where the test has failed lets fixed:

* Update `hangman-api/src/services/word-provider.service.spec.ts`:

```diff
    .......
    // Act
    const selectedWord = selectWord();
-   expect(true).toBe(false);
    expect(selectedWord.categoryIndex).toBeLessThanOrEqual(categoryLength - 1);
    expect(selectedWord.wordIndex).toBeLessThanOrEqual(categories[selectedWord.categoryIndex].words.length - 1);
  });
});
```

```bash
git add .
git commit -m "fixed broken test"
git push
```

Check the results on GitHub page and for last merge into main, and delete current branch:

* Merge `fix-test` and delete on portal
* Delete it locally

```bash
git checkout main
git pull 
git branch -d fix-test
```
