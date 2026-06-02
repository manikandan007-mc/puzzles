const CONFIG = {
    levels: [
        { id: 1, image: 'image1.png' },
        { id: 2, image:'image2.png' },
        { id: 3, image:'image3.png' }
    ],
    gridSize: 3
};

let currentLevelIndex = 0;
let tiles = [];
let moves = 0;
let isShuffled = false;
let draggedTileIndex = null;

const gridElement = document.getElementById('puzzle-grid');
const moveCountElement = document.getElementById('move-count');
const currentLevelElement = document.getElementById('current-level');
const referenceImg = document.getElementById('reference-img');
const winModal = document.getElementById('win-modal');
const nextLevelBtn = document.getElementById('next-level-btn');
const shuffleBtn = document.getElementById('shuffle-btn');

function initGame() {
    const level = CONFIG.levels[currentLevelIndex];
    currentLevelElement.textContent = level.id;
    referenceImg.src = level.image;
    moves = 0;
    moveCountElement.textContent = moves;
    winModal.classList.add('hidden');
    tiles = Array.from({ length: 9 }, (_, i) => i);
    renderGrid();
    
    // Auto-shuffle on load after a tiny delay for visual clarity
    setTimeout(() => {
        shuffle();
    }, 500);
}

function renderGrid() {
    gridElement.innerHTML = '';
    const level = CONFIG.levels[currentLevelIndex];
    
    tiles.forEach((tileValue, index) => {
        const piece = document.createElement('div');
        piece.classList.add('puzzle-piece');
        piece.dataset.index = index;
        
        if (tileValue === 8) {
            piece.classList.add('empty');
            // Adding drag handlers to empty tile so it can be a drop target
            piece.addEventListener('dragover', e => e.preventDefault());
            piece.addEventListener('drop', e => handleDrop(index));
        } else {
            piece.draggable = true;
            piece.style.backgroundImage = `url(${level.image})`;
            
            const row = Math.floor(tileValue / CONFIG.gridSize);
            const col = tileValue % CONFIG.gridSize;
            const posX = (col / (CONFIG.gridSize - 1)) * 100;
            const posY = (row / (CONFIG.gridSize - 1)) * 100;
            piece.style.backgroundPosition = `${posX}% ${posY}%`;
            
            piece.addEventListener('dragstart', () => {
                draggedTileIndex = index;
                piece.classList.add('dragging');
            });
            piece.addEventListener('dragend', () => piece.classList.remove('dragging'));
            
            // Still allow click for quick moves
            piece.addEventListener('click', () => handleMove(index));
        }
        
        gridElement.appendChild(piece);
    });
}

function handleDrop(targetIndex) {
    if (draggedTileIndex !== null && isAdjacent(draggedTileIndex, targetIndex)) {
        swapTiles(draggedTileIndex, targetIndex);
        moves++;
        moveCountElement.textContent = moves;
        renderGrid();
        checkWin();
    }
    draggedTileIndex = null;
}

function handleMove(index) {
    const emptyIndex = tiles.indexOf(8);
    if (isAdjacent(index, emptyIndex)) {
        swapTiles(index, emptyIndex);
        moves++;
        moveCountElement.textContent = moves;
        renderGrid();
        checkWin();
    }
}

function isAdjacent(idx1, idx2) {
    const r1 = Math.floor(idx1 / 3);
    const c1 = idx1 % 3;
    const r2 = Math.floor(idx2 / 3);
    const c2 = idx2 % 3;
    return (Math.abs(r1 - r2) + Math.abs(c1 - c2)) === 1;
}

function swapTiles(idx1, idx2) {
    const temp = tiles[idx1];
    tiles[idx1] = tiles[idx2];
    tiles[idx2] = temp;
}

function shuffle() {
    isShuffled = false;
    let shuffles = 0;
    const maxShuffles = 80; 
    const intervalTime = 12; // ~1 second total (80 * 12 = 960ms)
    
    shuffleBtn.disabled = true;
    shuffleBtn.textContent = "Shuffling...";

    const interval = setInterval(() => {
        const emptyIndex = tiles.indexOf(8);
        const neighbors = getNeighbors(emptyIndex);
        const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
        
        swapTiles(emptyIndex, randomNeighbor);
        renderGrid();
        
        shuffles++;
        if (shuffles >= maxShuffles) {
            clearInterval(interval);
            moves = 0;
            moveCountElement.textContent = moves;
            isShuffled = true;
            shuffleBtn.disabled = false;
            shuffleBtn.textContent = "Shuffle Game";
        }
    }, intervalTime);
}

function getNeighbors(index) {
    const neighbors = [];
    const r = Math.floor(index / 3);
    const c = index % 3;
    if (r > 0) neighbors.push(index - 3);
    if (r < 2) neighbors.push(index + 3);
    if (c > 0) neighbors.push(index - 1);
    if (c < 2) neighbors.push(index + 1);
    return neighbors;
}

function checkWin() {
    if (!isShuffled) return;
    const isWin = tiles.every((val, index) => val === index);
    if (isWin) {
        isShuffled = false;
        setTimeout(() => winModal.classList.remove('hidden'), 500);
    }
}

nextLevelBtn.addEventListener('click', () => {
    currentLevelIndex++;
    if (currentLevelIndex >= CONFIG.levels.length) {
        currentLevelIndex = 0;
        alert('MASTER SOLVER! You completed all levels of FEFDYGAMES!');
    }
    initGame();
});

shuffleBtn.addEventListener('click', shuffle);

initGame();
