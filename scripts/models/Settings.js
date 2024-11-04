class Settings {
    constructor() {
        this.speedUnit = 'MPH';
        this.distanceUnit = 'miles';
        this.soundEnabled = true;
        this.vibrationEnabled = true;
        this.screenWakelock = true;
        this.notifications = true;
    }

    static getDefault() {
        return new Settings();
    }

    static fromJSON(json) {
        const settings = new Settings();
        Object.assign(settings, JSON.parse(json));
        return settings;
    }

    toJSON() {
        return JSON.stringify(this);
    }
}