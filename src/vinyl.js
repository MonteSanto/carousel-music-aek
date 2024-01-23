import * as THREE from 'three';
import { Text } from 'troika-three-text';
import { getTextureLoader } from './loaders.js';
import {Sound} from './sound.js';

class Vinyl {
  vinylMesh;
  playButton;

  playGeometry;
  currentAngleRadians = 0;
  currentAngle = 0;
  currentAnglePlus180 = 0
  yVector = new THREE.Vector3(0, 1, 0);
  height;
  dateOffset = -0.19;
  titleTroika;
  radius = 1;
  fontSizeTitle = 0.018;
  fontSizeTitle2 = 0.015;
  fontSizeTitle3 = 0.012;
  fontSize = 0.012;
  scale = 0.000095;
  playScale = 0.00010;
  vinylMaterial;
  playButtonMaterial;
  playTexture;
  pauseTexture;
  buttonOpacity = 0;

  isPlaying = false;

  fatherObject;
  motherObject;
  titleObject;

  titleGR;
  title2;
  title3;

  titleEN;
  descriptionEN;
  isTitleVisible = true;
  maxOpacity = 1;
  maxSecondaryTitleOpacity = 1;
  maxOpacityTime = 1;
  playButtonMaxOpacity = 1;
  titleScale = 1;

  constructor(exhibit, scene, angleInDegrees, height) {
    this.height = height;
    this.currentAngle = THREE.MathUtils.degToRad(angleInDegrees);
    this.currentAnglePlus180 = THREE.MathUtils.degToRad(angleInDegrees + 180);
    
	  this.music = new Sound(exhibit.musicPath);

    getTextureLoader().load(exhibit.imagePath, (texture) => {
		this.vinylMaterial = new THREE.MeshBasicMaterial({
			map: texture,
			side: THREE.DoubleSide,
			transparent: true,
			alphaTest : 0.05,
			blending: THREE.CustomBlending,
			blendSrc: THREE.SrcAlphaFactor,
			blendDst: THREE.OneMinusSrcAlphaFactor,
			blendEquation: THREE.AddEquation
		});
	
		const planeWidth = texture.image.naturalWidth * this.scale;
		const planeHeight = texture.image.naturalHeight * this.scale * this.radius;
	
		let geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
		this.vinylMesh = new THREE.Mesh(geometry, this.vinylMaterial);

		this.fatherObject = new THREE.Object3D();
		this.fatherObject.add(this.vinylMesh);
		this.fatherObject.translateY(this.height);
		this.fatherObject.translateZ(1);

		this.motherObject = new THREE.Object3D();
		this.motherObject.add(this.fatherObject); 

		scene.add(this.motherObject);
    });

    getTextureLoader().load("icons/play.png", (playTexture) => {
      getTextureLoader().load("icons/pause.png", (pauseTexture) => {
        this.playTexture = playTexture;
        this.pauseTexture = pauseTexture;

        this.playButtonMaterial = new THREE.MeshBasicMaterial({
          map: playTexture,
          transparent: this.playTexture,
          opacity: this.playButtonMaxOpacity,
          alphaTest : 0.05,
          blending: THREE.CustomBlending,
          blendSrc: THREE.SrcAlphaFactor,
          blendDst: THREE.OneMinusSrcAlphaFactor,
          blendEquation: THREE.AddEquation
        });
      
        const planeWidth = playTexture.image.naturalWidth * this.playScale;
        const planeHeight = playTexture.image.naturalHeight * this.playScale * this.radius;
      
        this.playGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
        this.playGeometry.translate(0, this.height, 1);
        this.playButton = new THREE.Mesh(this.playGeometry, this.playButtonMaterial);
        this.playButton.position.set(0, -0.22, 0);

        scene.add(this.playButton);
      });
    });

    this.titleObject = new THREE.Object3D();

    //TITLE TROIKA
    this.titleTroika = new Text();
    this.titleTroika.text = exhibit.titleGR;
    this.titleTroika.font = 'fonts/jura/Jura-Regular.ttf';
    this.titleTroika.fontSize = this.fontSizeTitle;
    this.titleTroika.maxWidth = 0.5;
    this.titleTroika.color = "#ffffff"
    this.titleTroika.sync(() => {
      const textWidth = this.titleTroika.geometry.boundingBox.max.x - this.titleTroika.geometry.boundingBox.min.x;
      this.titleTroika.position.set(-textWidth / 2, -this.dateOffset, 0);
    });
    this.titleObject.add(this.titleTroika);


    //TITLE TROIKA
    this.titleTroika2 = new Text();
    this.titleTroika2.text = exhibit.title2;
    this.titleTroika2.font = 'fonts/jura/Jura-Regular.ttf';
    this.titleTroika2.fontSize = this.fontSizeTitle2;
    this.titleTroika2.maxWidth = 0.3;
    this.titleTroika2.color = "#ffffff"
    this.titleTroika2.sync(() => {
      const textWidth = this.titleTroika2.geometry.boundingBox.max.x - this.titleTroika2.geometry.boundingBox.min.x;
      this.titleTroika2.position.set(-textWidth / 2, -this.dateOffset - 0.025, 0);
    });
    this.titleObject.add(this.titleTroika2);

    //TITLE TROIKA
    this.titleTroika3 = new Text();
    this.titleTroika3.text = exhibit.title3;
    this.titleTroika3.font = 'fonts/jura/Jura-Regular.ttf';
    this.titleTroika3.fontSize = this.fontSizeTitle3;
    this.titleTroika3.maxWidth = 0.3;
    this.titleTroika3.color = "#ffffff"
    this.titleTroika3.sync(() => {
      const textWidth = this.titleTroika3.geometry.boundingBox.max.x - this.titleTroika3.geometry.boundingBox.min.x;
      this.titleTroika3.position.set(-textWidth / 2, -this.dateOffset - 0.05, 0);
    });
    this.titleObject.add(this.titleTroika3);

    scene.add(this.titleObject);

    //playTime TROIKA
    this.playTime = new Text();
    this.playTime.text = "00:00 / 00:00";
    this.playTime.font = 'fonts/jura/Jura-Regular.ttf';
    this.playTime.fontSize = 0.013;
    this.playTime.maxWidth = 0.10;
    this.playTime.color = "#ffffff"
    this.playTime.sync();
    scene.add(this.playTime);

    //DESCRIPTIONS
    this.titleGR = exhibit.titleGR;

    this.titleEN = exhibit.titleEN;
    this.title2 = exhibit.title2;
    this.title3 = exhibit.title3;
  }

