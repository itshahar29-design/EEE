
    let board = Array(9).fill(null);
    let current = 'X';
    let isOver = false;
    const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    window.makeMove = (i) => {
        if (board[i] || isOver) return;
        board[i] = current;
        document.querySelectorAll('.ttt-cell')[i].textContent = current;
        document.querySelectorAll('.ttt-cell')[i].style.color = current === 'X' ? '#38bdf8' : '#ec4899';
        checkWin();
        if (!isOver) {
            current = current === 'X' ? 'O' : 'X';
            document.getElementById('ttt-status').textContent = current + " o'yinchining navbati";
        }
    };
    function checkWin() {
        for (const w of wins) {
            if (board[w[0]] && board[w[0]] === board[w[1]] && board[w[0]] === board[w[2]]) {
                isOver = true;
                document.getElementById('ttt-status').textContent = '🎉 ' + board[w[0]] + " G'OLIB BO'LDI!";
                return;
            }
        }
        if (!board.includes(null)) {
            isOver = true;
            document.getElementById('ttt-status').textContent = '🤝 Durang natija!';
        }
    }
    window.resetTTT = () => {
        board = Array(9).fill(null);
        current = 'X';
        isOver = false;
        document.querySelectorAll('.ttt-cell').forEach(c => c.textContent = '');
        document.getElementById('ttt-status').textContent = "X o'yinchining navbati";
    };
  