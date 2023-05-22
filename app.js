//GLOBAL VARIABLES
let gameParameters =
{
    rows: 9,
    cols: 9,
    bombs: 10,
    bomb: '💣',
    gameOver: false,
}
let textColors = ["black", "blue", "green", "red", "#020E5D", "#6e1e12", "#18785e", "#69125e", "#4d4c49"];
let board = document.getElementById('board');
let time = document.getElementById('timer');
let flagCount = document.getElementById('flags-left');
let flags = gameParameters.bombs;
let flagIcon = '🚩';
let intervalFun;
let gameRunning = false;
let cells = [gameParameters.rows * gameParameters.cols];  //stores all cell id's
let bombLocations = [gameParameters.bombs]; //to save all locations of bombs and compare it when assigning new bombs
let table = document.createElement('table');
let message = document.getElementById('message');

//RUNS THE GAME IMMEDIATELY
beginGame();


//STARTS THE GAME
function beginGame() {
    document.getElementById('board').appendChild(initTable());
    plantBombs();
    setNumberValues();
    flagCountUpdater();
}

//PLANTS BOMBS ON RANDOM LOCATIONS
function plantBombs() {
    let i = 0;
    let randomCell, randomRow, randomCol;
    while (i < gameParameters.bombs) {
        randomRow = Math.floor(Math.random() * gameParameters.rows);
        randomCol = Math.floor(Math.random() * gameParameters.cols);
        randomCell = randomRow + ':' + randomCol;
        //Checks the cell, not to overwrite the allready placed bomb
        if (!bombLocations.includes(randomCell)) {
            bombLocations[i] = randomCell;
            let bombCell = document.getElementById(randomCell);
            bombLocations[i] = randomCell;
            bombCell.setAttribute("value", "bomb");
            i++;
        };
    };
}

//INITIALISES A TABLE WITH PREFERRED WIDTH AND HEIGHT
function initTable() {
    let count = 0;
    for (let i = 0; i < gameParameters.rows; i++) {
        let row = document.createElement('tr');
        for (let j = 0; j < gameParameters.cols; j++) {
            let elm = document.createElement('td');
            elm.id = i + ":" + j;
            elm.classList.add("cell");
            addClickListener(elm, i, j);
            addRightClickListener(elm, i, j);
            cells[count] = elm;
            count++;
            row.appendChild(elm);
            //MISSING: Add Event listener
        }
        table.appendChild(row);
    }
    return table
}

//SETS NUMBER VALUES ON THE CELLS WITH NEIGHBORING BOMBS
function setNumberValues() {
    let i = 0
    let b = '💣';
    for (let i = 0; i < gameParameters.rows; i++) {
        for (let j = 0; j < gameParameters.cols; j++) {
            let count = 0;
            let cell = document.getElementById(`${i}:${j}`);
            if (cell.getAttribute("value") != "bomb") {
                //ONE LEFT ONE UP
                count += checkForMines(i - 1, j - 1);
                //ONE UP
                count += checkForMines(i - 1, j);
                //ONE RIGHT ONE UP
                count += checkForMines(i - 1, j + 1);
                //ONE LEFT
                count += checkForMines(i, j - 1);
                //ONE RIGHT
                count += checkForMines(i, j + 1);
                //ONE DOWN ONE LEFT
                count += checkForMines(i + 1, j - 1);
                //ONE DOWN
                count += checkForMines(i + 1, j);
                //ONE RIGHT ONE DOWN
                count += checkForMines(i + 1, j + 1);

                if (count > 0) {
                    cell.style.color = textColors[count];
                    cell.setAttribute("value", count);
                    //set color to be according to textColors array
                } else {
                    cell.setAttribute("value", 0);
                }
            }
        }
    }
}

//FUNCTION WHICH CHECKS IF THERE IS BOMB ON SPECIFIC CELL OR IF GIVEN NUMBERS ARE OUT OF BOUNDS
function checkForMines(i, j) {
    if (i < 0 || j < 0 || i >= gameParameters.rows || j >= gameParameters.cols) {
        return 0;
    }
    else if (document.getElementById(`${i}:${j}`).getAttribute("value") == "bomb") {
        return 1;
    } else {
        return 0;
    }
}


//FUNCTION WHICH CHECKS IF CELL HAS A BOMB LOCATED --Not yet used--
function checkCell(row, col) {
    if (bombLocations.includes(`${row}:${col}`)) {
        return true;
    } else {
        return false;
    }
}

