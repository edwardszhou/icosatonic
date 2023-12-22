import * as THREE from 'three';

import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { Wireframe } from 'three/addons/lines/Wireframe.js';
import { WireframeGeometry2 } from 'three/addons/lines/WireframeGeometry2.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';

// Frequencies of center octave of scale
const scale = {
    C3: 130.81,
    D3: 146.83,
    E3: 164.81,
    F3: 174.61,
    G3: 196.00,
    A3: 220.00,
    B3: 246.94
}

// Chords associted with icosatone, including plane number, freqs, pitches, and chord
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

// icosahedron vertices location array
const t = ( 1 + Math.sqrt( 5 ) ) / 2;

const icoVertices = new Float32Array([
    - 1, t, 0, 	1, t, 0, 	- 1, - t, 0, 	1, - t, 0,
    0, - 1, t, 	0, 1, t,	0, - 1, - t, 	0, 1, - t,
    t, 0, - 1, 	t, 0, 1, 	- t, 0, - 1, 	- t, 0, 1
]);

const FPS = 60;
let scene, camera, renderer, composer, controls, fxaaPass;

let icosatone;
let thisUser;
let recordPlayer;

/*
Stores active clients and associated UserSampler object
key: socket id, value: UserSampler object
 */
let socketClients = {};

let socket;

window.onload = () => {

    initScene();
    initSocket();

    thisUser = new ActiveUser(getRandomColor());
    recordPlayer = new RecordPlayer();
    icosatone = new Icosatone(thisUser, recordPlayer);
    recordPlayer.instrument = icosatone;

    initDOM();
    initRecorderUI();
    initControls();
    
    socket.emit('new-user', thisUser.color);

    Tone.loaded().then(()=> {
        Tone.Transport.start(); // starts Tone.js innter time
    });

    animate();

}

/**
 * Initializes scene in Three.js, including controls, renderer and postprocessing
 */
function initScene() {

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000); // 50 focal length
    renderer = new THREE.WebGLRenderer();
    controls = new OrbitControls( camera, renderer.domElement );

    // Face center of scene looking slightly downward
    camera.position.set(0, 1, 6);
    camera.lookAt(0, 0, 0);

    // set up renderer and composer 
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    const renderPass = new RenderPass(scene, camera);
    composer = new EffectComposer(renderer);
    composer.addPass(renderPass);

    // controls amount of glow in the scene
    const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1, 1.2, 0.28);
    composer.addPass(bloomPass);

    const outputPass = new OutputPass();
    composer.addPass(outputPass);

    // sets up anti-aliasing as final pass
    fxaaPass = new ShaderPass( FXAAShader );
    const pixelRatio = renderer.getPixelRatio();
    fxaaPass.material.uniforms[ 'resolution' ].value.x = 1 / ( window.innerWidth * pixelRatio );
    fxaaPass.material.uniforms[ 'resolution' ].value.y = 1 / ( window.innerHeight * pixelRatio );
    composer.addPass(fxaaPass);

    // initializes orbit controls to only rotate (no pan or zoom)
    controls.update();
    controls.enableDamping = true; 
    controls.dampingFactor = 0.02;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.rotateSpeed = 0.25;
    controls.mouseButtons = {
        RIGHT: THREE.MOUSE.ROTATE
    }
    controls.minPolarAngle = Math.PI/2 - 0.18; // fixes rotation axis
    controls.maxPolarAngle = Math.PI/2 - 0.18;

    document.body.appendChild(renderer.domElement)
}

/**
 * Connects to socket.io server, wraps socket methods
 */
function initSocket() {
    socket = io.connect();

    /**
     * Creates a new UserSampler per user on the site
     * @param {object} data user data with .color property and .sid representing socket id
     */
    socket.on('new-user', (data) => {
        socketClients[data.sid] = new UserSampler(data.color, data.sid) ;
    });

    /**
     * Bow icosatone whenever another user bows
     * @param {object} data bow action data indicating which plane to bow and the client source
     */
    socket.on('bow', (data) => {
        icosatone.bow(data.planeNum, socketClients[data.sid]);
    });

    /**
     * Unbow icosatone whenever another user unbows
     * @param {object} data unbow action data indicating which plane to unbow and the client source
     */
    socket.on('unbow', (data) => {
        icosatone.unbow(data.planeNum, socketClients[data.sid]);
    });

    /**
     * handle receiving new recording from server, add to client's recorder
     * @param {object} data Object including recording data, recording users, source socket id, recording id (time created), recording name (ISO date)
     */
    socket.on('new-recording', (data) => {

        data.userSamplers = {}
        // rewrite data.recordedUsers with UserSampler objs, create new UserSampler per user in recording
        for(let i = 0; i < data.recordedUsers.length; i++) {
            let samplerName = data.recordedUsers[i] + "_instance"
            data.userSamplers[samplerName] = new UserSampler(0xAAAAAA,  samplerName); // default color is gray
        }

        // adds to record player
        recordPlayer.recordingAlbum.push(data);
        if(recordPlayer.recordingAlbum.length > 15) { // length 15, FIFO
            recordPlayer.recordingAlbum[0].htmlElement.remove();
            recordPlayer.recordingAlbum.shift();
        }

        // animates current recordings downward, then creates new element from recording data
        for(let element of document.getElementsByClassName('sample-recording')) {
            element.style.animation = "slideDown 0.5s ease forwards";
        }

        setTimeout(()=>{
            for(let element of document.getElementsByClassName('sample-recording')) {
                element.style.animation = "none";
            }
            data.htmlElement = createRecordingElement(data.name, data.timeCreated);
        }, 500);
    });

    /**
     * Remove user and terminate user actions when user disconnects
     * @param {string} data socket id of disconnected user
     */
    socket.on('user-disconnect', (data) => {
        icosatone.unbowAll(socketClients[data])
        delete socketClients[data];
    });
}

