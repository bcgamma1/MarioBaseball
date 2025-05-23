// Main Game Controller
class ArcadeBaseball {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 1000;
        this.canvas.height = 600;
        
        // Game state
        this.state = 'menu'; // menu, playing, paused, gameOver
        this.mode = null; // exhibition, tournament, homeRunDerby
        this.difficulty = 'pro';
        
        // Game data
        this.inning = 1;
        this.isTopInning = true;
        this.homeScore = 0;
        this.awayScore = 0;
        this.balls = 0;
        this.strikes = 0;
        this.outs = 0;
        
        // Player data
        this.playerTeam = [];
        this.currentBatterIndex = 0;
        this.currentPitcher = null;
        
        // Game objects
        this.ball = null;
        this.bases = [false, false, false]; // 1st, 2nd, 3rd
        this.powerUps = [];
        this.particles = [];
        
        // Timing
        this.lastTime = 0;
        this.deltaTime = 0;
        this.powerUpSpawnTimer = 0;
        
        // Controls
        this.keys = {};
        this.mouse = { x: 0, y: 0, clicked: false };
        
        // Initialize subsystems
        this.characters = new CharacterSystem();
        this.physics = new PhysicsEngine();
        this.ai = new AIController(this.difficulty);
        this.powerUpSystem = new PowerUpSystem();
        this.audio = new AudioManager();
        
