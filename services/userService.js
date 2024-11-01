import { User } from '../models/schemas.js';

class UserService {
    static async createUser(telegramId, username) {
        try {
            const user = await User.create({
                telegramId,
                username,
                createdAt: new Date()
            });
            return user;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    static async getUserStats(userId) {
        try {
            const user = await User.findById(userId)
                .select('stats totalTradeVolume')
                .lean();
            
            if (!user) {
                throw new Error('User not found');
            }

            return {
                tradeVolume: user.totalTradeVolume,
                totalTrades: user.stats.totalTrades,
                successRate: user.stats.totalTrades > 0 
                    ? (user.stats.successfulTrades / user.stats.totalTrades) * 100 
                    : 0,
                profitLoss: user.stats.profitLoss
            };
        } catch (error) {
            console.error('Error fetching user stats:', error);
            throw error;
        }
    }

    static async updateWallet(userId, walletAddress) {
        try {
            const user = await User.findByIdAndUpdate(
                userId,
                { $set: { walletAddress } },
                { new: true }
            );
            return user;
        } catch (error) {
            console.error('Error updating wallet:', error);
            throw error;
        }
    }

    static async updateStats(userId, tradeData) {
        try {
            const updateData = {
                $inc: {
                    'stats.totalTrades': 1,
                    totalTradeVolume: tradeData.amountIn,
                    'stats.profitLoss': tradeData.profit
                }
            };

            if (tradeData.status === 'completed') {
                updateData.$inc['stats.successfulTrades'] = 1;
            } else if (tradeData.status === 'failed') {
                updateData.$inc['stats.failedTrades'] = 1;
            }

            const user = await User.findByIdAndUpdate(
                userId,
                updateData,
                { new: true }
            );
            return user;
        } catch (error) {
            console.error('Error updating user stats:', error);
            throw error;
        }
    }

    static async getLeaderboard(limit = 10) {
        try {
            const leaders = await User.find()
                .sort({ totalTradeVolume: -1 })
                .limit(limit)
                .select('username totalTradeVolume stats')
                .lean();
            
            return leaders.map(leader => ({
                username: leader.username,
                volume: leader.totalTradeVolume,
                trades: leader.stats.totalTrades,
                successRate: leader.stats.totalTrades > 0 
                    ? (leader.stats.successfulTrades / leader.stats.totalTrades) * 100 
                    : 0
            }));
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            throw error;
        }
    }
}

export default UserService;