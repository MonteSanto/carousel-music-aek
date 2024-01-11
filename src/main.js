import * as THREE from 'three';
import {Carousel} from './carousel.js';
import { UI } from './UI.js';
import { PopUp } from './popUp.js';
import backgroundShader from './backgroundShader.js';
import { getTextureLoader } from './loaders.js';
import Animation from './animation.js';


let scene, renderer, camera, raycaster, skyDomeScene, skyDome, skyMaterial, ui, backgroundLogo, mouseCoordinates;
let carousel;
let distanceX = 0;
let speed = 0;

let spiraleThreadHeight = 1;
let itemsPerRevolution = 8;
let cameraDefaultZ = 1.58;
let cameraMaxZ = 3.5;

const scrollSpeed = 0.05;

let currentMouseX, previousMouseX;
let isMouseDown = false;
const clock = new THREE.Clock();

let previousDistanceX = 0;
let cameraPositionOffset = new THREE.Vector3(0, -0.05, 0);

let firstTouchId = null;

let idle = false;

let secondsToIdle = 6;
let idleTime = secondsToIdle; // starting the app in idle mode
let maxidleTimePause = 4
let idleTimePause = 0;

let hasKinetic = false;

let popUp;

let selectedPlane = {current: 5, onClick: function() {goToStart=true; popUp.close()} };

let zoomAnimationOut;
let zoomAnimationIn;

let goToStart = false;

let selectedExhibit;

let isMusicPaused = false;

let playMaterial = null;
let pauseMaterial = null;

