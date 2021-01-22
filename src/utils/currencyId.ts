import { Currency, ETHER, Token } from '@neumekca/neumekca-sdk'

export function currencyId(currency: Currency): string {
  if (currency === ETHER) return 'HT'
  if (currency instanceof Token) return currency.address
  throw new Error('invalid currency')
}
