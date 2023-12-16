import * as THREE from 'three';
import { Text } from 'troika-three-text';
import { getTextureLoader } from './loaders.js';

class Plane {

  texturedPlane;
  playPlane;

  emptyFlatPlane;
  emptyBentPlane;

  bentVertexPositions;

  geometry;
  playGeometry;
  scene;
  currentAngleRadians = 0;
  currentAngle = 0;
  currentAnglePlus180 = 0
  yVector = new THREE.Vector3(0, 1, 0);
  sphere;
  height;
  dateOffset = -0.2;
  dateTroika;
  radius = 1;
  selected = false;
  fontSizeTitle = 0.018;
  fontSize = 0.012;
  scale = 0.00015;
  playScale = 0.0005;
  planeMaterial;

  titleGR;
  descriptionGR;

  test = 0;

  titleEN;
  descriptionEN;
  isLoaded = false;
  chapter;
  isChapter = false;
  isTitleVisible = true;
  maxOpacity = 1;

  flatVertexPositions;
  flatVertexPositions;

  constructor(exhibit, scene, angleInDegrees, height, musicButtons) {
    this.height = height;
    this.currentAngle = THREE.MathUtils.degToRad(angleInDegrees);
    this.currentAnglePlus180 = THREE.MathUtils.degToRad(angleInDegrees + 180);
    
    this.scene = scene;
    if(exhibit.path.includes("chapter")){
      this.chapter = new Text();
      this.chapter.text = exhibit.descriptionGR;
      this.chapter.font = 'fonts/GFSDidot-Regular.ttf';
      this.chapter.fontSize = this.fontSize;
      this.chapter.maxWidth = 0.30;
      this.chapter.sync();
      scene.add(this.chapter);

      this.isChapter = true;
    }
    else{
      getTextureLoader().load(exhibit.path, (texture) => {
        if (exhibit.path_back != ""){
          getTextureLoader().load(exhibit.path_back, (texture_back) => {
            this.createDoubleSidedPlaneWithTexture(texture, texture_back);
          })
        }else{
          this.createPlaneWithTexture(texture);
        }
      });

      this.promise = new Promise(() => {
        getTextureLoader().load("icons/teleportButton.png", (texture) => {
          this.setupPlayPlane(texture, exhibit);
          musicButtons.push(this.playPlane);
        });
      });
    }

    //DATES TROIKA
    this.setupTroikaDate(exhibit);

    //DESCRIPTIONS
    this.setupDescriptions(exhibit);
  }

  createPlaneWithTexture(texture){
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

    const widthSegments = 30;
    const heightSegments = 30;

    //Textured Plane:
    this.geometry = new THREE.PlaneGeometry(planeWidth, planeHeight, widthSegments, heightSegments);
    this.geometry.translate(0, this.height, 1);
    this.texturedPlane = new THREE.Mesh(this.geometry, this.planeMaterial);

    //flat untextured plane:
    this.flatGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight, widthSegments, heightSegments);
    this.flatGeometry.translate(0, this.height, 1);
    this.flatVertexPositions = this.flatGeometry.attributes.position.array;
    this.emptyFlatPlane = new THREE.Mesh(this.flatGeometry, new THREE.MeshBasicMaterial());

