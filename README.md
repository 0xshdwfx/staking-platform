# Staking Platform

A full-stack ERC-20 staking platform deployed on Sepolia, built with Solidity, Foundry, Next.js, and Wagmi.

**Live Site:** [Staking Platform](https://staking-platform.0xs.to/)

---

## Overview

A secure and efficient ERC20 staking platform that allows users to stake STK tokens, earn RWT reward tokens, and manage their positions with complete transparency. The platform features emergency withdrawal capabilities and real-time reward tracking.

---

## Features

- **Stake & Unstake:** Deposit and withdraw STK tokens anytime
- **Earn Rewards:** Automatically accrue RWT rewards based on staked amount and time
- **Claim Rewards:** Withdraw earned rewards independent of staked principal
- **STK Faucet:** Claim 10 STK once per wallet address through the self-service Sepolia faucet
- **Emergency Withdrawal:** Terminal full-exit mechanism that immediately returns principal and forfeits pending rewards
- **Real-time Tracking:** Live reward calculations and balance updates
- **Professional UI:** Responsive Tailwind CSS interface with transaction notifications
- **Contract Verification:** All smart contracts verified on Etherscan for transparency

---

## How to Use

### 1. Connect Your Wallet

- Click "Connect Wallet" in the top-right corner
- Approve the connection in MetaMask/your Web3 wallet

### Getting STK for Testing

The homepage includes a self-service faucet that distributes **10 STK once per wallet address**. Claims are available only while the faucet has sufficient STK reserves.

Anyone testing the platform therefore needs:

- Sepolia ETH for transaction fees, obtained from a Sepolia ETH faucet
- STK claimed through the platform faucet

The faucet claim is an on-chain transaction and therefore also requires Sepolia ETH for gas. The faucet supplies STK only; it does not supply Sepolia ETH.

If STK is not displayed automatically, import the current STK contract address shown in the [verified contract table](#smart-contracts) into the wallet. Do not use an older STK deployment with the current staking contract.

### 2. View Your Stats

- **Staked Amount:** See how much STK you have locked in staking
- **Pending Rewards:** View earned RWT tokens (updates in real-time)

### 3. Stake Tokens

- Enter the amount of STK to stake
- Click "Approve STK" (one-time, allows contract to spend your tokens)
- Click "Stake" to lock tokens and start earning rewards
- Confirm transaction in your wallet

### 4. Claim Rewards

- Check your "Pending Rewards" amount
- Click "Claim Reward" to withdraw earned RWT tokens
- Your staked STK remains locked and continues earning

### 5. Unstake Tokens

- Enter the amount of STK to withdraw
- Click "Unstake" to recover your principal
- Your pending rewards are preserved and can be claimed separately

### 6. Emergency Withdrawal

- Use only when you need an immediate full exit
- **⚠️ Warning:** Forfeits all pending rewards
- The full staked balance must be withdrawn; partial emergency withdrawals revert
- Transfers the complete staked STK balance immediately
- The address cannot stake again after an emergency withdrawal under the current terminal-state design; the frontend displays this restriction and disables staking controls

---

## Smart Contracts

All contracts are deployed on **Sepolia Testnet** and verified on Etherscan.

| Contract               | Address                                      | Verified Source                                                                                   |
| ---------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **Staking**            | `0x311124F2053389962ba2F3D389687Cb0d07c27F4` | [View Code](https://sepolia.etherscan.io/address/0x311124F2053389962ba2F3D389687Cb0d07c27F4#code) |
| **StakingToken (STK)** | `0xd0Db12859F3200e7b947b823F10dc7A460328C03` | [View Code](https://sepolia.etherscan.io/address/0xd0Db12859F3200e7b947b823F10dc7A460328C03#code) |
| **RewardToken (RWT)**  | `0x952F36979E0b61d81f86dbfDB36c16535713757A` | [View Code](https://sepolia.etherscan.io/address/0x952F36979E0b61d81f86dbfDB36c16535713757A#code) |
| **STKFaucet**          | `0x9582D6182dcFE9Dc9F279280B53a841F9e7001cf` | [View Code](https://sepolia.etherscan.io/address/0x9582d6182dcfe9dc9f279280b53a841f9e7001cf#code) |

---

## Rewards Mechanism

### How Rewards Work

Rewards accumulate continuously based on:

- **Your staked amount** (STK)
- **Time staked** (seconds since last action)
- **Annual reward rate** (10% annual; retained legacy daily-rate naming in the contract interface)

### Formula

Reward = (Staked Amount × Time Elapsed × Annual Rate) / (365 days)

### Example

Stake 1 STK for 1 day at 10% annual rate:

Reward = (1 × 86,400 seconds × 0.1) / (31,536,000 seconds) ≈ 0.000274 RWT

### Key Points

- Rewards are **calculated in real-time** but only "finalized" when you stake, unstake, or claim
- You can claim rewards **anytime** without unstaking
- Pending rewards are **preserved** when you unstake (only forfeited in emergency withdrawal)

### Known Accounting Limitation

`setRewardRate()` updates one global annual rate. User accrual is not checkpointed when the owner changes that rate. Consequently, when a user next reads or interacts with the contract, the new rate is applied to the entire period since their last checkpoint, including time elapsed before the rate update.

This is an intentional simplification for this first Solidity and Foundry portfolio project, not a production-ready reward-accounting model. A production implementation should use rate-period checkpoints or global reward-per-token accounting so historical accrual remains tied to the rate active during each period. The behaviour is covered by the Foundry test `testRewardRateChangeAppliesToUncheckpointedAccrual()`.

---

## Implementation Scope and Limitations

The current implementation deliberately preserves the existing application architecture and public interface while applying targeted contract hardening:

- Emergency withdrawal is a terminal full exit: partial withdrawals revert, pending rewards are forfeited, and post-exit staking is blocked; the frontend reflects this terminal state
- The staking contract can be paused by the owner; staking and unstaking are unavailable while paused, while emergency withdrawal remains available
- OpenZeppelin `SafeERC20` is used for staking, unstaking, and emergency-withdrawal token transfers
- Reward tokens are minted by the staking contract without a prefunded reward reserve or hard emission cap
- The staking contract assumes standard ERC20 transfer behaviour, where the amount requested is the amount received. Fee-on-transfer and deflationary tokens are not supported because the contract does not account for a difference between the requested transfer amount and the amount actually received.
- The self-service faucet is funded with a finite STK reserve; each wallet address can claim only once

These trade-offs are intentional for this Sepolia portfolio demonstration. The Foundry test suite passes.

---

## Risk Disclaimer

⚠️ **Before using this platform, please understand:**

- **Smart Contract Risk:** While all contracts are verified and thoroughly tested, smart contracts can contain bugs or vulnerabilities
- **Testnet Only:** This platform is currently on Sepolia testnet for testing purposes
- **No Guarantees:** Staking provides no guaranteed returns
- **Loss of Funds:** Improper use of emergency withdrawal may result in forfeited rewards
- **Technical Risk:** Network congestion, gas spikes, or wallet issues may affect transactions
- **Regulatory Risk:** Crypto regulations may change; always comply with local laws

**Use at your own risk. Only stake amounts you can afford to lose.**

---

## Technology Stack

### Smart Contracts

- **Solidity** 0.8.26
- **Foundry** (compilation & testing)
- **OpenZeppelin** contracts (ERC20, Ownable, Pausable, ReentrancyGuard)

### Frontend

- **Next.js** 16+ (React framework)
- **TypeScript** (type safety)
- **Tailwind CSS v4** (styling)
- **Wagmi v2** (Web3 hooks)
- **Viem** (Ethereum utilities)
- **RainbowKit** (wallet connection)
- **Sonner** (notifications)

---

## Development

### Prerequisites

- Node.js 18+
- Foundry
- Git

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Smart Contracts

```bash
cd contracts
forge build
forge test
```

The project also includes a focused Foundry invariant suite covering staking-token solvency and emergency-withdrawal finality. The suite passed 1,000 randomized runs and 500,000 generated handler calls for each invariant:

```bash
FOUNDRY_INVARIANT_RUNS=1000 forge test \
  --match-path "test/invariant/StakingInvariantTest.t.sol"
```

## Portfolio

This project is part of my Web3 development portfolio showcasing:

- Full-stack dApp development
- Smart contract design & security
- Professional frontend UI/UX
- Production-grade code quality

[View Full Portfolio](https://www.0xs.to/)

## Support

For issues:

1. Check the verified contract code on Etherscan
2. Review the transaction details in your wallet
3. Ensure you're on Sepolia testnet
