# 🐍 Snake Web3 Game

> A decentralized Snake game built on Shardeum blockchain featuring on-chain scoring, NFT rewards, and competitive leaderboards.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Blockchain](https://img.shields.io/badge/blockchain-Shardeum-orange.svg)
![Framework](https://img.shields.io/badge/framework-Hardhat-yellow.svg)

## 📖 Overview

Snake Web3 Game revolutionizes the classic Snake experience by integrating blockchain technology. Players can enjoy the nostalgic gameplay while earning cryptocurrency rewards and competing on an immutable global leaderboard powered by Shardeum's fast and affordable blockchain infrastructure.

### 🎯 Key Features

- **🎮 Classic Snake Gameplay**: Smooth HTML5 canvas-based game engine
- **🔗 Web3 Integration**: Seamless MetaMask wallet connectivity
- **⛓️ On-Chain Scoring**: Permanent score storage on Shardeum blockchain
- **🏆 Global Leaderboard**: Real-time competitive rankings
- **🎁 NFT Rewards**: Collectible tokens for high-scoring players
- **💎 SHM Token Rewards**: Cryptocurrency incentives for achievements
- **📱 Mobile Responsive**: Optimized for all devices with touch controls
- **🌙 Dark Mode**: User-friendly interface customization

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Smart Contract │    │   Shardeum      │
│                 │    │                  │    │   Network       │
│ • HTML5 Canvas  │◄──►│ • Score Storage  │◄──►│ • Fast TXs      │
│ • Web3.js       │    │ • NFT Minting    │    │ • Low Fees      │
│ • MetaMask      │    │ • Leaderboard    │    │ • Decentralized │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16.0.0 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - [Download here](https://git-scm.com/)
- **MetaMask** browser extension - [Install here](https://metamask.io/)

### Installation

1. **Clone the Repository**
```bash
git clone https://github.com/yourusername/snake-web3-game.git
cd snake-web3-game
```

2. **Set Up Smart Contract Environment**
```bash
cd smart-contract
npm install
```

3. **Configure MetaMask for Shardeum**
   - Open MetaMask
   - Add Shardeum Unstablenet with these settings:
     ```
     Network Name: Shardeum Unstablenet
     RPC URL: https://unstable-api-testnet.shardeum.com
     Chain ID: 8081
     Currency: SHM
     Block Explorer: https://explorer-unstable.shardeum.org/
     ```

4. **Get Test Tokens**
   - Visit [Shardeum Faucet](https://faucet-unstable.shardeum.com/)
   - Request SHM tokens for your wallet address

5. **Deploy Smart Contract**
```bash
# Create .env file and add your private key
echo "PRIVATE_KEY=your_private_key_here" > .env

# Compile and deploy
npm run compile
npm run deploy
```

6. **Configure Frontend**
```bash
cd ../frontend
# Update CONTRACT_ADDRESS in web3.js with deployed contract address
```

7. **Launch Application**
```bash
# Option 1: Using Python
python -m http.server 8000

# Option 2: Using Node.js
npx http-server -p 8000

# Option 3: Using VS Code Live Server extension
```

8. **Open Your Browser**
   - Navigate to `http://localhost:8000`
   - Connect your MetaMask wallet
   - Start playing!

## 🎮 How to Play

1. **Connect Wallet**: Click "Connect Wallet" and approve MetaMask connection
2. **Start Game**: Press "Start Game" or spacebar to begin
3. **Control Snake**: Use arrow keys, WASD, or swipe on mobile
4. **Eat Food**: Guide snake to red food pellets to grow and score
5. **Submit Score**: After game over, submit your score to the blockchain
6. **Claim Rewards**: Earn NFTs and SHM tokens for scores ≥ 50 points
7. **Check Leaderboard**: View your ranking against other players globally

## 🛠️ Development

### Project Structure

```
snake-web3-game/
├── smart-contract/
│   ├── contracts/
│   │   └── SnakeGame.sol      # Main smart contract
│   ├── scripts/
│   │   └── deploy.js          # Deployment script
│   ├── hardhat.config.js      # Hardhat configuration
│   └── package.json           # Contract dependencies
├── frontend/
│   ├── index.html             # Main HTML file
│   ├── style.css              # Styling and animations
│   ├── script.js              # Main application logic
│   ├── game.js                # Snake game engine
│   └── web3.js                # Blockchain integration
└── README.md                  # This file
```

### Smart Contract Functions

- `submitScore(uint256 _score)`: Submit game score to blockchain
- `claimReward()`: Claim NFT and SHM token rewards
- `getLeaderboard()`: Retrieve top 10 players
- `getPlayerStats(address _player)`: Get player statistics
- `getGameHistory(address _player)`: View player's game history

### Available Scripts

**Smart Contract:**
```bash
npm run compile    # Compile smart contracts
npm run deploy     # Deploy to Shardeum testnet
npm run test       # Run contract tests
npm run clean      # Clean build artifacts
```

**Frontend:**
```bash
# No build process required - pure HTML/CSS/JS
# Simply serve files using any HTTP server
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `smart-contract` directory:

```env
PRIVATE_KEY=your_metamask_private_key_here
SHARDEUM_RPC_URL=https://unstable-api-testnet.shardeum.com
```

### Network Configuration

The project is pre-configured for Shardeum Unstablenet. To use different networks, modify `hardhat.config.js`:

```javascript
networks: {
  shardeum_mainnet: {
    url: "https://api-mainnet.shardeum.com",
    chainId: 8080,
    accounts: [process.env.PRIVATE_KEY]
  }
}
```

## 🎁 Reward System

- **Score Threshold**: 50 points minimum for rewards
- **NFT Rewards**: Unique collectible tokens with game metadata
- **SHM Tokens**: 10 SHM per qualifying game session
- **Achievement System**: Unlock special rewards for milestones

## 🔒 Security Features

- **Input Validation**: All user inputs are sanitized and validated
- **Reentrancy Protection**: Smart contract uses OpenZeppelin's security patterns
- **Access Control**: Owner-only functions for contract management
- **Error Handling**: Comprehensive error messages and fallback mechanisms

## 📊 Gas Optimization

The smart contract is optimized for minimal gas usage:
- Efficient data structures for leaderboard management
- Batch operations where possible
- Optimized storage patterns

Average gas costs on Shardeum:
- Score Submission: ~45,000 gas
- Reward Claiming: ~120,000 gas
- Leaderboard Query: Free (view function)

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 🧪 Testing

### Smart Contract Tests
```bash
cd smart-contract
npm test
```

### Frontend Testing
- Manual testing on multiple browsers
- Mobile responsiveness verification
- Web3 integration testing with MetaMask

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Shardeum Team**: For providing an excellent EVM-compatible blockchain
- **OpenZeppelin**: For secure smart contract libraries
- **MetaMask**: For seamless Web3 wallet integration
- **Hardhat**: For robust development framework

## 📞 Support

Having issues? We're here to help:

- 📧 Email: support@snakeweb3game.com
- 💬 Discord: [Join our community](https://discord.gg/snakeweb3)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/snake-web3-game/issues)
- 📖 Documentation: [Full Docs](https://docs.snakeweb3game.com)

## 🚀 Roadmap

### Version 2.0 (Coming Soon)
- [ ] Multiplayer battles
- [ ] Tournament system
- [ ] Advanced NFT traits
- [ ] Staking mechanisms
- [ ] Cross-chain compatibility

### Version 3.0 (Future)
- [ ] 3D Snake gameplay
- [ ] VR/AR integration
- [ ] DAO governance
- [ ] NFT marketplace
- [ ] Mobile app

---

<div align="center">

**Built with ❤️ for the Shardeum ecosystem**



</div>