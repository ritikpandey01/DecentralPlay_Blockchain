// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SnakeGame is ERC721, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;
    
    struct Player {
        address wallet;
        uint256 highScore;
        uint256 totalGames;
        uint256 totalRewards;
        uint256 lastPlayTime;
    }
    
    struct GameSession {
        address player;
        uint256 score;
        uint256 timestamp;
        bool rewardClaimed;
    }
    
    struct LeaderboardEntry {
        address player;
        uint256 score;
        uint256 timestamp;
    }
    
    mapping(address => Player) public players;
    mapping(uint256 => GameSession) public gameSessions;
    mapping(uint256 => string) private _tokenURIs;
    
    LeaderboardEntry[10] public leaderboard;
    
    uint256 public gameSessionCounter;
    uint256 public constant REWARD_THRESHOLD = 50; // Minimum score for rewards
    uint256 public constant SHM_REWARD_AMOUNT = 10 * 10**18; // 10 SHM tokens
    
    IERC20 public shmToken;
    
    event ScoreSubmitted(address indexed player, uint256 score, uint256 sessionId);
    event RewardClaimed(address indexed player, uint256 tokenId, uint256 shmAmount);
    event LeaderboardUpdated(address indexed player, uint256 score, uint256 position);
    
    constructor() ERC721("SnakeGame NFT", "SNAKE") {
        // Initialize leaderboard with empty entries
        for(uint i = 0; i < 10; i++) {
            leaderboard[i] = LeaderboardEntry(address(0), 0, 0);
        }
    }
    
    function setShmToken(address _shmToken) external onlyOwner {
        shmToken = IERC20(_shmToken);
    }
    
    function submitScore(uint256 _score) external {
        require(_score > 0, "Score must be greater than 0");
        
        Player storage player = players[msg.sender];
        
        // Update player stats
        if (_score > player.highScore) {
            player.highScore = _score;
        }
        player.totalGames++;
        player.lastPlayTime = block.timestamp;
        player.wallet = msg.sender;
        
        // Create game session
        gameSessionCounter++;
        gameSessions[gameSessionCounter] = GameSession({
            player: msg.sender,
            score: _score,
            timestamp: block.timestamp,
            rewardClaimed: false
        });
        
        // Update leaderboard
        updateLeaderboard(msg.sender, _score);
        
        emit ScoreSubmitted(msg.sender, _score, gameSessionCounter);
    }
    
    function updateLeaderboard(address _player, uint256 _score) internal {
        // Find position to insert
        uint256 position = 10;
        for(uint i = 0; i < 10; i++) {
            if(_score > leaderboard[i].score) {
                position = i;
                break;
            }
        }
        
        // If score qualifies for leaderboard
        if(position < 10) {
            // Shift entries down
            for(uint i = 9; i > position; i--) {
                leaderboard[i] = leaderboard[i-1];
            }
            
            // Insert new entry
            leaderboard[position] = LeaderboardEntry({
                player: _player,
                score: _score,
                timestamp: block.timestamp
            });
            
            emit LeaderboardUpdated(_player, _score, position);
        }
    }
    
    function claimReward() external {
        Player storage player = players[msg.sender];
        require(player.highScore >= REWARD_THRESHOLD, "Score too low for rewards");
        
        uint256 unclaimedRewards = 0;
        
        // Find unclaimed rewards
        for(uint i = 1; i <= gameSessionCounter; i++) {
            GameSession storage session = gameSessions[i];
            if(session.player == msg.sender && 
               session.score >= REWARD_THRESHOLD && 
               !session.rewardClaimed) {
                session.rewardClaimed = true;
                unclaimedRewards++;
            }
        }
        
        require(unclaimedRewards > 0, "No unclaimed rewards");
        
        // Mint NFT
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        _mint(msg.sender, newTokenId);
        
        // Set NFT metadata
        string memory tokenURI = generateTokenURI(player.highScore, player.totalGames);
        _setTokenURI(newTokenId, tokenURI);
        
        // Send SHM tokens if available
        uint256 shmReward = unclaimedRewards * SHM_REWARD_AMOUNT;
        if(address(shmToken) != address(0) && shmToken.balanceOf(address(this)) >= shmReward) {
            shmToken.transfer(msg.sender, shmReward);
        }
        
        player.totalRewards += unclaimedRewards;
        
        emit RewardClaimed(msg.sender, newTokenId, shmReward);
    }
    
    function generateTokenURI(uint256 _highScore, uint256 _totalGames) internal pure returns (string memory) {
        // Simple JSON metadata - in production, use proper JSON encoding
        return string(abi.encodePacked(
            '{"name":"Snake Master NFT","description":"Reward for achieving high score in Snake Game","image":"https://gateway.pinata.cloud/ipfs/QmSnakeImage","attributes":[{"trait_type":"High Score","value":',
            uint2str(_highScore),
            '},{"trait_type":"Total Games","value":',
            uint2str(_totalGames),
            '}]}'
        ));
    }
    
    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal {
        require(_exists(tokenId), "Token does not exist");
        _tokenURIs[tokenId] = _tokenURI;
    }
    
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        return _tokenURIs[tokenId];
    }
    
    function getLeaderboard() external view returns (LeaderboardEntry[10] memory) {
        return leaderboard;
    }
    
    function getPlayerStats(address _player) external view returns (Player memory) {
        return players[_player];
    }
    
    function getGameHistory(address _player) external view returns (GameSession[] memory) {
        uint256 playerGames = 0;
        
        // Count player's games
        for(uint i = 1; i <= gameSessionCounter; i++) {
            if(gameSessions[i].player == _player) {
                playerGames++;
            }
        }
        
        // Create array and populate
        GameSession[] memory history = new GameSession[](playerGames);
        uint256 index = 0;
        
        for(uint i = 1; i <= gameSessionCounter; i++) {
            if(gameSessions[i].player == _player) {
                history[index] = gameSessions[i];
                index++;
            }
        }
        
        return history;
    }
    
    function getTopPlayers(uint256 _limit) external view returns (LeaderboardEntry[] memory) {
        uint256 limit = _limit > 10 ? 10 : _limit;
        LeaderboardEntry[] memory topPlayers = new LeaderboardEntry[](limit);
        
        for(uint i = 0; i < limit; i++) {
            topPlayers[i] = leaderboard[i];
        }
        
        return topPlayers;
    }
    
    // Utility function to convert uint to string
    function uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }
    
    // Owner functions
    function withdrawSHM(uint256 _amount) external onlyOwner {
        require(address(shmToken) != address(0), "SHM token not set");
        shmToken.transfer(owner(), _amount);
    }
    
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}