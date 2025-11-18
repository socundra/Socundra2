// ==================== CONFIG =====================
const PER_SIDE = 52;
const TOTAL = PER_SIDE * 4 - 4;

const supabaseUrl = "https://lqmcfvgztlrtebzkgcxz.supabase.co";
const supabaseAnon = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxbWNmdmd6dGxydGViemtnY3h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyNTQ0MDYsImV4cCI6MjA3ODgzMDQwNn0.4hht7HFmOI794MwjS-aySAQ-MH9groUt1JXjXl-oMhA";
const supabaseClient = supabase.createClient(supabaseUrl, supabaseAnon);

// ==================== ZOOM =====================
let scale = 0.4;
const wrap = document.getElementById('wrap');
const area = document.getElementById('area');

wrap.addEventListener('wheel', e => {
  e.preventDefault();
  const f = e.deltaY < 0 ? 1.06 : 0.94;
  scale = Math.min(2.4, Math.max(0.2, scale * f));
  area.style.transform = `scale(${scale})`;
}, { passive: false });

// ==================== PERÍMETRO =====================
let perimeter = [];

function buildPerimeter() {
  const N = PER_SIDE;
  perimeter = [];

  for (let c = N; c >= 1; c--) perimeter.push({ r: N, c });
  for (let r = N - 1; r >= 1; r--) perimeter.push({ r, c: 1 });
  for (let c = 2; c <= N; c++) perimeter.push({ r: 1, c });
  for (let r = 2; r <= N - 1; r++) perimeter.push({ r, c: N });
}
buildPerimeter();

function isPerimeter(r, c) {
  return r === 1 || r === PER_SIDE || c === 1 || c === PER_SIDE;
}

function isCorner(r, c) {
  return (r === 1 && c === 1) ||
         (r === 1 && c === PER_SIDE) ||
         (r === PER_SIDE && c === 1) ||
         (r === PER_SIDE && c === PER_SIDE);
}

const mid = Math.ceil(PER_SIDE / 2);
function isChance(r, c) {
  return (r === 1 && c === mid) ||
         (r === PER_SIDE && c === mid) ||
         (c === 1 && r === mid) ||
         (c === PER_SIDE && r === mid);
}

function coordToIndex(r, c) {
  const idx = perimeter.findIndex(p => p.r === r && p.c === c);
  return idx >= 0 ? idx + 1 : null;
}

// ==================== RENDER =====================
const grid = document.getElementById("grid");

function render() {
  grid.innerHTML = "";

  for (let r = 1; r <= PER_SIDE; r++) {
    for (let c = 1; c <= PER_SIDE; c++) {
      const div = document.createElement("div");

      if (!isPerimeter(r, c)) {
        div.className = "placeholder";
        grid.appendChild(div);
        continue;
      }

      const id = coordToIndex(r, c);
      div.className = "cell";
      div.dataset.id = id;

      if (isCorner(r, c)) {
        div.classList.add("corner");
        div.innerHTML = "";
      } else if (isChance(r, c)) {
        div.classList.add("chance");
        div.innerHTML = "?";
      } else {
        div.innerHTML = `<div>${id}</div><div class="precio" id="p${id}">...</div>`;
      }

      grid.appendChild(div);
    }
  }
}
render();

// ==================== SUPABASE =====================
async function loadPrices() {
  const { data, error } = await supabaseClient
    .from("casillas")
    .select("id, precio_actual");

  if (error) return console.error(error);

  data.forEach(row => {
    const el = document.getElementById("p" + row.id);
    if (el) el.textContent = row.precio_actual + "€";
  });
}
loadPrices();

// ==================== MINI TABLERO =====================
const mini = document.getElementById("miniWrap");
mini.innerHTML = "";
for (let i = 1; i <= 25; i++) {
  const d = document.createElement("div");
  d.className = "mini-cell";
  d.textContent = i;
  mini.appendChild(d);
}

// ==================== ADMIN SALDO =====================
function setAdminSaldo() {
  const val = parseFloat(document.getElementById("admin-saldo").value);
  if (!isNaN(val)) {
    localStorage.setItem("saldo", val);
    alert("Saldo de administrador aplicado: " + val + "€");
  }
// ==================== JUGADOR =====================
let jugador = {
  posicion: 1,
  saldo: parseFloat(localStorage.getItem("saldo")) || 0,
  inventario: []
};
function dibujarJugador() {
  // Quitar jugador previo
  document.querySelectorAll(".player").forEach(p => p.remove());

  const cell = document.querySelector(`.cell[data-id='${jugador.posicion}']`);
  if (!cell) return;

  const dot = document.createElement("div");
  dot.className = "player";
  dot.style.width = "14px";
  dot.style.height = "14px";
  dot.style.borderRadius = "50%";
  dot.style.background = "cyan";
  dot.style.position = "absolute";

  // posicionarlo centrado en la casilla
  cell.style.position = "relative";
  dot.style.top = "22px";
  dot.style.left = "22px";

  cell.appendChild(dot);
}
dibujarJugador();
function tirarDados() {
  const d1 = Math.floor(Math.random() * 6) + 1;
  const d2 = Math.floor(Math.random() * 6) + 1;
  const total = d1 + d2;

  document.getElementById("resultado-dados").textContent =
    `Resultado: ${d1} + ${d2} = ${total}`;

  moverJugador(total);
}
function moverJugador(pasos) {
  jugador.posicion += pasos;

  if (jugador.posicion > TOTAL) {
    jugador.posicion -= TOTAL;
  }

  dibujarJugador();
}

}
