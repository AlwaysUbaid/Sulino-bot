import { Trade } from '../models/schemas.js';
import walletService from './walletService.js';
import UserService from './userService.js';

class TradingService {
    async getQuote(inputToken, outputToken, amount, slippage = 1) {
        try {
            const { jupiter } = walletService;
            if (!jupiter) throw new Error('Jupiter not initialized');

            const routeMap = await jupiter.computeRoutes({
                inputMint: new PublicKey(inputToken),
                outputMint: new PublicKey(outputToken),
                amount: amount * (10 ** 9), // Convert to lamports
                slippage,
                forceFetch: true
            });

            const bestRoute = routeMap.routesInfos[0];
            return {
                route: bestRoute,
                inputAmount: bestRoute.inAmount,
                outputAmount: bestRoute.outAmount,
                priceImpact: bestRoute.priceImpactPct,
                fees: bestRoute.fees
            };
        } catch (error) {
            console.error('Quote fetch error:', error);
            throw error;
        }
    }

    async executeTrade(userId, quoteData) {
        try {
            const { jupiter } = walletService;
            if (!jupiter) throw new Error('Jupiter not initialized');

            // Create trade record
            const trade = await Trade.create({
                userId,
                tokenIn: quoteData.route.inputMint,
                tokenOut: quoteData.route.outputMint,
                amountIn: quoteData.inputAmount,
                status: 'pending'
            });

            // Execute the trade
            const result = await jupiter.exchange({
                routeInfo: quoteData.route
            });

            // Update trade record
            trade.status = result.success ? 'completed' : 'failed';
            trade.txHash = result.txid;
            trade.amountOut = result.outputAmount;
            await trade.save();

            // Update user stats
            await UserService.updateStats(userId, {
                status: trade.status,
                amountIn: quoteData.inputAmount,
                profit: result.success ? (result.outputAmount - quoteData.inputAmount) : 0
            });

            return {
                success: result.success,
                txHash: result.txid,
                inputAmount: quoteData.inputAmount,
                outputAmount: result.outputAmount
            };
        } catch (error) {
            console.error('Trade execution error:', error);
            throw error;
        }
    }

    async getTradeHistory(userId) {
        try {
            return await Trade.find({ userId })
                .sort({ timestamp: -1 })
                .limit(50)
                .lean();
        } catch (error) {
            console.error('Trade history fetch error:', error);
            throw error;
        }
    }
}

export default new TradingService();