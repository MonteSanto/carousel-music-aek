
class Sound{

    source;
    sound;

    constructor(source){
        this.createSound(source, 0.5, false);
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
                    var progress = (self.sound.seek() / self.sound.duration());
    
                    console.log('Progress:', progress.toFixed(2));
            
                    if (self.sound.playing() === false) {
                        clearInterval(progressInterval);
                    }
                }, 1000);
            },
            onpause: function() {
                console.log('Audio is paused');
            },
            onstop: function() {
                console.log('Audio is stopped');
            }
        });
    }

    changeMusicSource(source) {
        this.sound.unload();
        this.createSound(source, 0.5, false);
    }

    play(){
        this.sound.play();
    }

    pause(){
        this.sound.pause();
    }

    stop(){
        this.sound.stop();   
    }

    isMusicPlaying() {
        return this.sound && this.sound.playing();
    }
}

export { Sound };