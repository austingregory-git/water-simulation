
var loader = new THREE.OBJLoader();
var texLoader = new THREE.TextureLoader();

async function start()
{
	var scene = new THREE.Scene();
	var bgScene = new THREE.Scene();
	var camera = new THREE.PerspectiveCamera(45, 1.5, 0.1, 1000 );
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
	
	var render = function() {
		requestAnimationFrame( render );
		// Renders skybox
		bgMesh.position.copy(camera.position);
		renderer.render(bgScene, camera);
		
		
		
		
		
		
		// Final Render
		renderer.render(scene, camera);
	}
	
	var controls = new THREE.OrbitControls(camera,ourCanvas);
	
	render();
}