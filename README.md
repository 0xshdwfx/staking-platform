# Staking Platform

A professional, full-stack staking platform built with smart contracts and modern web technologies.

**Live Site:** [Staking Platform](https://staking-platform.0xs.to/)

---

## Overview

A secure and efficient ERC20 staking platform that allows users to stake STK tokens, earn RWT reward tokens, and manage their positions with complete transparency. The platform features emergency withdrawal capabilities and real-time reward tracking.

---

## Features

- **Stake & Unstake:** Deposit and withdraw STK tokens anytime
- **Earn Rewards:** Automatically accrue RWT rewards based on staked amount and time
- **Claim Rewards:** Withdraw earned rewards independent of staked principal
- **Emergency Withdrawal:** Terminal full-exit mechanism that immediately returns principal and forfeits pending rewards
- **Real-time Tracking:** Live reward calculations and balance updates
- **Professional UI:** Responsive Tailwind CSS interface with transaction notifications
- **Contract Verification:** All smart contracts verified on Etherscan for transparency

---

## How to Use

### 1. Connect Your Wallet

- Click "Connect Wallet" in the top-right corner
- Approve the connection in MetaMask/your Web3 wallet

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
- The address cannot stake again after an emergency withdrawal under the current terminal-state design

---

## Smart Contracts

All contracts are deployed on **Sepolia Testnet** and verified on Etherscan.

| Contract               | Address                                      | Verified Source                                                                                   |
| ---------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **Staking**            | `0x311124F2053389962ba2F3D389687Cb0d07c27F4` | [View Code](https://sepolia.etherscan.io/address/0x311124F2053389962ba2F3D389687Cb0d07c27F4#code) |
| **StakingToken (STK)** | `0xd0Db12859F3200e7b947b823F10dc7A460328C03` | [View Code](https://sepolia.etherscan.io/address/0xd0Db12859F3200e7b947b823F10dc7A460328C03#code) |
| **RewardToken (RWT)**  | `0x952F36979e0b61d81f86dbfDB36c16535713757A` | [View Code](https://sepolia.etherscan.io/address/0x952F36979e0b61d81f86dbfDB36c16535713757A#code) |

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
- Reward-rate updates apply the new global rate to all uncheckpointed accrual, including time elapsed before the update

---

## Implementation Scope and Limitations

The current implementation deliberately preserves the existing application architecture and public interface while applying targeted contract hardening:

- Emergency withdrawal is a terminal full exit: partial withdrawals revert, pending rewards are forfeited, and post-exit staking is blocked
- OpenZeppelin `SafeERC20` is used for staking, unstaking, and emergency-withdrawal token transfers
- Reward tokens are minted by the staking contract without a prefunded reward reserve or hard emission cap
- Fee-on-transfer and deflationary staking tokens are not supported through balance-delta accounting; the project assumes standard ERC20 transfer semantics
- Reward-rate updates are not checkpointed per user, so a new rate applies to all uncheckpointed accrual, including time elapsed before the update

These trade-offs are intentional for this Sepolia portfolio demonstration. The Foundry test suite passes, and the repository changes are committed and up to date.

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
