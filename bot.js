// Import required modules
import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Import services
import WalletService from './services/walletService.js';

// Configure environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();

// Initialize the Telegram bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_API_TOKEN, { polling: true });

// Connect to Solana
const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'webapp')));

// API Routes
// Wallet routes
app.post('/api/wallet/connect', async (req, res) => {
    try {
        const { walletAddress } = req.body;
        const result = await WalletService.connect(walletAddress);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/wallet/balance/:address', async (req, res) => {
    try {
        const balance = await WalletService.getBalance(req.params.address);
        res.json({ balance });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Bot commands
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const webAppUrl = process.env.NODE_ENV === 'production' 
        ? process.env.WEBAPP_URL 
        : 'http://localhost:3000';
    
    bot.sendMessage(chatId, 'Welcome to Sulino Trading Bot! 🚀\n\nTrade, stake, and earn rewards on Solana.', {
        reply_markup: {
            inline_keyboard: [[
                {
                    text: "🌟 Open Sulino App",
                    web_app: { url: webAppUrl }
                }
            ]]
        }
    });
});

// Serve index.html for all routes (for client-side routing)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'webapp', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`WebApp available at http://localhost:${port}`);
});

export default bot;