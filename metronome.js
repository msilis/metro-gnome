let audioContext = null;
let isPlaying = false;
let startTime;
let currentTwelveletNote;
let tempo = 120.0;
let meter = 4;
let masterVolume = 0.5;
let lookahead = 25.0;

let scheduleAheadTime = 0.1;

let nextNoteTime = 0.0;
let noteLength = 0.05;
const notesInQueue = [];

let timeWorker = null;

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

function scheduleNote(beatNumber, time){
  notesInQueue.push({ note: beatNumber, time: time });
  console.log(notesInQueue, 'notes in queue')

  const osc = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  osc.connect(gainNode)
  gainNode.connect(audioContext.destination)

  osc.start(time);
  osc.stop(time + noteLength)
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
