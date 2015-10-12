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


loadSample('/wav/F.wav');

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
    acc[idx] += v* v*v;
  });

  let last = -1;
  acc.forEach((v, i) => {
    // let vv = Math.abs(v*100);
    // vv = vv > 1.5 ? 1 : 0;
    let vv = Math.abs(v*100);
    vv = last*v < 0 ? 10000: 0;
    let vvv = vv > 10 ? 100 : 0;
    c.fillRect(i, (i*v << 2 *W% 139)%W, 1, (vvv * i * 319)%H);
    c.fillRect((i *171)%W, ((i*vvv << 21 *W)% 42)%H+270, 0.3, (vvv * i * 319)%H);
    c.fillRect((i *371)%W, ((vvv*i*i*i << 37 *W)% 67)%H+630, 0.3, (vvv * i * 319)%H);
    last = v;
  });

});
