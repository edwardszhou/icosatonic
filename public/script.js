import * as THREE from 'three';

import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { Wireframe } from 'three/addons/lines/Wireframe.js';
import { WireframeGeometry2 } from 'three/addons/lines/WireframeGeometry2.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

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
    8, 0, 11,   11, 3, 8,    // PLANE 1
    0, 1, 3,    3, 2, 0,     // PLANE 2
    2, 9, 1,    1, 10, 2,    // PLANE 3
    4, 9, 7,    7, 10, 4,    // PLANE 4
    4, 11, 7,   7, 8, 4,     // PLANE 5

    4, 5, 7,    7, 6, 4,     // PLANE 6
    5, 1, 6,    6, 2, 5,     // PLANE 7
    1, 8, 2,    2, 11, 1,    // PLANE 8
    3, 4, 0,    0, 7, 3,     // PLANE 9

    5, 0, 6,    6, 3, 5,     // PLANE 10
    0, 10, 3,   3, 9, 0,     // PLANE 11
    2, 4, 1,    1, 7, 2,     // PLANE 12

    8, 10, 11,  11, 9, 8,    // PLANE 13
    10, 6, 9,   9, 5, 10,    // PLANE 14

    5, 8, 6,    6, 11, 5,    // PLANE 15
];

const planePattern = [
    0, 1, 2, 2, 3, 0
]

const userPlaneVertices = new Float32Array([
    -1, 0, -1,
    -1, 0, 1,
    1, 0, -1,
    1, 0, 1
]);

const userPlaneIndices = [
    0, 1, 2,    2, 3, 1
];

let icosatone;
let userPlane;
let thisUser;
let clients = {};

let socket;
let frameNumber = 0;
let recording = new Array(600);
let isRecording = false;
// let userNormalLine;
// let selectedNormalLine;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
const controls = new OrbitControls( camera, renderer.domElement );

camera.position.set(0, 1, 6);
camera.lookAt(0, 0, 0);

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
const renderPass = new RenderPass(scene, camera);
const composer = new EffectComposer(renderer);
composer.addPass(renderPass);

const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1, 1.2, 0.28);
composer.addPass(bloomPass);

const outputPass = new OutputPass();
composer.addPass(outputPass);


controls.update();
controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
controls.dampingFactor = 0.02;
controls.enablePan = false;
controls.enableZoom = false;
controls.rotateSpeed = 0.25;
controls.mouseButtons = {
    RIGHT: THREE.MOUSE.ROTATE
}

