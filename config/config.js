
export const chains = ['goerli', 'fuji', 'wanchainTestnet', 'xdcTestnet'];

export const chainsConfig = {
  goerli: require('./deployed/goerli.json'),
  fuji: require('./deployed/fuji.json'),
  wanchainTestnet: require('./deployed/wanchainTestnet.json'),
  xdcTestnet: require('./deployed/xdcTestnet.json'),
}

export const bip44ChainIds = {
  goerli: 2147483708,
  fuji: 2147492648,
  wanchainTestnet: 2153201998,
  xdcTestnet: 2147484198,
}

export const MOCK_APP_ABI = require('./abis/MockApp.json');
export const MOCK_TOKEN_ABI = require('./abis/MockToken.json');
export const CCPOOL_ABI = require('./abis/CCPool.json');

export const rpcUrls = {
  goerli: 'https://nodes-testnet.wandevs.org/eth',
  fuji: 'https://api.avax-test.network/ext/bc/C/rpc',
  wanchainTestnet: 'https://gwan-ssl.wandevs.org:46891',
  xdcTestnet: 'https://erpc.apothem.network',
}

export const walletChainIds = {
  goerli: 5,
  fuji: 43113,
  wanchainTestnet: 999,
  xdcTestnet: 51,
}

