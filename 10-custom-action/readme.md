# Custom action

In this last demo we will create a custom action and use it in a workflow.

## Steps

* Create a new **public** repository on GitHub and call it *get-commodity-price-action*. Clone it to your computer and open this repo in your editor.
* Create a new Node.js project using `npm init -y`.
* Create the action metadata file. It should be named `action.yml`.

```yaml
name: 'Get Commodity Price'
description: 'Get gold or silver current price per ounce'
inputs:
  commodity:  # id of input
    description: 'Commodity (gold or silver)'
    required: true
    default: 'gold'
outputs:
  price: # id of output
    description: 'The current price of the select commodity'
runs:
  using: 'node16'
  main: 'index.js'
```

* Add actions toolkit packages

```bash
npm i @actions/core @actions/github
```

* Write the action code. Create a new file called `index.js`.

```js
const core = require('@actions/core');
const github = require('@actions/github');

try {
  // `commodity` input defined in action metadata file
  const commodity = core.getInput('commodity');
  console.log(`Getting current ${commodity} price per ounce...`);
  let price = 0;
  if (commodity.toLowerCase() === 'gold') {
    price = 2019.80; // https://www.bullionvault.com/gold-price-chart.do
    console.log(`Current gold price per ounce: ${price} USD`);
  } else if (commodity.toLowerCase() === 'silver') {
    price = 24.07; // https://www.bullionvault.com/silver-price-chart.do
    console.log(`Current silver price per ounce: ${price} USD`);
  }

  // `price` output defined in action metadata file
  core.setOutput('price', price);

  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}
```

* Create a README to let people know how to use the action. It should be named `README.md`.
* Commit, tag and push your action

```bash
git add action.yml index.js node_modules/* package.json package-lock.json README.md
git commit -m "Action ready for release"
git tag -a -m "Get commodity price action initial release" v1.0.1
git push --follow-tags
```

> Note: `node_modules` must be pushed!

* Create a release using previously created tag. Go to GitHub website, open your repo and check 'Releases' section in the right side panel.

## Testing out the action

Now the action is ready to be tested.

* Let's go back to our main repo and create a new workflow named `test-custom-action.yml`

```bash
git checkout -b test-custom-action
git push -u origin test-custom-action
```

```yaml
name: Workflow to test the custom action

on:
  workflow_dispatch:

jobs:
  get_commodity_price:
    runs-on: ubuntu-latest

    steps:
      - name: Get commodity price step
        uses: jtrillo/get-commodity-price-action@v1.0.1
        with:
          commodity: 'silver'
```

```bash
git add .
git commit -m "added workflow to test custom action"
git push
```

* Now we can fire the workflow and check if the custom action we have created works.

* We can also make use of action's output in a different step.

```diff
name: Workflow to test the custom action

on:
  workflow_dispatch:

jobs:
  get_commodity_price:
    runs-on: ubuntu-latest

    steps:
      - name: Get commodity price step
+       id: commodity_price
        uses: jtrillo/get-commodity-price@v1.0.0
        with:
          commodity: 'silver'
+     # Use the output from `commodity_price` step
+     - name: Get the output price
+       run: echo "Price per ounce is ${{ steps.commodity_price.outputs.price }} USD"
```

* Push the new changes and fire the workflow again

```bash
git add .
git commit -m "added new step to use custom action output"
git push
```

## References

* [GitHub Docs - Creating a JS action](https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action)
* [Template repo for creating JS actions](https://github.com/actions/javascript-action)
* [Template repo for creating TS actions](https://github.com/actions/typescript-action)
