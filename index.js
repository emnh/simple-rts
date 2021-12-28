// Import stylesheets
import './style.css';

const PIXI = require('pixi.js');

const w = 600;
const h = 600;

const app = new PIXI.Application({ antialias: true, width: w, height: h });
document.body.appendChild(app.view);

let units = [];

const euclid = function (a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
};

const createBase = function (x, y, color) {
  const base = new PIXI.Graphics();
  base.beginFill(color);
  base.drawRect(0, 0, 50, 50);
  base.endFill();
  base.x = x;
  base.y = y;
  app.stage.addChild(base);
  return base;
};

const createFighter = function (base, color) {
  const fighter = new PIXI.Graphics();
  fighter.lineStyle(2, 0xfeeb77, 1);
  fighter.beginFill(color, 1);
  fighter.drawCircle(0, 0, 10);
  fighter.endFill();

  const hbar = new PIXI.Graphics();
  hbar.lineStyle(2, 0x00ff00, 1);
  hbar.beginFill(color, 1);
  hbar.drawRect(-10, -15, 20, 2);
  hbar.endFill();
  fighter.addChild(hbar);

  fighter.x = base.x + 0.5 * base.width;
  fighter.y = base.y + 0.5 * base.height;
  app.stage.addChild(fighter);

  let vx = 0;
  let vy = 0;

  const speed = 0.5;

  const shoot = function (color, source, target) {
    const shot = new PIXI.Graphics();
    shot.lineStyle(0);
    shot.beginFill(color, 1);
    shot.drawCircle(0, 0, 3);
    shot.endFill();
    shot.x = source.graphics.x;
    shot.y = source.graphics.y;
    app.stage.addChild(shot);

    const lifetime = 1000;
    const startTime = new Date().getTime();
    const expireTime = startTime + lifetime;

    const shotUnit = {
      team: color,
      graphics: shot,
      deleted: false,
      type: 'shot',
    };

    const startx = shot.x;
    const starty = shot.y;
    //const endx = target.graphics.x;
    //const endy = target.graphics.y;

    const shotUpdate = function (delta) {
      const ctime = new Date().getTime();
      const elapsed = ctime - startTime;
      shot.x = startx + ((target.graphics.x - startx) * elapsed) / lifetime;
      shot.y = starty + ((target.graphics.y - starty) * elapsed) / lifetime;

      if (ctime >= expireTime) {
        app.stage.removeChild(shot);
        shotUnit.deleted = true;
        target.hbar.width -= 4;
        target.hbar.x -= 2;
        if (target.hbar.width <= 0) {
          app.stage.removeChild(target.graphics);
          target.deleted = true;
        }
      }
    };

    shotUnit.update = shotUpdate;

    units.push(shotUnit);
  };

  let lastShot = new Date().getTime();

  const fighterUnit = {
    team: color,
    graphics: fighter,
    deleted: false,
    type: 'fighter',
    hbar: hbar,
  };

  const fighterUpdate = function (delta) {
    vx += speed * (Math.random() - 0.5);
    vy += speed * (Math.random() - 0.5);
    vx *= 0.99;
    vy *= 0.99;
    if (fighter.x + vx <= 0) {
      vx = -vx;
    }
    if (fighter.x + vx >= w) {
      vx = -vx;
    }
    if (fighter.y + vy <= 0) {
      vy = -vy;
    }
    if (fighter.y + vy >= h) {
      vy = -vy;
    }
    fighter.x += vx;
    fighter.y += vy;

    const ctime = new Date().getTime();
    const elapsed = ctime - lastShot;
    if (elapsed >= 1000) {
      for (let i = 0; i < units.length; i++) {
        const unit = units[i];
        if (
          unit.team != color &&
          unit.type == 'fighter' &&
          euclid(fighter, unit.graphics) <= 200
        ) {
          lastShot = ctime;
          shoot(color, fighterUnit, unit);
          break;
        }
      }
    }
  };

  fighterUnit.update = fighterUpdate;

  units.push(fighterUnit);
};

const base1 = createBase(50, 50, 0xff0000);
const base2 = createBase(w - 100, h - 100, 0x0000ff);
for (let i = 0; i < 10; i++) {
  createFighter(base1, 0xff0000);
  createFighter(base2, 0x0000ff);
}

app.ticker.add((delta) => {
  for (let i = 0; i < units.length; i++) {
    units[i].update(delta);
  }
  units = units.filter((x) => !x.deleted);
});
