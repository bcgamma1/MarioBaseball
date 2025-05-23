// Power-up System
class PowerUpSystem {
    constructor() {
        this.activePowerUps = [];
        this.powerUpTypes = {
            superBat: {
                name: 'Super Bat',
                duration: 5,
                effect: (character) => {
                    character.tempPower = character.power;
                    character.power *= 1.5;
                },
                end: (character) => {
                    character.power = character.tempPower;
                }
            },
            lightningBall: {
                name: 'Lightning Ball',
                duration: 3,
                effect: (ball) => {
                    ball.curve *= 2;
                    ball.lightning = true;
                },
                end: (ball) => {
                    if (ball) ball.lightning = false;
                }
            },
            giantGlove: {
                name: 'Giant Glove',
                duration: 5,
                effect: (fielder) => {
                    fielder.catchRadius = 60; // Double radius
                },
                end: (fielder) => {
                    fielder.catchRadius = 30;
                }
            },
            speedBoost: {
                name: 'Speed Boost',
                duration: 4,
                effect: (character) => {
                    character.tempSpeed = character.speed;
                    character.speed *= 2;
                },
                end: (character) => {
                    character.speed = character.tempSpeed;
                }
            }
        };
    }
    
    activate(powerUp, target) {
        const type = this.powerUpTypes[powerUp.name];
        if (!type) return;
        
        const activation = {
            type: powerUp.name,
            target: target,
            timeRemaining: type.duration,
            endEffect: type.end
        };
        
        type.effect(target);
        this.activePowerUps.push(activation);
        
        // Create visual effect
        this.createActivationEffect(powerUp);
    }
    
    update(deltaTime) {
        this.activePowerUps = this.activePowerUps.filter(powerUp => {
            powerUp.timeRemaining -= deltaTime;
            
            if (powerUp.timeRemaining <= 0) {
                powerUp.endEffect(powerUp.target);
                return false;
            }
            
            return true;
        });
    }
    
    createActivationEffect(powerUp) {
        // Visual feedback when collecting power-up
        const particles = [];
        for (let i = 0; i < 20; i++) {
            const angle = (Math.PI * 2 * i) / 20;
            particles.push({
                x: powerUp.x,
                y: powerUp.y,
                vx: Math.cos(angle) * 200,
                vy: Math.sin(angle) * 200,
                life: 1,
                color: powerUp.color
            });
        }
        return particles;
    }
    
    hasActivePowerUp(character, type) {
        return this.activePowerUps.some(p => 
            p.target === character && p.type === type
        );
    }
}
