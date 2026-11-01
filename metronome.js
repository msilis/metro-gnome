let audioContext = null;
let isPlaying = false;
let startTime;
let currentTwelveletNote;
let tempo = 60.0;
let meter = 4;
let masterVolume = 0.5;
let lookahead = 25.0;
let accentVolume = 1;

let scheduleAheadTime = 0.1;

let nextNoteTime = 0.0;
let noteLength = 0.05;
const notesInQueue = [];

let timeWorker = null;

const bpmDisplay = document.getElementById('bpmDisplay')
const bpmSelector = document.getElementById('bpmSelector')
const minusButton = document.getElementById('minusButton')
const plusButton = document.getElementById('plusButton')

bpmSelector.addEventListener('change', (e) => {
  tempo = e.target.value
  bpmDisplay.innerHTML = e.target.value

  return () => {
    bpmSelector.removeEventListener('change', () => {
      tempo = e.target.value
      bpmDisplay.innerHTML = e.target.value
    })
  }
})

minusButton.addEventListener('click', () => {
  tempo -= 1
  bpmDisplay.innerHTML = tempo;
  bpmSelector.value = tempo;
})

plusButton.addEventListener('click', () => {
  tempo += 1;
  bpmDisplay.innerHTML = tempo;
  bpmSelector.value = tempo;
})

function reset() {
  tempo = 60;
  bpmDisplay.innerHTML = 60;
  bpmSelector.value = 60
}

function maxBeats(){
  const beats = (meter * 12);
  return beats;
}

function nextTwelvelet(){
  const secondsPerBeat = 60.0 / tempo;
  nextNoteTime += 0.08333 * secondsPerBeat;
  currentTwelveletNote++;

  if(currentTwelveletNote === maxBeats()){
    currentTwelveletNote = 0;
  }
}

function calcVolume(beatVolume) {
  return (beatVolume * masterVolume)
}


function scheduleNote(beatNumber, time) {
  notesInQueue.push({ note: beatNumber, time: time });

  if (beatNumber % 12 === 0) {

    const osc = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    osc.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (beatNumber % maxBeats() === 0) {
      if (accentVolume > 0.25) {
        osc.frequency.value = 880.0;
        gainNode.gain.value = calcVolume(accentVolume);
      } else {
        gainNode.gain.value = 0;
      }
    }

    else {
      osc.frequency.value = 880.0;
      gainNode.gain.value = calcVolume(accentVolume);
    }

    osc.start(time);
    osc.stop(time + noteLength);
  }
}



function scheduler() {
  while (nextNoteTime < audioContext.currentTime + scheduleAheadTime) {
    scheduleNote(currentTwelveletNote, nextNoteTime);
    nextTwelvelet();
  }
}

function play() {
  isPlaying = !isPlaying;

  if (isPlaying) {
    currentTwelveletNote = 0;
    nextNoteTime = audioContext.currentTime;
    timeWorker.postMessage('start');
  } else {
    timeWorker.postMessage('stop')
  }
}

function init() {
  audioContext = new AudioContext();
  timeWorker = new Worker('worker.js')

  timeWorker.onmessage = function (e) {
    if (e.data === 'tick') {
      scheduler();
    } else {
      console.log('message: ', e.data)
    }
  }
  timeWorker.postMessage({'interval': lookahead})
}

window.addEventListener('load', init)
