import * as THREE from 'three';
import { Button } from './button.js'
import { Text } from 'troika-three-text';


class UI{
    cameraOrtho;
    sceneOrtho;
    raycasterOrtho;
    language = 'GR';

    tooltipText;
    popUp;
    selectedPlane;

    screen = {
        width: window.innerWidth,
        height: window.innerHeight
    }

    constructor(popUp, selectedPlane){
        this.selectedPlane = selectedPlane;

        this.popUp = popUp;
        this.mouse = new THREE.Vector2();

        this.aspect = window.innerWidth / window.innerHeight;
        this.frustrum = 1;

        this.cameraOrtho =  new THREE.OrthographicCamera(
            this.frustrum * this.aspect / -2,
            this.frustrum * this.aspect / 2,
            this.frustrum / 2,
            this.frustrum / -2,
            1,
            10
          );

        this.cameraOrtho.position.z = 1;
        this.sceneOrtho = new THREE.Scene();

        let buttonsYOffset = 0.02;
        let spacing = 0.01;
        let size = 0.053;

        this.start = new Button('START2', true, 'topCenter', spacing, buttonsYOffset, size * 1.6, this.sceneOrtho, this.cameraOrtho);
        this.setStartButtonOpacity(0);

        this.createtitle("Music");
        this.sceneOrtho.add(this.troikaTitle);

        this.createBackground(0x9b722f);
    }

    animate(delta){
        this.start.update();
    }

    closeMenu(){
    }

    resizeAspectRatio(){
        this.aspect = window.innerWidth / window.innerHeight;

        this.cameraOrtho.left = this.frustrum * this.aspect / -2;
        this.cameraOrtho.right = this.frustrum * this.aspect / 2;

        this.cameraOrtho.updateProjectionMatrix();

    }

    onClick(x, y) {
        this.getMousePosition(x, y);

        this.start.onClick(this.mouse, () => {
            this.selectedPlane.current = 0;
            this.selectedPlane.onClick();
        });
    }

    onOrthographicMouseMove() {
        let mouseOver = false;
        this.getMousePosition();
        mouseOver = mouseOver || this.start.isInsideBounds(this.mouse);
        return mouseOver;
    }

    isClickInsideBounds() {
        this.getMousePosition();
        return this.start.isInsideBounds(this.mouse);
    }

    getMousePosition(x, y){
        this.mouse.x = (( x / window.innerWidth ) - 0.5) * this.aspect;
        this.mouse.y = -(( y / window.innerHeight ) - 0.5);
    }

    
    createtitle(title){
        this.troikaTitle = new Text();
        this.troikaTitle.text = title;
        this.troikaTitle.font = 'fonts/jura/Jura-Regular.ttf';
        this.troikaTitle.color = "#ffffff";
        this.troikaTitle.material.opacity = 1;
        this.troikaTitle.fontSize = 0.032;
        this.troikaTitle.maxWidth = 0.4;
        this.troikaTitle.maxHeight = 0.1;
        this.troikaTitle.position.set(this.cameraOrtho.left + 0.03, this.cameraOrtho.top - 0.03);
        this.troikaTitle.sync();
    }

    createBackground(color){
        const backgroundGeometry = new THREE.PlaneGeometry(0.85, 0.09);
        const backgroundMaterial = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
        this.backgroundMesh = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
        this.backgroundMesh.position.set(this.cameraOrtho.left + 0.03, this.cameraOrtho.top - 0.062);
        this.backgroundMesh.position.z -= 0.01;
        this.sceneOrtho.add(this.backgroundMesh);
    }

    setTitleOpacity(alpha){
        this.backgroundMesh.material.opacity = alpha * 0.9;
        this.troikaTitle.material.opacity = alpha;
        this.troikaTitle.sync();
    }

    setStartButtonOpacity(alpha){
        if(this.start.material) this.start.material.opacity = alpha;
    }

}

export {UI};