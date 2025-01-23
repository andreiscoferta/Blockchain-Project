import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import {WalletProvider, useWallet, ConnectButton} from '@suiet/wallet-kit';
import '@suiet/wallet-kit/style.css';
import { Transaction } from '@mysten/sui/transactions';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import './App.css';

const App = () => {
  const [ethAddress, setEthAddress] = useState(null);
  const [amount, setAmount] = useState('');
  const [suiPrivateKey, setSuiPrivateKey] = useState('');
  const [status, setStatus] = useState('');
  const [suiAddress, setSuiAddress] = useState(null);

  const adminAddress = '0x802abd7576a8b07c3d1139085679e55ded3c5b120c0ea888977e10d2491f3a41';
  const cointype = '0xe622f5fe68cbac8ec2e189f806db66de736a398fbd177687a59d87ab5e84cd1f::ananas::ANANAS';
  
  const wallet = useWallet();
  const connectEthWallet = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        setEthAddress(accounts[0]);
      } else {
        alert('MetaMask is not installed.');
      }
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
    }
  };

  const mergeCoin = async (suiPrivateKey) => {
    try {
      const keypair = Ed25519Keypair.fromSecretKey(suiPrivateKey);
      const client = new SuiClient({
        url: getFullnodeUrl('testnet'),
      });
      const coins = await client.getCoins({
        owner: wallet.account.address,
        coinType: cointype,
      });

      let coinsArray = [];
      for (const coin of coins.data) {
        coinsArray.push(coin.coinObjectId);
      }

      if (coinsArray.length === 0) {
        console.log('No coins found');
        return;
      }

      if (coinsArray.length === 1) {
        console.log('One coin, no need to merge');
        return;
      }
      const lastCoin = coinsArray.pop();
      const tx = new Transaction();
      tx.mergeCoins(lastCoin, coinsArray);
      const result = await client.signAndExecuteTransaction({
        signer: keypair,
        transaction: tx,
      });
      console.log(result);
      console.log({ result });
    } catch (error) {
      console.error('Error sending transaction:', error);
    }
  };

  const transferCoin = async (amount, recipientAddress, suiPrivateKey) => {
    if (!wallet.connected) {
      setStatus('Please connect to Suiet Wallet');
      return;
    }
    try {
      const keypair = Ed25519Keypair.fromSecretKey(suiPrivateKey);
      const client = new SuiClient({
        url: getFullnodeUrl('testnet'),
      });
      const coins = await client.getCoins({
        owner: wallet.account.address,
        coinType: cointype,
      });

      const decimals = 9;
      const amountDecimal = amount * 10 ** decimals;

      const tx = new Transaction();
      const coin = tx.splitCoins(coins.data[0].coinObjectId, [amountDecimal]);
      console.log(tx);
      tx.transferObjects([coin], recipientAddress);
      const result = await client.signAndExecuteTransaction({
        signer: keypair,
        transaction: tx,
      });
    } catch (error) {
      console.error('Error transferring coins:', error);
    }
  };

  const suiToEth = async (amount, recipientAddress) => {
    try {
      const client = new SuiClient({
        url: getFullnodeUrl('testnet'),
      });
      const coins = await client.getCoins({
        owner: adminAddress,
        coinType:cointype,
      });

      const decimals = 9;
      const amountDecimal = amount * 10 ** decimals;

      let coinToBurn;
      for (const coin of coins.data) {
        const txn = await client.getObject({
          id: coin.coinObjectId,
          options: { showContent: true },
        });

        if (txn.data.content.fields['balance'] == amountDecimal) {
          coinToBurn = txn.data.content.fields['id'].id;
          break;
        }
      }
      console.log(coinToBurn);

      const backendUrl = 'http://localhost:5000/Sui_to_Eth';
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coin_id: coinToBurn,
          recipientAddress: recipientAddress,
          amount: amount,
        }),
      });

      const data = await response.json();
      console.log(coinToBurn);

      if (data.success) {
        alert(`Successfully transferred ${amount} ANS to ${recipientAddress}`);
      } else {
        alert('Error transferring tokens: ' + data.message);
      }
    } catch (error) {
      console.error('Error sending transaction:', error);
    }
  };



  const handleTransaction = async (amount, suiPrivateKey) => {
    if (!wallet.connected) {
      setStatus('Please connect to Suiet Wallet');
      return;
    }
    const recipientAddress = ethAddress;
    mergeCoin(suiPrivateKey);
    transferCoin(amount, adminAddress, suiPrivateKey);
    suiToEth(amount, recipientAddress);
  };



  const handleEthToSui = async (amount) => {
    if (!ethAddress || !wallet.account?.address) {
      alert('Please connect both Ethereum and SUI wallets.');
      return;
    }
  
    try {
      const backendUrl = 'http://localhost:5000/Eth_to_Sui';
      const recipient = wallet.account.address;
      const fromAddress = ethAddress;
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientAddress: recipient,
          fromAddress: fromAddress,
          amount: amount,
        }),
      });
  
      const data = await response.json();
      if (data.success) {
        alert(`Successfully transferred ${amount} ANS to ${recipient}`);
      } else {
        alert('Error transferring tokens: ' + data.message);
      }
    } catch (error) {
      console.error('Error transferring:', error);
    }
  };



  useEffect(() => {
    console.log("Wallet connected:", wallet.connected);
    console.log("Wallet account:", wallet.account);
    if (wallet.connected && wallet.account?.address) {
      setSuiAddress(wallet.account.address);
    } else {
      setSuiAddress(null);
    }
  }, [wallet.connected, wallet.account]);
  
  return (
    <WalletProvider>
      <Router>
        <div className="card">
          <h2>Transfer Tokens</h2>
  
          {/* Ethereum Wallet Connect */}
          <div className="wallet-section">
            <button onClick={connectEthWallet} className="connect-button">
              Connect Ethereum Wallet
            </button>
            <p>
              <strong>Ethereum Wallet Address:</strong>{' '}
              {ethAddress || 'Not Connected'}
            </p>
          </div>
  
          {/* SUI Wallet Connect */}
          <div className="wallet-section">
            <ConnectButton className="suiet-connect-button" />
            <p>
              <strong>SUI Wallet Address:</strong>{' '}
              {suiAddress || 'Not Connected'}
            </p>
          </div>
  
          {/* Transfer Buttons */}
          <div className="button-container">
            <div className="transfer-section">
              <h3>Transfer ETH to SUI</h3>
              <label htmlFor="eth-to-sui-amount">Amount to bridge:</label>
              <input
                type="number"
                id="eth-to-sui-amount"
                placeholder="Enter ETH amount"
                onChange={(e) => setAmount(e.target.value)}
              />
              <button
                onClick={() => handleEthToSui(amount)}
                disabled={!amount}
                className="transfer-button"
              >
                Transfer ETH to SUI
              </button>
            </div>
  
            <div className="transfer-section">
              <h3>Transfer SUI to ETH</h3>
              <label htmlFor="sui-private-key">Sui Private Key:</label>
              <input
                type="text"
                id="sui-private-key"
                placeholder="Enter private key"
                onChange={(e) => setSuiPrivateKey(e.target.value)}
              />
              <label htmlFor="sui-amount">Amount to bridge:</label>
              <input
                type="number"
                id="sui-amount"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <button
                onClick={() => handleTransaction(amount, suiPrivateKey)}
                disabled={!amount || !suiPrivateKey}
                className="transfer-button"
              >
                Transfer SUI to ETH
              </button>
            </div>
          </div>
  
          {/* Status Message */}
          {status && <p className="status">{status}</p>}
        </div>
      </Router>
    </WalletProvider>
  );
}

export default App;
