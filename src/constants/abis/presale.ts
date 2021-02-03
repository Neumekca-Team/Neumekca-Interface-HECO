import { Interface } from '@ethersproject/abi'
import PRESALE_ABI from './presale.json'

const STACKING_SNOW_INTERFACE = new Interface(PRESALE_ABI)

export { STACKING_SNOW_INTERFACE, PRESALE_ABI }