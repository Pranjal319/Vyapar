/**
 * input.js - Keyboard input manager for player movement & interactions
 * 
 * Supports WASD and Arrow Keys with normalized diagonal velocity.
 * Implements robust safety resets on window blur, visibility change, and modal focus.
 */

const KEY_MAPPINGS = {
  KeyW: 'up',
  ArrowUp: 'up',
  KeyS: 'down',
  ArrowDown: 'down',
  KeyA: 'left',
  ArrowLeft: 'left',
  KeyD: 'right',
  ArrowRight: 'right',
  KeyE: 'interact',
  // Lowercase & uppercase key fallbacks
  w: 'up',
  W: 'up',
  s: 'down',
  S: 'down',
  a: 'left',
  A: 'left',
  d: 'right',
  D: 'right',
  e: 'interact',
  E: 'interact'
};

export class InputManager {
  constructor() {
    this.keys = {
      up: false,
      down: false,
      left: false,
      right: false,
      interact: false
    };

    this.activeActions = new Set();
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);

    this.attached = false;
    this.enabled = true;
  }

  setEnabled(enabled) {
    const wasEnabled = this.enabled;
    this.enabled = Boolean(enabled);
    if (!this.enabled && wasEnabled) {
      this.reset();
    }
  }

  attach() {
    if (this.attached || typeof window === 'undefined') return;

    window.addEventListener('keydown', this.handleKeyDown, { passive: false });
    window.addEventListener('keyup', this.handleKeyUp, { passive: true });
    window.addEventListener('blur', this.handleBlur);
    window.addEventListener('focus', this.handleBlur);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    this.attached = true;
  }

  detach() {
    if (!this.attached || typeof window === 'undefined') return;

    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('blur', this.handleBlur);
    window.removeEventListener('focus', this.handleBlur);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);

    this.attached = false;
    this.reset();
  }

  reset() {
    this.activeActions.clear();
    this.keys.up = false;
    this.keys.down = false;
    this.keys.left = false;
    this.keys.right = false;
    this.keys.interact = false;
  }

  handleBlur() {
    this.reset();
  }

  handleVisibilityChange() {
    if (document.hidden) {
      this.reset();
    }
  }

  isTypingInInput(target) {
    const active = target || (typeof document !== 'undefined' ? document.activeElement : null);
    if (!active) return false;

    const tag = active.tagName ? active.tagName.toUpperCase() : '';
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || active.isContentEditable;
  }

  handleKeyDown(e) {
    // If typing inside an input/form control, ignore game input and reset keys
    if (this.isTypingInInput(e.target)) {
      this.reset();
      return;
    }

    // Prevent default browser scrolling on arrow keys and space when active
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code) ||
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      if (this.enabled) {
        e.preventDefault();
      }
    }

    const action = KEY_MAPPINGS[e.code] || KEY_MAPPINGS[e.key];
    if (action) {
      this.activeActions.add(action);
      this.syncKeyStates();
    }
  }

  handleKeyUp(e) {
    const action = KEY_MAPPINGS[e.code] || KEY_MAPPINGS[e.key];
    if (action) {
      this.activeActions.delete(action);
      this.syncKeyStates();
    }
  }

  syncKeyStates() {
    this.keys.up = this.activeActions.has('up');
    this.keys.down = this.activeActions.has('down');
    this.keys.left = this.activeActions.has('left');
    this.keys.right = this.activeActions.has('right');
    this.keys.interact = this.activeActions.has('interact');
  }

  /**
   * Returns normalized movement vector [dx, dy] and primary facing direction
   */
  getMovementVector() {
    if (!this.enabled) {
      return { dx: 0, dy: 0, isMoving: false, direction: null };
    }

    let dx = 0;
    let dy = 0;

    if (this.keys.left) dx -= 1;
    if (this.keys.right) dx += 1;
    if (this.keys.up) dy -= 1;
    if (this.keys.down) dy += 1;

    // Normalize diagonal movement so speed is identical in all directions
    if (dx !== 0 && dy !== 0) {
      const length = Math.SQRT2;
      dx /= length;
      dy /= length;
    }

    // Determine facing direction (order of priority: up, down, left, right)
    let direction = null;
    if (this.keys.up) direction = 'up';
    else if (this.keys.down) direction = 'down';
    else if (this.keys.left) direction = 'left';
    else if (this.keys.right) direction = 'right';

    return {
      dx,
      dy,
      isMoving: dx !== 0 || dy !== 0,
      direction
    };
  }
}
