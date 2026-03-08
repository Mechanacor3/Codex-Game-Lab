// Minimal deterministic physics and game logic for Gravity Sushi

type WeightLabel = 'light' | 'medium' | 'heavy';
type Piece = { x: number; weight: number; label: WeightLabel };

class RNG {
  private s: number;
  constructor(seed = 1) { this.s = seed >>> 0; if (this.s === 0) this.s = 1; }
  next() {
    // xorshift32
    let x = this.s;
    x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
    this.s = x >>> 0;
    return this.s / 0xFFFFFFFF;
  }
}

export class Game {
  width = 600;
  height = 400;
  plateX = 300;
  plateY = 350;
  plateWidth = 100;
  plateSpeed = 150; // px/s when controlled (will change by phase)
  pieces: Piece[] = [];
  timeRemaining = 60_000; // ms
  score = 0;
  state: 'playing' | 'game_over' = 'playing';
  lastDropSettling = 0; // ms until awarding score
  rng = new RNG(1);
  nextDropSeed = 1;
  // polish flags
  reduceMotion = false;
  highContrast = false;
  // visual tweak state for feedback
  dropTrails: { x: number; y: number; t: number }[] = [];
  plateWobble = 0; // visual wobble amount (px)
  landingSquish = 1; // visual scale factor (1 = no squish)
  // small history for anti-streak logic
  lastLabels: WeightLabel[] = [];
  phase = 0; // 0=start, 1=after20s, 2=after40s
  // deterministic animation time (ms) used by render
  animTime = 0;

  constructor() {}

  setDropSeed(seed: number) {
    this.nextDropSeed = seed >>> 0 || 1;
  }

  rngForNext() {
    this.rng = new RNG(this.nextDropSeed);
    // advance internal RNG once to mix
    this.rng.next();
  }

  // choose category with anti-streak rules
  chooseWeightLabel(): WeightLabel {
    const r = this.rng.next();
    // base probabilities: light 50%, medium 35%, heavy 15%
    let label: WeightLabel = r < 0.5 ? 'light' : (r < 0.85 ? 'medium' : 'heavy');
    // avoid 3-in-a-row heavies: if last two are heavy, force medium
    const n = this.lastLabels.length;
    if (label === 'heavy' && n >= 2 && this.lastLabels[n-1] === 'heavy' && this.lastLabels[n-2] === 'heavy') {
      label = 'medium';
    }
    return label;
  }

  labelToWeight(label: WeightLabel) {
    // heavier labels have larger numeric weight affecting COM
    return label === 'light' ? 1 : label === 'medium' ? 2 : 4;
  }

  drop() {
    if (this.state !== 'playing') return;
    this.rngForNext();
    const label = this.chooseWeightLabel();
    const weight = this.labelToWeight(label);
    this.pieces.push({ x: this.plateX, weight, label });
    // add a transient drop trail for polish
    this.dropTrails.push({ x: this.plateX, y: this.plateY - 10, t: 400 });
    this.lastDropSettling = 600; // wait 600ms to settle
    // landing feedback
    this.landingSquish = 1.15;
    this.plateWobble = Math.min(12, weight * 3);
    // update history
    this.lastLabels.push(label);
    if (this.lastLabels.length > 10) this.lastLabels.shift();
    // after using seed, bump default via simple LCG for next
    this.nextDropSeed = (this.nextDropSeed * 1664525 + 1013904223) >>> 0;
  }

  step(ms: number) {
    if (this.state !== 'playing') return;
    const stepMs = Math.max(0, ms);
    // advance deterministic animation clock
    this.animTime += stepMs;

    // decrement timer
    const prevElapsed = 60_000 - this.timeRemaining;
    this.timeRemaining -= stepMs;
    if (this.timeRemaining <= 0) {
      this.timeRemaining = 0;
      this.state = 'game_over';
      return;
    }

    // update phase based on elapsed time (20s and 40s)
    const elapsed = 60_000 - this.timeRemaining;
    const newPhase = elapsed >= 40_000 ? 2 : (elapsed >= 20_000 ? 1 : 0);
    if (newPhase !== this.phase) {
      this.phase = newPhase;
      // tune plate speed per phase (faster in later phases)
      if (this.phase === 0) this.plateSpeed = 150;
      else if (this.phase === 1) this.plateSpeed = 200;
      else this.plateSpeed = 260;
    }

    // handle settling and scoring
    if (this.lastDropSettling > 0) {
      this.lastDropSettling -= stepMs;
      if (this.lastDropSettling <= 0) {
        // check stability
        if (this.isStable()) {
          // award score based on top piece weight
          const top = this.pieces[this.pieces.length - 1];
          this.score += Math.max(1, Math.round(top.weight * 5));
          // reduce wobble over time
          this.plateWobble = Math.max(0, this.plateWobble - 6);
        } else {
          // topple
          this.state = 'game_over';
        }
      }
    } else {
      // even without settling, check for slowly-developing instability
      if (!this.isStable()) {
        this.state = 'game_over';
      }
    }

    // polish update: drop trails & squish decay
    for (let i = this.dropTrails.length - 1; i >= 0; i--) {
      this.dropTrails[i].t -= stepMs;
      // move trails downward slightly per ms to suggest motion
      this.dropTrails[i].y += (stepMs / 12);
      if (this.dropTrails[i].t <= 0) this.dropTrails.splice(i, 1);
    }
    // decay landing squish and wobble gently, faster when reduced motion is false
    const decay = this.reduceMotion ? 0.01 * stepMs : 0.02 * stepMs;
    this.landingSquish = Math.max(1, this.landingSquish - decay);
    this.plateWobble = Math.max(0, this.plateWobble - decay * 10);
  }

