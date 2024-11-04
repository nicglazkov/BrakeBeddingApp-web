class UIController {
    constructor(stageManager, speedTracker) {
        this.stageManager = stageManager;
        this.speedTracker = speedTracker;
        this.elements = this.getElements();
        this.setupEventListeners();
    }

    getElements() {
        return {
            speedValue: document.querySelector('.speed-value'),
            progressText: document.querySelector('.progress-text'),
            progressBar: document.querySelector('.progress-bar'),
            instructionText: document.querySelector('.instruction-text'),
            statusIndicator: document.querySelector('.status-indicator'),
            startButton: document.getElementById('startBtn'),
            pauseButton: document.getElementById('pauseBtn'),
            resetButton: document.getElementById('resetBtn'),
            settingsButton: document.getElementById('settingsBtn'),
            helpButton: document.getElementById('helpBtn'),
            settingsModal: document.getElementById('settingsModal'),
            stagesList: document.getElementById('stagesList'),
            stageForm: document.getElementById('stageForm')
        };
    }

    setupEventListeners() {
        // Speed tracker listeners
        this.speedTracker.addListener(this.updateSpeedDisplay.bind(this));

        // Stage manager listeners
        this.stageManager.addListener(this.handleStageUpdate.bind(this));

        // Button listeners
        this.elements.startButton.addEventListener('click', () => {
            this.stageManager.startProcedure();
        });

        this.elements.pauseButton.addEventListener('click', () => {
            if (this.stageManager.isPaused) {
                this.stageManager.resumeProcedure();
            } else {
                this.stageManager.pauseProcedure();
            }
        });

        this.elements.resetButton.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset the procedure?')) {
                this.stageManager.resetProcedure();
            }
        });

        // Settings form listeners
        this.elements.stageForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleStageFormSubmit(e);
        });

        // Modal listeners
        this.elements.settingsButton.addEventListener('click', () => {
            this.showSettingsModal();
        });

        this.elements.helpButton.addEventListener('click', () => {
            HelpGuide.show();
        });
    }

    updateSpeedDisplay(speed) {
        this.elements.speedValue.textContent = `${Math.round(speed)} MPH`;
        if (this.stageManager.isRunning) {
            this.stageManager.updateSpeed(speed);
        }
    }

    handleStageUpdate(data) {
        switch (data.event) {
            case 'stagesUpdated':
                this.updateStagesList();
                break;
            case 'procedureStarted':
                this.updateUIForRunningState();
                break;
            case 'procedurePaused':
                this.updateUIForPausedState();
                break;
            case 'procedureResumed':
                this.updateUIForRunningState();
                break;
            case 'procedureReset':
                this.updateUIForIdleState();
                break;
            case 'stateUpdated':
                this.updateStatusDisplay(data);
                break;
            case 'procedureCompleted':
                this.handleProcedureCompletion();
                break;
        }

        this.updateProgress(data.progress);
    }

    updateStatusDisplay(data) {
        const { state, currentStage } = data;
        
        // Update status indicator color
        this.elements.statusIndicator.className = 'status-indicator ' + state.toLowerCase();

        // Update instruction text
        let instruction = '';
        switch (state) {
            case 'ACCELERATING':
                instruction = `Accelerate to ${currentStage.startSpeed} MPH`;
                break;
            case 'HOLDING':
                instruction = `Hold speed at ${currentStage.startSpeed} MPH`;
                break;
            case 'BRAKING':
                instruction = `${currentStage.brakingIntensity} - Brake to ${currentStage.targetSpeed} MPH`;
                break;
            case 'COOLING':
                instruction = `Cooling - Drive ${this.stageManager.remainingCooldownDistance.toFixed(1)} miles`;
                break;
            default:
                instruction = 'Ready to start';
        }
        this.elements.instructionText.textContent = instruction;
    }

    updateProgress(progress) {
        this.elements.progressBar.style.width = `${progress}%`;
    }

    updateUIForRunningState() {
        this.elements.startButton.disabled = true;
        this.elements.pauseButton.disabled = false;
        this.elements.resetButton.disabled = false;
        this.elements.settingsButton.disabled = true;
    }

    updateUIForPausedState() {
        this.elements.pauseButton.textContent = 'Resume';
    }

    updateUIForIdleState() {
        this.elements.startButton.disabled = false;
        this.elements.pauseButton.disabled = true;
        this.elements.resetButton.disabled = true;
        this.elements.settingsButton.disabled = false;
        this.elements.pauseButton.textContent = 'Pause';
    }

    handleStageFormSubmit(event) {
        const formData = new FormData(event.target);
        const stageData = {
            numberOfStops: parseInt(formData.get('numberOfStops')),
            startSpeed: parseFloat(formData.get('startSpeed')),
            targetSpeed: parseFloat(formData.get('targetSpeed')),
            gapDistance: parseFloat(formData.get('gapDistance')),
            brakingIntensity: formData.get('brakingIntensity')
        };

        this.stageManager.addStage(stageData);
        event.target.reset();
    }

    updateStagesList() {
        const stages = this.stageManager.stages;
        this.elements.stagesList.innerHTML = stages.map((stage, index) => `
            <div class="stage-item">
                <button class="delete-button" onclick="app.uiController.deleteStage(${index})">×</button>
                <h4>Stage ${index + 1}</h4>
                ${stage.type === 'bedding' ? `
                    <p>Stops: ${stage.numberOfStops}</p>
                    <p>Speed: ${stage.startSpeed} → ${stage.targetSpeed} MPH</p>
                    <p>Gap: ${stage.gapDistance} miles</p>
                    <p>Intensity: ${stage.brakingIntensity}</p>
                ` : `
                    <p>Cooldown Distance: ${stage.distance} miles</p>
                `}
            </div>
        `).join('');
    }

    deleteStage(index) {
        this.stageManager.removeStage(index);
    }

    showSettingsModal() {
        this.elements.settingsModal.style.display = 'block';
    }

    hideSettingsModal() {
        this.elements.settingsModal.style.display = 'none';
    }

    handleProcedureCompletion() {
        this.updateUIForIdleState();
        alert('Brake bedding procedure completed successfully!');
    }
}