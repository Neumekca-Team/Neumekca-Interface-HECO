import { Interface } from '@ethersproject/abi'
import ZEROWHAL_POWER_ABI from './narwhal_power.json'

const ZEROWHAL_POWER_INTERFACE = new Interface(ZEROWHAL_POWER_ABI)

export { ZEROWHAL_POWER_INTERFACE }