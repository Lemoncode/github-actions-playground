# Get commodity price action

This action prints current price per ounce for the selected commodity.

## Inputs

### `commodity`

**Required** The commodity you want to know its current price per ounce. Default `"gold"`.

## Outputs

### `price`

The current price for the selected commodity.

## Example usage

```yaml
uses: jtrillo/get-commodity-price-action@v1
with:
  commodity: 'silver'
```
