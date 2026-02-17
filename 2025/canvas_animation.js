var dpr = window.devicePixelRatio;

var canvas = document.getElementById('canvas');
canvas.width = window.innerWidth * dpr;
canvas.height = window.innerHeight * dpr;
canvas.style.width = '100%';
canvas.style.height = '100%';

var context = canvas.getContext('2d');

var id = 52;

var width = 1600;
var height = 1600;
var imageScale = 4;

var cwidth = width / imageScale;
var cheight = height / imageScale;

var cwidthhalf = cwidth / 2;
var cheighthalf = cheight / 2;

var particles = [];

function Particle(id, x, y, sx, sy) {

    if (sx === 0)
        sx = 2;

    var cx = (id % 4) * width;
    var cy = Math.floor(id / 4) * height;

    this.update = function () {

        x += sx;
        y += sy;

        if (x < (-cwidthhalf) || x > (canvas.width + cwidthhalf)) {

            var index = particles.indexOf(this);
            particles.splice(index, 1);

            return false;

        }

        if (y > canvas.height - cheighthalf) {

            y = canvas.height - cheighthalf;
            sy = -sy * 0.85;

        }

        sy += 0.98;

        context.drawImage(image, cx, cy, width, height, Math.floor(x - cwidthhalf), Math.floor(y - cheighthalf), cwidth, cheight);

        return true;

    }

}

var image = document.createElement('img');
image.src = "ciff24transparent.png";

function throwCard(x, y) {

    x = canvas.width / 2;

    var particle = new Particle(0, x, y, Math.floor(Math.random() * 6 - 3) * 2, -Math.random() * 16);
    particles.push(particle);

}

function animate() {

    var i = 0
        , l = particles.length;

    while (i < l) {

        particles[i].update() ? i++ : l--;

    }

    requestAnimationFrame(animate);

}

requestAnimationFrame(animate);