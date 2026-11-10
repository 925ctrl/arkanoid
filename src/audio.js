export const MUTE_KEY = 'arkanoid:muted'; // '1' (silenciado) o '0'

const SOUND_FILES = {
  bounce: 'assets/sounds/ball-bounce.mp3',
  break: 'assets/sounds/break-sound.mp3',
};

function readMuted() {
  try {
    return localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
}

function writeMuted(muted) {
  try {
    localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
  } catch {
    // sin localStorage el silencio solo vive en memoria
  }
}

export function createAudio() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const ctx = AudioCtx ? new AudioCtx() : null;
  const buffers = {};

  if (ctx) {
    // cada MP3 se decodifica una sola vez; reproducir solo crea una fuente barata
    for (const [name, src] of Object.entries(SOUND_FILES)) {
      fetch(src)
        .then((res) => res.arrayBuffer())
        .then((data) => ctx.decodeAudioData(data))
        .then((buffer) => { buffers[name] = buffer; })
        .catch(() => {}); // sin buffer, ese sonido simplemente no suena
    }

    // la política de autoplay exige un gesto del usuario para activar el contexto
    const unlock = () => { ctx.resume().catch(() => {}); };
    window.addEventListener('keydown', unlock);
    window.addEventListener('pointerdown', unlock);
  }

  return {
    muted: readMuted(),

    play(name) {
      if (this.muted || !ctx || ctx.state !== 'running' || !buffers[name]) return;
      try {
        const source = ctx.createBufferSource();
        source.buffer = buffers[name];
        source.connect(ctx.destination);
        source.start();
      } catch {
        // el audio nunca debe romper el juego
      }
    },

    toggleMute() {
      this.muted = !this.muted;
      writeMuted(this.muted);
    },
  };
}
