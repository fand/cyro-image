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


loadSample('/wav/D.wav');

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
    c.fillRect(i, (i*v << 2 *W% 139)%W, (vvv*10%4), (vvv * i * 319)%H);
    c.fillRect((i<<19)%34, (i*v << 2 *W% 139)%W, (vvv*31%4), (vvv * i * 319)%H);
    c.fillRect((i<<3)*i*i%W, 21 + (i *332%37), 1, (vvv * H*3)%103);
    c.fillRect((21 + i<<7)*i%W, 91 + (i *39232)%19, 1, (vvv * H*3)%103);
    c.fillRect((i<<7 % 31) * vvv%W + (v * 189930) % W, 77 + (i *794 % 72), 1, (vvv * H*3)%103);
    c.fillRect((i<<3 + 48)*i*i%W, 122 + (i *332%67), 1, (vvv * H*3)%103);
    c.fillRect((i<<17 + 1391)*i*i%W, 147 + (i *332%67), 1, (vvv * H*3)%103);
    c.fillRect((21 + i<<7)*i%W, 194 + ((i* 12 + 37) *39232)%51, 1, (vvv * H*3)%103);

    last = v;
  });

});
