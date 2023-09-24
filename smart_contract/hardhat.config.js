require('@nomiclabs/hardhat-waffle')

module.exports ={
  solidity: '0.8.0',
  defaultNetwork: "sepolia",
  networks:{
    sepolia: {
      url: 'https://eth-sepolia.g.alchemy.com/v2/yLOzE8YZOgIdQJI8Z9BhWskhW5zMX1DA',
      accounts: ['0fbf1988eb6a11f634015e8667eceb9500ae26778dbbf1625af18301c8ae560a']
    }
  },
}