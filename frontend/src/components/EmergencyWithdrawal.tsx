import { useEffect } from 'react';
import { formatEther } from 'viem';
import { useAccount } from 'wagmi';
import { useEmergencyWithdrawal } from '../hooks/useEmergencyWithdrawal';
import { useStakedAmount } from '../hooks/useStakedAmount';
import { useStakingTokenBalance } from '../hooks/useStakingTokenBalance';
import { useStakingTokenSymbol } from '../hooks/useStakingTokenSymbol';
import { useTransactionToast } from '../hooks/useTransactionToast';

interface EmergencyWithdrawalProps {
	onPendingChange?: (value: boolean) => void;
}

export function EmergencyWithdrawal({
	onPendingChange,
}: EmergencyWithdrawalProps) {
	const { address } = useAccount();

	const {
		emergencyWithdrawal,
		isPending: isWithdrawalPending,
		isConfirming: isWithdrawalConfirming,
		error: withdrawalError,
		isSuccess: isWithdrawalSuccess,
	} = useEmergencyWithdrawal();
	const { refetch: refetchBalance } = useStakingTokenBalance();
	const { refetch: refetchStaked } = useStakedAmount();
	const { symbol: stakingTokenSymbol } = useStakingTokenSymbol();

	const { stakedAmount } = useStakedAmount();
	const formattedStakedAmount = formatEther(stakedAmount || 0n);

	const handleEmergencyWithdrawal = () => {
		if (stakedAmount === 0n) return;
		emergencyWithdrawal(stakedAmount ?? 0n);
	};

	useEffect(() => {
		onPendingChange?.(isWithdrawalPending || isWithdrawalConfirming);
	}, [isWithdrawalPending, isWithdrawalConfirming, onPendingChange]);

	// Toast notifications
	useTransactionToast({
		isPending: isWithdrawalPending,
		isConfirming: isWithdrawalConfirming,
		isSuccess: isWithdrawalSuccess,
		error: withdrawalError,
		pendingMessage: 'Transaction pending... confirm in Wallet',
		confirmingMessage: 'Waiting for blockchain confirmation...',
		successMessage:
			'Emergency withdrawal successful! All pending rewards forfeited.',
	});

	// Refetch data after successful withdrawal
	useEffect(() => {
			if (isWithdrawalSuccess) {
				refetchBalance();
				refetchStaked();
			}
	}, [isWithdrawalSuccess, refetchBalance, refetchStaked]);

	return (
		<div>
			<h3 className='text-lg font-semibold text-white mb-4'>
				Emergency Withdrawal
			</h3>

			<p className='text-sm text-slate-400 mb-2'>
				⚠️ <span className='text-red-400'>Warning:</span> Forfeits all pending
				rewards
			</p>

				<p className='text-sm text-slate-400 mb-4'>
					Full balance available:{' '}
					<span className='text-white font-semibold'>
						{parseFloat(formattedStakedAmount).toFixed(4)} {stakingTokenSymbol}
					</span>
				</p>

				<p className='text-xs text-slate-500 mb-4'>
					Emergency withdrawal returns your full staked balance, forfeits pending
					rewards, and permanently closes this wallet's staking position.
				</p>

				<button
					onClick={handleEmergencyWithdrawal}
					disabled={
						isWithdrawalPending ||
						isWithdrawalConfirming ||
						!address ||
						stakedAmount === 0n
					}
					className='w-full px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer'
				>
					{isWithdrawalPending ? 'Withdrawing...' : 'Withdraw Full Balance'}
				</button>
		</div>
	);
}
