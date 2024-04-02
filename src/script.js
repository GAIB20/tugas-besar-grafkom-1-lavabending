window.onload = function() {
    // Mendapatkan konteks WebGL dari elemen canvas
    var canvas = document.getElementById('canvas');
    var gl = canvas.getContext('webgl');

    if (!gl) {
        console.error('WebGL tidak tersedia.');
        return;
    }

    // warna background canvas
    gl.clearColor(0.5, 0.5, 0.5, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    
};
