# Icosatonic
Virtual, collaborative instrument   
Live at http://esz7923.imany.io:8080/   
Edward Zhou 12/2023   
   
Summary  
---
Icosatonic is a virtual space that allows users to collaboratively play a digital instrument to produce unique and mesmerizing music without requiring extensive musical knowledge or practice. Users can play the instrument live and hear others’ playing simultaneously. Users can also record music created within a short time span, which is stored temporarily and anonymously.   

Demo
---

https://github.com/edwardszhou/icosatonic/assets/123663456/1e966a52-a09b-49ba-8233-78e1c6b4344f


Motivation  
---  
I created this project as an attempt to allow live music to be shared between users who may not be proficient in music or may not have the time and dedication to practice an instrument, but still want to create something beautiful with others. Music is a shared experience, and I wanted to reimagine music in a virtual space using a virtual instrument. Furthermore, I wanted to maintain the ephemeral value of live music while also de-stigmatizing musical exploration by providing an anonymous, short library of music where users can share and enjoy others’ creations as well.
   
Process:
---  
_Part I: Visuals_  
   
The visuals of the project are largely built using Three.js. The virtual instrument is represented by an icosahedron rendered as a neutral-colored shape rotating at a constant speed. 15 total planes bisecting the shape are “playable” chords of the shape. When a plane within the icosahedron is bowed, the vertices and edges lining the plane change to a neon color assigned to the user who bowed the plane. Each of these planes and the shape itself correspond to a BufferGeometry in a mesh in the Three.js scene.   
   
_Part II: Audio_   
   
Each plane within the icosahedron is assigned a 4-note chord variation within a pentatonic scale, a set of notes that notably work well together. The 15 planes are mapped to follow the pentatonic scales of various chord degrees of the C major scale:   
   
C major pentatonic – 5 variations CDEG – DEGA – EGAC – GACD – ACDE   
F major pentatonic – 5 variations (1 repeat) FGAC – GACD – ACDF – CDFG – DFGA   
G major pentatonic – 5 variation (1 repeat) GABD – ABDE – BDEG – DEGA – EGAB   
   
The project produces these chords using Tone.js by sampling a cello and adjusting its pitch to match the chords above. Each user is assigned a set of Tone.js audio loops, one for each chord.   
   
_Part III: Interaction, Liveness_   
   
Each user is offered a random different perspective to bow the icosahedron. Users will hear and see other users’ bowing on the icosahedron. Using the mouse, users can weight a plane in 3D as if a plane was centered and balanced on a tip. and the mouse could apply weight to the plane. Within the 15 internal bisecting planes of the icosahedron, the nearest to the user’s plane will become highlighted. When the user clicks down, the user’s plane becomes fixed, and the chord will play. The liveness is achieved through extensive tracking of user-related data via socket.io. Users can also create short recordings of the sounds that are being created in the moment, which is saved to an NeDB database and communicated to other users via socket.io.   
   
Next Steps:   
---   
Future steps I would like to explore include a more intuitive way of interacting with the project, ex. using a cell phone’s gyroscope to control plane selection. I would also like to allow more than 15 (technically 13 unique) chords to be played by allowing users to control their octave and potentially volume.
