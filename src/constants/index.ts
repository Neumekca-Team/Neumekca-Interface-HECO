import { AbstractConnector } from '@web3-react/abstract-connector'
import { ChainId, JSBI, Percent, Token, WETH } from '@neumekca/neumekca-sdk'

import { injected } from '../connectors'

//export const ROUTER_ADDRESS = '0xE85C6ab56A3422E7bAfd71e81Eb7d0f290646078'

export const ROUTER_ADDRESS = '0x58C91236D59186De05b60EBd26d9015533B58F4e'
// a list of tokens by chain
type ChainTokenList = {
  readonly [chainId in ChainId]: Token[]
}


export const PRESALE_ADDRESS = '0xace469b7Bfe1759FF6a4BEF62feb3623EFeA6d58'

//const NAR_ADDRESS = '0xA1303E6199b319a891b79685F0537D289af1FC83' BSC
const NAR_ADDRESS = '0xace469b7Bfe1759FF6a4BEF62feb3623EFeA6d58'
export const NAR: { [chainId in ChainId]: Token } = {
  [ChainId.BSC_MAINNET]: new Token(ChainId.BSC_MAINNET, NAR_ADDRESS, 18, 'ZERO', 'ZERO Token'),
  [ChainId.BSC_TESTNET]: new Token(ChainId.BSC_TESTNET, NAR_ADDRESS, 18, 'ZERO', 'ZERO Token'),
  [ChainId.HT_TESTNET]: new Token(ChainId.HT_TESTNET, NAR_ADDRESS, 18, 'ZERO', 'ZERO Token'),
  [ChainId.HT_MAINNET]: new Token(ChainId.HT_MAINNET, NAR_ADDRESS, 18, 'ZERO', 'ZERO Token')
}

export const NAR_HT: { [chainId in ChainId]: [Token, Token] } = {
  [ChainId.BSC_MAINNET]: [WETH[ChainId.BSC_MAINNET], NAR[ChainId.BSC_MAINNET]],
  [ChainId.BSC_TESTNET]: [WETH[ChainId.BSC_TESTNET], NAR[ChainId.BSC_TESTNET]],
  [ChainId.HT_TESTNET]: [WETH[ChainId.HT_TESTNET], NAR[ChainId.HT_TESTNET]],
  [ChainId.HT_MAINNET]: [WETH[ChainId.HT_MAINNET], NAR[ChainId.HT_MAINNET]]
}

//export const GOLD_WETH = new Token(ChainId.BSC_MAINNET, '0x903903A2aa2A222360D8f3c4A7205b933Da60e95', 18, 'GOLD-HT JLP', 'GOLD-HT JLP')
export const GOLD_WETH = new Token(
  ChainId.HT_TESTNET,
  '0x879D20AA3f8F70DEB73a5C13Fe68F62661D039C0',
  18,
  'LEON-HT JLP',
  'LEON-HT JLP'
)

export const GOLD: { [chainId in ChainId]: Token } = {
  [ChainId.BSC_MAINNET]: new Token(
    ChainId.BSC_MAINNET,
    '0x8f4087Cb09E0F378f4278a314C94A636665dE24b',
    18,
    'LEON',
    'ZERO Ticket Token'
  ),
  [ChainId.BSC_TESTNET]: new Token(
    ChainId.BSC_TESTNET,
    '0x6eFb681698688548D9dA11129a24B2d4b0Cf0d14',
    18,
    'LEON',
    'ZERO Ticket Token'
  ),
  [ChainId.HT_MAINNET]: new Token(
    ChainId.HT_MAINNET,
    '0x38117Ac37078c5b46Aa109164f1C64A58C158a58',
    18,
    'LEON',
    'ZERO Ticket Token'
  ),
  [ChainId.HT_TESTNET]: new Token(
    ChainId.HT_TESTNET,
    '0x38117Ac37078c5b46Aa109164f1C64A58C158a58',
    18,
    'LEON',
    'ZERO Ticket Token'
  )
}

export const GEM: { [chainId in ChainId]: Token } = {
  [ChainId.BSC_MAINNET]: new Token(
    ChainId.BSC_MAINNET,
    '0x4BbB275012EBE258556B8debE5C07bE98e8d3859',
    18,
    'SNOW',
    'ZERO Dividend Token'
  ),
  [ChainId.BSC_TESTNET]: new Token(
    ChainId.BSC_TESTNET,
    '0x1c43A76FC8b6eC300e2919A708a100AAd24652e9',
    18,
    'SNOW',
    'ZERO Dividend Token'
  ),
  [ChainId.HT_MAINNET]: new Token(
    ChainId.HT_MAINNET,
    '0xA0984B32fdD3E5ebACE798f984c9EA1880dd2f44',
    18,
    'SNOW',
    'ZERO Dividend Token'
  ),
  [ChainId.HT_TESTNET]: new Token(
    ChainId.HT_TESTNET,
    '0xA0984B32fdD3E5ebACE798f984c9EA1880dd2f44',
    18,
    'SNOW',
    'ZERO Dividend Token'
  )
}