//ACTION LISTENER FOR ALL CELLS
function addClickListener(elm, i, j) {
    elm.addEventListener('click', function () {
        //Starts timer at the first click and deletes message to click button to start
        if (gameParameters.gameOver) {return}
        else if(!gameRunning && !gameParameters.gameOver) {
            startTime();
            message.innerHTML = "";
        }
        //GAME OVER
        if (elm.getAttribute("value") == "bomb") {
            stopTime();
            gameParameters.gameOver = true;
            gameRunning = false;
            console.log("BOMB CLICKED!");
            showMines();
            disableEvents();
            message.innerHTML = "Noooo, that was a bomb!";
            message.style.color = "red";
            message.style.fontSize = "1.5em";
            message.style.fontWeight = "600";
        }

        //EVERYTHING ELSE
        else if (gameParameters.gameOver == false && elm.getAttribute("value") != "bomb") {
            //Check if flag is on cell to remove it and give flag back
            if(elm.innerHTML == flagIcon){
                elm.innerHTML = "";
                flags++;
            }
            //Is the value of clicked cell 0 aka empty
            if (elm.getAttribute("value") == 0) {
                elm.className = "discovered-cell";
                console.log("Empty Cell");
                recursiveRevealCells(i, j);
                //Open up all the other cells with no neighboring bombs - Recursion? YES!
            }
            //Is the value of clicked cell a number?
            else {
                elm.innerHTML = elm.getAttribute("value");
                elm.className = "discovered-cell";
            }

            //checks for winner
            checkWinner();
        }
    })
}

//FUNCTION WHICH RUNS WHEN CELL IS RIGHTCLICKED
function addRightClickListener(elm, i, j) {
    elm.addEventListener('contextmenu', function (event) {
        //Prevents a rightclick menu from popping up
        event.preventDefault();
        if (!gameRunning){return};
        if(gameParameters.gameOver){return};
        //Checks for number of flags left and if there is already flag on the cell
        //and also if the flag is already open
        if (elm.innerHTML == '' && flags > 0 && elm.className == "cell") {
            elm.innerHTML = flagIcon;
            console.log("Flag set on: " + i + ":" + j);
            flags--;
            flagCountUpdater();
        } else if (elm.innerHTML == flagIcon) {
            elm.innerHTML = "";
            console.log("Flag removed from: " + i + ":" + j);
            flags++
            flagCountUpdater();
        }
        checkWinner();
    })
}


//FUNCTION WHICH REVEALS CELLS RECURSIVLY WHEN VALUE IS 0
function recursiveRevealCells(i, j) {
    mineChecker2(i - 1, j - 1);
    mineChecker2(i - 1, j);
    mineChecker2(i, j - 1);
    mineChecker2(i - 1, j + 1);
    mineChecker2(i, j + 1);
    mineChecker2(i + 1, j - 1);
    mineChecker2(i + 1, j);
    mineChecker2(i + 1, j + 1);
}

//THIS FUNCTION CHECK FOR BOUNDS, IF THERE IS BOMB OR IF THERE IS NUMBER AND REVEALS CELLS ACCORDINGLY
function mineChecker2(i, j) {
    if (i < 0 || j < 0 || i > gameParameters.rows - 1 || j > gameParameters.cols - 1) {
        return;
    } else if (document.getElementById(`${i}:${j}`).getAttribute("value") == "bomb") {
        return;
    } else {
        if (document.getElementById(`${i}:${j}`).getAttribute("value").toString() > 0) {
            revealCell(i, j);
        } else if (document.getElementById(`${i}:${j}`).className != "discovered-cell") {
            revealCell(i, j);
            recursiveRevealCells(i, j);
        }
    }
}


//SMALL FUNCTION WHICH OPENS UP A CELL AT SPECIFIC INDEX
function revealCell(i, j) {
    let cell = document.getElementById(`${i}:${j}`);
    if (cell.getAttribute("value") > 0) {
        cell.innerHTML = cell.getAttribute('value');
    }
    cell.className = "discovered-cell";
}

//FUNCTION WHICH SHOWS MINES WHEN YOU CLICK ON ONE
function showMines() {
    bombLocations.forEach(element => {
        let bomb = document.getElementById(element);
        bomb.innerHTML = gameParameters.bomb;
        bomb.style.background = "rgb(255, 102, 102)"
        bomb.style.border = "";
    });
}

//GUARD FUNCTION FOR CHECKING WINNER
function checkWinner() {
    //checks if all other cells than bombs are discovered
    if (gameParameters.bombs != document.querySelectorAll('.cell').length) {
        return;
    }
    //The user has won a game
    else {
        gameRunning = false;
        gameParameters.gameOver = true;
        stopTime();
        console.log("WINNER");
        message.style.color = "darkgreen";
        message.style.fontSize = "1.5em";
        message.style.fontWeight = "600";
        if(Number(time.innerHTML) < 30){
            message.innerHTML = `LEGEND, you did it in only ${time.innerHTML} seconds!`;
        }else{
            message.innerHTML = "NICE JOB, You did it!";
        }
    }
}

//FUNCTION THAT UPDATES THE NUMBER OF FLAGS
function flagCountUpdater(){
    flagCount.innerHTML = flags.toString();
}

//FUNCTIONS FOR TIMER
function startTime() {
    gameRunning = true;
    intervalFun = setInterval(updateTime, 1000);
}

function resetTime() {
    gameRunning = false;
    time.innerHTML = "0";
}

function stopTime() {
    gameRunning = false;
    clearInterval(intervalFun);
}

function updateTime() {
    let currentTimeValue = Number(time.innerHTML);
    currentTimeValue++;
    time.innerHTML = currentTimeValue.toString();
}