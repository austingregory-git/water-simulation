//
// Skybox using Three.js.
//
				  
var imageNames = [
                  "Stars.jpg",
                  "Stars.jpg",
                  "Stars.jpg",
                  "Stars.jpg",
                  "Stars.jpg",
                  "Stars.jpg"
                  ];
				  

var axis = 'z';
var paused = false;
var camera;

var kirbyTorsoDummy;
var waddleDeeTorsoDummy;
var kirbyArmDummy;
var kirbyFootDummy1
var kirbyFootDummy2;

var ribbon;

var refractionBuffer = new THREE.WebGLRenderTarget(1800, 1200);
var reflectionBuffer = new THREE.WebGLRenderTarget(1800, 1200);
refractionBuffer.texture.generateMipmaps = true;
reflectionBuffer.texture.generateMipmaps = true;

var gl;
var clipPlane;




//translate keypress events to strings
//from http://javascript.info/tutorial/keyboard-events
function getChar(event) {
if (event.which == null) {
 return String.fromCharCode(event.keyCode) // IE
} else if (event.which!=0 && event.charCode!=0) {
 return String.fromCharCode(event.which)   // the rest
} else {
 return null // special key
}
}

function cameraControl(c, ch)
{
  var distance = c.position.length();
  var q, q2;

  switch (ch)
  {
  // camera controls
  case 'w':
    c.translateZ(-0.1);
    return true;
  case 'a':
    c.translateX(-0.1);
    return true;
  case 's':
    c.translateZ(0.1);
    return true;
  case 'd':
    c.translateX(0.1);
    return true;
  case 'r':
    c.translateY(0.1);
    return true;
  case 'f':
    c.translateY(-0.1);
    return true;
  case 'j':
    // need to do extrinsic rotation about world y axis, so multiply camera's quaternion
    // on left
    q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0),  5 * Math.PI / 180);
    q2 = new THREE.Quaternion().copy(c.quaternion);
    c.quaternion.copy(q).multiply(q2);
    return true;
  case 'l':
    q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0),  -5 * Math.PI / 180);
    q2 = new THREE.Quaternion().copy(c.quaternion);
    c.quaternion.copy(q).multiply(q2);
    return true;
  case 'i':
    // intrinsic rotation about camera's x-axis
    c.rotateX(5 * Math.PI / 180);
    return true;
  case 'k':
    c.rotateX(-5 * Math.PI / 180);
    return true;
  case 'O':
    c.lookAt(new THREE.Vector3(0, 0, 0));
    return true;
  case 'S':
    c.fov = Math.min(80, c.fov + 5);
    c.updateProjectionMatrix();
    return true;
  case 'W':
    c.fov = Math.max(5, c.fov  - 5);
    c.updateProjectionMatrix();
    return true;

    // alternates for arrow keys
  case 'J':
    //this.orbitLeft(5, distance)
    c.translateZ(-distance);
    q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0),  5 * Math.PI / 180);
    q2 = new THREE.Quaternion().copy(c.quaternion);
    c.quaternion.copy(q).multiply(q2);
    c.translateZ(distance);
    return true;
  case 'L':
    //this.orbitRight(5, distance)
    c.translateZ(-distance);
    q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0),  -5 * Math.PI / 180);
    q2 = new THREE.Quaternion().copy(c.quaternion);
    c.quaternion.copy(q).multiply(q2);
    c.translateZ(distance);
    return true;
  case 'I':
    //this.orbitUp(5, distance)
    c.translateZ(-distance);
    c.rotateX(-5 * Math.PI / 180);
    c.translateZ(distance);
    return true;
  case 'K':
    //this.orbitDown(5, distance)
    c.translateZ(-distance);
    c.rotateX(5 * Math.PI / 180);
    c.translateZ(distance);
    return true;
	
	case '1':
    //torsoDummy.rotation.y += 15 * Math.PI / 180;
    kirbyTorsoDummy.rotateY(15 * Math.PI / 180);
    break;
  case '2':
    kirbyTorsoDummy.rotateY(-15 * Math.PI / 180);
    break;
  case '3':
    //shoulderDummy.rotation.x -= 15 * Math.PI / 180;
    kirbyFootDummy1.rotateX(-15 * Math.PI / 180);
    break;
  case '4':
    kirbyFootDummy2.rotateX(15 * Math.PI / 180);
    break;
  case '5':
    //armDummy.rotation.x -= 15 * Math.PI / 180;
    kirbyArmDummy.rotateX(-15 * Math.PI / 180);
    break;
	
    default:
      return;
  }
  return false;
}

function handleKeyPress(event)
{
  var ch = getChar(event);
  if (cameraControl(camera, ch)) return;
}