        this.init();
    }
    
    init() {
        // Event listeners
        document.addEventListener('keydown', (e) => this.keys[e.key] = true);
        document.addEventListener('keyup', (e) => this.keys[e.key] = false);
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });
        this.canvas.addEventListener('click', () => this.mouse.clicked = true);
        
        // Difficulty selector
        document.getElementById('difficulty').addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            this.ai.setDifficulty(this.difficulty);
        });
        
        // Start game loop
        this.gameLoop();
    }
    
    gameLoop(currentTime = 0) {
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        // Update based on game state
        if (this.state === 'playing') {
            this.update();
        }
        
        // Always render
        this.render();
        
        // Reset click state
        this.mouse.clicked = false;
        
        // Continue loop
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update() {
        // Update physics
        if (this.ball) {
            this.physics.updateBall(this.ball, this.deltaTime);
            this.checkBallCollisions();
        }
        
        // Update AI
        this.ai.update(this);
        
        // Update particles
        this.particles = this.particles.filter(p => {
            p.life -= this.deltaTime;
            p.x += p.vx * this.deltaTime;
            p.y += p.vy * this.deltaTime;
            p.vy += 500 * this.deltaTime; // gravity
            return p.life > 0;
        });
        
        // Update power-ups
        this.powerUpSpawnTimer += this.deltaTime;
        if (this.powerUpSpawnTimer >= 30) {
            this.spawnPowerUp();
            this.powerUpSpawnTimer = 0;
        }
        
        // Update special move cooldowns
        this.playerTeam.forEach(char => {
            if (char.specialCooldown > 0) {
                char.specialCooldown -= this.deltaTime;
            }
        });
        
        // Check game rules
        this.checkGameRules();
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#2d572c';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.state === 'playing') {
            this.renderField();
            this.renderCharacters();
            this.renderBall();
            this.renderPowerUps();
            this.renderParticles();
            this.renderStrikeZone();
        }
    }
    
    renderField() {
        const ctx = this.ctx;
        
        // Draw infield dirt
        ctx.fillStyle = '#8b6914';
        ctx.beginPath();
        ctx.moveTo(500, 500);
        ctx.lineTo(300, 400);
        ctx.lineTo(500, 300);
        ctx.lineTo(700, 400);
        ctx.closePath();
        ctx.fill();
        
        // Draw bases
        const basePositions = [
            { x: 700, y: 400 }, // 1st
            { x: 500, y: 300 }, // 2nd
            { x: 300, y: 400 }  // 3rd
        ];
        
        basePositions.forEach((pos, i) => {
            ctx.save();
            ctx.translate(pos.x, pos.y);
            ctx.rotate(Math.PI / 4);
            ctx.fillStyle = this.bases[i] ? '#ffa502' : '#ffffff';
            ctx.fillRect(-15, -15, 30, 30);
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.strokeRect(-15, -15, 30, 30);
            ctx.restore();
        });
        
        // Draw home plate
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(500, 500);
        ctx.lineTo(480, 480);
        ctx.lineTo(480, 460);
        ctx.lineTo(500, 440);
        ctx.lineTo(520, 460);
        ctx.lineTo(520, 480);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Draw outfield fence
        ctx.strokeStyle = '#4a4a4a';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(500, 500, 350, Math.PI, 0, true);
        ctx.stroke();
        
        // Draw foul lines
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(500, 500);
        ctx.lineTo(150, 400);
        ctx.moveTo(500, 500);
        ctx.lineTo(850, 400);
        ctx.stroke();
    }
    
    renderCharacters() {
        // Render fielders
        this.ai.fielders.forEach(fielder => {
            this.drawCharacter(fielder.x, fielder.y, fielder.character);
        });
        
        // Render batter
        if (this.currentBatter) {
            this.drawCharacter(500, 480, this.currentBatter);
        }
        
        // Render pitcher
        if (this.currentPitcher) {
            this.drawCharacter(500, 380, this.currentPitcher);
        }
        
        // Render base runners
        const runnerPositions = [
            { x: 700, y: 400 },
            { x: 500, y: 300 },
            { x: 300, y: 400 }
        ];
        
        this.bases.forEach((occupied, i) => {
            if (occupied) {
                this.drawCharacter(runnerPositions[i].x, runnerPositions[i].y, this.playerTeam[0]);
            }
        });
    }
    
    drawCharacter(x, y, character) {
        const ctx = this.ctx;
        
        // Simple character representation
        ctx.fillStyle = character.color || '#ff6b6b';
        ctx.beginPath();
        ctx.arc(x, y - 20, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // Body
        ctx.fillRect(x - 10, y - 10, 20, 25);
        
        // Legs
        ctx.fillRect(x - 10, y + 15, 8, 15);
        ctx.fillRect(x + 2, y + 15, 8, 15);
        
        // Arms
        ctx.fillRect(x - 15, y - 5, 5, 15);
        ctx.fillRect(x + 10, y - 5, 5, 15);
        
        // Character name
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(character.name, x, y + 45);
    }
    
    renderBall() {
        if (!this.ball) return;
        
        const ctx = this.ctx;
        
        // Ball shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(this.ball.x, this.ball.y + this.ball.z/10, 8, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Ball
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.ball.x, this.ball.y - this.ball.z, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Ball stitches
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.ball.x, this.ball.y - this.ball.z, 6, 0, Math.PI);
        ctx.stroke();
    }
    
    renderPowerUps() {
        this.powerUps.forEach(powerUp => {
            const ctx = this.ctx;
            
            // Glowing effect
            ctx.shadowBlur = 20;
            ctx.shadowColor = powerUp.color;
            
            // Power-up icon
            ctx.fillStyle = powerUp.color;
            ctx.beginPath();
            ctx.arc(powerUp.x, powerUp.y, 20, 0, Math.PI * 2);
            ctx.fill();
            
            // Icon symbol
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(powerUp.symbol, powerUp.x, powerUp.y);
            
            ctx.shadowBlur = 0;
        });
    }
    
    renderParticles() {
        this.particles.forEach(particle => {
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillRect(particle.x - 2, particle.y - 2, 4, 4);
        });
        this.ctx.globalAlpha = 1;
    }
    
    renderStrikeZone() {
        if (this.state === 'playing' && this.mode !== 'homeRunDerby') {
            const ctx = this.ctx;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(470, 420, 60, 80);
            ctx.setLineDash([]);
        }
    }
    
    // Game Controls
    pitch() {
        if (this.ball) return;
        
        const pitch = this.currentPitcher.pitchTypes[Math.floor(Math.random() * 4)];
        this.ball = {
            x: 500,
            y: 380,
            z: 10,
            vx: (Math.random() - 0.5) * pitch.curve * 100,
            vy: pitch.speed,
            vz: 0,
            type: pitch.name,
            spin: pitch.spin
        };
        
        this.audio.play('pitch');
    }
    
    swing() {
        if (!this.ball) return;
        
        const distance = Math.sqrt(
            Math.pow(this.ball.x - 500, 2) + 
            Math.pow(this.ball.y - 480, 2)
        );
        
        // Check if ball is in hitting range
        if (distance < 50 && this.ball.z < 20) {
            this.hitBall();
        } else {
            this.strikes++;
            this.audio.play('swingMiss');
            this.checkCount();
        }
    }
    
    hitBall() {
        const power = this.currentBatter.power;
        const angle = Math.random() * Math.PI / 2 - Math.PI / 4;
        const elevation = Math.random() * Math.PI / 4;
        
        this.ball.vx = Math.cos(angle) * power * 50;
        this.ball.vy = -Math.sin(elevation) * power * 60;
        this.ball.vz = Math.sin(elevation) * power * 40;
        
        this.audio.play('hit');
        this.createHitParticles(this.ball.x, this.ball.y);
    }
    
    createHitParticles(x, y) {
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: 500,
                y: 300,
                vx: Math.cos(angle) * 300,
                vy: Math.sin(angle) * 300,
                life: 2,
                color: `hsl(${Math.random() * 360}, 100%, 50%)`
            });
        }
    }
    
    checkCount() {
        if (this.strikes >= 3) {
            this.outs++;
            this.strikes = 0;
            this.balls = 0;
            this.audio.play('strikeout');
            this.checkOuts();
        } else if (this.balls >= 4) {
            this.advanceRunner();
            this.balls = 0;
            this.strikes = 0;
        }
        
        this.updateUI();
    }
    
    checkOuts() {
        if (this.outs >= 3) {
            this.nextHalfInning();
        }
        this.updateUI();
    }
    
    nextHalfInning() {
        this.outs = 0;
        this.bases = [false, false, false];
        
        if (this.isTopInning) {
            this.isTopInning = false;
        } else {
            this.isTopInning = true;
            this.inning++;
            
            if (this.inning > 3 && this.mode === 'exhibition') {
                this.endGame();
            } else if (this.inning > 9) {
                this.endGame();
            }
        }
        
        this.updateUI();
    }
    
    advanceRunner() {
        if (this.bases[2]) this.scoreRun();
        if (this.bases[1]) this.bases[2] = true;
        if (this.bases[0]) this.bases[1] = true;
        this.bases[0] = true;
    }
    
    scoreRun() {
        if (this.isTopInning) {
            this.awayScore++;
        } else {
            this.homeScore++;
        }
        this.audio.play('score');
        this.updateUI();
    }
    
    spawnPowerUp() {
        const types = [
            { name: 'superBat', symbol: '⚡', color: '#ffd700', effect: 'power' },
            { name: 'lightningBall', symbol: '⚡', color: '#00ffff', effect: 'curve' },
            { name: 'giantGlove', symbol: '🧤', color: '#ff69b4', effect: 'field' },
            { name: 'speedBoost', symbol: '💨', color: '#00ff00', effect: 'speed' }
        ];
        
        const type = types[Math.floor(Math.random() * types.length)];
        this.powerUps.push({
            ...type,
            x: Math.random() * 800 + 100,
            y: Math.random() * 400 + 100
        });
    }
    
    checkGameRules() {
        // Check for power-up collection
        if (this.currentBatter) {
            this.powerUps = this.powerUps.filter(powerUp => {
                const distance = Math.sqrt(
                    Math.pow(powerUp.x - 500, 2) + 
                    Math.pow(powerUp.y - 480, 2)
                );
                
                if (distance < 30) {
                    this.powerUpSystem.activate(powerUp, this.currentBatter);
                    this.audio.play('powerup');
                    return false;
                }
                return true;
            });
        }
    }
    
    updateUI() {
        document.getElementById('homeScore').textContent = this.homeScore;
        document.getElementById('awayScore').textContent = this.awayScore;
        document.getElementById('balls').textContent = this.balls;
        document.getElementById('strikes').textContent = this.strikes;
        document.getElementById('outs').textContent = this.outs;
        
        const inningText = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th'];
        document.getElementById('inningNumber').textContent = inningText[this.inning - 1] || this.inning + 'th';
        document.getElementById('inningHalf').textContent = this.isTopInning ? 'TOP' : 'BOT';
        
        // Update bases
        ['base1', 'base2', 'base3'].forEach((id, i) => {
            document.getElementById(id).classList.toggle('occupied', this.bases[i]);
        });
    }
    
    // Menu Functions
    startExhibition() {
        this.mode = 'exhibition';
        this.startGame();
    }
    
    startTournament() {
        this.mode = 'tournament';
        this.tournamentRound = 0;
        this.startGame();
    }
    
    startHomeRunDerby() {
        this.mode = 'homeRunDerby';
        this.derbyPitches = 10;
        this.derbyHomeRuns = 0;
        this.startGame();
    }
    
    showCharacterSelect() {
        document.getElementById('menuOverlay').classList.add('hidden');
        document.getElementById('characterSelect').classList.remove('hidden');
        this.populateCharacterGrid();
    }
    
    populateCharacterGrid() {
        const grid = document.getElementById('characterGrid');
        grid.innerHTML = '';
        
        this.characters.roster.forEach((char, index) => {
            const card = document.createElement('div');
            card.className = 'character-card';
            card.onclick = () => this.selectCharacter(index);
            
            card.innerHTML = `
                <div class="character-sprite" style="background: ${char.color}"></div>
                <div class="character-name">${char.name}</div>
                <div class="character-stats">
                    PWR: ${char.power} | SPD: ${char.speed}<br>
                    FLD: ${char.fielding} | PTC: ${char.pitching}
                </div>
            `;
            
            grid.appendChild(card);
        });
    }
    
    selectCharacter(index) {
        const char = this.characters.roster[index];
        const cards = document.querySelectorAll('.character-card');
        
        if (this.playerTeam.includes(char)) {
            this.playerTeam = this.playerTeam.filter(c => c !== char);
            cards[index].classList.remove('selected');
        } else if (this.playerTeam.length < 4) {
            this.playerTeam.push(char);
            cards[index].classList.add('selected');
        }
    }
    
    confirmTeam() {
        if (this.playerTeam.length === 4) {
            document.getElementById('characterSelect').classList.add('hidden');
            document.getElementById('menuOverlay').classList.add('hidden');
            document.getElementById('gameUI').classList.remove('hidden');
            this.startGame();
        } else {
            alert('Please select 4 characters for your team!');
        }
    }
    
    startGame() {
        this.state = 'playing';
        this.resetGame();
        
        // Set up teams
        if (this.playerTeam.length === 0) {
            // Default team if none selected
            this.playerTeam = this.characters.roster.slice(0, 4);
        }
        
        this.currentBatter = this.playerTeam[0];
        this.currentPitcher = this.characters.roster[4]; // AI pitcher
        
        // Initialize AI fielders
        this.ai.setupFielders(this.characters.roster.slice(4, 9));
        
        this.updateUI();
    }
    
    resetGame() {
        this.inning = 1;
        this.isTopInning = true;
        this.homeScore = 0;
        this.awayScore = 0;
        this.balls = 0;
        this.strikes = 0;
        this.outs = 0;
        this.bases = [false, false, false];
        this.ball = null;
        this.powerUps = [];
        this.particles = [];
    }
    
    endGame() {
        this.state = 'gameOver';
        const winner = this.homeScore > this.awayScore ? 'HOME' : 'AWAY';
        this.audio.play('gameEnd');
        
        setTimeout(() => {
            alert(`Game Over! ${winner} wins ${Math.max(this.homeScore, this.awayScore)} - ${Math.min(this.homeScore, this.awayScore)}`);
            location.reload();
        }, 1000);
    }
}

