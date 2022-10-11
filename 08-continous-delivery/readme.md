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

```bash
docker build -t test -f Dockerfile.workflow .
```

## Reference

* [What is Continous Delivery?](https://aws.amazon.com/devops/continuous-delivery/)
