class Sprite {
    constructor(imageSource, frameWidth, frameHeight, frameCount) {
        this.image = new Image();
        this.image.src = imageSource;
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
        this.frameCount = frameCount;
        this.currentFrame = 0;
        this.animationSpeed = 5; // Frames to wait before next sprite frame
        this.frameCounter = 0;
    }

    update() {
        this.frameCounter++;
        if (this.frameCounter >= this.animationSpeed) {
            this.currentFrame = (this.currentFrame + 1) % this.frameCount;
            this.frameCounter = 0;
        }
    }

    draw(ctx, x, y) {
        ctx.drawImage(
            this.image,
            this.currentFrame * this.frameWidth, 0,
            this.frameWidth, this.frameHeight,
            x, y,
            this.frameWidth, this.frameHeight
        );
    }
}

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

        // Load sprite animations
        this.animations = {
            run: new Sprite('assets/player-run.sprite', this.width, this.height, 8), // Assuming 8 frames for run
            jump: new Sprite('assets/player-jump.sprite', this.width, this.height, 6) // Assuming 6 frames for jump
        };
        this.currentAnimation = this.animations.run;
    }

    update() {
        // Vertical movement
        this.y += this.vy;
        if (!this.isOnGround()) {
            this.vy += this.weight;
            this.currentAnimation = this.animations.jump;
        } else {
            this.vy = 0;
            this.y = this.game.canvas.height - this.height - 20;
            this.isJumping = false;
            this.currentAnimation = this.animations.run;
        }

        // Update current animation
        this.currentAnimation.update();
    }

    draw(ctx) {
        this.currentAnimation.draw(ctx, this.x, this.y);
    }

    jump() {
        if (!this.isJumping) {
            this.vy = -20;
            this.isJumping = true;
            // Play jump sound
            const jumpSound = new Audio('sounds/jump.mp3');
            jumpSound.play();
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