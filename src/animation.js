export default class Animation {
    deltaTime = 0;
    elapsedTime = 0;
    duration = 0;
    alpha = 0;

    isFinished = true;
    isStarted = false;

    onStart = null;
    onAnimating = null;
    onEnd = null;

    constructor(duration, onAnimating = null, onStart = null, onEnd = null) {
        this.duration = duration;
        this.onStart = onStart;
        this.onEnd = onEnd;
        this.onAnimating = onAnimating;
    }

    animate(deltaTime) {
        if (this.isFinished) return;

        this.elapsedTime += deltaTime;
        this.alpha = this.elapsedTime / this.duration;

        if (this.alpha > 1) {
            this.alpha = 1;
            this.isStarted = false;
            this.isFinished = true;
            if (this.onAnimating !== null) this.onAnimating(this.alpha);
            if (this.onEnd !== null) this.onEnd();
            return;
        }

        if (this.onAnimating !== null) this.onAnimating(this.alpha);
    }

    play() {
        if(this.isStarted) return;
        
        this.elapsedTime = 0;
        this.alpha = 0;
        this.isStarted = true;
        this.isFinished = false;

        if (this.onStart !== null) this.onStart();
    }
}