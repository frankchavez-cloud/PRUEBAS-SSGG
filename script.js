// ===================================================
// DASHBOARD EVENTOS CAMPUS VILLA V3.0
// Estructura Excel:
// Fecha | Hora | Área Solicitante | N° OT | Evento / Actividad | Requerimientos | Prioridad | Categoría | Estado
// ===================================================

const PASSWORD = "villa2026";

// Datos de ejemplo. Luego se puede reemplazar por CSV/JSON desde OneDrive.
const eventosBase = [
  {
    fecha: "2026-05-29",
    hora: "08:00",
    area: "Seguridad",
    ot: "OT-00125",
    evento: "Simulacro Multipeligro",
    requerimientos: "Coordinación con brigadas, rutas de evacuación, comunicación previa, puntos de reunión y control de participación.",
    prioridad: "Alta",
    categoria: "Institucional",
    estado: "Ejecutado"
  },
  {
    fecha: "2026-05-29",
    hora: "10:00",
    area: "Marketing",
    ot: "OT-00126",
    evento: "Grabación institucional",
    requerimientos: "Reserva de ambiente, control de ingreso, coordinación de participantes, apoyo para ordenamiento y validación del horario.",
    prioridad: "Media",
    categoria: "Institucional",
    estado: "Programado"
  },
  {
    fecha: "2026-05-29",
    hora: "14:00",
    area: "Académico",
    ot: "OT-00127",
    evento: "Reunión de coordinación",
    requerimientos: "Centralizar observaciones, confirmar asistencia, preparar sala y registrar acuerdos principales.",
    prioridad: "Baja",
    categoria: "Reunión",
    estado: "Pendiente"
  },
  {
    fecha: "2026-05-30",
    hora: "09:30",
    area: "Admisión",
    ot: "OT-00128",
    evento: "Charla informativa",
    requerimientos: "Validación de aforo, ordenamiento de ingreso y coordinación con el área solicitante.",
    prioridad: "Media",
    categoria: "Académico",
    estado: "Programado"
  },
  {
    fecha: "2026-06-01",
    hora: "11:00",
    area: "TI",
    ot: "OT-00129",
    evento: "Validación de conectividad",
    requerimientos: "Confirmar operatividad de red y soporte a la actividad programada.",
    prioridad: "Alta",
    categoria: "Operativo",
    estado: "Pendiente"
  },
  {
    fecha: "2026-06-05",
    hora: "16:00",
    area: "Simulación",
    ot: "OT-00130",
    evento: "Evaluación práctica",
    requerimientos: "Confirmar horarios, ambientes asignados y comunicación a participantes.",
    prioridad: "Alta",
    categoria: "Académico",
    estado: "Programado"
  }
];

const feriadosPeru2026 = {
  "2026-01-01": "Año Nuevo",
  "2026-04-02": "Jueves Santo",
  "2026-04-03": "Viernes Santo",
  "2026-05-01": "Día del Trabajo",
  "2026-06-07": "Batalla de Arica",
  "2026-06-29": "San Pedro y San Pablo",
  "2026-07-23": "Día de la Fuerza Aérea del Perú",
  "2026-07-28": "Fiestas Patrias",
  "2026-07-29": "Fiestas Patrias",
  "2026-08-06": "Batalla de Junín",
  "2026-08-30": "Santa Rosa de Lima",
  "2026-10-08": "Combate de Angamos",
  "2026-11-01": "Todos los Santos",
  "2026-12-08": "Inmaculada Concepción",
  "2026-12-09": "Batalla de Ayacucho",
  "2026-12-25": "Navidad"
};

let currentDate = new Date(2026, 4, 1);
let currentView = "month";

function login() {
  const pass = document.getElementById("passwordInput").value;
  if (pass === PASSWORD) {
    document.getElementById("login").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");
    initFilters();
    render();
  } else {
    alert("Contraseña incorrecta");
  }
}

function logout() {
  document.getElementById("app").classList.add("hidden");
  document.getElementById("login").classList.remove("hidden");
}

