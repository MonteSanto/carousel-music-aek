
class Sound{

    source;
    sound;
    isPlaying = false;

    constructor(source){
        //this.createSound(source, 0.5, false);
        this.source = source;
    }

    createSound(source, volume, loop){
        var self = this;
        this.sound = new Howl({
            src: [source],
            volume: volume,
            loop: loop,
            onplay: function() {
                console.log('Audio is playing');
                
                var progressInterval = setInterval(function() {
                    if (self.sound.playing() === false) {
                        clearInterval(progressInterval);
                    }
                }, 1000);
            },
            onpause: function() {
                //console.log('Audio is paused');
            },
            onstop: function() {
                //console.log('Audio is stopped');
                this.sound.unload();
            }
        });
    }

    changeMusicSource(source) {
        this.sound.unload();
        this.createSound(source, 0.5, false);
    }

    play(){
        this.createSound(this.source, 0.5, false);
        this.sound.play();
    }

    pause(){
        if(this.sound) this.sound.pause();
    }

    stop(){
        if(this.sound) this.sound.stop();   
    }

    isMusicPlaying() {
        if(this.sound){
            return this.sound && this.sound.playing();
        }
    }
}

export { Sound };