function start()
{ 

  //theModel = await loadOBJPromise(modelFilename);
  
  var ourCanvas = document.getElementById('theCanvas');
  var renderer = new THREE.WebGLRenderer({canvas: ourCanvas});
  
  //var clipPlaneLocation = gl.getUniformLocation(clipPlane, "clipPlane");
  //gl.useProgram(clipPlane);
  //gl.uniform4f(clipPlaneLocation, 0.0, -1.0, 0.0, 15.0);
  
  
  window.onkeypress = handleKeyPress;
  
  var underwater = false;
  
  var scene = new THREE.Scene();
  var sceneWithoutWater = new THREE.Scene();
  var bgScene = new THREE.Scene();
  
  camera = new THREE.PerspectiveCamera( 45, 1.5, 0.1, 1000 );
  camera.position.x = 0;
  camera.position.y = 5;
  camera.position.z = 20;
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  // load the six images
  var ourCubeMap = new THREE.CubeTextureLoader().load( imageNames );

  // this is too easy, don't need a mesh or anything
  scene.background = ourCubeMap;

  var url = "Kirby_Face.png";
  var planeURL = "DuDvMap.png";
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
  
  /*var loader = new THREE.ObjectLoader();
  loader.load(modelFilename, function(obj) {
	  scene.add(obj);
  });*/
  
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
  water.position.y = -1;
  water.rotateX(Math.PI/2);
  
  scene.add(water);
  

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

  var floor = new THREE.Mesh(plane, planeMaterial);
  floor.rotation.x = THREE.Math.degToRad(90);
  floor.position.set(0, -1, 0);
  
  //scene.add(floor);
  
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


  var light = new THREE.PointLight(0xffffff, 1.0);
  light.position.set(2, 3, 5);
  scene.add(light);

  light = new THREE.AmbientLight(0x555555);
  scene.add(light);
  
  //texture.magFilter = THREE.NearestFilter;
  texture.magFilter = THREE.LinearFilter;
  //texture.minFilter = THREE.NearestFilter;
  texture.minFilter = THREE.LinearFilter;
  texture.wrapS = THREE.RepeatWrapping;
  //texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.x = -2;
  //texture.repeat.y = -1;
  
  //texture.magFilter = THREE.NearestFilter;
  planeTexture.magFilter = THREE.LinearFilter;
  //texture.minFilter = THREE.NearestFilter;
  planeTexture.magFilter = THREE.LinearFilter;
  
  //vertexBuffer = createAndLoadBuffer(theModel.vertices);
  
  //texture.magFilter = THREE.NearestFilter;
  waddleDeeTexture.magFilter = THREE.LinearFilter;
  //texture.minFilter = THREE.NearestFilter;
  waddleDeeTexture.magFilter = THREE.LinearFilter;
  
  waddleDeeTexture.wrapS = THREE.RepeatWrapping;
  //texture.wrapT = THREE.RepeatWrapping;
  waddleDeeTexture.repeat.x = -2;
  //texture.repeat.y = -1;
  
  var renderToBuffers = function() {
		 var distance = 2 * (camera.position.y-water.position.y);
		//Switches to reflect
		camera.position.y-=distance;
		camera.rotation.x = -camera.rotation.x;
		//bgMesh.position.copy(camera.position);
		renderer.setRenderTarget(refractionBuffer);
		renderer.render(bgScene, camera);
		renderer.render(sceneWithoutWater, camera);
		
		//Switches to refract
		camera.position.y+=distance
		camera.rotation.x = -camera.rotation.x;
		//bgMesh.position.copy(camera.position);
		renderer.setRenderTarget(reflectionBuffer);
		renderer.render(bgScene, camera);
		renderer.render(sceneWithoutWater, camera);
		
		renderer.setRenderTarget(null);
  }
  
  var render = function () {
    requestAnimationFrame( render );
	
	underwater = (camera.position.y < water.position.y) && (camera.position.x > water.position.x-waterWidth/2 && camera.position.x < water.position.x+waterWidth/2) && (camera.position.z > water.position.z-waterLength/2 && camera.position.z < water.position.z+waterLength/2);
	waterUniforms.isUnderwater.value = (underwater) ? 1 : 0;
	//clipPlane = Vector4f(0, -1, 0, 15);
    renderToBuffers();
	
	//renderer.render(scene, camera, clipPlane);
	renderer.render(scene, camera);
	animate();
  };
  
  function animate() {
	  var time = Date.now()*0.0005;
	  ribbon.position.x = Math.cos(time)*10;
	  ribbon.position.z = Math.cos(time)*10;
  }

  render();
}