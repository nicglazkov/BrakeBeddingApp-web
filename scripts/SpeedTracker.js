class SpeedTracker {
    constructor() {
        this.currentSpeed = 0;
        this.watching = false;
        this.listeners = new Set();
    }

    async initialize() {
        if (!('geolocation' in navigator)) {
            throw new Error('Geolocation is not supported by this browser');
        }

        try {
            await this.requestPermission();
            this.startTracking();
        } catch (error) {
            console.error('Failed to initialize speed tracking:', error);
            throw error;
        }
    }

    async requestPermission() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });
    }

    startTracking() {
        const options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        };

        this.watchId = navigator.geolocation.watchPosition(
            this.handlePosition.bind(this),
            this.handleError.bind(this),
            options
        );
        this.watching = true;
    }

    stopTracking() {
        if (this.watchId) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watching = false;
        }
    }

    handlePosition(position) {
        if (position.coords.speed !== null) {
            // Convert m/s to mph
            this.currentSpeed = position.coords.speed * 2.23694;
            this.notifyListeners();
        }
    }

    handleError(error) {
        console.error('Speed tracking error:', error);
        this.notifyError(error);
    }

    addListener(callback) {
        this.listeners.add(callback);
    }

    removeListener(callback) {
        this.listeners.delete(callback);
    }

    notifyListeners() {
        this.listeners.forEach(callback => {
            callback(this.currentSpeed);
        });
    }

    notifyError(error) {
        this.listeners.forEach(callback => {
            if (callback.error) {
                callback.error(error);
            }
        });
    }

    getCurrentSpeed() {
        return this.currentSpeed;
    }
}