# Custom action

In this last demo we will create a custom action and use it in a workflow.

## Steps

* Create a new **public** repository on GitHub and call it *get-commodity-price-action*. Clone it to your computer and open this repo in your editor.
* Create a new Node.js project using `npm init -y`. Change type to `module` in `package.json`: `"type": "module"`
* Create the action metadata file. It should be named `action.yml`.

```yaml
name: 'Get Commodity Price'
description: 'Get gold or silver current price per ounce'
inputs:
  commodity:  # id of input
    description: 'Commodity (gold or silver)'
    required: true
    default: 'gold'
  currency: # id of input
    description: 'Currency (USD or EUR)'
    required: true
    default: 'USD'
outputs:
  price: # id of output
    description: 'The current price of the select commodity'
runs:
  using: 'node20'
  main: 'index.js'
```

* Add actions toolkit packages

```bash
npm i @actions/core @actions/github
```

* Write the action code. Create a new file called `index.js`.

```js
import { getInput, setOutput, setFailed } from '@actions/core';
import { context } from '@actions/github';

try {
  // `commodity` input defined in action metadata file
  const commodity = getInput('commodity');

  // Check if input is valid
  if (commodity.toLowerCase() !== 'gold' && commodity.toLowerCase() !== 'silver') {
    throw new Error(`Commodity ${commodity} is not valid`);
  }

  // `currency` input defined in action metadata file
  const currency = getInput('currency');

  // Check if input is valid
  if (currency.toUpperCase() !== 'USD' && currency.toUpperCase() !== 'EUR') {
    throw new Error(`Currency ${currency} is not valid`);
  }

  console.log(`Getting current ${commodity} price per ounce in ${currency}...`);
  let price = 0;

  if (commodity.toLowerCase() === 'gold') {
    // https://www.bullionvault.com/gold-price-chart.do
    price = currency.toUpperCase() === 'USD' ? 2652.84 : 2524.52;
  } else {
    // https://www.bullionvault.com/silver-price-chart.do
    price = currency.toUpperCase() === 'USD' ? 30.58 : 29.10;
  }
  console.log(`Current ${commodity} price per ounce: ${price} ${currency}`);

  // `price` output defined in action metadata file
  setOutput('price', price);

  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);
} catch (error) {
  setFailed(error.message);
}
```

* Create a README to let people know how to use the action. It should be named `README.md`.
* Commit, tag and push your action

```bash
git add action.yml index.js node_modules/* package.json package-lock.json README.md
git commit -m "Action ready for release"
git tag -a -m "Get commodity price action initial release" v1.0.0
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
        uses: jtrillo/get-commodity-price-action@v1.0.0
        with:
          commodity: silver
          currency: EUR
```

```bash
git add .
git commit -m "added workflow to test custom action"
git push
```

* Now we can fire the workflow and check if the custom action we have created works.

* We could also use matrix strategy to try out several combinations at the same time.

> Some not valid values could be added in the matrix too. Custom action will throw an error.

```diff
name: Workflow to test the custom action

on:
  workflow_dispatch:

jobs:
  get_commodity_price:
    runs-on: ubuntu-latest
+   strategy:
+     matrix:
+       commodity: ["gold", "SILVER"]
+       currency: ["USD", "eur"]

    steps:
      - name: Get commodity price
        id: commodity_price
        uses: jtrillo/get-commodity-price-action@v1.0.0
        with:
-         commodity: silver
+         commodity: ${{ matrix.commodity }}
-         currency: EUR
+         currency: ${{ matrix.currency }}
```

* Push the new changes and fire the workflow again

```bash
git add .
git commit -m "added matrix strategy to test custom action"
git push
```

* We can also make use of action's output in a different step.

```diff
name: Workflow to test the custom action

on:
  workflow_dispatch:

jobs:
  get_commodity_price:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        commodity: ["gold", "silver"]
        currency: ["USD", "EUR"]

    steps:
      - name: Get commodity price step
+       id: commodity_price
        uses: jtrillo/get-commodity-price@v1.0.0
        with:
          commodity: ${{ matrix.commodity }}
          currency: ${{ matrix.currency }}
+     # Use the output from `commodity_price` step
+     - name: Get the output price
+       run: echo "Price per ounce is ${{ steps.commodity_price.outputs.price }} ${{ matrix.currency }}"
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