export const BTCB_WETH = new Token(
  ChainId.BSC_MAINNET,
  '0x3111446eC6026EB3ae54EAdCfBDD5ECB09D6d451',
  18,
  'BTC-HT JLP',
  'BTC-HT JLP'
)
export const BTCB = new Token(ChainId.BSC_MAINNET, '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c', 18, 'BTCB', 'Bitcoin')
export const T_BTCB = new Token(
  ChainId.BSC_TESTNET,
  '0x6ce8dA28E2f864420840cF74474eFf5fD80E65B8',
  18,
  'BTCB',
  'Bitcoin'
)

export const ETHB_WETH = new Token(
  ChainId.BSC_MAINNET,
  '0xD921E7efc0Ac8eaaF4AddaF46Ce289E70886b233',
  18,
  'ETH-HT JLP',
  'ETH-HT JLP'
)
export const ETHB = new Token(ChainId.BSC_MAINNET, '0x2170Ed0880ac9A755fd29B2688956BD959F933F8', 18, 'ETH', 'Ethereum')

export const B_DAI = new Token(
  ChainId.BSC_MAINNET,
  '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3',
  18,
  'DAI',
  'Dai Token'
)
export const T_DAI = new Token(
  ChainId.BSC_TESTNET,
  '0xEC5dCb5Dbf4B114C9d0F65BcCAb49EC54F6A0867',
  18,
  'DAI',
  'Dai Token'
)

export const BUSD_WETH = new Token(
  ChainId.BSC_MAINNET,
  '0x5EC32C21C9A6215D239F2BD0Df22d7632b4717c3',
  18,
  'BUSD-HT JLP',
  'BUSD-HT JLP'
)
export const BUSD = new Token(
  ChainId.BSC_MAINNET,
  '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
  18,
  'BUSD',
  'BUSD Token'
)
export const T_BUSD = new Token(
  ChainId.BSC_TESTNET,
  '0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee',
  6,
  'BUSD',
  'BUSD Token'
)
export const H_BUSD = new Token(
  ChainId.HT_TESTNET,
  '0x02ceb61daf1f0b8ea3f22c1c0f02c5f025b150e5',
  6,
  'HUSD',
  'HUSD Token'
)

export const B_USDT = new Token(
  ChainId.BSC_MAINNET,
  '0x55d398326f99059fF775485246999027B3197955',
  18,
  'USDT',
  'Tether USD'
)
export const T_USDT = new Token(
  ChainId.BSC_TESTNET,
  '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd',
  6,
  'USDT',
  'Tether USD'
)
export const HT_USDT = new Token(
  ChainId.HT_TESTNET,
  '0x02e1afeef2a25eabd0362c4ba2dc6d20ca638151',
  18,
  'USDT',
  'Tether USD'
)

export const THUGS_NAR = new Token(
  ChainId.BSC_MAINNET,
  '0xB648ecF23Bb8fe854c6267d6fb046f2d483251EA',
  18,
  'THUGS-ZERO JLP',
  'THUGS-ZERO JLP'
)
export const THUGS = new Token(
  ChainId.BSC_MAINNET,
  '0xE10e9822A5de22F8761919310DDA35CD997d63c0',
  18,
  'THUGS',
  'THUGS Token'
)

export const BLIQ_WETH = new Token(
  ChainId.BSC_MAINNET,
  '0xb05abA947E59049b3582Db7e1063545Ad1c76561',
  18,
  'BLIQ-HT JLP',
  'BLIQ-HT JLP'
)
export const BLIQ = new Token(ChainId.BSC_MAINNET, '0xC97faC34CeB0Bb1B2bdAf3b59ADA378b99111a22', 18, 'BLIQ', 'Bliquid')

