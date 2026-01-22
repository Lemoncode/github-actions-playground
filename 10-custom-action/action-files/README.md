# Get commodity price action

This action prints current price per ounce for the selected commodity.

## Inputs

### `commodity`

- **Required**. The commodity you want to know its current price per ounce.
- Possible values: `gold` and `silver`.
- Default value: `gold`.

### `currency`

- **Required**. The desired currency.
- Possible values: `USD` and `EUR`.
- Default value: `USD`.

## Outputs

### `price`

The current price for the selected commodity.

## Example usage

```yaml
uses: jtrillo/get-commodity-price-action@v1.0.0
with:
  commodity: 'silver'
```
