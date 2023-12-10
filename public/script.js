import * as THREE from 'three';

import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { Wireframe } from 'three/addons/lines/Wireframe.js';
import { WireframeGeometry2 } from 'three/addons/lines/WireframeGeometry2.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VertexNormalsHelper } from 'three/addons/helpers/VertexNormalsHelper.js';

const scale = {
    C3: 130.81,
    D3: 146.83,
    E3: 164.81,
    F3: 174.61,
    G3: 196.00,
    A3: 220.00,
    B3: 246.94
}

const chords = [
    {
        plane: 1,
        frequencies: [scale.C3, scale.D3, scale.E3, scale.G3],
        pitches: ["C3", "D3", "E3", "G3"],
        majScale: "Cmaj"
    },
    {
        plane: 2,
        frequencies: [scale.D3, scale.E3, scale.G3, scale.A3],
        pitches: ["D3", "E3", "G3", "A3"],
        majScale: "Cmaj"
    },
    {
        plane: 3,
        frequencies: [scale.E3, scale.G3, scale.A3, scale.C3 * 2],
        pitches: ["E3", "G3", "A3", "C4"],
        majScale: "Cmaj"
    },
    {
        plane: 4,
        frequencies: [scale.G3, scale.A3, scale.C3 * 2, scale.D3 * 2],
        pitches: ["G3", "A3", "C4", "D4"],
        majScale: "Cmaj"
    },
    {
        plane: 5,
        frequencies: [scale.A3, scale.C3 * 2, scale.D3 * 2, scale.E3 * 2],
        pitches: ["A3", "C4", "D4", "E4"],
        majScale: "Cmaj"
    },
    {
        plane: 6,
        frequencies: [scale.F3, scale.G3, scale.A3, scale.C3 * 2],
        pitches: ["F3", "G3", "A3", "C4"],
        majScale: "Fmaj"
    },
    {
        plane: 7,
        frequencies: [scale.G3, scale.A3, scale.C3 * 2, scale.D3 * 2],
        pitches: ["G3", "A3", "C4", "D4"],
        majScale: "Fmaj"
    },
    {
        plane: 8,
        frequencies: [scale.A3, scale.C3 * 2, scale.D3 * 2, scale.F3 * 2],
        pitches: ["A3", "C4", "D4", "F4"],
        majScale: "Fmaj"
    },
    {
        plane: 9,
        frequencies: [scale.C3, scale.D3, scale.F3, scale.G3],
        pitches: ["C3", "D3", "F3", "G3"],
        majScale: "Fmaj"
    },
    {
        plane: 10,
        frequencies: [scale.D3, scale.F3, scale.G3, scale.A3],
        pitches: ["D3", "F3", "G3", "A3"],
        majScale: "Fmaj"
    },
    {
        plane: 11,
        frequencies: [scale.G3, scale.A3, scale.B3, scale.D3 * 2],
        pitches: ["G3", "A3", "B3", "D4"],
        majScale: "Gmaj"
    },
    {
        plane: 12,
        frequencies: [scale.A3, scale.B3, scale.D3 * 2, scale.E3 * 2],
        pitches: ["A3", "B3", "D4", "E4"],
        majScale: "Gmaj"
    },
    {
        plane: 13,
        frequencies: [scale.B3, scale.D3 * 2, scale.E3 * 2, scale.G3 * 2],
        pitches: ["B3", "D4", "E4", "G4"],
        majScale: "Gmaj"
    },
    {
        plane: 14,
        frequencies: [scale.D3, scale.E3, scale.G3, scale.A3],
        pitches: ["D3", "E3", "G3", "A3"],
        majScale: "Gmaj"
    },
    {
        plane: 15,
        frequencies: [scale.E3, scale.G3, scale.A3, scale.B3],
        pitches: ["E3", "G3", "A3", "B3"],
        majScale: "Gmaj"
    },
]

const t = ( 1 + Math.sqrt( 5 ) ) / 2;

const icoVertices = new Float32Array([
    - 1, t, 0, 	1, t, 0, 	- 1, - t, 0, 	1, - t, 0,
    0, - 1, t, 	0, 1, t,	0, - 1, - t, 	0, 1, - t,
    t, 0, - 1, 	t, 0, 1, 	- t, 0, - 1, 	- t, 0, 1
]);

const icoIndices = [
    0, 11, 5, 	0, 5, 1, 	0, 1, 7, 	0, 7, 10, 	0, 10, 11,
    1, 5, 9, 	5, 11, 4,	11, 10, 2,	10, 7, 6,	7, 1, 8,
    3, 9, 4, 	3, 4, 2,	3, 2, 6,	3, 6, 8,	3, 8, 9,
    4, 9, 5, 	2, 4, 11,	6, 2, 10,	8, 6, 7,	9, 8, 1
];