  setAngle(angleDegrees){
    this.currentAngle = this.currentAngle + THREE.MathUtils.degToRad(angleDegrees);
  }

  animate(){
    const currentPositionVector = new THREE.Vector3(Math.sin(this.currentAngle), 0, Math.cos(this.currentAngle));
    const distance = new THREE.Vector3(0, 0, 1).distanceTo(currentPositionVector);
    let opacity = 1 - ( 1 / (1 + Math.exp(-6.3 * (distance - 1.1))) ) ;

    if(this.vinylMesh){

      if(this.isPlaying){
        this.vinylMesh.rotateZ(-0.01);
      }

      this.motherObject.setRotationFromAxisAngle(this.yVector, this.currentAngle);
      if(this.playButton) this.playButton.setRotationFromAxisAngle(this.yVector, this.currentAngle);
      this.vinylMaterial.opacity = opacity;
    }

    //TITLE
    this.titleTroika.material.opacity = opacity * this.maxOpacity;
    this.titleTroika.fontSize = this.fontSizeTitle * this.titleScale;
    this.titleTroika.sync();

    //TITLE 2
    this.titleTroika2.material.opacity = opacity * this.maxSecondaryTitleOpacity;
    this.titleTroika2.fontSize = this.fontSizeTitle2 * this.titleScale;
    this.titleTroika2.sync();

    //TITLE 3
    this.titleTroika3.material.opacity = opacity * this.maxSecondaryTitleOpacity;
    this.titleTroika3.fontSize = this.fontSizeTitle3 * this.titleScale;
    this.titleTroika3.sync();
    
    this.titleObject.position.set(0, 0, 0);
    this.titleObject.translateOnAxis(currentPositionVector, this.radius);
    this.titleTroika.translateOnAxis(new THREE.Vector3(0, 1, 0), this.height);

    //TIME
    let duration = this.toMinSec(this.music.sound.duration());
    let seek =  this.toMinSec(this.music.sound.seek());
    this.playTime.text = seek + ' / ' + duration;

    this.playTime.material.opacity = opacity * this.maxOpacityTime;
    const playTimeTextWidth = this.playTime.geometry.boundingBox.max.x - this.playTime.geometry.boundingBox.min.x;

    this.playTime.position.set(-playTimeTextWidth / 2, 0, 0);
    this.playTime.translateOnAxis(currentPositionVector, this.radius);
    this.playTime.translateOnAxis(new THREE.Vector3(0, 1, 0), this.height - 0.14)
    this.playTime.sync();
  }

