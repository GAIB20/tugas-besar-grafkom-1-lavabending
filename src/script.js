let isDrawing = false;
let startCoord = null;
let endCoord = null;
let gl;
let lineDrawn = false;
let linesData = [];
let rectanglesData = [];
let squaresData = [];
let polygonsData = [];
let drawMode = 'line';
let program;
let positionAttributeLocation;
let colorUniformLocation;
let positionBuffer;
let colorBuffer;
let colorAttributeLocation;
let polygonDrawing = false;
let currentPolygonPoints = [];
let currentrectangleVertices = [];
let currentlineVertices = [];
let currentsquareVertices = [];

window.onload = function() {
    var canvas = document.getElementById('canvas');
    gl = canvas.getContext('webgl');

    if (!gl) {
        console.error('WebGL not available.');
        return;
    }

    gl.clearColor(1.0, 1.0, 1.0, 1.0);
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
    gl.uniform4fv(colorUniformLocation, [0, 0, 1, 1]);
    
    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseup", onMouseUp);

    document.getElementById("clear").addEventListener("click", clearCanvas);
    document.getElementById("line").addEventListener("click", () => {
        drawMode = 'line';
        document.getElementById("startDrawing").style.display = "none";
    });
    document.getElementById("rectangle").addEventListener("click", () => {
        drawMode = 'rectangle';
        document.getElementById("startDrawing").style.display = "none";
    });
    document.getElementById("square").addEventListener("click", () => {
        drawMode = 'square';
        document.getElementById("startDrawing").style.display = "none";
    });
    document.getElementById("polygon").addEventListener("click", () => {
        drawMode = 'polygon';
        document.getElementById("startDrawing").style.display = "block";
    });

    document.getElementById("startDrawing").addEventListener("click", startDrawingPolygon);
    document.getElementById("finishDrawing").addEventListener("click", finishDrawingPolygon);

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
    currentlineVertices = [startX, startY, endX, endY];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([startX, startY, endX, endY]), gl.STATIC_DRAW);
    gl.drawArrays(gl.LINE_STRIP, 0, 2);
    lineDrawn = true;
}

function redrawLine(program, lineVertices) {
    // console.log("buat line lagi")
    // Bind buffer for position attribute
    let positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lineVertices), gl.STATIC_DRAW);

    // Set attribute pointer for position buffer
    let positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    // Draw the line
    gl.drawArrays(gl.LINE_STRIP, 0, 2);

}

function drawRectangle(program, startX, startY, endX, endY) {
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
    
    currentrectangleVertices = [
        topLeftX, topLeftY,
        topRightX, topRightY,
        bottomRightX, bottomRightY,
        bottomLeftX, bottomLeftY,
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
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(currentrectangleVertices), gl.STATIC_DRAW);

    // atur pointer atribut untuk buffer posisi
    let positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

function redrawRectangle(program, rectangleVertices) {
    // ikat buffer untuk atribut posisi
    let positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rectangleVertices), gl.STATIC_DRAW);

    // atur pointer atribut untuk buffer posisi
    let positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

}

function drawSquare(program, startX, startY, endX, endY) {
    let minX = Math.min(startX, endX);
    let minY = Math.min(startY, endY);
    let sideLength = Math.abs(endX - startX);
    
    // Ensure that width and height are the same for a square
    let width = sideLength;
    let height = sideLength;
    
    let topLeftX = minX;
    let topLeftY = minY;
    let topRightX = minX + width;
    let topRightY = minY;
    let bottomLeftX = minX;
    let bottomLeftY = minY + height;
    let bottomRightX = minX + width;
    let bottomRightY = minY + height;
    
    currentsquareVertices = [
        topLeftX, topLeftY,
        topRightX, topRightY,
        bottomRightX, bottomRightY,
        bottomLeftX, bottomLeftY,
    ];

    // Set color for the square
    let colorData = [
    0, 1, 0, 1,
    0, 1, 0, 1,
    0, 1, 0, 1,
    0, 1, 0, 1
    ];

    // ikat buffer untuk atribut posisi
    let positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(currentsquareVertices), gl.STATIC_DRAW);

    // atur pointer atribut untuk buffer posisi
    let positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

