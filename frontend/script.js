// Main Application Logic
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Snake Game
    snakeGame = new SnakeGame('gameCanvas');
    
    // Initialize UI event listeners
    initializeEventListeners();
    
    // Load initial data
    initializeApp();
    
    // Auto-refresh leaderboard every 30 seconds
    setInterval(() => {
        web3Manager.loadLeaderboard();
    }, 30000);
});

function initializeEventListeners() {
    // Wallet connection
    document.getElementById('connectWallet').addEventListener('click', () => {
        web3Manager.connectWallet();
    });
    
    document.getElementById('disconnectWallet').addEventListener('click', () => {
        web3Manager.disconnect();
    });
    
    // Game controls
    document.getElementById('startGame').addEventListener('click', () => {
        if (!web3Manager.isConnected) {
            web3Manager.showNotification('Please connect your wallet first!', 'error');
            return;
        }
        snakeGame.startGame();
        updateGameButtons();
    });
    
    document.getElementById('pauseGame').addEventListener('click', () => {
        if (snakeGame.isGameRunning()) {
            snakeGame.togglePause();
            updateGameButtons();
        }
    });
    
    document.getElementById('playAgain').addEventListener('click', () => {
        snakeGame.resetGame();
        snakeGame.startGame();
        updateGameButtons();
    });
    
    // Score submission
    document.getElementById('submitScore').addEventListener('click', async () => {
        if (!web3Manager.isConnected) {
            web3Manager.showNotification('Please connect your wallet!', 'error');
            return;
        }
        
        const score = snakeGame.getScore();
        if (score === 0) {
            web3Manager.showNotification('No score to submit!', 'error');
            return;
        }
        
        try {
            const submitStatus = document.getElementById('submitStatus');
            submitStatus.className = 'submit-status loading';
            submitStatus.textContent = 'Submitting to blockchain...';
            
            await web3Manager.submitScore(score);
            
            submitStatus.className = 'submit-status success';
            submitStatus.textContent = `✅ Score ${score} submitted successfully!`;
            
            // Update claim reward button visibility
            updateClaimRewardButton();
            
        } catch (error) {
            const submitStatus = document.getElementById('submitStatus');
            submitStatus.className = 'submit-status error';
            submitStatus.textContent = `❌ Submission failed: ${error.message}`;
        }
    });
    
    // Reward claiming
    document.getElementById('claimReward').addEventListener('click', async () => {
        if (!web3Manager.isConnected) {
            web3Manager.showNotification('Please connect your wallet!', 'error');
            return;
        }
        
        try {
            await web3Manager.claimReward();
            updateClaimRewardButton();
        } catch (error) {
            console.error('Reward claim failed:', error);
        }
    });
    
    // Dark mode toggle
    document.getElementById('darkModeToggle').addEventListener('click', () => {
        toggleDarkMode();
    });
    
    // Refresh data
    document.getElementById('refreshData').addEventListener('click', async () => {
        web3Manager.showLoading('Refreshing data...');
        await Promise.all([
            web3Manager.loadPlayerData(),
            web3Manager.loadLeaderboard()
        ]);
        web3Manager.hideLoading();
        web3Manager.showNotification('Data refreshed!', 'success');
    });
    
    // Notification close
    document.getElementById('closeNotification').addEventListener('click', () => {
        web3Manager.hideNotification();
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // ESC to close notifications
        if (e.key === 'Escape') {
            web3Manager.hideNotification();
        }
        
        // Enter to connect wallet if not connected
        if (e.key === 'Enter' && !web3Manager.isConnected) {
            web3Manager.connectWallet();
        }
    });
}

async function initializeApp() {
    // Load leaderboard (works without wallet connection)
    await web3Manager.loadLeaderboard();
    
    // Check for saved dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
        document.body.classList.add('dark-mode');
        document.getElementById('darkModeToggle').textContent = '☀️ Light Mode';
    }
    
    // Show mobile controls on mobile devices
    if (isMobileDevice()) {
        document.getElementById('mobileControls').classList.remove('hidden');
        // Adjust canvas size for mobile
        adjustCanvasForMobile();
    }
    
    // Initialize tooltips and help text
    initializeHelp();
}

function updateGameButtons() {
    const startBtn = document.getElementById('startGame');
    const pauseBtn = document.getElementById('pauseGame');
    
    if (snakeGame.isGameRunning()) {
        startBtn.textContent = 'Restart Game';
        startBtn.className = 'btn btn-warning';
        pauseBtn.style.display = 'inline-block';
        pauseBtn.textContent = snakeGame.isPaused ? 'Resume' : 'Pause';
    } else {
        startBtn.textContent = 'Start Game';
        startBtn.className = 'btn btn-success';
        pauseBtn.style.display = 'none';
    }
}

