import { Interface } from '@ethersproject/abi'
import STACKING_SNOW_ABI from './staking_gems.json'

const STACKING_SNOW_INTERFACE = new Interface(STACKING_SNOW_ABI)

export { STACKING_SNOW_INTERFACE, STACKING_SNOW_ABI }