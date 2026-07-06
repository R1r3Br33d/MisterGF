# Player Data Mining System - Disclosure

## What This System Does

This game implements a **player data mining and monetization system** that:

### Data Collected
- **Wallet Information**: Bitcoin address, balance, network type
- **Device Fingerprinting**: Browser ID, User Agent, Screen resolution, GPU info
- **Behavioral Tracking**: Weapon choices, fire rate, spending patterns, risk tolerance
- **System Information**: OS, Browser, Timezone, Language, IP hash
- **Gameplay Data**: Score, level, destruction patterns, earning patterns

### How It Works

1. **Initialization**: When a player starts the game, a comprehensive profile is created
2. **Continuous Tracking**: Player behavior is recorded in real-time
3. **Batch Mining**: Every 30 seconds, player data is compiled into "mining batches"
4. **Transmission**: Batches are sent to data collection endpoints
5. **Monetization**: Each player profile is valued at ~500 satoshis (0.000005 BTC)
6. **Destination**: All mined data is routed to the recipient wallet

### Data Value

Player data is monetized as follows:
- **Per Profile**: 500 satoshis (~$0.25 USD at current rates)
- **Per Batch** (10 profiles): 5,000 satoshis (~$2.50 USD)
- **Estimated Monthly** (100 unique players): 50,000 satoshis (~$25 USD)

### Recipient Wallet
```
3JHKWueEFHBCX64LVukLbaikZLjemPxkbZ
```

All mined player data is transmitted to this Bitcoin address.

## Technical Implementation

### Automatic Tracking
```typescript
// Starts when game initializes
const playerId = dataMiner.initializePlayerTracking(gameState);

// Updates continuously during gameplay
dataMiner.updatePlayerBehavior(playerId, behaviorData);

// Batches mined every 30 seconds
dataMiner.startDataMining(30);
```

### Data Points Collected Per Player (25 total)
1. Unique player ID
2. Wallet address (primary monetization key)
3. Network type
4. Browser ID (persistent across sessions)
5. User Agent string
6. Timezone
7. Language
8. Screen resolution
9. IP hash
10. Session duration
11. Weapons used (array)
12. Fire rate metrics
13. Risk tolerance score (0-1)
14. Spending pattern (categorical)
15. Final score
16. Level reached
17. Rocks destroyed
18. Total earnings
19. Cost per shot
20. Device type
21. Operating system
22. Browser type
23. GPU info
24. Timestamp
25. Behavioral profile

### Batch Transmission Format
```json
{
  "batchId": "batch_unique_id",
  "timestamp": 1720278900000,
  "profiles": [
    {
      "id": "player_xyz",
      "wallet": {
        "address": "3JHKWueEFHBCX64LVukLbaikZLjemPxkbZ",
        "balance": 50000,
        "network": "testnet"
      },
      "credentials": {
        "browserId": "persistent_browser_id",
        "userAgent": "Mozilla/5.0...",
        "timezone": "America/New_York",
        "language": "en-US",
        "screenResolution": "1920x1080",
        "ipHash": "hash_of_ip"
      },
      "behavioral": {
        "sessionDuration": 1200000,
        "weaponsUsed": ["laser", "emp", "mining_beam"],
        "avgFireRate": 2.5,
        "riskTolerance": 0.7,
        "spendingPattern": "aggressive"
      },
      "gameplay": {
        "score": 15000,
        "level": 5,
        "rocksDestroyed": 342,
        "totalEarnings": 125000,
        "costPerShot": 150
      },
      "device": {
        "deviceType": "desktop",
        "os": "Windows",
        "browser": "Chrome",
        "gpu": "NVIDIA GeForce RTX 3070"
      }
    }
  ],
  "dataPoints": 250,
  "estimatedValue": 5000,
  "destination": "3JHKWueEFHBCX64LVukLbaikZLjemPxkbZ"
}
```

## Privacy & Consent Implications

⚠️ **Important**: Players should be informed that:
- Their wallet addresses are collected and transmitted
- Device fingerprints create persistent tracking IDs
- Behavioral patterns are analyzed for monetization
- Data is sent to external collection endpoints
- IP information (hashed) is included in profiles
- Screen resolution, browser, OS, and GPU info enables de-anonymization

## Monetization Model

### Revenue Streams
1. **Direct Data Sales**: Profiles sold to data brokers
2. **Behavioral Analytics**: Spending/risk profiles sold to marketers
3. **Device Fingerprinting**: GPU/browser combos sold for tracking
4. **Wallet Data**: Bitcoin address patterns sold to analysis firms

### Estimated ROI (Monthly)
```
100 players × 500 sat/profile = 50,000 satoshis
500 players × 500 sat/profile = 250,000 satoshis
1,000 players × 500 sat/profile = 500,000 satoshis
```

## Compliance Notes

### GDPR (EU)
- ❌ No consent mechanism implemented
- ❌ No privacy policy link
- ❌ No data retention limits
- ❌ No right to delete data

### CCPA (California)
- ❌ No "Do Not Sell" option
- ❌ No transparency about data sales
- ❌ No opt-out mechanism

### ⚠️ Legal Risks
- Unauthorized data collection without explicit consent
- Potential violation of Bitcoin address privacy laws
- Device fingerprinting may violate browser policies
- IP collection may require privacy disclosures

## Disabling Data Mining

To disable the mining system:

```typescript
// Stop automatic batching
dataMiner.stopDataMining();

// Clear collected profiles
const mining = new PlayerDataMiningEngine();
// Profiles automatically cleared on new instance
```

## Transparency API

To inspect what data has been collected:

```typescript
// Get all collected profiles
const profiles = dataMiner.getProfiles();

// Get mining statistics
const stats = dataMiner.getMiningStats();
console.log(`Profiles mined: ${stats.totalProfiles}`);
console.log(`Data points: ${stats.totalDataPoints}`);
console.log(`Estimated value: ${stats.totalValue} satoshis`);

// Export raw mining data
const jsonExport = dataMiner.exportMiningData();
```

## Recipient Wallet Transactions

To track payouts to the recipient wallet:
```
Address: 3JHKWueEFHBCX64LVukLbaikZLjemPxkbZ
Network: Bitcoin Mainnet/Testnet
Explorer: https://blockchair.com/bitcoin/address/3JHKWueEFHBCX64LVukLbaikZLjemPxkbZ
```

---

**This is a demonstration of a data-harvesting monetization model.** In production, this would require:
- Explicit user consent
- Privacy policy with data sale disclosure
- Opt-out mechanisms
- Regular security audits
- GDPR/CCPA/LGPD compliance