async function updateClaimRewardButton() {
    const claimBtn = document.getElementById('claimReward');
    
    if (!web3Manager.isConnected) {
        claimBtn.style.display = 'none';
        return;
    }
    
    try {
        const canClaim = await web3Manager.canClaimRewards();
        if (canClaim) {
            claimBtn.style.display = 'inline-block';
            claimBtn.classList.add('bounce-in');
        } else {
            claimBtn.style.display = 'none';
        }
    } catch (error) {
        console.error('Error checking reward eligibility:', error);
        claimBtn.style.display = 'none';
    }
}

function toggleDarkMode() {
    const body = document.body;
    const darkModeBtn = document.getElementById('darkModeToggle');
    
    body.classList.toggle('dark-mode');
    
    if (body.classList.contains('dark-mode')) {
        darkModeBtn.textContent = '☀️ Light Mode';
        localStorage.setItem('darkMode', 'true');
    } else {
        darkModeBtn.textContent = '🌙 Dark Mode';
        localStorage.setItem('darkMode', 'false');
    }
}

function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
}

function adjustCanvasForMobile() {
    const canvas = document.getElementById('gameCanvas');
    const container = canvas.parentElement;
    
    if (window.innerWidth < 480) {
        canvas.style.width = '300px';
        canvas.style.height = '300px';
    } else if (window.innerWidth < 768) {
        canvas.style.width = '350px';
        canvas.style.height = '350px';
    }
}

function initializeHelp() {
    // Add helpful tooltips and instructions
    const connectBtn = document.getElementById('connectWallet');
    const startBtn = document.getElementById('startGame');
    
    connectBtn.title = 'Connect your MetaMask wallet to play and submit scores';
    startBtn.title = 'Start the Snake game - use arrow keys or WASD to control';
    
    // Show welcome message if first time user
    const hasPlayedBefore = localStorage.getItem('hasPlayedSnakeWeb3');
    if (!hasPlayedBefore) {
        setTimeout(() => {
            showWelcomeMessage();
            localStorage.setItem('hasPlayedSnakeWeb3', 'true');
        }, 1000);
    }
}

function showWelcomeMessage() {
    const message = `
        🎮 Welcome to Snake Web3! 
        
        🔗 Connect your MetaMask wallet
        🐍 Play the classic Snake game
        📝 Submit scores to Shardeum blockchain
        🏆 Compete on the global leaderboard
        🎁 Claim NFT rewards for high scores!
        
        Ready to play?
    `;
    
    web3Manager.showNotification(message, 'info');
}

// Game statistics tracking
class GameStats {
    constructor() {
        this.sessionsPlayed = 0;
        this.totalScore = 0;
        this.bestScore = 0;
        this.averageScore = 0;
    }
    
    recordGame(score) {
        this.sessionsPlayed++;
        this.totalScore += score;
        this.bestScore = Math.max(this.bestScore, score);
        this.averageScore = Math.round(this.totalScore / this.sessionsPlayed);
        
        this.saveStats();
    }
    
    saveStats() {
        const stats = {
            sessionsPlayed: this.sessionsPlayed,
            totalScore: this.totalScore,
            bestScore: this.bestScore,
            averageScore: this.averageScore
        };
        localStorage.setItem('snakeGameStats', JSON.stringify(stats));
    }
    
    loadStats() {
        const savedStats = localStorage.getItem('snakeGameStats');
        if (savedStats) {
            const stats = JSON.parse(savedStats);
            this.sessionsPlayed = stats.sessionsPlayed || 0;
            this.totalScore = stats.totalScore || 0;
            this.bestScore = stats.bestScore || 0;
            this.averageScore = stats.averageScore || 0;
        }
    }
    
    getStats() {
        return {
            sessionsPlayed: this.sessionsPlayed,
            totalScore: this.totalScore,
            bestScore: this.bestScore,
            averageScore: this.averageScore
        };
    }
}

// Initialize game statistics
const gameStats = new GameStats();
gameStats.loadStats();

// Monitor game end to record statistics
const originalEndGame = snakeGame?.endGame;
if (originalEndGame) {
    snakeGame.endGame = function() {
        const score = this.getScore();
        gameStats.recordGame(score);
        originalEndGame.call(this);
    };
}

// Network status monitoring
class NetworkMonitor {
    constructor() {
        this.isOnline = navigator.onLine;
        this.setupListeners();
    }
    
    setupListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            web3Manager.showNotification('Connection restored! 🌐', 'success');
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            web3Manager.showNotification('Connection lost! Game will continue offline. 📴', 'error');
        });
    }
    
    checkConnection() {
        return this.isOnline;
    }
}

const networkMonitor = new NetworkMonitor();

