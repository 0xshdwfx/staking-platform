import {
	useReadContract,
	useWriteContract,
	useAccount,
	useWaitForTransactionReceipt,
} from 'wagmi';
import { CONTRACT_ADDRESSES, STAKING_ABI } from '../config/contracts';

type StakePreflightResult =
	| { submitted: true }
	| {
			submitted: false;
			reason: 'paused' | 'emergency-withdrawn' | 'not-connected';
	  };

export function useStake() {
	const { address } = useAccount();	
	const {
		data: emergencyWithdrawn,
		refetch: refetchEmergencyWithdrawn,
	} = useReadContract({
		address: CONTRACT_ADDRESSES.staking as `0x${string}`,
		abi: STAKING_ABI,
		functionName: 'emergencyWithdrawn',
		args: [address],
		query: { enabled: Boolean(address), refetchInterval: false },
	});
	const { data: paused, refetch: refetchPaused } = useReadContract({
		address: CONTRACT_ADDRESSES.staking as `0x${string}`,
		abi: STAKING_ABI,
		functionName: 'paused',
	});

	const { writeContract, isPending, data: hash, error } = useWriteContract();
	const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
		hash,
	});

	const stake = async (amount: bigint): Promise<StakePreflightResult> => {
		const { data: currentPaused } = await refetchPaused();
		if (currentPaused === true) {
			return { submitted: false, reason: 'paused' };
		}

		const { data: currentEmergencyWithdrawn } =
			await refetchEmergencyWithdrawn();
		if (currentEmergencyWithdrawn === true) {
			return { submitted: false, reason: 'emergency-withdrawn' };
		}

		if (!address) {
			return { submitted: false, reason: 'not-connected' };
		}

		writeContract({
			address: CONTRACT_ADDRESSES.staking as `0x${string}`,
			abi: STAKING_ABI,
			functionName: 'stake',
			args: [amount],
			account: address,
		});

		return { submitted: true };
	};

	return {
		stake,
		isPending,
		isConfirming,
		isSuccess,
		error,
		emergencyWithdrawn: emergencyWithdrawn === true,
		refetchEmergencyWithdrawn,
		refetchPaused,
		paused: paused === true,
	};
}
