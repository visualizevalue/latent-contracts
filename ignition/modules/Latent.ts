import { encodeAbiParameters, parseAbiParameters } from 'viem'
import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'
import tokens from './../../data/tokens.json'

interface TokenNames {
  [key: string]: string
}

const LatentModule = buildModule('Latent', (m) => {
  // Convert object to array ensuring order
  const names: string[] = Object.values(tokens as TokenNames)

  const abiParams = parseAbiParameters('string[]')

  // Encode the names array
  const encodedNames = encodeAbiParameters(
    abiParams,
    [names]
  )

  const contract = m.contract('Latent', [encodedNames])

  return { contract }
})

export default LatentModule

