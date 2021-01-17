import { Interface } from '@ethersproject/abi'
import STACKING_GEMS_ABI from './staking_gems.json'

const STACKING_GEMS_INTERFACE = new Interface(STACKING_GEMS_ABI)

export { STACKING_GEMS_INTERFACE, STACKING_GEMS_ABI }