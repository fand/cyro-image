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


loadSample('/wav/N.wav');

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
    acc[idx] += v*v*v;
  });

  let last = -1;
  acc.forEach((v, i) => {
    // let vv = Math.abs(v*100);
    // vv = vv > 1 ? 1 : 0;
    let vv = Math.abs(v*100000);
    vv = last*v < 0 ? 100: 0;
    let vvv = vv > 1 ? 10000 : 0;

    c.fillRect(i, 0, 1, vv * H);
    c.fillRect((v * 34132324224232342) % W + (2 * i) % 37, 0, 2, vvv * H);
    c.fillRect((v * 34132324224232342) % W + (74 * i * v) % 37, 0, 4, vvv * H);
    c.fillRect((v * 8 +i * 3232) % W, (((7 * vvv % i) % 37*v*i*123) % 25)+i*3 + (i*v*v*v*23333)%987, 4, (vvv * H)%87);

    // c.fillRect((367 + vv)%20 + i, (i % 47) +i * 0.7 * v + 2, 5, 40);
    c.fillRect((367 + vv)%20 + i, Math.pow(i % 47, 2) +i * 0.7 * v + 2, 5, 40);

    last = v;
  });

});
