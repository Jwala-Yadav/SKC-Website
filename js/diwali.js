/**
 * diwali.js
 * * This script handles the "Happy Diwali" firework animation overlay.
 * It's designed to be modular. To disable this feature, simply remove the
 * script tag for this file from index.html.
 *
 * * [UPDATED on Oct 18, 2025] - Replaced the balloon animation with a rocket/cracker
 * that launches each word upwards with a spark trail, as requested.
 */

// --- DIWALI ANIMATION CORE FUNCTIONS ---

function showDiwaliOverlay() {
    const overlay = document.getElementById('diwali-overlay');
    if (overlay) {
        overlay.style.display = 'block';
        setTimeout(() => { overlay.style.opacity = 1; }, 10);
        setTimeout(() => { overlay.style.opacity = 0; }, 11000);
        setTimeout(() => { overlay.style.display = 'none'; }, 12000);
    }
    initDiwaliAnimation();
}

function initDiwaliAnimation() {
    const canvas = document.getElementById('diwali-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const opts = {
        strings: ["HAPPY", "DIWALI SKCian's"],
        charSize: 44,
        charSpacing: 62,
        lineHeight: 72,
        gravity: 0.12,
        upFlow: -0.06,
        fireworkPrevPoints: 12,
        fireworkBaseLineWidth: 6,
        fireworkAddedLineWidth: 8,
        fireworkSpawnTime: 140,
        fireworkBaseReachTime: 36,
        fireworkAddedReachTime: 40,
        fireworkCircleBaseSize: 22,
        fireworkCircleAddedSize: 14,
        fireworkCircleBaseTime: 36,
        fireworkCircleAddedTime: 26,
        fireworkCircleFadeBaseTime: 12,
        fireworkCircleFadeAddedTime: 8,
        fireworkBaseShards: 7,
        fireworkAddedShards: 8,
        fireworkShardPrevPoints: 3,
        fireworkShardBaseVel: 3.4,
        fireworkShardAddedVel: 2.6,
        fireworkShardBaseSize: 2,
        fireworkShardAddedSize: 3,
        letterContemplatingWaitTime: 260,
        // --- NEW ROCKET OPTIONS ---
        rocketSpawnTime: 20,
        rocketBaseSize: 25,
        rocketAddedSize: 20,
        rocketInitialVelY: -3,
        rocketAccelY: -0.05,
        rocketWiggle: 0.5,
        sparkCount: 3,
        sparkLife: 30,
        sparkBaseVel: 2,
        sparkAddedVel: 2,
        sparkGravity: 0.08
    };

    let DPR = Math.max(window.devicePixelRatio || 1, 1);
    let w = innerWidth, h = innerHeight, hw = w / 2, hh = h / 2;
    const Tau = Math.PI * 2;
    const letters = [];

    function setSize() {
        DPR = Math.max(window.devicePixelRatio || 1, 1);
        const cssW = Math.max(1, innerWidth), cssH = Math.max(1, innerHeight);
        canvas.style.width = cssW + 'px'; canvas.style.height = cssH + 'px';
        canvas.width = Math.round(cssW * DPR); canvas.height = Math.round(cssH * DPR);
        ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.scale(DPR, DPR);
        w = cssW; h = cssH; hw = w / 2; hh = h / 2;
        ctx.font = `${opts.charSize}px Verdana`;
    }

    // --- NEW SPARK OBJECT ---
    function Spark(x, y, color) {
        this.x = x; this.y = y; this.color = color;
        this.alive = true; this.life = Math.random() * opts.sparkLife;
        const angle = Math.random() * Tau;
        const vel = opts.sparkBaseVel + Math.random() * opts.sparkAddedVel;
        this.vx = Math.sin(angle) * vel;
        this.vy = Math.cos(angle) * vel + 2; // Bias downwards
    }
    Spark.prototype.step = function () {
        this.vy += opts.sparkGravity;
        this.x += this.vx; this.y += this.vy;
        this.life--;
        if (this.life <= 0) this.alive = false;
        ctx.fillStyle = this.color;
        ctx.globalAlpha = Math.max(0, this.life / opts.sparkLife);
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Tau);
        ctx.fill();
        ctx.globalAlpha = 1;
    };

    function Letter(char, x, y) {
        this.char = char; this.x = x; this.y = y;
        this.dx = -ctx.measureText(char).width / 2; this.dy = opts.charSize / 2;
        this.fireworkDy = this.y - hh;
        const hue = 30 + 25 * Math.min(Math.max((x + (opts.charSpacing * 8) / 2) / (opts.charSpacing * 8), 0), 1);
        this.hue = hue;
        this.color = `hsl(${hue},90%,60%)`;
        this.lightColor = (light) => `hsl(${hue},90%,${light}%)`;
        this.alphaColor = (alp) => `hsla(${hue},90%,52%,${alp})`;
        this.lightAlpha = (light, alp) => `hsla(${hue},90%,${light}%,${alp})`;
        this.reset();
    }
    Letter.prototype.reset = function () {
        this.phase = 'firework'; this.tick = 0; this.spawned = false;
        this.spawningTime = Math.floor(opts.fireworkSpawnTime * Math.random());
        this.reachTime = Math.floor(opts.fireworkBaseReachTime + opts.fireworkAddedReachTime * Math.random());
        this.lineWidth = opts.fireworkBaseLineWidth + opts.fireworkAddedLineWidth * Math.random();
        this.prevPoints = [[0, hh, 0]];
    };
    Letter.prototype.step = function () {
        if (this.phase === 'firework') {
            if (!this.spawned) {
                if (++this.tick >= this.spawningTime) { this.tick = 0; this.spawned = true; }
            } else {
                ++this.tick;
                const lp = this.tick / Math.max(1, this.reachTime), ap = Math.sin(lp * (Tau / 4));
                const x = lp * this.x, y = hh + ap * this.fireworkDy;
                if (this.prevPoints.length > opts.fireworkPrevPoints) this.prevPoints.shift();
                this.prevPoints.push([x, y, lp * this.lineWidth]);
                for (let i = 1; i < this.prevPoints.length; ++i) {
                    const p = this.prevPoints[i], p2 = this.prevPoints[i - 1];
                    ctx.strokeStyle = this.alphaColor((i / this.prevPoints.length) * 0.9);
                    ctx.lineWidth = p[2] * (1 / Math.max(1, this.prevPoints.length - 1)) * i;
                    ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(p2[0], p2[1]); ctx.stroke();
                }
                if (this.tick >= this.reachTime) {
                    this.phase = 'contemplate';
                    this.circleFinalSize = opts.fireworkCircleBaseSize + opts.fireworkCircleAddedSize * Math.random();
                    this.circleCompleteTime = Math.floor(opts.fireworkCircleBaseTime + opts.fireworkCircleAddedTime * Math.random());
                    this.circleCreating = true; this.circleFading = false;
                    this.circleFadeTime = Math.floor(opts.fireworkCircleFadeBaseTime + opts.fireworkCircleFadeAddedTime * Math.random());
                    this.tick = 0; this.tick2 = 0; this.shards = [];
                    const shardCount = Math.max(5, Math.floor(opts.fireworkBaseShards + opts.fireworkAddedShards * Math.random())), angle = (Tau / shardCount);
                    let cos = Math.cos(angle), sin = Math.sin(angle), vx = 1, vy = 0;
                    for (let i = 0; i < shardCount; ++i) {
                        const vx1 = vx; vx = vx * cos - vy * sin; vy = vx1 * sin + vy * cos;
                        this.shards.push(new Shard(this.x, this.y, vx, vy, this.alphaColor(1)));
                    }
                }
            }
        } else if (this.phase === 'contemplate') {
            ++this.tick;
            if (this.circleCreating) {
                const proportion = ++this.tick2 / Math.max(1, this.circleCompleteTime), armonic = -Math.cos(proportion * Math.PI) / 2 + 0.5;
                ctx.beginPath(); ctx.fillStyle = this.lightAlpha(40 + 60 * proportion, proportion); ctx.arc(this.x, this.y, armonic * this.circleFinalSize, 0, Tau); ctx.fill();
                if (this.tick2 > this.circleCompleteTime) { this.tick2 = 0; this.circleCreating = false; this.circleFading = true; }
            } else if (this.circleFading) {
                ctx.save(); ctx.shadowBlur = 18; ctx.shadowColor = 'rgba(255,200,110,0.9)'; ctx.fillStyle = this.lightColor(76);
                ctx.fillText(this.char, this.x + this.dx, this.y + this.dy); ctx.restore();
                const proportion = ++this.tick2 / Math.max(1, this.circleFadeTime), armonic = -Math.cos(proportion * Math.PI) / 2 + 0.5;
                ctx.beginPath(); ctx.fillStyle = this.lightAlpha(100, 1 - armonic); ctx.arc(this.x, this.y, this.circleFinalSize, 0, Tau); ctx.fill();
                if (this.tick2 >= this.circleFadeTime) this.circleFading = false;
            } else {
                ctx.save(); ctx.shadowBlur = 10; ctx.shadowColor = 'rgba(255,190,80,0.85)'; ctx.fillStyle = this.lightColor(72);
                ctx.fillText(this.char, this.x + this.dx, this.y + this.dy); ctx.restore();
            }
            this.shards.forEach((s, i) => { s.step(); if (!s.alive) this.shards.splice(i, 1); });
            if (this.tick > opts.letterContemplatingWaitTime) {
                this.phase = 'rocket'; // <-- Set phase to ROCKET
                this.tick = 0;
                this.size = opts.rocketBaseSize + opts.rocketAddedSize * Math.random();
                this.cx = this.x; this.cy = this.y;
                this.vy = opts.rocketInitialVelY; this.ay = opts.rocketAccelY;
                this.sparks = [];
            }
        } else if (this.phase === 'rocket') { // <-- ROCKET LOGIC
            ++this.tick;
            // Update rocket physics
            this.vy += this.ay;
            this.cy += this.vy;
            this.cx += Math.sin(this.tick * 0.2) * opts.rocketWiggle;

            // Draw rocket and letter
            generateRocketPath(ctx, this.cx, this.cy, this.size, this.color);
            ctx.fillStyle = this.lightColor(80);
            ctx.fillText(this.char, this.cx + this.dx, this.cy + this.dy + this.size / 2);

            // Generate and draw sparks
            for (let i = 0; i < opts.sparkCount; i++) {
                this.sparks.push(new Spark(this.cx, this.cy + this.size / 2, this.lightColor(90)));
            }
            this.sparks.forEach((s, i) => { s.step(); if (!s.alive) this.sparks.splice(i, 1); });

            // Check if off-screen
            if (this.cy + this.size < -hh - 120) {
                this.phase = 'done';
            }
        }
    };

    function Shard(x, y, vx, vy, color) {
        const vel = opts.fireworkShardBaseVel + opts.fireworkShardAddedVel * Math.random();
        this.vx = vx * vel; this.vy = vy * vel; this.x = x; this.y = y;
        this.prevPoints = [[x, y]]; this.color = color; this.alive = true;
        this.size = opts.fireworkShardBaseSize + opts.fireworkShardAddedSize * Math.random();
    }
    Shard.prototype.step = function () {
        this.x += this.vx; this.y += this.vy += opts.gravity;
        if (this.prevPoints.length > opts.fireworkShardPrevPoints) this.prevPoints.shift();
        this.prevPoints.push([this.x, this.y]);
        for (let k = 0; k < this.prevPoints.length - 1; ++k) {
            const p = this.prevPoints[k], p2 = this.prevPoints[k + 1];
            ctx.strokeStyle = this.color; ctx.lineWidth = (k + 1) * (this.size / Math.max(1, this.prevPoints.length)) * 0.6;
            ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(p2[0], p2[1]); ctx.stroke();
        }
        if (this.prevPoints[0][1] > hh + 60) this.alive = false;
    };
    
    // --- NEW ROCKET DRAWING FUNCTION ---
    function generateRocketPath(ctx, x, y, size, color) {
        const width = size / 2.5;
        const noseHeight = size * 0.35;
        const finSize = width * 0.8;

        ctx.fillStyle = color;
        ctx.beginPath();
        // Nose cone
        ctx.moveTo(x, y - size * 0.1);
        ctx.lineTo(x - width / 2, y + noseHeight);
        ctx.lineTo(x + width / 2, y + noseHeight);
        ctx.closePath();
        ctx.fill();

        // Body
        ctx.fillStyle = '#ccc';
        ctx.fillRect(x - width / 2, y + noseHeight, width, size * 0.5);

        // Fins
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x - width / 2, y + noseHeight + size * 0.3);
        ctx.lineTo(x - width / 2 - finSize, y + noseHeight + size * 0.5 + finSize);
        ctx.lineTo(x - width / 2, y + noseHeight + size * 0.5);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(x + width / 2, y + noseHeight + size * 0.3);
        ctx.lineTo(x + width / 2 + finSize, y + noseHeight + size * 0.5 + finSize);
        ctx.lineTo(x + width / 2, y + noseHeight + size * 0.5);
        ctx.closePath();
        ctx.fill();
    }

    function createLetters() {
        letters.length = 0;
        const rows = opts.strings.length;
        const blockHeight = opts.lineHeight * rows;
        for (let i = 0; i < rows; ++i) {
            const str = opts.strings[i];
            const rowWidth = opts.charSpacing * str.length;
            const y = i * opts.lineHeight + opts.lineHeight / 2 - blockHeight / 2;
            for (let j = 0; j < str.length; ++j) {
                letters.push(new Letter(str[j], -rowWidth / 2 + opts.charSpacing / 2 + j * opts.charSpacing, y));
            }
        }
    }

    function animate() {
        if (document.getElementById('diwali-overlay').style.display === 'none') return;
        window.requestAnimationFrame(animate);
        ctx.save();
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#0c0610'; ctx.fillRect(0, 0, canvas.width / DPR, canvas.height / DPR);
        const g = ctx.createRadialGradient(hw, hh, 0, hw, hh, Math.max(w, h) * 0.9);
        g.addColorStop(0, 'rgba(255,190,80,0.06)'); g.addColorStop(0.25, 'rgba(255,160,60,0.03)'); g.addColorStop(1, 'rgba(0,0,0,0.6)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, canvas.width / DPR, canvas.height / DPR); ctx.restore();
        ctx.save(); ctx.translate(hw, hh); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.font = `${opts.charSize}px Verdana`;
        let allDone = true;
        for (let i = 0; i < letters.length; ++i) {
            letters[i].step();
            if (letters[i].phase !== 'done') { allDone = false; }
        }
        ctx.restore();
        if (allDone) { setTimeout(() => letters.forEach(l => l.reset()), 400); }
    }

    // Initialization
    setSize();
    createLetters();
    animate();
    window.addEventListener('resize', () => { window.requestAnimationFrame(() => { setSize(); createLetters(); }); }, { passive: true });
}

// --- EVENT OVERLAY ACTIVATION ---
window.onload = showDiwaliOverlay;