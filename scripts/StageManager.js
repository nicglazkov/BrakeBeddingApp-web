class StageManager {
    constructor() {
        this.stages = [];
        this.currentStageIndex = 0;
        this.currentCycleCount = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.currentState = 'IDLE';
        this.SPEED_TOLERANCE = 2.0; // mph
        this.listeners = new Set();
        this.settings = Settings.getDefault();
    }

    addStage(stageData) {
        let stage;
        if (stageData.type === 'cooldown') {
            stage = new CooldownStage(stageData);
        } else {
            stage = new BeddingStage(stageData);
        }
        this.stages.push(stage);
        this.saveStages();
        this.notifyListeners('stagesUpdated');
    }

    removeStage(index) {
        this.stages.splice(index, 1);
        this.saveStages();
        this.notifyListeners('stagesUpdated');
    }

    startProcedure() {
        if (this.stages.length === 0) {
            throw new Error('No stages configured');
        }
        this.isRunning = true;
        this.isPaused = false;
        this.currentStageIndex = 0;
        this.currentCycleCount = 0;
        this.currentState = 'ACCELERATING';
        this.notifyListeners('procedureStarted');
    }

    pauseProcedure() {
        this.isPaused = true;
        this.notifyListeners('procedurePaused');
    }

    resumeProcedure() {
        this.isPaused = false;
        this.notifyListeners('procedureResumed');
    }

    resetProcedure() {
        this.isRunning = false;
        this.isPaused = false;
        this.currentStageIndex = 0;
        this.currentCycleCount = 0;
        this.currentState = 'IDLE';
        this.notifyListeners('procedureReset');
    }

    updateSpeed(currentSpeed) {
        if (!this.isRunning || this.isPaused) return;

        const currentStage = this.getCurrentStage();
        if (!currentStage) return;

        const speedDiff = currentSpeed - currentStage.startSpeed;

        switch (this.currentState) {
            case 'ACCELERATING':
                if (Math.abs(speedDiff) <= this.SPEED_TOLERANCE) {
                    this.currentState = 'HOLDING';
                    this.startHoldingTimer();
                }
                break;
            case 'BRAKING':
                if (currentSpeed <= currentStage.targetSpeed) {
                    if (currentStage.type === 'bedding') {
                        this.currentState = 'COOLING';
                        this.remainingCooldownDistance = currentStage.gapDistance;
                    } else {
                        this.completeCycle();
                    }
                }
                break;
            case 'COOLING':
                this.updateCoolingProgress(currentSpeed);
                break;
        }

        this.notifyListeners('stateUpdated');
    }

    updateCoolingProgress(currentSpeed) {
        // Calculate distance traveled since last update
        const timeElapsed = (Date.now() - this.lastUpdateTime) / 1000; // seconds
        const distanceTraveled = (currentSpeed * timeElapsed) / 3600; // miles
        this.remainingCooldownDistance -= distanceTraveled;

        if (this.remainingCooldownDistance <= 0) {
            this.completeCycle();
        }

        this.lastUpdateTime = Date.now();
    }

    startHoldingTimer() {
        let holdingTime = 3; // seconds
        const timer = setInterval(() => {
            if (this.isPaused) return;
            
            holdingTime--;
            if (holdingTime <= 0) {
                clearInterval(timer);
                this.currentState = 'BRAKING';
                this.notifyListeners('stateUpdated');
            }
        }, 1000);
    }

    completeCycle() {
        this.currentCycleCount++;
        const currentStage = this.getCurrentStage();
        
        if (this.currentCycleCount >= currentStage.numberOfStops) {
            this.completeStage();
        } else {
            this.currentState = 'ACCELERATING';
            this.notifyListeners('cycleCompleted');
        }
    }

    completeStage() {
        this.currentStageIndex++;
        if (this.currentStageIndex >= this.stages.length) {
            this.completeProcedure();
        } else {
            this.currentCycleCount = 0;
            this.currentState = 'ACCELERATING';
            this.notifyListeners('stageCompleted');
        }
    }

    completeProcedure() {
        this.isRunning = false;
        this.currentState = 'IDLE';
        this.notifyListeners('procedureCompleted');
    }

    getCurrentStage() {
        return this.stages[this.currentStageIndex];
    }

    calculateProgress() {
        if (this.stages.length === 0) return 0;

        const totalCycles = this.stages.reduce((sum, stage) => {
            return sum + (stage.type === 'bedding' ? stage.numberOfStops : 1);
        }, 0);

        const completedCycles = this.stages
            .slice(0, this.currentStageIndex)
            .reduce((sum, stage) => {
                return sum + (stage.type === 'bedding' ? stage.numberOfStops : 1);
            }, 0) + this.currentCycleCount;

        return (completedCycles / totalCycles) * 100;
    }

    addListener(callback) {
        this.listeners.add(callback);
    }

    removeListener(callback) {
        this.listeners.delete(callback);
    }

    notifyListeners(event) {
        const data = {
            event,
            state: this.currentState,
            currentStage: this.getCurrentStage(),
            currentCycle: this.currentCycleCount,
            totalStages: this.stages.length,
            progress: this.calculateProgress(),
            isRunning: this.isRunning,
            isPaused: this.isPaused
        };

        this.listeners.forEach(callback => callback(data));
    }

    saveStages() {
        localStorage.setItem('brakeStages', JSON.stringify(this.stages));
    }

    loadStages() {
        const savedStages = localStorage.getItem('brakeStages');
        if (savedStages) {
            this.stages = JSON.parse(savedStages).map(stageData => {
                return stageData.type === 'cooldown' 
                    ? new CooldownStage(stageData) 
                    : new BeddingStage(stageData);
            });
        }
    }

    saveSettings() {
        localStorage.setItem('brakeSettings', this.settings.toJSON());
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('brakeSettings');
        if (savedSettings) {
            this.settings = Settings.fromJSON(savedSettings);
        }
    }
}