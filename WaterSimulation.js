
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
	camera.rotation.order = "YZX";
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
		refraction: { type: 't', value: refractionBuffer.texture },
		hideWater: {value: 1}
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
	
	var cube = new THREE.Mesh(new THREE.BoxGeometry(10,10,10), new THREE.MeshPhysicalMaterial( { color: 0x00ff00, emissive: 0x008800,roughness:0.80,metalness:.41}));
	
	cube.position.y = 20
	
	scene.add(cube);
	
	
	var light = new THREE.HemisphereLight( 0x0000ff, 0x00ff00, 0.3 ); 
	//scene.add(light);
	light = new THREE.DirectionalLight( 0xffffff, 0.5 );
	light.position.x = -40;
	light.position.y = 30;
	light.position.z = -20;
	scene.add(light);
	
	console.log(sceneWithoutWater);
	console.log(scene);
	
	var upDownPlanes = [new THREE.Plane( new THREE.Vector3( 0, 1, 0 ), -1 ),new THREE.Plane( new THREE.Vector3( 0, - 1, 0 ), 1 )];
	
	 var renderToBuffers = function() {
		var reflectPlane = new THREE.Plane( new THREE.Vector3( 0, (underwater) ? -1 : 1, 0 ), (underwater) ? 1 : -1 );
		var refractPlane = new THREE.Plane( new THREE.Vector3( 0, (underwater) ? 1 : -1, 0 ), (underwater) ? -1 : 1 );
		
		waterUniforms.hideWater.value=1;
		var distance = 2 * (camera.position.y-water.position.y);
		
		//Switches to reflect
		camera.position.y-=distance;
		camera.rotation.x = -camera.rotation.x;
		bgMesh.position.copy(camera.position);
		renderer.setRenderTarget(reflectionBuffer);
		renderer.render(bgScene, camera);
		renderer.clippingPlanes = [reflectPlane];
		renderer.render(scene, camera);
		
		//Switches to refract
		camera.position.y+=distance
		camera.rotation.x = -camera.rotation.x;
		bgMesh.position.copy(camera.position);
		renderer.setRenderTarget(refractionBuffer);
		renderer.render(bgScene, camera);
		renderer.clippingPlanes = [refractPlane];
		renderer.render(scene, camera);
		
		renderer.clippingPlanes = [new THREE.Plane( new THREE.Vector3( 0, 0, 0 ), 0 )];
		renderer.setRenderTarget(null);
		 waterUniforms.hideWater.value=0;
	} 
	
	var render = function() {
		requestAnimationFrame( render );
		// Renders skybox
		bgMesh.position.copy(camera.position);
		renderer.render(bgScene, camera);
		
		underwater = (camera.position.y < water.position.y) //&& (camera.position.x > water.position.x-waterWidth/2 && camera.position.x < water.position.x+waterWidth/2) && (camera.position.z > water.position.z-waterLength/2 && camera.position.z < water.position.z+waterLength/2);
		waterUniforms.isUnderwater.value = (underwater) ? 1 : 0;
		
		renderToBuffers();
		
		// Final Render
		renderer.render(scene, camera);
	}
	
	var controls = new THREE.OrbitControls(camera,ourCanvas);
	
	render();
}