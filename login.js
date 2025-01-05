class WalletLogin {
    constructor() {
        console.log('WalletLogin initialized');
        this.provider = null;
        this.signer = null;
        
        // Start with a clean UI state
        this.handleDisconnect();
        
        // Check for any Web3 provider
        if (window.ethereum) {
            console.log('Web3 provider detected:', window.ethereum.constructor.name);
            if (window.ethereum.isCoinbaseWallet) {
                console.log('Coinbase Wallet is available');
            }
            if (window.ethereum.isMetaMask) {
                console.log('MetaMask is available');
            }
        } else {
            console.log('No Web3 provider detected');
        }
        
        this.init();
    }

    async init() {
        // Show login container by default
        document.getElementById('login-container').style.display = 'block';
        document.getElementById('game-container').style.display = 'none';
        document.getElementById('profile-button').classList.add('hidden');

        if (typeof ethers === 'undefined') {
            this.showError('Ethers.js library not loaded');
            return;
        }

        if (!window.ethereum) {
            this.showError('Please install a Web3 wallet (Coinbase Wallet, MetaMask, etc.) to use this application');
            return;
        }

        try {
            this.provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
            
            const connectButton = document.getElementById('connect-wallet');
            if (connectButton) {
                connectButton.addEventListener('click', () => this.connectWallet());
            }

            // Listen for account changes
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    this.handleDisconnect();
                } else {
                    this.updateWalletInfo(accounts[0]);
                }
            });

            // Listen for chain changes
            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });

        } catch (error) {
            console.error('Initialization error:', error);
            this.showError('Failed to initialize wallet connection: ' + error.message);
        }
    }

    handleDisconnect() {
        console.log('Handling disconnect...');
        
        // Reset UI state
        document.getElementById('login-container').style.display = 'block';
        document.getElementById('game-container').style.display = 'none';
        document.getElementById('profile-button').classList.add('hidden');
        document.getElementById('profile-dropdown').classList.remove('show');
        document.getElementById('error-message').style.display = 'none';
        
        // Reset wallet state
        this.provider = null;
        this.signer = null;
        
        // Remove event listeners
        if (window.ethereum) {
            window.ethereum.removeAllListeners();
        }
        
        // Reload the page to ensure a clean state
        window.location.reload();
    }

    async connectWallet() {
        try {
            // Request account access first
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            // Re-initialize provider after permission is granted
            this.provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
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
            console.log('Updating wallet info for address:', address);
            
            const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
            const walletType = this.getWalletType();
            const network = await this.provider.getNetwork();
            
            // Get all required elements
            const profileButton = document.getElementById('profile-button');
            const profileAddress = document.getElementById('profile-address');
            const walletTypeElement = document.getElementById('wallet-type');
            const networkInfo = document.getElementById('network-info');
            const fullAddress = document.getElementById('full-address');
            
            if (!profileButton || !profileAddress) {
                console.error('Profile elements not found:', {
                    profileButton: !!profileButton,
                    profileAddress: !!profileAddress
                });
                return;
            }

            // Update profile button visibility and content
            profileButton.classList.remove('hidden');
            profileAddress.textContent = shortAddress;
            
            // Update dropdown content
            if (walletTypeElement) walletTypeElement.textContent = `Wallet: ${walletType}`;
            if (networkInfo) networkInfo.textContent = `Network: ${network.name}`;
            if (fullAddress) fullAddress.textContent = `Address: ${address}`;
            
            console.log('Profile updated:', {
                address: shortAddress,
                wallet: walletType,
                network: network.name
            });
            
            // Setup dropdown functionality
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
            this.handleDisconnect();
        });
    }

    getWalletType() {
        if (window.ethereum.isCoinbaseWallet) return 'Coinbase Wallet';
        if (window.ethereum.isMetaMask) return 'MetaMask';
        return 'Web3 Wallet';
    }

    showError(message) {
        const errorElement = document.getElementById('error-message');
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

window.WalletLogin = WalletLogin; 