import { vinylsList } from "./variable.js";
import {Vinyl} from './vinyl.js';

class Carousel{

    vinyls = [];

    anglePartitioning;
    halfAnglePartitioning;
    heightPartitioning;
    imagesPerRevolution;
    angularDistanceToCloserObject = 0;
    isCircular = false;

    testMaxValue = 0;
    testMinValue = 0;

    constructor(scene, imagesPerRevolution = 12, spiraleThreadHeight = 0){
        this.imagesPerRevolution = imagesPerRevolution;

        if(spiraleThreadHeight == 0){
            imagesPerRevolution = vinylsList.length;
            this.isCircular = true;
        }

        this.anglePartitioning = 360 / imagesPerRevolution;
        this.halfAnglePartitioning = this.anglePartitioning / 2;
        this.heightPartitioning = spiraleThreadHeight / imagesPerRevolution;
        
        for (let i = 0; i < vinylsList.length; i++) {
            this.vinyls.push( new Vinyl(vinylsList[i], scene, i * this.anglePartitioning, -i * this.heightPartitioning));
        }
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
        let index = -Math.round(this.getCurrentAngleInDeg() / this.anglePartitioning) % this.vinyls.length;

        if(!this.isCircular){
            if(index < this.vinyls.length){
                return index;
            }else{
                return this.vinyls.length - 1;
            }
        }
        
        if (index < 0) return this.vinyls.length + index;
        
        return index;
    }

    getCurrentObjectInView(){
        return this.vinyls[this.getCurrentObjectInViewIndex()];
    }

    getCurrentVinylPlaying(){
        for (let i = 0; i < this.vinyls.length; i++) {
            if(this.vinyls[i].isPlaying) return this.vinyls[i];
        }
    }

    animate(){
        for (let i = 0; i < this.vinyls.length; i++) {
            this.vinyls[i].animate();
        }
    }

    goTowardsClosestObject(deltaTime){

        this.angularDistanceToCloserObject = (this.getCurrentAngleInDeg() ) % this.anglePartitioning;
            
        if (this.angularDistanceToCloserObject > this.halfAnglePartitioning) {
            this.angularDistanceToCloserObject -= this.anglePartitioning;
            
        } else if (this.angularDistanceToCloserObject < -this.halfAnglePartitioning) {
            this.angularDistanceToCloserObject += this.anglePartitioning;
        }
        
        if(!this.isCircular){
            if(this.getCurrentAngleInDeg() > 0){
                this.angularDistanceToCloserObject = this.getCurrentAngleInDeg();
            }
            
            if(this.getCurrentAngleInDeg() < -this.anglePartitioning * (this.vinyls.length - 1)){
                this.angularDistanceToCloserObject = this.getCurrentAngleInDeg() - (-this.anglePartitioning * (this.vinyls.length - 1));
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
                this.vinyls[i].setPlayButtonOpacity(1);
            else this.vinyls[i].setPlayButtonOpacity(0);
        }
    }

    stopAllMusic(){
        for (let i = 0; i < this.vinyls.length; i++){
            this.vinyls[i].stop();
        }
    }

    setPlayButtonsOpacity(alpha){
        for (let i = 0; i < this.vinyls.length; i++){
            this.vinyls[i].setPlayButtonOpacity(alpha);
        }
    }
}

export {Carousel}