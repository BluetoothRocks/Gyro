/* Pills */

document.getElementById('calibrate').addEventListener('click', (e) => {
	document.body.classList.remove('calibrate', 'control');
	document.body.classList.add('calibrate');
});

document.getElementById('control').addEventListener('click', (e) => {
	document.body.classList.remove('calibrate', 'control');
	document.body.classList.add('control');
});





var coords = {
	x: 0, y: Math.PI, z: 0	
};

var direction = 'stop';
var lastDirection = 'stop';

var plotPoints = [];

var correction = Math.PI * 0.5;

	document.getElementById('orientation').addEventListener('input', (e) => {
		correction = (e.target.value / 360) * 2 * Math.PI;

		let xyz = new THREE.Euler(coords.x, coords.y, - coords.z);
		head.setRotationFromEuler(xyz);
		head.updateMatrix();
		
		let xyz2 = new THREE.Euler(0, correction, 0);
		head.children[0].setRotationFromEuler(xyz2);
		head.children[0].updateMatrix();
	});


    var renderer = new THREE.WebGLRenderer({ alpha: true })
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('renderer').appendChild(renderer.domElement);

    var cam = new THREE.PerspectiveCamera(
        75,                                             		// field of view
        window.innerWidth / (window.innerHeight),  		       	// aspect ratio
        0.01,                                           		// min distance (meters?)
        500                                             		// max distance (meters?)
    )

    var scene = new THREE.Scene()

    var head = null;

    var loader = new THREE.GLTFLoader()
    loader.load('assets/lego.glb', object => {
        head = object.scene;
        head.position.set(0, 0.3, -2);
        head.scale.set(1.7, 1.7, 1.7);

        head.rotation._order = "XYZ";
        scene.add(head)

	    var loader = new THREE.TextureLoader();
		loader.load('assets/lego-face-cyl.jpg', texture => {
			texture.flipY = false;
			
			var material = new THREE.MeshStandardMaterial({
				metalness: 0.3, roughness: 1,
				map: texture
			});
			
			material.side = THREE.DoubleSide;
			
			head.children[0].children[0].material = material;
		});
    });
    


	var ambient = new THREE.AmbientLight( 0xbbbbbb );
	scene.add( ambient );

	spot1 = new THREE.SpotLight( 0xffffff, 1 );
	spot1.position.set( 10, 20, 10 );
	spot1.angle = 0.25;
	spot1.penumbra = 0.75;
	scene.add( spot1 );


    requestAnimationFrame(function render() {
	    if (head) {
			let xyz = new THREE.Euler(- coords.x, coords.y, - coords.z, 'XYZ');

			head.setRotationFromEuler(xyz);
		    head.updateMatrix();

			let xyz2 = new THREE.Euler(0, correction, 0);
		    head.children[0].setRotationFromEuler(xyz2);
		    head.children[0].updateMatrix();

	        renderer.render(scene, cam);
        }
        
        requestAnimationFrame(render);
    })





/* Connect to device */

document.getElementById('connect')
	.addEventListener('click', () => {

		BluetoothThingy.connect()	
			.then(() => {
				document.body.classList.add('connected');
				document.body.classList.add('thingy-connected');
				
				BluetoothThingy.addEventListener('disconnected', () => {
					document.body.classList.remove('connected');
					document.body.classList.remove('thingy-connected');
				});

				BluetoothThingy.addEventListener('orientationchanged', (value) => {
					coords = value;
					
					plotPoints.push(value);
				    drawGraph();
				});

				BluetoothThingy.addEventListener('directionchanged', (value) => {

					if (value != lastDirection) {
						document.body.classList.add('direction-' + value);
						document.body.classList.remove('direction-' + lastDirection);

						lastDirection = value;
						executeCommand(value);
					}
				});
			});
	});


document.getElementById('secondary')
	.addEventListener('click', () => {
		SBrick.connect('SBrick')
			.then(()=> {
				document.body.classList.add('sbrick-connected');

				window.scroll({
					top: 0, 
					left: 0, 
					behavior: 'smooth' 
				});				
			});
	});







