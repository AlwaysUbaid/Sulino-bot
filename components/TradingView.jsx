import React, { useState, useEffect, useRef } from 'react';
import { ArrowDown, RefreshCw, Settings, AlertCircle } from 'lucide-react';

const TradingView = ({ walletConnected }) => {
    const [inputToken, setInputToken] = useState({ symbol: 'SOL', amount: '' });
    const [outputToken, setOutputToken] = useState({ symbol: 'BONK', amount: '' });
    const [price, setPrice] = useState(null);
    const [priceChange, setPriceChange] = useState(0);
    const [loading, setLoading] = useState(false);
    const [slippage, setSlippage] = useState(1);
    const priceRef = useRef(null);

    // Animated number component
    const AnimatedNumber = ({ value, decimals = 6 }) => {
        const [displayValue, setDisplayValue] = useState(value);
        
        useEffect(() => {
            const steps = 20;
            const increment = (value - displayValue) / steps;
            let current = displayValue;
            
            const animation = setInterval(() => {
                current += increment;
                setDisplayValue(current);
                
                if (Math.abs(current - value) < Math.abs(increment)) {
                    setDisplayValue(value);
                    clearInterval(animation);
                }
            }, 50);
            
            return () => clearInterval(animation);
        }, [value]);

        return (
            <span className={`transition-colors duration-200 ${
                priceChange > 0 ? 'text-green-500' : 
                priceChange < 0 ? 'text-red-500' : 'text-gray-900 dark:text-gray-100'
            }`}>
                {displayValue.toFixed(decimals)}
            </span>
        );
    };

    // Price update effect
    useEffect(() => {
        const fetchPrice = async () => {
            try {
                const response = await fetch(`/api/price/${outputToken.symbol}`);
                const data = await response.json();
                const newPrice = data.price;
                
                if (priceRef.current !== null) {
                    setPriceChange(((newPrice - priceRef.current) / priceRef.current) * 100);
                }
                
                setPrice(newPrice);
                priceRef.current = newPrice;
            } catch (error) {
                console.error('Price fetch error:', error);
            }
        };

        const interval = setInterval(fetchPrice, 5000);
        fetchPrice();

        return () => clearInterval(interval);
    }, [outputToken.symbol]);

    const handleSwap = async () => {
        if (!walletConnected) {
            const tg = window.Telegram?.WebApp;
            tg?.showAlert('Please connect your wallet first');
            return;
        }

        setLoading(true);
        try {
            const tg = window.Telegram?.WebApp;
            tg?.showPopup({
                title: 'Confirm Swap',
                message: `Swap ${inputToken.amount} ${inputToken.symbol} for approximately ${outputToken.amount} ${outputToken.symbol}?`,
                buttons: [
                    { type: 'cancel', text: 'Cancel' },
                    { type: 'default', text: 'Confirm' }
                ]
            }, async (buttonId) => {
                if (buttonId === 'Confirm') {
                    const response = await fetch('/api/trade', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            inputToken: inputToken.symbol,
                            outputToken: outputToken.symbol,
                            amount: inputToken.amount,
                            slippage
                        })
                    });
                    
                    const data = await response.json();
                    if (data.success) {
                        tg?.showAlert('Trade executed successfully!');
                    } else {
                        tg?.showAlert('Trade failed. Please try again.');
                    }
                }
            });
        } catch (error) {
            console.error('Trade error:', error);
            const tg = window.Telegram?.WebApp;
            tg?.showAlert('Trade failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col space-y-4 p-4">
            {/* Input Token */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-center">
                    <input
                        type="number"
                        value={inputToken.amount}
                        onChange={(e) => setInputToken({ ...inputToken, amount: e.target.value })}
                        placeholder="0.0"
                        className="w-2/3 text-2xl bg-transparent outline-none"
                    />
                    <button className="flex items-center space-x-2 bg-blue-50 dark:bg-gray-700 rounded-lg px-3 py-2">
                        <img src="/sol-logo.png" alt="SOL" className="w-6 h-6 rounded-full" />
                        <span className="font-medium">{inputToken.symbol}</span>
                    </button>
                </div>
            </div>

            {/* Swap Button */}
            <button 
                onClick={() => {
                    setInputToken(outputToken);
                    setOutputToken(inputToken);
                }}
                className="mx-auto p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
                <ArrowDown className="w-6 h-6" />
            </button>

            {/* Output Token */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-center">
                    <input
                        type="number"
                        value={outputToken.amount}
                        readOnly
                        placeholder="0.0"
                        className="w-2/3 text-2xl bg-transparent outline-none"
                    />
                    <button className="flex items-center space-x-2 bg-blue-50 dark:bg-gray-700 rounded-lg px-3 py-2">
                        <img src="/bonk-logo.png" alt="BONK" className="w-6 h-6 rounded-full" />
                        <span className="font-medium">{outputToken.symbol}</span>
                    </button>
                </div>
                {price && (
                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Price: <AnimatedNumber value={price} /> {outputToken.symbol}/SOL
                        <span className={`ml-2 ${priceChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            ({priceChange > 0 ? '+' : ''}{priceChange.toFixed(2)}%)
                        </span>
                    </div>
                )}
            </div>

            {/* Trade Button */}
            <button
                onClick={handleSwap}
                disabled={loading || !inputToken.amount}
                className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
                    loading || !inputToken.amount
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'btn-primary'
                }`}
            >
                {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Trading...</span>
                    </div>
                ) : !walletConnected ? (
                    'Connect Wallet'
                ) : !inputToken.amount ? (
                    'Enter Amount'
                ) : (
                    'Swap'
                )}
            </button>

            {/* Settings */}
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <button
                    onClick={() => {/* Add settings modal */}}
                    className="flex items-center space-x-1"
                >
                    <Settings className="w-4 h-4" />
                    <span>Slippage: {slippage}%</span>
                </button>
                <div className="flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>Network Fee: ~0.0005 SOL</span>
                </div>
            </div>
        </div>
    );
};

export default TradingView;