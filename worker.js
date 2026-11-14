let timerId = null;
let interval = 100;

self.onmessage = function (e) {
  if (e.data === 'start') {
    console.log('starting worker');
    timerId = this.setInterval(() => { this.postMessage('tick'); }, interval)
  }
  else if (e.data.interval) {
    interval = e.data.interval
    if (timerId) {
      this.clearInterval(timerId);
      timerId = this.setInterval(() => { this.postMessage('tick'); }, interval)
    }
  }
  else if (e.data === 'stop') {
    console.log('stopping');
    this.clearInterval(timerId)
    timerId = null
  }
}