window.onload = () => {

    document.body.appendChild(renderer.domElement)

    thisUser = new UserSampler(getRandomColor(), -1);
    icosatone = new Icosatone();

    initUserPlane();
    initUI();
    initSocket();
    socket.emit('new-user', thisUser.color);

    Tone.loaded().then(()=> {
        Tone.Transport.start();
    });

    animate();

    window.addEventListener('resize', resizeScene);
    window.addEventListener('mousemove', updateUserPlane);
    window.addEventListener('keydown', (ev)=> {
        if(ev.key === " ") {
            isRecording = true;
            frameNumber = 0;
            recording = new Array(600);
        }
    });
    window.addEventListener('mousedown', (ev)=> {
        if(ev.button > 1) return;

        let wasSustained = userPlane.sustain;
        if(wasSustained) {
            userPlane.sustain = false;
            icosatone.unbow(icosatone.selectedPlane, thisUser);
            socket.emit('unbow', icosatone.selectedPlane);
            return;
        }
        if(ev.shiftKey && !wasSustained) {
            userPlane.sustain = true;
        }
        
        icosatone.bow(icosatone.selectedPlane, thisUser);
        socket.emit('bow', icosatone.selectedPlane);
        
    });
    window.addEventListener('mouseup', (ev)=> {
        if(userPlane.sustain || ev.button > 1) return;

        icosatone.unbow(icosatone.selectedPlane, thisUser);
        socket.emit('unbow', icosatone.selectedPlane);
    });

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        if(isRecording) {
            frameNumber++;
            if(frameNumber == 600) {
                isRecording = false;

                for(let i = 599; i >= 0; i--) {
                    if(recording[i] && recording[i].bow == true) {
                        delete recording[i];
                        break;
                    } else if(recording[i]) {
                        break;
                    }
                }
                console.log(recording);
            }
        }
        

        userPlane.lineMaterial.resolution.set( window.innerWidth, window.innerHeight );
        
        icosatone.selectPlane(userPlane.normal.toArray());
        icosatone.update();

        // renderer.render(scene, camera);
        composer.render();
    }

    function resizeScene() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    
        renderer.setSize( window.innerWidth, window.innerHeight );
    }

    function initUserPlane() {
        let planeGeometry = new THREE.BufferGeometry();
        planeGeometry.setIndex(userPlaneIndices);
        planeGeometry.setAttribute('position', new THREE.BufferAttribute(userPlaneVertices, 3));
        let materialColor = thisUser.color;
        let fillMaterial = new THREE.MeshBasicMaterial( {
            color: materialColor, 
            side: THREE.DoubleSide, 
            polygonOffset: true,
            polygonOffsetFactor: 1, 
            polygonOffsetUnits: 1,
            depthTest: false
        } );

        fillMaterial.transparent = true;
        fillMaterial.opacity = 0.5;

        let planeWireGeometry = new WireframeGeometry2(planeGeometry);
        let lineMaterial = new LineMaterial( {
            color: materialColor,
            linewidth: 2,
            depthTest: false
        } );

        lineMaterial.transparent = true;
        lineMaterial.opacity = 1;

        let planeWireframe = new Wireframe(planeWireGeometry, lineMaterial);
        let planeMesh = new THREE.Mesh(planeGeometry, fillMaterial)

        // scene.add(planeMesh);
        // scene.add(planeWireframe);
        
        userPlane = {
            mesh: planeMesh,
            wireframe: planeWireframe, 
            geometry: planeGeometry, 
            lineMaterial: lineMaterial, 
            fillMaterial: fillMaterial, 
            color: materialColor, 
            processes: null,
            sustain: false,
            normal: getNormals(planeGeometry, planeMesh),
        };

    }
    
    function updateUserPlane(ev) {

        if(icosatone.planeLocked) return;

        let newRotation = [ -1 * (ev.clientX / window.innerWidth - 0.5) * Math.PI, (ev.clientY / window.innerHeight - 0.5) * Math.PI];

        let magnitude = Math.sqrt(Math.pow(newRotation[0], 2) + Math.pow(newRotation[1], 2))
        if(magnitude > Math.PI / 2) {
            newRotation[0] = newRotation[0] / magnitude * Math.PI / 2;
            newRotation[1] = newRotation[1] / magnitude * Math.PI / 2;
        }

        userPlane.mesh.rotation.z = newRotation[0];
        userPlane.mesh.rotation.x = newRotation[1];
        userPlane.wireframe.rotation.z = newRotation[0];
        userPlane.wireframe.rotation.x = newRotation[1];

        userPlane.normal = getNormals(userPlane.geometry, userPlane.mesh);
    }

}   
function initSocket() {
    socket = io.connect();

    socket.on('new-user', (data) => {
        clients[data.sid] = new UserSampler(data.color, data.sid) ;
    });

    socket.on('bow', (data) => {
        icosatone.bow(data.planeNum, clients[data.sid]);
    });

    socket.on('unbow', (data) => {
        icosatone.unbow(data.planeNum, clients[data.sid]);
    });

    socket.on('user-disconnect', (data) => {
        delete clients[data];
    });
}

let infoShowing = true;

function initUI() {
    let color = thisUser.color;

    let infoContent = document.getElementById('info-content')
    let hideBtn = document.getElementById('hide-btn');
    // hideBtn.setAttribute('showing', true);
    hideBtn.addEventListener('mouseenter', () => {
        hideBtn.style.color = color;
        hideBtn.style.textShadow = `0 0 5px ${color}`
    });
    hideBtn.addEventListener('mouseleave', () => {
        hideBtn.style.color = 'darkGray';
        hideBtn.style.textShadow = 'unset';
    });
    hideBtn.addEventListener('click', ()=> {
        if(infoShowing) {
            infoContent.style.animation = 'slideOut 2s ease forwards';
            hideBtn.textContent = '>';
            infoShowing = false;
        } else {
            infoContent.style.animation = 'slideIn 2s ease forwards';
            hideBtn.textContent = '<';
            infoShowing = true;
        }
       
    });

    hideBtn.addEventListener('mousedown', (ev) => {
        ev.stopPropagation();
    });
    hideBtn.addEventListener('mouseup', (ev) => {
        ev.stopPropagation();
    });

    let infoSeparator = document.getElementById('info-separator');
    infoSeparator.style.boxShadow = `0 0 50px 8px ${color}`;
    infoSeparator.style.borderColor = color;
    
}
function getRandomColor() {
    let num = Math.floor(Math.random() * 361);
    while(num < 260 && num > 225) {
        num = Math.floor(Math.random() * 361)
    }
    return `hsl(${num}, 100%, 70%)`;
}

