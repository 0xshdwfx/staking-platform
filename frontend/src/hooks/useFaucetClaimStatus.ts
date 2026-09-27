import { useAccount, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESSES, STK_FAUCET_ABI } from '../config/contracts';

export function useFaucetClaimStatus() {
	const { address } = useAccount();

	const {
		data: hasClaimed,
		isLoading,
		error,
		refetch,
	} = useReadContract({
		address: CONTRACT_ADDRESSES.faucet as `0x${string}`,
		abi: STK_FAUCET_ABI,
		functionName: 'hasClaimed',
		args: [address],
		query: {
			enabled: !!address,
			refetchInterval: 3000,
		},
	});

	return {
		hasClaimed: hasClaimed as boolean | undefined,
		isLoading,
		error,
		refetch,
	};
}
