class Player {
    constructor(game) {
        this.game = game;
        this.width = 50;
        this.height = 50;
        this.x = 50;
        this.y = game.canvas.height - this.height - 20;
        this.vy = 0;
        this.weight = 1;
        this.isJumping = false;

        // Load sound with error handling
        this.jumpSound = new Audio('sounds/jump.mp3');
        this.jumpSound.onerror = () => {
            console.log('Jump sound failed to load - continuing without sound');
        };
    }

    update() {
        // Vertical movement
        this.y += this.vy;
        if (!this.isOnGround()) {
            this.vy += this.weight;
        } else {
            this.vy = 0;
            this.y = this.game.canvas.height - this.height - 20;
            this.isJumping = false;
        }
    }

    draw(ctx) {
        // Draw a simple rectangle for now
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    jump() {
        if (!this.isJumping) {
            this.vy = -20;
            this.isJumping = true;
            
            // Try to play sound, catch any errors
            try {
                this.jumpSound.currentTime = 0; // Reset sound
                this.jumpSound.play().catch(error => {
                    console.log('Error playing jump sound:', error);
                });
            } catch (error) {
                console.log('Jump sound error:', error);
            }
        }
    }

    isOnGround() {
        return this.y >= this.game.canvas.height - this.height - 20;
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.init();
    }

    init() {
        this.canvas.width = 800;
        this.canvas.height = 400;
        
        // Initialize player
        this.player = new Player(this);

        // Add event listeners
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                this.player.jump();
            }
        });

        // Start game loop
        this.animate();
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and draw player
        this.player.update();
        this.player.draw(this.ctx);

        // Update score
        document.getElementById('scoreValue').textContent = this.score;

        // Continue animation loop
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize game when window loads
window.onload = () => {
    const game = new Game();
}; 