function redrawSquare(program, squareVertices) {
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

function startDrawingPolygon() {
    polygonDrawing = true;
    currentPolygonPoints = [];
    document.getElementById("startDrawing").style.display = "none";
    document.getElementById("finishDrawing").style.display = "block";
}

function finishDrawingPolygon() {
    polygonDrawing = false;
    if (currentPolygonPoints.length >= 3) {
        tambahShapeKeDaftar('polygon', currentPolygonPoints);
        redrawCanvas();
        document.getElementById("startDrawing").style.display = "block";
        document.getElementById("finishDrawing").style.display = "none";
        currentPolygonPoints = [];
    } else {
        alert("Minimal 3 titik diperlukan untuk membuat poligon.");
    }

}

function onMouseDown(e) {
    if (polygonDrawing) {
        currentPolygonPoints.push([
            e.offsetX / canvas.width * 2 - 1,
            (canvas.height - e.offsetY) / canvas.height * 2 - 1
        ]);
        redrawCanvas();
    } else if (!lineDrawn) {
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
        drawRectangles()
        drawSquares()
        drawPolygons()
        if (drawMode === 'line') {
            drawLine(startCoord.x, startCoord.y, endCoord.x, endCoord.y);
        } else if (drawMode === 'rectangle') {
            gl.useProgram(program);
            drawRectangle(program, startCoord.x, startCoord.y, endCoord.x, endCoord.y);
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
            tambahShapeKeDaftar('garis', currentlineVertices);
            currentlineVertices = [];
        } else if (drawMode === 'rectangle') {
            tambahShapeKeDaftar('persegi-panjang', currentrectangleVertices);
            currentrectangleVertices = [];
        } else if (drawMode === 'square') {
            tambahShapeKeDaftar('persegi', currentsquareVertices);
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
    rectanglesData = [];
    squaresData = [];
    polygonsData = [];
    const shapeListElem = document.getElementById("list");
    shapeListElem.innerHTML = "";
}

function tambahShapeKeDaftar(type, data) {
    const shapeListElem = document.getElementById("list");
    const shapeItemElem = document.createElement("div");
    if (type === 'garis') {
        // shapeItemElem.textContent = `Line (${startX},${startY}) - (${endX},${endY})`;
        let points = '';
        for (let i = 0; i < data.length; i += 2) {
            points += `(${data[i]},${data[i + 1]}) `;
        }
        shapeItemElem.textContent = `Line ${points}`;
        linesData.push(data);
    } else if (type === 'persegi-panjang') {
        let points = '';
        for (let i = 0; i < data.length; i += 2) {
            points += `(${data[i]},${data[i + 1]}) `;
        }
        shapeItemElem.textContent = `Rectangle ${points}`;
        rectanglesData.push(data);
    } else if (type === 'persegi') {
        // shapeItemElem.textContent = `Square (${startX},${startY}) - (${endX},${endY})`;
        let points = '';
        for (let i = 0; i < data.length; i += 2) {
            points += `(${data[i]},${data[i + 1]}) `;
        }
        shapeItemElem.textContent = `Square ${points}`;
        squaresData.push(data);
    } else if (type === 'polygon') {
        let points = '';
        for (let i = 0; i < data.length; i++) {
            points += `(${data[i][0]},${data[i][1]}) `;
        }
        shapeItemElem.textContent = `Polygon ${points}`;
        polygonsData.push(data);
    }
    shapeItemElem.addEventListener("click", function() {
        hapusShapeDariDaftar(type, data);
    });

    shapeListElem.appendChild(shapeItemElem);
}

function hapusShapeDariDaftar(type, data) {
    const shapeListElem = document.getElementById("list");
    for (let i = 0; i < shapeListElem.children.length; i++) {
        const shapeItemElem = shapeListElem.children[i];
        const shapeText = shapeItemElem.textContent;
        let points = '';
        if (type === 'garis' || type === 'persegi-panjang' || type === 'persegi') {
            for (let i = 0; i < data.length; i += 2) {
                points += `(${data[i]},${data[i + 1]}) `;
            }
        } else if (type === 'polygon') {
            for (let i = 0; i < data.length; i++) {
                points += `(${data[i][0]},${data[i][1]}) `;
            }
        }
        console.log(points)
        if (type === 'polygon' && shapeText.includes(`${points}`)) {
            shapeListElem.removeChild(shapeItemElem);
            break;
        } else

        if (type === 'garis' && shapeText.includes(`${points}`)) {
            shapeListElem.removeChild(shapeItemElem);
            break;
        } else if (type === 'persegi-panjang' && shapeText.includes(`${points}`)) {
            shapeListElem.removeChild(shapeItemElem);
            break;
        } else if (type === 'persegi' && shapeText.includes(`${points}`)) {
            shapeListElem.removeChild(shapeItemElem);
            break;
        }
    }
    if (type === 'garis') {
        for (let i = 0; i < linesData.length; i++) {
            let line = linesData[i];
            if (
                line[0] === data[0] &&
                line[1] === data[1] &&
                line[2] === data[2] &&
                line[3] === data[3]
            ) {
                linesData.splice(i, 1);
                redrawCanvas();
                break;
            }
        }
    } else if (type === 'persegi-panjang') {
        for (let i = 0; i < rectanglesData.length; i++) {
            let rectangle = rectanglesData[i];
            console.log(rectangle)
            console.log(data)
            if (
                rectangle[0] === data[0] &&
                rectangle[1] === data[1] &&
                rectangle[6] === data[6] &&
                rectangle[7] === data[7]
            ) {
                rectanglesData.splice(i, 1);
                redrawCanvas();
                break;
            }
        }
    } else if (type === 'persegi') {
        for (let i = 0; i < squaresData.length; i++) {
            let square = squaresData[i];
            if (
                square[0] === data[0] &&
                square[1] === data[1] &&
                square[6] === data[6] &&
                square[7] === data[7]
            ) {
                squaresData.splice(i, 1);
                redrawCanvas();
                break;
            }
        }
    } else if (type === 'polygon') {
        for (let i = 0; i < polygonsData.length; i++) {
            let polygon = polygonsData[i];
            if (polygon === data) {
                polygonsData.splice(i, 1);
                redrawCanvas();
                break;
            }
        }
    }
}


function redrawCanvas() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    drawLines();
    drawRectangles();
    drawSquares();
    drawPolygons();

    // gambar polygon sementara
    if (polygonDrawing && currentPolygonPoints.length > 0) {
        drawPolygon(currentPolygonPoints);
    }
}

function drawLines() {
    for (let i = 0; i < linesData.length; i++) {
        let line = linesData[i];
        redrawLine(program, line);
    }
}

function drawRectangles() {
    // console.log(rectanglesData)
    for (let i = 0; i < rectanglesData.length; i++) {
        let rectangle = rectanglesData[i];
        // let colorData = [
        // 0, 1, 0, 1,
        // 0, 1, 0, 1,
        // 0, 1, 0, 1,
        // 0, 1, 0, 1
        // ];
        redrawRectangle(program, rectangle);
    }
}

function drawSquares() {
    for (let i = 0; i < squaresData.length; i++) {
        let square = squaresData[i];
        redrawSquare(program, square);
    }
}

function drawPolygons() {
    console.log(polygonsData)
    for (let i = 0; i < polygonsData.length; i++) {
        drawPolygon(polygonsData[i]);
    }
}

function drawPolygon(points) {
    // const vertices = points.flat();
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    // gl.drawArrays(gl.LINE_LOOP, 0, vertices.length / 2);
    const vertices = points.flat();
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    // set color
    // const colorUniformLocation = gl.getUniformLocation(program, "u_color");
    // gl.uniform4fv(colorUniformLocation, [Math.random(), Math.random(), Math.random(), 1]);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length / 2);
}