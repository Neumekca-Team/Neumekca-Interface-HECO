import { Interface } from '@ethersproject/abi'
import STAKING_REWARDS_ABI from './staking_rewards.json'
import STAKING_REWARDS_CAPPED_ABI from './staking_rewards_capped.json'
import STAKING_REWARDS_V2_ABI from './staking_rewards_v2.json'
import STAKING_DIVIDEND_ABI from './staking_dividend.json'
// import { abi as STAKING_REWARDS_FACTORY_ABI } from '@uniswap/liquidity-staker/build/StakingRewardsFactory.json'

const STAKING_REWARDS_INTERFACE = new Interface(STAKING_REWARDS_ABI)
const STAKING_REWARDS_CAPPED_INTERFACE = new Interface(STAKING_REWARDS_CAPPED_ABI)
const STAKING_REWARDS_V2_INTERFACE = new Interface(STAKING_REWARDS_V2_ABI)
const STAKING_REWARDS_DIVIDEND_INTERFACE = new Interface(STAKING_DIVIDEND_ABI)

// const STAKING_REWARDS_FACTORY_INTERFACE = new Interface(STAKING_REWARDS_FACTORY_ABI)

// export { STAKING_REWARDS_FACTORY_INTERFACE, STAKING_REWARDS_INTERFACE }

export { STAKING_REWARDS_INTERFACE, STAKING_REWARDS_CAPPED_INTERFACE, STAKING_REWARDS_DIVIDEND_INTERFACE, STAKING_REWARDS_V2_INTERFACE }
