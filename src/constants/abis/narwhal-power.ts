import { Interface } from '@ethersproject/abi'
import NARWHAL_POWER_ABI from './narwhal_power.json'

const NARWHAL_POWER_INTERFACE = new Interface(NARWHAL_POWER_ABI)

export { NARWHAL_POWER_INTERFACE }