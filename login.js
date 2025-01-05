class WalletLogin {
    constructor() {
        console.log('WalletLogin initialized');
        this.provider = null;
        this.signer = null;
        
        // Force disconnect and clear permissions on page load/refresh
        this.forceDisconnect();
        
        // Check for any Web3 provider
        if (window.ethereum) {
            console.log('Web3 provider detected:', window.ethereum.constructor.name);
            // Log available wallet info
            if (window.ethereum.isCoinbaseWallet) {
                console.log('Coinbase Wallet is available');
            }
            if (window.ethereum.isMetaMask) {
                console.log('MetaMask is available');
            }
            
            // Clear any existing connections and cached permissions
            window.ethereum.removeAllListeners();
        } else {
            console.log('No Web3 provider detected');
        }
        
        this.init();
    }

    async forceDisconnect() {
        if (window.ethereum) {
            try {
                // Force disconnect all accounts
                await window.ethereum.request({
                    method: "wallet_requestPermissions",
                    params: [{
                        eth_accounts: {}
                    }]
                });
                
                // Clear any cached permissions
                await window.ethereum.request({
                    method: "wallet_revokePermissions",
                    params: [{
                        eth_accounts: {}
                    }]
                });
            } catch (error) {
                console.log('Error forcing disconnect:', error);
            }
        }
        this.handleDisconnect();
    }

    async init() {
        document.getElementById('login-container').style.display = 'block';
        document.getElementById('game-container').style.display = 'none';

        // Check if ethers is loaded
        if (typeof ethers === 'undefined') {
            this.showError('Ethers.js library not loaded');
            return;
        }

        // Check for any Web3 provider
        if (!window.ethereum) {
            this.showError('Please install a Web3 wallet (Coinbase Wallet, MetaMask, etc.) to use this application');
            return;
        }

        try {
            // Create ethers provider
            this.provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
            console.log('Provider initialized:', this.provider);
            
            // Add connect wallet button listener
            const connectButton = document.getElementById('connect-wallet');
            if (connectButton) {
                connectButton.addEventListener('click', () => this.connectWallet());
                console.log('Connect button listener added');
            } else {
                console.error('Connect wallet button not found');
            }

            // Listen for account changes
            window.ethereum.on('accountsChanged', (accounts) => {
                console.log('Account changed:', accounts);
                if (accounts.length === 0) {
                    this.handleDisconnect();
                } else {
                    this.updateWalletInfo(accounts[0]);
                }
            });

            // Listen for chain changes
            window.ethereum.on('chainChanged', (chainId) => {
                console.log('Network changed:', chainId);
                window.location.reload();
            });

        } catch (error) {
            console.error('Initialization error:', error);
            this.showError('Failed to initialize wallet connection: ' + error.message);
        }
    }

    async connectWallet() {
        try {
            // Request account access
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            this.signer = this.provider.getSigner();
            
            // Get connected chain ID
            const network = await this.provider.getNetwork();
            console.log('Connected to network:', network.name);

            // Update UI with wallet info
            await this.updateWalletInfo(accounts[0]);
            
            // Hide login container and show game container
            document.getElementById('login-container').style.display = 'none';
            document.getElementById('game-container').style.display = 'block';
            
            // Initialize game after successful login
            const game = new Game();
        } catch (error) {
            console.error('Connection error:', error);
            this.showError('Failed to connect wallet: ' + error.message);
        }
    }

    async updateWalletInfo(address) {
        try {
            const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
            const walletType = this.getWalletType();
            const network = await this.provider.getNetwork();
            
            // Update profile button
            document.getElementById('profile-button').classList.remove('hidden');
            document.getElementById('profile-address').textContent = shortAddress;
            document.getElementById('wallet-type').textContent = `Wallet: ${walletType}`;
            document.getElementById('network-info').textContent = `Network: ${network.name}`;
            document.getElementById('full-address').textContent = `Address: ${address}`;
            
            // Setup profile dropdown
            this.setupProfileDropdown();
        } catch (error) {
            console.error('Error updating wallet info:', error);
        }
    }

    setupProfileDropdown() {
        const profileButton = document.getElementById('profile-button');
        const dropdown = document.getElementById('profile-dropdown');
        const disconnectBtn = document.getElementById('disconnect-wallet');

        // Toggle dropdown on profile button click
        profileButton.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            dropdown.classList.remove('show');
        });

        // Prevent dropdown from closing when clicking inside it
        dropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Handle disconnect button
        disconnectBtn.addEventListener('click', () => {
            this.forceDisconnect();
        });
    }

    getWalletType() {
        if (window.ethereum.isCoinbaseWallet) return 'Coinbase Wallet';
        if (window.ethereum.isMetaMask) return 'MetaMask';
        return 'Web3 Wallet';
    }

    handleDisconnect() {
        console.log('Wallet disconnected');
        // Reset UI
        document.getElementById('login-container').style.display = 'block';
        document.getElementById('game-container').style.display = 'none';
        document.getElementById('profile-button').classList.add('hidden');
        document.getElementById('profile-dropdown').classList.remove('show');
        document.getElementById('error-message').style.display = 'none';
        
        // Reset provider and signer
        this.provider = null;
        this.signer = null;
        
        // Clear any stored wallet data
        if (window.ethereum) {
            try {
                window.ethereum.removeAllListeners();
                window.ethereum.request({
                    method: "eth_accounts"
                }).then(accounts => {
                    if (accounts.length > 0) {
                        window.ethereum.request({
                            method: "wallet_requestPermissions",
                            params: [{
                                eth_accounts: {}
                            }]
                        });
                    }
                });
            } catch (error) {
                console.log('Error clearing wallet data:', error);
            }
        }
    }

    showError(message) {
        const errorElement = document.getElementById('error-message');
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

window.WalletLogin = WalletLogin; 