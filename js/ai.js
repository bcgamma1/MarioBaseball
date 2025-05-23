// AI Controller for computer players
class AIController {
    constructor(difficulty) {
        this.difficulty = difficulty;
        this.fielders = [];
        this.reactionTime = this.getReactionTime();
        this.accuracy = this.getAccuracy();
    }
    
    getReactionTime() {
        switch (this.difficulty) {
            case 'rookie': return 0.5;
            case 'pro': return 0.3;
            case 'allstar': return 0.1;
            default: return 0.3;
        }
    }
    
    getAccuracy() {
        switch (this.difficulty) {
            case 'rookie': return 0.6;
            case 'pro': return 0.8;
            case 'allstar': return 0.95;
            default: return 0.8;
        }
    }
    
    setDifficulty(difficulty) {
        this.difficulty = difficulty;
        this.reactionTime = this.getReactionTime();
        this.accuracy = this.getAccuracy();
    }
    
    setupFielders(characters) {
        // Standard fielding positions
        const positions = [
            { x: 600, y: 420, name: '1B' },  // First base
            { x: 500, y: 350, name: '2B' },  // Second base
            { x: 400, y: 420, name: '3B' },  // Third base
            { x: 450, y: 380, name: 'SS' },  // Shortstop
            { x: 300, y: 200, name: 'LF' },  // Left field
            { x: 500, y: 150, name: 'CF' },  // Center field
            { x: 700, y: 200, name: 'RF' },  // Right field
            { x: 500, y: 480, name: 'C' }    // Catcher
        ];
        
        this.fielders = positions.map((pos, i) => ({
            ...pos,
            character: characters[i % characters.length],
            target: null,
            state: 'idle'
        }));
    }
    
    update(game) {
        if (!game.ball) return;
        
        // Update each fielder
        this.fielders.forEach(fielder => {
            this.updateFielder(fielder, game);
        });
        
        // AI pitching decisions
        if (game.state === 'playing' && !game.ball && Math.random() < 0.02) {
            this.decidePitch(game);
        }
    }
    
    updateFielder(fielder, game) {
        if (!game.ball || fielder.state === 'throwing') return;
        
        // Predict where ball will land
        const prediction = game.physics.calculateTrajectory(
            { x: game.ball.x, y: game.ball.y, z: game.ball.z },
            { x: game.ball.vx, y: game.ball.vy, z: game.ball.vz },
            2.0 // Look 2 seconds ahead
        );
        
        // Move towards predicted position
        const dx = prediction.x - fielder.x;
        const dy = prediction.y - fielder.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 5) {
            const speed = fielder.character.speed * 30; // pixels per second
            fielder.x += (dx / distance) * speed * game.deltaTime;
            fielder.y += (dy / distance) * speed * game.deltaTime;
            fielder.state = 'running';
        } else {
            fielder.state = 'ready';
        }
        
        // Check if can catch
        if (distance < 30 && game.ball.z < 50) {
            if (Math.random() < this.accuracy) {
                game.ballCaught();
            }
        }
    }
    
    decidePitch(game) {
        // AI pitching strategy based on count
        const aggressive = game.balls > game.strikes;
        
        if (aggressive) {
            // Throw strikes
            game.pitch();
        } else {
            // Mix it up
            if (Math.random() < 0.7) {
                game.pitch();
            }
        }
    }
    
    getNearestFielder(x, y) {
        let nearest = this.fielders[0];
        let minDistance = Infinity;
        
        this.fielders.forEach(fielder => {
            const distance = Math.sqrt(
                Math.pow(fielder.x - x, 2) + 
                Math.pow(fielder.y - y, 2)
            );
            
            if (distance < minDistance) {
                minDistance = distance;
                nearest = fielder;
            }
        });
        
        return nearest;
    }
    
    shouldSwing(ball, strikeZone, batter) {
        // AI batting decision
        const inZone = this.isBallInStrikeZone(ball, strikeZone);
        const swingChance = inZone ? this.accuracy : (1 - this.accuracy) * 0.3;
        
        return Math.random() < swingChance;
    }
    
    isBallInStrikeZone(ball, zone) {
        return ball.x >= zone.x && ball.x <= zone.x + zone.width &&
               ball.y >= zone.y && ball.y <= zone.y + zone.height &&
               ball.z < 20;
    }
    
    calculateSwingTiming(ball, batter) {
        // Calculate optimal swing timing
        const distanceToPlate = Math.abs(ball.y - 480);
        const timeToPlate = distanceToPlate / Math.abs(ball.vy);
        
        // Add some error based on difficulty
        const error = (Math.random() - 0.5) * (1 - this.accuracy) * 0.5;
        
        return timeToPlate + error;
    }
}
