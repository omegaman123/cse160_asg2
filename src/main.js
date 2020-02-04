let canvas;
let gl;
let n;
let eye = {"x":30,"y":30,"z":30};
let gAnimalGlobalRotation;
let globalAngle = 0;
let ANGLE_STEP = 45.0;
let g_ANGLE_STEP = ANGLE_STEP;


var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Color;\n' +
    'uniform mat4 u_MvpMatrix;\n' +
    'varying vec4 v_Color;\n' +
    'uniform mat4 u_GlobalRotation;\n'+
    'void main() {\n' +
    '  gl_Position = u_GlobalRotation * u_MvpMatrix * a_Position;\n' +
    '  v_Color = a_Color;\n' +
    '}\n';

// Fragment shader program
var FSHADER_SOURCE =
    '#ifdef GL_ES\n' +
    'precision mediump float;\n' +
    '#endif\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_FragColor = v_Color;\n' +
    '}\n';
let shapes = [];
let cAngle = 0;


function main() {
    // Retrieve <canvas> element
    canvas = document.getElementById('canvas');

    // Get the rendering context for WebGL
    gl = canvas.getContext("webgl");
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    n = initVertexBuffers(gl);

    var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
    if (!u_MvpMatrix) {
        console.log('Failed to get the storage location of u_MvpMatrix');
        return;
    }

    gAnimalGlobalRotation = new Matrix4();
    gAnimalGlobalRotation.setRotate(0,0,0,1);

    var mvpMatrix = new Matrix4();

    //back left leg 0
    shapes.push({"center":{"x":2,"y":0,"z":4},
        "u_MvpMatrix":u_MvpMatrix,
        "mvpMatrix":mvpMatrix,
        "angle":0,
        "scale":{"x":1,"y":5,"z":2},
        "anim": {"angle": 0, "x":-1, "y":0, "z":0}});

    //back right leg 1
    shapes.push({"center":{"x":-2,"y":0,"z":4},
        "u_MvpMatrix":u_MvpMatrix,
        "mvpMatrix":mvpMatrix,
        "angle":0,
        "scale":{"x":1,"y":5,"z":2},
        "anim": {"angle": 0, "x":1, "y":0, "z":0}});


    //front left leg 2
    shapes.push({"center":{"x":2,"y":0,"z":-4},
        "u_MvpMatrix":u_MvpMatrix,
        "mvpMatrix":mvpMatrix,
        "angle":0,
        "scale":{"x":1,"y":5,"z":2},
        "anim": {"angle": 0, "x":-1, "y":0, "z":0}});


    //front right leg 3
    shapes.push({"center":{"x":-2,"y":1,"z":-4},
        "u_MvpMatrix":u_MvpMatrix,
        "mvpMatrix":mvpMatrix,
        "angle":0,
        "scale":{"x":1,"y":5,"z":2},
        "anim": {"angle": 0, "x":1, "y":0, "z":0}});

    //body 4
    shapes.push({"center":{"x":0,"y":5,"z":0},
        "u_MvpMatrix":u_MvpMatrix,
        "mvpMatrix":mvpMatrix,
        "angle":0,
        "scale":{"x":4,"y":2,"z":8},
        "anim": {"angle": 0, "x":0, "y":0, "z":0}});
    //neck ? 5
    shapes.push({"center":{"x":0,"y":7,"z":7},
             "u_MvpMatrix":u_MvpMatrix,
             "mvpMatrix":mvpMatrix,
             "angle":45,
             "scale":{"x":2,"y":4,"z":1.5},
             "anim": {"angle": 0, "x":0, "y":0, "z":0}});

    //head 6
    shapes.push({"center":{"x":0,"y":10,"z":9},
             "u_MvpMatrix":u_MvpMatrix,
              "mvpMatrix":mvpMatrix,
              "angle":90,
              "scale":{"x":2.5,"y":4,"z":1.5},
               "anim": {"angle": 0, "x":0, "y":0, "z":1} });

    var tick = function(){
        cAngle = animate(cAngle);
        shapes[6].anim.angle = cAngle;
        shapes[0].anim.angle = cAngle;
        shapes[1].anim.angle = cAngle;
        shapes[2].anim.angle = cAngle;
        shapes[3].anim.angle = cAngle;
        console.log(cAngle);
        drawAnimal(shapes,mvpMatrix);
        requestAnimationFrame(tick,canvas);
    };

    tick();

}


function drawAnimal(shapeArr) {
    // Set clear color and enable hidden surface removal
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    // console.log(mvpMatrix);
    var u_GlobalRotation = gl.getUniformLocation(gl.program,'u_GlobalRotation');
    gl.uniformMatrix4fv(u_GlobalRotation, false, gAnimalGlobalRotation.elements);

    for (let i = 0; i < shapeArr.length; i++){
        shapes[i].mvpMatrix.setPerspective(50, canvas.width / canvas.height, 1, 1000);
        shapes[i].mvpMatrix.lookAt(eye.x, eye.y, eye.z, 0, 0, 0, 0, 1, 0);
        drawCube(shapeArr[i].center,
                 shapeArr[i].u_MvpMatrix,
                 shapes[i].mvpMatrix,
                 shapeArr[i].angle,
                 shapeArr[i].scale,
                 shapeArr[i].anim);
    }
}

