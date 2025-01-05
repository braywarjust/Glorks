class WalletLogin {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.connectButton = document.getElementById('connect-wallet');
        this.init();
    }

    async init() {
        if (!window.ethereum) {
            this.connectButton.textContent = 'Please Install Web3 Wallet';
            this.connectButton.disabled = true;
            return;
        }

        try {
            this.provider = new ethers.providers.Web3Provider(window.ethereum);
            
            // Setup connect button
            this.connectButton.addEventListener('click', () => this.toggleWallet());
            
            // Check if already connected
            const accounts = await this.provider.listAccounts();
            if (accounts.length > 0) {
                this.updateButtonState(accounts[0]);
            }

            // Listen for account changes
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    this.handleDisconnect();
                } else {
                    this.updateButtonState(accounts[0]);
                }
            });

        } catch (error) {
            console.error('Initialization error:', error);
            this.connectButton.disabled = true;
        }
    }

    async toggleWallet() {
        if (this.connectButton.classList.contains('connected')) {
            this.handleDisconnect();
        } else {
            this.connectWallet();
        }
    }

    async connectWallet() {
        try {
            const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            });
            this.updateButtonState(accounts[0]);
            
            // Initialize game here if needed
            const game = new Game();
        } catch (error) {
            console.error('Connection error:', error);
        }
    }

    updateButtonState(address) {
        const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
        this.connectButton.textContent = shortAddress;
        this.connectButton.classList.add('connected');
    }

    handleDisconnect() {
        this.connectButton.textContent = 'Connect Wallet';
        this.connectButton.classList.remove('connected');
        window.location.reload();
    }
}

// Initialize when page loads
window.addEventListener('load', () => {
    new WalletLogin();
}); 