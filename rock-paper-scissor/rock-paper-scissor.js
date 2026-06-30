// 1. Get the computer's move
function getComputerMove() {
            let randomNumber = Math.random();
            if      (randomNumber < 1/3) return 'rock';
            else if (randomNumber < 2/3) return 'paper';
            else                         return 'scissor';
        }
// 2. Determine the result of the game
        function getResult(playerMove, computerMove) {
            if (playerMove === computerMove) return 'Tie!';

            if (playerMove === 'rock'    && computerMove === 'scissor') return 'You win!';
            if (playerMove === 'paper'   && computerMove === 'rock')    return 'You win!';
            if (playerMove === 'scissor' && computerMove === 'paper')   return 'You win!';

            return 'You lose!';
        }
// 3. Play the game
        function play(playerMove) {
            let computerMove = getComputerMove();
            let result = getResult(playerMove, computerMove);
            alert('You picked ' + playerMove + '. Computer picked ' + computerMove + '. ' + result);
        }