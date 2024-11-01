import { Connection, PublicKey } from '@solana/web3.js';
import { Stake, User } from '../models/schemas.js';

class StakingService {
    constructor() {
        this.connection = new Connection(process.env.SOLANA_RPC_URL);
    }

    async createStake(userId, amount, duration) {
        try {
            // Calculate end date based on duration
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + duration);

            // Create stake record
            const stake = await Stake.create({
                userId,
                amount,
                token: 'SOL',
                startDate: new Date(),
                endDate,
                status: 'active'
            });

            // Update user's staking stats
            await User.findByIdAndUpdate(userId, {
                $inc: { 'stats.totalStaked': amount }
            });

            return stake;
        } catch (error) {
            console.error('Stake creation error:', error);
            throw error;
        }
    }

    async calculateRewards(stakeId) {
        try {
            const stake = await Stake.findById(stakeId);
            if (!stake || stake.status !== 'active') {
                throw new Error('Invalid stake');
            }

            const now = new Date();
            const stakeDuration = now - stake.startDate;
            const daysStaked = stakeDuration / (1000 * 60 * 60 * 24);

            // Calculate rewards based on amount and duration
            // Example: 10% APY
            const apy = 0.10;
            const rewards = (stake.amount * apy * daysStaked) / 365;

            return rewards;
        } catch (error) {
            console.error('Reward calculation error:', error);
            throw error;
        }
    }

    async getActiveStakes(userId) {
        try {
            const stakes = await Stake.find({
                userId,
                status: 'active'
            }).sort({ startDate: -1 });

            return stakes;
        } catch (error) {
            console.error('Active stakes fetch error:', error);
            throw error;
        }
    }

    async unstake(stakeId) {
        try {
            const stake = await Stake.findById(stakeId);
            if (!stake || stake.status !== 'active') {
                throw new Error('Invalid stake');
            }

            // Calculate final rewards
            const finalRewards = await this.calculateRewards(stakeId);

            // Update stake record
            stake.status = 'ended';
            stake.rewards = finalRewards;
            await stake.save();

            // Update user's staking stats
            await User.findByIdAndUpdate(stake.userId, {
                $inc: {
                    'stats.totalStaked': -stake.amount,
                    'stats.totalRewards': finalRewards
                }
            });

            return { stake, finalRewards };
        } catch (error) {
            console.error('Unstake error:', error);
            throw error;
        }
    }
}

export default new StakingService();