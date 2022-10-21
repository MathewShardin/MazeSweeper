//Game initialization
var playField = generateField(); //Get the current playField
var playerPos = [1, generateStartPos(playField)]; //Generate start position for player
var checkCoins = 3; //Start with 3 checks avaliable
var numOfSteps = 0;
var numOfChecks = 0;
//startGame();


function startGame() {
    document.getElementById("playTable").innerHTML = "";
    playField = generateField(); //Get the current playField
    playerPos = [1, generateStartPos(playField)]; //Generate start position for player
    checkCoins = 3; //Start with 3 checks avaliable
    numOfSteps = 0;
    numOfChecks = 0;
    drawPlayField(playField);
}


//Game loop
//Movement key press events
window.addEventListener('keydown', function (e) {
    checkCoins = checkCoins + Math.floor(Math.random() * 3) + 1; //Add 1-3 check coins per step
    numOfSteps++; //Increase number of steps taken
    switch (e.key) {
        case "w":
            playerGoUp();
            drawPlayField(playField);
            break;
        case "s":
            playerGoDown();
            drawPlayField(playField);
            break;
        case "a":
            playerGoLeft();
            drawPlayField(playField);
            break;
        case "d":
            playerGoRight();
            drawPlayField(playField);
            break;
    }
    if (isPlayerOnMine()) {
        gameOver();
    }
    if (isPlayerWon()) {
        gameWon();
    }
  }, false);



function drawPlayField(playField) {
    document.getElementById("playTable").innerHTML = "";
    const tbl = document.createElement("table");
    const tblBody = document.createElement("tbody");

    for (let i = 0; i < 7; i++) {
        const row = document.createElement("tr"); //Create table row
        for (let j = 0; j < 12; j++) {
            const cell = document.createElement("td");
            switch (playField[i][j]) {
                case 0:
                    var imgTile = document.createElement('img');
                    imgTile.src = "Sprites/tile.png";
                    cell.setAttribute("bgcolor", "gray"); //Empty tile
                    cell.appendChild(imgTile);
                    break;
                case 1:
                    var imgTile = document.createElement('img');
                    imgTile.src = "Sprites/tile.png";
                    cell.setAttribute("bgcolor", "gray"); //Tile with a mine
                    cell.appendChild(imgTile);
                    break;
                case 2:
                    cell.setAttribute("bgcolor", "black"); //border
                    break;
                case 3:
                    cell.setAttribute("bgcolor", "gray"); //Opened Mine
                    var imgMine = document.createElement('img');
                    imgMine.src = "Sprites/mine.png";
                    cell.appendChild(imgMine);
                    break;
                case 4:
                    cell.setAttribute("bgcolor", "gray"); //goal
                    var imgGoal = document.createElement('img');
                    imgGoal.src = "Sprites/goal.png";
                    cell.appendChild(imgGoal);
                    break;
                case 5:
                    cell.setAttribute("bgcolor", "gray"); //Checked empty tile
                    var imgCheck = document.createElement('img');
                    //Assign the sprite with an appropriate number of adjacent mines
                    switch (checkFieldDraw(i,j)) {
                        case 1:
                            imgCheck.src = "Sprites/check1.png";
                            break;
                        case 2:
                            imgCheck.src = "Sprites/check2.png";
                            break;
                        case 3:
                            imgCheck.src = "Sprites/check3.png";
                            break;
                        default:
                            imgCheck.src = "Sprites/check0.png";
                            break;
                    }
                    cell.appendChild(imgCheck);
                    break;
                default:
                    cell.setAttribute("bgcolor", "green");
                    break;
            }
            //Put the player sprite on the field
            if (i == playerPos[0] && j == playerPos[1]) {
                cell.innerHTML= ""; //Remove other sprites
                var imgPl = document.createElement('img');
                imgPl.src = "Sprites/player.png";
                imgPl.setAttribute("z-index", "10");
                cell.appendChild(imgPl);
            }
            row.appendChild(cell);
        }
        tblBody.appendChild(row);
    }

    tbl.appendChild(tblBody);
    document.getElementById("playTable").appendChild(tbl);
    tbl.setAttribute("border", "2");
    tbl.setAttribute("width", "624px");
    tbl.setAttribute("height", "364px");
    tbl.setAttribute("id", "tbl");
    document.getElementById('statusP').innerHTML = "<b>MazeSweeper - Checks: " + checkCoins + "</b>";

    //Click events. Reassign event handler after every render of the table
    var tbody = document.querySelector('#tbl tbody');
    tbody.addEventListener('click', function (e) {
        const cell = e.target.closest('td');
        if (!cell) {return;} //Stop if no cell is clicked
        const row = cell.parentElement;
        let y = row.rowIndex;
        let x = cell.cellIndex;
        //Only check a tile if a player has enough check coins
        if (checkCoins > 0) {
            checkCoins = checkCoins - 1;
            if (playField[y][x] == 1) {
                playField[y][x] = 3;
            }
    
            if (playField[y][x] == 0) {
                playField[y][x] = 5;
            }
    
            numOfChecks++;

            //Play check sound
            var soundCheck = new Howl({src: ['Sounds/check.mp3']});  
            soundCheck.play();

            drawPlayField(playField);
        }
    }); 
}

