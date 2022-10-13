# Multiple Environments

Some times our code must run on different target versions. GitHub Actions has a feature that is pretty handy for this kind of situations `matrix strategy`.

> A `matrix strategy` lets you use variables in a single job definition to automatically create multiple job runs that are based on the combinations of the variables. For example, you can use a matrix strategy to test your code in multiple versions of a language or on multiple operating systems.

* In our case we want to test the following node versions:
    - 14.x
    - 15.x 
    - 16.x

But if you recall from previous demo, we have already installed a node version on our machine, how can we handle this?

If we visit [GitHub Actions Marketplace](https://github.com/marketplace?type=actions), we can search by **node environment** and we will find out [setup-node-js-environment](https://github.com/marketplace/actions/setup-node-js-environment), this is perfect for us.

* Let's start by adding the matrix strategy, update `cy.yml`

```yml
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
    # diff #
    strategy:
      matrix:
        node-version: [14.x, 15.x, 16.x]
    # diff #
    steps:
      - uses: actions/checkout@v3
      - name: build and test
        working-directory: ./hangman-api
        run: |
          npm ci 
          npm run build --if-present
          ls ./dist
          npm test

```

Almost there. Now let's add the new action:

```yaml
jobs:
  build-test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [14.x, 15.x, 16.x]

    steps:
      - uses: actions/checkout@v3
        # diff #
      - name: Setup Node.js environment
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
        # diff #
      - name: build and test
        working-directory: ./hangman-api
        run: |
          npm ci 
          npm run build --if-present
          ls ./dist
          npm test

```

Now let's push the new changes and see what is going on with our workflows:

```bash
git add .
git commit -m "added matrix"
git push
```

Humm... Seems that our workflow is not running, recall that we have introduce a filter per directory, to make it run, we have two options comment out the filter or add a dummy change, let's go for second:

* Update `hangman-api/src/config.ts`

```diff
import { config } from 'dotenv';

+// TODO: Use connection string
config({
  path: '.env',
});

export default {
  database: {
    isActive: process.env.DATA_BASE_ACTIVE,
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    port: +process.env.DATABASE_PORT!,
    database: process.env.DATABASE_NAME,
    poolMin: +process.env.DATABASE_POOL_MIN!,
    poolMax: +process.env.DATABASE_POOL_MAX!,
  },
};

```

```bash
git add .
git commit -m "added todo"
git push
```

Now if we check the workflow we will see three jobs each one refering a different node version.
