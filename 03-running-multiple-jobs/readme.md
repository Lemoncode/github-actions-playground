# Running Multiple Jobs

In this demo we will set up multiple jobs in the same workflow. By now we're running a single job that is doing the the build and also is running the unit tests, let's split it into two different jobs.

Let's merge the previous pull request, delete branch `add-basic-workflow`, and create a new branch.

* Visit the project page merge PR and delete branch `add-basic-workflow` (there will be a button to it automatically).

* In your machine, execute the following commands:

```bash
git checkout main
git branch -d add-basic-workflow
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
+   runs-on: ubuntu-latest

-   strategy:
-     matrix:
-       node-version: [16, 17, 18]
-       os: [ubuntu-20.04, ubuntu-22.04]
-   runs-on: ${{ matrix.os }}

    steps:
      - uses: actions/checkout@v4
-     - name: Setup Node.js environment
-       uses: actions/setup-node@v4
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

We have removed the matrix to reduce the number of running workflows. Now let's remove the test step and rename the job:

```diff
jobs:
- # build-test:
+ build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
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
      - uses: actions/checkout@v4
      - name: build
        working-directory: ./hangman-api
        run: |
          npm ci 
          npm run build --if-present
  # diff #
  test:
    runs-on: ubuntu-latest

    steps: 
      - uses: actions/checkout@v4
      - name: test
        working-directory: ./hangman-api
        run: |
          npm ci 
          npm test
   # diff #
```

Let's push our changes.

```bash
git add .
git commit -m "jobs split"
git push
```

* Let's update `hangman-api/src/services/word-provider.service.spec.ts` and break the test:

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

If we check the actions tab, we will see that the job is again succesful.

The last thing we want to do before merging the PR is to add a dependency between jobs: `test` will be executed after `build` job. In order to achieve this, we need to make use of option [needs](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idneeds).

* Update `ci.yml`:

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
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      - name: build
        working-directory: ./hangman-api
        run: |
          npm ci 
          npm run build --if-present

  test:
    runs-on: ubuntu-latest
+   needs: build # If it depends on more than one, use an array
    steps: 
      - uses: actions/checkout@v4
      - name: test
        working-directory: ./hangman-api
        run: |
          npm ci 
          npm test
```

Check the results on GitHub page and for last merge into main, and delete current branch:

* Merge `fix-test` and delete on portal
* Delete it locally

```bash
git checkout main
git pull 
git branch -d fix-test
```

## Extra: how to execute a job even if its dependent fail

If you would like a job to run even if a job it is dependent on did not succeed, use the `always()` conditional expression in `jobs.<job_id>.if`.

* Example: requiring successful dependent jobs

```yaml
jobs:
  job1:
  job2:
    needs: job1
  job3:
    needs: [job1, job2]
```

* Example: not requiring successful dependent jobs

```yaml
jobs:
  job1:
  job2:
    needs: job1
  job3:
    if: ${{ always() }}
    needs: [job1, job2]
```