export const CHRISTMAS: { [chainId in ChainId]: Token } = {
  [ChainId.BSC_MAINNET]: new Token(
    ChainId.BSC_MAINNET,
    '0x66245518ac3410B55B6d5667F9A937Db207A4618',
    18,
    'mooChristmasZerowhal',
    'Moo Christmas Zerowhal'
  ),
  [ChainId.BSC_TESTNET]: new Token(
    ChainId.BSC_TESTNET,
    '0x6eFb681698688548D9dA11129a24B2d4b0Cf0d14',
    18,
    'mooChristmasZerowhal',
    'Moo Christmas Zerowhal'
  ),
  [ChainId.HT_MAINNET]: new Token(
    ChainId.HT_MAINNET,
    '0x66245518ac3410B55B6d5667F9A937Db207A4618',
    18,
    'mooChristmasZerowhal',
    'Moo Christmas Zerowhal'
  ),
  [ChainId.HT_TESTNET]: new Token(
    ChainId.HT_TESTNET,
    '0x6eFb681698688548D9dA11129a24B2d4b0Cf0d14',
    18,
    'mooChristmasZerowhal',
    'Moo Christmas Zerowhal'
  )
}

const WETH_ONLY: ChainTokenList = {
  // [ChainId.MAINNET]: [WETH[ChainId.MAINNET]],
  // [ChainId.ROPSTEN]: [WETH[ChainId.ROPSTEN]],
  // [ChainId.RINKEBY]: [WETH[ChainId.RINKEBY]],
  // [ChainId.GÖRLI]: [WETH[ChainId.GÖRLI]],
  // [ChainId.KOVAN]: [WETH[ChainId.KOVAN]],
  [ChainId.BSC_MAINNET]: [WETH[ChainId.BSC_MAINNET]],
  [ChainId.BSC_TESTNET]: [WETH[ChainId.BSC_TESTNET]],
  [ChainId.HT_MAINNET]: [WETH[ChainId.HT_MAINNET]],
  [ChainId.HT_TESTNET]: [WETH[ChainId.HT_TESTNET]]
}

// used to construct intermediary pairs for trading
export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
  ...WETH_ONLY,
  [ChainId.BSC_MAINNET]: [...WETH_ONLY[ChainId.BSC_MAINNET], B_USDT, BUSD, B_DAI],
  [ChainId.BSC_TESTNET]: [...WETH_ONLY[ChainId.BSC_TESTNET], T_USDT, T_BUSD, T_DAI]
}

/**
 * Some tokens can only be swapped via certain pairs, so we override the list of bases that are considered for these
 * tokens.
 */
export const CUSTOM_BASES: { [chainId in ChainId]?: { [tokenAddress: string]: Token[] } } = {
  // [ChainId.MAINNET]: {
  //   [AMPL.address]: [DAI, WETH[ChainId.MAINNET]]
  // }
  // [ChainId.BSC_MAINNET]: {}
}

// used for display in the default list when adding liquidity
export const SUGGESTED_BASES: ChainTokenList = {
  ...WETH_ONLY,
  [ChainId.BSC_MAINNET]: [...WETH_ONLY[ChainId.BSC_MAINNET], B_USDT, BUSD, B_DAI],
  [ChainId.BSC_TESTNET]: [...WETH_ONLY[ChainId.BSC_TESTNET], T_USDT, T_BUSD, T_DAI]
}

// used to construct the list of all pairs we consider by default in the frontend
export const BASES_TO_TRACK_LIQUIDITY_FOR: ChainTokenList = {
  ...WETH_ONLY,
  [ChainId.BSC_MAINNET]: [...WETH_ONLY[ChainId.BSC_MAINNET], B_USDT, BUSD, B_DAI],
  [ChainId.BSC_TESTNET]: [...WETH_ONLY[ChainId.BSC_TESTNET], T_USDT, T_BUSD, T_DAI]
}

export const PINNED_PAIRS: { readonly [chainId in ChainId]?: [Token, Token][] } = {
  // [ChainId.BSC_MAINNET]: [
  //   [
  //     new Token(ChainId.BSC, '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643', 8, 'cDAI', 'Compound Dai'),
  //     new Token(ChainId.BSC, '0x39AA39c021dfbaE8faC545936693aC917d5E7563', 8, 'cUSDC', 'Compound USD Coin')
  //   ],
  //   [USDC, USDT],
  //   [DAI, USDT]
  // ]
}

export const BURNED_ADDRESS = '0x6969696969696969696969696969696969696969'
export const DIVIDEND_ADDRESS = '0xE8CccB718de63da9D498279A40D2248E4D46296B'
export const DIVIDEND_ADDRESS2 = '0xdb7a7ebA3CF57DfaA6A924f8c220260833f9725e'

