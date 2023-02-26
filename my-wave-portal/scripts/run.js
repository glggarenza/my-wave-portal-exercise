const main = async () => {
    // const [owner, randomPerson] = await hre.ethers.getSigners();
    const waveContractFactory = await hre.ethers.getContractFactory("WavePortal");
    const waveContract = await waveContractFactory.deploy({
        value: hre.ethers.utils.parseEther("0.1"),
    });
    await waveContract.deployed();
    console.log("Contract addy:", waveContract.address);
    // console.log("Contract deployed by:", owner.address);

    let contractBalance = await hre.ethers.provider.getBalance(waveContract.address);
    console.log("Contract balance",
                hre.ethers.utils.formatEther(contractBalance)
            );

    
    // let waveCount;
    // waveCount = await waveContract.getTotalWaves();
    // console.log(waveCount.toNumber());

    /*
    * sends a few waves
    */
    
    const waveTxn = await waveContract.wave("This is my #1 wave!");
    await waveTxn.wait(); // wait for the transaction to be mined

    const waveTxn2 = await waveContract.wave("This is my #2 wave!");
    await waveTxn2.wait(); // wait for the transaction to be mined

    contractBalance = await hre.ethers.provider.getBalance(waveContract.address);
    console.log(
        "Contract balance:",
        hre.ethers.utils.formatEther(contractBalance)
      );

    // const [_, randomPerson] = await hre.ethers.getSigners();
    // waveTxn = await waveContract.connect(randomPerson).wave("Another message");
    // await waveTxn.wait(); // wait for the transaction to be mined

    let allWaves = await waveContract.getAllWaves();
    console.log(allWaves);

    // await waveContract.getTotalWaves();

    // const firstWaveTxn = await waveContract.wave();
    // await firstWaveTxn.wait();

    // await waveContract.getTotalWaves();
    // await waveContract.addAddress(owner.address)

    // const secondWaveTxn = await waveContract.connect(randomPerson).wave();
    // await secondWaveTxn.wait();

    // await waveContract.getTotalWaves();
    // await waveContract.addAddress(randomPerson.address)

    // const addressList = await waveContract.getAddressList();
    // console.log('My wavers: %O', addressList );
};

// async function runMain() {
const runMain = async () => {
    try {
        await main();
        process.exit(0); // exit Node process without error
    } catch (error) {
        console.log(error);
        process.exit(1); // exit Node process while indicating 'Uncaught Fatal Exception' error
    }
    // Read more about Node exit ('process.exit(num)') status codes here: https://stackoverflow.com/a/47163396/7974948
}

runMain();