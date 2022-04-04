const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const { MerkleTree } = require('merkletreejs')
const keccak256 = require('keccak256')

describe("NFT", function () {
    let eyeNftContract, merklRoothash, hexProof
    let owner;
    let addr1;
    let addr2;
    let addr3;

    before(async () => {
        [owner, addr1, addr2, addr3] = await ethers.getSigners();

        const EYENFTS = await ethers.getContractFactory("EYENFTS");
        eyeNftContract = await EYENFTS.deploy(
            "0x9399BB24DBB5C4b782C70c2969F58716Ebbd6a3b",
            "https://gateway.pinata.cloud/ipfs/QmcBLcExLbn12Mythf5wxVYwjVxi5HnxXhnzS8J11LN2hs",
            500
        );
        await eyeNftContract.deployed();
        let whitelistAddresses = [
            owner.address,
            addr1.address,
            addr2.address
        ];

        const leafNodes = whitelistAddresses.map(addr => keccak256(addr));
        const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });
        rootHash = merkleTree.getRoot();
        merklRoothash = rootHash.toString('hex')
        const claimingAddress = keccak256(owner.address);
        hexProof = merkleTree.getHexProof(claimingAddress)

    })

    it("deploys successfully", async function () {

        const address = eyeNftContract.address
        assert.notEqual(address, 0x0)
        assert.notEqual(address, '')
        assert.notEqual(address, null)
        assert.notEqual(address, undefined)
        console.log("EYENFTS address: ", eyeNftContract.address);
    })
    it("setmerklroot", async () => {
        await eyeNftContract.setMerklRoot("0x" + merklRoothash);
        const getMerkelRoot = await eyeNftContract.getMerkelRoot()
        expect(getMerkelRoot).to.equal("0x" + merklRoothash);
    });
    it("mintnft with a whitelister", async () => {

        let mint = await eyeNftContract.connect(owner).mintNFT(hexProof)
        let mintwait = await mint.wait()
        let emiteEvent = mintwait.events?.filter((x) => {return x.event == "Mint"})
        let mintevent = emiteEvent[0].args[0]
        expect(owner.address).to.equal(mintevent);

    })
    it("mintnft ", async () => {
        let whitelistAddresses = [
            owner.address,
            addr1.address,
            addr2.address
        ];
        const leafNodes = whitelistAddresses.map(addr => keccak256(addr));
        const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });
        rootHash = merkleTree.getRoot();
        merklRoothash = rootHash.toString('hex')
        const claimingAddress = keccak256(addr3.address);
        hexProof = merkleTree.getHexProof(claimingAddress)

        await expect( eyeNftContract.connect(addr3).mintNFT(hexProof)).to.be.revertedWith('Invalid Merkle Proof.')

    })


});