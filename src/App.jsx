import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import { useEffect, useState } from 'react';
import idl from './idl.json';
import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider, web3 } from '@project-serum/anchor';

const { SystemProgram, Keypair} = web3;

let baseAccount = Keypair.generate();
const programID = new PublicKey(idl.address);

const network = clusterApiUrl("devnet");

const opts = {
  preflightCommitment: "processed",
};
// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const TEST_GIFS = [
  'https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3ZnV3MDJqdGpwMDlob2U3cWV6dmVnanpwOXk5MjFwZmRldGtzNHVyZSZlcD12MV9naWZzX3RyZW5kaW5nJmN0PWc/t5CvIjDqEJCGA/giphy.gif',
  'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExN2g1M2JyZnU2Ymc5cTNkenlieGtic2YweHo2bnZxemNlZWtvaXc5ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xWVe9xAaBFcdtm6F5U/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3azd0Nm1iaXM2Zzl2cXlkbHQ5Yzc3bHhtOXFsNTRtNHhhYWRyZjdhMCZlcD12MV9naWZzX3RyZW5kaW5nJmN0PWc/l378BaFZ8AUJ20NvW/giphy.gif',
]

const App = () => {

  const [walletAddress, setWalletAddress] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [gifList, setGifList] = useState(null);

  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;
      if (solana) {
        if (solana?.isPhantom) {
          console.log('Phantom Wallet is Found!');
          const res = await solana.connect({
            onlyIfTrusted: true
          })
          setWalletAddress(res?.publicKey?.toString())
        }
      } else {
        console.log('Solana object not found! Get a Phantom wallet!')
      }
    } catch (error) {
      console.log(error)
    }
  }

  const connectWallet = async () => {
    const { solana } = window;
    if (solana) {
      const response = await solana.connect();
      console.log(`Connected with key: ${response?.publicKey?.toString()}`)
    }
  }

  const renderNotConnectedContainer = () => {
    return (
      <button className="cta-button connect-wallet-button" onClick={connectWallet}>
        Connect Wallet
      </button>
    )
  }

  const onChangeInputValue = (event) => {
    const { value } =event?.target;
    setInputValue(value);
  }

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new AnchorProvider(connection, window?.solana, opts.preflightCommitment);
    return provider;
  }

  const createGifAccount = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      await program.rpc.startStuffOff({},{
      accounts: {
        baseAccount: baseAccount.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [baseAccount],
    });

    console.log("BaseAccount created:", baseAccount.publicKey.toString());
    await getGifList();
    } catch (error) {
      console.log(error)
    }
  }

  const sendGif = async () => {
    if (inputValue.length > 0) {
      console.log('Gif link', inputValue)
      setInputValue('');
      try {
        const provider = getProvider();
        const program = new Program(idl, programID, provider);

        await program.rpc.startStuffOff(inputValue,
          {
            accounts: {
              baseAccount: baseAccount.publicKey,
              user: provider.wallet.publicKey,
            }
          })

        await getGifList();
      } catch (error) {
        console.log(error)
      }
    } else {
      console.log('Please provide a link!')
    }
  }

  const getGifList = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
      console.log(account)
    } catch (error) {
      console.log(error)
    }
  }

  const renderConnectedContainer = () => {
    if (gifList === null) {
      return (
        <div className='connected-container'>
          <button className='cta-button submit-gif-button' onClick={createGifAccount}>
            Do One-Time Intialization for GIF Program Account
          </button>
        </div>
      )
    } else {
      return (
        <div className='connected-container'>
          <form onSubmit={(e) => {
            e.preventDefault();
            sendGif();
          }}>
            <input
              type="text"
              placeholder='Enter gif link!'
              value={inputValue}
              onChange={onChangeInputValue}
            />
            <button className='cta-button submit-gif-button'>Submit</button>
          </form>
          <div className='gif-grid'>
            {gifList?.map((gif) => (
              <div className='gif-item' key={gif}>
                <img src={gif} alt={gif} />
              </div>
            ))}
          </div>
        </div>
      )
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    getGifList();
    // if(walletAddress) {
    //   setGifList(TEST_GIFS)
    // }
  }, [walletAddress]);

  return (
    <div className="App">
      <div className={ walletAddress ? "authed-container" :"container"}>
        <div className="header-container">
          <p className="header">🖼 GIF Portal</p>
          <p className="sub-text">
            View your GIF collection in the metaverse ✨
          </p>
          {!walletAddress && renderNotConnectedContainer()}
          {walletAddress && renderConnectedContainer()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;