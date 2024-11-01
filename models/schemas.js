import mongoose from 'mongoose';

// User Schema
const UserSchema = new mongoose.Schema({
    telegramId: { type: String, required: true, unique: true },
    username: String,
    walletAddress: String,
    createdAt: { type: Date, default: Date.now },
    totalTradeVolume: { type: Number, default: 0 },
    stats: {
        totalTrades: { type: Number, default: 0 },
        successfulTrades: { type: Number, default: 0 },
        failedTrades: { type: Number, default: 0 },
        profitLoss: { type: Number, default: 0 }
    },
    settings: {
        notifications: { type: Boolean, default: true },
        slippageTolerance: { type: Number, default: 1 }, // 1%
        darkMode: { type: Boolean, default: false }
    }
});

// Trade Schema
const TradeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    tokenIn: String,
    tokenOut: String,
    amountIn: Number,
    amountOut: Number,
    timestamp: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'completed', 'failed'] },
    txHash: String,
    price: Number,
    fee: Number
});

// Stake Schema
const StakeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: Number,
    token: String,
    startDate: { type: Date, default: Date.now },
    endDate: Date,
    rewards: Number,
    status: { type: String, enum: ['active', 'ended', 'claimed'] },
    lastClaimDate: Date
});

// Lottery Schema
const LotterySchema = new mongoose.Schema({
    round: { type: Number, required: true, unique: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    prizePool: Number,
    status: { type: String, enum: ['active', 'completed', 'cancelled'] },
    winners: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        prize: Number,
        claimed: { type: Boolean, default: false }
    }],
    totalTickets: { type: Number, default: 0 }
});

// Lottery Ticket Schema
const LotteryTicketSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lotteryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lottery' },
    count: { type: Number, default: 1 },
    source: { type: String, enum: ['trade', 'stake', 'bonus'] }
});

// Token Price Schema
const TokenPriceSchema = new mongoose.Schema({
    symbol: String,
    price: Number,
    change24h: Number,
    volume24h: Number,
    lastUpdated: { type: Date, default: Date.now }
});

// Create models
const User = mongoose.model('User', UserSchema);
const Trade = mongoose.model('Trade', TradeSchema);
const Stake = mongoose.model('Stake', StakeSchema);
const Lottery = mongoose.model('Lottery', LotterySchema);
const LotteryTicket = mongoose.model('LotteryTicket', LotteryTicketSchema);
const TokenPrice = mongoose.model('TokenPrice', TokenPriceSchema);

export { User, Trade, Stake, Lottery, LotteryTicket, TokenPrice };