function executeCommand(value) {
    switch (value) {
        case 'forward':
			if (SBrick.isConnected()) {		            	
            	SBrick.quickDrive([
					{ channel: SBrick.CHANNEL1, direction: SBrick.CW, power: SBrick.MAX },
					{ channel: SBrick.CHANNEL3, direction: SBrick.CCW, power: SBrick.MAX }
				]);
			}
				
			break;
        
        case 'reverse':
			if (SBrick.isConnected()) {		            	
            	SBrick.quickDrive([
					{ channel: SBrick.CHANNEL1, direction: SBrick.CCW, power: SBrick.MAX },
					{ channel: SBrick.CHANNEL3, direction: SBrick.CW, power: SBrick.MAX }
				]);
			}
				
			break;
        
        case 'right':
			if (SBrick.isConnected()) {		            	
            	SBrick.quickDrive([
					{ channel: SBrick.CHANNEL1, direction: SBrick.CCW, power: SBrick.MAX },
					{ channel: SBrick.CHANNEL3, direction: SBrick.CCW, power: SBrick.MAX }
				]);
			}
				
			break;
        
        case 'left':
			if (SBrick.isConnected()) {		            	
            	SBrick.quickDrive([
					{ channel: SBrick.CHANNEL1, direction: SBrick.CW, power: SBrick.MAX },
					{ channel: SBrick.CHANNEL3, direction: SBrick.CW, power: SBrick.MAX }
				]);
			}
				
			break;
        
        case 'stop':
			if (SBrick.isConnected()) {		            	
            	SBrick.stop(SBrick.CHANNEL1);
            	SBrick.stop(SBrick.CHANNEL3);
            }
            
			break;
        
    }
}







var canvas = document.getElementById('graph');
var context = canvas.getContext('2d');

var last = {
	x: 0, y: 0, z: 0
};

function drawGraph() {
	requestAnimationFrame(() => {
		canvas.width = parseInt(getComputedStyle(canvas).width.slice(0, -2)) * devicePixelRatio;
		canvas.height = parseInt(getComputedStyle(canvas).height.slice(0, -2)) * devicePixelRatio;
		
	    var margin = 0;
	    var max = Math.max(0, Math.round(canvas.width / 11));
	    var offset = Math.max(0, plotPoints.length - max);
	    context.clearRect(0, 0, canvas.width, canvas.height);

		context.fillStyle = '#666666';
		context.strokeStyle = '#aaaaaa';
		context.lineWidth = 4;

		var t = Math.round((Math.PI / 180 * 30) * canvas.height / (Math.PI * 2));

		for (var i = 0; i < Math.max(plotPoints.length, max); i++) {
			if (plotPoints[i + offset]) {
				var x = Math.round(plotPoints[i + offset].x * canvas.height / (Math.PI * 2));
				var y = Math.round(plotPoints[i + offset].y * canvas.height / (Math.PI * 2));
				var z = Math.round(plotPoints[i + offset].z * canvas.height / (Math.PI * 2));
				
								
				if (i > 0) {
					if (Math.abs(last.x - x) < canvas.height / 2) {
						context.strokeStyle = '#ff4444';
						context.beginPath();
						context.moveTo(11 * (i - 1), canvas.height - last.x);
						context.lineTo(11 * i, canvas.height - x);
						context.stroke();
						
						if (Math.abs((canvas.height / 2) - x) > t && Math.abs((canvas.height / 2) - last.x) <= t) {
							context.fillStyle = '#ff4444';
							context.beginPath();
							context.arc(11 * i, canvas.height - x, 8, 0, 2 * Math.PI);
							context.fill();
						}
					}

					if (Math.abs(last.y - y) < canvas.height / 2) {
						context.strokeStyle = '#44ff44';
						context.beginPath();
						context.moveTo(11 * (i - 1), canvas.height - last.y);
						context.lineTo(11 * i, canvas.height - y);
						context.stroke();
					}

					if (Math.abs(last.z - z) < canvas.height / 2) {
						context.strokeStyle = '#4444ff';
						context.beginPath();
						context.moveTo(11 * (i - 1), canvas.height - last.z);
						context.lineTo(11 * i, canvas.height - z);
						context.stroke();

						if (Math.abs((canvas.height / 2) - z) > t && Math.abs((canvas.height / 2) - last.z) <= t) {
							context.fillStyle = '#4444ff';
							context.beginPath();
							context.arc(11 * i, canvas.height - z, 8, 0, 2 * Math.PI);
							context.fill();
						}
					}
				}
				
				last.x = x;
				last.y = y;
				last.z = z;
			}
		}
	});	
}


window.onresize = drawGraph;

document.addEventListener("visibilitychange", () => {
	if (!document.hidden) {
		drawGraph();
	}
});

