# Continous Delivery

* In this demo, upload images to Docker Hub.

After achieve CI, the next step is get the new changes in our code and prepare them to get into production. In our case we're going to create a new image and push it to a Docker Registry, we're goingto use Docker Hub, but any other registry or any other artifactory will be analogus.

## Pre requisites

* Docker or Docker Desktop installed 
* Docker Hub account

## Building the Docker Image Locally

Before adding the required steps into our workflow, let's try it on local. 

First from `hangman-api` root directory run:

```bash
docker build -t jaimesalas/hangman-api .
```

And test by running:

```bash
docker run -d -p 3000:3000 jaimesalas/hangman-api
```

```bash
curl localhost:3000/api/topics
```

Now before we move into our pipeline and add the delivery job, let's have a look into our Dockerfile

```Dockerfile
#------------------------------------------------------------------------------
# -- builder
#------------------------------------------------------------------------------
FROM node:lts-alpine as builder

WORKDIR /app
COPY . .

RUN npm ci
RUN npm run build

#------------------------------------------------------------------------------
# -- app
#------------------------------------------------------------------------------
FROM node:lts-alpine as app

WORKDIR /app
COPY --from=builder /app/dist .
COPY package.json .
COPY package-lock.json .

ENV NODE_ENV=production

RUN npm install


CMD ["npm", "start"]

```

Notice the first part of this `Dockerfile`, is doing exctly the same as what we're already doing in our build job. It wouldn't be nice that we can use the built job here? Let's give a try.

* Create `Dockerfile.workflow`

```Dockerfile
ARG source
FROM node:lts-alpine as app

WORKDIR /app
COPY dist/ .
COPY package.json .
COPY package-lock.json .

ENV NODE_ENV=production

RUN npm install


CMD ["npm", "start"]

```

* For simplicity, we're going to create a new workflow from `main`

First we're going to use the same build job as the one on `ci.yml`, but here we're going to upload the build in orther to be used on a new `delivery` job:

* Create `.github/workflows/cd-docker.yml`

```yml
name: Docker Image API

on:
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with: 
          node-version: 16
          cache: 'npm'
          cache-dependency-path: hangman-api/package-lock.json
      - name: build
        working-directory: ./hangman-api
        run: |
          npm ci 
          npm run build --if-present
      - uses: actions/upload-artifact@v3 
        with:
          name: build-code
          path: hangman-api/dist/
```

Now we need to build the image before push it to Docker registry we can do this as follows:

```yml
  # diff #
  delivery:
    
    runs-on: ubuntu-latest
    needs: build

    steps:
    - uses: actions/checkout@v3
    - uses: actions/download-artifact@v3
      with:
        name: build-code
        path: hangman-api/dist/
    - name: Build the Docker image
      working-directory: ./hangman-api
      run: docker build . --file Dockerfile.workflow --tag my-image-name:$(date +%s)
  # diff #
```

Ok, almost done, there are prebaked actions to authenticate and push Docker images, but in this case we're going to use a run command. But first of all I need to create a new secret to authenticate my self against Docker Hub.

> TODO: Add image

```diff
-   - name: Build the Docker Image
+   - name: Build and Push Docker Image
      working-directory: ./hangman-api
+     env:
+       DOCKER_USER: "jaimesalas"
+       DOCKER_REPOSITORY: "hangman-api"
+       DOCKER_PASSWORD: ${{ secrets.DOCKER_PASSWORD }}
-     run: docker build . --file Dockerfile.workflow --tag my-image-name:$(date +%s)
```

And add the multiline run operation

```yml
run: | 
  echo $DOCKER_PASSWORD | docker login --username $DOCKER_USER --password-stdin
  image=$DOCKER_USER/$DOCKER_REPOSITORY:$(date +%s)
  docker build . --file Dockerfile.workflow --tag $image
  docker push $image
```

## Reference

* [What is Continous Delivery?](https://aws.amazon.com/devops/continuous-delivery/)
* [Trigger a workflow from another workflow](https://github.com/orgs/community/discussions/26294)
* [Repository dispatch](https://github.com/peter-evans/repository-dispatch)
