import * as THREE from 'three';
import { Text } from 'troika-three-text';
import { getTextureLoader } from './loaders.js';

class Item {
    group;
    open;
    visible = false;
    name;

    hasArrow = false;

    text;
    maxOpacity = 1;

    defaultPosition = { x: 0, y: 0 };

    teleportOpacity = 0;

    tpRadius = 0.03;

    arrowMap;

    scaling;
    
    constructor(name, normalTpTexture, hoverTpTexture, arrowMap, scaling){
        this.name = name;
        this.normalTpTexture = normalTpTexture;
        this.hoverTpTexture = hoverTpTexture;
        this.arrowMap = arrowMap;
        this.open = false;

        this.scale = 0.2;

        this.scaling = scaling;

        this.group = new THREE.Group();
        this.group.name = this.name.GR;

        this.arrow(this.group, this.arrowMap);
        this.title(this.group);

        this.teleportIcon(this.group); 
        
        this.closedYoffset = -.03 * this.scaling;
    }

    setToHidden(){
        this.visible = false;
    }

    setOpacity(opacity){
        this.maxOpacity = opacity;
        this.material.opacity = 0;
        this.text.fillOpacity = 0;
    }

    addToScene(scene){
        scene.add(this.group);
    }

    setPosition(x, y){
        this.arrowSprite.position.set(x, y, 0);
        this.text.position.set(x + this.getWidth() + 0.005, y, 0);
        this.teleportSprite.position.set(this.text.position.x + this.text.geometry.boundingBox.max.x + 0.03 * this.scaling, y, 0);
        this.defaultPosition = {x, y};
    }

    setDefaultPosition(){
        this.setPosition(this.defaultPosition.x, this.defaultPosition.y);
    }

    turnOffArrow(){
        this.hasArrow = false;
        this.material.opacity = 0;
    }

    arrow(group, arrowMap){
        this.material = new THREE.SpriteMaterial( { map: arrowMap, transparent: true, opacity: 0} );
        this.material.side = THREE.DoubleSide;

        this.arrowSprite = new THREE.Sprite( this.material );
        this.arrowSprite.scale.set( 0.011 * this.scaling, 0.011 * this.scaling, 1 );

        group.add(this.arrowSprite);
    }

    teleportIcon(group){
        this.teleportIconMaterial = new THREE.SpriteMaterial( { map: this.normalTpTexture, transparent: true, opacity: 0 } );

        this.teleportIconMaterial.side = THREE.DoubleSide;

        this.teleportSprite = new THREE.Sprite( this.teleportIconMaterial );
        this.teleportSprite.scale.set( this.tpRadius * this.scaling, this.tpRadius * this.scaling, 1 );

        group.add(this.teleportSprite);
    }

    setTeleportButtonToHover(bool){
        if(bool) this.teleportIconMaterial.map = this.hoverTpTexture;
        else this.teleportIconMaterial.map = this.normalTpTexture;
    }

    title(group){
        this.text = new Text();
        group.add(this.text);

        this.text.text = this.name.GR;
        this.text.font = 'fonts/jura/Jura-Regular.ttf';
        this.text.fontSize = 0.022 * this.scaling;
        this.text.anchorY = 'middle'
        this.text.maxWidth = 1000;
        this.text.color = 0x8c8679;
        this.text.fillOpacity = 1;
        //this.text.rotateX(Math.PI);
        this.text.sync();
    }

    toggleVisible(){
        this.visible = !this.visible;
    }

    rotate(angle){
        this.arrowSprite.material.rotation += angle;
    }

    setRotation(angle){
        this.arrowSprite.material.rotation = angle;
    }

    getRotation(){
        return this.arrowSprite.material.rotation;
    }

    getWidth(){
        return this.arrowSprite.scale.x;
    }

    toggleOpen(){
        this.open = !this.open;
    }

    getNextY(){
        return this.text.position.y - this.closedYoffset;
    }

    getYposition(){
       return this.text.position.y;
    }

    getSpacing(){
        return this.closedYoffset;
    }

    isInsideBoundingBox(mouseCoordinates){
        return(mouseCoordinates.x > this.text.geometry.boundingBox.min.x + this.text.position.x
            && mouseCoordinates.x < this.text.geometry.boundingBox.max.x + this.text.position.x
            && mouseCoordinates.y > this.text.geometry.boundingBox.min.y + this.text.position.y
            && mouseCoordinates.y < this.text.geometry.boundingBox.max.y + this.text.position.y
        );
    }

    isInsideBoundingBoxTeleportButton(mouseCoordinates){
        return mouseCoordinates.distanceTo(this.teleportSprite.position) < this.tpRadius * this.scaling;
    }

    pushDown(amount){
        this.arrowSprite.translateY(-this.closedYoffset * amount);
        this.text.translateY(this.closedYoffset * amount);
        this.teleportSprite.translateY(-this.closedYoffset * amount)
    }

    pullUp(amount){
        this.arrowSprite.translateY(this.closedYoffset * amount);
        this.text.translateY(-this.closedYoffset * amount);
        this.teleportSprite.translateY(this.closedYoffset * amount)
    }

    animate(){
        if(this.open){
            this.rotate(0.15);
            if(this.getRotation() > Math.PI / 4) this.setRotation(Math.PI / 4);
        }else{
            this.rotate(-0.15);
            if(this.getRotation() < -Math.PI / 4) this.setRotation(-Math.PI / 4);
        }

        if(this.visible){
            this.group.translateY(0.003);
            if( this.group.position.y > 0) this.group.position.y = 0;
            
            this.text.fillOpacity += 0.3;
            if(this.text.fillOpacity > 0) this.text.fillOpacity = this.maxOpacity;

            if(this.hasArrow){
                this.material.opacity += 0.6;
                if(this.material.opacity > 0) this.material.opacity = this.maxOpacity;
            }

            this.teleportIconMaterial.opacity += 0.6;
            if(this.teleportIconMaterial.opacity > this.teleportOpacity) this.teleportIconMaterial.opacity = this.teleportOpacity;
            

        }else{
            this.group.translateY(-0.003);
            if( this.group.position.y < this.closedYoffset ) this.group.position.y = this.closedYoffset;

            this.text.fillOpacity -= 0.65;
            if(this.text.fillOpacity < 0) this.text.fillOpacity = 0;

            this.material.opacity -= 0.6;
            if(this.material.opacity < 0) this.material.opacity = 0;

            this.teleportIconMaterial.opacity -= 0.6;
            if(this.teleportIconMaterial.opacity < 0) this.teleportIconMaterial.opacity = 0;

        }
    }

    changeLanguage(language){
        switch(language){
            case "GR" :
                this.text.text = this.name.GR;
                
                break;
            case "EN" :
                this.text.text = this.name.EN;
                break;
        }
        this.text.sync(() => {
            this.teleportSprite.position.x = this.text.position.x + this.text.geometry.boundingBox.max.x + 0.03 * this.scaling;
        });

        
    }
}

export {Item};