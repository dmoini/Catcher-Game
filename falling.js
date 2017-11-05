
(() => {
    let canvas = document.getElementById("game");
    let game = canvas.getContext("2d");
    let lastTimestamp = 0;

    const FRAME_RATE = 60;
    const FRAME_DURATION = 1000 / FRAME_RATE;

    let fallersArray = [];

    let canvasScore = document.getElementById("score");
    let score = 0;
    canvasScore.innerHTML = score;

    let canvasLives = document.getElementById("lives");
    let lives = 10;
    canvasLives.innerHTML = lives;

    let bonusScore = document.getElementById("fallersAwayFromBonusScore");
    let fallersAwayFromBonusScore = 5;
    bonusScore.innerHTML = fallersAwayFromBonusScore;

    let extraLife = document.getElementById("scoreAwayFromExtraLife");
    let scoreAwayFromExtraLife = 50;
    extraLife.innerHTML = scoreAwayFromExtraLife;

    let timesLifeAdded = 0;

    let gameOver = false;

    let gameInProgress = false;

    let img = new Image();
    img.src = "https://i.imgur.com/bR9GCTX.jpg";

    let descentSpeed = 0.0001; // This is per millisecond.
    let Faller = function(x, y, width, height, color, dx = 0, dy = 0, ax = 0, ay = descentSpeed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.dx = dx;
        this.dy = dy;
        this.ax = ax;
        this.ay = ay;
        this.color = color;
    };

    Faller.prototype.draw = function() {
        game.fillStyle = this.color;
        game.fillRect(this.x, this.y, this.width, this.height);
    };

    Faller.prototype.move = function(millisecondsElapsed) {
        this.x += this.dx * millisecondsElapsed;
        this.y += this.dy * millisecondsElapsed;

        this.dx += this.ax * millisecondsElapsed;
        this.dy += this.ay * millisecondsElapsed;
    };

    let generateRandomColor = function() {
        var randomColor = Math.floor(Math.random() * 200) + 1;
        if (randomColor <= 120) {
            return "red";
        } else if (randomColor <= 150) {
            return "blue";
        } else if (randomColor <= 170) {
            return "lime";
        } else if (randomColor <= 180) {
            return "yellow";
        } else if (randomColor === 185) {
            return "black";
        } else if (randomColor <= 196) {
            return "pink";
        } else {
            return "brown";
        }
    };

    const DEFAULT_PLAYER_WIDTH = 50;
    const DEFAULT_PLAYER_HEIGHT = 50;
    const DEFAULT_PLAYER_Y = canvas.height - DEFAULT_PLAYER_HEIGHT;
    let Player = function(x, y = DEFAULT_PLAYER_Y, width = DEFAULT_PLAYER_WIDTH, height = DEFAULT_PLAYER_HEIGHT) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    };


    Player.prototype.draw = function() {
        game.fillStyle = "black";
        game.beginPath();
        game.moveTo(this.x - this.width / 2 - 1, this.y + this.height + 1);
        game.lineTo(this.x - this.width / 2 - 1, this.y - 1);
        game.lineTo(this.x + this.width / 2 + 1, this.y - 1);
        game.lineTo(this.x + this.width / 2 + 1, this.y + this.height + 1);
        game.closePath();
        game.fill();
        game.fillStyle = "red";
        game.beginPath();
        game.moveTo(this.x - this.width / 2, this.y + this.height);
        game.lineTo(this.x - this.width / 2, this.y);
        game.lineTo(this.x + this.width / 2, this.y);
        game.lineTo(this.x + this.width / 2, this.y + this.height);
        game.closePath();
        game.fill();
        game.fillStyle = "white";
        game.beginPath();
        game.moveTo(this.x - this.width * 0.1, this.y + this.height);
        game.moveTo(this.x - this.width * 0.1, this.y);
        game.lineTo(this.x + this.width * 0.1, this.y);
        game.lineTo(this.x + this.width * 0.1, this.y + this.height);
        game.closePath();
        game.fill();
        game.beginPath();
        game.moveTo(this.x - this.width / 2, this.y + this.height * 0.6);
        game.lineTo(this.x - this.width / 2, this.y + this.height * 0.4);
        game.lineTo(this.x + this.width / 2, this.y + this.height * 0.4);
        game.lineTo(this.x + this.width / 2, this.y + this.height * 0.6);
        game.closePath();
        game.fill();
    };

    let player = new Player(canvas.width / 2);

    let checkFallerPlayerCollision = function(faller) {
        if (player.x <= faller.x + faller.width &&
            player.x + player.width >= faller.x &&
            player.y <= faller.y &&
            player.y + player.height >= faller.y + faller.height) {
            return true;
        } else {
            return false;
        }
    };

    let addLife = function(amount) {
        lives += amount;
        canvasLives.innerHTML = lives;
    };

    let loseLife = function(amount) {
        lives -= amount;
        canvasLives.innerHTML = lives;
    };

    let zeroLives = function() {
        gameOver = true;
        canvas.className = "gameOver";
        game.clearRect(0, 0, canvas.width, canvas.height);
    };

    let addPoints = function(amount) {
        score += amount;
        canvasScore.innerHTML = score;
    };

    let addScore = function(fallerColor) {
        if (fallerColor === "red") {
            addPoints(1);
        } else if (fallerColor === "blue") {
            addPoints(2);
        } else if (fallerColor === "lime") {
            addPoints(3);
        } else if (fallerColor === "yellow") {
            addPoints(4);
        } else if (fallerColor === "black") {
            addLife(10);
        } else if (fallerColor === "pink") {
            addLife(1);
        } else if (fallerColor === "brown") {
            resetDescentSpeed();
        }
    };

    let resetDescentSpeed = function() {
        descentSpeed = 0.0001;
    };

    let updateCaughtFallersAwayFromBonusScore = function() {
        fallersAwayFromBonusScore -= 1;
        if (fallersAwayFromBonusScore === 0) {
            score += 5;
            canvasScore.innerHTML = score;
            resetCaughtFallersAwayFromBonusScore();
        }
        bonusScore.innerHTML = fallersAwayFromBonusScore;

    };

    let resetCaughtFallersAwayFromBonusScore = function() {
        fallersAwayFromBonusScore = 5;
        bonusScore.innerHTML = fallersAwayFromBonusScore;
    };

    let updateScoreAwayFromExtraLife = function() {
        scoreAwayFromExtraLife = 50 - score % 50;
        extraLife.innerHTML = scoreAwayFromExtraLife;
        if (score / 50 >= timesLifeAdded + 1) {
            addLife(1);
            timesLifeAdded += 1;
        }
    };
   
    let draw = (millisecondsElapsed) => {
        if (gameOver) {
            game.drawImage(img, (canvas.width - 500) / 2, (canvas.height - 500) / 2);
        } else {
            game.clearRect(0, 0, canvas.width, canvas.height);
            fallersArray.forEach((faller) => {
                faller.draw();
                faller.move(millisecondsElapsed);
            });

            player.draw();

            fallersArray = fallersArray.filter((faller) => {
                let fallerTouchGround = faller.y <= canvas.height;
                if (!fallerTouchGround) {
                    loseLife(1);
                    if (lives <= 0) {
                        zeroLives();
                    } else {
                        resetCaughtFallersAwayFromBonusScore();

                    }
                }
                return fallerTouchGround;
            });

           fallersArray = fallersArray.filter((faller) => {
                let inPlayer = checkFallerPlayerCollision(faller);
                if (inPlayer) {
                    descentSpeed += 0.00001;
                    addScore(faller.color);
                    updateCaughtFallersAwayFromBonusScore();
                    updateScoreAwayFromExtraLife();
                }
                return !inPlayer;
            });
        }
    };
    const MIN_SIZE = 10;
    const SIZE_RANGE = 10;
    const MILLISECONDS_BETWEEN_FALLERS = 750;

    let fallerGenerator;
    let startFallerGenerator = () => {
        fallerGenerator = setInterval(() => {
            let fallerSize = Math.floor(Math.random() * SIZE_RANGE) + MIN_SIZE;
            let fallerX = Math.floor(Math.random() * (canvas.width - fallerSize));
            let fallerY = 0;
            let newFaller = new Faller(fallerX, fallerY, fallerSize, fallerSize, generateRandomColor());
            fallersArray.push(newFaller);
        }, MILLISECONDS_BETWEEN_FALLERS);
    };

    let stopFallerGenerator = () => clearInterval(fallerGenerator);

    let setPlayerPositionBasedOnMouse = (event) => {
        player.x = event.clientX / document.body.clientWidth * canvas.width;
    };

    document.body.addEventListener("mouseenter", setPlayerPositionBasedOnMouse);
    document.body.addEventListener("mousemove", setPlayerPositionBasedOnMouse);

    let running = false;
    let nextFrame = (timestamp) => {
        if (!lastTimestamp) {
            lastTimestamp = timestamp;
        }

        if (timestamp - lastTimestamp < FRAME_DURATION) {
            if (running) {
                window.requestAnimationFrame(nextFrame);
            }

            return;
        }

        draw(timestamp - lastTimestamp);

        lastTimestamp = timestamp;
        if (running) {
            window.requestAnimationFrame(nextFrame);
        }
    };

    let resetGameVariables = function() {
        lastTimestamp = 0;
        fallersArray = [];
        score = 0;
        canvasScore.innerHTML = score;
        lives = 10;
        canvasLives.innerHTML = lives;
        fallersAwayFromBonusScore = 5;
        bonusScore.innerHTML = fallersAwayFromBonusScore;
        scoreAwayFromExtraLife = 50;
        extraLife.innerHTML = scoreAwayFromExtraLife;
        timesLifeAdded = 0;
        descentSpeed = 0.0001;
        running = true;
        gameInProgress = false;
        gameOver = false;
        player = new Player(canvas.width / 2);
    };

    document.getElementById("startButton").addEventListener("click", () => {
        if (!gameOver && !gameInProgress) {
            canvas.className = "playing";
            running = true;
            gameInProgress = true;
            lastTimestamp = 0;
            startFallerGenerator();
            window.requestAnimationFrame(nextFrame);
        }
    });

    document.getElementById("pauseButton").addEventListener("click", () => {
        stopFallerGenerator();
        running = false;
        gameInProgress = false;
    });

    document.getElementById("restartButton").addEventListener("click", () => {
        stopFallerGenerator();
        resetGameVariables();
        canvas.className = "playing";
        if (!gameOver && !gameInProgress) {
            gameInProgress = true;
            startFallerGenerator();
            window.requestAnimationFrame(nextFrame);
        }
    });
})();