    //bent untextured plane:
    this.bentGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight, widthSegments, heightSegments);
    this.bentGeometry.translate(0, this.height, 1);
    this.bentVertexPositions = this.bentGeometry.attributes.position.array;
    this.emptyBentPlane = new THREE.Mesh(this.bentGeometry, new THREE.MeshBasicMaterial());

    let newVertexPositions = [];
  
    for (let i = 0; i < this.bentVertexPositions.length; i += 3) {
      let exhibit_x = this.bentVertexPositions[i];
      let exhibit_y = this.bentVertexPositions[i + 1];
      let exhibit_z = this.bentVertexPositions[i + 2];

      let xz = new THREE.Vector2(exhibit_x, exhibit_z).normalize().multiplyScalar(this.radius);
      newVertexPositions.push(xz.x, exhibit_y, xz.y);
    }

    this.bentGeometry.setAttribute('position', new THREE.Float32BufferAttribute(newVertexPositions, 3));
    this.bentGeometry.attributes.position.needsUpdate = true;
    this.bentVertexPositions = this.bentGeometry.attributes.position.array;

    this.scene.add(this.texturedPlane);
    this.isLoaded = true;
  }

  createDoubleSidedPlaneWithTexture(frontTexture, backTexture){
    // Material for the front face
    this.planeMaterial = new THREE.MeshBasicMaterial({
      map: frontTexture,
      side: THREE.FrontSide,
      alphaTest: 0.05,
      blending: THREE.CustomBlending,
      blendSrc: THREE.SrcAlphaFactor,
      blendDst: THREE.OneMinusSrcAlphaFactor,
      blendEquation: THREE.AddEquation
    });

    // Material for the back face
    const backMaterial = new THREE.MeshBasicMaterial({
      map: backTexture,
      side: THREE.BackSide,
      alphaTest: 0.05,
      blending: THREE.CustomBlending,
      blendSrc: THREE.SrcAlphaFactor,
      blendDst: THREE.OneMinusSrcAlphaFactor,
      blendEquation: THREE.AddEquation
    });

    const planeWidth = frontTexture.image.naturalWidth * this.scale;
    const planeHeight = frontTexture.image.naturalHeight * this.scale * this.radius;

    const widthSegments = 30;
    const heightSegments = 30;

    //Textured Plane:
    this.geometry = new THREE.PlaneGeometry(planeWidth, planeHeight, widthSegments, heightSegments);
    this.geometry.translate(0, this.height, 1);
    this.texturedPlane = new THREE.Mesh(this.geometry, [this.planeMaterial, backMaterial]);

    //flat untextured plane:
    this.flatGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight, widthSegments, heightSegments);
    this.flatGeometry.translate(0, this.height, 1);
    this.flatVertexPositions = this.flatGeometry.attributes.position.array;
    this.emptyFlatPlane = new THREE.Mesh(this.flatGeometry, new THREE.MeshBasicMaterial());

    //bent untextured plane:
    this.bentGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight, widthSegments, heightSegments);
    this.bentGeometry.translate(0, this.height, 1);
    this.bentVertexPositions = this.bentGeometry.attributes.position.array;
    this.emptyBentPlane = new THREE.Mesh(this.bentGeometry, new THREE.MeshBasicMaterial());

    let newVertexPositions = [];
  
    for (let i = 0; i < this.bentVertexPositions.length; i += 3) {
      let exhibit_x = this.bentVertexPositions[i];
      let exhibit_y = this.bentVertexPositions[i + 1];
      let exhibit_z = this.bentVertexPositions[i + 2];

      let xz = new THREE.Vector2(exhibit_x, exhibit_z).normalize().multiplyScalar(this.radius);
      newVertexPositions.push(xz.x, exhibit_y, xz.y);
    }

    this.bentGeometry.setAttribute('position', new THREE.Float32BufferAttribute(newVertexPositions, 3));
    this.bentGeometry.attributes.position.needsUpdate = true;
    this.bentVertexPositions = this.bentGeometry.attributes.position.array;

    this.scene.add(this.texturedPlane);
    this.isLoaded = true;
  }



  setupPlayPlane(texture, exhibit) {
    const playMaterial = new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 1 });

    const planeWidth = texture.image.naturalWidth * this.playScale;
    const planeHeight = texture.image.naturalHeight * this.playScale * this.radius;

    // Play Plane:
    this.playGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
    this.playGeometry.translate(0, this.height, 1);
    this.playPlane = new THREE.Mesh(this.playGeometry, playMaterial);
    this.playPlane.position.set(0, -0.3, 0);
    this.playPlane.musicTrack = exhibit.sound;
    this.scene.add(this.playPlane);
  }

  setupTroikaDate(exhibit) {
    this.dateTroika = new Text();
    this.dateTroika.text = exhibit.titleGR;
    this.dateTroika.font = 'fonts/GFSDidot-Regular.ttf';
    this.dateTroika.fontSize = this.fontSizeTitle;
    this.dateTroika.maxWidth = 0.3;
    this.dateTroika.color = "#9b722f";
    this.dateTroika.sync();
    this.scene.add(this.dateTroika);
  }

  setupDescriptions(exhibit) {
    this.titleGR = exhibit.titleGR;
    this.descriptionGR = exhibit.descriptionGR;

    this.titleEN = exhibit.titleEN;
    this.descriptionEN = exhibit.descriptionEN;
  }

  setRadiusSlow(alpha){
    if(this.isLoaded){
        let newVertexPositions = [];
  
        for (let i = 0; i < this.flatVertexPositions.length; i += 3) {
            
          let fx = this.flatVertexPositions[i];
          let fy = this.flatVertexPositions[i + 1];
          let fz = this.flatVertexPositions[i + 2];

          let bx = this.bentVertexPositions[i];
          let by = this.bentVertexPositions[i + 1];
          let bz = this.bentVertexPositions[i + 2];
  
          let flatVertex = new THREE.Vector3(fx, fy, fz);
          let bendVertex = new THREE.Vector3(bx, by, bz);

          let inbetweenVertex = flatVertex.lerp(bendVertex, alpha);

          newVertexPositions.push(inbetweenVertex.x, inbetweenVertex.y, inbetweenVertex.z);
        }
  
        this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(newVertexPositions, 3));
      }
  }

  setRadiusFast(alpha) {
  if (this.isLoaded) {
    const vertexLength = this.flatVertexPositions.length;
    const newVertexPositions = new Float32Array(vertexLength);

    for (let i = 0; i < vertexLength; i += 3) {
      // lerp
      newVertexPositions[i] = this.flatVertexPositions[i] + alpha * (this.bentVertexPositions[i] - this.flatVertexPositions[i]);
      newVertexPositions[i + 1] = this.flatVertexPositions[i + 1] + alpha * (this.bentVertexPositions[i + 1] - this.flatVertexPositions[i + 1]);
      newVertexPositions[i + 2] = this.flatVertexPositions[i + 2] + alpha * (this.bentVertexPositions[i + 2] - this.flatVertexPositions[i + 2]);
    }

    this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(newVertexPositions, 3));
  }
}

