
var loader = new THREE.OBJLoader();
var texLoader = new THREE.TextureLoader();

var refractionBuffer = new THREE.WebGLRenderTarget(1800, 1200);
var reflectionBuffer = new THREE.WebGLRenderTarget(1800, 1200);
refractionBuffer.texture.generateMipmaps = true;
reflectionBuffer.texture.generateMipmaps = true;

var axis = 'z';
var paused = false;
var camera;

var kirbyTorsoDummy;
var waddleDeeTorsoDummy;
//var kirbyArmDummy1;
//var kirbyArmDummy2;
var kirbyArmDummy;
var kirbyFootDummy1
var kirbyFootDummy2;

var ribbon;

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
	
	var waterWidth = 30;
	var waterLength = 30;
	
	var dudvMap = texLoader.load("images/waterDUDV.png");
	console.log(dudvMap);
	
	var waterUniforms = {
		isUnderwater: {value: 0},
		reflection: { type: 't', value: reflectionBuffer.texture },
		refraction: { type: 't', value: refractionBuffer.texture },
		dudvMap: { type: 't', value: dudvMap },
		hideWater: {value: 1},
		waterOffset: {value: 1}
	}
	
	var WaterMaterial = new THREE.ShaderMaterial( {
		fragmentShader: document.getElementById("WaterFragment").textContent,
		vertexShader: document.getElementById("WaterVertex").textContent,
		side: THREE.DoubleSide,
		uniforms: waterUniforms
	});
	
	var water = new THREE.Mesh(new THREE.PlaneGeometry(waterWidth,waterLength,1),WaterMaterial);
	water.position.y = -1;
	water.rotateX(Math.PI/2);
	
	scene.add(water);
	
	 var url = "Kirby_Face.png";
  var planeURL = "kirby64picnic.jpg";
  var waddleDeeURL = "Waddle_Dee_Face.png";
  var ribbonURL = "Ribbon_Face.png";

  var loader = new THREE.TextureLoader();
  var texture = loader.load(url);
  
  var loader = new THREE.TextureLoader();
  var planeTexture = loader.load(planeURL);
  
  var loader = new THREE.TextureLoader();
  var waddleDeeTexture = loader.load(waddleDeeURL);
  
  var loader = new THREE.TextureLoader();
  var ribbonTexture = loader.load(ribbonURL);

  // create a green cube
  var geometry = new THREE.BoxGeometry( 1, 1, 1 );
  var material = new THREE.MeshLambertMaterial( { map: texture } );
  var armMaterial = new THREE.MeshLambertMaterial({color: 0xE9967A});
  var footMaterial = new THREE.MeshLambertMaterial({color: 0xDC143C});
  var waddleDeeFaceMaterial = new THREE.MeshLambertMaterial( { map: waddleDeeTexture } );
  var waddleDeeMaterial = new THREE.MeshLambertMaterial({color: 0xCD853F});
  var sphere = new THREE.SphereGeometry(1);
  var plane = new THREE.PlaneGeometry(30, 30);
  var planeMaterial = new THREE.MeshLambertMaterial({map: planeTexture, side: THREE.DoubleSide});
  var ribbonMaterial = new THREE.MeshLambertMaterial( { map: ribbonTexture } );
  
  ribbon = new THREE.Mesh(geometry, ribbonMaterial);
  ribbon.position.set(5, 5, 5);
  ribbon.scale.set(1, 2, 1);
  
  scene.add(ribbon);
  
  // torsoDummy is parent of torso cube and shoulder dummy
  kirbyTorsoDummy = new THREE.Object3D();

  var torso = new THREE.Mesh( sphere, material );
  torso.scale.set(1, 1, 1);
  kirbyTorsoDummy.add(torso);
  
  kirbyArmDummy = new THREE.Object3D();
  kirbyTorsoDummy.add(kirbyArmDummy);
  
  torso.position.set(0, 0, 0);


  var arm1 = new THREE.Mesh( geometry, armMaterial );
  var arm2 = new THREE.Mesh( geometry, armMaterial );

  kirbyArmDummy.add(arm1);
  kirbyArmDummy.add(arm2);
  arm1.scale.set(0.5, 0.25, 0.25);
  arm2.scale.set(0.5, 0.25, 0.25);
  
  arm1.position.set(-1, 0.25, 0);
  arm2.position.set(1, 0.25, 0);

  kirbyFootDummy1 = new THREE.Object3D();
  kirbyFootDummy2 = new THREE.Object3D();
  kirbyTorsoDummy.add(kirbyFootDummy1);
  kirbyTorsoDummy.add(kirbyFootDummy2);

  var foot1 = new THREE.Mesh( geometry, footMaterial );
  var foot2 = new THREE.Mesh( geometry, footMaterial );
  kirbyFootDummy1.add(foot1);
  kirbyFootDummy2.add(foot2);
  foot1.scale.set(0.5, 0.25, 0.5);
  foot2.scale.set(0.5, 0.25, 0.5);

  foot1.position.set(-0.5, -1, 0);
  foot2.position.set(0.5, -1, 0);
  // add torso dummy to the scene
  scene.add( kirbyTorsoDummy );
  
  //add waddledee 
  
  waddleDeeTorsoDummy = new THREE.Object3D();
  
  var torso = new THREE.Mesh( sphere, waddleDeeFaceMaterial );
  torso.scale.set(1, 1, 1);
  waddleDeeTorsoDummy.add(torso);
  
  kirbyArmDummy = new THREE.Object3D();
  waddleDeeTorsoDummy.add(kirbyArmDummy);
  
  waddleDeeTorsoDummy.position.set(5, 0, 0);
  //torso.position.set(5, 0, 0);


  var arm1 = new THREE.Mesh( geometry, waddleDeeMaterial );
  var arm2 = new THREE.Mesh( geometry, waddleDeeMaterial );

  kirbyArmDummy.add(arm1);
  kirbyArmDummy.add(arm2);
  arm1.scale.set(0.5, 0.25, 0.25);
  arm2.scale.set(0.5, 0.25, 0.25);
  
  arm1.position.set(-1, 0.25, 0);
  arm2.position.set(1, 0.25, 0);

  kirbyFootDummy1 = new THREE.Object3D();
  kirbyFootDummy2 = new THREE.Object3D();
  waddleDeeTorsoDummy.add(kirbyFootDummy1);
  waddleDeeTorsoDummy.add(kirbyFootDummy2);

  var foot1 = new THREE.Mesh( geometry, waddleDeeMaterial );
  var foot2 = new THREE.Mesh( geometry, waddleDeeMaterial );
  kirbyFootDummy1.add(foot1);
  kirbyFootDummy2.add(foot2);
  foot1.scale.set(0.5, 0.25, 0.5);
  foot2.scale.set(0.5, 0.25, 0.5);

  foot1.position.set(-0.5, -1, 0);
  foot2.position.set(0.5, -1, 0);
  // add torso dummy to the scene
  scene.add( waddleDeeTorsoDummy );
	
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
	
	cube.position.x = 40;
	cube.position.y = 20;
	
	scene.add(cube);
	
	
	/*var light = new THREE.HemisphereLight( 0x0000ff, 0x00ff00, 0.3 ); 
	//scene.add(light);
	light = new THREE.DirectionalLight( 0xffffff, 0.5 );
	//light = new THREE.DirectionalLight( 0xffffff, 0.0 );
	light.position.x = -40;
	light.position.y = 30;
	light.position.z = -20;
	scene.add(light);*/
	
	/*var light = new THREE.PointLight(0xffffff, 1.0);
	light.position.set(2, 3, 5);
	scene.add(light);*/

	var light = new THREE.AmbientLight(0x555555);
	scene.add(light);
	
	console.log(sceneWithoutWater);
	console.log(scene);
	
	var upDownPlanes = [new THREE.Plane( new THREE.Vector3( 0, 1, 0 ), -1 ),new THREE.Plane( new THREE.Vector3( 0, - 1, 0 ), 1 )];
	
	  //texture.magFilter = THREE.NearestFilter;
  texture.magFilter = THREE.LinearFilter;
  //texture.minFilter = THREE.NearestFilter;
  texture.minFilter = THREE.LinearFilter;
  texture.wrapS = THREE.RepeatWrapping;
  //texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.x = -2;
  //texture.repeat.y = -1;
  
  //texture.magFilter = THREE.NearestFilter;
  waddleDeeTexture.magFilter = THREE.LinearFilter;
  //texture.minFilter = THREE.NearestFilter;
  waddleDeeTexture.magFilter = THREE.LinearFilter;
  
  waddleDeeTexture.wrapS = THREE.RepeatWrapping;
  //texture.wrapT = THREE.RepeatWrapping;
  waddleDeeTexture.repeat.x = -2;
  //texture.repeat.y = -1;
	
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
	
	var clock = new THREE.Clock(true);
	
	function animate() {
	  var time = Date.now()*0.0005;
	  ribbon.position.x = Math.cos(time)*10;
	  ribbon.position.z = Math.cos(time)*10;
  }
	
	var render = function() {
		requestAnimationFrame( render );
		// Renders skybox
		bgMesh.position.copy(camera.position);
		renderer.render(bgScene, camera);
		
		underwater = (camera.position.y < water.position.y) //&& (camera.position.x > water.position.x-waterWidth/2 && camera.position.x < water.position.x+waterWidth/2) && (camera.position.z > water.position.z-waterLength/2 && camera.position.z < water.position.z+waterLength/2);
		waterUniforms.isUnderwater.value = (underwater) ? 1 : 0;
		waterUniforms.waterOffset.value+=0.03*clock.getDelta();
		waterUniforms.waterOffset.value%=1;
		
		renderToBuffers();
		
		// Final Render
		renderer.render(scene, camera);
		animate();
	}
	
	var controls = new THREE.OrbitControls(camera,ourCanvas);
	
	render();
	
}