function getNormals(geometry, mesh) {
    geometry.computeVertexNormals();

    const tri = new THREE.Triangle(); // for re-use
    const indices = new THREE.Vector3(); // for re-use
    const outNormal = new THREE.Vector3(); // this is the output normal you need

    indices.fromArray(geometry.index.array, 0);
    tri.setFromAttributeAndIndices(geometry.attributes.position,
        indices.x,
        indices.y,
        indices.z);
    tri.getNormal(outNormal);

    outNormal.applyAxisAngle(new THREE.Vector3(1,0,0), mesh.rotation.x);
    outNormal.applyAxisAngle(new THREE.Vector3(0,1,0), mesh.rotation.y);
    outNormal.applyAxisAngle(new THREE.Vector3(0,0,1), mesh.rotation.z);
    
    return(outNormal);
}

function getMagnitude(vec3Array) {
    return Math.sqrt(vec3Array[0] * vec3Array[0] + vec3Array[1] * vec3Array[1] + vec3Array[2] * vec3Array[2]);
}

class MusicalPlane {
    constructor(number, color) {
        this.geometry = new THREE.BufferGeometry();

        let vertices = planeIndices.slice(6 * number, 6 * (number + 1)); // for UL/UR/LL/LR = B/C/A/D plane, indices for faces in pattern CBA ADC
        let thisPlaneVertices = new Float32Array([
            ...icoVertices.slice(vertices[0] * 3, vertices[0] * 3 +3),
            ...icoVertices.slice(vertices[1] * 3, vertices[1] * 3 +3),
            ...icoVertices.slice(vertices[2] * 3, vertices[2] * 3 +3),
            ...icoVertices.slice(vertices[4] * 3, vertices[4] * 3 +3)
        ]); // get CBA and D

        this.geometry.setIndex(planePattern);
        this.geometry.setAttribute('position', new THREE.BufferAttribute( thisPlaneVertices , 3 ));

        this.fillMaterial = new THREE.MeshBasicMaterial( {
            color: color, 
            side: THREE.DoubleSide, 
            polygonOffset: true,
            polygonOffsetFactor: 1, 
            polygonOffsetUnits: 1,
            depthTest: false
        } );
        this.fillMaterial.transparent = true;
        this.fillMaterial.opacity = 0;

        this.lineMaterial = new LineMaterial( {
            color: color,
            linewidth: 2,
            depthTest: false
        } );
        this.lineMaterial.transparent = true;
        this.lineMaterial.opacity = 0;

        let planeWireGeometry = new WireframeGeometry2(this.geometry);
        this.wireframe = new Wireframe(planeWireGeometry, this.lineMaterial);
        this.mesh = new THREE.Mesh(this.geometry, this.fillMaterial);

        scene.add(this.mesh);
        scene.add(this.wireframe);

        this.number = number;
        this.process = null;
        this.trueOpacity = 0;
        this.selected = false;
        this.normal = getNormals(this.geometry, this.mesh);

        this.players = [];
    }

    show(time = 0.25) {
        this.process = {direction: 1, time: time};
    }

    hide(time = 0.25) {
        this.process = {direction: -1, time: time};
    }

    updateNormal() {
        this.normal = getNormals(this.geometry, this.mesh);
    }

    updateOpacity() {
        if(this.process) {
            if(this.process.time == 0) {
                this.trueOpacity = ( this.direction + 1 ) / 2;
                this.process = null;
            } 

            // line opacity 1 in 0.5s, with interval of 60 updates per second
            let increment = 1 / 60 / this.process.time * this.process.direction;
        
            if(this.trueOpacity + increment >= 1) {
                this.trueOpacity = 1;
                this.process = null;
            } else if(this.trueOpacity + increment <= 0) {
                this.trueOpacity = 0;
                this.process = null;
                this.lineMaterial.color.set(thisUser.color);
                this.fillMaterial.color.set(thisUser.color);
            } else {
                this.trueOpacity += increment;
            }
        }

        if(this.selected) {
            this.lineMaterial.opacity = 1;
        } else {
            this.lineMaterial.opacity = this.trueOpacity;
        }
        this.fillMaterial.opacity = this.trueOpacity / 4;
    }

    bow(user) {
        user.play(this.number);

        this.players.push(user);
        this.lineMaterial.color.set(user.color);
        this.fillMaterial.color.set(user.color);

        if(this.players.length == 1) this.show();
    }

    unbow(user) {

        user.stop(this.number);

        if(this.players[this.players.length-1] == user) {
            this.players.pop();
            if(this.players.length > 0) {
                let newColor = this.players[this.players.length-1].color;
                this.lineMaterial.color.set(newColor);
                this.fillMaterial.color.set(newColor);
            }
        } else {
            let index = this.players.indexOf(user);
            this.players.splice(index, 1);
        }

        if(this.players.length == 0) {
            this.hide();
        }
    }

}

