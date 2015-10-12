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


loadSample('/wav/B.wav');

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
    acc[idx] += v*v*v*v;
  });

  acc.forEach((v, i) => {
    // let vv = Math.abs(v*100);
    // vv = vv > 1.5 ? 1 : 0;
    let vv = Math.abs(v*1000);
    let vvv = vv > 0.3 ? 0 : 100;
    c.fillRect(i, (i*331)%H, 10, (vvv * H*3)%1032);
    vvv = vv > 10 ? 1 : 0;
    c.fillRect((i *739)%W, i*10, (v * W), 3);
    c.fillRect((i *739)%W, i*10+10, (v * W), 2);
    c.fillRect((i *739)%W, i*10+7, (v * W), 1);
  });

});
