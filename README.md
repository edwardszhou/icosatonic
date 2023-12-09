Project Notes:

3D Rotating Musical Icosahedron

---

Rendering:
	
The icosahedron will be rendered as a neutral-colored (white/gray), and will rotate at a constant speed. When a plane within the icosahedron is bowed, the vertices and edges lining the plane will change to a neon color assigned to the user who bowed the plane. Neon edges should bloom. When multiple users bow a common vertex, the color will be a mix of the users' colors.

---

Music:

Each plane within the icosahedron crossing the center is assigned a 4-note chord variation within a pentatonic scale. The music will follow the pentatonic scales of various chord degrees of the C major scale:
1. C major pentatonic - 5 variations
CDEG - DEGA - EGAC - GACD - ACDE
2. F major pentatonic - 5 variations (1 repeat)
FGAC - GACD - ACDF - CDFG - DFGA
3. G major pentatonic - 5 variation (1 repeat)
GABD - ABDE - BDEG - DEGA - EGAB
Octave will be default center on the piano, sound produced will sample violin or cello using Tone.js. Volume will be controlled by user interaction.

---

Liveness:

Each user will be offered a semi-random different perspective to bow the icosahedron. Users will hear and see other users' bowing on the icosahedron.

If time allows, add pairing to users' cell phones as medium of interaction using gyroscope.

---

Interaction:

Using the mouse, users can weight a plane in 3D as if a plane was centered and balanced on a tip. and the mouse could apply weight to the plane. Within the 15 internal bisecting planes of the icosahedron, the nearest to the user's plane will become highlighted. When the user clicks down, the user's plane becomes fixed. While the mouse is moving and the click is held down, the corresponding chord will be produced, with volume proportional to the velocity of the mouse and pitch proportional to the verticality of the mouse's movement (horizontal = lower, vertical = higher).

If time allows, allow users to use their cell phone as medium of interaction using accelerometer and gyroscope to replace above.
