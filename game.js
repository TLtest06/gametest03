const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let player = { 
    x: 50, 
    y: canvas.height - 60, 
    width: 50, 
    height: 50, 
    dy: 0, 
    gravity: 0.5, 
    jumpPower: -10, 
    onGround: true 
};
let obstacles = [];
let collectibles = [];
let score = 0;
let gameState = "start"; 
let leftPressed = false;
let rightPressed = false;
let jumpPressed = false;

let lastTime = 0;
const gameSpeed = 1000 / 60;

// Tọa độ và kích thước nút điều khiển
const controls = {
    left: { x: 10, y: canvas.height - 80, width: 70, height: 50 },
    right: { x: 90, y: canvas.height - 80, width: 70, height: 50 },
    jump: { x: 170, y: canvas.height - 80, width: 70, height: 50 }
};

// Tạo chướng ngại vật
function createObstacles() {
    const obstacleHeight = 40;
    const gap = 200;
    const lastObstacle = obstacles[obstacles.length - 1];

    if (lastObstacle === undefined || (canvas.width - lastObstacle.x) > gap) {
        const obstacleY = canvas.height - obstacleHeight;
        obstacles.push({ x: canvas.width, y: obstacleY, width: 50, height: obstacleHeight });
    }
}

// Tạo điểm thưởng
function createCollectible() {
    const collectibleX = Math.random() * (canvas.width - 20);
    const collectibleY = canvas.height - 80;
    const collectible = { x: collectibleX, y: collectibleY, width: 20, height: 20 };

    if (collectibles.length < 5) {
        collectibles.push(collectible);
    }
}

// Cập nhật game
function update() {
    if (gameState === "playing") {
        player.dy += player.gravity;
        player.y += player.dy;

        if (jumpPressed && player.onGround) {
            player.dy = player.jumpPower;
            player.onGround = false;
        }

        if (player.y >= canvas.height - player.height) {
            player.y = canvas.height - player.height;
            player.onGround = true;
        }

        if (Math.random() < 0.02) {
            createObstacles();
        }

        if (Math.random() < 0.03) {
            createCollectible();
        }

        obstacles.forEach((obstacle, index) => {
            obstacle.x -= 2;

            if (
                player.x < obstacle.x + obstacle.width &&
                player.x + player.width > obstacle.x &&
                player.y < obstacle.y + obstacle.height &&
                player.y + player.height > obstacle.y
            ) {
                gameState = "gameOver";
            }

            if (obstacle.x + obstacle.width < 0) {
                obstacles.splice(index, 1);
            }
        });

        collectibles.forEach((collectible, index) => {
            if (
                player.x < collectible.x + collectible.width &&
                player.x + player.width > collectible.x &&
                player.y < collectible.y + collectible.height &&
                player.y + player.height > collectible.y
            ) {
                score++;
                collectibles.splice(index, 1);
            }
        });

        if (leftPressed && player.x > 0) {
            player.x -= 5;
        }
        if (rightPressed && player.x < canvas.width - player.width) {
            player.x += 5;
        }
    }
}

// Vẽ game
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "blue";
    ctx.fillRect(player.x, player.y, player.width, player.height);

    ctx.fillStyle = "red";
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });

    ctx.fillStyle = "yellow";
    collectibles.forEach(collectible => {
        ctx.fillRect(collectible.x, collectible.y, collectible.width, collectible.height);
    });

    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 10, 20);

    if (gameState === "start") {
        ctx.fillText("Press Enter or Click to Start", canvas.width / 4, canvas.height / 2);
    }

    if (gameState === "gameOver") {
        ctx.fillText("Game Over", canvas.width / 2 - 40, canvas.height / 2);
        ctx.fillText("Score: " + score, canvas.width / 2 - 40, canvas.height / 2 + 30);
        ctx.fillText("Press Enter or Click to Restart", canvas.width / 4, canvas.height / 2 + 60);
    }

    if (gameState === "playing") {
        drawControls();
    }
}

// Vẽ nút điều khiển
function drawControls() {
    ctx.fillStyle = "lightgray";
    ctx.fillRect(controls.left.x, controls.left.y, controls.left.width, controls.left.height);
    ctx.fillRect(controls.right.x, controls.right.y, controls.right.width, controls.right.height);
    ctx.fillRect(controls.jump.x, controls.jump.y, controls.jump.width, controls.jump.height);

    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("←", controls.left.x + 30, controls.left.y + 30);
    ctx.fillText("→", controls.right.x + 30, controls.right.y + 30);
    ctx.fillText("↑", controls.jump.x + 30, controls.jump.y + 30);
}

// Kiểm tra nếu người chơi nhấp vào nút trên màn hình
function checkControlClick(x, y) {
    if (x > controls.left.x && x < controls.left.x + controls.left.width &&
        y > controls.left.y && y < controls.left.y + controls.left.height) {
        leftPressed = true;
    }
    if (x > controls.right.x && x < controls.right.x + controls.right.width &&
        y > controls.right.y && y < controls.right.y + controls.right.height) {
        rightPressed = true;
    }
    if (x > controls.jump.x && x < controls.jump.x + controls.jump.width &&
        y > controls.jump.y && y < controls.jump.y + controls.jump.height && player.onGround) {
        jumpPressed = true;
    }
}

// Khởi động lại game
function resetGame() {
    player.x = 50;
    player.y = canvas.height - 60;
    player.dy = 0;
    player.onGround = true;
    obstacles = [];
    collectibles = [];
    score = 0;
    gameState = "playing";
}

// Sự kiện nhấn chuột
canvas.addEventListener('mousedown', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    if (gameState === "start" || gameState === "gameOver") {
        gameState = "playing";
        resetGame();
    } else {
        checkControlClick(mouseX, mouseY); // Kiểm tra nếu người chơi nhấp vào nút điều khiển
    }
});

canvas.addEventListener('mouseup', () => {
    leftPressed = false;
    rightPressed = false;
    jumpPressed = false;
});

// Điều khiển bàn phím
document.addEventListener('keydown', (event) => {
    if (event.key === "Enter") {
        if (gameState === "start" || gameState === "gameOver") {
            gameState = "playing";
            resetGame();
        }
    }
    if (event.key === "ArrowLeft") {
        leftPressed = true;
    }
    if (event.key === "ArrowRight") {
        rightPressed = true;
    }
    if (event.key === "ArrowUp" && player.onGround) {
        jumpPressed = true;
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key === "ArrowLeft") {
        leftPressed = false;
    }
    if (event.key === "ArrowRight") {
        rightPressed = false;
    }
    if (event.key === "ArrowUp") {
        jumpPressed = false;
    }
});

function gameLoop(time) {
    if (time - lastTime > gameSpeed) {
        update();
        draw();
        lastTime = time;
    }
    requestAnimationFrame(gameLoop);
}

gameLoop(0);