// Initialize game when DOM is loaded
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new ArcadeBaseball();
});x,
                y: y,
                vx: (Math.random() - 0.5) * 200,
                vy: (Math.random() - 0.5) * 200,
                life: 1,
                color: `hsl(${Math.random() * 60 + 30}, 100%, 50%)`
            });
        }
    }
    
    checkBallCollisions() {
        // Ground collision
        if (this.ball.z <= 0) {
            this.ball.z = 0;
            this.ball.vz *= -0.5;
            
            // Check if caught
            const fielder = this.ai.getNearestFielder(this.ball.x, this.ball.y);
            const distance = Math.sqrt(
                Math.pow(fielder.x - this.ball.x, 2) + 
                Math.pow(fielder.y - this.ball.y, 2)
            );
            
            if (distance < 30) {
                this.ballCaught();
            } else if (this.ball.vy < 1) {
                this.groundBall();
            }
        }
        
        // Fence collision
        const distanceFromHome = Math.sqrt(
            Math.pow(this.ball.x - 500, 2) + 
            Math.pow(this.ball.y - 500, 2)
        );
        
        if (distanceFromHome > 350 && this.ball.z > 50) {
            this.homeRun();
        }
    }
    
    ballCaught() {
        this.outs++;
        this.ball = null;
        this.audio.play('catch');
        this.checkOuts();
    }
    
    groundBall() {
        // Simple base advancement
        if (this.bases[0]) {
            this.bases[1] = true;
        }
        this.bases[0] = true;
        this.ball = null;
    }
    
    homeRun() {
        let runs = 1;
        this.bases.forEach(occupied => {
            if (occupied) runs++;
        });
        
        if (this.isTopInning) {
            this.awayScore += runs;
        } else {
            this.homeScore += runs;
        }
        
        this.bases = [false, false, false];
        this.ball = null;
        this.audio.play('homerun');
        this.createFireworks();
        
        this.updateUI();
    }
    
    createFireworks() {
        for (let i = 0; i < 50; i++) {
            const angle = (Math.PI * 2 * i) / 50;
            this.particles.push({
                x:
