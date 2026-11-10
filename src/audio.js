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
  const clips = {};
  for (const [name, src] of Object.entries(SOUND_FILES)) {
    clips[name] = new Audio(src);
    clips[name].preload = 'auto';
  }

  return {
    muted: readMuted(),

    play(name) {
      if (this.muted || !clips[name]) return;
      // un clon por reproducción permite solapar sonidos
      try {
        clips[name].cloneNode().play().catch(() => {});
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
