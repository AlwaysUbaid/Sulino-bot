import React, { useState, useEffect } from 'react';
import { TrendingUp, Wallet, Award, ChevronRight } from 'lucide-react';

// Import components
import WalletConnection from './components/WalletConnection.jsx';
import TradingView from './components/TradingView.jsx';
import StakingView from './components/StakingView.jsx';
import LotteryView from './components/LotteryView.jsx';

const TelegramWebApp = () => {
    const [activeTab, setActiveTab] = useState('trade');
    const [walletConnected, setWalletConnected] = useState(false);
    const [userStats, setUserStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [telegramUser, setTelegramUser] = useState(null);

    useEffect(() => {
        // Load Telegram WebApp script
        const script = document.createElement('script');
        script.src = 'https://telegram.org/js/telegram-web-app.js';
        script.async = true;
        script.onload = () => {
            if (window.Telegram?.WebApp) {
                const tg = window.Telegram.WebApp;
                setTelegramUser(tg.initDataUnsafe?.user);
                tg.ready();
                tg.expand();
                
                // Set theme based on Telegram theme
                document.body.className = tg.colorScheme;
                
                tg.enableClosingConfirmation();

                // Handle back button
                tg.BackButton.onClick(() => {
                    if (activeTab !== 'trade') {
                        setActiveTab('trade');
                        tg.BackButton.hide();
                    }
                });
            }
        };
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    useEffect(() => {
        // Update BackButton visibility
        if (window.Telegram?.WebApp) {
            const tg = window.Telegram.WebApp;
            if (activeTab === 'trade') {
                tg.BackButton.hide();
            } else {
                tg.BackButton.show();
            }
        }
    }, [activeTab]);

    const handleWalletConnect = async (publicKey) => {
        setWalletConnected(true);
        if (telegramUser) {
            try {
                const response = await fetch('/api/user/stats/' + telegramUser.id);
                const stats = await response.json();
                setUserStats(stats);
            } catch (error) {
                console.error('Error fetching user stats:', error);
            }
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-sm">
                <div className="p-4">
                    <h1 className="text-xl font-bold text-center">Sulino Trading</h1>
                    {userStats && (
                        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                            Volume: {userStats.tradeVolume.toFixed(2)} SOL
                        </div>
                    )}
                </div>
                {!walletConnected && (
                    <div className="px-4 pb-4">
                        <WalletConnection onConnect={handleWalletConnect} />
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden">
                {activeTab === 'trade' && (
                    <TradingView walletConnected={walletConnected} />
                )}
                {activeTab === 'stake' && (
                    <StakingView walletConnected={walletConnected} />
                )}
                {activeTab === 'lottery' && (
                    <LotteryView walletConnected={walletConnected} />
                )}
            </main>

            {/* Navigation Bar */}
            <nav className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-around p-2">
                    <button
                        onClick={() => setActiveTab('trade')}
                        className={`flex flex-col items-center p-2 ${
                            activeTab === 'trade' ? 'text-blue-500' : 'text-gray-500'
                        }`}
                    >
                        <TrendingUp className="w-6 h-6" />
                        <span className="text-xs mt-1">Trade</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('stake')}
                        className={`flex flex-col items-center p-2 ${
                            activeTab === 'stake' ? 'text-blue-500' : 'text-gray-500'
                        }`}
                    >
                        <Wallet className="w-6 h-6" />
                        <span className="text-xs mt-1">Stake</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('lottery')}
                        className={`flex flex-col items-center p-2 ${
                            activeTab === 'lottery' ? 'text-blue-500' : 'text-gray-500'
                        }`}
                    >
                        <Award className="w-6 h-6" />
                        <span className="text-xs mt-1">Lottery</span>
                    </button>
                </div>
            </nav>
        </div>
    );
};

export default TelegramWebApp;