const planeIndices = [
    0, 11, 8,   3, 8, 11,    // PLANE 1
    0, 1, 3,    0, 3, 2,     // PLANE 2
    1, 2, 9,    10, 2, 1,    // PLANE 3
    4, 9, 7,    7, 10, 4,    // PLANE 4
    4, 11, 7,   7, 8, 4,     // PLANE 5

    4, 5, 7,    7, 6, 4,     // PLANE 6
    5, 1, 6,    6, 2, 5,     // PLANE 7
    1, 8, 2,    2, 11, 1,    // PLANE 8
    3, 4, 0,    0, 7, 3,     // PLANE 9

    5, 0, 6,    6, 3, 5,     // PLANE 10
    0, 10, 3,   3, 9, 0,     // PLANE 11
    2, 4, 1,    1, 7, 2,     // PLANE 12

    10, 11, 8,  9, 8, 11,    // PLANE 13
    10, 6, 9,   9, 5, 10,    // PLANE 14

    8, 6, 5,    5, 6, 11,    // PLANE 15
];

const userPlaneVertices = new Float32Array([
    -1, 0, -1,
    -1, 0, 1,
    1, 0, -1,
    1, 0, 1
]);

const userPlaneIndices = [
    0, 1, 2,    2, 3, 1
];

let sampler = new Tone.Sampler({
    "A3": "samples/A3.mp3",
    // "B3": "samples/B3.mp3",
    // "C3": "samples/C3.mp3",
    // "D3": "samples/D3.mp3",
    // "E3": "samples/E3.mp3",
    // "F3": "samples/F3.mp3",
    // "G3": "samples/G3.mp3",
}).toDestination();

const vibrato = new Tone.Vibrato({
    maxDelay : 0.005 ,
    frequency : 1 ,
    depth : 0.2
}).toDestination();
    
const reverb = new Tone.Reverb({
    decay: 5
}).toDestination();

sampler.release = 0.6;
sampler.volume.value = -20;
sampler.connect(vibrato);
sampler.connect(reverb);

let planes = new Array(15);
let userPlane;

