const main = async () => {
    const nftContractFactory = await hre.ethers.getContractFactory('EYENFTS');
    const nftContract = await nftContractFactory.deploy(
      "0x9399BB24DBB5C4b782C70c2969F58716Ebbd6a3b",
      "https://gateway.pinata.cloud/ipfs/QmcBLcExLbn12Mythf5wxVYwjVxi5HnxXhnzS8J11LN2hs/",
      500
    );
    await nftContract.deployed();
    console.log("Contract deployed to:", nftContract.address);
  // set merklroot of whitelist
    let setmerkelroot = await nftContract.setMerklRoot("0x88c272f223abbcfb86e16e88a660f482b8f4a272085d3598b9b6f8d98137dd6a")
    await setmerkelroot.wait()
    console.log("merkelroot set");
  };
  
  const runMain = async () => {
    try {
      await main();
      process.exit(0);
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  };
  
  runMain();