// Web3 Integration for Snake Game
class Web3Manager {
    constructor() {
        // Replace with your deployed contract address
        this.contractAddress = "0x704eEB5Dfd7C882707bc563AcaB0a4D2127a2738";
        this.contractABI = [
            {
                "inputs": [],
                "name": "claimReward",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [{"internalType": "uint256", "name": "_score", "type": "uint256"}],
                "name": "submitScore",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "getLeaderboard",
                "outputs": [
                    {
                        "components": [
                            {"internalType": "address", "name": "player", "type": "address"},
                            {"internalType": "uint256", "name": "score", "type": "uint256"},
                            {"internalType": "uint256", "name": "timestamp", "type": "uint256"}
                        ],
                        "internalType": "struct SnakeGame.LeaderboardEntry[10]",
                        "name": "",
                        "type": "tuple[10]"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [{"internalType": "address", "name": "_player", "type": "address"}],
                "name": "getPlayerStats",
                "outputs": [
                    {
                        "components": [
                            {"internalType": "address", "name": "wallet", "type": "address"},
                            {"internalType": "uint256", "name": "highScore", "type": "uint256"},
                            {"internalType": "uint256", "name": "totalGames", "type": "uint256"},
                            {"internalType": "uint256", "name": "totalRewards", "type": "uint256"},
                            {"internalType": "uint256", "name": "lastPlayTime", "type": "uint256"}
                        ],
                        "internalType": "struct SnakeGame.Player",
                        "name": "",
                        "type": "tuple"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [{"internalType": "address", "name": "_player", "type": "address"}],
                "name": "getGameHistory",
                "outputs": [
                    {
                        "components": [
                            {"internalType": "address", "name": "player", "type": "address"},
                            {"internalType": "uint256", "name": "score", "type": "uint256"},
                            {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
                            {"internalType": "bool", "name": "rewardClaimed", "type": "bool"}
                        ],
                        "internalType": "struct SnakeGame.GameSession[]",
                        "name": "",
                        "type": "tuple[]"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "anonymous": false,
                "inputs": [
                    {"indexed": true, "internalType": "address", "name": "player", "type": "address"},
                    {"indexed": false, "internalType": "uint256", "name": "score", "type": "uint256"},
                    {"indexed": false, "internalType": "uint256", "name": "sessionId", "type": "uint256"}
                ],
                "name": "ScoreSubmitted",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {"indexed": true, "internalType": "address", "name": "player", "type": "address"},
                    {"indexed": false, "internalType": "uint256", "name": "tokenId", "type": "uint256"},
                    {"indexed": false, "internalType": "uint256", "name": "shmAmount", "type": "uint256"}
                ],
                "name": "RewardClaimed",
                "type": "event"
            }
        ];
        
        this.provider = null;
        this.signer = null;
        this.contract = null;
        this.userAddress = null;
        this.isConnected = false;
        
        this.shardeumNetwork = {
            chainId: '0x1f91', // 8081 in hex
            chainName: 'Shardeum Unstablenet',
            nativeCurrency: {
                name: 'Shardeum',
                symbol: 'SHM',
                decimals: 18
            },
            rpcUrls: ['https://unstable-api-testnet.shardeum.com'],
            blockExplorerUrls: ['https://explorer-unstable.shardeum.org/']
        };
        
        this.init();
    }
    
    async init() {
        if (typeof window.ethereum !== 'undefined') {
            console.log('MetaMask detected');
            this.provider = new ethers.BrowserProvider(window.ethereum);
            
            // Listen for account changes
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    this.disconnect();
                } else {
                    this.userAddress = accounts[0];
                    this.updateUI();
                }
            });
            
            // Listen for network changes
            window.ethereum.on('chainChanged', (chainId) => {
                if (chainId !== this.shardeumNetwork.chainId) {
                    this.showNotification('Please switch to Shardeum Unstablenet', 'error');
                }
            });
            
            // Check if already connected
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                this.userAddress = accounts[0];
                await this.connectToContract();
                this.isConnected = true;
                this.updateUI();
            }
        } else {
            this.showNotification('Please install MetaMask to play!', 'error');
        }
    }
    
    async connectWallet() {
        try {
            if (!window.ethereum) {
                throw new Error('MetaMask not installed');
            }
            
            this.showLoading('Connecting wallet...');
            
            // Request account access
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });
            
            this.userAddress = accounts[0];
            
            // Check if on correct network
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            if (chainId !== this.shardeumNetwork.chainId) {
                await this.switchToShardeum();
            }
            
            await this.connectToContract();
            this.isConnected = true;
            this.updateUI();
            this.hideLoading();
            
            this.showNotification('Wallet connected successfully!', 'success');
            
            // Load player data
            await this.loadPlayerData();
            
        } catch (error) {
            console.error('Wallet connection failed:', error);
            this.hideLoading();
            this.showNotification(`Connection failed: ${error.message}`, 'error');
        }
    }
    
