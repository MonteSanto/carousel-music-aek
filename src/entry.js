import {Item} from './item.js';

class  Entry {
    name;
    index;
    planeIndex;
    parent = null;
    children = [];
    isClickable = true;
    isTitle = false;

    tabSize = 0.05;

    selectedPlane;
    
    constructor(selectedPlane, name, planeIndex = undefined, isTitle = false, teleportIcon, teleportHoverIcon, arrowMap, scale){
        
        this.selectedPlane = selectedPlane;
        this.planeIndex = planeIndex;

        this.name = name;
        this.item = new Item(name, teleportIcon, teleportHoverIcon, arrowMap, scale);

        this.item.turnOffArrow();

        if( isTitle ){
            this.isTitle = isTitle;
            this.isClickable = false;
            this.item.open = true;
        }
    }

    addChild(child){
        if(!this.isTitle){
            this.item.hasArrow = true;
            child.item.setToHidden();
        } 
        
        child.parent = this;
        child.index = this.children.length;
        this.children.push(child);
    }

    addToScene(scene){
        this.item.addToScene(scene);
        if(this.children.length > 0)
            this.children.forEach((child) => { child.addToScene(scene) });

    }

    setPosition(x, y){
        this.item.setPosition(x, y);
        if(this.children.length > 0)
            this.children.forEach((child, index) => {
                    child.setPosition(x + this.tabSize, this.item.getYposition() + this.item.getSpacing() * (index + 1));
            });
    }

    translateX(amount){
        this.setPosition(this.item.x + amount);
    }

    toggleShowChildren(){
        if(this.children.length > 0)
            this.children.forEach((child) => { child.item.toggleVisible() });
    }

    setOpacity(opacity){
        this.item.setOpacity(opacity);
        if(this.children.length > 0)
            this.children.forEach((child) => { child.setOpacity(opacity) });

        this.item.teleportOpacity = 0;
        if(this.children.length > 0)
            this.children.forEach((child) => { child.item.teleportOpacity = 0; });
    }

    pushDownFrom(index, amount){
        this.children.forEach((child) => {
            if(child.index > index){
                child.item.pushDown(amount);
            }
        });

        if(this.parent != null) this.parent.pushDownFrom(this.index, amount);
    }

    pullUpFrom(index, amount){
        this.children.forEach((child) => {
            if(child.index > index){
                child.item.pullUp(amount);
            }
        });
        
        if(this.parent != null) this.parent.pullUpFrom(this.index, amount);
    }

    getNumberOfOpenChildren(sum){
        this.children.forEach((child) => {
            if(child.item.visible){
                sum++;
                sum = child.getNumberOfOpenChildren(sum);
            } 
        });
        return sum;
    }

    closeAllChildren(){
        if(this.children.length > 0)
            this.children.forEach((child) => {
                child.item.visible = false; 
                child.item.open = false;
                child.item.setDefaultPosition();
                child.closeAllChildren();
            });
    }

    closeOpenSiblings(){
        this.parent.children.forEach((child) => {
            if(child.item.name != this.name && child.item.open){
                let amount = child.getNumberOfOpenChildren(0);
                child.closeAllChildren();
                this.parent.pullUpFrom(child.index, amount);
                child.item.open = false;
            }
        });
    }

    onClick(mouseCoordinates) {

        if(this.children.length > 0) this.children.forEach((child) => { child.onClick(mouseCoordinates) });

        if(this.item.isInsideBoundingBox(mouseCoordinates) && this.isClickable && this.item.visible){
            this.item.toggleOpen();

            this.selectedPlane.current = this.planeIndex;
            this.selectedPlane.onClick();
            
            if(this.item.open){
                this.closeOpenSiblings();
                this.toggleShowChildren();
                if(this.parent != null){
                    this.parent.pushDownFrom(this.index, this.children.length);
                } 
            } 
            else {
                let amount = this.getNumberOfOpenChildren(0);
                this.closeAllChildren();

                if(this.parent != null){
                    this.parent.pullUpFrom(this.index, amount);
                }
            }
        }
        
        
        if(this.item.teleportOpacity > 0.9){
            if(this.item.isInsideBoundingBoxTeleportButton(mouseCoordinates)){
                this.selectedPlane.current = this.planeIndex;
                this.selectedPlane.onClick();
            } 
        }
    }

    animate(){
        this.item.animate();
        
        if(this.children.length > 0)
         this.children.forEach((child) => { child.animate() });
    }

    clearAllChildrenTeleportButton(){
        this.item.teleportOpacity = 0;

        if(this.children.length != undefined)
        this.children.forEach( (child) => {
                child.item.teleportOpacity = 0;
                child.clearAllChildrenTeleportButton();
             });
    }

    clearAllTeleportButtons(){
        const upperMostParent = this.getUpperMostParent();
        upperMostParent.item.teleportOpacity = 0;

        upperMostParent.children.forEach( (child) => {
            child.clearAllChildrenTeleportButton();
        });
    }

    getUpperMostParent(){
        if(this.parent == null) 
            return this;
        else
            return this.parent.getUpperMostParent();
    }

    getTotalHeight(){
        let sumOfVisibleItems = 0;
        return this.getNumberOfOpenChildren(sumOfVisibleItems) * -this.item.closedYoffset;
    }

    mouseOver(mouseCoordinates){
        let mouseOver = false;

        if(this.item.teleportOpacity > 0.9 && this.item.visible){
            if (this.item.isInsideBoundingBoxTeleportButton(mouseCoordinates)){
                this.item.setTeleportButtonToHover(true);
                mouseOver = true;
            }else
                this.item.setTeleportButtonToHover(false);
        }

        if(this.item.visible && this.item.isInsideBoundingBox(mouseCoordinates)){
            this.clearAllTeleportButtons();
            this.item.text.color = 0xffffff;
            //this.item.teleportOpacity = 1; ----------------------------------------------------------------
            mouseOver = true;
        }else{
            this.item.text.color = 0xffffff;
        }

        if(this.children.length > 0)
        this.children.forEach((child) => {
                mouseOver = mouseOver || child.mouseOver(mouseCoordinates);
             });

        return mouseOver;
    }

    changeLanguage(language){
        this.item.changeLanguage(language);
        this.children.forEach( function(child){
			child.changeLanguage(language);
		})
    }
}

export {Entry};