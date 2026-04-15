import './styles/variables.css';
import './styles/reset.css';
import './styles/layout.css';
import './styles/overlays.css';
import './styles/animations.css';
import './styles/casino.css';
import { Game } from './core/Game';

// Prevent pinch zoom
document.addEventListener('touchmove', (e) => {
  if (e.touches.length >= 2) e.preventDefault();
}, { passive: false });

// Orientation lock
try {
  screen.orientation?.lock?.('portrait-primary').catch(() => {});
} catch { /* unsupported */ }

// Init game
const game = new Game();
game.init().catch(console.error);