window.onload = () => {

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    const controls = new OrbitControls( camera, renderer.domElement );

    camera.position.set(0, 1, 5);
    camera.lookAt(0, 0, 0);

    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement)

    controls.update();
    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.05;

    // Main ico 
    const icoGeometry = new THREE.BufferGeometry();
    icoGeometry.setIndex(icoIndices);
    icoGeometry.setAttribute('position', new THREE.BufferAttribute( icoVertices , 3 ));

    let icoWireGeometry = new WireframeGeometry2( icoGeometry );
    let icoWireMaterial = new LineMaterial( {color: 0xffffff, linewidth: 2, depthTest: false} );

    let icoWireframe = new Wireframe(icoWireGeometry, icoWireMaterial);
    scene.add( icoWireframe );

    // plane wireframes

    // const edgesGeometry = new THREE.BufferGeometry();
    // edgesGeometry.setIndex(planeIndices);
    // edgesGeometry.setAttribute('position', new THREE.BufferAttribute( icoVertices , 3 ));

    // let basicMaterial = new THREE.MeshBasicMaterial( {color: 0xff0000, side: THREE.DoubleSide, wireframe: true} );
    // let edgesMesh = new THREE.Mesh(edgesGeometry, basicMaterial)
    // scene.add(edgesMesh);

    initAllPlanes();

    Tone.loaded().then(()=> {
        Tone.Transport.start();
        initAllSounds();
    })

    animate();

    window.addEventListener('resize', resizeScene);
    window.addEventListener('mousemove', updateUserPlane);

    function animate() {
        requestAnimationFrame(animate);
        controls.update();

        icoWireMaterial.resolution.set( window.innerWidth, window.innerHeight ); // resolution of the viewport
        userPlane.lineMaterial.resolution.set( window.innerWidth, window.innerHeight );
        
        for(let plane of planes) {
            plane.lineMaterial.resolution.set( window.innerWidth, window.innerHeight );

            rotateMesh(plane.mesh, 0.001, 0.002, 0.0005);
            rotateMesh(plane.wireframe, 0.001, 0.002, 0.0005);

            plane.normal = getNormals(plane.geometry, plane.mesh);
            // console.log(planes.indexOf(plane) ,plane.normal);
        }
        rotateMesh(icoWireframe, 0.001, 0.002, 0.0005);
        // rotateMesh(edgesMesh, 0.001, 0.002, 0.0005);
    
        renderer.render(scene, camera);
    }

    function initPlane(indices, planeNum) {
        let planeGeometry = new THREE.BufferGeometry();
        planeGeometry.setIndex(indices);

        if(planeNum == -1)
            planeGeometry.setAttribute('position', new THREE.BufferAttribute(userPlaneVertices, 3));
        else
            planeGeometry.setAttribute('position', new THREE.BufferAttribute( icoVertices , 3 ));

        let materialColor = getRandomColor();

        let fillMaterial = new THREE.MeshBasicMaterial( {
            color: materialColor, 
            side: THREE.DoubleSide, 
            polygonOffset: true,
            polygonOffsetFactor: 1, 
            polygonOffsetUnits: 1,
            depthTest: false
        } );

        fillMaterial.transparent = true;
        fillMaterial.opacity = 0;

        let planeWireGeometry = new WireframeGeometry2(planeGeometry);
        let lineMaterial = new LineMaterial( {
            color: materialColor,
            linewidth: 2,
            depthTest: false
        } );

        lineMaterial.transparent = true;
        lineMaterial.opacity = 0;

        let planeWireframe = new Wireframe(planeWireGeometry, lineMaterial);
        let planeMesh = new THREE.Mesh(planeGeometry, fillMaterial)

        scene.add(planeMesh);
        scene.add(planeWireframe);
        
        let newPlane = {
            mesh: planeMesh,
            wireframe: planeWireframe, 
            geometry: planeGeometry, 
            lineMaterial: lineMaterial, 
            fillMaterial: fillMaterial, 
            color: materialColor, 
            processes: null,
            normal: getNormals(planeGeometry, planeMesh),
        };

        if(planeNum == -1) {
            userPlane = newPlane;
            fillMaterial.opacity = 0.5;
            lineMaterial.opacity = 1;
        } else {
            planes[planeNum] = newPlane;
        }
    }

    function showPlane(planeNum, time = 0.25) {

        let plane = planes[planeNum-1];
        let lineIncrement = 1 / 60 / time;
        let fillIncrement = 1 / 180 / time;

        if(plane.processes) {
            clearInterval(plane.processes);
        }

        plane.processes = setInterval(()=> {

            if(plane.lineMaterial.opacity + lineIncrement >= 1) {
                plane.lineMaterial.opacity = 1;
                plane.fillMaterial.opacity += fillIncrement;
                clearInterval(plane.processes);
                return;
            }

            // line opacity 1 in 0.5s, with interval of 60 updates per second
            plane.lineMaterial.opacity += lineIncrement; 
            plane.fillMaterial.opacity += fillIncrement;
        }, 1000/60);
    }

    function hidePlane(planeNum, time = 0.25) {

        let plane = planes[planeNum-1];
        let lineDecrement = 1 / 60 / time;
        let fillDecrement = 1 / 180 / time;

        if(plane.processes) {
            clearInterval(plane.processes);
        }

        plane.processes = setInterval(()=> {

            if(plane.lineMaterial.opacity - lineDecrement <= 0) {
                plane.lineMaterial.opacity = 0;
                plane.fillMaterial.opacity -= fillDecrement;
                clearInterval(plane.processes);
                return;
            }

            // line opacity 1 in 0.5s, with interval of 60 updates per second
            plane.lineMaterial.opacity -= lineDecrement; 
            plane.fillMaterial.opacity -= fillDecrement;
        }, 1000/60);
    }
    
    function getNormals(geometry, mesh) {
        const tri = new THREE.Triangle(); // for re-use
        const indices = new THREE.Vector3(); // for re-use
        const outNormal = new THREE.Vector3(); // this is the output normal you need

        indices.fromArray(geometry.index.array, 0);
        tri.setFromAttributeAndIndices(geometry.attributes.position,
            indices.x,
            indices.y,
            indices.z);
        tri.getNormal(outNormal);

        outNormal.applyAxisAngle(new THREE.Vector3(1,0,0), mesh.rotation.x)
        outNormal.applyAxisAngle(new THREE.Vector3(0,1,0), mesh.rotation.y)
        outNormal.applyAxisAngle(new THREE.Vector3(0,0,1), mesh.rotation.z)
        return(outNormal);
    }

    function rotateMesh(mesh, x, y, z) {
        mesh.rotation.x += x;
        mesh.rotation.y += y;
        mesh.rotation.z += z;
    }
    
    function resizeScene() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    
        renderer.setSize( window.innerWidth, window.innerHeight );
    }

    function initAllSounds() {
        for(let i = 1; i <= 15; i++) {

            let button = document.getElementById(`plane${i}`);

            let newLoop = new Tone.Loop((time)=> {
                sampler.triggerAttack(chords[i-1].pitches);
            }, 1);

            button.addEventListener('click', ()=> {
                let now = Tone.now();
                if(newLoop.state === "stopped") {
                    newLoop.start(now);
                    showPlane(i, 0.25);
                    sampler.triggerAttack(chords[i-1].pitches);
                    
                } else {
                    newLoop.stop(now);
                    hidePlane(i, 0.25);
                    sampler.triggerRelease(chords[i-1].pitches);
                }
            
            })
        }
    }

    function initAllPlanes() {
        for(let i = 0; i < 15; i++) {
            let indices = planeIndices.slice(6 * i, 6 * (i + 1));
            initPlane(indices, i);
        }
    
        initPlane(userPlaneIndices, -1);
    }
    
    function updateUserPlane(ev) {
        let newRotation = [ -1 * (ev.clientX / window.innerWidth - 0.5) * Math.PI, (ev.clientY / window.innerHeight - 0.5) * Math.PI];

        userPlane.mesh.rotation.z = newRotation[0];
        userPlane.mesh.rotation.x = newRotation[1];
        userPlane.wireframe.rotation.z = newRotation[0];
        userPlane.wireframe.rotation.x = newRotation[1];

        console.log(getNormals(userPlane.geometry, userPlane.mesh));
    }
}   

function getRandomColor() {
    return `hsl(${ Math.floor(Math.random() * 361) }, 100%, 70%)`;
}