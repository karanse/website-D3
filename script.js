// ==========================================
// 1. CANVAS SETUP — Interactive dot background
// ==========================================
const canvas = document.getElementById("bg-canvas");
const ctx = canvas.getContext("2d");

// Color palette (HSL strings without the hsl wrapper)
const PALETTE = [
  "12, 60%, 48%",   // terracotta
  "200, 65%, 52%",  // mediterranean blue
  "45, 75%, 58%",   // sand/gold
  "90, 25%, 42%",   // olive
  "350, 45%, 65%",  // tile pink
];

let dots = [];           // array to hold all dot objects
let mouseX = -1000;      // mouse X (starts offscreen)
let mouseY = -1000;      // mouse Y (starts offscreen)

// ==========================================
// 2. RESIZE — Make canvas fill the full page
// ==========================================
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = document.documentElement.scrollHeight;
  initDots(); // re-create dots when size changes
}

// ==========================================
// 3. INIT DOTS — Create a grid of dot objects
// ==========================================
function initDots() {
  dots = [];
  const spacing = 48; // pixels between each dot
  const cols = Math.ceil(canvas.width / spacing);
  const rows = Math.ceil(canvas.height / spacing);

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      dots.push({
        x: i * spacing + spacing / 2,       // current X position
        y: j * spacing + spacing / 2,       // current Y position
        baseX: i * spacing + spacing / 2,   // "home" X position
        baseY: j * spacing + spacing / 2,   // "home" Y position
        size: 1.8,                           // current radius
        opacity: 0.15,                       // current opacity
        color: PALETTE[(i * 3 + j * 7) % PALETTE.length], // pick a color
      });
    }
  }
}

// ==========================================
// 4. ANIMATE — The main rendering loop
// ==========================================
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // wipe the canvas

  const scroll = window.scrollY;
  const mx = mouseX;                  // mouse X (viewport)
  const my = mouseY + scroll;         // mouse Y (adjusted for scroll)

  for (let i = 0; i < dots.length; i++) {
    const dot = dots[i];

    // Distance from mouse to this dot's home position
    const dx = mx - dot.baseX;
    const dy = my - dot.baseY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxDist = 160; // radius of influence

    if (dist < maxDist) {
      // --- REPULSION: push dot away from mouse ---
      const force = (maxDist - dist) / maxDist;    // 0 at edge, 1 at center
      const angle = Math.atan2(dy, dx);             // direction from dot to mouse
      dot.x = dot.baseX - Math.cos(angle) * force * 28;
      dot.y = dot.baseY - Math.sin(angle) * force * 28;
      dot.size = 1.8 + force * 4;      // grow near mouse
      dot.opacity = 0.15 + force * 0.55; // brighten near mouse
    } else {
      // --- IDLE: gentle wave + ease back home ---
      const waveOffset = Math.sin((dot.baseY - scroll) * 0.004 + scroll * 0.008) * 5;
      dot.x += (dot.baseX + waveOffset - dot.x) * 0.08;
      dot.y += (dot.baseY - dot.y) * 0.08;
      dot.size += (1.8 - dot.size) * 0.08;
      dot.opacity += (0.15 - dot.opacity) * 0.08;
    }

    // Draw the dot
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${dot.color}, ${dot.opacity})`;
    ctx.fill();
  }

  requestAnimationFrame(animate); // loop at ~60fps
}

// ==========================================
// 5. EVENT LISTENERS
// ==========================================
window.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

window.addEventListener("resize", resizeCanvas);

// ==========================================
// 6. SCROLL REVEAL — Fade in sections
// ==========================================
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll(".fade-in").forEach((el) => observer.observe(el));

// ==========================================
// 7. START EVERYTHING
// ==========================================
resizeCanvas();
animate();
