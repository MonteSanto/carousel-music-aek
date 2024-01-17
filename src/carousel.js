import { exhibits } from "./variable.js";
import {Vinyl} from './vinyl.js';
import {Sound} from './sound.js';


class Carousel{

    vinyls = [];

    anglePartitioning;
    halfAnglePartitioning;
    heightPartitioning;
    imagesPerRevolution;
    angularDistanceToCloserObject = 0;

    testMaxValue = 0;
    testMinValue = 0;

    sound;
    vinylsPromise;
    musicButtons = [];

    constructor(scene, imagesPerRevolution = 12, spiraleThreadHeight = 0){
        this.imagesPerRevolution = imagesPerRevolution;

        if(spiraleThreadHeight == 0){ imagesPerRevolution = exhibits.length}

        this.anglePartitioning = 360 / imagesPerRevolution;
        this.halfAnglePartitioning = this.anglePartitioning / 2;
        this.heightPartitioning = spiraleThreadHeight / imagesPerRevolution;

        this.sound = new Sound("sounds/track_1.wav");
        
        this.vinylsPromise = new Promise(() => {
            for (let i = 0; i < exhibits.length; i++) {
                this.vinyls.push( new Vinyl(exhibits[i], scene, i * this.anglePartitioning, -i * this.heightPartitioning, this.musicButtons));
            }
        });

        this.getMusicButtons();
    }

    getAngularDistanceToCloserObjectNormalized(){
        return this.angularDistanceToCloserObject /  this.halfAnglePartitioning;
    }

    isTrophyReady(){
        return this.getAngularDistanceToCloserObjectNormalized() < 0.05;
    }

    setAngle(angle){
        for (let i = 0; i < this.vinyls.length; i++) {
            this.vinyls[i].setAngle(angle);
        }
    }

    getCurrentAngleInDeg(){
        return this.vinyls[0].getCurrentAngleInDeg();
    }

    getCurrentAngleInRad(){
        return this.vinyls[0].getCurrentAngleInRad();
    }

    getAngleOf(vinyl){
        return this.vinyls[vinyl].getCurrentAngleInDeg();
    }

    getCurrentObjectInViewIndex(){
        let index = Math.abs(Math.round(this.getCurrentAngleInDeg() / this.anglePartitioning));
        if(index < this.vinyls.length){
            return index;
        }else{
            return this.vinyls.length - 1;
        }
    }

    animate(){
        for (let i = 0; i < exhibits.length; i++) {
            this.vinyls[i].animate();
        }
    }

    goTowardsAnObject(deltaTime){
        this.angularDistanceToCloserObject = 0;
        
        if(this.getCurrentAngleInDeg() > 0){

            this.angularDistanceToCloserObject = this.getCurrentAngleInDeg();

        }else if(this.getCurrentAngleInDeg() < -this.anglePartitioning * (exhibits.length - 1)  ){

            this.angularDistanceToCloserObject = this.getCurrentAngleInDeg() - (-this.anglePartitioning * (exhibits.length - 1));

        }else{
            
            this.angularDistanceToCloserObject = (this.getCurrentAngleInDeg() ) % this.anglePartitioning;
            
            if (this.angularDistanceToCloserObject > this.halfAnglePartitioning) {
                this.angularDistanceToCloserObject -= this.anglePartitioning;
                
            } else if (this.angularDistanceToCloserObject < -this.halfAnglePartitioning) {
                this.angularDistanceToCloserObject += this.anglePartitioning;
            }

        }

        this.setAngle(-this.angularDistanceToCloserObject * 2 * deltaTime);
    }

    goTowardsSpecificObject(deltaTime, selectedObject){
        if(selectedObject != null){

            if(this.getAngleOf(selectedObject) > 0)  this.setAngle(-this.getAngleOf(selectedObject) * 2 * deltaTime);
            else this.setAngle(-this.getAngleOf(selectedObject) * 2 * deltaTime);
            
            if(Math.abs(this.getAngleOf(selectedObject)) < 0.3)
                return true;
            else 
                return false;
        }
    }

    showPlayButtonOfCurrentObject(){
        for (let i = 0; i < this.vinyls.length; i++){
            if(i == this.getCurrentObjectInViewIndex())
                this.vinyls[i].showPlayButton();
            else this.vinyls[i].hidePlayButton();
        }
    }

    getMusicButtons(){
        this.vinylsPromise.then(() => {
            this.vinyls.forEach(vinyl => {
                this.musicButtons.push(vinyl.playPlane);
            })
        });
    }
}

export {Carousel}