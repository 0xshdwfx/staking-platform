import {
	useAccount,
	useWaitForTransactionReceipt,
	useWriteContract,
} from 'wagmi';
import { CONTRACT_ADDRESSES, STK_FAUCET_ABI } from '../config/contracts';

export function useClaimStk() {
	const { address } = useAccount();
	const { writeContract, isPending, data: hash, error } = useWriteContract();

	const { isLoading: isConfirming, isSuccess } =
		useWaitForTransactionReceipt({ hash });

	const claim = () => {
		if (!address) return;

		writeContract({
			address: CONTRACT_ADDRESSES.faucet as `0x${string}`,
			abi: STK_FAUCET_ABI,
			functionName: 'claim',
			account: address,
		});
	};

	return {
		claim,
		isPending,
		isConfirming,
		isSuccess,
		error,
	};
}