/**
 * Initializes users control with icosatone instrument via mouse movement and left click
 */
function initControls() {
    window.addEventListener('resize', resizeScene); // readjusts scene resolution and info upon window resize

    window.addEventListener('mousemove', (ev)=> {
        thisUser.updatePlane(ev, icosatone); // updates user plane upon mouse move
    });
    
    window.addEventListener('mousedown', (ev)=> {
        if(ev.button > 1) return; // ignore if not left click

        if(icosatone.planeLocked == true) { // if plane was previously locked (user is actively bowing some plane), unlock the plane and unbow
            thisUser.sustain = false;
            icosatone.unbow(icosatone.selectedPlane, thisUser.sampler);
            socket.emit('unbow', icosatone.selectedPlane);
            return;
        }

        if(ev.shiftKey) { // sustain the bow, disable mouseup event
            thisUser.sustain = true;
        }
        
        icosatone.bow(icosatone.selectedPlane, thisUser.sampler);
        socket.emit('bow', icosatone.selectedPlane);
        
    });

    window.addEventListener('mouseup', (ev)=> {
        if(thisUser.sustain || ev.button > 1) return; // ignore if sustaining or not left click

        icosatone.unbow(icosatone.selectedPlane, thisUser.sampler);
        socket.emit('unbow', icosatone.selectedPlane);
    });
}

let infoShowing = true, samplesShowing = true;

/**
 * Initializees all HTML elements with user's random color, initiates CSS animations once page data and scene has loaded
 * Creates event listeners for HTML DOM elments based on color and user interaction
 */
function initDOM() {
    let color = thisUser.color;

    let infoContent = document.getElementById('info-content');
    let hideBtn = document.getElementById('info-hide-btn');
    
    let samplesHideBtn = document.getElementById('samples-hide-btn');
    let samplesContent = document.getElementById('samples-content');
    let samplesList = document.getElementById('samples-list');

    samplesContent.style.animation = 'fadeIn 1s linear 2.5s forwards';
    setTimeout(()=>{ samplesContent.style.opacity = 1 }, 3500);

    hideBtn.style.animation = 'fadeIn 1s linear 1.5s forwards';

    hideBtn.addEventListener('mouseenter', () => {
        hideBtn.style.color = color;
        hideBtn.style.textShadow = `0 0 5px ${color}`
    });
    hideBtn.addEventListener('mouseleave', () => {
        hideBtn.style.color = 'darkGray';
        hideBtn.style.textShadow = 'unset';
    });

    // hide/show animation for main info
    hideBtn.addEventListener('click', ()=> {
        if(infoShowing) {
            infoContent.style.animation = 'slideOutLeft 2s ease forwards';
            hideBtn.textContent = '>';
            infoShowing = false;
        } else {
            infoContent.style.animation = 'slideInLeft 2s ease forwards';
            hideBtn.textContent = '<';
            infoShowing = true;
        }
       
    });

    // hide/show animation for samples info
    samplesHideBtn.addEventListener('mouseenter', () => {
        samplesHideBtn.style.color = color;
        samplesHideBtn.style.textShadow = `0 0 5px ${color}`
    });
    samplesHideBtn.addEventListener('mouseleave', () => {
        samplesHideBtn.style.color = 'darkGray';
        samplesHideBtn.style.textShadow = 'unset';
    });
    samplesHideBtn.addEventListener('click', ()=> {
        if(samplesShowing) {
            samplesContent.style.animation = 'slideOutRight 2s ease forwards';
            samplesHideBtn.textContent = '<';
            samplesShowing = false;
        } else {
            samplesContent.style.animation = 'slideInRight 2s ease forwards';
            samplesHideBtn.textContent = '>';
            samplesShowing = true;
        }
       
    });

    // Appends new style rules based on the custom user color
    let newStyles = document.createElement("style");
    newStyles.appendChild(document.createTextNode(`
        #samples-content ::-webkit-scrollbar-thumb:hover { background: ${color}; }
        #start-recording:hover { box-shadow: 0 0 40px 0px ${color}; }
        .play-btn { color: ${color}; text-shadow: 0 0 15px ${color}; }
        .play-progress { box-shadow: 0 0 10px 0px ${color}; border-color: ${color}; }
    `));
    document.getElementsByTagName("head")[0].appendChild(newStyles);	

    let recordBtn = document.getElementById('start-recording');
    let recordingProgress = document.getElementById('recording-progress');
    recordingProgress.style.backgroundColor = `${color}`;
    recordingProgress.style.boxShadow = `0 0 40px 8px ${color}`;

    let infoSeparator = document.getElementById('info-separator');
    infoSeparator.style.boxShadow = `0 0 50px 8px ${color}`;
    infoSeparator.style.borderColor = color;
    infoSeparator.style.animation = 'extend 2s ease 1.5s forwards';

    let infoTitle = document.getElementById('info-title');
    infoTitle.style.animation = 'fadeIn 1s linear 0.5s forwards';

    let infoInstructions = document.getElementById('info-instructions');
    infoInstructions.style.animation = 'fadeIn 1s linear 1.5s forwards'
    
    // disables icosatone interaction when interacting with buttons on the DOM
    stopControlPropagation(hideBtn);
    stopControlPropagation(samplesHideBtn);
    stopControlPropagation(samplesList);
    stopControlPropagation(recordBtn);
}

