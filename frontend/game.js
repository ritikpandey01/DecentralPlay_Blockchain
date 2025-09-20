// Snake Game Engine
class SnakeGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Game settings
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        
        // Game state
        this.snake = [{ x: 10, y: 10 }];
        this.food = { x: 15, y: 15 };
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.gameRunning = false;
        this.gameOver = false;
        this.isPaused = false;
        this.gameSpeed = 200;
        this.gameLoop = null;
        
        // Visual effects
        this.particles = [];
        this.scorePopups = [];
        
        // Touch controls for mobile
        this.touchStartX = 0;
        this.touchStartY = 0;
        
        this.init();
    }
    
    init() {
        this.setupControls();
        this.setupTouchControls();
        this.setupMobileControls();
        this.drawGame();
        this.updateGameInfo();
    }
    
    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning || this.isPaused) {
                if (e.code === 'Space') {
                    e.preventDefault();
                    if (this.gameOver) {
                        this.resetGame();
                    } else if (!this.gameRunning) {
                        this.startGame();
                    } else if (this.isPaused) {
                        this.resumeGame();
                    }
                }
                return;
            }
            
            this.handleKeyPress(e);
        });
    }
    
    handleKeyPress(e) {
        const key = e.code;
        
        // Prevent snake from moving backwards
        if (key === 'ArrowLeft' || key === 'KeyA') {
            if (this.dx !== 1) {
                this.dx = -1;
                this.dy = 0;
            }
        } else if (key === 'ArrowUp' || key === 'KeyW') {
            if (this.dy !== 1) {
                this.dx = 0;
                this.dy = -1;
            }
        } else if (key === 'ArrowRight' || key === 'KeyD') {
            if (this.dx !== -1) {
                this.dx = 1;
                this.dy = 0;
            }
        } else if (key === 'ArrowDown' || key === 'KeyS') {
            if (this.dy !== -1) {
                this.dx = 0;
                this.dy = 1;
            }
        } else if (key === 'Space') {
            e.preventDefault();
            this.togglePause();
        }
    }
    
    setupTouchControls() {
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.touchStartX = touch.clientX;
            this.touchStartY = touch.clientY;
        }, { passive: false });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (!this.gameRunning || this.isPaused) return;
            
            const touch = e.changedTouches[0];
            const touchEndX = touch.clientX;
            const touchEndY = touch.clientY;
            
            const deltaX = touchEndX - this.touchStartX;
            const deltaY = touchEndY - this.touchStartY;
            const minSwipeDistance = 30;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal swipe
                if (Math.abs(deltaX) > minSwipeDistance) {
                    if (deltaX > 0 && this.dx !== -1) {
                        // Swipe right
                        this.dx = 1;
                        this.dy = 0;
                    } else if (deltaX < 0 && this.dx !== 1) {
                        // Swipe left
                        this.dx = -1;
                        this.dy = 0;
                    }
                }
            } else {
                // Vertical swipe
                if (Math.abs(deltaY) > minSwipeDistance) {
                    if (deltaY > 0 && this.dy !== -1) {
                        // Swipe down
                        this.dx = 0;
                        this.dy = 1;
                    } else if (deltaY < 0 && this.dy !== 1) {
                        // Swipe up
                        this.dx = 0;
                        this.dy = -1;
                    }
                }
            }
        }, { passive: false });
    }
    
    setupMobileControls() {
        const mobileControls = document.querySelectorAll('.mobile-btn');
        mobileControls.forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (!this.gameRunning || this.isPaused) return;
                
                const direction = e.target.dataset.direction;
                this.handleMobileDirection(direction);
            });
        });
    }
    
    handleMobileDirection(direction) {
        switch (direction) {
            case 'up':
                if (this.dy !== 1) {
                    this.dx = 0;
                    this.dy = -1;
                }
                break;
            case 'down':
                if (this.dy !== -1) {
                    this.dx = 0;
                    this.dy = 1;
                }
                break;
            case 'left':
                if (this.dx !== 1) {
                    this.dx = -1;
                    this.dy = 0;
                }
                break;
            case 'right':
                if (this.dx !== -1) {
                    this.dx = 1;
                    this.dy = 0;
                }
                break;
        }
    }
    
    startGame() {
        if (this.gameOver) {
            this.resetGame();
        }
        
        this.gameRunning = true;
        this.gameOver = false;
        this.isPaused = false;
        
        // Hide overlay
        document.getElementById('gameOverlay').style.display = 'none';
        document.getElementById('gameOverScreen').classList.add('hidden');
        
        // Show mobile controls on mobile devices
        if (this.isMobileDevice()) {
            document.getElementById('mobileControls').classList.remove('hidden');
        }
        
        this.gameLoop = setInterval(() => {
            this.update();
            this.drawGame();
        }, this.gameSpeed);
        
        this.updateGameInfo();
    }
    
    pauseGame() {
        this.isPaused = true;
        clearInterval(this.gameLoop);
        
        // Show pause message
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#4ecdc4';
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2 - 20);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px Arial';
        this.ctx.fillText('Press SPACE to resume', this.canvas.width / 2, this.canvas.height / 2 + 20);
        this.ctx.restore();
    }
    
    resumeGame() {
        this.isPaused = false;
        this.gameLoop = setInterval(() => {
            this.update();
            this.drawGame();
        }, this.gameSpeed);
    }
    
    togglePause() {
        if (this.isPaused) {
            this.resumeGame();
        } else {
            this.pauseGame();
        }
    }
    
    update() {
        if (this.isPaused || this.gameOver) return;
        
        // Move snake
        const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };
        
        // Check wall collision
        if (head.x < 0 || head.x >= this.tileCount || 
            head.y < 0 || head.y >= this.tileCount) {
            this.endGame();
            return;
        }
        
        // Check self collision
        for (let segment of this.snake) {
            if (head.x === segment.x && head.y === segment.y) {
                this.endGame();
                return;
            }
        }
        
        this.snake.unshift(head);
        
        // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.createScorePopup(this.food.x * this.gridSize, this.food.y * this.gridSize, '+10');
            this.createParticles(this.food.x * this.gridSize + this.gridSize/2, this.food.y * this.gridSize + this.gridSize/2);
            this.generateFood();
            this.increaseSpeed();
            
            // Update score display
            document.getElementById('currentScore').textContent = this.score;
        } else {
            this.snake.pop();
        }
        
        // Update particles and score popups
        this.updateParticles();
        this.updateScorePopups();
    }
    
    generateFood() {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
        
        this.food = newFood;
    }
    
    increaseSpeed() {
        if (this.gameSpeed > 100) {
            this.gameSpeed = Math.max(100, this.gameSpeed - 5);
            clearInterval(this.gameLoop);
            this.gameLoop = setInterval(() => {
                this.update();
                this.drawGame();
            }, this.gameSpeed);
        }
    }
    
    createParticles(x, y) {
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 30,
                maxLife: 30,
                color: `hsl(${Math.random() * 60 + 170}, 70%, 60%)`
            });
        }
    }
    
    createScorePopup(x, y, text) {
        this.scorePopups.push({
            x: x,
            y: y,
            text: text,
            life: 60,
            alpha: 1
        });
    }
    
    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            return particle.life > 0;
        });
    }
    
    updateScorePopups() {
        this.scorePopups = this.scorePopups.filter(popup => {
            popup.y -= 2;
            popup.life--;
            popup.alpha = popup.life / 60;
            return popup.life > 0;
        });
    }
    
    drawGame() {
        // Clear canvas
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid (subtle)
        this.drawGrid();
        
        // Draw food
        this.drawFood();
        
        // Draw snake
        this.drawSnake();
        
        // Draw particles
        this.drawParticles();
        
        // Draw score popups
        this.drawScorePopups();
    }
    
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        for (let x = 0; x <= this.canvas.width; x += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= this.canvas.height; y += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
    
    drawSnake() {
        this.snake.forEach((segment, index) => {
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;
            
            if (index === 0) {
                // Draw head
                const gradient = this.ctx.createRadialGradient(
                    x + this.gridSize/2, y + this.gridSize/2, 0,
                    x + this.gridSize/2, y + this.gridSize/2, this.gridSize/2
                );
                gradient.addColorStop(0, '#4ecdc4');
                gradient.addColorStop(1, '#26a69a');
                
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(x + 1, y + 1, this.gridSize - 2, this.gridSize - 2);
                
                // Draw eyes
                this.ctx.fillStyle = '#ffffff';
                this.ctx.fillRect(x + 5, y + 5, 3, 3);
                this.ctx.fillRect(x + 12, y + 5, 3, 3);
                
                this.ctx.fillStyle = '#000000';
                this.ctx.fillRect(x + 6, y + 6, 1, 1);
                this.ctx.fillRect(x + 13, y + 6, 1, 1);
            } else {
                // Draw body
                const alpha = Math.max(0.3, 1 - (index / this.snake.length) * 0.7);
                this.ctx.fillStyle = `rgba(78, 205, 196, ${alpha})`;
                this.ctx.fillRect(x + 2, y + 2, this.gridSize - 4, this.gridSize - 4);
            }
        });
    }
    
    drawFood() {
        const x = this.food.x * this.gridSize;
        const y = this.food.y * this.gridSize;
        
        // Animate food
        const pulse = Math.sin(Date.now() * 0.01) * 0.2 + 0.8;
        const size = this.gridSize * pulse;
        const offset = (this.gridSize - size) / 2;
        
        const gradient = this.ctx.createRadialGradient(
            x + this.gridSize/2, y + this.gridSize/2, 0,
            x + this.gridSize/2, y + this.gridSize/2, size/2
        );
        gradient.addColorStop(0, '#ff6b6b');
        gradient.addColorStop(1, '#d63031');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x + this.gridSize/2, y + this.gridSize/2, size/2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Add sparkle effect
        const sparkleSize = 2;
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(x + this.gridSize/2 - sparkleSize/2, y + 4, sparkleSize, sparkleSize);
    }
    
    drawParticles() {
        this.particles.forEach(particle => {
            const alpha = particle.life / particle.maxLife;
            this.ctx.save();
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = particle.color;
            this.ctx.fillRect(particle.x - 2, particle.y - 2, 4, 4);
            this.ctx.restore();
        });
    }
    
    drawScorePopups() {
        this.scorePopups.forEach(popup => {
            this.ctx.save();
            this.ctx.globalAlpha = popup.alpha;
            this.ctx.fillStyle = '#4ecdc4';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(popup.text, popup.x + this.gridSize/2, popup.y);
            this.ctx.restore();
        });
    }
    
    endGame() {
        this.gameOver = true;
        this.gameRunning = false;
        clearInterval(this.gameLoop);
        
        // Hide mobile controls
        document.getElementById('mobileControls').classList.add('hidden');
        
        // Show game over screen
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOverScreen').classList.remove('hidden');
        
        this.updateGameInfo();
    }
    
    resetGame() {
        this.snake = [{ x: 10, y: 10 }];
        this.food = { x: 15, y: 15 };
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.gameRunning = false;
        this.gameOver = false;
        this.isPaused = false;
        this.gameSpeed = 200;
        this.particles = [];
        this.scorePopups = [];
        
        clearInterval(this.gameLoop);
        
        document.getElementById('gameOverlay').style.display = 'flex';
        document.getElementById('gameOverScreen').classList.add('hidden');
        document.getElementById('mobileControls').classList.add('hidden');
        
        this.drawGame();
        this.updateGameInfo();
    }
    
    updateGameInfo() {
        document.getElementById('currentScore').textContent = this.score;
    }
    
    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
    }
    
    getScore() {
        return this.score;
    }
    
    isGameOver() {
        return this.gameOver;
    }
    
    isGameRunning() {
        return this.gameRunning;
    }
}

// Initialize game
let snakeGame;