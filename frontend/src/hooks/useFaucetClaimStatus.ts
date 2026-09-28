import { useAccount, useReadContract } from 'wagmi';
import { sepolia } from 'wagmi/chains';
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
		chainId: sepolia.id,
		abi: STK_FAUCET_ABI,
		functionName: 'hasClaimed',
		args: [address],
			query: {
				enabled: Boolean(address),
				refetchInterval: false,
			},
	});

	return {
		hasClaimed: hasClaimed as boolean | undefined,
		isLoading,
		error,
		refetch,
	};
}
