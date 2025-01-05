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
        // Game initialization code will go here
    }

    // Add game logic methods here
}

// Initialize game when window loads
window.onload = () => {
    const game = new Game();
}; 