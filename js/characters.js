#### **js/characters.js**
```javascript
// Character System and Roster
class CharacterSystem {
    constructor() {
        this.roster = this.createRoster();
    }
    
    createRoster() {
        return [
            {
                name: 'Thunder',
                type: 'power',
                color: '#ff6b6b',
                power: 10,
                speed: 3,
                fielding: 5,
                pitching: 6,
                specialMove: 'PowerSlam',
                specialDescription: 'Guaranteed home run on contact',
                specialCooldown: 0,
                pitchTypes: [
                    { name: 'fastball', speed: 8, curve: 1, spin: 2 },
                    { name: 'curveball', speed: 5, curve: 5, spin: 4 },
                    { name: 'slider', speed: 6, curve: 3, spin: 3 },
                    { name: 'knuckleball', speed: 4, curve: 8, spin: 1 }
                ]
            },
            {
                name: 'Lightning',
                type: 'speed',
                color: '#4ecdc4',
                power: 4,
                speed: 10,
                fielding: 8,
                pitching: 5,
                specialMove: 'SpeedDash',
                specialDescription: 'Steal any base automatically',
                specialCooldown: 0,
                pitchTypes: [
                    { name: 'fastball', speed: 9, curve: 1, spin: 3 },
                    { name: 'curveball', speed: 6, curve: 4, spin: 5 },
                    { name: 'slider', speed: 7, curve: 2, spin: 4 },
                    { name: 'knuckleball', speed: 5, curve: 6, spin: 2 }
                ]
            },
            {
                name: 'Ace',
                type: 'pitcher',
                color: '#f9ca24',
                power: 5,
                speed: 5,
                fielding: 7,
                pitching: 10,
                specialMove: 'FireballPitch',
                specialDescription: 'Unhittable blazing fastball',
                specialCooldown: 0,
                pitchTypes: [
                    { name: 'fastball', speed: 10, curve: 2, spin: 5 },
                    { name: 'curveball', speed: 7, curve: 8, spin: 6 },
                    { name: 'slider', speed: 8, curve: 5, spin: 5 },
                    { name: 'knuckleball', speed: 6, curve: 10, spin: 3 }
                ]
            },
            {
                name: 'Dynamo',
                type: 'balanced',
                color: '#a55eea',
                power: 7,
                speed: 7,
                fielding: 7,
                pitching: 7,
                specialMove: 'PerfectForm',
                specialDescription: 'All stats boosted to 10 for one play',
                specialCooldown: 0,
                pitchTypes: [
                    { name: 'fastball', speed: 7, curve: 3, spin: 4 },
                    { name: 'curveball', speed: 6, curve: 6, spin: 5 },
                    { name: 'slider', speed: 7, curve: 4, spin: 4 },
                    { name: 'knuckleball', speed: 5, curve: 7, spin: 3 }
                ]
            },
            {
                name: 'Tank',
                type: 'power',
                color: '#45aaf2',
                power: 9,
                speed: 2,
                fielding: 4,
                pitching: 6,
                specialMove: 'MegaSlam',
                specialDescription: 'Ball breaks through any obstacle',
                specialCooldown: 0,
                pitchTypes: [
                    { name: 'fastball', speed: 6, curve: 2, spin: 3 },
                    { name: 'curveball', speed: 4, curve: 6, spin: 4 },
                    { name: 'slider', speed: 5, curve: 4, spin: 3 },
                    { name: 'knuckleball', speed: 3, curve: 8, spin: 2 }
                ]
            },
            {
                name: 'Shadow',
                type: 'fielder',
                color: '#2d3436',
                power: 5,
                speed: 8,
                fielding: 10,
                pitching: 5,
                specialMove: 'TeleportCatch',
                specialDescription: 'Instantly teleport to catch any ball',
                specialCooldown: 0,
                pitchTypes: [
                    { name: 'fastball', speed: 7, curve: 2, spin: 3 },
                    { name: 'curveball', speed: 5, curve: 7, spin: 5 },
                    { name: 'slider', speed: 6, curve: 5, spin: 4 },
                    { name: 'knuckleball', speed: 4, curve: 9, spin: 2 }
                ]
            },
            {
                name: 'Blaze',
                type: 'power',
                color: '#ff7979',
                power: 8,
                speed: 6,
                fielding: 5,
                pitching: 6,
                specialMove: 'FlamingBat',
                specialDescription: 'Bat catches fire, +100% power',
                specialCooldown: 0,
                pitchTypes: [
                    { name: 'fastball', speed: 8, curve: 1, spin: 4 },
                    { name: 'curveball', speed: 5, curve: 5, spin: 5 },
                    { name: 'slider', speed: 6, curve: 3, spin: 4 },
                    { name: 'knuckleball', speed: 4, curve: 7, spin: 2 }
                ]
            },
            {
                name: 'Frost',
                type: 'tactical',
                color: '#74b9ff',
                power: 6,
                speed: 6,
                fielding: 8,
                pitching: 8,
                specialMove: 'IceBall',
                specialDescription: 'Freezes batter timing window',
                specialCooldown: 0,
                pitchTypes: [
                    { name: 'fastball', speed: 7, curve: 3, spin: 5 },
                    { name: 'curveball', speed: 6, curve: 7, spin: 6 },
                    { name: 'slider', speed: 7, curve: 5, spin: 5 },
                    { name: 'knuckleball', speed: 5, curve: 9, spin: 3 }
                ]
            }
        ];
    }
    
    activateSpecialMove(character, game) {
        if (character.specialCooldown > 0) return false;
        
        character.specialCooldown = 10; // 10 second cooldown
        
        switch (character.specialMove) {
            case 'PowerSlam':
                character.tempPower = character.power;
                character.power = 15;
                setTimeout(() => character.power = character.tempPower, 3000);
                break;
                
            case 'SpeedDash':
                if (game.bases.some(b => b)) {
                    // Advance all runners
                    game.advanceRunner();
                }
                break;
                
            case 'FireballPitch':
                if (game.ball) {
                    game.ball.speed *= 2;
                    game.createFireParticles(game.ball.x, game.ball.y);
                }
                break;
                
            case 'PerfectForm':
                const stats = ['power', 'speed', 'fielding', 'pitching'];
                const original = {};
                stats.forEach(stat => {
                    original[stat] = character[stat];
                    character[stat] = 10;
                });
                setTimeout(() => {
                    stats.forEach(stat => character[stat] = original[stat]);
                }, 5000);
                break;
                
            case 'TeleportCatch':
                // Handled in fielding logic
                character.canTeleport = true;
                setTimeout(() => character.canTeleport = false, 3000);
                break;
                
            default:
                break;
        }
        
        return true;
    }
}
