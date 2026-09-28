import { useReadContract } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { CONTRACT_ADDRESSES, STK_FAUCET_ABI } from '../config/contracts';

export function useFaucetClaimAmount() {
	const { data: claimAmount, isLoading, error, refetch } = useReadContract({
		address: CONTRACT_ADDRESSES.faucet as `0x${string}`,
		chainId: sepolia.id,
		abi: STK_FAUCET_ABI,
		functionName: 'CLAIM_AMOUNT',
		query: {
			refetchInterval: false,
		},
	});

	return {
		claimAmount: claimAmount as bigint | undefined,
		isLoading,
		error,
		refetch,
	};
}
