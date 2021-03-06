const rows = 120;
const cols = 240;
const fps = 25;
// const initialDensity = 0.;
const nGliders = 40;
const canSurvive = new Set([2, 3]);
const canSpawn = new Set([3]);


/* Initialize the board */
function initBoard() {
    const board = []
    for (let i = 0; i < rows; i++) {
        board[i] = [];

        for (let j = 0; j < cols; j++) {
            /* Random initial configuration */
            // board[i][j] = Math.random() < initialDensity ? 1 : 0;

            board[i][j] = 0;
        }
    }

    return board
}


/* Draw the table and keep an array of references to the cells */
function initTable() {
    const tdArray = [];
    const table = document.getElementById('boardTable');
    for (let i = 0; i < rows; i++) {
        const row = table.appendChild(document.createElement('tr'));
        tdArray[i] = [];

        for (let j = 0; j < cols; j++) {
            const cell = row.appendChild(document.createElement('td'));
            cell.classList.add('cell');
            cell.dataset['i'] = i.toString();
            cell.dataset['j'] = j.toString();
            cell.title = `${i},${j}`

            cell.onclick = () => flipCell(board, tdArray, i, j);
            cell.onmouseover = () => highlightCell(tdArray, i, j);
            cell.onmouseout = () => unhighlightCell(tdArray, i, j);
            cell.oncontextmenu = (event) => {
                createGlider(board, tdArray, i, j);
                event.preventDefault();
            };
            tdArray[i][j] = cell;
        }
    }
    return tdArray;
}


board = initBoard();
tdArray = initTable();
updateCellColors(board, tdArray);


function populateWithGliders(board, tdArray, nGliders) {
    for (let n = 0; n < nGliders; n++) {
        let i = Math.floor(Math.random() * rows);
        let j = Math.floor(Math.random() * cols);
        createGlider(board, tdArray, i, j);
    }
}

populateWithGliders(board, tdArray, nGliders);

function flipCell(board, tdArray, i, j) {
    board[i][j] = board[i][j] ? 0 : 1;
    const cell = tdArray[i][j];
    cell.classList.remove('dead');
    cell.classList.remove('alive');
    cell.classList.add(board[i][j] ? 'alive' : 'dead');
}


function highlightCell(tdArray, i, j) {
    const cell = tdArray[i][j];
    cell.classList.add('highlight');
}


function unhighlightCell(tdArray, i, j) {
    const cell = tdArray[i][j];
    cell.classList.remove('highlight');
}


function createGlider(board, tdArray, i, j) {
    const goingUp = Math.round(Math.random());
    const goingLeft = Math.round(Math.random());

    const ip1 = (i + 1) % rows;
    const im1 = (i - 1 + rows) % rows;
    const jp1 = (j + 1) % cols;
    const jm1 = (j - 1 + cols) % cols;
    board[im1][jm1] = 1 - goingUp;
    board[im1][j] = goingUp;
    board[im1][jp1] = 1 - goingUp;
    board[i][jm1] = goingLeft;
    board[i][j] = 1;
    board[i][jp1] = 1 - goingLeft;
    board[ip1][jm1] = goingUp;
    board[ip1][j] = 1 - goingUp;
    board[ip1][jp1] = goingUp;
    updateCellColors(board, tdArray);
}


function getNumberOfAliveNeighbors(board, i, j) {
    const ip1 = (i + 1) % rows;
    const im1 = (i - 1 + rows) % rows;
    const jp1 = (j + 1) % cols;
    const jm1 = (j - 1 + cols) % cols;
    return (
        board[ip1][jp1]
        + board[i][jp1]
        + board[im1][jp1]
        + board[ip1][j]
        + board[im1][j]
        + board[ip1][jm1]
        + board[i][jm1]
        + board[im1][jm1]
    )
}

function getNextBoard() {
    const nextBoard = [];
    for (let i = 0; i < rows; i++) {
        nextBoard[i] = []
        for (let j = 0; j < cols; j++) {
            const amIAlive = board[i][j];
            const nAliveNeighbors = getNumberOfAliveNeighbors(board, i, j);
            if (amIAlive) {
                if (canSurvive.has(nAliveNeighbors))
                    nextBoard[i][j] = 1;
                else
                    nextBoard[i][j] = 0;
            } else {
                if (canSpawn.has(nAliveNeighbors))
                    nextBoard[i][j] = 1;
                else
                    nextBoard[i][j] = 0;
            }
        }
    }
    return nextBoard;
}

function updateBoard(board) {
    const nextBoard = getNextBoard();
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            board[i][j] = nextBoard[i][j];
        }
    }
}


function updateCellColors(board, tdArray) {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const cell = tdArray[i][j];
            cell.className = board[i][j] ? 'cell alive' : 'cell dead';
        }
    }
}


function timeStep() {
    updateBoard(board);
    updateCellColors(board, tdArray);
}


function previewNextTimeStep() {
    const nextBoard = getNextBoard();

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const cell = tdArray[i][j];
            if (nextBoard[i][j] && !board[i][j])
                cell.classList.add('preview-alive');
            if (!nextBoard[i][j] && board[i][j])
                cell.classList.add('preview-dead');
        }
    }
}

function removePreview() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const cell = tdArray[i][j];
            cell.classList.remove('preview-alive');
            cell.classList.remove('preview-dead');
        }
    }
}

let interval = null;
function startStop() {
    if (interval)
    {
        clearInterval(interval);
        interval = null;
        this.innerHTML = 'Start';
    }
    else
    {
        interval = setInterval(timeStep, 1000 / fps);
        this.innerHTML = 'Stop';
    }
}


function clearBoard() {
    for (let i = 0; i < rows; i++)
        for (let j = 0; j < cols; j++)
            board[i][j] = 0;

    updateCellColors(board, tdArray);
}


document.getElementById('startStopBtn').onclick = startStop;
document.getElementById('stepBtn').onclick = () => {
    timeStep(); removePreview(); previewNextTimeStep();
};
document.getElementById('stepBtn').onmouseover = previewNextTimeStep;
document.getElementById('stepBtn').onmouseout = removePreview;
// document.getElementById('stepBtn').onmouseout = () => updateCellColors(board, tdArray);
document.getElementById('clearBtn').onclick = clearBoard;
document.getElementById('populateBtn').onclick = () => populateWithGliders(board, tdArray, nGliders);