export interface WalletInfo {
  connector?: AbstractConnector
  name: string
  iconName: string
  description: string
  href: string | null
  color: string
  primary?: true
  mobile?: true
  mobileOnly?: true
}

export const SUPPORTED_WALLETS: { [key: string]: WalletInfo } = {
  INJECTED: {
    connector: injected,
    name: 'Injected',
    iconName: 'arrow-right.svg',
    description: 'Injected web3 provider.',
    href: null,
    color: '#010101',
    primary: true
  },
  METAMASK: {
    connector: injected,
    name: 'MetaMask',
    iconName: 'metamask.png',
    description: 'Easy-to-use browser extension.',
    href: null,
    color: '#E8831D'
  },
  // WALLET_CONNECT: {
  //   connector: walletconnect,
  //   name: 'WalletConnect',
  //   iconName: 'walletConnectIcon.svg',
  //   description: 'Connect to Trust Wallet, Rainbow Wallet and more...',
  //   href: null,
  //   color: '#4196FC',
  //   mobile: true
  // },
  // WALLET_LINK: {
  //   connector: walletlink,
  //   name: 'Coinbase Wallet',
  //   iconName: 'coinbaseWalletIcon.svg',
  //   description: 'Use Coinbase Wallet app on mobile device',
  //   href: null,
  //   color: '#315CF5'
  // },
  COINBASE_LINK: {
    name: 'Open in Coinbase Wallet',
    iconName: 'coinbaseWalletIcon.svg',
    description: 'Open in Coinbase Wallet app.',
    href: 'https://go.cb-w.com/mtUDhEZPy1',
    color: '#315CF5',
    mobile: true,
    mobileOnly: true
  }
  // FORTMATIC: {
  //   connector: fortmatic,
  //   name: 'Fortmatic',
  //   iconName: 'fortmaticIcon.png',
  //   description: 'Login using Fortmatic hosted wallet',
  //   href: null,
  //   color: '#6748FF',
  //   mobile: true
  // },
  // Portis: {
  //   connector: portis,
  //   name: 'Portis',
  //   iconName: 'portisIcon.png',
  //   description: 'Login using Portis hosted wallet',
  //   href: null,
  //   color: '#4A6C9B',
  //   mobile: true
  // }
}

export const NetworkContextName = 'NETWORK'

// default allowed slippage, in bips
export const INITIAL_ALLOWED_SLIPPAGE = 50
// 20 minutes, denominated in seconds
export const DEFAULT_DEADLINE_FROM_NOW = 60 * 20

export const BIG_INT_ZERO = JSBI.BigInt(0)

// one basis point
export const ONE_BIPS = new Percent(JSBI.BigInt(1), JSBI.BigInt(10000))
export const BIPS_BASE = JSBI.BigInt(10000)
// used for warning states
export const ALLOWED_PRICE_IMPACT_LOW: Percent = new Percent(JSBI.BigInt(100), BIPS_BASE) // 1%
export const ALLOWED_PRICE_IMPACT_MEDIUM: Percent = new Percent(JSBI.BigInt(300), BIPS_BASE) // 3%
export const ALLOWED_PRICE_IMPACT_HIGH: Percent = new Percent(JSBI.BigInt(500), BIPS_BASE) // 5%
// if the price slippage exceeds this number, force the user to type 'confirm' to execute
export const PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN: Percent = new Percent(JSBI.BigInt(1000), BIPS_BASE) // 10%
// for non expert mode disable swaps above this
export const BLOCKED_PRICE_IMPACT_NON_EXPERT: Percent = new Percent(JSBI.BigInt(1500), BIPS_BASE) // 15%

// used to ensure the user doesn't send so much ETH so they end up with <.01
export const MIN_ETH: JSBI = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(16)) // .01 ETH
export const BETTER_TRADE_LINK_THRESHOLD = new Percent(JSBI.BigInt(75), JSBI.BigInt(10000))

// the Uniswap Default token list lives here
export const DEFAULT_TOKEN_LIST_URL = 'https://api-neumekca.herokuapp.com/tokenlist/'

// base URI for NFT
export const NFT_BASE_URL: { [chainId in ChainId]: string } = {
  [ChainId.BSC_MAINNET]: 'https://api-neumekca.herokuapp.com/null/',
  [ChainId.BSC_TESTNET]: 'https://api-neumekca.herokuapp.com/null/',
  [ChainId.HT_TESTNET]: 'https://api-neumekca.herokuapp.com/null/',
  [ChainId.HT_MAINNET]: 'https://api-neumekca.herokuapp.com/null/'
}
