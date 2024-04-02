let isDrawing = false;
let startCoord = null;
let endCoord = null;
let gl;
let lineDrawn = false;
let linesData = []; 

window.onload = function() {
    // Mendapatkan konteks WebGL dari elemen canvas
    var canvas = document.getElementById('canvas');
    gl = canvas.getContext('webgl');

    if (!gl) {
        console.error('WebGL tidak tersedia.');
        return;
    }

    // Background canvas color
    gl.clearColor(0.5, 0.5, 0.5, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    let vertexShaderSource = document.querySelector("#vertex-shader-2d").text;
    let fragmentShaderSource = document.querySelector("#fragment-shader-2d").text;
    let vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    // Create WebGL program
    let program = createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    // Get attribute location
    let positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    let resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
    let colorUniformLocation = gl.getUniformLocation(program, "u_color");

    // Create buffer
    let positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    // set resolution and color
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
    gl.uniform4fv(colorUniformLocation, [0, 0, 1, 1]);
    
    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseup", onMouseUp);

    document.getElementById("clearButton").addEventListener("click", clearCanvas);

    // console.log(linesData)
    
};

function createShader(gl, type, source) {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
      return shader;
    }
  
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}
  
function createProgram(gl, vertexShader, fragmentShader) {
    let program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    let success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
      return program;
    }
  
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

function drawLine(startX, startY, endX, endY) {
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([startX, startY, endX, endY]), gl.STATIC_DRAW);
    gl.drawArrays(gl.LINE_STRIP, 0, 2);
    lineDrawn = true;
}
  
function onMouseDown(e) {
    if (!lineDrawn) {
        isDrawing = true;
        startCoord = {
            x: e.offsetX / canvas.width * 2 - 1,
            y: (canvas.height - e.offsetY) / canvas.height * 2 - 1
        };
        endCoord = startCoord;
    }
}
  
function onMouseMove(e) {
    if (isDrawing) {
        endCoord = {
            x: e.offsetX / canvas.width * 2 - 1,
            y: (canvas.height - e.offsetY) / canvas.height * 2 - 1
        };

        gl.clear(gl.COLOR_BUFFER_BIT);
        drawLine(startCoord.x, startCoord.y, endCoord.x, endCoord.y);

    }
}
  
function onMouseUp(e) {
    if (isDrawing) {
        isDrawing = false;
        lineDrawn = true;
        linesData.push(startCoord.x, startCoord.y, endCoord.x, endCoord.y);
    }
}

function clearCanvas() {
    if (!gl) {
        console.error('Konteks WebGL tidak tersedia.');
        return;
    }
    gl.clear(gl.COLOR_BUFFER_BIT);
    lineDrawn = false;
    linesData = [];
    // console.log(linesData);
}
