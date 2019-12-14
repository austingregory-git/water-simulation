
var loader = new THREE.OBJLoader();
var texLoader = new THREE.TextureLoader();

var refractionBuffer = new THREE.WebGLRenderTarget(1800, 1200);
var reflectionBuffer = new THREE.WebGLRenderTarget(1800, 1200);
refractionBuffer.texture.generateMipmaps = true;
reflectionBuffer.texture.generateMipmaps = true;

async function start()
{
	var scene = new THREE.Scene();
	var sceneWithoutWater = new THREE.Scene();
	var bgScene = new THREE.Scene();
	
	var ourCanvas = document.getElementById('theCanvas');
	
	var renderer = new THREE.WebGLRenderer({canvas: ourCanvas});
	//renderer.setClearColor(0x000000);
	renderer.autoClearColor = false;
	
	var underwater = false;
	
	var camera = new THREE.PerspectiveCamera(45, 1.5, 0.1, 1000 );
	camera.position.x = 60;
	camera.position.y = 40;
	camera.position.z = 60;
	camera.lookAt(new THREE.Vector3(0, 0, 0));
	
	console.log(camera);
	
	var waterWidth = 200;
	var waterLength = 200;
	
	var waterUniforms = {
		isUnderwater: {value: 0},
		reflection: { type: 't', value: reflectionBuffer.texture },
		refraction: { type: 't', value: refractionBuffer.texture }
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
	
	 var renderToBuffers = function() {
		 var distance = 2 * (camera.position.y-water.position.y);
		//Switches to reflect
		camera.position.y-=distance;
		camera.rotation.x = -camera.rotation.x;
		bgMesh.position.copy(camera.position);
		renderer.setRenderTarget(refractionBuffer);
		renderer.render(bgScene, camera);
		renderer.render(sceneWithoutWater, camera);
		
		//Switches to refract
		camera.position.y+=distance
		camera.rotation.x = -camera.rotation.x;
		bgMesh.position.copy(camera.position);
		renderer.setRenderTarget(reflectionBuffer);
		renderer.render(bgScene, camera);
		renderer.render(sceneWithoutWater, camera);
		
		renderer.setRenderTarget(null);
	} 
	
	var render = function() {
		requestAnimationFrame( render );
		// Renders skybox
		bgMesh.position.copy(camera.position);
		renderer.render(bgScene, camera);
		
		underwater = (camera.position.y < water.position.y) && (camera.position.x > water.position.x-waterWidth/2 && camera.position.x < water.position.x+waterWidth/2) && (camera.position.z > water.position.z-waterLength/2 && camera.position.z < water.position.z+waterLength/2);
		waterUniforms.isUnderwater.value = (underwater) ? 1 : 0;
		
		renderToBuffers();
		
		// Final Render
		renderer.render(scene, camera);
	}
	
	var controls = new THREE.OrbitControls(camera,ourCanvas);
	
	render();
}