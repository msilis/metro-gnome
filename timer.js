const timerStartButton = document.getElementById('timerStartButton')
const timeDisplay = document.getElementById('timeDisplay')
const timerPauseButton = document.getElementById('timerPauseButton')
const timerResetButton = document.getElementById('timerResetButton')
const timeInput = document.getElementById('timeInput')

let startingMinutes = parseInt(timeInput.value);
let time = startingMinutes * 60, currentCounter;

function ringBell() {
   new Audio('./assets/freesound_community-bell-98033.mp3').play()
}

function updateTimer() {
  if (time === 0) {
    timerStartButton.disabled = false;
    pauseTimer()
    ringBell()
    return
  }
  time--;
  updateDisplay()
}

function startTimer() {
  if (time <= 0) {
    resetTimer()
  }
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
  time = startingMinutes * 60
  updateDisplay()
  timerStartButton.disabled = false;

}

function updateDisplay() {
  const minutes = Math.floor(time / 60);
  let seconds = time % 60;

  seconds = seconds < 10 ? '0' + seconds : seconds
  timeDisplay.innerHTML = `${minutes}:${seconds}`
}

timerStartButton.addEventListener('click', startTimer)
timerPauseButton.addEventListener('click', pauseTimer)
timerResetButton.addEventListener('click', resetTimer)
timeInput.addEventListener('input', (e) => {
  startingMinutes = e.target.value
  pauseTimer()
  resetTimer()
})

updateDisplay()
