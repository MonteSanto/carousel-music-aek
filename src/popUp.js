class PopUp{

    isOpening = false;
    isFullyOpen = false;

    isClosing = false;
    isFullyClosed = true;

    isAnimating = false;

    animationLength = 0.4;

    animationTimer = 0;

    query;

    object;

    language;

    closePromise = false;
    openPromise = false;

    constructor(querySelector, language){
        this.language  = language;
        this.query = document.querySelector(querySelector);
    }

    open(){

        if(this.hasDescription() && this.isFullyClosed){
            this.setText();

            this.openPromise = false;
            this.closePromise = false;

            this.query.classList.remove('slide-out');
            this.query.classList.add('slide-in');

            this.isOpening = true;
            this.isFullyOpen = false;
        
            this.isClosing = false;
            this.isFullyClosed = false;

            this.isAnimating = true;
            this.animationTimer = 0;

        } else {
            this.openPromise = true;
            this.closePromise = false;
        }
    }

    close(){

        if(this.isFullyOpen) {
            this.openPromise = false;
            this.closePromise = false;

            this.query.classList.remove('slide-in');
            this.query.classList.add('slide-out');

            this.isOpening = false;
            this.isFullyOpen = false;
        
            this.isClosing = true;
            this.isFullyClosed = false;

            this.isAnimating = true;
            this.animationTimer = 0;

        } else {
            this.openPromise = false;
            this.closePromise = true;
        }

    }

    setText(){
        let title = this.object.titleGR;
        let description = this.object.descriptionGR;

        if(this.language === 'EN'){
            title = this.object.titleEN;
            description = this.object.descriptionEN;
        }

        document.getElementById('popup-exhibit-description').innerHTML = '<p>' + description + ' \n' + '</p>';

    }

    setLanguage(language){
        this.language = language;
    }

    update(deltaTime, object){
        this.object = object;
        if( this.isAnimating ) {
            this.animationTimer += deltaTime;

            if (this.animationTimer >= this.animationLength){
                this.isAnimating = false;

                if(this.isClosing){
                    this.isClosing = false;
                    this.isFullyClosed = true;
                    
                    if(this.openPromise) this.open();
                } 

                if(this.isOpening){
                    this.isOpening = false;
                    this.isFullyOpen = true;

                    if(this.closePromise) this.close();
                }
            }
        }
    }

    hasDescription(){
        return (this.object && !this.object.isChapter && (this.object.descriptionGR != "" || this.object.descriptionGR != ""))
    }

}

export {PopUp};