import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [depositAmount, setDepositAmount] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [transferAmount, setTransferAmount] = useState(0);
  const [transferAddress, setTransferAddress] = useState("");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      handleAccount(accounts);
    } else {
      console.log("MetaMask is not installed");
    }
  };

  const handleAccount = (accounts) => {
    if (accounts.length > 0) {
      console.log("Account connected: ", accounts[0]);
      setAccount(accounts[0]);
      getATMContract();
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);
  };

  const getATMContract = () => {
    if (ethWallet) {
      const provider = new ethers.providers.Web3Provider(ethWallet);
      const signer = provider.getSigner();
      const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

      setATM(atmContract);
    }
  };

  const getBalance = async () => {
    if (atm) {
      try {
        const balance = await atm.getBalance();
        setBalance(balance.toNumber());
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    }
  };

  const createWallet = async () => {
    if (atm) {
      try {
        let tx = await atm.createWallet();
        await tx.wait();
        getBalance();
      } catch (error) {
        console.error("Wallet creation failed:", error);
      }
    }
  };

  const deposit = async () => {
    if (atm) {
      try {
        let tx = await atm.depositToWallet(depositAmount, { value: ethers.utils.parseEther(depositAmount.toString()) });
        await tx.wait();
        getBalance();
      } catch (error) {
        console.error("Deposit failed:", error);
      }
    }
  };

  const withdraw = async () => {
    if (atm) {
      try {
        let tx = await atm.withdrawFromWallet(withdrawAmount);
        await tx.wait();
        getBalance();
      } catch (error) {
        console.error("Withdrawal failed:", error);
      }
    }
  };

  const transfer = async () => {
    if (atm) {
      try {
        let tx = await atm.transferFromWallet(transferAddress, ethers.utils.parseEther(transferAmount.toString()));
        await tx.wait();
        getBalance();
      } catch (error) {
        console.error("Transfer failed:", error);
      }
    }
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install Your Uplift in order to use this ATM.</p>;
    }

    if (!account) {
      return <button onClick={connectAccount}>Please connect your Uplift wallet</button>;
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your UpLift Account {account}</p>
        <p>Your Uplift Balance {balance}</p>
        <div>
          <button onClick={createWallet}>Create Wallet</button>
        </div>
        <div>
          <input
            type="number"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            placeholder="Deposit Amount in ETH"
          />
          <button onClick={deposit}>Deposit</button>
        </div>
        <div>
          <input
            type="number"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            placeholder="Withdraw Amount in ETH"
          />
          <button onClick={withdraw}>Withdraw</button>
        </div>
        <div>
          <input
            type="text"
            value={transferAddress}
            onChange={(e) => setTransferAddress(e.target.value)}
            placeholder="Recipient Address"
          />
          <input
            type="number"
            value={transferAmount}
            onChange={(e) => setTransferAmount(e.target.value)}
            placeholder="Transfer Amount in ETH"
          />
          <button onClick={transfer}>Transfer</button>
        </div>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header><h1>Welcome to Uplift</h1></header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
        }
      `}</style>
    </main>
  );
}