function init(){
	raycaster = new THREE.Raycaster();
	raycaster.far = 0.8;
	mouseCoordinates = new THREE.Vector2();

	//STATS
	// stats = new Stats();
	// stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
	// document.body.appendChild( stats.dom );

	// SCENE
	scene = new THREE.Scene();

	// CAMERA
	camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = cameraMaxZ;

	scene.add(camera);

    // RENDERER
	let pixelRatio = window.devicePixelRatio

	renderer = new THREE.WebGLRenderer({
		antialias: true,
		powerPreference: 'high-performance',
	});

	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setPixelRatio(Math.min(pixelRatio, 2));
	renderer.autoClear = false;

	document.getElementById('canvas').appendChild(renderer.domElement);

	//SKY DOME
	skyDomeScene = new THREE.Scene();
	const highlightColor = new THREE.Color('#ebc334');

	let skyDomeRadius = 10.01;
	skyMaterial = new THREE.ShaderMaterial({
		uniforms: {
			skyRadius: { value: skyDomeRadius },
			env_c1: { value: new THREE.Color('#000000') },
			env_c2: { value: highlightColor },
			noiseOffset: { value: new THREE.Vector3(5, 5, 5) },
		},

		vertexShader: backgroundShader.vertexShader,
		fragmentShader: backgroundShader.fragmentShader,
		side: THREE.DoubleSide,
	});

	let sphereGeometry = new THREE.SphereGeometry(skyDomeRadius, 20, 20);
	skyDome = new THREE.Mesh(sphereGeometry, skyMaterial);
	skyDome.position.set(camera.position.x, camera.position.y, camera.position.z);
	scene.add(skyDome);

	//EVENT LISTENERS
    document.addEventListener('touchstart', (event) => {
		goToStart = false;
        //event.preventDefault();
		//onClick(event);
        if (firstTouchId === null && event.touches.length > 0) {
            // Save the identifier of the first touch
            firstTouchId = event.touches[0].identifier;
            // Handle the first touch here

            idleTime = 0;
            if(idle){
                zoomAnimationIn.play();
            }
            idle = false;
            isMouseDown = true;
        }
    }, false);
    
    document.addEventListener('touchmove', (event) => {
        //event.preventDefault();

        for (let i = 0; i < event.touches.length; i++) {
            const touch = event.touches[i];
    
            // Only handle the touch if it's the first touch
            if (touch.identifier === firstTouchId) {
                // Handle the movement of the first touch here
                idleTime = 0;
                idle = false;
                currentMouseX = touch.clientX
                ui.onOrthographicMouseMove();
				stopMusic();
            }
        }
    }, false);

    document.addEventListener('touchend', (event) => {
        //event.preventDefault();

        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];

            // Check if the first touch has ended
            if (touch.identifier === firstTouchId) {
                firstTouchId = null; // Reset the firstTouchId
                // Handle the end of the first touch here
                idleTime = 0;
                idle = false;
                isMouseDown = false
                previousMouseX = null;
                currentMouseX = null;
            }
        }
    }, false);
    //---------------------

	document.addEventListener('pointerdown', (event) => {
		goToStart = false;
		onClick(event);

		idleTime = 0;
		if(idle){
				
		zoomAnimationIn.play();
		}
		idle = false;
		//event.preventDefault();
		isMouseDown = true;
	});

	document.addEventListener('pointermove', (event) => {
    currentMouseX = event.clientX
	});

	document.addEventListener('pointerup', (event) => {

		idleTime = 0;
		idle = false;
		//event.preventDefault();
		isMouseDown = false
		previousMouseX = null;
		currentMouseX = null;
		stopMusic();
	});

	window.addEventListener( 'resize', onWindowResize, false );
	window.addEventListener('click', onClick);
	
	//POP UP
	popUp = new PopUp('#popup-exhibit', 'GR');

	//CAROUSEL
	carousel = new Carousel(scene, itemsPerRevolution, spiraleThreadHeight);
	
	//UI
	ui = new UI(popUp, selectedPlane);

	// ZOOM ANIMATION
	zoomAnimationOut = new Animation(0.5, (alpha) => {
		camera.position.z = lerp(cameraDefaultZ, cameraMaxZ, alpha);
		carousel.planes.forEach(plane => {
			plane.setOpacity(1-alpha);
        	plane.setRadiusVeryFast(alpha);
    	})
		ui.setTitleOpacity(alpha);
		ui.setStartButtonOpacity(1-alpha);
    	selectedPlane.current = 5;
		carousel.sound.stop();
	});

	zoomAnimationIn = new Animation(0.5, (alpha) => {
		camera.position.z = lerp(cameraMaxZ, cameraDefaultZ, alpha);
		carousel.planes.forEach(plane => {
			plane.setOpacity(alpha);
			plane.setRadiusVeryFast(1-alpha);
    	})
		ui.setTitleOpacity(1-alpha);
		ui.setStartButtonOpacity(alpha);
	})

	//BACKGROUND LOGO
	getTextureLoader().load( './images/logoTransparent.png', (texture) => {

		const geometry = new THREE.PlaneGeometry(2, 2); 

		const material = new THREE.MeshBasicMaterial({
			map: texture,
			side: THREE.DoubleSide,
			transparent: true,
			alphaTest : 0.05,
			blending: THREE.CustomBlending,
			blendSrc: THREE.SrcAlphaFactor,
			blendDst: THREE.OneMinusSrcAlphaFactor,
			blendEquation: THREE.AddEquation 
		});

		const mesh = new THREE.Mesh( geometry, material);
		mesh.position.set(0, 0);

		scene.add(mesh);
	});

	document.addEventListener('keydown', (event) => {
		if(event.code.startsWith("Digit")){
			selectedPlane.current = event.key;
		} 
	  }, false);
}

