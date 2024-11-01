import { expect } from 'chai'
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { latentFixture } from './fixtures'
import { decodeBase64URI } from '../helpers/decode-uri'
import { getAddress } from 'viem'
import tokens from './../data/tokens.json'

interface TokenNames {
  [key: string]: string
}

const tokenNames = tokens as TokenNames

describe('Latent', () => {
  describe('Deployment', () => {
    it('should deploy the collection', async () => {
      await loadFixture(latentFixture)
    })

    it('should expose name, symbol, and description', async () => {
      const { latent } = await loadFixture(latentFixture)

      expect(await latent.read.name()).to.equal('Latent')
      expect(await latent.read.symbol()).to.equal('LATENT')
      expect(await latent.read.description()).to.equal('The infinite between.')
    })

    it('should expose valid contract metadata', async () => {
      const { latent } = await loadFixture(latentFixture)

      const dataURI = await latent.read.contractURI()
      const data = decodeBase64URI(dataURI)

      expect(data.name).to.equal('Latent')
      expect(data.description).to.equal('The infinite between.')
      expect(data.image).to.equal('ipfs://QmNT8pBktjfhQvLK7YAGubFEBn1Z1DKDM5zGtyufuWiKwS/positive/1.jpg')
    })
  })

  describe('Token Data', () => {
    it('should mint all tokens to the deployer', async () => {
      const { latent, owner } = await loadFixture(latentFixture)

      expect(await latent.read.balanceOf([owner.account.address])).to.equal(80)
      expect(await latent.read.ownerOf([1n])).to.equal(getAddress(owner.account.address))
    })

    it('should not expose unminted token URIs', async () => {
      const { latent } = await loadFixture(latentFixture)

      await expect(latent.read.tokenURI([81n]))
        .to.be.revertedWithCustomError(latent, 'ERC721NonexistentToken')
    })

    it('should not expose non existend names', async () => {
      const { latent } = await loadFixture(latentFixture)

      await expect(latent.read.tokenName([81n]))
        .to.be.revertedWithCustomError(latent, 'ERC721NonexistentToken')
    })

    it('should expose token names', async () => {
      const { latent } = await loadFixture(latentFixture)

      // Hardcode test a few
      expect(await latent.read.tokenName([1n])).to.equal('Altered Serenade')
      expect(await latent.read.tokenName([2n])).to.equal('Antonymic Stillness')
      expect(await latent.read.tokenName([3n])).to.equal('Bending Edge')
      expect(await latent.read.tokenName([30n])).to.equal('Holographic Self')
      expect(await latent.read.tokenName([80n])).to.equal('Weightless Drift')

      // Test all
      const ids = Object.keys(tokenNames)
      for (const id of ids) {
        expect(await latent.read.tokenName([BigInt(id)])).to.equal(tokenNames[id])
      }
    })

    it('should expose onchain metadata', async () => {
      const { latent } = await loadFixture(latentFixture)

      const ids = Object.keys(tokens)
      for (const id of ids) {
        const dataURI = await latent.read.tokenURI([BigInt(id)])
        const data = decodeBase64URI(dataURI)

        expect(data.id).to.equal(parseInt(id))
        expect(data.name).to.equal(tokenNames[id])
        expect(data.description).to.equal('Digital negative as primary artifact.')

        expect(data.image).to.equal(`ipfs://QmNT8pBktjfhQvLK7YAGubFEBn1Z1DKDM5zGtyufuWiKwS/negative/${id}.jpg`)

        expect(data.attributes.length).to.equal(1)
        expect(data.attributes[0].trait_type).to.equal('Artist')
        expect(data.attributes[0].value).to.equal('Jack Butcher')
      }
    })
  })

  describe('Token Transfers', () => {
    it('should allow token transfers', async () => {
      const { latent, owner, signer1 } = await loadFixture(latentFixture)

      await latent.write.transferFrom([
        owner.account.address,
        signer1.account.address,
        1n
      ])

      expect(await latent.read.ownerOf([1n])).to.equal(getAddress(signer1.account.address))
    })

    it('should update balances after transfer', async () => {
      const { latent, owner, signer1 } = await loadFixture(latentFixture)

      await latent.write.transferFrom([
        owner.account.address,
        signer1.account.address,
        1n
      ])

      expect(await latent.read.balanceOf([owner.account.address])).to.equal(79n)
      expect(await latent.read.balanceOf([signer1.account.address])).to.equal(1n)
    })
  })
})

