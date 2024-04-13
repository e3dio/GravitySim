const numBodies = 1000;
const minDistance = 5;
const mass = 10;
const G = 1;
let dt = .01;

const start = () => {
   console.clear();
   let frames = 0;
   const startTS = Date.now();
   const width = process.stdout.columns;
   const height = process.stdout.rows;
   const bodies = Array.from({ length: numBodies }, () => ({
      mass,
      velocityX: 0,
      velocityY: 0,
      positionX: Math.random() * width,
      positionY: Math.random() * height,
   }));
   const rows = Array.from({ length: height }, () => new Uint8Array(width));
   const update = () => {
      for (const body of bodies) {
         let totalForceX = 0;
         let totalForceY = 0;
         for (const body2 of bodies) {
            if (body !== body2) {
               const dx = body2.positionX - body.positionX;
               const dy = body2.positionY - body.positionY;
               const distanceSq = Math.max(minDistance, dx * dx + dy * dy);
               const distance = Math.sqrt(distanceSq);
               const force = G * body.mass * body2.mass / distanceSq;
               totalForceX += force * dx / distance;
               totalForceY += force * dy / distance;
            }
         }
         body.velocityX += totalForceX / body.mass * dt;
         body.velocityY += totalForceY / body.mass * dt;
         body.positionX += body.velocityX * dt;
         body.positionY += body.velocityY * dt;
         if (body.positionY > 0 && body.positionY < height && body.positionX > 0 && body.positionX < width) rows[Math.floor(body.positionY)][Math.floor(body.positionX)] += 1;
      }
      rows.forEach((uint, i) => {
         uint.forEach((x, i) => uint[i] = strMap[x] || strMap.at(-1));
         if (!i) uint.set(encoder.encode(`${Math.floor(++frames / (Date.now() - startTS) * 1000)} fps`));
         process.stdout.cursorTo(0, i);
         process.stdout.write(uint);
         uint.fill(0);
      });
      setImmediate(restart ? start : update);
   };
   let restart;
   process.stdout.on('resize', () => restart = true);
   update();
};

const encoder = new TextEncoder();
const strMap = [ ' ', '.', 'o', 'O', 'X', 'W' ].map(a => a.charCodeAt(0));
process.stdout.write('\x1B[?25l'); // hide cursor
start();
