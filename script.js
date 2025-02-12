const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const gridSize = 20;
let snake, apple, direction, nextDirection, score, highScore, gameInterval, speed;
let gameRunning = false;

// Load High Score from Cookies
function getCookie(name) {
    const cookies = document.cookie.split("; ");
    for (let cookie of cookies) {
        const [key, value] = cookie.split("=");
        if (key === name) return value;
    }
    return null;
}

function setCookie(name, value, minutes) {
    const expires = new Date();
    expires.setTime(expires.getTime() + minutes * 60 * 1000);
    document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/`;
}

// Initialize High Score
highScore = parseInt(getCookie("highScore")) || 0;
document.getElementById("score").textContent = `Score: 0 | High Score: ${highScore}`;

function showStartMessage() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "white";
    ctx.font = "18px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Press W, A, S, D / Arrow Keys", canvas.width / 2, canvas.height / 2 - 20);
    ctx.fillText("or tap 'Start' to begin.", canvas.width / 2, canvas.height / 2 + 10);
}

function initGame() {
    document.getElementById("startButton").style.display = "none"; // Hide button
    snake = [{ x: 10 * gridSize, y: 10 * gridSize }];
    apple = { x: getRandomPosition(), y: getRandomPosition() };
    direction = { x: gridSize, y: 0 };
    nextDirection = direction;
    score = 0;
    speed = 200; // Initial speed
    document.getElementById("score").textContent = `Score: 0 | High Score: ${highScore}`;
    clearInterval(gameInterval);
    
    gameInterval = setInterval(gameLoop, speed);
    gameRunning = true;
}

function getRandomPosition() {
    return Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize;
}

function gameLoop() {
    const head = { x: snake[0].x + nextDirection.x, y: snake[0].y + nextDirection.y };

    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height || checkCollision(head)) {
        gameOver();
        return;
    }

    snake.unshift(head);

    if (head.x === apple.x && head.y === apple.y) {
        score++;
        apple = { x: getRandomPosition(), y: getRandomPosition() };

        if (score > highScore) {
            highScore = score;
            setCookie("highScore", highScore, 10);
        }

        document.getElementById("score").textContent = `Score: ${score} | High Score: ${highScore}`;

        increaseSpeed();
    } else {
        snake.pop();
    }

    direction = nextDirection;
    drawGame();
}

function checkCollision(position) {
    return snake.some(segment => segment.x === position.x && segment.y === position.y);
}

function drawGame() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "red";
    ctx.fillRect(apple.x, apple.y, gridSize, gridSize);

    ctx.fillStyle = "lime";
    snake.forEach((segment, index) => {
        ctx.fillRect(segment.x, segment.y, gridSize, gridSize);
        if (index === 0) {
            ctx.fillStyle = "green";
        }
    });
}

// Increase Speed Every 5 Points
function increaseSpeed() {
    if (score % 5 === 0 && speed > 100) { 
        speed -= 10; // Increase speed by reducing interval
        clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, speed);
    }
}

// Handle Key Presses (W, A, S, D & Arrow Keys)
function changeDirection(event) {
    const key = event.key.toLowerCase();

    if (!gameRunning) {
        initGame(); // Restart game if key is pressed after game over
        return;
    }

    if ((key === "arrowup" || key === "w") && direction.y === 0) {
        nextDirection = { x: 0, y: -gridSize };
    } else if ((key === "arrowdown" || key === "s") && direction.y === 0) {
        nextDirection = { x: 0, y: gridSize };
    } else if ((key === "arrowleft" || key === "a") && direction.x === 0) {
        nextDirection = { x: -gridSize, y: 0 };
    } else if ((key === "arrowright" || key === "d") && direction.x === 0) {
        nextDirection = { x: gridSize, y: 0 };
    }
}

// Handle Mobile Controls
function handleMobileControl(event) {
    const direction = event.target.getAttribute("data-dir");
    if (direction) {
        changeDirection({ key: direction });
    }
}

// Game Over Function
function gameOver() {
    clearInterval(gameInterval);
    gameRunning = false;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Game Over!", canvas.width / 2, canvas.height / 2 - 30);
    ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2);
    ctx.fillText(`High Score: ${highScore}`, canvas.width / 2, canvas.height / 2 + 30);
    ctx.fillText("Press ENTER or", canvas.width / 2, canvas.height / 2 + 80);
    ctx.fillText("Any key to Play Again!", canvas.width / 2, canvas.height / 2 + 110);

    document.getElementById("startButton").style.display = "block"; // Show button after game over
}

// Show Initial Message
showStartMessage();

// Event Listeners
document.getElementById("startButton").addEventListener("click", initGame);
document.addEventListener("keydown", changeDirection);
document.querySelectorAll(".control-btn").forEach(btn => btn.addEventListener("click", handleMobileControl));
