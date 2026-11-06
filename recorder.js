const recordButton = document.getElementById('startRecordButton');
const stopButton = document.getElementById('stopRecordButton');
const soundClips = document.querySelector('.soundClips');
const canvas = document.querySelector('.visualiser');
const mainSection = document.querySelector('.recorderControls');
const micOffButton = document.getElementById('micOff')

stopButton.disabled = true

let audioCtx;
const canvasCtx = canvas.getContext('2d')

if (navigator.mediaDevices.getUserMedia) {
  console.log("The mediaDevices.getUserMedia() method is supported.");

  const constraints = { audio: true };
  let chunks = [];

  let onSuccess = function (stream) {
    const mediaRecorder = new MediaRecorder(stream);

    visualize(stream)

    recordButton.onclick = function () {
      mediaRecorder.start();
      recordButton.style.background = 'red'

      stopButton.disabled = false;
      recordButton.disabled = true
    }

    stopButton.onclick = function () {
      console.log('stopButtonClicked')
      mediaRecorder.stop();
      recordButton.style.background = '';
      recordButton.disabled = false;
    }

    micOffButton.onclick = function () {
      const audioTracks = stream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled
      })
      if (audioTracks[0].enabled) {
              micOffButton.textContent = "Mute Mic";
        recordButton.disabled = false;
            } else {
              micOffButton.textContent = "Unmute Mic";
        recordButton.disabled = true;
            }
    }

    mediaRecorder.onstop = function (e) {
      const clipName = prompt("Enter a name for this clip?", "Unnamed clip")

      const clipContainer = document.createElement('article');
      const clipLabel = document.createElement('p');
      const audio = document.createElement('audio')
      const deleteButton = document.createElement('button')

      clipContainer.classList.add('clip');
      audio.setAttribute('controls', '');
      deleteButton.textContent = 'Delete'
      deleteButton.className = 'delete'

      if (clipName === null) {
        clipLabel.textContent = 'My unnamed clip'
      } else {
        clipLabel.textContent = clipName
      }

      clipContainer.appendChild(audio);
      clipContainer.appendChild(clipLabel)
      clipContainer.appendChild(deleteButton);
      soundClips.appendChild(clipContainer)

      audio.controls = true;
      const blob = new Blob(chunks, { type: mediaRecorder.mimeType })
      chunks = [];
      const audioUrl = window.URL.createObjectURL(blob);
      audio.src = audioUrl;

      deleteButton.onclick = function (e) {
        e.target.closest(".clip").remove()
      }

      clipLabel.onclick = function () {
        const existingName = clipLabel.textContent;
        const newClipName = prompt('Enter a new name for your clip')
        if (newClipName === null) {
          clipLabel.textContent = existingName;
        } else clipLabel.textContent = newClipName;
      };
    };
    mediaRecorder.ondataavailable = function (e) {
      chunks.push(e.data)
    }
  };
  let onError = function (err) {
      console.log("The following error occured: " + err);
    };

    navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
} else {
  console.log('"MediaDevices.getUserMedia() not supported on your browser!"')
}

function visualize(stream) {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  const source = audioCtx.createMediaStreamSource(stream);

  const bufferLength = 2048;
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = bufferLength;
  const dataArray = new Uint8Array(bufferLength);

  source.connect(analyser)

  draw();

  function draw() {
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    requestAnimationFrame(draw);

    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.fillStyle = "rgb(200, 200, 200)";
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = "rgb(0, 0, 0)";

    canvasCtx.beginPath();

    let sliceWidth = (WIDTH * 1.0) / bufferLength;
     let x = 0;

     for (let i = 0; i < bufferLength; i++) {
       let v = dataArray[i] / 128.0;
       let y = (v * HEIGHT) / 2;

       if (i === 0) {
         canvasCtx.moveTo(x, y);
       } else {
         canvasCtx.lineTo(x, y);
       }

       x += sliceWidth;
     }
    canvasCtx.lineTo(canvas.width, canvas.height / 2);
    canvasCtx.stroke();

  }

}

window.onresize = function () {
  canvas.width = mainSection.offsetWidth;
};

window.onresize();
