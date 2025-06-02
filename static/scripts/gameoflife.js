let w;
let columns;
let rows;
let board;
let next;
let osc;
let freqBoard;
let playing = false;

function setup() {
  createCanvas(280, 480);  // Match the dimensions from your example
  frameRate(10);  // Slow down the animation
  w = 20;
  
  // Calculate columns and rows
  columns = floor(width / w);
  rows = floor(height / w);
  
  // Initialize the oscillator
  osc = new p5.Oscillator('sine');
  
  // Initialize boards
  board = make2DArray(columns, rows);
  next = make2DArray(columns, rows);
  freqBoard = make2DArray(columns, rows);
  
  // Initialize frequency board with your note mappings
  initializeFreqBoard();
  
  init();
}

function draw() {
  background(255);
  generate();
  
  // Count active cells and their positions for sound
  let activeCells = [];
  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      if (board[i][j] == 1) {
        fill(0);
        activeCells.push({x: i, y: j});
      } else {
        fill(255);
      }
      stroke(0);
      rect(i * w, j * w, w-1, w-1);
    }
  }
  
  // Generate sound based on active cells
  if (activeCells.length > 0 && playing) {
    // Use the first active cell for frequency
    let freq = freqBoard[activeCells[0].x][activeCells[0].y] || 440;
    osc.freq(freq, 0.1);
    // Use number of active cells for amplitude
    let amp = map(activeCells.length, 0, (columns * rows) / 4, 0, 0.5);
    osc.amp(amp, 0.1);
  }
}

function mousePressed() {
  // Start audio on first click
  if (!playing) {
    osc.start();
    playing = true;
  }
  init();
}

function make2DArray(cols, rows) {
  let arr = new Array(cols);
  for (let i = 0; i < cols; i++) {
    arr[i] = new Array(rows);
  }
  return arr;
}

// reset board when mouse is pressed
function init() {
  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      // Lining the edges with 0s
      if (i == 0 || j == 0 || i == columns-1 || j == rows-1) board[i][j] = 0;
      // Filling the rest randomly
      else board[i][j] = floor(random(2));
      next[i][j] = 0;
    }
  }
}

// The process of creating the new generation
function generate() {

  // Loop through every spot in our 2D array and check spots neighbors
  for (let x = 1; x < columns - 1; x++) {
    for (let y = 1; y < rows - 1; y++) {
      // Add up all the states in a 3x3 surrounding grid
      let neighbors = 0;
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          neighbors += board[x+i][y+j];
        }
      }

      // A little trick to subtract the current cell's state since
      // we added it in the above loop
      neighbors -= board[x][y];
      // Rules of Life
      if      ((board[x][y] == 1) && (neighbors <  2)) next[x][y] = 0;           // Loneliness
      else if ((board[x][y] == 1) && (neighbors >  3)) next[x][y] = 0;           // Overpopulation
      else if ((board[x][y] == 0) && (neighbors == 3)) next[x][y] = 1;           // Reproduction
      else                                             next[x][y] = board[x][y]; // Stasis
    }
  }

  // Swap!
  let temp = board;
  board = next;
  next = temp;
}

function initializeFreqBoard() {
  // Initialize with your frequency mappings
  // This is a simplified version - you can add all your mappings
  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      // Map position to frequency using your note table
      freqBoard[i][j] = 220 * pow(2, floor(map(i + j, 0, columns + rows, 0, 12)) / 12);
    }
  }
}