/**
 * Initializes sample record button UI
 */
function initRecorderUI() {
    let recordBtn = document.getElementById('start-recording');
    let recordingProgress = document.getElementById('recording-progress');
    recordBtn.addEventListener('click', ()=> {
        if(recordPlayer.isPlaying) return;
        
        if(!recordPlayer.isRecording) {
            recordingProgress.style.opacity = 0.6;
            recordPlayer.startRecording();
            recordBtn.textContent = "Save";
        } else {
            recordPlayer.stopRecording();
            recordingProgress.style.width = 0;
            recordingProgress.style.opacity = 0;
            recordBtn.textContent = "Record";
        }
    })
}

/**
 * Updates sampler window DOM depending on status of record player
 */
function updateRecorder () {
    if(recordPlayer.isRecording) { // udpates width of progress bar based on max time for recording

        let recordingProgress = document.getElementById('recording-progress');

        if(recordPlayer.currentFrame == 599) {
            recordingProgress.style.width = 0;
            recordingProgress.style.opacity = 0;
            document.getElementById('start-recording').textContent = "Record";
        }
        recordingProgress.style.width = `${ recordPlayer.currentFrame/6 }%`;
    }

    else if(recordPlayer.isPlaying) { // updates width of recording progress and play/stop btn
        let recordingObj = recordPlayer.playback;
        let playbackProgress = recordingObj.htmlElement.querySelector('hr');

        if(recordPlayer.currentFrame == 599) {
            playbackProgress.style.width = 0;
            playbackProgress.style.opacity = 0;
            let playBtn = recordingObj.htmlElement.querySelector('.play-btn');
            playBtn.textContent = '\u25B6'
            playBtn.style.opacity = 0;
        }

        playbackProgress.style.width = `${ recordPlayer.currentFrame/6 }%`;
    }
}

/**
 * Helper function to update scene variables, camera aspect ratio, post processing resolutio
 */
function resizeScene() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
    composer.setSize( window.innerWidth, window.innerHeight );

    const pixelRatio = renderer.getPixelRatio();
    fxaaPass.material.uniforms[ 'resolution' ].value.x = 1 / ( window.innerWidth * pixelRatio );
    fxaaPass.material.uniforms[ 'resolution' ].value.y = 1 / ( window.innerHeight * pixelRatio );
}

/**
 * Wrapper animation function, updates individual aspects of scene/DOM capped at max FPS rate
 */
function animate() {
    setTimeout(()=> { requestAnimationFrame(animate); }, 1000/FPS); // limits to max FPS
    
    controls.update(); // updates OrbitControls

    recordPlayer.update();
    updateRecorder();
    
    icosatone.selectPlane(thisUser.plane.normal.toArray()); // adjusts user selected plane
    icosatone.update();

    composer.render();
}

/**
 * Helper function to disconnect interaction with HTML DOM element from interaction with icosatone
 * Stops propogation of mousedown and mouseup event
 * 
 * @param {HTMLElement} element HTML element to disable controls for
 */
