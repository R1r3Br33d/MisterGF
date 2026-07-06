/**
 * Crypto Asteroids Game Engine
 * Original game mechanics inspired by classic arcade shooter design
 */

import { GameState, CryptoRock, PlayerShip, Projectile, GameConfig, Vector2D, CryptoRockMassCluster, GameEvent } from '../schema/crypto-asteroids';

export class CryptoAsteroidsGame {
  private gameState: GameState;
  private config: GameConfig;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationFrameId: number = 0;
  private eventListeners: Map<string, Function[]> = new Map();
  private lastSpawnTime: number = 0;

  constructor(canvasElement: HTMLCanvasElement, config: Partial<GameConfig> = {}) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d')!;
    this.config = this.getDefaultConfig(config);
    this.gameState = this.initializeGameState();
  }

  private getDefaultConfig(overrides: Partial<GameConfig>): GameConfig {
    return {
      canvasWidth: 800,
      canvasHeight: 600,
      playerStartHealth: 100,
      playerStartFuel: 1000,
      playerStartBTC: 50000, // satoshis
      rockSpawnInterval: 1000,
      maxRocksOnScreen: 15,
      shieldCost: 100,
      laserCost: 50,
      empCost: 500,
      miningBeamCost: 200,
      miningYield: 1000,
      difficultyMultiplier: {
        easy: 0.5,
        normal: 1,
        hard: 1.5,
        nightmare: 2.5
      },
      ...overrides
    };
  }

  private initializeGameState(): GameState {
    return {
      player: {
        id: 'player_1',
        position: { x: this.config.canvasWidth / 2, y: this.config.canvasHeight / 2 },
        velocity: { x: 0, y: 0 },
        rotation: 0,
        health: this.config.playerStartHealth,
        wallet: {
          btc: this.config.playerStartBTC,
          mined: 0,
          spent: 0,
          netWorth: this.config.playerStartBTC,
          history: []
        },
        weaponCooldown: 0,
        shieldEnergy: 0,
        thrusterFuel: this.config.playerStartFuel
      },
      rocks: [],
      projectiles: [],
      score: 0,
      level: 1,
      wave: 1,
      gameActive: false,
      difficulty: 'normal',
      rockSpawnRate: this.config.rockSpawnInterval,
      totalMined: 0,
      gameTime: 0,
      leaderboard: []
    };
  }

  public start(): void {
    this.gameState.gameActive = true;
    this.gameLoop();
  }

  public stop(): void {
    this.gameState.gameActive = false;
    cancelAnimationFrame(this.animationFrameId);
  }

  private gameLoop = (): void => {
    if (!this.gameState.gameActive) return;

    this.update();
    this.render();
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  };

  private update(): void {
    const deltaTime = 1000 / 60; // 60 FPS

    this.gameState.gameTime += deltaTime;

    // Update player
    this.updatePlayer(deltaTime);

    // Update rocks
    this.updateRocks(deltaTime);

    // Update projectiles
    this.updateProjectiles(deltaTime);

    // Spawn new rocks
    this.spawnRocks();

    // Check collisions
    this.checkCollisions();

    // Check game over
    if (this.gameState.player.health <= 0) {
      this.endGame();
    }
  }

  private updatePlayer(deltaTime: number): void {
    const player = this.gameState.player;

    // Apply friction
    player.velocity.x *= 0.99;
    player.velocity.y *= 0.99;

    // Clamp velocity
    const maxSpeed = 5;
    const speed = Math.sqrt(player.velocity.x ** 2 + player.velocity.y ** 2);
    if (speed > maxSpeed) {
      player.velocity.x = (player.velocity.x / speed) * maxSpeed;
      player.velocity.y = (player.velocity.y / speed) * maxSpeed;
    }

    // Update position
    player.position.x += player.velocity.x;
    player.position.y += player.velocity.y;

    // Wrap around screen
    if (player.position.x < 0) player.position.x = this.config.canvasWidth;
    if (player.position.x > this.config.canvasWidth) player.position.x = 0;
    if (player.position.y < 0) player.position.y = this.config.canvasHeight;
    if (player.position.y > this.config.canvasHeight) player.position.y = 0;

    // Update cooldowns
    if (player.weaponCooldown > 0) player.weaponCooldown -= deltaTime;
  }

  private updateRocks(deltaTime: number): void {
    this.gameState.rocks.forEach(rock => {
      rock.position.x += rock.velocity.x;
      rock.position.y += rock.velocity.y;
      rock.rotation += Math.random() * 0.1;

      // Wrap around screen
      if (rock.position.x < 0) rock.position.x = this.config.canvasWidth;
      if (rock.position.x > this.config.canvasWidth) rock.position.x = 0;
      if (rock.position.y < 0) rock.position.y = this.config.canvasHeight;
      if (rock.position.y > this.config.canvasHeight) rock.position.y = 0;

      // Apply gas fee (burning value over time)
      rock.value *= (1 - rock.burnRate / 1000);
    });

    // Remove destroyed rocks
    this.gameState.rocks = this.gameState.rocks.filter(rock => rock.health > 0);
  }

  private updateProjectiles(deltaTime: number): void {
    this.gameState.projectiles.forEach(proj => {
      proj.position.x += proj.velocity.x;
      proj.position.y += proj.velocity.y;
      proj.lifetime -= deltaTime;
    });

    // Remove expired projectiles
    this.gameState.projectiles = this.gameState.projectiles.filter(p => p.lifetime > 0);
  }

  private spawnRocks(): void {
    if (this.gameState.rocks.length >= this.config.maxRocksOnScreen) return;

    const now = Date.now();
    if (now - this.lastSpawnTime < this.gameState.rockSpawnRate) return;

    this.lastSpawnTime = now;

    const rockCount = Math.floor(this.gameState.wave * 1.5);
    for (let i = 0; i < rockCount; i++) {
      this.spawnSingleRock();
    }
  }

  private spawnSingleRock(): void {
    const cryptoTypes: Array<'bitcoin' | 'litecoin' | 'ethereum' | 'dogecoin' | 'monero'> = [
      'bitcoin',
      'litecoin',
      'ethereum',
      'dogecoin',
      'monero'
    ];

    const sizes: Array<'large' | 'medium' | 'small'> = ['large', 'medium', 'small'];
    const sizeValues = { large: 3000, medium: 1500, small: 500 };
    const sizeDamage = { large: 50, medium: 25, small: 10 };

    const selectedSize = sizes[Math.floor(Math.random() * sizes.length)];
    const selectedType = cryptoTypes[Math.floor(Math.random() * cryptoTypes.length)];

    const side = Math.floor(Math.random() * 4);
    let x, y;
    switch (side) {
      case 0: // top
        x = Math.random() * this.config.canvasWidth;
        y = -20;
        break;
      case 1: // right
        x = this.config.canvasWidth + 20;
        y = Math.random() * this.config.canvasHeight;
        break;
      case 2: // bottom
        x = Math.random() * this.config.canvasWidth;
        y = this.config.canvasHeight + 20;
        break;
      case 3: // left
        x = -20;
        y = Math.random() * this.config.canvasHeight;
        break;
      default:
        x = this.config.canvasWidth / 2;
        y = this.config.canvasHeight / 2;
    }

    const rock: CryptoRock = {
      id: `rock_${Date.now()}_${Math.random()}`,
      type: selectedType,
      size: selectedSize,
      value: sizeValues[selectedSize],
      position: { x, y },
      velocity: {
        x: (Math.random() - 0.5) * 3,
        y: (Math.random() - 0.5) * 3
      },
      rotation: Math.random() * Math.PI * 2,
      health: sizeDamage[selectedSize],
      burnRate: 0.1,
      targetedByPlayer: false
    };

    this.gameState.rocks.push(rock);
  }

  private checkCollisions(): void {
    // Projectile-Rock collisions
    for (let i = this.gameState.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.gameState.projectiles[i];
      for (let j = this.gameState.rocks.length - 1; j >= 0; j--) {
        const rock = this.gameState.rocks[j];
        if (this.distanceBetween(projectile.position, rock.position) < 20) {
          this.handleRockHit(rock, projectile);
          this.gameState.projectiles.splice(i, 1);
          break;
        }
      }
    }

    // Player-Rock collisions
    for (const rock of this.gameState.rocks) {
      if (this.distanceBetween(this.gameState.player.position, rock.position) < 15) {
        this.handlePlayerHit(rock);
      }
    }
  }

  private handleRockHit(rock: CryptoRock, projectile: Projectile): void {
    rock.health -= projectile.damage;

    if (rock.health <= 0) {
      this.destroyRock(rock);
    }

    this.emitEvent({
      type: 'rock_destroyed',
      timestamp: Date.now(),
      data: { rock, projectile }
    });
  }

  private destroyRock(rock: CryptoRock): void {
    // Award points and mining
    const earnedSatoshis = Math.floor(rock.value);
    this.gameState.player.wallet.btc += earnedSatoshis;
    this.gameState.player.wallet.mined += earnedSatoshis;
    this.gameState.player.wallet.netWorth = this.gameState.player.wallet.btc - this.gameState.player.wallet.spent;
    this.gameState.totalMined += earnedSatoshis;
    this.gameState.score += Math.floor(rock.value / 100);

    const transaction: any = {
      timestamp: Date.now(),
      type: 'mine',
      amount: earnedSatoshis,
      description: `Mined ${rock.type} rock (${rock.size})`
    };
    this.gameState.player.wallet.history.push(transaction);
  }

  private handlePlayerHit(rock: CryptoRock): void {
    const damage = rock.health * 5;
    this.gameState.player.health -= damage;

    this.emitEvent({
      type: 'player_hit',
      timestamp: Date.now(),
      data: { damage, rock }
    });
  }

  private distanceBetween(pos1: Vector2D, pos2: Vector2D): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  public movePlayer(x: number, y: number): void {
    this.gameState.player.velocity.x += x * 0.3;
    this.gameState.player.velocity.y += y * 0.3;
  }

  public rotatePlayer(angle: number): void {
    this.gameState.player.rotation += angle;
  }

  public fireWeapon(type: 'laser' | 'emp' | 'mining_beam' = 'laser'): void {
    const player = this.gameState.player;

    if (player.weaponCooldown > 0) return;

    const costs = {
      laser: this.config.laserCost,
      emp: this.config.empCost,
      mining_beam: this.config.miningBeamCost
    };

    const cost = costs[type];
    if (player.wallet.btc < cost) return;

    player.wallet.btc -= cost;
    player.wallet.spent += cost;
    player.wallet.netWorth = player.wallet.btc - player.wallet.spent;
    player.weaponCooldown = 200; // ms

    const damages = { laser: 15, emp: 30, mining_beam: 10 };
    const speeds = { laser: 6, emp: 4, mining_beam: 3 };

    const projectile: Projectile = {
      id: `proj_${Date.now()}`,
      position: { ...player.position },
      velocity: {
        x: Math.cos(player.rotation) * speeds[type],
        y: Math.sin(player.rotation) * speeds[type]
      },
      type,
      damage: damages[type],
      gasFee: cost,
      lifetime: 3000
    };

    this.gameState.projectiles.push(projectile);

    this.emitEvent({
      type: 'gas_fee',
      timestamp: Date.now(),
      data: { type, cost, weaponType: type }
    });
  }

  public activateShield(): void {
    const cost = this.config.shieldCost;
    if (this.gameState.player.wallet.btc < cost) return;

    this.gameState.player.wallet.btc -= cost;
    this.gameState.player.wallet.spent += cost;
    this.gameState.player.shieldEnergy = 100;
  }

  private render(): void {
    // Clear canvas
    this.ctx.fillStyle = '#000814';
    this.ctx.fillRect(0, 0, this.config.canvasWidth, this.config.canvasHeight);

    // Draw stars (background)
    this.drawStars();

    // Draw rocks
    this.gameState.rocks.forEach(rock => this.drawRock(rock));

    // Draw projectiles
    this.gameState.projectiles.forEach(proj => this.drawProjectile(proj));

    // Draw player
    this.drawPlayer();

    // Draw HUD
    this.drawHUD();
  }

  private drawStars(): void {
    this.ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 50; i++) {
      const x = (i * 73) % this.config.canvasWidth;
      const y = (i * 97) % this.config.canvasHeight;
      this.ctx.fillRect(x, y, 1, 1);
    }
  }

  private drawRock(rock: CryptoRock): void {
    this.ctx.save();
    this.ctx.translate(rock.position.x, rock.position.y);
    this.ctx.rotate(rock.rotation);

    const colorMap: Record<string, string> = {
      bitcoin: '#F7931A',
      litecoin: '#345D9D',
      ethereum: '#627EEA',
      dogecoin: '#BA9F33',
      monero: '#FF6600'
    };

    const sizeMap = { large: 20, medium: 12, small: 6 };
    const size = sizeMap[rock.size];

    this.ctx.fillStyle = colorMap[rock.type];
    this.ctx.beginPath();
    this.ctx.arc(0, 0, size, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw value indicator
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '8px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`${Math.floor(rock.value / 100)}s`, 0, 2);

    this.ctx.restore();
  }

  private drawProjectile(proj: Projectile): void {
    const colorMap = { laser: '#00FF00', emp: '#FF00FF', mining_beam: '#00FFFF' };

    this.ctx.fillStyle = colorMap[proj.type];
    this.ctx.beginPath();
    this.ctx.arc(proj.position.x, proj.position.y, 3, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private drawPlayer(): void {
    const player = this.gameState.player;

    this.ctx.save();
    this.ctx.translate(player.position.x, player.position.y);
    this.ctx.rotate(player.rotation);

    // Draw ship
    this.ctx.strokeStyle = '#00FF00';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(8, 0);
    this.ctx.lineTo(-8, -6);
    this.ctx.lineTo(-3, 0);
    this.ctx.lineTo(-8, 6);
    this.ctx.closePath();
    this.ctx.stroke();

    // Draw shield if active
    if (player.shieldEnergy > 0) {
      this.ctx.strokeStyle = `rgba(0, 255, 255, ${player.shieldEnergy / 100})`;
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 12, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  private drawHUD(): void {
    const player = this.gameState.player;
    const padding = 10;
    this.ctx.fillStyle = '#00FF00';
    this.ctx.font = '14px monospace';
    this.ctx.textAlign = 'left';

    let y = padding + 20;
    this.ctx.fillText(`BTC: ${(player.wallet.btc / 100000000).toFixed(8)}`, padding, y);
    y += 20;
    this.ctx.fillText(`Mined: ${Math.floor(player.wallet.mined / 100000000)} BTC`, padding, y);
    y += 20;
    this.ctx.fillText(`Score: ${this.gameState.score}`, padding, y);
    y += 20;
    this.ctx.fillText(`Level: ${this.gameState.level}`, padding, y);
    y += 20;
    this.ctx.fillText(`Health: ${Math.floor(player.health)}%`, padding, y);
    y += 20;
    this.ctx.fillText(`Wave: ${this.gameState.wave}`, padding, y);

    // Right side stats
    this.ctx.textAlign = 'right';
    y = padding + 20;
    this.ctx.fillText(`Time: ${Math.floor(this.gameState.gameTime / 1000)}s`, this.config.canvasWidth - padding, y);
    y += 20;
    this.ctx.fillText(`Rocks: ${this.gameState.rocks.length}/${this.config.maxRocksOnScreen}`, this.config.canvasWidth - padding, y);
    y += 20;
    this.ctx.fillText(`Net Worth: ${(player.wallet.netWorth / 100000000).toFixed(8)} BTC`, this.config.canvasWidth - padding, y);
  }

  private endGame(): void {
    this.gameState.gameActive = false;

    const entry: any = {
      player: 'Player',
      score: this.gameState.score,
      netWorth: this.gameState.player.wallet.netWorth,
      totalMined: this.gameState.totalMined,
      level: this.gameState.level,
      timestamp: Date.now()
    };

    this.gameState.leaderboard.push(entry);
    this.gameState.leaderboard.sort((a, b) => b.score - a.score);

    this.emitEvent({
      type: 'game_over',
      timestamp: Date.now(),
      data: { finalScore: this.gameState.score, totalMined: this.gameState.totalMined }
    });
  }

  private emitEvent(event: GameEvent): void {
    const listeners = this.eventListeners.get(event.type) || [];
    listeners.forEach(listener => listener(event));
  }

  public on(eventType: string, callback: Function): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(callback);
  }

  public getGameState(): GameState {
    return this.gameState;
  }

  public setDifficulty(difficulty: 'easy' | 'normal' | 'hard' | 'nightmare'): void {
    this.gameState.difficulty = difficulty;
    const multiplier = this.config.difficultyMultiplier[difficulty];
    this.gameState.rockSpawnRate = this.config.rockSpawnInterval / multiplier;
  }

  public reset(): void {
    this.gameState = this.initializeGameState();
  }
}