function generateField(){
    //Create a 2 dimensional array - play field
    var playField = new Array(7);
    for (var i = 0; i < playField.length; i++) {
        playField[i] = new Array(12);
    }

    //Initialize the play area with empty fields and borders around
    //Fill first row
    for (var j = 0; j < 12; j++) {
        playField[0][j] = 2;
    }
    //Fill last row
    for (var j = 0; j < 12; j++) {
        playField[6][j] = 2;
    }
    //Fill left column
    for (var i = 0; i < 6; i++) {
        playField[i][0] = 2;
    }
    //Fill right column
    for (var i = 0; i < 6; i++) {
        playField[i][11] = 2;
    }
    //Fill in empty fields
    for (var i = 1; i < 6; i++) {
        for (var j = 1; j < 11; j++) {
            playField[i][j] = 0;
        }  
    }

    //Mine generation -----------
    for (var i = 1; i < 6; i++) {
        for (var a = 0; a < 5; a++) {
            var j = Math.floor(Math.random() * 10) + 1;
            playField[i][j] = (checkField(i,j) < 4) ? 1 : 0;
        }  
    }

    //Returns number of not empty tiles on adjacent 4 cells
    function checkField(i,j) {
        var outNum = 0;
        if (playField[i][j-1] != 0) {
            outNum++;
        }
        if (playField[i][j+1] != 0) {
            outNum++;
        }
        if (playField[i-1][j] != 0) {
            outNum++;
        }
        if (playField[i+1][j] != 0) {
            outNum++;
        }
        return outNum;
    }

    //Generate random goal position within borders
    let goalPosX = Math.floor(Math.random() * 9) + 2;
    let goalPosY = Math.floor(Math.random() * 5) + 1;
    playField[goalPosY][goalPosX] = 4;

    return playField;
}

//Function that generates the X coordinate of starting position on the first line
function generateStartPos(playField) {
    while(true) {
        var startPos = Math.floor(Math.random() * 10) + 1;
        if (playField[1][startPos] == 0) {
            console.log("Start pos 1;" + startPos);
            return startPos;
        }
    }
}

//Check if a player stepped on a mine or a border
function isPlayerOnMine() {
    if (playField[playerPos[0]][playerPos[1]] == 1 || playField[playerPos[0]][playerPos[1]] == 2 || playField[playerPos[0]][playerPos[1]] == 3) {
        return true;
    } else {
        return false;
    }
}

//Check if a player stepped on the goal
function isPlayerWon() {
    return (playField[playerPos[0]][playerPos[1]] == 4) ? true : false;
}

//Returns number of not empty tiles on adjacent 4 cells
function checkFieldDraw(i,j) {
    var outNum = 0;
    if (playField[i][j-1] == 1 || playField[i][j-1] == 3) {
        outNum++;
    }
    if (playField[i][j+1] == 1 || playField[i][j+1] == 3) {
        outNum++;
    }
    if (playField[i-1][j] == 1 || playField[i-1][j] == 3) {
        outNum++;
    }
    if (playField[i+1][j] == 1 || playField[i+1][j] == 3) {
        outNum++;
    }
    return outNum;
}

//Player movement functions. Player can move in 4 directions, 1 cell at a time
function playerGoUp() {
    if (playerPos[0] != 1) {
        playerPos[0] = playerPos[0] - 1;
    }
}

function playerGoDown() {
    if (playerPos[0] != 5) {
        playerPos[0] = playerPos[0] + 1;
    }
}

function playerGoLeft() {
    if (playerPos[1] != 1) {
        playerPos[1] = playerPos[1] - 1;
    }
}

function playerGoRight() {
    if (playerPos[1] != 10) {
        playerPos[1] = playerPos[1] + 1;
    }
}

//Finishing fuctions
function gameOver(){
    document.getElementById("playTable").innerHTML = ""; //Clear the playing table
    var pLoss = document.createElement("p");
    var nodeLoss = document.createTextNode("Game Over!");
    var nodeBr = document.createElement("br");
    var nodeLossSteps = document.createTextNode("You made "+ numOfSteps + " steps");
    pLoss.setAttribute("style", "text-align: center; color: white; font-size: 2vmax;"); //Style the p element
    pLoss.appendChild(nodeLoss);
    pLoss.appendChild(nodeBr);
    pLoss.appendChild(nodeLossSteps);
    document.getElementById("playTable").appendChild(pLoss);

    //Remove keyboard controls from player
    window.removeEventListener('keydown', function(){});

    //Play loss sound
    var soundLoss = new Howl({src: ['Sounds/bomb_de.mp3']});  
    soundLoss.play();
}

function gameWon(){
    document.getElementById("playTable").innerHTML = ""; //Clear the playing table
    var pWon = document.createElement("p");
    var nodeWon = document.createTextNode("You won!");
    var nodeBr = document.createElement("br");
    var nodeWonSteps = document.createTextNode("You made "+ numOfSteps + " steps and " + numOfChecks + " checks");
    pWon.setAttribute("style", "text-align: center; color: white; font-size: 2vmax;"); //Style the p element
    pWon.appendChild(nodeWon);
    pWon.appendChild(nodeBr);
    pWon.appendChild(nodeWonSteps);
    document.getElementById("playTable").appendChild(pWon);

    //Remove keyboard controls from player
    window.removeEventListener('keydown', function(){});

    //Play sound
    var sound = new Howl({src: ['Sounds/xp.mp3']});  
    sound.play();

}
