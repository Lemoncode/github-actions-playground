# Exercises

## Exercise 1. Create CI workflow for frontend project

Copy the directory `.start-code/hangman-front` into root project. Once that you have done create a new workflow, that triggers on new pull request, and executes the folling operations:

* Build the frontend project
* Runs the unit tests

## Exercise 2. Create CD workflow for frontend project

Create a new workflow that triggers manually that creates a new Docker Image and push it to [Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)

## Exercise 3. Create a workflow that runs e2e tests

Create a workflow that triggers as you wish that runs e2e tests using [Docker Compose](https://docs.docker.com/compose/gettingstarted/) or [Cypress action](https://github.com/cypress-io/github-action).

* Extra
  * Notice that we have two spec suits on e2e project. Can you figure out a way to run them on parallel without copy/pasting the same spec twice?

## Exercise 4. Create a Custom JavaScript action

* Create a custom javascript action that triggers on `issue` when are labeled with `motivate`, the action when runs prints on conosole workflow a motivational quote. You can use the following [free api](https://type.fit) for this.

```bash
curl https://type.fit/api/quotes
```

* [actions/javascript-action](https://github.com/actions/javascript-action)
* [https://github.com/actions/typescript-action](https://github.com/actions/typescript-action)
