# Crypto Asteroids: Bitcoin Mining Game

A fast-paced arcade action game that combines classic asteroid shooter mechanics with cryptocurrency mining elements. Mine Bitcoin, destroy crypto-themed asteroids, and build your wealth across multiple difficulty levels.

## 🎮 Game Mechanics

### Core Gameplay
- **Player Control**: Navigate a spaceship through asteroid fields
- **Mining**: Destroy cryptocurrency-themed rocks to earn satoshis
- **Weapons System**: Three weapon types with different costs and effects
- **Shield System**: Protect your ship from impacts
- **Progressive Difficulty**: Waves get harder as your score increases

### Cryptocurrency Types
Each asteroid type represents a different cryptocurrency:
- **Bitcoin (₿)** - Orange, high value
- **Litecoin** - Blue, medium-high value
- **Ethereum (Ξ)** - Purple, medium value
- **Dogecoin (Ð)** - Gold, medium-low value
- **Monero** - Red-orange, low value

### Weapon Systems

#### Laser
- **Cost**: 50 satoshis per shot
- **Damage**: 15 HP
- **Speed**: Fast
- **Best for**: Small rocks

#### EMP (Electromagnetic Pulse)
- **Cost**: 500 satoshis per shot
- **Damage**: 30 HP
- **Speed**: Medium
- **Best for**: Medium-large rocks

#### Mining Beam
- **Cost**: 200 satoshis per shot
- **Damage**: 10 HP
- **Speed**: Slow
- **Best for**: Precision mining

#### Shield
- **Cost**: 100 satoshis per activation
- **Duration**: 5 seconds
- **Effect**: Reduces damage taken

## ⌨️ Controls

### Keyboard
- **Arrow Keys** - Move up/down/left/right
- **W/A/S/D** - Alternative movement
- **Z** - Fire Laser
- **X** - Fire EMP
- **C** - Fire Mining Beam
- **Space** - Activate Shield
- **P** - Pause/Resume

### Mouse/Touch
- **Buttons** - Use on-screen controls

## 📊 Economy System

### Starting Resources
- **Balance**: 50,000 satoshis (0.0005 BTC)
- **Fuel**: 1,000 units

### Revenue
- Small rock: 500 satoshis
- Medium rock: 1,500 satoshis
- Large rock: 3,000 satoshis

### Costs
- Laser shot: 50 satoshis
- EMP shot: 500 satoshis
- Mining beam: 200 satoshis
- Shield activation: 100 satoshis

### Net Worth
Calculated as: `Balance - Total Spent`

Your net worth is affected by:
- Mining gains (increases balance)
- Weapon/shield costs (increases spent)
- Gas fees (dynamically applied)

## 🎯 Difficulty Levels

### Easy (0.5x)
- Slower spawn rates
- Fewer simultaneous rocks
- More time between waves
- **Perfect for**: Learning mechanics

### Normal (1.0x)
- Balanced gameplay
- Standard progression
- **Perfect for**: Regular play

### Hard (1.5x)
- Faster spawn rates
- More aggressive waves
- Higher rock density
- **Perfect for**: Experienced players

### Nightmare (2.5x)
- Extreme difficulty
- Rock swarms
- Rapid progression
- **Perfect for**: Hardcore challenges

## 📈 Progression

### Scoring System
- Each rock destroyed grants points
- Points = (Rock Value in satoshis) / 100
- Larger rocks = More points
- Higher difficulty = Better rewards

### Wave System
- Wave increases every 30 seconds
- Each wave spawns more rocks
- Difficulty multiplier applies to spawn rate

### Levels
- Advance levels by accumulating score
- Higher levels = Better rewards
- Level affects spawn patterns

## 💾 Game State

### Wallet Tracking
Your wallet maintains:
- **BTC**: Current satoshi balance
- **Mined**: Total satoshis ever mined
- **Spent**: Total satoshis spent on weapons/shields
- **Net Worth**: BTC - Spent
- **History**: Complete transaction log

### Leaderboard
Top scores saved with:
- Player name
- Final score
- Net worth achieved
- Total mined
- Level reached
- Timestamp

## 🎨 Visual Elements

### Color Scheme
- **Background**: Deep space black (#000814)
- **Primary**: Neon green (#00FF00)
- **Bitcoin**: Orange (#F7931A)
- **Litecoin**: Blue (#345D9D)
- **Ethereum**: Purple (#627EEA)
- **Dogecoin**: Gold (#BA9F33)
- **Monero**: Red-orange (#FF6600)

### Effects
- Star field background
- Screen wrap (objects exit one side, reenter another)
- Shield glow when active
- Weapon hit feedback
- HUD overlay with real-time stats

## 🔧 Technical Details

### Architecture
- Built with vanilla TypeScript
- Canvas-based rendering (2D)
- 60 FPS gameplay
- Event-driven system
- No external dependencies

### Performance
- Optimized collision detection
- Efficient particle culling
- Smooth animations
- Low CPU overhead

## 📝 Game Events

The game emits various events you can listen to:

```typescript
game.on('rock_destroyed', (event) => {...});
game.on('player_hit', (event) => {...});
game.on('mining_success', (event) => {...});
game.on('gas_fee', (event) => {...});
game.on('wallet_update', (event) => {...});
game.on('level_up', (event) => {...});
game.on('game_over', (event) => {...});
```

## 🎓 Tips & Strategies

1. **Resource Management**: Plan your shots - each costs satoshis
2. **Positioning**: Use screen wrap to escape dangerous situations
3. **Weapon Choice**: Mix weapons for different rock sizes
4. **Shield Timing**: Use shields when health is critical
5. **Wave Preparation**: Build resources between waves
6. **Difficulty Scaling**: Start easy, progress to harder difficulties

## 🐛 Known Limitations

- Single player only (for now)
- No multiplayer support
- No persistent cloud storage
- Leaderboard stored locally
- No sound effects
- No music (add your own!)

## 🚀 Future Features

- [ ] Multiplayer support
- [ ] Power-ups and special abilities
- [ ] Sound effects and music
- [ ] Achievements system
- [ ] Cloud leaderboards
- [ ] Mobile optimization
- [ ] Advanced shader effects
- [ ] Blockchain integration for real rewards

## 📄 License

MIT - Feel free to modify and redistribute

---

**Ready to mine? Start playing and build your fortune!**