function initShaders(gl, vsrc, fsrc) {
    // initShaders is really poorly designed. Most WebGL programs need multiple shader programs
    // but this function assumes there will only ever be one shader program
    // Also you should never assign values to the gl context.
    gl.program = twgl.createProgram(gl, [vsrc, fsrc]);
    gl.useProgram(gl.program);
    return gl.program;
}

function drawCube(center,u_MvpMatrix,mvpMatrix,angle,scale,anim) {
    let model = new Matrix4();
    model.setRotate(globalAngle, 0, 1, 0);
    model.translate(center.x,center.y,center.z);
    model.rotate(angle,1,0,0);
    if (anim.x !== 0 || anim.y !== 0 || anim.z !== 0){
        model.rotate(anim.angle,anim.x,anim.y,anim.z);
    }
    model.scale(scale.x,scale.y,scale.z);

    let mvp = new Matrix4();
    mvp.set(mvpMatrix);
    // mvp.rotate(cAngle,0,1,0);
    mvp.multiply(model);

    // Pass the model view projection matrix to u_MvpMatrix
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvp.elements);
    // Clear color and depth buffe

    // Draw the cube
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}


var g_last = Date.now();

function animate(angle) {
    // Calculate the elapsed time
    var now = Date.now();
    var elapsed = now - g_last;
    g_last = now;
    if (angle > 25) {
        g_ANGLE_STEP = -ANGLE_STEP;
    } else if (angle < -25) {
        g_ANGLE_STEP = ANGLE_STEP;
    }
    // Update the current rotation angle (adjusted by the elapsed time)
    var newAngle = angle + (g_ANGLE_STEP * elapsed) / 1000.0;
    newAngle%= 360;
    return newAngle;
}

function initVertexBuffers(gl) {
    // Create a cube
    //    v6----- v5
    //   /|      /|
    //  v1------v0|
    //  | |     | |
    //  | |v7---|-|v4
    //  |/      |/
    //  v2------v3
    let verticesColors = new Float32Array([
        // Vertex coordinates and color
        1.0,  1.0,  1.0,     1.0,  1.0,  1.0,  // v0 White
        -1.0,  1.0,  1.0,     1.0,  0.0,  1.0,  // v1 Magenta
        -1.0, -1.0,  1.0,     1.0,  0.0,  0.0,  // v2 Red
        1.0, -1.0,  1.0,     1.0,  1.0,  0.0,  // v3 Yellow
        1.0, -1.0, -1.0,     0.0,  1.0,  0.0,  // v4 Green
        1.0,  1.0, -1.0,     0.0,  1.0,  1.0,  // v5 Cyan
        -1.0,  1.0, -1.0,     0.0,  0.0,  1.0,  // v6 Blue
        -1.0, -1.0, -1.0,     0.0,  0.0,  0.0   // v7 Black
    ]);

    // Indices of the vertices
    let indices = new Uint8Array([
        0, 1, 2,   0, 2, 3,    // front
        0, 3, 4,   0, 4, 5,    // right
        0, 5, 6,   0, 6, 1,    // up
        1, 6, 7,   1, 7, 2,    // left
        7, 4, 3,   7, 3, 2,    // down
        4, 7, 6,   4, 6, 5     // back
    ]);

    // Create a buffer object
    let vertexColorBuffer = gl.createBuffer();
    var indexBuffer = gl.createBuffer();
    if (!vertexColorBuffer || !indexBuffer) {
        return -1;
    }

    // Write the vertex coordinates and color to the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

    var FSIZE = verticesColors.BYTES_PER_ELEMENT;
    // Assign the buffer object to a_Position and enable the assignment
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if(a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return -1;
    }
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
    gl.enableVertexAttribArray(a_Position);
    // Assign the buffer object to a_Color and enable the assignment
    var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    if(a_Color < 0) {
        console.log('Failed to get the storage location of a_Color');
        return -1;
    }
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
    gl.enableVertexAttribArray(a_Color);

    // Write the indices to the buffer object
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    return indices.length;
}


document.getElementById('myRange').oninput = function () {
    gl.clearColor(0,0,0,0);
    eye.x = document.getElementById('myRange').value;
    drawAnimal(shapes)
};

document.getElementById('myRange1').oninput = function () {
    gl.clearColor(0,0,0,0);
    eye.y = document.getElementById('myRange1').value;
    drawAnimal(shapes)
};
document.getElementById('myRange2').oninput = function () {
    gl.clearColor(0,0,0,0);
    eye.z = document.getElementById('myRange2').value;
    drawAnimal(shapes)
};

document.getElementById('gRotation').oninput = function () {
    gl.clearColor(0,0,0,0);
    // gAnimalGlobalRotation.setRotate(document.getElementById('gRotation').value,0,1,0);
    globalAngle = document.getElementById('gRotation').value;
    drawAnimal(shapes)
};