  // Simple center-of-mass stability check
  isStable(): boolean {
    if (this.pieces.length === 0) return true;
    const baseX = this.width / 2;
    let sumW = 0;
    let sumWx = 0;
    for (const p of this.pieces) {
      sumW += p.weight;
      sumWx += p.weight * p.x;
    }
    const com = sumWx / sumW;
    const offset = Math.abs(com - baseX);
    // support half-width: if COM goes further than 40 px, unstable
    return offset <= 40;
  }

  render_text() {
    const stability = this.isStable() ? 'stable' : 'unstable';
    const timerSec = (this.timeRemaining / 1000).toFixed(2);
    const stackHeight = this.pieces.length;
    const phase = this.phase;
    const top = this.pieces[this.pieces.length - 1];
    const topLabel = top ? top.label : 'none';
    return `${this.score},${timerSec},${stackHeight},${stability},${this.state},phase=${phase},top=${topLabel},plateSpeed=${this.plateSpeed}`;
  }

  setStateForTest(obj: Partial<{ timeRemaining: number; score: number; pieces: Piece[]; plateX: number; state: 'playing'|'game_over' }>) {
    if (typeof obj.timeRemaining === 'number') this.timeRemaining = obj.timeRemaining;
    if (typeof obj.score === 'number') this.score = obj.score;
    if (Array.isArray(obj.pieces)) this.pieces = JSON.parse(JSON.stringify(obj.pieces));
    if (typeof obj.plateX === 'number') this.plateX = obj.plateX;
    if (typeof obj.state === 'string') this.state = obj.state;
    this.lastDropSettling = 0;
    this.lastLabels = this.pieces.map(p => (p as Piece).label || 'medium');
  }

  // simple canvas render
  renderToCanvas(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, this.width, this.height);
    // background
    ctx.fillStyle = this.highContrast ? '#000' : '#071018';
    ctx.fillRect(0, 0, this.width, this.height);

    // draw base
    const baseX = this.width / 2;
    ctx.fillStyle = '#444';
    ctx.fillRect(baseX - 60, this.plateY + 20, 120, 10);

    // draw drop trails (subtle, minimal)
    for (const t of this.dropTrails) {
      ctx.globalAlpha = Math.max(0, t.t / 400) * (this.reduceMotion ? 0.6 : 0.9);
      ctx.fillStyle = this.highContrast ? '#fff' : '#ffffff';
      // soft ellipse via small arc, fast and cheap
      ctx.beginPath();
      ctx.ellipse(t.x, t.y, 6, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // draw pieces (stacked visually from bottom up)
    const pieceH = 18;
    let y = this.plateY;
    for (let i = 0; i < this.pieces.length; i++) {
      const p = this.pieces[i];
      // color by weight (respect high contrast)
      const col = p.label === 'heavy' ? (this.highContrast ? '#fff' : '#b33') : p.label === 'medium' ? (this.highContrast ? '#fff' : '#d95') : (this.highContrast ? '#fff' : '#9cf');
      ctx.fillStyle = col;
      ctx.fillRect(p.x - 30, y - pieceH, 60, pieceH - 2);
      ctx.strokeStyle = this.highContrast ? '#000' : '#000';
      ctx.strokeRect(p.x - 30, y - pieceH, 60, pieceH - 2);
      y -= pieceH;
    }

    // draw plate with wobble and landing squish; use animTime for determinism
    ctx.save();
    const wob = this.reduceMotion ? 0 : Math.sin(this.animTime / 80) * this.plateWobble;
    const squish = this.landingSquish;
    ctx.translate(this.plateX + wob - this.plateWidth/2, this.plateY);
    // limit squish for stability
    const sq = Math.max(1, Math.min(1.25, squish));
    ctx.scale(1, 1 / sq);
    ctx.fillStyle = this.highContrast ? '#fff' : '#8bc34a';
    ctx.fillRect(0, 0, this.plateWidth, 12);
    ctx.restore();

    // HUD
    ctx.fillStyle = this.highContrast ? '#fff' : '#fff';
    ctx.font = '14px monospace';
    ctx.fillText(`Score: ${this.score}`, 10, 20);
    ctx.fillText(`Time: ${(this.timeRemaining/1000).toFixed(2)}`, 10, 38);
    ctx.fillText(`State: ${this.state}`, 10, 56);
    ctx.fillText(`Phase: ${this.phase}`, 10, 74);
    ctx.fillText(`Plate: ${this.plateSpeed}`, 10, 92);
  }
}

export default Game;
