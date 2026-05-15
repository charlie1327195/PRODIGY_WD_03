// ===== STATE =====
let board = Array(9).fill(null);
let currentPlayer = 'X';
let gameOver = false;
let mode = '2p';
let scores = { X: 0, O: 0, D: 0 };
const WIN_COMBOS = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

// ===== DOM =====
const statusEl  = document.getElementById('status');
const scoreXEl  = document.getElementById('scoreX');
const scoreOEl  = document.getElementById('scoreO');
const scoreDrawEl = document.getElementById('scoreDraw');
const xcardEl   = document.getElementById('xcardEl');
const ocardEl   = document.getElementById('ocardEl');
const oLabelEl  = document.getElementById('oLabel');
const cells     = document.querySelectorAll('.cell');

// ===== MODE BUTTONS =====
document.querySelectorAll('.mode-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    mode = btn.dataset.mode;
    oLabelEl.textContent = mode === '2p' ? 'Player' : 'AI';
    newGame();
  });
});

// ===== CELL CLICKS =====
cells.forEach(cell => {
  cell.addEventListener('click', () => {
    const i = parseInt(cell.dataset.index);
    if (gameOver || board[i]) return;
    if (mode !== '2p' && currentPlayer === 'O') return;
    makeMove(i, currentPlayer);
    if (!gameOver && mode !== '2p') {
      setTimeout(aiMove, 350);
    }
  });
});

// ===== NEW GAME BUTTON =====
document.getElementById('newGameBtn').addEventListener('click', newGame);

// ===== MAKE MOVE =====
function makeMove(index, player) {
  board[index] = player;
  const cell = cells[index];
  cell.classList.add('taken', player.toLowerCase());
  document.getElementById('c' + index).textContent = player;

  const winCombo = checkWin(board);
  if (winCombo) {
    endGame(player, winCombo);
    return;
  }
  if (board.every(v => v)) {
    endGame(null);
    return;
  }

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  updateStatus();
}

// ===== CHECK WIN =====
function checkWin(b) {
  for (const [a, c, d] of WIN_COMBOS) {
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return [a, c, d];
  }
  return null;
}

// ===== END GAME =====
function endGame(winner, combo) {
  gameOver = true;
  if (winner) {
    statusEl.textContent = `${winner} Wins! 🎉`;
    statusEl.className = 'status win';
    combo.forEach(i => cells[i].classList.add('win-cell'));
    scores[winner]++;
    if (winner === 'X') scoreXEl.textContent = scores.X;
    else scoreOEl.textContent = scores.O;
  } else {
    statusEl.textContent = "It's a Draw! 🤝";
    statusEl.className = 'status draw';
    scores.D++;
    scoreDrawEl.textContent = scores.D;
  }
  updateTurnCards(null);
}

// ===== STATUS =====
function updateStatus() {
  const isAI = mode !== '2p' && currentPlayer === 'O';
  statusEl.textContent = isAI ? 'AI is thinking...' : `${currentPlayer}'s Turn`;
  statusEl.className = 'status ' + (currentPlayer === 'X' ? 'x-turn' : 'o-turn');
  updateTurnCards(currentPlayer);
}

function updateTurnCards(p) {
  xcardEl.classList.toggle('active-turn', p === 'X');
  ocardEl.classList.toggle('active-turn', p === 'O');
}

// ===== NEW GAME =====
function newGame() {
  board = Array(9).fill(null);
  currentPlayer = 'X';
  gameOver = false;
  cells.forEach((c, i) => {
    c.className = 'cell';
    document.getElementById('c' + i).textContent = '';
  });
  updateStatus();
}

// ===== AI =====
function aiMove() {
  if (gameOver) return;
  const idx = mode === 'hard' ? bestMoveMinimax() : easyMove();
  if (idx !== -1) makeMove(idx, 'O');
}

function easyMove() {
  const empty = board.map((v, i) => v === null ? i : null).filter(v => v !== null);
  return empty.length ? empty[Math.floor(Math.random() * empty.length)] : -1;
}

function bestMoveMinimax() {
  // Win immediately
  for (const [a, b, c] of WIN_COMBOS) {
    const line = [board[a], board[b], board[c]];
    if (line.filter(v => v === 'O').length === 2 && line.includes(null)) {
      return [a, b, c].find(i => board[i] === null);
    }
  }
  // Block X win
  for (const [a, b, c] of WIN_COMBOS) {
    const line = [board[a], board[b], board[c]];
    if (line.filter(v => v === 'X').length === 2 && line.includes(null)) {
      return [a, b, c].find(i => board[i] === null);
    }
  }
  // Center
  if (!board[4]) return 4;
  // Minimax for best move
  let bestScore = -Infinity, bestMove = -1;
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = 'O';
      const score = minimax(board, 0, false);
      board[i] = null;
      if (score > bestScore) { bestScore = score; bestMove = i; }
    }
  }
  return bestMove;
}

function minimax(b, depth, isMaximizing) {
  const winner = getWinner(b);
  if (winner === 'O') return 10 - depth;
  if (winner === 'X') return depth - 10;
  if (b.every(v => v)) return 0;

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!b[i]) {
        b[i] = 'O';
        best = Math.max(best, minimax(b, depth + 1, false));
        b[i] = null;
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (!b[i]) {
        b[i] = 'X';
        best = Math.min(best, minimax(b, depth + 1, true));
        b[i] = null;
      }
    }
    return best;
  }
}

function getWinner(b) {
  for (const [a, c, d] of WIN_COMBOS) {
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
  }
  return null;
}
