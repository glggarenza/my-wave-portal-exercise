import React, { useEffect, useState } from "react";
import './App.css';
import {ethers} from "ethers";
import abi from "./utils/WavePortal.json";

const getEthereumObject = () => window.ethereum;


const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);


  /*
  * Create a variable here that references the abi content!
  */
  const contractABI = abi.abi;
  const contractAddress = "0xF0635663AD47f621DF2B922d9f7b3Bc779eb960f"

  const findMetaMaskAccount = async () => {
    try {
      const ethereum = getEthereumObject();
  
      if (!ethereum){
        console.error("Make sure you have Metamask!");
        return null;
      }
  
      console.log("We have the Ethereum object", ethereum);
      const accounts = await ethereum.request({ method: "eth_accounts" });
  
      if(accounts.length !==0){
        const account = accounts(0);
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        return account;
      } else {
        console.error("No authorized account found");
        return null;
      }
    } catch (error){
      console.error(error);
      return null;
    }
  };
  
  const connectWallet = async () =>{
    try {
      const ethereum = getEthereumObject();
      
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts"
      });
      
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.error(error);
    }
  }

  const wave = async () =>{
    setLoading(true);
    try {
      const {ethereum} = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        /*
        * You're using contractABI here
        */
        const wavePortalContract = new ethers.Contract(
          contractAddress, 
          contractABI, 
          signer
        );

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        /*
        * Execute the actual wave from the smart contract
        */

        const waveTxn = await wavePortalContract.wave(message, 
                                                      { gasLimit: 300000 });
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined --", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        setLoading(false);
      } else {
        console.log("Ethereum object doesn't exist!");
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }

  const getAllWaves = async () => {
    const ethereum = getEthereumObject();
    try {
      if (ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, 
                                                       contractABI, 
                                                       signer);

        const waves = await wavePortalContract.getAllWaves();

         /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        const wavesCleaned = waves.map(wave => {
        return {
          address: wave.waver,
          timestamp: new Date(wave.timestamp * 1000),
          message: wave.message,
          };
        });

        /*
         * Store our data in React State
         */
        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist");
      }
    } catch (error) {
      
    }
  }
  useEffect(() => {
    getAllWaves();
    findMetaMaskAccount();
  }, []);

  /**
 * Listen in for emitter events!
 */
useEffect(() => {
  let wavePortalContract;

  const onNewWave = (from, timestamp, message) => {
    console.log("NewWave", from, timestamp, message);
    setAllWaves(prevState => [
      ...prevState,
      {
        address: from,
        timestamp: new Date(timestamp * 1000),
        message: message,
      },
    ]);
  };

  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
    wavePortalContract.on("NewWave", onNewWave);
  }

  return () => {
    if (wavePortalContract) {
      wavePortalContract.off("NewWave", onNewWave);
    }
  };
}, []);

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
        👋 Hey there!
        </div>

        <div className="bio">
        Let's wave each others and show your excitement! Connect your Ethereum wallet and send your wave!
        </div>
        
        <input
          className="waveMessage"
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message ..."
        />

        <button className="waveButton" onClick={wave}>
          Wave at Me
          
        </button>

         {/*
         * If there is no currentAccount render this button
         */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        {loading && (
          <div className="load-9">
            <div className="spinner">
              <div className="bubble-1"></div>
              <div className="bubble-2"></div>
            </div>
            <p>processing...</p>
          </div>
        )}

        {allWaves.map((wave, index) => {
          return (
            <div style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>)
        })}
      </div>
    </div>
  );
};

export default App;