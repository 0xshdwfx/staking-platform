import { useEffect } from 'react';
import { formatEther } from 'viem';
import { useAccount } from 'wagmi';
import { useClaimStk } from '../hooks/useClaimStk';
import { useFaucetClaimAmount } from '../hooks/useFaucetClaimAmount';
import { useFaucetClaimStatus } from '../hooks/useFaucetClaimStatus';
import { useStakingTokenBalance } from '../hooks/useStakingTokenBalance';
import { useStakingTokenSymbol } from '../hooks/useStakingTokenSymbol';
import { useTransactionToast } from '../hooks/useTransactionToast';

export function STKFaucet() {
	const { address } = useAccount();
	const { symbol: stakingTokenSymbol } = useStakingTokenSymbol();
	const {
		claimAmount,
		isLoading: isClaimAmountLoading,
		error: claimAmountError,
	} = useFaucetClaimAmount();
	const {
		hasClaimed,
		isLoading: isClaimStatusLoading,
		error: claimStatusError,
		refetch: refetchClaimStatus,
	} = useFaucetClaimStatus();
	const { refetch: refetchBalance } = useStakingTokenBalance();
	const { claim, isPending, isConfirming, isSuccess, error } = useClaimStk();

	useTransactionToast({
		isPending,
		isConfirming,
		isSuccess,
		error,
		pendingMessage: 'Confirm the STK claim in your wallet...',
		confirmingMessage: 'Confirming your STK claim on the blockchain...',
		successMessage: 'STK claimed successfully! You can now approve and stake.',
		operation: 'claimStk',
	});

	useEffect(() => {
		if (isSuccess) {
			refetchClaimStatus();
			refetchBalance();
		}
	}, [isSuccess, refetchClaimStatus, refetchBalance]);

	const formattedClaimAmount = formatEther(claimAmount ?? BigInt(0));
	const isClaimDisabled =
		!address ||
		isClaimStatusLoading ||
		isClaimAmountLoading ||
		hasClaimed === true ||
		isPending ||
		isConfirming ||
		claimAmount === undefined;

	return (
		<div>
			<h3 className='mb-4 text-lg font-semibold text-white'>
				Get Test {stakingTokenSymbol}
			</h3>

			<p className='mb-4 text-sm text-slate-400'>
				Claim{' '}
				<span className='font-semibold text-white'>
					{formattedClaimAmount} {stakingTokenSymbol}
				</span>{' '}
				once per wallet to try the staking platform.
			</p>

			<p className='mb-4 text-xs text-slate-500'>
				You still need Sepolia ETH to pay transaction fees for claiming,
				approving, and staking.
			</p>

			{!address ? (
				<p className='text-sm text-slate-400'>
					Connect your wallet to claim test {stakingTokenSymbol}.
				</p>
				) : claimAmountError || claimStatusError ? (
					<p className='text-sm text-red-400'>
						Unable to read the faucet on Sepolia. Switch to Sepolia and refresh.
					</p>
				) : hasClaimed ? (
				<p className='text-sm text-emerald-400'>
					This wallet has already claimed its {stakingTokenSymbol} allocation.
				</p>
			) : (
				<button
					type='button'
					onClick={() => claim()}
					disabled={isClaimDisabled}
					className='w-full cursor-pointer rounded-lg bg-purple-600 px-4 py-2 font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50'
				>
					{isPending
						? 'Claiming...'
						: isConfirming
							? 'Confirming...'
							: `Claim ${formattedClaimAmount} ${stakingTokenSymbol}`}
				</button>
			)}
		</div>
	);
}
