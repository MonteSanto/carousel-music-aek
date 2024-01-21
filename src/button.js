import * as THREE from 'three';
import { getTextureLoader } from './loaders.js';

class Button{
    camera;

    position;

    material;
    mesh;

    isOn;

    onTexture;
    offTexture;

    radius;

    selectedPlane;

    screen = {
        width: window.innerWidth,
        height: window.innerHeight
    }

    constructor(imageName, isOn, alignment = 'center', offsetX = 0, offsetY = 0, diameter = 100, scene, camera){
        this.isOn = isOn;
        this.alignment = alignment;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        
        this.mesh = null;
        
        this.camera = camera;
        this.position = new THREE.Vector2();

        this.diameter = diameter;
        this.radius = diameter / 2;
 
        getTextureLoader().load( 'icons/'+ imageName +'ON.png', (onTexture) => {

            getTextureLoader().load( 'icons/'+ imageName +'OFF.png', (offTexture) => {

                this.onTexture = onTexture;
                this.offTexture = offTexture;

                this.geometry = new THREE.PlaneGeometry(diameter, diameter); 

                this.material = new THREE.MeshBasicMaterial({transparent: true, side: THREE.DoubleSide});
                this.setTexture();

                this.mesh = new THREE.Mesh( this.geometry, this.material);
                this.mesh.name = imageName;

                this.updateAlignment(alignment, offsetX, offsetY);
                scene.add(this.mesh);

            });
        });
    }

    getSize(){
        return this.diameter;
    }

    setPosition(positionX, positionY){
        this.position.x = positionX;
        this.position.y = positionY;

        this.mesh.position.set(this.position.x, this.position.y);
    }

    translateY(amount){
        this.offsetY += amount;
    }

    updateAlignment(){
        let x, y;

        let offsetW = this.offsetX;
        let offsetH = this.offsetY;

        switch(this.alignment){
            case 'center':
                x = offsetW;
                y = offsetH;
                break;

            case 'centerLeft':
                x = this.camera.left + this.radius + offsetW;
                y = offsetH;
                break;

            case 'centerRight':
                x = this.camera.right - this.radius - offsetW;
                y = offsetH;
                break;

            case 'topLeft':
                x = this.camera.left + this.radius + offsetW;
                y = this.camera.top - this.radius  - offsetH;
                break;
            
            case 'topRight':
                x = this.camera.right - this.radius - offsetW;
                y = this.camera.top + this.radius + offsetH;
                break;
            
            case 'bottomLeft':
                x = this.camera.left + this.radius + offsetW;
                y = this.camera.bottom - this.radius - offsetH;
                break;

            case 'bottomRight':
                x = this.camera.right - this.radius - offsetW;
                y = this.camera.bottom - this.radius - offsetH;
                break;

            case 'topCenter':
                x = 0;
                y = this.camera.top - this.radius  - offsetH;
                break;
            
            default:
                x = offsetW;
                y = offsetH;
                break;
        }

        this.setPosition(x, y);
    }

    update(){
        if(this.mesh != null) this.updateAlignment();
    }

    setTexture(){
        if(this.material == null) return;
        if(this.isOn) this.material.map = this.onTexture;
        else this.material.map = this.offTexture;
    }

    turnOff(){
        this.isOn = false;
        this.setTexture();
    }

    onClick(mousePosition, callBack) {
        if(this.isInsideBounds(mousePosition)){
            this.isOn = !this.isOn;
            this.setTexture();
            
            callBack(this.isOn);
        }
    }

    onMouseOver(mousePosition){
        if(this.isInsideBounds(mousePosition)){
            this.isOn = !this.isOn;
            this.setTexture();
            
            callBack(this.isOn);
        } 
    }

    isInsideBounds(mousePosition){
        return mousePosition.distanceTo(this.position) < this.radius;
    }
}

export { Button };