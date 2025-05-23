// Physics Engine for realistic ball movement
class PhysicsEngine {
    constructor() {
        this.gravity = 980; // pixels/s²
        this.airResistance = 0.98;
        this.windSpeed = { x: 0, y: 0 };
        this.spinEffect = 0.1;
    }
    
    updateBall(ball, deltaTime) {
        // Apply physics
        ball.vz -= this.gravity * deltaTime;
        
        // Air resistance
        ball.vx *= Math.pow(this.airResistance, deltaTime);
        ball.vy *= Math.pow(this.airResistance, deltaTime);
        ball.vz *= Math.pow(this.airResistance, deltaTime);
        
        // Wind effect
        ball.vx += this.windSpeed.x * deltaTime;
        ball.vy += this.windSpeed.y * deltaTime;
        
        // Spin effect (Magnus force)
        if (ball.spin) {
            ball.vx += ball.spin.x * this.spinEffect * deltaTime;
            ball.vy += ball.spin.y * this.spinEffect * deltaTime;
        }
        
        // Update position
        ball.x += ball.vx * deltaTime;
        ball.y += ball.vy * deltaTime;
        ball.z += ball.vz * deltaTime;
        
        // Ensure ball doesn't go below ground
        if (ball.z < 0) {
            ball.z = 0;
            ball.vz *= -0.5; // Bounce with energy loss
        }
    }
    
    calculateTrajectory(startPos, velocity, time) {
        // Predict where ball will be after given time
        const pos = { ...startPos };
        const vel = { ...velocity };
        const dt = 0.016; // 60fps timestep
        
        for (let t = 0; t < time; t += dt) {
            vel.z -= this.gravity * dt;
            vel.x *= Math.pow(this.airResistance, dt);
            vel.y *= Math.pow(this.airResistance, dt);
            vel.z *= Math.pow(this.airResistance, dt);
            
            pos.x += vel.x * dt;
            pos.y += vel.y * dt;
            pos.z += vel.z * dt;
            
            if (pos.z <= 0) break;
        }
        
        return pos;
    }
    
    calculateHitAngle(batterPos, ballPos, swingTiming) {
        // Calculate hit direction based on timing
        const perfectTiming = 0;
        const timingDiff = swingTiming - perfectTiming;
        
        // Early swing = pull, late swing = opposite field
        const baseAngle = Math.atan2(ballPos.y - batterPos.y, ballPos.x - batterPos.x);
        const adjustedAngle = baseAngle + (timingDiff * Math.PI / 4);
        
        return adjustedAngle;
    }
    
    calculateHitPower(character, swingPower, contactQuality) {
        // Base power from character stats
        const basePower = character.power / 10;
        
        // Swing power (0-1)
        const swingMultiplier = swingPower;
        
        // Contact quality (0-1, based on sweet spot)
        const contactMultiplier = contactQuality;
        
        return basePower * swingMultiplier * contactMultiplier * 100;
    }
    
    checkCollision(obj1, obj2, radius1, radius2) {
        const distance = Math.sqrt(
            Math.pow(obj1.x - obj2.x, 2) + 
            Math.pow(obj1.y - obj2.y, 2) + 
            Math.pow(obj1.z - obj2.z, 2)
        );
        
        return distance < (radius1 + radius2);
    }
    
    applyWind(strength, direction) {
        this.windSpeed.x = Math.cos(direction) * strength;
        this.windSpeed.y = Math.sin(direction) * strength;
    }
}
