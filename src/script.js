let isDrawing = false;
let startCoord = null;
let endCoord = null;
let gl;
let lineDrawn = false;
let linesData = [];
let squaresData = [];
let drawMode = 'line';
let program;
let positionAttributeLocation;
let colorUniformLocation;
let positionBuffer;
let colorBuffer;
let colorAttributeLocation;

window.onload = function() {
    var canvas = document.getElementById('canvas');
    gl = canvas.getContext('webgl');

    if (!gl) {
        console.error('WebGL not available.');
        return;
    }

    gl.clearColor(0.5, 0.5, 0.5, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    let vertexShaderSource = document.querySelector("#vertex-shader-2d").text;
    let fragmentShaderSource = document.querySelector("#fragment-shader-2d").text;
    let vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    program = createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    let resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
    let colorUniformLocation = gl.getUniformLocation(program, "u_color");

    let positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
    // gl.uniform4fv(colorUniformLocation, [0, 0, 1, 1]);
    
    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseup", onMouseUp);

    document.getElementById("clear").addEventListener("click", clearCanvas);
    document.getElementById("line").addEventListener("click", () => {
        drawMode = 'line';
    });
    document.getElementById("rectangle").addEventListener("click", () => {
        drawMode = 'square';
    });

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
        gl.useProgram(program);
        colorUniformLocation = gl.getUniformLocation(program, "u_color");
        positionAttributeLocation = gl.getAttribLocation(program, "a_position");
        colorAttributeLocation = gl.getAttribLocation(program, "a_color");
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

function drawSquare(program, startX, startY, endX, endY) {
    let minX = Math.min(startX, endX);
    let minY = Math.min(startY, endY);
    let width = Math.abs(endX - startX);
    let height = Math.abs(endY - startY);
    
    let topLeftX = minX;
    let topLeftY = minY;
    let topRightX = minX + width;
    let topRightY = minY;
    let bottomLeftX = minX;
    let bottomLeftY = minY + height;
    let bottomRightX = minX + width;
    let bottomRightY = minY + height;
    
    let squareVertices = [
        topLeftX, topLeftY,
        topRightX, topRightY,
        bottomRightX, bottomRightY,
        bottomLeftX, bottomLeftY,
        topLeftX, topLeftY
    ];

    // TODO: Set Color untuk persegi
    let colorData = [
    0, 1, 0, 1,
    0, 1, 0, 1,
    0, 1, 0, 1,
    0, 1, 0, 1
    ];

    // ikat buffer untuk atribut posisi
    let positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(squareVertices), gl.STATIC_DRAW);

    // atur pointer atribut untuk buffer posisi
    let positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

function onMouseDown(e) {
    if (!lineDrawn) {
        isDrawing = true;
        startCoord = {
            x: e.offsetX / canvas.width * 2 - 1,
            y: (canvas.height - e.offsetY) / canvas.height * 2 - 1
        };
        endCoord = startCoord;
    } else {
        isDrawing = true;
    }
}

function onMouseMove(e) {
    if (isDrawing) {
        endCoord = {
            x: e.offsetX / canvas.width * 2 - 1,
            y: (canvas.height - e.offsetY) / canvas.height * 2 - 1
        };

        gl.clear(gl.COLOR_BUFFER_BIT);
        drawLines()
        drawSquares()
        if (drawMode === 'line') {
            drawLine(startCoord.x, startCoord.y, endCoord.x, endCoord.y);
        } else if (drawMode === 'square') {
            gl.useProgram(program);
            drawSquare(program, startCoord.x, startCoord.y, endCoord.x, endCoord.y);
        }

    }
}

function onMouseUp(e) {
    if (isDrawing) {
        isDrawing = false;
        lineDrawn = false;
        if (drawMode === 'line') {
            linesData.push(startCoord.x, startCoord.y, endCoord.x, endCoord.y);
            tambahShapeKeDaftar('garis', startCoord.x, startCoord.y, endCoord.x, endCoord.y);
        } else if (drawMode === 'square') {
            squaresData.push({ startX: startCoord.x, startY: startCoord.y, endX: endCoord.x, endY: endCoord.y });
            tambahShapeKeDaftar('persegi', startCoord.x, startCoord.y, endCoord.x, endCoord.y);
        }
    }
}

function clearCanvas() {
    if (!gl) {
        console.error('WebGL not available.');
        return;
    }
    gl.clear(gl.COLOR_BUFFER_BIT);
    lineDrawn = false;
    linesData = [];
    squaresData = [];
    const shapeListElem = document.getElementById("shapeList");
    shapeListElem.innerHTML = "";
}

function tambahShapeKeDaftar(type, startX, startY, endX, endY) {
    const shapeListElem = document.getElementById("list");
    const shapeItemElem = document.createElement("div");
    if (type === 'garis') {
        shapeItemElem.textContent = `Line (${startX},${startY}) - (${endX},${endY})`;
    } else if (type === 'persegi') {
        shapeItemElem.textContent = `Square (${startX},${startY}) - (${endX},${endY})`;
    }
    shapeItemElem.addEventListener("click", function() {
        hapusShapeDariDaftar(type, startX, startY, endX, endY);
    });

    shapeListElem.appendChild(shapeItemElem);
}

function hapusShapeDariDaftar(type, startX, startY, endX, endY) {
    const shapeListElem = document.getElementById("list");
    for (let i = 0; i < shapeListElem.children.length; i++) {
        const shapeItemElem = shapeListElem.children[i];
        const shapeText = shapeItemElem.textContent;
        if (type === 'garis' && shapeText.includes(`(${startX},${startY}) - (${endX},${endY})`)) {
            shapeListElem.removeChild(shapeItemElem);
            break;
        } else if (type === 'persegi' && shapeText.includes(`(${startX},${startY}) - (${endX},${endY})`)) {
            shapeListElem.removeChild(shapeItemElem);
            break;
        }
    }
    if (type === 'garis') {
        for (let i = 0; i < linesData.length; i += 4) {
            if (
                linesData[i] === startX &&
                linesData[i + 1] === startY &&
                linesData[i + 2] === endX &&
                linesData[i + 3] === endY
            ) {
                linesData.splice(i, 4);
                redrawCanvas();
                break;
            }
        }
    } else if (type === 'persegi') {
        for (let i = 0; i < squaresData.length; i++) {
            let square = squaresData[i];
            if (
                square.startX === startX &&
                square.startY === startY &&
                square.endX === endX &&
                square.endY === endY
            ) {
                squaresData.splice(i, 1);
                redrawCanvas();
                break;
            }
        }
    }
}


function redrawCanvas() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    drawLines();
    drawSquares();
}

function drawLines() {
    for (let i = 0; i < linesData.length; i += 4) {
        let startX = linesData[i];
        let startY = linesData[i + 1];
        let endX = linesData[i + 2];
        let endY = linesData[i + 3];
        drawLine(startX, startY, endX, endY);
    }
}

function drawSquares() {
    // console.log(squaresData)
    for (let i = 0; i < squaresData.length; i++) {
        let square = squaresData[i];
        let startX = square.startX;
        let startY = square.startY;
        let endX = square.endX;
        let endY = square.endY;
        drawSquare(program, startX, startY, endX, endY);
    }
}
