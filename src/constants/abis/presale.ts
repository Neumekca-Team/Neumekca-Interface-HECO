import { Interface } from '@ethersproject/abi'
import PRESALE_ABI from './presale.json'

const STACKING_GEMS_INTERFACE = new Interface(PRESALE_ABI)

export { STACKING_GEMS_INTERFACE, PRESALE_ABI }