import * as THREE from 'three';

import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { Wireframe } from 'three/addons/lines/Wireframe.js';
import { WireframeGeometry2 } from 'three/addons/lines/WireframeGeometry2.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scale = {
    C3: 130.81,
    D3: 146.83,
    E3: 164.81,
    F3: 174.61,
    G3: 196.00,
    A3: 220.00,
    B3: 246.94
}

let chords = [
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

let sampler = new Tone.Sampler({
    "A3": "samples/A3.mp3",
    // "B3": "samples/B3.mp3",
    // "C3": "samples/C3.mp3",
    // "D3": "samples/D3.mp3",
    // "E3": "samples/E3.mp3",
    // "F3": "samples/F3.mp3",
    // "G3": "samples/G3.mp3",
}).toDestination();

let vibrato = new Tone.Vibrato({
    maxDelay : 0.005 ,
    frequency : 1 ,
    depth : 0.2
}).toDestination();
    
let reverb = new Tone.Reverb({
    decay: 5
}).toDestination();

sampler.release = 0.6;
sampler.volume.value = -20;
sampler.connect(vibrato);
sampler.connect(reverb);

window.onload = () => {

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    const controls = new OrbitControls( camera, renderer.domElement );

    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement)

    controls.update();
    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.05;

    // let geometry = new THREE.IcosahedronGeometry(20, 0);

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
        0, 11, 8,   3, 8, 11	
    ]

    // Main ico
    const icoGeometry = new THREE.BufferGeometry();
    icoGeometry.setIndex(icoIndices);
    icoGeometry.setAttribute('position', new THREE.BufferAttribute( icoVertices , 3 ));

    let icoWireGeometry = new WireframeGeometry2( icoGeometry );
    let wireMaterial = new LineMaterial( {color: 0xffffff, linewidth: 2} );

    let icoWireframe = new Wireframe(icoWireGeometry, wireMaterial);
    scene.add( icoWireframe );

    // test plane
    const planeGeometry = new THREE.BufferGeometry();
    planeGeometry.setIndex(planeIndices);
    planeGeometry.setAttribute('position', new THREE.BufferAttribute( icoVertices , 3 ));

    let basicMaterial = new THREE.MeshBasicMaterial( {color: 0xff0000, side: THREE.DoubleSide} );
    let planeMesh = new THREE.Mesh(planeGeometry, basicMaterial)
    scene.add(planeMesh);

    camera.position.set(0, 1, 4);
    camera.lookAt(0, 0, 0);

    animate();

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        wireMaterial.resolution.set( window.innerWidth, window.innerHeight ); // resolution of the viewport
        // icoWireframe.rotation.y += 0.002;
    
        renderer.render(scene, camera);
    }

    Tone.loaded().then(()=> {
        Tone.Transport.start();
        for(let i = 1; i <= 15; i++) {

            let button = document.getElementById(`plane${i}`);

            let newLoop = new Tone.Loop((time)=> {
                sampler.triggerAttack(chords[i-1].pitches);
            }, 1);

            button.addEventListener('click', ()=> {
                let now = Tone.now();
                if(newLoop.state === "stopped") {
                    newLoop.start(now);
                    sampler.triggerAttack(chords[i-1].pitches);
                    
                } else {
                    newLoop.stop(now);
                    sampler.triggerRelease(chords[i-1].pitches);
                }
            
            })
        }
    })

    window.addEventListener('resize', ()=> {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    
        renderer.setSize( window.innerWidth, window.innerHeight );
    })
}   

