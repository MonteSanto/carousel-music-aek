import * as THREE from 'three';
import { Text } from 'troika-three-text';
import { getTextureLoader } from './loaders.js';

class Plane {
  texturedPlane;
  playPlane;

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

  fatherPlane;
  motherPlane;

  test = 0;

  titleGR;
  descriptionGR;

  titleEN;
  descriptionEN;
  chapter;
  isChapter = false;
  isTitleVisible = true;
  maxOpacity = 1;

  constructor(exhibit, scene, angleInDegrees, height, musicButtons) {
    this.height = height;
    this.currentAngle = THREE.MathUtils.degToRad(angleInDegrees);
    this.currentAnglePlus180 = THREE.MathUtils.degToRad(angleInDegrees + 180);
    
    this.scene = scene;
    if(exhibit.path.includes("chapter")){
      this.chapter = new Text();
      this.chapter.text = exhibit.descriptionGR;
      this.chapter.font = 'fonts/jura/Jura-Regular.ttf';
      this.chapter.fontSize = this.fontSize;
      this.chapter.maxWidth = 0.30;
      this.chapter.sync();
      scene.add(this.chapter);

      this.isChapter = true;
    }
    else{
      getTextureLoader().load(exhibit.path, (texture) => {

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
        //this.geometry.translate(0, this.height, 1);
        this.texturedPlane = new THREE.Mesh(this.geometry, this.planeMaterial);

        this.fatherPlane = new THREE.Object3D();
        this.fatherPlane.add(this.texturedPlane);
        this.fatherPlane.translateY(this.height);
        this.fatherPlane.translateZ(1);

        this.motherPlane = new THREE.Object3D();
        this.motherPlane.add(this.fatherPlane); 

        this.scene.add(this.motherPlane);
      });

      this.promise = new Promise((resolve) => {
        getTextureLoader().load("icons/play.png", (texture) => {

          this.playMaterial = new THREE.MeshBasicMaterial({
              map: texture,
              transparent: true,
              opacity: this.buttonOpacity,
              alphaTest : 0.05,
              blending: THREE.CustomBlending,
              blendSrc: THREE.SrcAlphaFactor,
              blendDst: THREE.OneMinusSrcAlphaFactor,
              blendEquation: THREE.AddEquation
            });
      
          const planeWidth = texture.image.naturalWidth * this.playScale;
          const planeHeight = texture.image.naturalHeight * this.playScale * this.radius;
      
          //Textured Plane:
          this.playGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
          this.playGeometry.translate(0, this.height, 1);
          this.playPlane = new THREE.Mesh(this.playGeometry, this.playMaterial);
          this.playPlane.position.set(0,-0.22,0);
          this.playPlane.musicTrack = exhibit.sound;
          this.playPlane.buttonIcon = "play";
          this.scene.add(this.playPlane);
          musicButtons.push(this.playPlane);
        });
      });
    }

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

    if(this.texturedPlane){
      this.test += 0.001;
      this.texturedPlane.rotateZ(0.01);


      this.motherPlane.setRotationFromAxisAngle(this.yVector, this.currentAngle);
      this.playPlane.setRotationFromAxisAngle(this.yVector, this.currentAngle);
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

  showPlayButton(){
    this.buttonOpacity = 1;
    if(this.playMaterial) this.playMaterial.opacity = this.buttonOpacity;
  }

  hidePlayButton(){
    this.buttonOpacity = 0;
    if(this.playMaterial) this.playMaterial.opacity = this.buttonOpacity;
  }

  changeToPlaybutton(){
    getTextureLoader().load("icons/play.png", (texture) => {
      this.playMaterial = new THREE.MeshBasicMaterial({map: texture, transparent: true, opacity: this.buttonOpacity});
      this.playPlane.material = playMaterial;
      this.playPlane.buttonIcon = "play";
    });
  }

  changeToPauseButton(){
    getTextureLoader().load("icons/pause.png", (texture) => {
      let pauseMaterial = new THREE.MeshBasicMaterial({map: texture, transparent: true, opacity: this.buttonOpacity});
      this.playPlane.material = pauseMaterial;
      this.playPlane.buttonIcon = "pause";
    });
  }
}

export {Plane};