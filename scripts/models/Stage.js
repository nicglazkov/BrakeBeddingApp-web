class Stage {
    constructor(type, params) {
        this.type = type;
        this.params = params;
        this.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}

class BeddingStage extends Stage {
    constructor(params) {
        super('bedding', params);
        this.numberOfStops = params.numberOfStops;
        this.startSpeed = params.startSpeed;
        this.targetSpeed = params.targetSpeed;
        this.gapDistance = params.gapDistance;
        this.brakingIntensity = params.brakingIntensity;
    }
}

class CooldownStage extends Stage {
    constructor(params) {
        super('cooldown', params);
        this.distance = params.distance;
    }
}