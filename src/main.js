class BrakeBeddingApp {
    constructor() {
        this.stageManager = new StageManager();
        this.speedTracker = new SpeedTracker();
        this.uiController = new UIController(this.stageManager, this.speedTracker);
        
        this.initialize();
    }

    async initialize() {
        // Load saved configurations
        this.stageManager.loadStages();
        const settings = this.stageManager.loadSettings();
        
        // Initialize UI
        this.uiController.updateStagesList();
        
        // Initialize speed tracking
        await this.speedTracker.initialize();
        
        // Setup help guide
        document.getElementById('helpBtn').addEventListener('click', () => {
            HelpGuide.showHelp();
        });
    }
}

// Initialize the app
const app = new BrakeBeddingApp();