# Contenaraized Containers

The previous solution for integration test works, but have some downsides.

* We have added to our solution explicit files to run the integration tests:
    - wait-for-it.sh
    - test-integration.yml
    - Dockerfile.migrations
    - Dockerfile.test-integration

This code is not related with our solution, is just there to solve the CI issue. Well is not the end of the world, but is thera another way that we can solve this? Lets introduce [Containerized containers](https://docs.github.com/en/actions/using-containerized-services/about-service-containers)

> **About service containers** - Service containers are Docker containers that provide a simple and portable way for you to host services that you might need to test or operate your application in a workflow. For example, your workflow might need to run integration tests that require access to a database and memory cache.

Let's start by adding a new job, that declares a `postgres` database server:

* Update `ci.yml`

```yml
# diff #
  test-integration:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:14-alpine
        env:
          POSTGRES_USER: postgres  
          POSTGRES_PASSWORD: postgres  
          POSTGRES_DB: hangman_db
        # Set health checks to wait until postgres has started
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
# diff #
```

Now, before running the integration tests, we need to setup the schemas:

```yml
  steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
        with:
        node-version: 16
    - name: Create database relationships
        working-directory: ./hangman-api
        env:
          DATABASE_PORT: 5432
          DATABASE_HOST: localhost
          DATABASE_NAME: hangman_db
          DATABASE_USER: postgres
          DATABASE_PASSWORD: postgres
          DATABASE_POOL_MIN: 2
          DATABASE_POOL_MAX: 10
        run: |
          npm ci 
          npx knex migrate:latest --env development
```

* Push new changes

```bash
git add .
git commit -m "added database relationships step"
git push
```

* Run the workflow manually from GiHub website.


If everything goes right we must see and output as follows:

```
found 0 vulnerabilities
Using environment: development
Batch 1 run: 1 migrations
```

Ok let's rename and add the instructions to run our integration tests:

```diff
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 16
-     - name: Create database relationships
+     - name: Running integration tests 
        working-directory: ./hangman-api
        env:
          DATABASE_PORT: 5432
          DATABASE_HOST: localhost
          DATABASE_NAME: hangman_db
          DATABASE_USER: postgres
          DATABASE_PASSWORD: postgres
          DATABASE_POOL_MIN: 2
          DATABASE_POOL_MAX: 10
        run: |
          npm ci 
          npx knex migrate:latest --env development
+         npm run test:integration
```

* Push new changes

```bash
git add .
git commit -m "added integration test instruction"
git push
```

* Run the workflow manually from GiHub website.


If everything goes right we must see and output as follows:
