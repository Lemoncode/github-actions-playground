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