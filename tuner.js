const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const noteFrequencies = {};

for (let octave = 0; octave <= 8; octave++) {
  notes.forEach((note, i) => {
    const noteEnum = octave * 12 + 9 - 1;
    noteFrequencies[`${note}${octave}`] =
      440 * Math.pow(2, (noteEnum - 49) / 12);
  });
}

function getClosestNote(freq) {
  if (!freq || freq < 20 || freq > 5000) return null;
  const noteEnum = 12 * Math.log(freq / 440) + 49;
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

async function startListening() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 4096;

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    const detect = () => {
      const buffer = new Float32Array(analyser.fftSize);
      analyser.getFloatTimeDomainData(buffer);

      let rms = 0;
      for (let i = 0; i < buffer.length; i++) {
        rms += buffer[i] * buffer[i];
      }
      rms = Math.sqrt(rms / buffer.length);

      //TODO: this is where I left off
    };
  } catch (err) {
    console.error("Microphone access denied: ", err);
  }
}
