import { ChainId, Token } from '@neumekca/neumekca-sdk'

export const REWARDS_DURATION_DAYS = 60

// TODO add staking rewards addresses here
export const PRESALE_POOL_INFO: {
  [chainId in ChainId]?: {
    earnToken: Token
    poolAddress: string
    poolId: number
    isActive: boolean
    projectLink: string
    startTime?: string
    projectName?: string
    price?: string
    capacity?: string
  }[]
} = {
  [ChainId.HT_TESTNET]: [
    {
      earnToken: new Token(ChainId.HT_TESTNET, '0x50B4005C42e7bd0BC1c030b52B74fe1b23920Df6', 18, 'ZERO', 'ZERO'),
      poolAddress: '0x88F8eBcdc1905C2CA9A5145E59787000b79c593a',
      poolId: 0,
      isActive: true,
      projectLink: 'https://www.app.neumekca.city',
      startTime: '27/01/2021',
      projectName: 'Katana zero',
      price: '0.075',
      capacity: '3 000 000'
    },
    {
      earnToken: new Token(ChainId.HT_TESTNET, '0xC97faC34CeB0Bb1B2bdAf3b59ADA378b99111a22', 18, 'SNOW', 'SNOW'),
      poolAddress: '0xf0025F99A70c43581707353d8C5C81eB73A730a8',
      poolId: 1,
      projectName: 'Katana zero',
      isActive: false,
      projectLink: 'https://www.app.neumekca.city',
      startTime: '27/01/2021'
    }
  ],
  [ChainId.HT_MAINNET]: [
    {
      earnToken: new Token(ChainId.HT_MAINNET, '0xa2eddE98B2dFEEE49e846821F6ce0dDAe69A9b5D', 18, 'ZERO', 'ZERO Token'),
      poolAddress: '0x0D3Bc2cEe458Ce321a65ac8890CC31538Af870a9',
      poolId: 0,
      projectName: 'Neumékca City',
      isActive: true,
      projectLink: 'https://www.app.neumekca.city',
      startTime: '1 PM UTC, Jan 27, 2021',
      price: '74 ZERO per',
      capacity: '3 000 000'
    },
    {
      earnToken: new Token(ChainId.HT_MAINNET, '0xC97faC34CeB0Bb1B2bdAf3b59ADA378b99111a22', 18, '????', '???!!!???'),
      poolAddress: '0x4182Eb9f891145E842C898e70e8c25eB03CC4EF6',
      poolId: 1,
      projectName: 'Comming soon',
      isActive: false,
      projectLink: 'https://www.app.neumekca.city',
      startTime: 'Comming soon'
    }
  ]
}
