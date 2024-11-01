import React, { useState, useEffect } from 'react';
import { Wallet } from 'lucide-react';

const WalletConnection = ({ onConnect }) => {
    const [isConnecting, setIsConnecting] = useState(false);
    const [walletAddress, setWalletAddress] = useState(null);
    const [balance, setBalance] = useState(null);

    const connectWallet = async () => {
        setIsConnecting(true);
        try {
            const tg = window.Telegram?.WebApp;
            tg?.showPopup({
                title: 'Connect Wallet',
                message: 'Please approve the connection request in your wallet',
                buttons: [{ type: 'close' }]
            });

            const response = await fetch('/api/wallet/connect', {
                method: 'POST'
            });
            const data = await response.json();

            if (data.connected) {
                setWalletAddress(data.publicKey);
                getBalance(data.publicKey);
                onConnect?.(data.publicKey);
                
                tg?.showAlert('Wallet connected successfully!');
            }
        } catch (error) {
            console.error('Wallet connection error:', error);
            const tg = window.Telegram?.WebApp;
            tg?.showAlert('Failed to connect wallet. Please try again.');
        } finally {
            setIsConnecting(false);
        }
    };

    const getBalance = async (address) => {
        try {
            const response = await fetch(`/api/wallet/balance/${address}`);
            const data = await response.json();
            setBalance(data.balance);
        } catch (error) {
            console.error('Balance fetch error:', error);
        }
    };

    return (
        <div className="flex flex-col space-y-4">
            {!walletAddress ? (
                <button
                    onClick={connectWallet}
                    disabled={isConnecting}
                    className="btn-primary flex items-center justify-center space-x-2 p-3 rounded-lg text-white font-medium"
                >
                    {isConnecting ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                        <>
                            <Wallet className="w-5 h-5" />
                            <span>Connect Wallet</span>
                        </>
                    )}
                </button>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Wallet className="w-5 h-5 text-blue-500" />
                            <div className="text-sm">
                                <div className="font-medium">
                                    {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
                                </div>
                                {balance !== null && (
                                    <div className="text-gray-500 dark:text-gray-400">
                                        {balance.toFixed(4)} SOL
                                    </div>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => {/* Add disconnect logic */}}
                            className="text-sm text-red-500 hover:text-red-600"
                        >
                            Disconnect
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WalletConnection;