function stopControlPropagation(element) {
    element.addEventListener('mousedown', (ev) => {
        ev.stopPropagation();
    });
    element.addEventListener('mouseup', (ev) => {
        ev.stopPropagation();
    });
}

/**
 * Creates new HTML element associated with a recording in the sampler
 * Handles play/pause events of recording
 * 
 * @param {string} name name of recording (date ISO format)
 * @param {number} id id of recording (Date.now())
 * @returns HTML element of sample-recording created
 */
function createRecordingElement(name, id) {

    // initializes HTML elements and assembles into sample-recording
    let container = document.createElement('div');
    let recordingName = document.createElement('p');
    let playBtn = document.createElement('span');
    let progressBar = document.createElement('hr');
    let samplesList = document.getElementById('samples-list');
    
    progressBar.className = 'play-progress';
    playBtn.innerText = '\u25B6';
    playBtn.className = 'play-btn';
    recordingName.innerText = name;
    container.className = 'sample-recording';
    
    container.appendChild(recordingName);
    container.appendChild(playBtn);
    container.appendChild(progressBar);

    container.addEventListener('mouseenter', ()=> {
        if(recordPlayer.isPlaying || recordPlayer.isRecording) return;
        playBtn.style.opacity = 1;
    });
    container.addEventListener('mouseleave', ()=> {
        if(recordPlayer.isPlaying || recordPlayer.isRecording) return;
        playBtn.style.opacity = 0;
    });

    // handle play/stop of recording
    container.addEventListener('click', ()=> {
        // ignore if recordPlayer is currently performing other action
        if(recordPlayer.isRecording || ( recordPlayer.isPlaying && recordPlayer.playback.timeCreated != id)) return;

        if(recordPlayer.isPlaying) {
            
            // stops all recording parts if it is already playing
            for(let user in recordPlayer.playback.userSamplers) {
                icosatone.unbowAll(recordPlayer.playback.userSamplers[user]);
            }

            let htmlElement = recordPlayer.playback.htmlElement;
            let playbackProgress = htmlElement.querySelector('hr')
            playbackProgress.style.opacity = 0;
            playbackProgress.style.width = 0;
            let playBtn = htmlElement.querySelector('.play-btn')
            playBtn.textContent = '\u25B6'
            
            recordPlayer.stopPlaying(id);
        } else {
            // starts new recording if it is not playing
            recordPlayer.startPlaying(id);

            let htmlElement = recordPlayer.playback.htmlElement;
            htmlElement.querySelector('hr').style.opacity = 1;
            htmlElement.querySelector('.play-btn').textContent = '\u23F9'
        }


    });

    // appends container to HTML body
    samplesList.insertBefore(container, samplesList.firstChild);

    return container;
}

/**
 * Helper function to generate random HSL color
 * @returns hsl color string
 */
function getRandomColor() {
    let num = Math.floor(Math.random() * 361);
    while(num < 260 && num > 225) { // exclude colors that are too dark to glow
        num = Math.floor(Math.random() * 361)
    }
    return `hsl(${num}, 100%, 70%)`;
}

/**
 * Gets the normal vector associated with a plane in THREE.js scene after applying rotation matrix transformations
 * Used to calculate closeness of planes
 * 
 * @param {THREE.BufferGeometry} geometry geometry of target plane
 * @param {THREE.Mesh} mesh mesh of target plane
 * @returns THREE.Vector3 representing normal vector of plane
 */
function getNormals(geometry, mesh) {
    geometry.computeVertexNormals();

    const tri = new THREE.Triangle();
    const indices = new THREE.Vector3(); 
    const outNormal = new THREE.Vector3();

    // gets normal of triangles associated from geometry
    indices.fromArray(geometry.index.array, 0);
    tri.setFromAttributeAndIndices(geometry.attributes.position,
        indices.x,
        indices.y,
        indices.z);
    tri.getNormal(outNormal);

    // applies matrix rotation transformations
    outNormal.applyAxisAngle(new THREE.Vector3(1,0,0), mesh.rotation.x);
    outNormal.applyAxisAngle(new THREE.Vector3(0,1,0), mesh.rotation.y);
    outNormal.applyAxisAngle(new THREE.Vector3(0,0,1), mesh.rotation.z);
    
    return(outNormal);
}

/**
 * Helper function to get the magnitude of a 3D vector
 * 
 * @param {array} vec3Array THREE.Vector3 in array form
 * @returns 
 */
function getMagnitude(vec3Array) {
    return Math.sqrt(vec3Array[0] * vec3Array[0] + vec3Array[1] * vec3Array[1] + vec3Array[2] * vec3Array[2]);
}

/**
 * Representation of a single plane in the Icosatone instrument
 * Each plane is assigned a unique chord and geometry, as well as a default user (user client)
 */
