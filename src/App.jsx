import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import { useEffect, useState } from 'react';

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

  const renderConnectedContainer = () => {
    return (
      <div className='connected-container'>
        <div className='gif-grid'>
          {TEST_GIFS?.map((gif) => (
            <div className='gif-item' key={gif}>
              <img src={gif} alt={gif}/>
            </div>
          ))}
        </div>
      </div>
    )
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);
  console.log(walletAddress)
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