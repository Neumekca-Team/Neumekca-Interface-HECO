import { ChainId, Token } from '@neumekca/neumekca-sdk'
import { TokenInfo, TokenList } from '@uniswap/token-lists'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { DEFAULT_TOKEN_LIST_URL } from '../../constants'
import { AppState } from '../index'
import axios from 'axios'
export class WrappedTokenInfo extends Token {
  public readonly tokenInfo: TokenInfo
  constructor(tokenInfo: TokenInfo) {
    super(tokenInfo.chainId, tokenInfo.address, tokenInfo.decimals, tokenInfo.symbol, tokenInfo.name)
    this.tokenInfo = tokenInfo
  }
  public get logoURI(): string | undefined {
    return this.tokenInfo.logoURI
  }
}

export type TokenAddressMap = Readonly<{ [chainId in ChainId]: Readonly<{ [tokenAddress: string]: WrappedTokenInfo }> }>

/**
 * An empty result, useful as a default.
 */
const EMPTY_LIST: TokenAddressMap = {
  [ChainId.BSC_TESTNET]: {},
  [ChainId.BSC_MAINNET]: {},
  [ChainId.HT_MAINNET]: {},
  [ChainId.HT_TESTNET]: {},
}


  
const listCache: WeakMap<TokenList, TokenAddressMap> | null =
  'WeakMap' in window ? new WeakMap<TokenList, TokenAddressMap>() : null

export function listToTokenMap(list: TokenList): TokenAddressMap {

  const result = listCache?.get(list)
  if (result) return result

  const map = list.tokens.reduce<TokenAddressMap>(
    (tokenMap, tokenInfo) => {
      const token = new WrappedTokenInfo(tokenInfo)
      if (tokenMap[token.chainId][token.address] !== undefined) throw Error('Duplicate tokens.')
      return {
        ...tokenMap,
        [token.chainId]: {
          ...tokenMap[token.chainId],
          [token.address]: token
        }
      }
    },
    { ...EMPTY_LIST }
  )
  listCache?.set(list, map)
  return map
}



export const getTokenList = async () => {
  const res = await axios.get<TokenList>('https://api-neumekca.herokuapp.com/tokenlist/')
  const tokenList: TokenList = res.data;
  localStorage.setItem('myData',JSON.stringify(tokenList));
}



export function useTokenList(url: string): TokenAddressMap {
  const lists = useSelector<AppState, AppState['lists']['byUrl']>(state => state.lists.byUrl)
  let current = lists[url]?.current
  var a = localStorage.getItem('myData') || '{}' ;
  //current = JSON.parse(a) as TokenList ;
  return useMemo(() => {
    if (!current) return EMPTY_LIST
    return listToTokenMap(current)
  }, [lists, url])
}

export function useDefaultTokenList(): TokenAddressMap {

  return useTokenList(DEFAULT_TOKEN_LIST_URL)
}

// returns all downloaded current lists
export function useAllLists(): TokenList[] {
  const lists = useSelector<AppState, AppState['lists']['byUrl']>(state => state.lists.byUrl)
  return useMemo(
    () =>
      Object.keys(lists)
        .map(url => lists[url].current)
        .filter((l): l is TokenList => Boolean(l)),
    [lists]
  )
}