class MusicalPlane {
    /**
     * Create new MusicalPlane
     * 
     * @param {number} number plane number, determines chord
     * @param {ActiveUser} user primary user, client
     */
    constructor(number, user) {

        this.user = user;

        // creates new plane geometry based on plane number
        this.geometry = new THREE.BufferGeometry();
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

        // selects vertex indices based on plane number, then gets associated vertices from icosphere vertices
        let vertices = planeIndices.slice(6 * number, 6 * (number + 1)); // for UL/UR/LL/LR = B/C/A/D plane, indices for faces in pattern CBA ADC
        let thisPlaneVertices = new Float32Array([
            ...icoVertices.slice(vertices[0] * 3, vertices[0] * 3 +3),
            ...icoVertices.slice(vertices[1] * 3, vertices[1] * 3 +3),
            ...icoVertices.slice(vertices[2] * 3, vertices[2] * 3 +3),
            ...icoVertices.slice(vertices[4] * 3, vertices[4] * 3 +3)
        ]); // get CBA and D

        this.geometry.setIndex(planePattern);
        this.geometry.setAttribute('position', new THREE.BufferAttribute( thisPlaneVertices , 3 ));

        // set up materials and mesh
        this.fillMaterial = new THREE.MeshBasicMaterial( {
            color: user.color, 
            side: THREE.DoubleSide, 
            polygonOffset: true,
            polygonOffsetFactor: 1, 
            polygonOffsetUnits: 1,
            depthTest: false
        } );
        this.fillMaterial.transparent = true;
        this.fillMaterial.opacity = 0;

        this.lineMaterial = new LineMaterial( {
            color: user.color,
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

        this.number = number; // plane number
        this.process = null; // stores hiding/showing process
        this.trueOpacity = 0;
        this.selected = false;
        this.normal = getNormals(this.geometry, this.mesh);

        this.players = []; // stack of users currently bowing this plane
    }

    /**
     * Show the plane (fade in) with specified transition duration
     * @param {number} time time in seconds for animation
     */
    show(time = 0.25) {
        this.process = {direction: 1, time: time};
    }

    /**
     * Hide the plane (fade out) with specified transition duration
     * @param {number} time time in seconds for animation
     */
    hide(time = 0.25) {
        this.process = {direction: -1, time: time};
    }

    /**
     * Update normals of this plane
     */
    updateNormal() {
        this.normal = getNormals(this.geometry, this.mesh);
    }

    /**
     * Update opacity of this plane depending on the show/hide process, as well as user selection
     */
    updateOpacity() {
        if(this.process) {
            if(this.process.time == 0) { // if process has finished, reset values
                this.trueOpacity = ( this.direction + 1 ) / 2;
                this.process = null;
            } 

            // line opacity 1 in 0.5s, with interval of 60 updates per second
            let increment = 1 / 60 / this.process.time * this.process.direction;
        
            if(this.trueOpacity + increment >= 1) { // if show process has finished, reset values
                this.trueOpacity = 1;
                this.process = null;
            } else if(this.trueOpacity + increment <= 0) { // if hide process has finished, reset values
                this.trueOpacity = 0;
                this.process = null;
                this.lineMaterial.color.set(this.user.color); // reset color to client user color
                this.fillMaterial.color.set(this.user.color);
            } else {
                this.trueOpacity += increment; // updates true opacity based on process
            }
        }

        // if plane is selected, overwrite line opacity and color with client
        if(this.selected) { 
            this.lineMaterial.opacity = 1;
            this.lineMaterial.color.set(this.user.color);
        } else {
            this.lineMaterial.opacity = this.trueOpacity;
            this.lineMaterial.color.set(this.fillMaterial.color);
        }
        this.fillMaterial.opacity = this.trueOpacity / 4; // plane is semi-transparent
    }

    /**
     * Bow the plane, playing the chord associated with it
     * 
     * @param {UserSampler} user user initiating bow event
     */
    bow(user) {
        user.play(this.number); // play this plane on initator's UserSampler

        // add new user to plane's user stack, update plane's color to new user
        this.players.push({id: user.id, color: user.color}); 
        this.lineMaterial.color.set(user.color);
        this.fillMaterial.color.set(user.color);

        if(this.players.length == 1) this.show(); // show if new user is the first to bow the plane
    }

    /**
     * Unbow the plane, stopping the chord associated with it
     * 
     * @param {UserSampler} user user initiating unbow event
     */
    unbow(user) {

        user.stop(this.number); // update initiator's UserSampler

        this.players = this.players.filter(userObj => userObj.id != user.id); // remove user from player stack

        if(this.players.length == 0) { //
            this.hide();
        } else {
            // if there are other players, set color to most recent player
            let newColor = this.players[this.players.length-1].color;
            this.lineMaterial.color.set(newColor);
            this.fillMaterial.color.set(newColor);

        }
        
    }

}

/**
 * Representation of a virtual instrument in an icosahedron. Instrument is connected to a recorder and primary user (client)
 * Instrument contains 15 internal MusicalPlanes that users can interact with
 */
class Icosatone {
    /**
     * Creates new Icosatone based on a single user and recorder
     * 
     * @param {ActiveUser} user primary user, client 
     * @param {RecordPlayer} recorder record player attached to instrument
     */
    constructor(user, recorder) {
        this.user = user;
        this.recorder = recorder;

        this.planes = new Array(15);
        this.selectedPlane = null;
        
        this.rotationLocked = false;
        this.planeLocked = false;

        // creates icosahedron from indices, adds to Three.js scene
        const icoIndices = [
            0, 11, 5, 	0, 5, 1, 	0, 1, 7, 	0, 7, 10, 	0, 10, 11,
            1, 5, 9, 	5, 11, 4,	11, 10, 2,	10, 7, 6,	7, 1, 8,
            3, 9, 4, 	3, 4, 2,	3, 2, 6,	3, 6, 8,	3, 8, 9,
            4, 9, 5, 	2, 4, 11,	6, 2, 10,	8, 6, 7,	9, 8, 1
        ];

        let geometry = new THREE.BufferGeometry();
        geometry.setIndex(icoIndices);
        geometry.setAttribute('position', new THREE.BufferAttribute( icoVertices , 3 ));

        let wireGeometry = new WireframeGeometry2( geometry );
        this.lineMaterial = new LineMaterial( {color: 0x8F8F8F, linewidth: 2, depthTest: false} );

        this.wireframe = new Wireframe(wireGeometry, this.lineMaterial);
        scene.add( this.wireframe );

        // creates planes, randomly sets initial rotation of icosahedron upon creation
        this.initPlanes();
        this.rotate(0, Math.random() * 2 * Math.PI, 0);
    }

    /**
     * Helper function to initalize internal MusicalPlanes
     */
    initPlanes() {
        for(let i = 0; i < 15; i++) {
            this.planes[i] = new MusicalPlane(i, this.user)
        }
    }
    
    /**
     * Rotates icosatone geometry in 3D space based on Euler angles
     * Updates child MusicalPlanes
     * 
     * @param {number} x rotation in x axis, radians
     * @param {number} y rotation in y axis, radians
     * @param {number} z rotation in z axis, radians
     */
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

    /**
     * Update materials of icosatone, animates rotation
     */
    update() {
        if(!this.rotationLocked) {
            this.rotate(0, 0.003, 0); // rotates around y axis
        }
        this.lineMaterial.resolution.set( window.innerWidth, window.innerHeight );

        for(let plane of this.planes) {
            plane.updateOpacity();
            plane.lineMaterial.resolution.set( window.innerWidth, window.innerHeight );
        }


    }

    /**
     * Updates the selected plane of the icosatone based on normal vector
     * Determines closest MusicalPlane of icosatone in current orientation via cosine similarity of normal vectors
     * 
     * @param {array} normalArray array representing normal vector of the user's control plane
     */
    selectPlane(normalArray) {

        if(this.planeLocked) return; // do nothing if plane is locked (user is currently bowing)

        let closestPlane, greatestSimilarity;

        // get most similar plane by comparing normals
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

        // update child planes
        for(let i = 0; i < 15; i++) {
            if(i == closestPlane) this.planes[i].selected = true;
            else this.planes[i].selected = false;

        }

        this.selectedPlane = closestPlane;
    }

    /**
     * Bow internal MusicalPlane of icosatone, tracks to recorder if recording
     * 
     * @param {number} planeNum plane number to bow, determines chord
     * @param {UserSampler} user initator of bow action
     */
    bow(planeNum, user) {
        if(user.id == -1) {
            this.planeLocked = true; // locks plane if user is client
        }
    
        this.planes[planeNum].bow(user);
        if(this.recorder.isRecording) { // update recorder if applicable
            this.recorder.recordStroke('bow', planeNum, user.id);
        }
    }

    /**
     * Unbow internal MusicalPlane of icosatone, tracks to recorder if recording
     * 
     * @param {number} planeNum plane number to unbow, determines chord
     * @param {UserSampler} user initator of unbow action
     */
    unbow(planeNum, user) {
        if(user.id == -1) {
            this.planeLocked = false; // unlocks plane if user is client
        }

        this.planes[planeNum].unbow(user);
        if(this.recorder.isRecording) { // update recorder if applicable
            this.recorder.recordStroke('unbow', planeNum, user.id);
        }
    }

    
    /**
     * Unbow all internal MusicalPlanes of icosatone, tracks to recorder if recording
     * 
     * @param {UserSampler} user initator of unbowAll action
     */
    unbowAll(user) {
        for(let plane of this.planes) {
            plane.unbow(user);
        }
    }
}

/**
 * Representation of simple record player with playback and recording functionality paired with icosatone
 * Recorder can store up to 15 recordings, FIFO. Recording lasts up to 600 frames
 */
class RecordPlayer {

    /**
     * Create new RecordPlayer
     */
    constructor() {

        // representation of a recorder
        this.recorder = null;

        this.recordedUsers = new Set();
        this.recordingAlbum = [];

        this.playback = null;

        this.currentFrame = 0;
        this.isRecording = false;
        this.isPlaying = false;

        this.instrument = null;
    }

    /**
     * Records an action to the current recording
     * 
     * @param {string} stroke type of action ("bow", "unbow", "unbowAll")
     * @param {number} planeNum plane number of icosatone associated with action
     * @param {string} uid socket id of action initiator
     */
    recordStroke(stroke, planeNum, uid) {
        if(!this.isRecording || this.isPlaying) throw new Error(`failed to record stroke: isRecording = ${this.isRecording}, isPlaying = ${this.isPlaying}`);

        // stores to list of all users 
        if(!this.recordedUsers.has(uid)) {
            this.recordedUsers.add(uid);
        }

        // adds action to the current frame of the recorder
        this.recorder[this.currentFrame].push({stroke: stroke, planeNum: planeNum , id: uid + "_instance"});
    }

    /**
     * Start new recording, resetting previous recording cache to empty
     */
    startRecording() {
        if(this.isRecording || this.isPlaying) throw new Error(`failed to start recording: isRecording = ${this.isRecording}, isPlaying = ${this.isPlaying}`);
        
        // sets recorder to empty array of length 600, one per frame
        // each entry of the 600 is an empty array to store actions occuring on the frame
        this.recorder = Array.from({length: 600}, ()=> []);
        this.currentFrame = 0;
        this.isRecording = true;
    }

    /**
     * Stop the recording, upload to socket server
     */
    stopRecording() {
        if(this.isPlaying) throw new Error(`failed to end recording: isRecording = ${this.isRecording}, isPlaying = ${this.isPlaying}`);

        // alert and do nothing if recording is empty
        if(this.recordedUsers.size == 0) {
            this.isRecording = false;
            alert('Recording empty, not saved');
            return;
        }

        // conclude recording by cutting off all remaining active actions by each user
        for(let user of this.recordedUsers) {
            this.recorder[this.currentFrame].push({stroke: 'unbowAll', id: user + "_instance"});
        }

        // send to socket server
        socket.emit('new-recording', [this.recorder, [...this.recordedUsers]]);

        this.recordedUsers.clear();
        this.isRecording = false;
        
    }

    /**
     * Starts playing a recording stored in th recordingAlbum
     * 
     * @param {number} id id (time created) of recording to play
     */
    startPlaying(id) {
        if(this.isRecording || this.isPlaying) throw new Error(`failed to start playing: isRecording = ${this.isRecording}, isPlaying = ${this.isPlaying}`);

        // gets recording number from id
        let recordingNum = null;
        for(let i = 0; i < this.recordingAlbum.length; i++) {
            if(this.recordingAlbum[i].timeCreated == id) {
                recordingNum = i;
                break;
            }
        }

        if(recordingNum == null) throw new Error(`failed to start playing: recording not found`);

        // sets playback to recording if found
        this.playback = this.recordingAlbum[recordingNum];
        this.currentFrame = 0;
        this.isPlaying = true;
    }

    /**
     * Stops playback
     */
    stopPlaying() {
        if(this.isRecording) throw new Error(`failed to stop playing: isRecording = ${this.isRecording}, isPlaying = ${this.isPlaying}`);

        this.playback = null;
        this.isPlaying = false;
    }

    /**
     * Update playback, dispatching actions based on the current frame
     */
    updatePlayer() {
        for(let stroke of this.playback.recording[this.currentFrame]) {
            switch (stroke.stroke) {
                case 'bow':
                    this.instrument.bow(stroke.planeNum, this.playback.userSamplers[stroke.id]);
                    break;
                case 'unbow':
                    this.instrument.unbow(stroke.planeNum, this.playback.userSamplers[stroke.id]);
                    break;
                case 'unbowAll':
                    this.instrument.unbowAll(this.playback.userSamplers[stroke.id]);
            }
        }
    }

    /**
     * Update RecordPlayer based on current status of playing or recording every frame
     */
    update() {
        if(!this.isPlaying && !this.isRecording) return;

        if(this.isPlaying) this.updatePlayer();

        this.currentFrame++;

        // end recording or playing if frame has reached limit
        if(this.currentFrame == 600) {
            this.currentFrame--;
            if(this.isRecording) {
                this.stopRecording();
            } else {
                this.stopPlaying();
            }
        }
    }
}

/**
 * Set of samplers associated with a user interacting with icosatone
 * Each user is assigned their own sampler and unique color
 */
class UserSampler {
    /**
     * Create new UserSampler with unique color and id
     * 
     * @param {string} color hsl string representing color of UserSampler
     * @param {string} id socket id of user
     */
    constructor(color, id) {

        // create new Tone.js sampler
        this.sampler = new Tone.Sampler({
            "A3": "samples/A3.mp3",
        }).toDestination();

        this.color = color;
        this.soundLoops = new Array(15); 
        this.soundTimeout = null;
        this.id = id;

        this.initSampler();
    }

    /**
     * Helper function to initiate properties of Tone.js sampler
     * Creates Tone.js Loops for each chord using the sampler to allow sustained playing
     */
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

        // creates 15 loops (one per plane of icosatone), each triggering every second
        for(let i = 0; i < 15; i++) {
            this.soundLoops[i] = new Tone.Loop((time)=> {
                this.sampler.triggerAttack(chords[i].pitches);
            }, 1);
        }
    }

    /**
     * Play chord using sampler, starting the associated loop
     * 
     * @param {number} chordNum number of chord to play
     */
    play(chordNum) {
        clearInterval(this.soundTimeout);
        let now = Tone.now();

        // starts sound loop and also triggers sound immediately since actions aren't necessarily synced with Tone transport
        this.soundLoops[chordNum].start(now);
        this.sampler.triggerAttack(chords[chordNum].pitches);

        // triggers sound after 0.25s delay in case the chord was stopped then started (doubleclick)
        this.soundTimeout = setTimeout(()=>{this.sampler.triggerAttack(chords[chordNum].pitches)}, 250);
    }

    /**
     * Stop playing chord using sampler, stopping the associated loop
     * 
     * @param {number} chordNum number of chord to stop
     */
    stop(chordNum) {
        clearTimeout(this.soundTimeout);
        let now = Tone.now();

        // stops sound loop and triggers release immediately
        this.soundLoops[chordNum].stop(now);
        this.sampler.triggerRelease(chords[chordNum].pitches);

        // triggers cutoff after 0.25s delay in case the next cycle of the loop already triggered
        this.soundTimeout = setInterval(()=>{this.sampler.triggerRelease(chords[chordNum].pitches)}, 10);
    }
}

/**
 * Wrapper for active client, stores hidden user control plane
 */
class ActiveUser {