function onWindowResize() {
	ui.resizeAspectRatio();
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function onClick(event) {
	ui.onClick(event.clientX, event.clientY);

	mouseCoordinates.x = ( window.event.clientX / window.innerWidth ) * 2 - 1;
	mouseCoordinates.y = -( window.event.clientY / window.innerHeight ) * 2 + 1;
		
	raycaster.setFromCamera(mouseCoordinates, camera);

	let intersects = raycaster.intersectObjects(carousel.musicButtons);

	if (intersects.length > 0){
		let selectedMusic = intersects[0].object;
		handleMusicPlayerButton(selectedMusic);
	}

}

function animate() {
	// stats.begin();

	let deltaTime = clock.getElapsedTime();
	if(deltaTime > 1) deltaTime = 0;

	idleTime += deltaTime;

	zoomAnimationOut.animate(deltaTime);
	zoomAnimationIn.animate(deltaTime);

	selectedExhibit = carousel.planes[carousel.getCurrentObjectInViewIndex()];


	if(!idle && isIdleState()) {
		idle = true;
		zoomAnimationOut.play();
	}

	//IDLE
	if(idle) {
		popUp.close();
		idle = true;

		if(carousel.getCurrentObjectInViewIndex() == selectedPlane.current){
			idleTimePause += deltaTime;
			if(idleTimePause > maxidleTimePause){
				selectedPlane.current = selectedPlane.current + Math.floor(Math.random() * 10) - 5;

				if(selectedPlane.current < 0 ) selectedPlane.current = 0;
				else if(selectedPlane.current > carousel.planes.lenght - 1) selectedPlane.current = carousel.planes.length() - 1
				idleTimePause = 0;
			}
		}
	}

	//normal move
	if(isMouseDown){
		if(previousMouseX != null && currentMouseX != null) {
			distanceX =  currentMouseX - previousMouseX;
			
			if(distanceX == 0 && Math.abs(previousDistanceX) > 10){
				distanceX = previousDistanceX;
			}else {

				popUp.close();
				
				speed = distanceX / deltaTime;
				speed = speed * scrollSpeed;
				
				carousel.setAngle(distanceX * scrollSpeed);
			}
		}
		previousDistanceX = distanceX;
		previousMouseX = currentMouseX;
	}

	//kinetic move
	if(!isMouseDown && Math.abs(speed) > 0) {
		hasKinetic = true;

		if(Math.abs(speed) > 0.1) {
			carousel.setAngle(speed * deltaTime);
			speed *= 0.9;
		}else{
			speed = 0;
			hasKinetic = false;
		} 
	}

	if(!isMouseDown) {
		if(isIdleState()){
			carousel.goTowardsSpecificObject(deltaTime, selectedPlane.current);
		}else if(!goToStart){
			//POP UP OPEN CONDITIONS
			if(Math.abs(speed) == 0 && !idle && !hasKinetic) popUp.open();
			carousel.goTowardsAnObject(deltaTime);
		}

	}

	if(goToStart){
		let done = carousel.goTowardsSpecificObject(deltaTime, 0);

		if(done){
			goToStart = false;
		}
	} 

	// Camera zoom while rotated
	// if(Math.abs(speed) > 40) camera.position.z = cameraDefaultZ + 0.001 * Math.abs(speed);
	camera.position.y = spiraleThreadHeight * (carousel.getCurrentAngleInDeg() / 360) + cameraPositionOffset.y;
	
	clock.start();

	skyDome.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), carousel.getCurrentAngleInRad());

	carousel.showCurrentObjectDate();
	carousel.animate();
	ui.animate(deltaTime);

	popUp.update(deltaTime, selectedExhibit);


	renderer.clear();
	renderer.render(skyDomeScene, camera);

	renderer.clearDepth();
	renderer.render(scene, camera);
	renderer.clearDepth();
	renderer.render( ui.sceneOrtho, ui.cameraOrtho );

	requestAnimationFrame( animate );
	// stats.end();
}

function isIdleState() {
	return idleTime > secondsToIdle;
}

function lerp(a, b, alpha){
	return a + alpha * (b - a);
}

function handleMusicPlayerButton(selectedObject){
	console.log("click button play/pause");
	if(selectedObject.buttonIcon=="pause"){
		carousel.sound.pause();
		if(playMaterial == null){
			getTextureLoader().load("icons/play.png", (texture) => {
				playMaterial = new THREE.MeshBasicMaterial({map: texture, transparent: true, opacity: 1});
				selectedObject.material = playMaterial;
				selectedObject.buttonIcon = "play";
			  });
		}else{
			selectedObject.material = playMaterial;
			selectedObject.buttonIcon = "play";
		}

		isMusicPaused = true;
	}else{
		playMusic(selectedObject.musicTrack);
		if(pauseMaterial == null){
			getTextureLoader().load("icons/pause.png", (texture) => {
				pauseMaterial = new THREE.MeshBasicMaterial({map: texture, transparent: true, opacity: 1});
				selectedObject.material = pauseMaterial;
				selectedObject.buttonIcon = "pause";
			  });
		}else{
			selectedObject.material = pauseMaterial;
			selectedObject.buttonIcon = "pause";
		}
		  isMusicPaused = false;
	}
}

function playMusic(musicTrack){
	if(isMusicPaused){
		carousel.sound.play();
	}else{
		carousel.sound.stop();
		carousel.sound.changeMusicSource("sounds/" + musicTrack);
		carousel.sound.play();
	}
}

function stopMusic(){
	isMusicPaused = false;
	carousel.sound.stop();
}

init()
animate()