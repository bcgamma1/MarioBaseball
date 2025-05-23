// Audio Manager for sound effects
class AudioManager {
    constructor() {
        this.sounds = {};
        this.enabled = true;
        this.volume = 0.5;
        
        // Initialize sound library
        this.initSounds();
    }
    
    initSounds() {
        // Create audio context for generating sounds
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Define sound effects
        this.soundDefinitions = {
            hit: { frequency: 800, duration: 0.1, type: 'square' },
            pitch: { frequency: 400, duration: 0.2, type: 'sine' },
            catch: { frequency: 600, duration: 0.15, type: 'triangle' },
            homerun: { frequency: 1200, duration: 0.5, type: 'sine' },
            strike: { frequency: 300, duration: 0.3, type: 'sawtooth' },
            powerup: { frequency: 1000, duration: 0.2, type: 'square' },
            score: { frequency: 880, duration: 0.4, type: 'sine' },
            swingMiss: { frequency: 200, duration: 0.2, type: 'sawtooth' },
            strikeout: { frequency: 150, duration: 0.5, type: 'square' },
            gameEnd: { frequency: 440, duration: 1, type: 'sine' }
        };
        
        // Pre-create oscillators for each sound
        Object.keys(this.soundDefinitions).forEach(key => {
            this.sounds[key] = () => this.playTone(this.soundDefinitions[key]);
        });
    }
    
    playTone(soundDef) {
        if (!this.enabled || !this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = soundDef.type;
        oscillator.frequency.setValueAtTime(soundDef.frequency, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + soundDef.duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + soundDef.duration);
    }
    
    play(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName]();
        }
    }
    
    playMultiple(soundNames) {
        soundNames.forEach(name => this.play(name));
    }
    
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }
    
    toggle() {
        this.enabled = !this.enabled;
    }
    
    // Special effect sounds
    playHomeRunFanfare() {
        const notes = [440, 554, 659, 880]; // A, C#, E, A (A major chord)
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.playTone({
                    frequency: freq,
                    duration: 0.3,
                    type: 'sine'
                });
            }, i * 100);
        });
    }
    
    playCrowdCheer() {
        // Simulate crowd noise with filtered noise
        const bufferSize = 2 * this.audioContext.sampleRate;
        const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        
        const whiteNoise = this.audioContext.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1000;
        
        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(this.volume * 0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 2);
        
        whiteNoise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        whiteNoise.start(this.audioContext.currentTime);
        whiteNoise.stop(this.audioContext.currentTime + 2);
    }
}