setRadiusVeryFast(alpha) {
  if (this.isLoaded) {
    const size = this.flatVertexPositions.length;
    const geometryBuffer = this.geometry.getAttribute('position').array;

    let fPos, bPos;
    for (let i = 0; i < size; i += 3) {
      fPos = i; bPos = i;
      geometryBuffer[fPos] = this.flatVertexPositions[fPos] + alpha * (this.bentVertexPositions[bPos] - this.flatVertexPositions[fPos]);
      geometryBuffer[fPos + 1] = this.flatVertexPositions[fPos + 1] + alpha * (this.bentVertexPositions[bPos + 1] - this.flatVertexPositions[fPos + 1]);
      geometryBuffer[fPos + 2] = this.flatVertexPositions[fPos + 2] + alpha * (this.bentVertexPositions[bPos + 2] - this.flatVertexPositions[fPos + 2]);
    }

    this.geometry.attributes.position.needsUpdate = true;
  }
}


  setAngle(angleDegrees){
    this.currentAngle = this.currentAngle + THREE.MathUtils.degToRad(angleDegrees);
  }

  animate(){

    const currentPositionVector = new THREE.Vector3(Math.sin(this.currentAngle), 0, Math.cos(this.currentAngle));
    const distance = new THREE.Vector3(0, 0, 1).distanceTo(currentPositionVector);
    let opacity = 1 - ( 1 / (1 + Math.exp(-6.3 * (distance - 1.1))) ) ;

    if(this.isLoaded){
      this.texturedPlane.setRotationFromAxisAngle(this.yVector, this.currentAngle);
      //this.emptyFlatPlane.setRotationFromAxisAngle(this.yVector, this.currentAngle);
      //this.emptyFlatPlane.setRotationFromAxisAngle(this.yVector, this.currentAngle);
      this.playPlane.setRotationFromAxisAngle(this.yVector, this.currentAngle);

      this.planeMaterial.opacity = opacity;
    }

    if(this.chapter){
      this.chapter.material.opacity = opacity;

      const textWidth_chapter = this.chapter.geometry.boundingBox.max.x - this.chapter.geometry.boundingBox.min.x;

      ////
      let hv = new THREE.Vector3(-textWidth_chapter / 2, 0.07, 0);
      hv.applyAxisAngle(this.yVector, this.currentAngle);
      this.chapter.position.set(hv.x, 0.07, hv.z);
      this.chapter.setRotationFromAxisAngle(this.yVector, this.currentAngle);
      this.chapter.translateZ(this.radius);
      ////
      
      //this.chapter.position.set(-textWidth_chapter / 2, 0.07, 0);
      //this.chapter.setRotationFromAxisAngle(this.yVector, this.currentAngle);
      //this.chapter.translateOnAxis(currentPositionVector, this.radius);
      
      this.chapter.translateOnAxis(new THREE.Vector3(0, 1, 0), this.height)
      this.chapter.sync();
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
  
  select(){
    this.selected = true;
    //this.scale = 1.15;
    //this.dateTroika.color = 0xFFFFFF;
    //this.dateTroika.fontSizeTitle = this.fontSizeTitle + 0.05;
  }

  unselect(){
    this.selected = false;
    //this.scale = 1;
    //this.dateTroika.color = 0x888888;
    //this.dateTroika.fontSizeTitle = this.fontSizeTitle;
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

  flip() {
    if (this.isLoaded && this.texturedPlane) {
      this.texturedPlane.rotation.y += Math.PI;
    }
  }
}

export {Plane};