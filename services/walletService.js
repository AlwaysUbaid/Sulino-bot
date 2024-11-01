import { Connection, PublicKey } from '@solana/web3.js';
import dotenv from 'dotenv';

dotenv.config();

class WalletService {
    constructor() {
        // Ensure URL starts with http:// or https://
        const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
        this.connection = new Connection(rpcUrl, 'confirmed');
        this.connectedWallet = null;
    }

    async connect(walletAddress) {
        try {
            // Validate the URL before connecting
            if (!this.connection._rpcEndpoint.startsWith('http')) {
                throw new Error('Invalid RPC URL format');
            }

            this.connectedWallet = new PublicKey(walletAddress);
            return {
                publicKey: walletAddress,
                connected: true
            };
        } catch (error) {
            console.error('Wallet connection error:', error);
            throw error;
        }
    }

    async getBalance(address) {
        try {
            const publicKey = new PublicKey(address);
            const balance = await this.connection.getBalance(publicKey);
            return balance / 1e9; // Convert lamports to SOL
        } catch (error) {
            console.error('Balance fetch error:', error);
            throw error;
        }
    }

    async getTokenAccounts(address) {
        try {
            const publicKey = new PublicKey(address);
            const response = await this.connection.getParsedTokenAccountsByOwner(
                publicKey,
                { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
            );
            
            return response.value.map(account => ({
                mint: account.account.data.parsed.info.mint,
                amount: account.account.data.parsed.info.tokenAmount.uiAmount,
                decimals: account.account.data.parsed.info.tokenAmount.decimals
            }));
        } catch (error) {
            console.error('Token accounts fetch error:', error);
            throw error;
        }
    }

    disconnect() {
        this.connectedWallet = null;
        return true;
    }

    isConnected() {
        return !!this.connectedWallet;
    }
}

export default new WalletService();