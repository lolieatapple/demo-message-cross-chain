"use client";
import { CCPOOL_ABI, MOCK_APP_ABI, MOCK_TOKEN_ABI, bip44ChainIds, chains, chainsConfig, rpcUrls, walletChainIds } from '@/config/config';
import {ethers} from 'ethers';
import {useEffect, useState} from 'react';


export default function Home() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState(null);
  const [fromChain, setFromChain] = useState('goerli');
  const [toChain, setToChain] = useState('fuji');
  const [messageContent, setMessageContent] = useState('');
  const [messageId, setMessageId] = useState('');
  const [queryMessageId, setQueryMessageId] = useState('');
  const [messageContent2, setMessageContent2] = useState('None');
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [balance1, setBalance1] = useState('0');
  const [balance2, setBalance2] = useState('0');
  const [poolBalance1, setPoolBalance1] = useState('0');
  const [poolBalance2, setPoolBalance2] = useState('0');
  const [feeBalance1, setFeeBalance1] = useState('0');
  const [feeBalance2, setFeeBalance2] = useState('0');

  useEffect(()=>{

    const func = async ()=>{
      if (!address) {
        return;
      }
      const rpc = rpcUrls[fromChain];
      const provider = new ethers.providers.JsonRpcProvider(rpc);
      const mockToken = new ethers.Contract(chainsConfig[fromChain].mockToken, MOCK_TOKEN_ABI, provider);
      const balance = await mockToken.balanceOf(address);
      setBalance1(balance.toString() / 1e18);

      // update balance2 
      const rpc2 = rpcUrls[toChain];
      const provider2 = new ethers.providers.JsonRpcProvider(rpc2);
      const mockToken2 = new ethers.Contract(chainsConfig[toChain].mockToken, MOCK_TOKEN_ABI, provider2);
      const balance2 = await mockToken2.balanceOf(address);
      setBalance2(balance2.toString() / 1e18);

      // update mockToken balance of poolBalance1 and poolBalance2 
      const poolBalance1 = await mockToken.balanceOf(chainsConfig[fromChain].ccPool);
      setPoolBalance1(poolBalance1.toString() / 1e18);

      const poolBalance2 = await mockToken2.balanceOf(chainsConfig[toChain].ccPool);
      setPoolBalance2(poolBalance2.toString() / 1e18);

      // update native coin feeBalance1 and feeBalance2
      const feeBalance1 = await provider.getBalance(chainsConfig[fromChain].ccPool);
      setFeeBalance1(feeBalance1.toString() / 1e18);

      const feeBalance2 = await provider2.getBalance(chainsConfig[toChain].ccPool);
      setFeeBalance2(feeBalance2.toString() / 1e18);

    };

    func();
    // update mockToken balance every 20 seconds 
    const interval = setInterval(func, 10000);

    return ()=>{
      clearInterval(interval);
    }
  }, [address, fromChain, toChain]);


  return (
    <main>
      <div className="title-section">
        <h1>Message Cross Chain Demo</h1>
        {
          address ? <button>Address: {address}</button> : <button onClick={async ()=>{
            const provider = new ethers.providers.Web3Provider(window.ethereum);

            await provider.send("eth_requestAccounts", []);

            const signer = provider.getSigner();

            // compare chainId 
            const chainId = await provider.getNetwork().then(v=>v.chainId);
            const walletChainId = walletChainIds[fromChain];
            if (chainId !== walletChainId) {
              alert(`Please switch wallet to ${fromChain} network and Connect Wallet again`);
              return;
            }

            setSigner(signer);
            setProvider(provider);
            setAddress(await signer.getAddress());

            // monitor the metamask account change
            window.ethereum.on('accountsChanged', async (accounts) => {
              const signer = provider.getSigner();
              setAddress(accounts[0]);
              setSigner(signer);
            });

            // monitor the metamask chainId change
            window.ethereum.on('chainChanged', async (chainId) => {
              const signer = provider.getSigner();
              const provider = new ethers.providers.Web3Provider(window.ethereum);
              await provider.send("eth_requestAccounts", []);
              setProvider(provider);
              setAddress(await signer.getAddress());
              setSigner(signer);
            });

          }}>Connect Wallet</button>
        }
      </div>
      <div className="content-section">
        <div className="chain-section">
          <div className="chain-box">
            <h4>Source Chain</h4>
            <select value={fromChain} onChange={e=>{
              console.log(e.target.value);
              setFromChain(e.target.value);
              setToChain(chains.filter(v=>v!==e.target.value)[0]);
              const checkChainId = async () => {
                if (!provider) {
                  return;
                }

                const chainId = await provider.getNetwork().then(v=>v.chainId);
                const walletChainId = walletChainIds[e.target.value];
                if (chainId !== walletChainId) {
                  setAddress('');
                  setProvider(null);
                  setSigner(null);
                  alert(`Please switch wallet to ${e.target.value} network and Connect Wallet again`);
                }
              }
              checkChainId();
            }
            }>
              {
                chains.map((chain, index) => {
                  return <option key={chain} value={chain}>{chain}</option>
                })
              }
            </select>
            <p>GateWay SC: {chainsConfig[fromChain].wmbGatewayProxy}</p>
          </div>
          <div className="chain-arrow">→</div>
          <div className="chain-box">
            <h4>Destination Chain</h4>
            <select value={toChain} onChange={e=>setToChain(e.target.value)}>
              {
                chains.filter(v=>v!== fromChain).map((chain, index) => {
                  return <option key={chain} value={chain}>{chain}</option>
                })
              }
            </select>
            <p>GateWay SC: {chainsConfig[toChain].wmbGatewayProxy}</p>
          </div>
        </div>
        <h2>Demo of Message Delivery</h2>
        <div className="message-section">
          <div className="message-box">
            <p>MockApp SC: {chainsConfig[fromChain].mockApp}</p>
            <input placeholder="Message Content in Hex String" value={messageContent} onChange={e=>setMessageContent(e.target.value)} />
            <button onClick={async ()=>{
              if (!provider || !signer) {
                alert('Please connect wallet first.');
                return;
              }
              setLoading(true);
              try {
                const mockApp = new ethers.Contract(chainsConfig[fromChain].mockApp, MOCK_APP_ABI, signer);
                const fee = await mockApp.estimateFee(bip44ChainIds[toChain], 300000);
                console.log('fee', fee);
                let tx = await mockApp.dispatchMessage(bip44ChainIds[toChain], chainsConfig[toChain].mockApp, messageContent, {value: fee});
                tx = await tx.wait();
                console.log('tx', tx);
                setMessageId(tx.events[0].topics[1]);
              } catch (error) {
                console.error(error);
              }
              
              setLoading(false);
            }}>Send</button>
            <p>MessageId: {loading ? "waiting..." : messageId}</p>
          </div>
          <div className="message-arrow">→</div>
          <div className="message-box">
            <p>MockApp SC: {chainsConfig[toChain].mockApp}</p>
            <input placeholder="MessageId" value={queryMessageId} onChange={e=>setQueryMessageId(e.target.value)} />
            <button onClick={async () => {
              const rpc = rpcUrls[toChain];
              const provider = new ethers.providers.JsonRpcProvider(rpc);
              const mockApp = new ethers.Contract(chainsConfig[toChain].mockApp, MOCK_APP_ABI, provider);
              const message = await mockApp.receivedMessages(queryMessageId);
              console.log('message', message);
              setMessageContent2(message.data);
            }}>Read</button>
            <p>Content: {messageContent2}</p>
          </div>
        </div>
        <h2>Demo of Custom Token Cross Chain</h2>
        <p>* Auto update every 10 seconds.</p>
        <p>* This demo is designed for the project party to subsidize the token cross-chain fee, and when the fee in the contract is insufficient, the cross-chain cannot be initiated</p>
        <div className="token-section">
          <div className="token-box">
            <p>Token SC: {chainsConfig[fromChain].mockToken}</p>
            <p>CCPool SC: {chainsConfig[fromChain].ccPool}</p>
            <p>CCPool Balance: {poolBalance1}</p>
            <p>Fee Balance: {feeBalance1}</p>
            <p>Wallet Balance: {balance1} <button onClick={async ()=>{
              if (!provider || !signer) {
                alert('Please connect wallet first.');
                return;
              }
              const mockToken = new ethers.Contract(chainsConfig[fromChain].mockToken, MOCK_TOKEN_ABI, signer);
              const tx = await mockToken.mint(address, ethers.utils.parseEther('100'));
              await tx.wait();
            }}>Faucet</button></p>
            <input placeholder="Amount in Ether" value={amount} onChange={e=>setAmount(e.target.value)} />
            <button onClick={async ()=>{
              try {
                if (!provider || !signer) {
                  alert('Please connect wallet first.');
                  return;
                }

                // check the mockToken allowance if not enough then call approve 
                const mockToken = new ethers.Contract(chainsConfig[fromChain].mockToken, MOCK_TOKEN_ABI, signer);
                const allowance = await mockToken.allowance(address, chainsConfig[fromChain].ccPool);
                console.log('allowance', allowance);
                if (allowance.lt(ethers.utils.parseEther(amount))) {
                  const tx = await mockToken.approve(chainsConfig[fromChain].ccPool, ethers.utils.parseEther(amount));
                  await tx.wait();
                  console.log('approved', tx);
                }

                // call ccPool function crossTo(uint256 toChainId, address to, uint256 amount) to cross chain 
                const ccPool = new ethers.Contract(chainsConfig[fromChain].ccPool, CCPOOL_ABI, signer);
                const tx2 = await ccPool.crossTo(bip44ChainIds[toChain], address, ethers.utils.parseEther(amount));
                await tx2.wait();
                console.log('crossed', tx2);

              } catch (error) {
                console.error(error);
              }
            }}>Send Cross Chain</button>
          </div>
          <div className="token-arrow">→</div>
          <div className="token-box">
            <p>Token SC: {chainsConfig[toChain].mockToken}</p>
            <p>CCPool SC: {chainsConfig[toChain].ccPool}</p>
            <p>CCPool Balance: {poolBalance2}</p>
            <p>Fee Balance: {feeBalance2}</p>
            <p>Wallet Balance: {balance2} </p>
          </div>
        </div>
      </div>
    </main>
  )
}
