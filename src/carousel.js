import { exhibits } from "./variable.js";
import {Plane} from './plane.js';


class Carousel{

    planes = [];

    anglePartitioning;
    halfAnglePartitioning;
    heightPartitioning;
    imagesPerRevolution;
    angularDistanceToCloserObject = 0;

    testMaxValue = 0;
    testMinValue = 0;

    constructor(scene, imagesPerRevolution = 12, spiraleThreadHeight = 0){
        this.imagesPerRevolution = imagesPerRevolution;

        if(spiraleThreadHeight == 0){ imagesPerRevolution = exhibits.length}

        this.anglePartitioning = 360 / imagesPerRevolution;
        this.halfAnglePartitioning = this.anglePartitioning / 2;
        this.heightPartitioning = spiraleThreadHeight / imagesPerRevolution;

        for (let i = 0; i < exhibits.length; i++) {
            this.planes.push( new Plane(exhibits[i], scene, i * this.anglePartitioning, -i * this.heightPartitioning));
        }
    }

    getAngularDistanceToCloserObjectNormalized(){
        return this.angularDistanceToCloserObject /  this.halfAnglePartitioning;
    }

    isTrophyReady(){
        return this.getAngularDistanceToCloserObjectNormalized() < 0.05;
    }

    setAngle(angle){
        for (let i = 0; i < this.planes.length; i++) {
            this.planes[i].setAngle(angle);
        }
    }

    getCurrentAngleInDeg(){
        return this.planes[0].getCurrentAngleInDeg();
    }

    getCurrentAngleInRad(){
        return this.planes[0].getCurrentAngleInRad();
    }

    getAngleOf(plane){
        return this.planes[plane].getCurrentAngleInDeg();
    }

    getCurrentObjectInViewIndex(){
        let index = Math.abs(Math.round(this.getCurrentAngleInDeg() / this.anglePartitioning));
        if(index < this.planes.length){
            return index;
        }else{
            return this.planes.length - 1;
        }
    }

    animate(){
        for (let i = 0; i < exhibits.length; i++) {
            this.planes[i].animate();
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

    showCurrentObjectDate(){
        for (let i = 0; i < this.planes.length; i++){

            if(i == this.getCurrentObjectInViewIndex())
                this.planes[i].select();
            else this.planes[i].unselect();

        }
    }

    

}

export {Carousel}