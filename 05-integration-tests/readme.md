# Integration Tests

If we have a look into our code, we notice that our integration tests are not running.

A fair question is how can we implement this. Because we have to deal with the database dependency to run this kind of tests. One quick option that could work on our machines and on the GitHub Workflow machine is to use `docker-compose`. Yes, `Docker` and `Docker Compose` are already installed, so let's go ahead.

First we are going to implement this locally. `Docker Compose`, deals with services, and services are containers that are going to be located on private `Docker Network`, so our first step will be create a `Docker Image` that contains everything to run these tests.

* Create `hangman-api/Dockerfile.test-integration`

```Dockerfile
FROM node:alpine 

WORKDIR /opt/app

COPY ./src ./src

COPY ./package.json ./package.json

COPY ./package-lock.json ./package-lock.json

COPY ./jest.config.integration.js ./jest.config.integration.js

COPY ./tsconfig.json ./tsconfig.json

RUN npm ci 

CMD [ "npm", "run", "test:integration" ]
```

Now we can go ahead and set up the Docker Compose that will use this. Let's create `test-integration.yml`.

> We're using a meaningful name here, instead the default one.

```yml
version: "3.9"

networks:
  integration-tests:
    driver: bridge

services:
  postgres:
    image: postgres:14-alpine
    container_name: postgres 
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: hangman_db
    networks:
      - integration-tests
    
```

Here we're declaring the database service, because we're feeding `POSTGRES_DB: hangman_db`, the default database that will be created will be `hangman_db` instead of `postgres`, that's ok for us.

Now in order to make that our tests can run, we need the expected schemas. Recall that we have migrations in this project, so let's create another Dockerfile for that specific purpose:

* Create `Dockerfile.migrations`

```Dockerfile
FROM node:16-bullseye

WORKDIR /opt/app

COPY ./db/migrations ./db/migrations 

COPY ./knexfile.js ./knexfile.js

RUN npm init -y 

RUN npm install knex pg dotenv
```

For simplicity we're creating the manifest file in line (last command in the above Dockerfile). This is ok here, because we're on demo time, but be aware that we could easily misalign dependencies.

Ok good, now we can add a new service to initialize our schemas:

* Update `test-integration.yml`

```yml
version: "3.9"

networks:
  integration-tests:
    driver: bridge

services:
  postgres:
    image: postgres:14-alpine
    container_name: postgres 
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: hangman_db
    networks:
      - integration-tests
  # diff #
  build-db-relationships:
    container_name: build-db-relationships 
    build:
      context: .
      dockerfile: Dockerfile.migrations 
    environment:
      DATABASE_PORT: 5432
      DATABASE_HOST: postgres
      DATABASE_NAME: hangman_db
      DATABASE_USER: postgres
      DATABASE_PASSWORD: postgres
      DATABASE_POOL_MIN: 2
      DATABASE_POOL_MAX: 10
    depends_on:
      - postgres 
    command:
      [
        "./node_modules/knex/bin/cli.js",
        "migrate:latest",
      ]
    networks:
      - integration-tests
   # diff #
```

We can run locally by using:

```bash
docker compose -f test-integration.yml up --force-recreate --exit-code-from build-db-relationships
```

If we run this, we will find that our service `build-db-relationships` is unable to find the postgres database:

```output
build-db-relationships  | Using environment: development
build-db-relationships  | getaddrinfo ENOTFOUND postgres
build-db-relationships  | Error: getaddrinfo ENOTFOUND postgres
build-db-relationships  |     at GetAddrInfoReqWrap.onlookup [as oncomplete] (node:dns:107:26)
```

This is happening because the container is ready, but the database server is not. Let's fix it by adding [wait for it](https://github.com/vishnubob/wait-for-it).

* Copy the file on root project.

To set up everything again let's start by cleaning our current infrastructure:

```bash
docker compose -f test-integration.yml down --remove-orphans -v --rmi local
```

Now, we have to add this new file to our integration service:

* Update `Dockerfile.migrations`

```diff
FROM node:16-buster

WORKDIR /opt/app

COPY ./db/migrations ./db/migrations 

COPY ./knexfile.js ./knexfile.js

+ COPY ./wait-for-it.sh ./wait-for-it.sh

+ RUN chmod +x wait-for-it.sh

RUN npm init -y 

RUN npm install knex pg dotenv

```

* Update `test-integration.yml`

```diff
    ......
    depends_on:
      - postgres 
    command:
      [
+       "./wait-for-it.sh",
+       "postgres:5432",
+       "--strict",
+       "--timeout=300",
+       "--",
        "./node_modules/knex/bin/cli.js",
        "migrate:latest",
      ]
    networks:
      - integration-tests
```

Let's give it a try:

```bash
docker compose -f test-integration.yml up --force-recreate --exit-code-from build-db-relationships
```

Cool, now it works, for last. Now the last part of the puzzle:

```bash
docker compose -f test-integration.yml down --remove-orphans -v --rmi local
```

* Update `test-integration.yml`

```yml
 # diff #
 test-integration:
    container_name: test-integration 
    build: 
      context: .
      dockerfile: Dockerfile.test-integration
    environment:
      DATABASE_PORT: 5432
      DATABASE_HOST: postgres
      DATABASE_NAME: hangman_db
      DATABASE_USER: postgres
      DATABASE_PASSWORD: postgres
      DATABASE_POOL_MIN: 2
      DATABASE_POOL_MAX: 10
    depends_on:
      - postgres 
      - build-db-relationships
    networks:
      - integration-tests
  # diff #
```

```bash
docker compose -f test-integration.yml run test-integration
```

```output
Use 'docker scan' to run Snyk tests against images to find vulnerabilities and learn how to fix them

> hangman-api@1.0.0 pretest:integration
> jest --clearCache

Cleared /tmp/jest_0

> hangman-api@1.0.0 test:integration
> jest --detectOpenHandles --config=jest.config.integration.js -i

 PASS  src/dals/games/game.dal.test.ts (8.089 s)
  game.dal
    getGames
      ✓ returns the games related to a player (408 ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        8.676 s
Ran all test suites.
```

> Exercise: Update CI pipeline to run test integration using docker compose.

```yaml
test-integration:
    runs-on: ubuntu-latest
    needs: test

    services:
      postgres:
        image: postgres:14-alpine
        env: 
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: hangman_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    steps:
      - name: Checkout
        uses: actions/checkout@v6
      - name: Setup Node version
        uses: actions/setup-node@v6
        with:
          node-version: 20
      - name: Running integration test
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
          npm run test:integration
```