    /**
     * Create new ActiveUser with specified color
     * @param {string} color hsl representation of color
     */
    constructor(color) {
        this.color = color;
        this.sampler = new UserSampler(color, -1); // -1 id represents active user
        this.plane = null;
        this.sustain = false;

        this.initPlane();

    }

    /**
     * Helper function to create user control plane
     */
    initPlane() {

        // creates plane at center of scene
        const userPlaneVertices = new Float32Array([
            -1, 0, -1,
            -1, 0, 1,
            1, 0, -1,
            1, 0, 1
        ]);
        
        const userPlaneIndices = [
            0, 1, 2,    2, 3, 1
        ];

        let planeGeometry = new THREE.BufferGeometry();
        planeGeometry.setIndex(userPlaneIndices);
        planeGeometry.setAttribute('position', new THREE.BufferAttribute(userPlaneVertices, 3));
        let materialColor = this.color;

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
    
        let planeMesh = new THREE.Mesh(planeGeometry, fillMaterial)
        
        this.plane = {
            mesh: planeMesh,
            geometry: planeGeometry, 
            normal: getNormals(planeGeometry, planeMesh),
        };
    }

    /**
     * Updates the rotation of the user plane based on location of user's mouse
     * Called by window mousemove event listener
     * 
     * @param {MouseEvent} ev mouse move event
     * @param {Icosatone} instrument scene icosatone to interact with
     */
    updatePlane(ev, instrument) {
        if(instrument.planeLocked) return; // do nothing if plane is locked (user is already bowing)
    
        // gets rotation Z and X based on mouse position on the plane
        let newRotation = [ -1 * (ev.clientX / window.innerWidth - 0.5) * Math.PI, (ev.clientY / window.innerHeight - 0.5) * Math.PI];
    
        // normalizes rotation amount
        let magnitude = Math.sqrt(Math.pow(newRotation[0], 2) + Math.pow(newRotation[1], 2))
        if(magnitude > Math.PI / 2) {
            newRotation[0] = newRotation[0] / magnitude * Math.PI / 2;
            newRotation[1] = newRotation[1] / magnitude * Math.PI / 2;
        }
    
        // updates plane and normals
        this.plane.mesh.rotation.z = newRotation[0];
        this.plane.mesh.rotation.x = newRotation[1];

        this.plane.normal = getNormals(this.plane.geometry, this.plane.mesh);
    }
}