  toMinSec(seconds){
	let m = Math.floor(seconds / 60)
	let s = Math.round(seconds % 60)

	if (m < 10) m = '0' + m;
	if (s < 10) s = '0' + s;

	return '' + m + ':' + s	
  }

  getCurrentAngleInDeg(){
    return THREE.MathUtils.radToDeg(this.currentAngle);
  }

  getCurrentAngleInRad(){
    return this.currentAngle;
  }

  setOpacity(alpha){
    this.maxOpacity = alpha;
  }

  hideTitle(){
    this.isTitleVisible = false;
    this.titleTroika.material.opacity = 0;
    this.titleTroika.sync();
  }

  showTitle(){
    this.isTitleVisible = true;
    this.titleTroika.material.opacity = 1;
    this.titleTroika.sync();
  }

  setTimeOpacity(alpha){
    this.maxOpacityTime = alpha;
    this.playTime.material.opacity = alpha;
    this.playTime.sync();
  }

  setPlayButtonOpacity(alpha){
    if(this.playButton) this.playButton.material.opacity = alpha;
  }

  setPlayButtonMaxOpacity(alpha){
    this.playButtonMaxOpacity = alpha;
  }

  showPlayButton(){
    if(this.playButton) this.playButton.material.opacity = this.playButtonMaxOpacity;
  }

  hidePlayButton(){
    if(this.playButton) this.playButton.material.opacity = 0;
  }

  play(){
    if(this.playButton) this.playButton.material.map = this.pauseTexture;
    this.isPlaying = true;
	  this.music.play();
  }

  pause(){
    if(this.playButton) this.playButton.material.map = this.playTexture;
    this.isPlaying = false;
	  this.music.pause();
  }

  togglePlayPause(){
    if(this.isPlaying) this.pause();
    else this.play();
  }

  stop(){
    if(this.playButton) this.playButton.material = this.playButtonMaterial;
    this.isPlaying = false;
    if(this.vinylMesh) this.vinylMesh.rotation.z = 0;
    this.music.stop();
  }

  setTitleScale(scale){
	this.titleScale = scale;
  }

  setSecondaryTitlesOpacity(alpha){
    this.maxSecondaryTitleOpacity = alpha;
    this.titleTroika2.material.opacity = alpha;
    this.titleTroika3.material.opacity = alpha;
    this.titleTroika2.sync();
    this.titleTroika3.sync();
  }

  setRotationOfFirstTitle(alpha){
    const textWidth = this.titleTroika.geometry.boundingBox.max.x - this.titleTroika.geometry.boundingBox.min.x;
    this.titleTroika.position.set((-textWidth / 2) * (1 - alpha), -this.dateOffset, 0);
    this.titleTroika.setRotationFromAxisAngle(new THREE.Vector3(0, 0, 1), (Math.PI / 4) * alpha);
  }

}

export {Vinyl};