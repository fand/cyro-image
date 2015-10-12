import { EventEmitter } from 'events';

const ctx = new OfflineAudioContext(2, 48000 * 10, 48000);

const emitter = new EventEmitter();

const loadSample = (url) => {

  var req = new XMLHttpRequest();
  req.open('GET', url, true);
  req.responseType = 'arraybuffer';

  req.onload = () => {
    if (!req.response) {
      emitter.emit('sampleLoadFailed', new Error('no response'));
    }
    ctx.decodeAudioData(req.response, (buffer) => {
      emitter.emit('sampleLoadSucceeded', buffer);
    }, (err) => {
      emitter.emit('sampleLoadFailed', err);
    });
  };

  req.send();
};


loadSample('/wav/L.wav');

const W = 2000;
const H = 1000;

emitter.on('sampleLoadSucceeded', (buffer) => {
  const node = ctx.createBufferSource();
  node.buffer = buffer;
  node.connect(ctx.destination);
  node.start(0);

  const wave = buffer.getChannelData(0)

  const canvas = document.querySelector('#canvas');
  var c = canvas.getContext('2d');

  c.clearRect(0, 0, W, H);
  c.fillStyle = '#000000';

  const ratio = wave.length / W;
  const acc = [];
  for (let i = 0; i < W; i++) {
    acc[i] = 0;
  }

  wave.forEach((v, i) => {
    const idx = ((i / wave.length) * W) | 0;
    acc[idx] += v*v*v * 1000;
  });

  let last = -1;
  acc.forEach((v, i) => {
    let vv = Math.abs(v*10);
    vv = vv > 0.1 ? 1 : 0;
    // let vv = Math.abs(v*100000);
    // vv = last*v < 0 ? 100: 0;
    let vvv = vv > 1 ? 10000 : 0;

    c.fillRect(i, 0, 1, vv * H);

    c.fillRect((vvv * 13 + 1007 * i) % W, 0, 1, (vvv * i % 319) % H);

    last = v;
  });

});
