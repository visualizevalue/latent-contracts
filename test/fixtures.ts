import hre from 'hardhat'
import LatentModule from '../ignition/modules/Latent'

export async function latentFixture() {
  const [owner, signer1, signer2, signer3] = await hre.viem.getWalletClients()

  const publicClient = await hre.viem.getPublicClient()

  const { contract } = await hre.ignition.deploy(LatentModule)

  const latent = await hre.viem.getContractAt('Latent', contract.address)

  return {
    latent,
    owner,
    signer1,
    signer2,
    signer3,
    publicClient,
  }
}

