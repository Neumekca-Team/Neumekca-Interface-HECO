import { Currency, ETHER, ChainId } from '@neumekca/neumekca-sdk'

export const formatSymbol = (currency?: Currency | null, chainId: ChainId = ChainId.HT_MAINNET) => {
  if (!currency) return ''
  if (currency === ETHER) return currency.toDisplayableSymbol(chainId)
  return currency.symbol
}

export default formatSymbol