    async switchToShardeum() {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: this.shardeumNetwork.chainId }],
            });
        } catch (switchError) {
            // Network not added, try to add it
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [this.shardeumNetwork],
                    });
                } catch (addError) {
                    throw new Error('Failed to add Shardeum network');
                }
            } else {
                throw switchError;
            }
        }
    }
    
    async connectToContract() {
        if (this.contractAddress === "YOUR_CONTRACT_ADDRESS_HERE") {
            console.warn('Contract address not set. Please deploy contract and update address.');
            return;
        }
        
        this.signer = await this.provider.getSigner();
        this.contract = new ethers.Contract(this.contractAddress, this.contractABI, this.signer);
    }
    
    disconnect() {
        this.userAddress = null;
        this.signer = null;
        this.contract = null;
        this.isConnected = false;
        this.updateUI();
        this.showNotification('Wallet disconnected', 'info');
    }
    
    async submitScore(score) {
        try {
            if (!this.isConnected || !this.contract) {
                throw new Error('Wallet not connected');
            }
            
            this.showLoading('Submitting score to blockchain...');
            
            const tx = await this.contract.submitScore(score);
            
            this.showLoading('Confirming transaction...');
            const receipt = await tx.wait();
            
            this.hideLoading();
            this.showNotification(`Score ${score} submitted successfully!`, 'success');
            
            // Refresh data
            await this.loadPlayerData();
            await this.loadLeaderboard();
            
            return receipt;
            
        } catch (error) {
            console.error('Score submission failed:', error);
            this.hideLoading();
            
            let errorMessage = 'Transaction failed';
            if (error.message.includes('user rejected')) {
                errorMessage = 'Transaction cancelled by user';
            } else if (error.message.includes('insufficient funds')) {
                errorMessage = 'Insufficient SHM for gas fees';
            }
            
            this.showNotification(errorMessage, 'error');
            throw error;
        }
    }
    
    async claimReward() {
        try {
            if (!this.isConnected || !this.contract) {
                throw new Error('Wallet not connected');
            }
            
            this.showLoading('Claiming rewards...');
            
            const tx = await this.contract.claimReward();
            
            this.showLoading('Confirming transaction...');
            const receipt = await tx.wait();
            
            this.hideLoading();
            this.showNotification('Rewards claimed successfully! 🎉', 'success');
            
            // Refresh data
            await this.loadPlayerData();
            
            return receipt;
            
        } catch (error) {
            console.error('Reward claim failed:', error);
            this.hideLoading();
            
            let errorMessage = 'Claim failed';
            if (error.message.includes('Score too low')) {
                errorMessage = 'Score too low for rewards (minimum: 50)';
            } else if (error.message.includes('No unclaimed rewards')) {
                errorMessage = 'No unclaimed rewards available';
            } else if (error.message.includes('user rejected')) {
                errorMessage = 'Transaction cancelled by user';
            }
            
            this.showNotification(errorMessage, 'error');
            throw error;
        }
    }
    
    async loadPlayerData() {
        try {
            if (!this.isConnected || !this.contract) return;
            
            const playerStats = await this.contract.getPlayerStats(this.userAddress);
            
            // Update UI with player stats
            document.getElementById('highScore').textContent = playerStats.highScore.toString();
            document.getElementById('gamesPlayed').textContent = playerStats.totalGames.toString();
            document.getElementById('nftsEarned').textContent = playerStats.totalRewards.toString();
            
            // Load game history
            await this.loadGameHistory();
            
        } catch (error) {
            console.error('Failed to load player data:', error);
        }
    }
    
    async loadGameHistory() {
        try {
            if (!this.isConnected || !this.contract) return;
            
            const history = await this.contract.getGameHistory(this.userAddress);
            const historyContainer = document.getElementById('playerHistory');
            
            if (history.length === 0) {
                historyContainer.innerHTML = '<p class="no-data">No games played yet</p>';
                return;
            }
            
            historyContainer.innerHTML = '';
            
            // Sort by timestamp (newest first)
            const sortedHistory = [...history].sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
            
            sortedHistory.forEach((session, index) => {
                const historyItem = document.createElement('div');
                historyItem.className = `history-item ${session.rewardClaimed ? 'claimed' : ''}`;
                
                const date = new Date(Number(session.timestamp) * 1000).toLocaleDateString();
                
                historyItem.innerHTML = `
                    <div>
                        <span class="history-score">Score: ${session.score}</span>
                        <span class="history-date">${date}</span>
                    </div>
                    <div>
                        ${session.rewardClaimed ? '✅ Reward Claimed' : '⏳ Pending'}
                    </div>
                `;
                
                historyContainer.appendChild(historyItem);
            });
            
        } catch (error) {
            console.error('Failed to load game history:', error);
        }
    }
    
    async loadLeaderboard() {
        try {
            if (!this.contract) {
                // If no contract, try to create read-only connection
                if (this.contractAddress !== "YOUR_CONTRACT_ADDRESS_HERE") {
                    const provider = new ethers.JsonRpcProvider('https://unstable-api-testnet.shardeum.com');
                    const contract = new ethers.Contract(this.contractAddress, this.contractABI, provider);
                    const leaderboard = await contract.getLeaderboard();
                    this.updateLeaderboardUI(leaderboard);
                }
                return;
            }
            
            const leaderboard = await this.contract.getLeaderboard();
            this.updateLeaderboardUI(leaderboard);
            
        } catch (error) {
            console.error('Failed to load leaderboard:', error);
        }
    }
    
    updateLeaderboardUI(leaderboard) {
        const leaderboardList = document.getElementById('leaderboardList');
        leaderboardList.innerHTML = '';
        
        let hasData = false;
        
        for (let i = 0; i < leaderboard.length; i++) {
            const entry = leaderboard[i];
            
            // Skip empty entries
            if (entry.player === '0x0000000000000000000000000000000000000000' || entry.score === 0) {
                continue;
            }
            
            hasData = true;
            
            const listItem = document.createElement('div');
            listItem.className = 'leaderboard-item';
            
            const rank = i + 1;
            const rankEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
            
            const shortAddress = `${entry.player.substring(0, 6)}...${entry.player.substring(38)}`;
            const date = new Date(Number(entry.timestamp) * 1000).toLocaleDateString();
            
            listItem.innerHTML = `
                <span>${rankEmoji}</span>
                <span title="${entry.player}">${shortAddress}</span>
                <span>${entry.score}</span>
                <span>${date}</span>
            `;
            
            // Highlight current user
            if (this.userAddress && entry.player.toLowerCase() === this.userAddress.toLowerCase()) {
                listItem.style.background = 'rgba(78, 205, 196, 0.2)';
                listItem.style.borderLeftColor = '#4ecdc4';
            }
            
            leaderboardList.appendChild(listItem);
        }
        
        if (!hasData) {
            leaderboardList.innerHTML = `
                <div class="leaderboard-item">
                    <span>-</span>
                    <span>No players yet</span>
                    <span>-</span>
                    <span>-</span>
                </div>
            `;
        }
    }
    
    updateUI() {
        const connectButton = document.getElementById('connectWallet');
        const walletInfo = document.getElementById('walletInfo');
        const walletAddress = document.getElementById('walletAddress');
        
        if (this.isConnected && this.userAddress) {
            connectButton.classList.add('hidden');
            walletInfo.classList.remove('hidden');
            walletAddress.textContent = `${this.userAddress.substring(0, 6)}...${this.userAddress.substring(38)}`;
        } else {
            connectButton.classList.remove('hidden');
            walletInfo.classList.add('hidden');
        }
    }
    
    showLoading(text = 'Processing...') {
        const overlay = document.getElementById('loadingOverlay');
        const loadingText = document.getElementById('loadingText');
        loadingText.textContent = text;
        overlay.classList.remove('hidden');
    }
    
    hideLoading() {
        document.getElementById('loadingOverlay').classList.add('hidden');
    }
    
    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        const notificationText = document.getElementById('notificationText');
        
        notification.className = `notification ${type}`;
        notificationText.textContent = message;
        notification.classList.remove('hidden');
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 5000);
    }
    
    hideNotification() {
        document.getElementById('notification').classList.add('hidden');
    }
    
    // Helper function to format address
    formatAddress(address) {
        if (!address) return '';
        return `${address.substring(0, 6)}...${address.substring(38)}`;
    }
    
    // Helper function to format timestamp
    formatDate(timestamp) {
        return new Date(Number(timestamp) * 1000).toLocaleDateString();
    }
    
    // Check if user can claim rewards
    async canClaimRewards() {
        try {
            if (!this.isConnected || !this.contract) return false;
            
            const playerStats = await this.contract.getPlayerStats(this.userAddress);
            return Number(playerStats.highScore) >= 50; // REWARD_THRESHOLD
            
        } catch (error) {
            console.error('Error checking reward eligibility:', error);
            return false;
        }
    }
    
    // Get network info
    async getNetworkInfo() {
        try {
            const network = await this.provider.getNetwork();
            return {
                chainId: Number(network.chainId),
                name: network.name
            };
        } catch (error) {
            console.error('Error getting network info:', error);
            return null;
        }
    }
    
    // Get account balance
    async getBalance() {
        try {
            if (!this.userAddress) return '0';
            
            const balance = await this.provider.getBalance(this.userAddress);
            return ethers.formatEther(balance);
        } catch (error) {
            console.error('Error getting balance:', error);
            return '0';
        }
    }
}

// Initialize Web3Manager
const web3Manager = new Web3Manager();