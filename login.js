class WalletLogin {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.init();
    }

    async init() {
        // Check if MetaMask is installed
        if (typeof window.ethereum === 'undefined') {
            this.showError('Please install MetaMask to use this application');
            return;
        }

        try {
            // Create ethers provider
            this.provider = new ethers.providers.Web3Provider(window.ethereum);
            
            // Add connect wallet button listener
            const connectButton = document.getElementById('connect-wallet');
            connectButton.addEventListener('click', () => this.connectWallet());
        } catch (error) {
            console.error('Initialization error:', error);
            this.showError('Failed to initialize wallet connection');
        }
    }

    async connectWallet() {
        try {
            // Request account access
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            this.signer = this.provider.getSigner();
            const address = await this.signer.getAddress();
            
            // Show connected address
            document.getElementById('wallet-address').textContent = 
                `Connected: ${address.slice(0, 6)}...${address.slice(-4)}`;
            
            // Hide login container and show game container
            document.getElementById('login-container').style.display = 'none';
            document.getElementById('game-container').style.display = 'block';
            
            // Initialize game after successful login
            const game = new Game();
        } catch (error) {
            console.error('Connection error:', error);
            this.showError('Failed to connect wallet');
        }
    }

    showError(message) {
        const errorElement = document.getElementById('error-message');
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
} 