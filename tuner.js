const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
let isListening = false;
let tunerAudioContext = null;
let micStream = null;
let animFrameId = null;

const tunerStartButton = document.getElementById("tunerStartButton");
const tunerNeedle = document.getElementById("tunerNeedle");
const octaveDisplay = document.getElementById("tunerOctave");
const noteDisplay = document.getElementById("tunerNote");

const noteFrequencies = {};

for (let octave = 0; octave <= 8; octave++) {
  notes.forEach((note, i) => {
    const noteEnum = octave * 12 + 9 - 1;
    noteFrequencies[`${note}${octave}`] =
      440 * Math.pow(2, (noteEnum - 49) / 12);
  });
}

function getCentsColour(cents) {
  const difference = Math.abs(cents);

  if (difference <= 5) {
    return "green";
  } else if (difference <= 15) {
    return "yellow";
  } else return "red";
}

function updateNoteDisplay(noteInfo) {
  if (!noteInfo) return;
  noteDisplay.textContent = noteInfo.note;

  const percentage = Math.max(0, Math.min(100, 50 + noteInfo.cents));
  const colour = getCentsColour(noteInfo.cents);
  noteDisplay.style.color = colour;

  console.log(percentage, "percentage");

  tunerNeedle.style.left = `${percentage}%`;
  noteDisplay.style.color = colour;
}

function getClosestNote(freq) {
  if (!freq || freq < 20 || freq > 5000) return null;
  const noteEnum = 12 * Math.log2(freq / 440) + 49;
  const rounded = Math.round(noteEnum);
  const cents = Math.round((noteEnum - rounded) * 100);
  const octave = Math.floor((rounded + 8) / 12);
  const noteIndex = (((rounded + 8) % 12) + 12) % 12;
  return {
    note: notes[noteIndex],
    octave,
    cents,
    frequency: freq,
    fullNote: `${notes[noteIndex]}${octave}`,
  };
}

function autoCorrelate(buffer, sampleRate) {
  let size = buffer.length;
  let rms = 0;
  for (let i = 0; i < size; i++) {
    rms += buffer[i] * buffer[i];
  }
  rms = Math.sqrt(rms / buffer.length);
  if (rms < 0.01) {
    return -1;
  }

  let r1 = 0,
    r2 = size - 1;
  const threshold = 0.2;
  for (let i = 0; i < size / 2; i++) {
    if (Math.abs(buffer[i]) < threshold) {
      r1 = i;
      break;
    }
  }
  for (let i = 1; i < size / 2; i++) {
    if (Math.abs(buffer[size - i]) < threshold) {
      r2 = size - i;
      break;
    }
  }
  buffer = buffer.slice(r1, r2);
  size = buffer.length;

  const c = new Array(size).fill(0);
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size - i; j++) {
      c[i] += buffer[j] * buffer[j + i];
    }
  }

  let d = 0;
  while (c[d] > c[d + 1]) d++;

  let maxValue = -1;
  maxPosition = -1;

  for (let i = d; i < size; i++) {
    if (c[i] > maxValue) {
      maxValue = c[i];
      maxPosition = i;
    }
  }

  let t0 = maxPosition;
  const x1 = c[t0 - 1],
    x2 = c[t0],
    x3 = c[t0 + 1];
  const a = (x1 + x3 - 2 * x2) / 2;
  const b = (x3 - x1) / 2;
  if (a) {
    t0 = t0 - b / (2 * a);
  }
  return sampleRate / t0;
}

async function startListening() {
  try {
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    tunerAudioContext = new AudioContext();
    const analyser = tunerAudioContext.createAnalyser();
    analyser.fftSize = 4096;

    const source = tunerAudioContext.createMediaStreamSource(micStream);
    source.connect(analyser);

    const buffer = new Float32Array(analyser.fftSize);
    isListening = true;
    tunerStartButton.textContent = "Stop";

    const detect = () => {
      analyser.getFloatTimeDomainData(buffer);

      let rms = 0;
      for (let i = 0; i < buffer.length; i++) {
        rms += buffer[i] * buffer[i];
      }
      rms = Math.sqrt(rms / buffer.length);

      if (rms >= 0.01) {
        const frequency = autoCorrelate(buffer, tunerAudioContext.sampleRate);
        if (frequency > 0) {
          const noteInfo = getClosestNote(frequency);
          if (noteInfo) {
            updateNoteDisplay(noteInfo);
          }
        }
      }
      analyser.getFloatTimeDomainData(buffer);
      animFrameId = requestAnimationFrame(detect);
    };
    detect();
  } catch (err) {
    console.error("Microphone access denied: ", err);
  }
}

function stopListening() {
  if (animFrameId) {
    cancelAnimationFrame(animFrameId);
    animFrameId = null;
  }
  if (micStream) {
    micStream.getTracks().forEach((track) => track.stop());
    micStream = null;
  }
  if (tunerAudioContext) {
    tunerAudioContext.close();
    tunerAudioContext = null;
  }
  tunerStartButton.textContent = "Start";
  noteDisplay.textContent = "-";
  noteDisplay.style.color = "white";
  tunerNeedle.style.left = "50%";
  isListening = false;
}

tunerStartButton.addEventListener("click", () => {
  if (isListening) {
    stopListening();
  } else {
    startListening();
  }
});
