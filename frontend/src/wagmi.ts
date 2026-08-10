// frontend/src/config/wagmi.ts

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'viem';
import { sepolia } from 'wagmi/chains';

const ALCHEMY_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

if (!ALCHEMY_KEY) {
	throw new Error(
		'NEXT_PUBLIC_ALCHEMY_API_KEY is not set in environment variables',
	);
}

export const config = getDefaultConfig({
	appName: 'Staking Project',
	projectId: '9a884bea4e5448474506781fac3613f0',
	chains: [sepolia],
	transports: {
		[sepolia.id]: http(`https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}`),
	},
	ssr: true,
});