class Icosatone {
    constructor() {
        this.planes = new Array(15);
        this.selectedPlane = null;
        
        this.rotationLocked = false;
        this.planeLocked = false;

        let geometry = new THREE.BufferGeometry();
        geometry.setIndex(icoIndices);
        geometry.setAttribute('position', new THREE.BufferAttribute( icoVertices , 3 ));

        let wireGeometry = new WireframeGeometry2( geometry );
        this.lineMaterial = new LineMaterial( {color: 0x8F8F8F, linewidth: 2, depthTest: false} );

        this.wireframe = new Wireframe(wireGeometry, this.lineMaterial);
        scene.add( this.wireframe );

        this.initPlanes();
        this.rotate(0, Math.random() * 2 * Math.PI, 0);
    }

    initPlanes() {
        for(let i = 0; i < 15; i++) {
            this.planes[i] = new MusicalPlane(i, thisUser.color)
        }
    }
    
    rotate(x, y, z) {
        this.wireframe.rotation.x += x;
        this.wireframe.rotation.y += y;
        this.wireframe.rotation.z += z;

        for(let plane of this.planes) {
            plane.mesh.rotation.x += x;
            plane.mesh.rotation.y += y;
            plane.mesh.rotation.z += z;
            plane.wireframe.rotation.x += x;
            plane.wireframe.rotation.y += y;
            plane.wireframe.rotation.z += z;
            plane.updateNormal();
        }
    }

    update() {
        if(!this.rotationLocked) {
            this.rotate(0, 0.002, 0);
        }
        this.lineMaterial.resolution.set( window.innerWidth, window.innerHeight );

        for(let plane of this.planes) {
            plane.updateOpacity();
            plane.lineMaterial.resolution.set( window.innerWidth, window.innerHeight );
        }


    }

    selectPlane(normalArray) {

        if(this.planeLocked) return;

        let closestPlane, greatestSimilarity;

        for(let i = 0; i < 15; i++) {
            let plane = this.planes[i];

            let planeNormal = plane.normal.toArray();
            // cosine similarity
            let dotProd = normalArray[0] * planeNormal[0] + normalArray[1] * planeNormal[1] + normalArray[2] * planeNormal[2];
            let magnitudes = getMagnitude(planeNormal) * getMagnitude(normalArray);

            let similarity = Math.abs(dotProd / magnitudes);
            
            if(!closestPlane || similarity > greatestSimilarity) {
                closestPlane = i;
                greatestSimilarity = similarity;
            }
        }

        for(let i = 0; i < 15; i++) {
            if(i == closestPlane) this.planes[i].selected = true;
            else this.planes[i].selected = false;

        }

        this.selectedPlane = closestPlane;
    }

    bow(planeNum, user) {
        this.planeLocked = true;
        this.planes[planeNum].bow(user);
        if(recording) {
            recording[frameNumber] = {bow: true, plane: planeNum, uid: user.id + '_instance'};
        }
    }

    unbow(planeNum, user) {
        this.planeLocked = false;
        this.planes[planeNum].unbow(user);
        if(recording) {
            recording[frameNumber] = {bow: false, plane: planeNum, uid: user.id + '_instance'};
        }
    }
}

class UserSampler {
    constructor(color, id) {
        this.sampler = new Tone.Sampler({
            "A3": "samples/A3.mp3",
        }).toDestination();
        this.color = color;
        this.soundLoops = new Array(15);
        this.soundTimeout = null;
        this.id = id;

        this.initSampler();
    }

    initSampler() {
        const vibrato = new Tone.Vibrato({
            maxDelay : 0.005 ,
            frequency : 1 ,
            depth : 0.2
        }).toDestination();
            
        const reverb = new Tone.Reverb({
            decay: 5
        }).toDestination();
        
        this.sampler.release = 0.6;
        this.sampler.volume.value = -20;
        this.sampler.connect(vibrato);
        this.sampler.connect(reverb);

        for(let i = 0; i < 15; i++) {
            this.soundLoops[i] = new Tone.Loop((time)=> {
                this.sampler.triggerAttack(chords[i].pitches);
            }, 1);
        }
    }

    play(chordNum) {
        clearInterval(this.soundTimeout);
        let now = Tone.now();
        this.soundLoops[chordNum].start(now);
        this.sampler.triggerAttack(chords[chordNum].pitches);
        this.soundTimeout = setTimeout(()=>{this.sampler.triggerAttack(chords[chordNum].pitches)}, 250);
    }

    stop(chordNum) {
        clearTimeout(this.soundTimeout);
        let now = Tone.now();
        this.soundLoops[chordNum].stop(now);
        this.sampler.triggerRelease(chords[chordNum].pitches);
        this.soundTimeout = setInterval(()=>{this.sampler.triggerRelease(chords[chordNum].pitches)}, 10);
    }
}