function updateClock() {
  const now = new Date();
  document.getElementById("currentDate").textContent = now.toLocaleDateString("es-PE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
  document.getElementById("currentTime").textContent = now.toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

setInterval(updateClock, 1000);
window.addEventListener("DOMContentLoaded", updateClock);

function goToday() {
  const today = new Date();
  currentDate = new Date(today.getFullYear(), today.getMonth(), 1);
  render();
}

function changeMonth(delta) {
  currentDate.setMonth(currentDate.getMonth() + delta);
  render();
}

function setView(view) {
  currentView = view;
  document.getElementById("btnMonth").classList.toggle("active", view === "month");
  document.getElementById("btnWeek").classList.toggle("active", view === "week");
  render();
}

function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDate(iso) {
  return new Date(iso + "T00:00:00");
}

function normalize(text) {
  return String(text || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function priorityClass(priority) {
  const p = normalize(priority);
  if (p.includes("alta")) return "alta";
  if (p.includes("media")) return "media";
  if (p.includes("baja")) return "baja";
  return "";
}

function filteredEvents() {
  const search = normalize(document.getElementById("searchInput")?.value || "");
  const area = document.getElementById("areaFilter")?.value || "";
  const estado = document.getElementById("estadoFilter")?.value || "";
  const categoria = document.getElementById("categoriaFilter")?.value || "";

  return eventosBase.filter(e => {
    const blob = normalize(`${e.ot} ${e.evento} ${e.requerimientos} ${e.area} ${e.estado} ${e.categoria}`);
    return (!search || blob.includes(search))
      && (!area || e.area === area)
      && (!estado || e.estado === estado)
      && (!categoria || e.categoria === categoria);
  });
}

function initFilters() {
  fillSelect("areaFilter", [...new Set(eventosBase.map(e => e.area))].sort());
  fillSelect("estadoFilter", [...new Set(eventosBase.map(e => e.estado))].sort());
  fillSelect("categoriaFilter", [...new Set(eventosBase.map(e => e.categoria))].sort());
}

function fillSelect(id, values) {
  const select = document.getElementById(id);
  const first = select.options[0];
  select.innerHTML = "";
  select.appendChild(first);
  values.forEach(v => {
    const option = document.createElement("option");
    option.value = v;
    option.textContent = v;
    select.appendChild(option);
  });
}

function render() {
  updateTitle();
  if (currentView === "month") renderMonth();
  else renderWeek();
  updateKPIs();
}

function updateTitle() {
  document.getElementById("monthTitle").textContent = currentDate.toLocaleDateString("es-PE", {
    month: "long",
    year: "numeric"
  });
}

function renderMonth() {
  const calendar = document.getElementById("calendar");
  calendar.innerHTML = "";

  const dayNames = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];
  dayNames.forEach(d => {
    const div = document.createElement("div");
    div.className = "day-name";
    div.textContent = d;
    calendar.appendChild(div);
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let startOffset = first.getDay() - 1;
  if (startOffset < 0) startOffset = 6;

  for (let i = 0; i < startOffset; i++) {
    const empty = document.createElement("div");
    empty.className = "day empty";
    calendar.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    renderDayCell(calendar, date);
  }
}

function renderWeek() {
  const calendar = document.getElementById("calendar");
  calendar.innerHTML = "";

  const today = new Date(currentDate);
  const day = today.getDay() || 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - day + 1);

  const dayNames = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];
  dayNames.forEach(d => {
    const div = document.createElement("div");
    div.className = "day-name";
    div.textContent = d;
    calendar.appendChild(div);
  });

  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    renderDayCell(calendar, date, true);
  }
}

function renderDayCell(calendar, date, isWeek = false) {
  const iso = toISODate(date);
  const events = filteredEvents().filter(e => e.fecha === iso);
  const holiday = feriadosPeru2026[iso];
  const todayIso = toISODate(new Date());

  const div = document.createElement("div");
  div.className = "day";
  if (holiday) div.classList.add("holiday");
  if (iso === todayIso) div.classList.add("today");

  const topPriority = events.some(e => priorityClass(e.prioridad) === "alta") ? "alta"
    : events.some(e => priorityClass(e.prioridad) === "media") ? "media"
    : events.some(e => priorityClass(e.prioridad) === "baja") ? "baja" : "";

  if (topPriority) div.classList.add(`priority-${topPriority}`);

  div.onclick = () => openModal(iso);

  const mainArea = events[0]?.area || "";
  div.innerHTML = `
    <div class="day-number">${date.getDate()}</div>
    ${isWeek ? `<div class="area-label">${date.toLocaleDateString("es-PE", { month: "long" })}</div>` : ""}
    ${holiday ? `<div class="holiday-label">🇵🇪 ${holiday}</div>` : ""}
    <div class="event-summary">
      <span class="event-chip">${events.length} EV</span>
    </div>
    ${mainArea ? `<div class="area-label">${mainArea}${events.length > 1 ? " +" + (events.length - 1) : ""}</div>` : ""}
    <div class="mini-dots">
      ${events.slice(0, 10).map(e => `<i class="mini-dot ${priorityClass(e.prioridad)}"></i>`).join("")}
    </div>
  `;
  calendar.appendChild(div);
}

function updateKPIs() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthEvents = filteredEvents().filter(e => {
    const d = parseDate(e.fecha);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const holidayCount = Object.keys(feriadosPeru2026).filter(iso => {
    const d = parseDate(iso);
    return d.getFullYear() === year && d.getMonth() === month;
  }).length;

  document.getElementById("kpiTotal").textContent = monthEvents.length;
  document.getElementById("kpiDone").textContent = monthEvents.filter(e => normalize(e.estado).includes("ejecut")).length;
  document.getElementById("kpiPending").textContent = monthEvents.filter(e => normalize(e.estado).includes("pend")).length;
  document.getElementById("kpiHigh").textContent = monthEvents.filter(e => priorityClass(e.prioridad) === "alta").length;
  document.getElementById("kpiHoliday").textContent = holidayCount;
}

function openModal(iso) {
  const modal = document.getElementById("eventModal");
  const scroll = document.getElementById("eventScroll");
  const events = filteredEvents()
    .filter(e => e.fecha === iso)
    .sort((a, b) => a.hora.localeCompare(b.hora));

  const date = parseDate(iso);
  document.getElementById("modalDate").textContent = date.toLocaleDateString("es-PE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).toUpperCase();

  document.getElementById("modalInfo").textContent = feriadosPeru2026[iso]
    ? `🇵🇪 ${feriadosPeru2026[iso]} · ${events.length} evento(s)`
    : `${events.length} evento(s) registrado(s)`;

  if (!events.length) {
    scroll.innerHTML = `<div class="no-events">No hay eventos registrados para este día.</div>`;
  } else {
    scroll.innerHTML = events.map(e => `
      <article class="event-card ${priorityClass(e.prioridad)}">
        <div class="event-time">${e.hora}</div>
        <div class="event-title">${e.evento}</div>
        <div class="badges">
          <span class="badge">Área: ${e.area}</span>
          <span class="badge">${e.ot}</span>
          <span class="badge">${e.prioridad}</span>
          <span class="badge">${e.categoria}</span>
          <span class="badge">${e.estado}</span>
        </div>
        <div class="requirements">
          <strong>Requerimientos:</strong><br>
          ${e.requerimientos}
        </div>
      </article>
    `).join("");
  }

  modal.classList.remove("hidden");
  scroll.scrollTop = 0;
  setTimeout(updateFocusedCard, 100);
}

function closeModal() {
  document.getElementById("eventModal").classList.add("hidden");
}

function updateFocusedCard() {
  const container = document.getElementById("eventScroll");
  const cards = container.querySelectorAll(".event-card");
  if (!cards.length) return;

  const center = container.getBoundingClientRect().top + container.clientHeight / 2;
  let closest = null;
  let min = Infinity;

  cards.forEach(card => {
    const rect = card.getBoundingClientRect();
    const cardCenter = rect.top + rect.height / 2;
    const distance = Math.abs(center - cardCenter);
    card.classList.remove("focused");

    if (distance < min) {
      min = distance;
      closest = card;
    }
  });

  if (closest) closest.classList.add("focused");
}

document.getElementById("eventScroll").addEventListener("scroll", updateFocusedCard);
document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeModal();
});
