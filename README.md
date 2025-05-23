# Arcade Baseball Championship 🏟️⚾

An exciting arcade-style baseball game inspired by Mario Superstar Baseball, featuring colorful characters, special moves, and power-ups!

## 🎮 Game Features

### Gameplay Modes
- **Exhibition Match**: Quick 3-inning game against AI
- **Tournament Mode**: Face 4 teams of increasing difficulty
- **Home Run Derby**: Hit as many home runs as possible in 10 pitches

### Character System
- 8 unique characters with different stats (Power, Speed, Fielding, Pitching)
- Character archetypes: Power Hitters, Speedsters, Ace Pitchers, All-Rounders
- Special moves for each character with cooldowns
- Team formation: Pick 4 characters for your lineup

### Game Mechanics
- **Pitching**: 4 pitch types with different trajectories
- **Batting**: Timing-based system with power charging
- **Fielding**: Automatic movement with manual override
- **Base Running**: Automatic with steal attempts
- **Power-Ups**: Spawn every 30 seconds for game-changing effects

### Special Moves
- Power Slam (guaranteed home run)
- Speed Dash (automatic base steal)
- Fireball Pitch (unhittable fastball)
- Teleport Catch (instant fielding)
- And more!

## 🚀 Deployment Instructions

### Deploy to Vercel

1. Fork or clone this repository
2. Install Vercel CLI: `npm i -g vercel`
3. Run `vercel` in the project directory
4. Follow the prompts to deploy

### Manual Deployment

1. Upload all files to your web server
2. Ensure the file structure is maintained
3. Access `index.html` through your browser

## 🎯 Controls

### Pitching
- **WASD**: Aim pitch
- **Spacebar**: Throw
- **1-4 Keys**: Select pitch type

### Batting
- **Left/Right Arrows**: Aim swing
- **Spacebar**: Swing (hold for power)

### Fielding
- **Mouse**: Select fielder
- **Click**: Dive/Jump
- **Number Keys (1-3)**: Throw to bases

### Base Running
- **Spacebar**: Attempt steal
- **Arrow Keys**: Take leads

## 🛠️ Technical Details

- **Language**: JavaScript (ES6+)
- **Graphics**: Canvas API
- **Physics**: Custom physics engine
- **AI**: Adaptive difficulty system
- **Performance**: Optimized for 60fps

## 📈 Performance Optimization

- Efficient collision detection using spatial partitioning
- Object pooling for particles and effects
- Optimized rendering with dirty rectangles
- Minimal DOM manipulation during gameplay

## 🎨 Customization

### Adding Characters
Edit `js/characters.js` to add new characters:
```javascript
{
    name: 'NewHero',
    type: 'balanced',
    color: '#hexcolor',
    power: 7,
    speed: 7,
    fielding: 7,
    pitching: 7,
    specialMove: 'UniquePower',
    specialDescription: 'Description here'
}
