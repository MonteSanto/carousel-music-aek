
import * as THREE from 'three';

let loadManager, loader;


function getLoadManager(){
	if(loadManager == null){
		loadManager = new THREE.LoadingManager();
	}
	return loadManager;
}

function getTextureLoader(){
	if(loader == null){
		loader = new THREE.TextureLoader(getLoadManager());
	}
	return loader;
}

export {getLoadManager, getTextureLoader}