import React, { useState, useEffect } from 'react';
import { Clock, Lock, Award, ChevronRight } from 'lucide-react';

const StakingView = ({ walletConnected }) => {
    const [activeStakes, setActiveStakes] = useState([]);
    const [totalStaked, setTotalStaked] = useState(0);
    const [totalRewards, setTotalRewards] = useState(0);
    const [loading, setLoading] = useState(false);
    const [selectedDuration, setSelectedDuration] = useState(30); // 30 days
    const [stakeAmount, setStakeAmount] = useState('');

    const stakingOptions = [
        { days: 30, apy: '10%' },
        { days: 90, apy: '15%' },
        { days: 180, apy: '20%' }
    ];

    useEffect(() => {
        if (walletConnected) {
            fetchStakingData();
        }
    }, [walletConnected]);

    const fetchStakingData = async () => {
        try {
            const response = await fetch('/api/staking/active');
            const data = await response.json();
            setActiveStakes(data.stakes);
            setTotalStaked(data.totalStaked);
            setTotalRewards(data.totalRewards);
        } catch (error) {
            console.error('Staking data fetch error:', error);
        }
    };

    const handleStake = async () => {
        if (!stakeAmount || !walletConnected) return;

        setLoading(true);
        try {
            const tg = window.Telegram?.WebApp;
            tg?.showPopup({
                title: 'Confirm Staking',
                message: `Stake ${stakeAmount} SOL for ${selectedDuration} days?`,
                buttons: [
                    { type: 'cancel', text: 'Cancel' },
                    { type: 'default', text: 'Confirm' }
                ]
            }, async (buttonId) => {
                if (buttonId === 'Confirm') {
                    const response = await fetch('/api/staking/create', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            amount: parseFloat(stakeAmount),
                            duration: selectedDuration
                        })
                    });
                    
                    const data = await response.json();
                    if (data.success) {
                        tg?.showAlert('Staking successful!');
                        fetchStakingData();
                        setStakeAmount('');
                    } else {
                        tg?.showAlert('Staking failed. Please try again.');
                    }
                }
            });
        } catch (error) {
            console.error('Staking error:', error);
            const tg = window.Telegram?.WebApp;
            tg?.showAlert('Staking failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col space-y-4 p-4">
            {/* Staking Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                    <div className="text-sm text-gray-500">Total Staked</div>
                    <div className="text-xl font-bold">{totalStaked.toFixed(2)} SOL</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                    <div className="text-sm text-gray-500">Total Rewards</div>
                    <div className="text-xl font-bold text-green-500">
                        {totalRewards.toFixed(2)} SOL
                    </div>
                </div>
            </div>

            {/* Staking Input */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="flex flex-col space-y-4">
                    <input
                        type="number"
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(e.target.value)}
                        placeholder="Enter amount to stake"
                        className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    />
                    
                    {/* Duration Selection */}
                    <div className="grid grid-cols-3 gap-2">
                        {stakingOptions.map(option => (
                            <button
                                key={option.days}
                                onClick={() => setSelectedDuration(option.days)}
                                className={`p-2 rounded-lg text-center ${
                                    selectedDuration === option.days
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700'
                                }`}
                            >
                                <div className="text-sm">{option.days}d</div>
                                <div className="text-xs">{option.apy} APY</div>
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleStake}
                        disabled={loading || !stakeAmount || !walletConnected}
                        className={`w-full py-3 rounded-lg text-white font-medium ${
                            loading || !stakeAmount || !walletConnected
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'btn-primary'
                        }`}
                    >
                        {loading ? 'Staking...' : 'Stake SOL'}
                    </button>
                </div>
            </div>

            {/* Active Stakes */}
            <div className="space-y-2">
                <h3 className="text-lg font-medium">Active Stakes</h3>
                {activeStakes.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center text-gray-500">
                        No active stakes
                    </div>
                ) : (
                    activeStakes.map(stake => (
                        <div key={stake._id} className="bg-white dark:bg-gray-800 rounded-lg p-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="font-medium">{stake.amount.toFixed(2)} SOL</div>
                                    <div className="text-sm text-gray-500">
                                        {new Date(stake.endDate).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="text-green-500">
                                    +{stake.rewards.toFixed(2)} SOL
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default StakingView;