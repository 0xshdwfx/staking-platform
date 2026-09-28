import { useEffect, useState } from 'react';
import { parseEther, formatEther } from 'viem';
import { useAccount, useBalance } from 'wagmi';
import { toast } from 'sonner';
import { useStake } from '../hooks/useStake';
import { useStakingTokenBalance } from '../hooks/useStakingTokenBalance';
import { useStakingTokenAllowance } from '../hooks/useStakingTokenAllowance';
import { useApproveStakingToken } from '../hooks/useApproveStakingToken';
import { useStakedAmount } from '../hooks/useStakedAmount';
import { usePendingRewards } from '../hooks/usePendingRewards';
import { useStakingTokenSymbol } from '../hooks/useStakingTokenSymbol';
import { useTransactionToast } from '../hooks/useTransactionToast';

export function Stake() {
	const { address } = useAccount();
	const { data: nativeBalance } = useBalance({ address });

	const [amount, setAmount] = useState('');
	const {
		stake,
		isPending: isStakePending,
		isConfirming: isStakeConfirming,
		error: stakeError,
		isSuccess: isStakeSuccess,
		emergencyWithdrawn,
		paused,
	} = useStake();
	const { stakingTokenBalance, refetch: refetchBalance } =
		useStakingTokenBalance();
	const { allowance } = useStakingTokenAllowance();
	const {
		approve,
		isPending: isApprovePending,
		isConfirming: isApproveConfirming,
		isSuccess: isApproveSuccess,
		error: approveError,
	} = useApproveStakingToken();
	const { refetch: refetchStaked } = useStakedAmount();
	const { refetch: refetchPending } = usePendingRewards();
	const { symbol: stakingTokenSymbol } = useStakingTokenSymbol();

	const isApproved = allowance && allowance > BigInt(0);

	const handleApprove = () => {
		if (!nativeBalance || nativeBalance.value === BigInt(0)) {
			toast.error(
				'Approval unavailable: this wallet has no Sepolia ETH for gas.',
				{ duration: 10000 },
			);
			return;
		}

		approve();
	};

	const handleStake = async () => {
		if (paused) {
			toast.error('Staking is temporarily paused by the contract owner.', {
				duration: 10000,
			});
			return;
		}

		if (!emergencyWithdrawn && !amount) return;
		const amountInWei = amount ? parseEther(amount) : BigInt(0);
		const result = await stake(amountInWei);

		if (!result.submitted) {
			const message =
				result.reason === 'paused'
					? 'Staking is temporarily paused by the contract owner.'
					: result.reason === 'emergency-withdrawn'
						? 'Emergency withdrawal completed. This wallet cannot stake again.'
						: 'Connect your wallet before staking.';
			toast.error(message, { duration: 10000 });
			return;
		}

		setAmount('');
	};

	const formattedBalance = stakingTokenBalance
		? formatEther(stakingTokenBalance)
		: '0.00';

	useEffect(() => {
		if (isStakeSuccess) {
			refetchBalance();
			refetchStaked();
			refetchPending();
			setAmount('');
		}
	}, [isStakeSuccess, refetchBalance, refetchStaked, refetchPending]);

	useTransactionToast({
		isPending: isApprovePending,
		isConfirming: isApproveConfirming,
		isSuccess: isApproveSuccess,
		error: approveError,
		pendingMessage: 'Confirm approval in Wallet...',
		confirmingMessage: 'Confirming approval on blockchain...',
		successMessage: 'Approval successful! Now you can stake.',
		operation: 'approve',
	});

	useTransactionToast({
		isPending: isStakePending,
		isConfirming: isStakeConfirming,
		isSuccess: isStakeSuccess,
		error: stakeError,
		pendingMessage: 'Transaction pending... confirm in Wallet',
		confirmingMessage: 'Waiting for blockchain confirmation...',
		successMessage: 'Stake successful!',
		operation: 'stake',
	});

	return (
		<div>
			<h3 className='mb-4 text-lg font-semibold text-white'>
				Stake {stakingTokenSymbol}
			</h3>

			<p className='mb-4 text-sm text-slate-400'>
				Balance:{' '}
				<span className='font-semibold text-white'>
					{formattedBalance} {stakingTokenSymbol}
				</span>
			</p>

			{emergencyWithdrawn ? (
				<p className='mb-4 text-sm text-amber-400'>
					Emergency withdrawal completed. This wallet cannot stake again.
				</p>
			) : null}

			<input
				type='number'
				placeholder='Amount to stake'
				value={amount}
				onChange={(event) => setAmount(event.target.value)}
				disabled={isStakePending || isApprovePending || !isApproved}
				className='mb-4 w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
			/>

			{!isApproved ? (
				<button
					type='button'
					onClick={handleApprove}
					disabled={isApprovePending || !address}
					className='w-full cursor-pointer rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50'
				>
					{isApprovePending ? 'Approving...' : `Approve ${stakingTokenSymbol}`}
				</button>
			) : (
				<button
					type='button'
					onClick={handleStake}
					disabled={isStakePending || (!amount && !address)}
					className='w-full cursor-pointer rounded-lg bg-green-600 px-4 py-2 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50'
				>
					{isStakePending ? 'Staking...' : 'Stake'}
				</button>
			)}
		</div>
	);
}
