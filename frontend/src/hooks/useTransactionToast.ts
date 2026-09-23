import { useEffect } from 'react';
import { toast } from 'sonner';

interface TransactionToastConfig {
	isPending: boolean;
	isConfirming: boolean;
	isSuccess: boolean;
	error: unknown;
	pendingMessage: string;
	confirmingMessage: string;
	successMessage: string;
	operation?: 'stake' | 'unstake' | 'claimReward' | 'emergencyWithdrawal' | 'approve';
}

function parseErrorMessage(
	error: unknown,
	operation?: TransactionToastConfig['operation'],
): string {
	if (!error) return 'An error occurred';

	const errorObj = error as any;
	const functionName = errorObj.functionName;
	const args = errorObj.args?.[0];

	// Generic check: if amount is 0
	if (args === 0n) {
		if (functionName === 'stake')
			return 'Invalid stake amount - must be greater than 0';
		if (functionName === 'unstake')
			return 'Unstake amount must be greater than 0';
		if (functionName === 'emergencyWithdrawal')
			return 'Withdrawal amount must be greater than 0';
		if (functionName === 'claimReward') return 'No pending rewards to claim';
	}

	// Generic error checks
	if (
		errorObj.details?.includes('InvalidStakeAmount') ||
		errorObj.shortMessage?.includes('InvalidStakeAmount')
	)
		return 'Invalid stake amount';
	if (errorObj.details?.includes('AmountToUnstakeExceedsStakedAmount'))
		return 'Cannot unstake more than your staked amount';
	if (errorObj.details?.includes('AmountToWithdrawExceedsStakedAmount'))
		return 'Cannot withdraw more than your staked amount';
	if (errorObj.details?.includes('RewardAmountIsZero'))
		return 'No pending rewards to claim';
	if (errorObj.details?.includes('InsufficientAllowance'))
		return 'Insufficient token allowance';
	if (errorObj.details?.includes('InsufficientBalance'))
			return 'Insufficient token balance';
		if (
			errorObj.details?.includes('CannotStakeAfterEmergencyWithdraw') ||
			errorObj.shortMessage?.includes('CannotStakeAfterEmergencyWithdraw') ||
			errorObj.cause?.details?.includes('CannotStakeAfterEmergencyWithdraw')
		)
			return 'Emergency withdrawal completed. This wallet cannot stake again.';

	const errorStr = String(error);
	const lowerError = errorStr.toLowerCase();
	const isGasEstimationError =
		lowerError.includes('gas limit') ||
		lowerError.includes('gas required exceeds allowance') ||
		lowerError.includes('cannot estimate gas');

	if (operation === 'stake' && isGasEstimationError) {
			return 'Emergency withdrawal completed. This wallet cannot stake again.';
		}

		if (operation === 'approve' && isGasEstimationError) {
			return 'Approval unavailable: this wallet has no STK balance.';
		}

		if (isGasEstimationError) return 'Transaction gas limit exceeded';
	if (errorStr.includes('User rejected')) return 'Transaction rejected';

	return errorStr.substring(0, 100);
}

export function useTransactionToast(config: TransactionToastConfig) {
	const {
		isPending,
		isConfirming,
		isSuccess,
		error,
		pendingMessage,
		confirmingMessage,
		successMessage,
		operation,
	} = config;

	useEffect(() => {
		if (isPending) {
			toast.loading(pendingMessage, {
				style: {
					background: '#3b82f6',
					color: '#fff',
				},
			});
		}
	}, [isPending, pendingMessage]);

	useEffect(() => {
		if (isConfirming) {
			toast.dismiss();
			toast.loading(confirmingMessage, {
				style: {
					background: '#06b6d4',
					color: '#fff',
				},
			});
		}
	}, [isConfirming, confirmingMessage]);

	useEffect(() => {
		if (isSuccess) {
			toast.dismiss();
			toast.success(successMessage, {
				style: {
					background: '#10b981',
					color: '#fff',
				},
			});
		}
	}, [isSuccess, successMessage]);

	useEffect(() => {
		if (error) {
			toast.dismiss();
				const friendlyMessage = parseErrorMessage(error, operation);
			toast.error(friendlyMessage, {
				duration: 10000,
				style: {
					background: '#ef4444',
					color: '#fff',
				},
			});
		}
	}, [error, operation]);
}