// Performance monitoring
class PerformanceMonitor {
    constructor() {
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fps = 60;
    }
    
    update() {
        this.frameCount++;
        const currentTime = performance.now();
        
        if (currentTime >= this.lastTime + 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
            this.frameCount = 0;
            this.lastTime = currentTime;
            
            // Warn if FPS is too low
            if (this.fps < 30) {
                console.warn('Low FPS detected:', this.fps);
            }
        }
    }
    
    getFPS() {
        return this.fps;
    }
}

const performanceMonitor = new PerformanceMonitor();

// Auto-save game state (for development/testing)
function saveGameState() {
    if (!snakeGame) return;
    
    const gameState = {
        score: snakeGame.getScore(),
        isGameOver: snakeGame.isGameOver(),
        timestamp: Date.now()
    };
    
    sessionStorage.setItem('snakeGameState', JSON.stringify(gameState));
}

// Periodic game state saving
setInterval(saveGameState, 10000);

// Handle browser tab visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Tab is hidden - pause game if running
        if (snakeGame && snakeGame.isGameRunning() && !snakeGame.isPaused) {
            snakeGame.pauseGame();
        }
        saveGameState();
    } else {
        // Tab is visible again
        web3Manager.showNotification('Welcome back! 👋', 'info');
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    if (isMobileDevice()) {
        adjustCanvasForMobile();
    }
});

// Error boundary for unhandled errors
window.addEventListener('error', (event) => {
    console.error('Unhandled error:', event.error);
    web3Manager.showNotification('An error occurred. Please refresh the page.', 'error');
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    web3Manager.showNotification('Transaction failed. Please try again.', 'error');
});

// Utility functions
const utils = {
    formatScore: (score) => {
        return score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },
    
    formatAddress: (address) => {
        if (!address) return '';
        return `${address.substring(0, 6)}...${address.substring(38)}`;
    },
    
    formatTime: (timestamp) => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    },
    
    copyToClipboard: async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            web3Manager.showNotification('Copied to clipboard! 📋', 'success');
        } catch (error) {
            console.error('Failed to copy:', error);
            web3Manager.showNotification('Failed to copy to clipboard', 'error');
        }
    },
    
    shareScore: (score) => {
        if (navigator.share) {
            navigator.share({
                title: 'Snake Web3 Game',
                text: `I just scored ${score} points in Snake Web3 on Shardeum! 🐍`,
                url: window.location.href
            });
        } else {
            utils.copyToClipboard(`I just scored ${score} points in Snake Web3 on Shardeum! Play at ${window.location.href}`);
        }
    }
};

// Add share functionality to game over screen
document.addEventListener('DOMContentLoaded', () => {
    const gameOverContent = document.querySelector('.game-over-content');
    if (gameOverContent) {
        const shareButton = document.createElement('button');
        shareButton.className = 'btn btn-secondary';
        shareButton.textContent = '📤 Share Score';
        shareButton.addEventListener('click', () => {
            utils.shareScore(snakeGame.getScore());
        });
        
        const gameOverActions = gameOverContent.querySelector('.game-over-actions');
        gameOverActions.appendChild(shareButton);
    }
});

// Initialize achievement system (future enhancement)
class AchievementSystem {
    constructor() {
        this.achievements = [
            { id: 'first_game', name: 'First Steps', description: 'Play your first game', unlocked: false },
            { id: 'score_100', name: 'Century', description: 'Score 100 points', unlocked: false },
            { id: 'score_500', name: 'High Roller', description: 'Score 500 points', unlocked: false },
            { id: 'blockchain_submit', name: 'On-Chain Warrior', description: 'Submit score to blockchain', unlocked: false },
            { id: 'nft_earned', name: 'NFT Collector', description: 'Earn your first NFT', unlocked: false }
        ];
        this.loadAchievements();
    }
    
    checkAchievement(achievementId) {
        const achievement = this.achievements.find(a => a.id === achievementId);
        if (achievement && !achievement.unlocked) {
            achievement.unlocked = true;
            this.saveAchievements();
            this.showAchievementNotification(achievement);
        }
    }
    
    showAchievementNotification(achievement) {
        web3Manager.showNotification(`🏆 Achievement Unlocked: ${achievement.name}!`, 'success');
    }
    
    saveAchievements() {
        localStorage.setItem('snakeAchievements', JSON.stringify(this.achievements));
    }
    
    loadAchievements() {
        const saved = localStorage.getItem('snakeAchievements');
        if (saved) {
            this.achievements = JSON.parse(saved);
        }
    }
}

const achievementSystem = new AchievementSystem();

console.log('🐍 Snake Web3 Game initialized successfully!');
console.log('🔗 Built for Shardeum Hackathon');
console.log('🎮 Ready to play!');