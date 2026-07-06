/**
 * Bitcoin-Infused Asteroid Game Schema
 * Integrates cryptocurrency mechanics with classic Atari gameplay
 */

export interface CryptoRock {
  id: string;
  type: 'bitcoin' | 'litecoin' | 'ethereum' | 'dogecoin' | 'monero';
  size: 'large' | 'medium' | 'small';
  value: number; // In satoshis
  position: Vector2D;
  velocity: Vector2D;
  rotation: number;
  health: number;
  burnRate: number; // Gas fees per frame
  targetedByPlayer: boolean;
}

export interface Vector2D {
  x: number;
  y: number;
}

export interface PlayerShip {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  rotation: number;
  health: number;
  wallet: Wallet;
  weaponCooldown: number;
  shieldEnergy: number;
  thrusterFuel: number;
}

export interface Wallet {
  btc: number; // Bitcoin balance in satoshis
  mined: number; // Total mined
  spent: number; // Total spent on weapons/shields
  netWorth: number; // Current net worth
  history: Transaction[];
}

export interface Transaction {
  timestamp: number;
  type: 'mine' | 'spend' | 'gasfee';
  amount: number;
  description: string;
}

export interface Projectile {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  type: 'laser' | 'emp' | 'mining_beam';
  damage: number;
  gasFee: number; // Cost per shot
  lifetime: number;
}

export interface GameState {
  player: PlayerShip;
  rocks: CryptoRock[];
  projectiles: Projectile[];
  score: number;
  level: number;
  wave: number;
  gameActive: boolean;
  difficulty: 'easy' | 'normal' | 'hard' | 'nightmare';
  rockSpawnRate: number;
  totalMined: number;
  gameTime: number;
  leaderboard: LeaderboardEntry[];
}

export interface LeaderboardEntry {
  player: string;
  score: number;
  netWorth: number;
  totalMined: number;
  level: number;
  timestamp: number;
}

export interface GameConfig {
  canvasWidth: number;
  canvasHeight: number;
  playerStartHealth: number;
  playerStartFuel: number;
  playerStartBTC: number; // In satoshis
  rockSpawnInterval: number;
  maxRocksOnScreen: number;
  shieldCost: number; // Per unit
  laserCost: number; // Per shot in satoshis
  empCost: number; // Per shot
  miningBeamCost: number; // Per shot
  miningYield: number; // Satoshis per successful mine
  difficultyMultiplier: Record<string, number>;
}

export interface CryptoRockMassCluster {
  id: string;
  rocks: CryptoRock[];
  centerOfMass: Vector2D;
  totalValue: number;
  volatility: number; // How erratically they move
  orbitalPattern: 'circular' | 'elliptical' | 'chaotic';
}

export interface GameEvent {
  type: 'rock_destroyed' | 'player_hit' | 'mining_success' | 'gas_fee' | 'wallet_update' | 'level_up' | 'game_over';
  timestamp: number;
  data: Record<string, any>;
}
