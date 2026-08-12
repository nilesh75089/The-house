/**
 * THE HOUSE — Procedural Pixel-Art Atmosphere Engine
 * Generates twinkling pixel stars, drifting pixel clouds, flickering lantern embers,
 * and subtle pixel raindrops/dust motes tailored to each room.
 */

class PixelAtmosphere {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.currentRoom = 'hall';
    this.particles = [];
    this.clouds = [];
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.pixelScale = 2; // Pixel art block size

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.initClouds();
    this.spawnParticles();
    this.loop();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = Math.floor(this.width / this.pixelScale);
    this.canvas.height = Math.floor(this.height / this.pixelScale);
    this.ctx.imageSmoothingEnabled = false;
  }

  setRoom(roomId) {
    this.currentRoom = roomId;
    this.spawnParticles();
  }

  initClouds() {
    this.clouds = [];
    for (let i = 0; i < 4; i++) {
      this.clouds.push({
        x: Math.random() * (this.width / this.pixelScale),
        y: Math.random() * 80 + 10,
        w: Math.random() * 60 + 40,
        h: Math.random() * 12 + 6,
        speed: Math.random() * 0.04 + 0.02,
        alpha: Math.random() * 0.12 + 0.05
      });
    }
  }

  spawnParticles() {
    this.particles = [];
    const cw = this.canvas.width;
    const ch = this.canvas.height;

    switch (this.currentRoom) {
      case 'hall':
        // Twinkling pixel stars + flickering amber lantern embers
        for (let i = 0; i < 45; i++) {
          this.particles.push({
            type: 'star',
            x: Math.floor(Math.random() * cw),
            y: Math.floor(Math.random() * (ch * 0.6)),
            size: Math.random() > 0.8 ? 2 : 1,
            phase: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.03 + 0.01,
            color: '246, 185, 59'
          });
        }
        for (let i = 0; i < 15; i++) {
          this.particles.push({
            type: 'ember',
            x: Math.floor(Math.random() * cw),
            y: Math.floor(ch * 0.5 + Math.random() * (ch * 0.5)),
            size: 1,
            vx: (Math.random() - 0.5) * 0.1,
            vy: -Math.random() * 0.15 - 0.05,
            alpha: Math.random() * 0.6 + 0.2,
            color: '250, 211, 144'
          });
        }
        break;

      case 'room1':
        // Pixel rain outside window + soft moonbeam dust
        for (let i = 0; i < 35; i++) {
          this.particles.push({
            type: 'rain',
            x: Math.floor(Math.random() * cw),
            y: Math.floor(Math.random() * ch),
            length: Math.floor(Math.random() * 4 + 2),
            vy: Math.random() * 1.5 + 1.2,
            alpha: Math.random() * 0.35 + 0.15,
            color: '130, 204, 221'
          });
        }
        break;

      case 'room2':
        // Projector light beam pixel dust particles
        for (let i = 0; i < 40; i++) {
          this.particles.push({
            type: 'dust',
            x: Math.floor(cw * 0.25 + Math.random() * (cw * 0.5)),
            y: Math.floor(Math.random() * ch),
            size: Math.random() > 0.7 ? 2 : 1,
            vx: (Math.random() - 0.5) * 0.15,
            vy: (Math.random() - 0.5) * 0.15,
            alpha: Math.random() * 0.5 + 0.15,
            color: '245, 240, 225'
          });
        }
        break;

      case 'room3':
        // City light shimmers + gentle window rain
        for (let i = 0; i < 30; i++) {
          this.particles.push({
            type: 'rain',
            x: Math.floor(Math.random() * cw),
            y: Math.floor(Math.random() * ch),
            length: Math.floor(Math.random() * 3 + 2),
            vy: Math.random() * 1.2 + 0.8,
            alpha: Math.random() * 0.3 + 0.1,
            color: '96, 163, 188'
          });
        }
        break;

      case 'room4':
        // Celestial surreal stars + drifting purple mist
        for (let i = 0; i < 50; i++) {
          this.particles.push({
            type: 'star',
            x: Math.floor(Math.random() * cw),
            y: Math.floor(Math.random() * (ch * 0.7)),
            size: Math.random() > 0.8 ? 2 : 1,
            phase: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.04 + 0.015,
            color: '168, 197, 219'
          });
        }
        break;

      case 'room5':
        // Warm desk lamp motes
        for (let i = 0; i < 25; i++) {
          this.particles.push({
            type: 'dust',
            x: Math.floor(cw * 0.2 + Math.random() * (cw * 0.6)),
            y: Math.floor(Math.random() * ch),
            size: 1,
            vx: (Math.random() - 0.5) * 0.08,
            vy: -Math.random() * 0.1 - 0.02,
            alpha: Math.random() * 0.45 + 0.15,
            color: '246, 185, 59'
          });
        }
        break;
    }
  }

  loop() {
    const cw = this.canvas.width;
    const ch = this.canvas.height;
    this.ctx.clearRect(0, 0, cw, ch);

    // 1. Draw drifting 8-bit clouds (in Hall and Room 4)
    if (this.currentRoom === 'hall' || this.currentRoom === 'room4') {
      this.ctx.fillStyle = 'rgba(180, 190, 220, 0.08)';
      for (let c of this.clouds) {
        c.x += c.speed;
        if (c.x > cw) c.x = -c.w;
        this.ctx.fillRect(Math.floor(c.x), Math.floor(c.y), Math.floor(c.w), Math.floor(c.h));
      }
    }

    // 2. Draw room particles with crisp pixel rects
    for (let p of this.particles) {
      if (p.type === 'star') {
        p.phase += p.speed;
        const alpha = Math.abs(Math.sin(p.phase)) * 0.6 + 0.2;
        this.ctx.fillStyle = `rgba(${p.color}, ${alpha})`;
        this.ctx.fillRect(p.x, p.y, p.size, p.size);
      } else if (p.type === 'rain') {
        p.y += p.vy;
        if (p.y > ch) {
          p.y = -p.length;
          p.x = Math.floor(Math.random() * cw);
        }
        this.ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
        this.ctx.fillRect(Math.floor(p.x), Math.floor(p.y), 1, p.length);
      } else if (p.type === 'dust' || p.type === 'ember') {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = cw;
        if (p.x > cw) p.x = 0;
        if (p.y < 0) p.y = ch;
        if (p.y > ch) p.y = 0;
        this.ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
        this.ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size || 1, p.size || 1);
      }
    }

    requestAnimationFrame(() => this.loop());
  }
}

export const ambient = new PixelAtmosphere('ambient-canvas');
