const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth > 600 ? 600 : window.innerWidth;
    canvas.height = (canvas.width * 800) / 600; // Mantener relación de aspecto
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let player;
let coins;
let cars;
let score;
let lives;
let highScore = localStorage.getItem("highScore") || 0;
let gameOver;
let isPaused = false;
const restartButton = document.getElementById("restartButton");
const pauseButton = document.getElementById("pauseButton");

const carImage = new Image();
carImage.src = 'car.png';
const lifeImage = new Image();
lifeImage.src = 'corazon.png';
const backgroundImage = new Image();
backgroundImage.src = 'background.png';
const coinImage = new Image();
coinImage.src = 'coin.png';
const enemyCarImages = ['enemy_car_1.png', 'enemy_car_2.png', 'enemy_car_3.png'];

let enemyCarImagesLoaded = [];
enemyCarImages.forEach(src => {
    const img = new Image();
    img.src = src;
    enemyCarImagesLoaded.push(img);
});

function initGame() {
    player = { x: canvas.width / 2 - 40, y: canvas.height - 100, width: 80, height: 80, speed: 5 };
    coins = [];
    cars = [];
    score = 0;
    lives = 3;
    gameOver = false;
    isPaused = false;
    restartButton.classList.add("hidden");
    pauseButton.textContent = "Pausar";
    document.getElementById("score").innerText = `Puntos: ${score}`;
    document.getElementById("highScore").innerText = `Mejor Puntuación: ${highScore}`;
    updateGame();
}

// Estado de los botones
let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;

// Mueve el coche continuamente mientras se mantiene presionado
function moveCar() {
    if (moveLeft && player.x > 0) {
        player.x -= player.speed;
    }
    if (moveRight && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }
    if (moveUp && player.y > 0) {
        player.y -= player.speed;
    }
    if (moveDown && player.y < canvas.height - player.height) {
        player.y += player.speed;
    }
}

// Eventos de control para presionar
const leftButton = document.getElementById('leftButton');
const rightButton = document.getElementById('rightButton');
const upButton = document.getElementById('upButton');
const downButton = document.getElementById('downButton');

leftButton.addEventListener('touchstart', () => { moveLeft = true; });
leftButton.addEventListener('touchend', () => { moveLeft = false; });

rightButton.addEventListener('touchstart', () => { moveRight = true; });
rightButton.addEventListener('touchend', () => { moveRight = false; });

upButton.addEventListener('touchstart', () => { moveUp = true; });
upButton.addEventListener('touchend', () => { moveUp = false; });

downButton.addEventListener('touchstart', () => { moveDown = true; });
downButton.addEventListener('touchend', () => { moveDown = false; });

// Resto de la lógica del juego...
function createCoin() {
    if (!isPaused) coins.push({ x: Math.random() * (canvas.width - 20), y: -20, radius: 10 });
}

function createCar() {
    if (!isPaused) {
        cars.push({
            x: Math.random() * (canvas.width - 40),
            y: -50,
            height: 80,
            image: enemyCarImagesLoaded[Math.floor(Math.random() * enemyCarImagesLoaded.length)]
        });
    }
}

function updateGame() {
    if (gameOver || isPaused) return;

    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    moveCar(); // Llama a la función para mover el coche
    ctx.drawImage(carImage, player.x, player.y, player.width, player.height);

    // Lógica de monedas
    for (let i = coins.length - 1; i >= 0; i--) {
        let coin = coins[i];
        coin.y += 3;

        if (coin.y > canvas.height) {
            coins.splice(i, 1);
        } else if (coin.x > player.x && coin.x < player.x + player.width && coin.y > player.y && coin.y < player.y + player.height) {
            score++;
            coins.splice(i, 1);
            document.getElementById("score").innerText = `Puntos: ${score}`;
            if (score > highScore) {
                highScore = score;
                localStorage.setItem("highScore", highScore);
                document.getElementById("highScore").innerText = `Mejor Puntuación: ${highScore}`;
            }
        } else {
            ctx.drawImage(coinImage, coin.x - 15, coin.y - 15, 30, 30);
        }
    }

    // Lógica de coches enemigos
    for (let i = cars.length - 1; i >= 0; i--) {
        let car = cars[i];
        car.y += 4;

        if (car.y > canvas.height) {
            cars.splice(i, 1);
        } else if (
            car.x < player.x + player.width &&
            car.x + (car.image.src.includes('enemy_car_1.png') ? 60 : (car.image.src.includes('enemy_car_3.png') ? 75 : 70)) > player.x &&
            car.y < player.y + player.height &&
            car.y + car.height > player.y
        ) {
            lives--;
            cars.splice(i, 1);
            if (lives === 0) gameOver = true;
        } else {
            ctx.drawImage(car.image, car.x, car.y, car.image.src.includes('enemy_car_1.png') ? 60 : (car.image.src.includes('enemy_car_3.png') ? 75 : 70), 80);
        }
    }

    const lifeWidth = 60;
    const lifeHeight = 60;
    const lifeX = canvas.width - lifeWidth - 10;
    const lifeY = 10;
    for (let i = 0; i < lives; i++) {
        ctx.drawImage(lifeImage, lifeX - (lifeWidth * i), lifeY, lifeWidth, lifeHeight);
    }

    if (gameOver) {
        ctx.font = "40px Arial";
        ctx.fillStyle = "red";
        ctx.fillText("Game Over", canvas.width / 2 - 100, canvas.height / 2);
        restartButton.classList.remove("hidden");
    } else {
        requestAnimationFrame(updateGame);
    }
}

setInterval(createCoin, 1000);
setInterval(createCar, 1500);

restartButton.addEventListener("click", initGame);
pauseButton.addEventListener("click", () => {
    isPaused = !isPaused;
    if (isPaused) {
        pauseButton.textContent = "Reanudar";
    } else {
        pauseButton.textContent = "Pausar";
        updateGame();
    }
});

initGame();
