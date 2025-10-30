# FlowSubs - Decentralized Subscription Management on Flow

![FlowSubs Banner](https://via.placeholder.com/800x200/8B5CF6/FFFFFF?text=FlowSubs+-+Web3+Subscriptions)

> A modern, decentralized subscription management platform built on the Flow blockchain. Create, manage, and pay recurring subscriptions with smart contracts for full transparency and automation.

## 🌟 Features

- **🔐 Decentralized**: All subscriptions run on smart contracts - no central authority
- **💰 On-Chain Payments**: Direct FLOW token payments with transparent transaction history
- **⏰ Automated Billing**: Smart contract-enforced recurring payment intervals
- **📊 Real-Time Dashboard**: Track subscription status, payments, and history
- **🔄 Grace Periods**: Built-in grace periods for flexible payment timing
- **🎨 Modern UI**: Clean, responsive design with dark mode support

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Flow CLI (for contract deployment)
- A Flow testnet account with some FLOW tokens

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd FlowSubs
```

### 2. Install Frontend Dependencies

```bash
cd frontend/flowsubs
npm install
```

### 3. Deploy Smart Contracts

```bash
cd ../../contract
flow project deploy --network testnet
```

Update the contract address in:
- `frontend/flowsubs/hooks/useSubscriptions.ts` (line 24)
- `frontend/flowsubs/app/api/transactions/[address]/route.ts` (lines 33, 53, 63)

### 4. Run the Application

```bash
cd frontend/flowsubs
npm run dev
```

Visit `http://localhost:3000` to start using FlowSubs!

## 📁 Project Structure

```
FlowSubs/
├── contract/                    # Cadence smart contracts
│   ├── cadence/
│   │   ├── SubscriptionManager.cdc    # Main contract
│   │   └── transactions/              # Transaction scripts
│   └── flow.json                      # Deployment config
├── frontend/flowsubs/            # Next.js application
│   ├── app/
│   │   ├── api/transactions/[address]/ # Event history API
│   │   ├── subscriptions/             # Subscription management
│   │   ├── dashboard/                 # Dashboard page
│   │   └── page.tsx                   # Landing page
│   ├── components/                    # Reusable UI components
│   ├── hooks/                        # Custom React hooks
│   └── lib/                          # Flow configuration
└── README.md
```

## 🎯 How to Use FlowSubs

### 1. Connect Your Wallet
- Click "Sign in with Flow Wallet" on the homepage
- Connect your Flow testnet wallet (Blocto, Lilico, etc.)

### 2. Create a Subscription
- Navigate to `/subscriptions`
- Click "Create Subscription"
- Fill in:
  - **Payee Address**: The Flow address to receive payments
  - **Amount**: FLOW tokens to pay per interval
  - **Interval**: Payment frequency in blocks (~1 block = 1 second)
  - **Grace Period**: Allowed delay before late fees

### 3. Manage Subscriptions
- View all your subscriptions in the dashboard
- Pay upcoming subscriptions with one click
- Cancel subscriptions when needed
- Track payment history and status

### 4. Monitor Activity
- Visit `/dashboard` for overview statistics
- View recent activity and payment history
- Track total payments and active subscriptions

## 🔧 Technical Details

### Smart Contracts (Cadence 1.0)

**SubscriptionManager.cdc** provides:
- User-owned subscription collections
- Create/Pay/Cancel operations
- Event emission for all activities
- Grace period enforcement

**Key Functions:**
- `createSubscription()`: Create new recurring payments
- `paySubscription()`: Process payments
- `cancelSubscription()`: End subscriptions
- `getSubscriptions()`: Query user subscriptions

### Frontend Architecture

- **Next.js 16** with App Router
- **Flow FCL** for wallet integration
- **Tailwind CSS** for styling
- **Custom Hooks** for contract interactions
- **API Routes** for event history

### Data Sources

- **FindLabs API**: Primary event indexer for transaction history
- **Flow Access Node**: Fallback for direct blockchain queries
- **Smart Contract State**: Real-time subscription data

## 🧪 Testing

### Local Development
```bash
cd frontend/flowsubs
npm run dev
```

### Contract Testing
```bash
cd contract
flow transactions send transactions/setup_account.cdc --network testnet
flow transactions send transactions/subscriptions_create.cdc --network testnet --args-json '[{"type": "Address", "value": "0xPayeeAddress"}, {"type": "UFix64", "value": "10.0"}, {"type": "UInt64", "value": "86400"}, {"type": "UInt64", "value": "3600"}]'
```

### Build Check
```bash
cd frontend/flowsubs
npm run build
```

## 🚀 Deployment

### Smart Contracts
```bash
cd contract
flow project deploy --network testnet
```

### Frontend
```bash
cd frontend/flowsubs
npm run build
npm run start
# Or deploy to Vercel, Netlify, etc.
```

## 📊 API Endpoints

### GET `/api/transactions/[address]`
Fetch subscription events for a Flow address.

**Response:**
```json
{
  "address": "0x123...",
  "events": [
    {
      "id": "tx-123-1",
      "type": "SubscriptionCreated",
      "subscriptionID": "1",
      "payer": "0x123...",
      "payee": "0x456...",
      "amount": "10.0",
      "timestamp": "2024-01-01T00:00:00Z",
      "transactionId": "abc123..."
    }
  ],
  "count": 1,
  "source": "findlabs"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- Flow Blockchain team for the amazing platform
- FindLabs for indexer infrastructure
- Flow community for continuous support

---

**Built with ❤️ for the Flow ecosystem**
