
var loader = new THREE.OBJLoader();
var texLoader = new THREE.TextureLoader();

async function start()
{
	var waterWidth = 200;
	var waterLength = 200;
	var scene = new THREE.Scene();
	var bgScene = new THREE.Scene();
	var camera = new THREE.PerspectiveCamera(45, 1.5, 0.1, 10000 );
	camera.position.x = 60;
	camera.position.y = 40;
	camera.position.z = 60;
	camera.lookAt(new THREE.Vector3(0, 0, 0));
	var ourCanvas = document.getElementById('theCanvas');
	
	var renderer = new THREE.WebGLRenderer({canvas: ourCanvas});
	//renderer.setClearColor(0x000000);
	renderer.autoClearColor = false;
	
	var skyboxTexture = texLoader.load("images/skybox.jpg");
	skyboxTexture.magFilter = THREE.LinearFilter;
	skyboxTexture.minFilter = THREE.LinearFilter;
	
	var skyboxMaterial = new THREE.ShaderMaterial({
		fragmentShader: THREE.ShaderLib.equirect.fragmentShader,
		vertexShader: THREE.ShaderLib.equirect.vertexShader,
		uniforms: THREE.ShaderLib.equirect.uniforms,
		depthWrite:false,
		side: THREE.BackSide,
	});
	skyboxMaterial.uniforms.tEquirect.value = skyboxTexture;
	
	var bgMesh = new THREE.Mesh(new THREE.BoxBufferGeometry(2,2,2), skyboxMaterial);
	
	bgScene.add(bgMesh);
	
	var waterUniforms = {
		isUnderwater: {value: 0}
	}
	
	var WaterMaterial = new THREE.ShaderMaterial( {
		fragmentShader: document.getElementById("WaterFragment").textContent,
		vertexShader: document.getElementById("WaterVertex").textContent,
		side: THREE.DoubleSide,
		uniforms: waterUniforms
	});
	
	var water = new THREE.Mesh(new THREE.PlaneGeometry(waterWidth,waterLength,1),WaterMaterial);
	water.position.y = 0;
	water.rotateX(Math.PI/2);
	
	scene.add(water);
	console.log(water);
	
	var underwater = false;
	
	var render = function() {
		requestAnimationFrame( render );
		// Renders skybox
		bgMesh.position.copy(camera.position);
		renderer.render(bgScene, camera);
		
		underwater = (camera.position.y < water.position.y) && (camera.position.x > water.position.x-waterWidth/2 && camera.position.x < water.position.x+waterWidth/2) && (camera.position.z > water.position.z-waterLength/2 && camera.position.z < water.position.z+waterLength/2);
		waterUniforms.isUnderwater.value = (underwater) ? 1 : 0;
		
		
		console.log(underwater);
		// Final Render
		renderer.render(scene, camera);
	}
	
	var controls = new THREE.OrbitControls(camera,ourCanvas);
	
	render();
}