import * as THREE from 'three';
import {Carousel} from './carousel.js';
import { UI } from './UI.js';
import { PopUp } from './popUp.js';
import backgroundShader from './backgroundShader.js';
import { getTextureLoader } from './loaders.js';
import Animation from './animation.js';
import Stats from './stats.js';

let scene, renderer, camera, raycaster, skyDomeScene, skyDome, skyMaterial, ui, stats, mouseCoordinates;
let carousel;
let distanceX = 0;
let speed = 0;

let spiraleThreadHeight = 0;
let itemsPerRevolution = 21;
let cameraDefaultZ = 1.68;
let cameraMaxZ = 3;

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

let selectedVinyl = {current: 5, onClick: function() {goToStart=true; popUp.close()} };
let previousVinylInView = null;

let zoomAnimationOut;
let zoomAnimationIn;

let goToStart = false;
let showStats = false;
let isAnimating = false;

function init(){
	raycaster = new THREE.Raycaster();
	raycaster.far = 0.8;
	mouseCoordinates = new THREE.Vector2();

	//STATS
	stats = new Stats();
	stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom

	// SCENE
	scene = new THREE.Scene();

	// CAMERA
	camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
	camera.position.z = cameraDefaultZ;

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

	document.addEventListener('pointerdown', (event) => {
		goToStart = false;
		//onClick(event);

		idleTime = 0;
		// if(!ui.zoom.isOn){		
		// 	ui.zoom.clickAction();
		// }
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
	});

	window.addEventListener('keydown', onKeyDown, false);
	window.addEventListener( 'resize', onWindowResize, false );
	window.addEventListener('click', onClick);
	
	//POP UP
	popUp = new PopUp('#popup-exhibit', 'GR');

	//CAROUSEL
	carousel = new Carousel(scene, itemsPerRevolution, spiraleThreadHeight);
	
	//UI
	ui = new UI(popUp, (isOn) => {
		if(isOn) zoomAnimationIn.play();
		else zoomAnimationOut.play();
	});

	// ZOOM ANIMATION
	zoomAnimationOut = new Animation(0.5, (alpha) => {
		isAnimating = true;
		camera.position.z = lerp(cameraDefaultZ, cameraMaxZ, alpha);
		//carousel.vinyls.forEach(vinyl => vinyl.setOpacity(1 - alpha))
		selectedVinyl.current = 5;
		carousel.stopAllMusic();
		carousel.setPlayButtonsMaxOpacity(1 - alpha);
		carousel.setZoomOpacity(1 - alpha);
		carousel.setTitlesScale(1 + alpha);
	}, null, () => {
		isAnimating = false;
	});

	zoomAnimationIn = new Animation(0.5, (alpha) => {
		isAnimating = true;
		camera.position.z = lerp(cameraMaxZ, cameraDefaultZ, alpha);
		carousel.setPlayButtonsMaxOpacity(alpha);
		carousel.setZoomOpacity(alpha);
		carousel.setTitlesScale(2 - alpha);
	}, null, () => {
		isAnimating = false;
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
}

function onWindowResize() {
	ui.resizeAspectRatio();
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );
}

function onClick(event) {

	if(isAnimating) return;

	if(camera.position.z == cameraMaxZ){
		ui.zoom.clickAction();
		return;
	}

	ui.onClick(event.clientX, event.clientY);

	mouseCoordinates.x = ( window.event.clientX / window.innerWidth ) * 2 - 1;
	mouseCoordinates.y = -( window.event.clientY / window.innerHeight ) * 2 + 1;
		
	raycaster.setFromCamera(mouseCoordinates, camera);
	let intersects = raycaster.intersectObjects(scene.children);
	let vinylInView = carousel.getCurrentObjectInView()

	if (intersects.length > 0){
		if(intersects[0].object == vinylInView.playButton){
			vinylInView.togglePlayPause();
		}
	}
}

function addStats(){
	document.body.appendChild( stats.dom );
	showStats = true
}

function hideStats(){
	showStats = false;
	document.body.removeChild( stats.dom );
}

function onKeyDown(){
	var keyCode = window.event.code;
	
	if(keyCode == 'BracketLeft'){
		if (showStats) hideStats();
		else if (!showStats) addStats();
	}
}

function animate() {
	if (showStats) stats.begin();

	let deltaTime = clock.getElapsedTime();
	if(deltaTime > 1) deltaTime = 0;

	idleTime += deltaTime;

	zoomAnimationOut.animate(deltaTime);
	zoomAnimationIn.animate(deltaTime);

	let currentVinylInView = carousel.getCurrentObjectInView();

	if(currentVinylInView != previousVinylInView){
		carousel.stopAllMusic();
		previousVinylInView = currentVinylInView;
	}

	if(!idle && idleTime > secondsToIdle) {
		idle = true;
		if(!ui.zoom.isOn){
			ui.zoom.clickAction();
		}
	}

	//IDLE
	if(idle) {
		popUp.close();
		idle = true;

		if(carousel.getCurrentObjectInViewIndex() == selectedVinyl.current){
			idleTimePause += deltaTime;
			if(idleTimePause > maxidleTimePause){
				selectedVinyl.current = selectedVinyl.current + Math.floor(Math.random() * 10) - 5;

				if(selectedVinyl.current < 0 ) selectedVinyl.current = 0;
				else if(selectedVinyl.current > carousel.vinyls.length - 1) selectedVinyl.current = carousel.vinyls.length - 1
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
		if(idleTime > secondsToIdle){
			carousel.goTowardsSpecificObject(deltaTime, selectedVinyl.current);
		}else if(!goToStart){
			//POP UP OPEN CONDITIONS
			if(Math.abs(speed) == 0 && !idle && !hasKinetic){
				popUp.open();
			}
			carousel.goTowardsClosestObject(deltaTime);
		}
	}

	if(goToStart){
		let done = carousel.goTowardsSpecificObject(deltaTime, 0);

		if(done){
			goToStart = false;
		}
	} 

	camera.position.y = spiraleThreadHeight * (carousel.getCurrentAngleInDeg() / 360) + cameraPositionOffset.y;
	
	clock.start();

	skyDome.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), carousel.getCurrentAngleInRad());
	carousel.animate();
	ui.animate(deltaTime);

	carousel.showPlayButtonOfOnlyCurrentVinyl();

	renderer.clear();
	renderer.render(skyDomeScene, camera);

	renderer.clearDepth();
	renderer.render(scene, camera);
	renderer.clearDepth();
	renderer.render( ui.sceneOrtho, ui.cameraOrtho );

	requestAnimationFrame( animate );
	if (showStats) stats.end();
}

function lerp(a, b, alpha){
	return a + alpha * (b - a);
}

init()
animate()