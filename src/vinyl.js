import * as THREE from 'three';
import { Text } from 'troika-three-text';
import { getTextureLoader } from './loaders.js';
import {Sound} from './sound.js';

class Vinyl {
  vinylMesh;
  playButton;

  geometry;
  playGeometry;
  scene;
  currentAngleRadians = 0;
  currentAngle = 0;
  currentAnglePlus180 = 0
  yVector = new THREE.Vector3(0, 1, 0);
  height;
  dateOffset = -0.2;
  dateTroika;
  radius = 1;
  fontSizeTitle = 0.018;
  fontSize = 0.012;
  scale = 0.00015;
  playScale = 0.00015;
  planeMaterial;
  playMaterial;
  buttonOpacity = 0;

  isPlaying = false;

  fatherObject;
  motherObject;

  test = 0;

  titleGR;
  descriptionGR;

  titleEN;
  descriptionEN;
  chapter;
  isChapter = false;
  isTitleVisible = true;
  maxOpacity = 1;

  rotatePlane = false;

  constructor(exhibit, scene, angleInDegrees, height) {
    this.height = height;
    this.currentAngle = THREE.MathUtils.degToRad(angleInDegrees);
    this.currentAnglePlus180 = THREE.MathUtils.degToRad(angleInDegrees + 180);
    
    this.scene = scene;
	this.music = new Sound(exhibit.musicPath);

    getTextureLoader().load(exhibit.imagePath, (texture) => {

      this.planeMaterial = new THREE.MeshBasicMaterial({
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
  
      this.geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
      this.vinylMesh = new THREE.Mesh(this.geometry, this.planeMaterial);

      this.fatherObject = new THREE.Object3D();
      this.fatherObject.add(this.vinylMesh);
      this.fatherObject.translateY(this.height);
      this.fatherObject.translateZ(1);

      this.motherObject = new THREE.Object3D();
      this.motherObject.add(this.fatherObject); 

      this.scene.add(this.motherObject);
    });

    this.promise = new Promise((resolve) => {
      getTextureLoader().load("icons/play.png", (playTexture) => {
        getTextureLoader().load("icons/pause.png", (pauseTexture) => {
          this.playMaterial = new THREE.MeshBasicMaterial({
              map: playTexture,
              transparent: true,
              opacity: this.buttonOpacity,
              alphaTest : 0.05,
              blending: THREE.CustomBlending,
              blendSrc: THREE.SrcAlphaFactor,
              blendDst: THREE.OneMinusSrcAlphaFactor,
              blendEquation: THREE.AddEquation
            });

            this.pauseMaterial = new THREE.MeshBasicMaterial({
              map: pauseTexture,
              transparent: true,
              opacity: this.buttonOpacity,
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
          this.playButton = new THREE.Mesh(this.playGeometry, this.playMaterial);
          this.playButton.position.set(0,-0.22,0);
          this.scene.add(this.playButton);
        });
      });
    });
    

    //DATES TROIKA
    this.dateTroika = new Text();
    this.dateTroika.text = exhibit.titleGR;
    this.dateTroika.font = 'fonts/jura/Jura-Regular.ttf';
    this.dateTroika.fontSize = this.fontSizeTitle;
    this.dateTroika.maxWidth = 0.3;
    this.dateTroika.color = "#ffffff"
    this.dateTroika.sync();
    scene.add(this.dateTroika);

    //DESCRIPTIONS
    this.titleGR = exhibit.titleGR;
    this.descriptionGR = exhibit.descriptionGR;

    this.titleEN = exhibit.titleEN;
    this.descriptionEN = exhibit.descriptionEN;
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
      this.planeMaterial.opacity = opacity;
    }

    this.dateTroika.material.opacity = opacity * this.maxOpacity;

    const textWidth = this.dateTroika.geometry.boundingBox.max.x - this.dateTroika.geometry.boundingBox.min.x;

    this.dateTroika.position.set(-textWidth / 2, 0, 0);
    this.dateTroika.translateOnAxis(currentPositionVector, this.radius);
    this.dateTroika.translateOnAxis(new THREE.Vector3(0, 1, 0), this.height - this.dateOffset)
    this.dateTroika.sync();
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
    this.dateTroika.material.opacity = 0;
    this.dateTroika.sync();
  }

  showTitle(){
    this.isTitleVisible = true;
    this.dateTroika.material.opacity = 1;
    this.dateTroika.sync();
  }

  getPromise() {
    return this.promise;
  }

  setPlayButtonOpacity(alpha){
    if(this.playButton) this.playButton.material.opacity = alpha;
  }

  play(){
    if(this.playButton) this.playButton.material = this.pauseMaterial;
    this.isPlaying = true;
	this.music.play();
  }

  pause(){
    this.playButton.material = this.playMaterial;
    this.isPlaying = false;
	this.music.pause();
  }

  togglePlayPause(){
    if(this.isPlaying) this.pause();
    else this.play();
  }

  stop(){
	if(this.playButton) this.playButton.material = this.playMaterial;
    this.isPlaying = false;
	if(this.vinylMesh) this.vinylMesh.rotation.z = 0;
	this.music.stop();
  }

  setRotatePlane(rotatePlane){
    this.rotatePlane = rotatePlane;
  }
}

export {Vinyl};