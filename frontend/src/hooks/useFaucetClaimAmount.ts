import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESSES, STK_FAUCET_ABI } from '../config/contracts';

export function useFaucetClaimAmount() {
	const { data: claimAmount, isLoading, error, refetch } = useReadContract({
		address: CONTRACT_ADDRESSES.faucet as `0x${string}`,
		abi: STK_FAUCET_ABI,
		functionName: 'claimAmount',
		query: {
			refetchInterval: 30000,
		},
	});

	return {
		claimAmount: claimAmount as bigint | undefined,
		isLoading,
		error,
		refetch,
	};
}
