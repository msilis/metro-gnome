const timerStartButton = document.getElementById('timerStartButton')
const timeDisplay = document.getElementById('timeDisplay')
const timerPauseButton = document.getElementById('timerPauseButton')
const timerResetButton = document.getElementById('timerResetButton')
const timerInput = document.getElementById('timerInput')

let startingMinutes = 10;
let time = startingMinutes * 60, currentCounter;

function updateTimer() {
  const minutes = Math.floor(time / 60);
  let seconds = time % 60;

  seconds = seconds < 10 ? '0' + seconds : seconds

  timeDisplay.innerHTML = `${minutes}:${seconds}`
  time--;
}

function startTimer() {
  console.log(currentCounter, 'current counter')
  clearInterval(currentCounter)
  currentCounter = setInterval(updateTimer, 1000)
  timerStartButton.disabled = true;
}

function pauseTimer() {
  clearInterval(currentCounter)
  timerStartButton.disabled = false;
}

function resetTimer() {
  clearInterval(currentCounter)
  time = startingMinutes

}

timerStartButton.addEventListener('click', startTimer)
timerPauseButton.addEventListener('click', pauseTimer)
timerResetButton.addEventListener('click', resetTimer)
