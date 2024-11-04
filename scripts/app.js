class BrakeBeddingApp {
    constructor() {
        this.stageManager = new StageManager();
        this.speedTracker = new SpeedTracker();
        this.uiController = new UIController(this.stageManager, this.speedTracker);
        
        this.initialize();
    }

    async initialize() {
        try {
            // Load saved configurations
            this.stageManager.loadStages();
            this.stageManager.loadSettings();
            
            // Initialize UI
            this.uiController.updateStagesList();
            
            // Initialize speed tracking
            await this.speedTracker.initialize();
            
            console.log('Brake Bedding App initialized successfully');
        } catch (error) {
            console.error('Failed to initialize app:', error);
            alert('Error initializing app. Please ensure location services are enabled.');
        }
    }
}

// Initialize the app when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new BrakeBeddingApp();
});