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