const PASSWORD = "villa2026";
let eventosBase = [];
let currentDate = new Date(2026, 5, 1);
let currentView = "month";

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

function login() {
  const pass = document.getElementById("passwordInput").value;
  if (pass === PASSWORD) {
    document.getElementById("login").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");
    cargarCSV();
  } else {
    alert("Contraseña incorrecta");
  }
}
function logout() {
  document.getElementById("app").classList.add("hidden");
  document.getElementById("login").classList.remove("hidden");
}

async function cargarCSV() {
  const status = document.getElementById("statusMessage");
  try {
    const response = await fetch("CONTROL_EVENTOS.csv?t=" + Date.now());
    if (!response.ok) throw new Error("No se pudo leer CONTROL_EVENTOS.csv");
    const text = await response.text();
    eventosBase = parseCSV(text).map(mapRow).filter(e => e.fecha && e.evento);
    initFilters();
    status.textContent = `Eventos cargados: ${eventosBase.length}`;
    render();
  } catch (err) {
    status.textContent = "Error: no se pudo cargar CONTROL_EVENTOS.csv. Verifica que esté subido junto a index.html.";
    console.error(err);
  }
}

function parseCSV(text) {
  text = text.replace(/^\uFEFF/, "");
  const rows = [];
  let row = [], field = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i], n = text[i + 1];
    if (c === '"' && inQuotes && n === '"') { field += '"'; i++; }
    else if (c === '"') inQuotes = !inQuotes;
    else if (c === "," && !inQuotes) { row.push(field); field = ""; }
    else if ((c === "\n" || c === "\r") && !inQuotes) {
      if (c === "\r" && n === "\n") i++;
      row.push(field); field = "";
      if (row.some(v => v.trim() !== "")) rows.push(row);
      row = [];
    } else field += c;
  }
  if (field || row.length) { row.push(field); if (row.some(v => v.trim() !== "")) rows.push(row); }
  const headers = rows.shift().map(h => h.trim());
  return rows.map(r => Object.fromEntries(headers.map((h, i) => [h, (r[i] || "").trim()])));
}

function mapRow(r) {
  return {
    fecha: normalizeDate(r["Fecha"]),
    hora: normalizeTime(r["Hora"]),
    area: r["Área Solicitante"] || r["Area Solicitante"] || "",
    ot: r["N° OT"] || r["N OT"] || r["Numero OT"] || "",
    evento: r["Evento / Actividad"] || "",
    ubicacion: r["Ubicación"] || r["Ubicacion"] || "",
    requerimientos: r["Requerimientos"] || "",
    prioridad: normalizePriority(r["Prioridad"] || ""),
    categoria: r["Categoría"] || r["Categoria"] || "",
    estado: r["Estado"] || ""
  };
}

function normalizePriority(p) {
  const s = String(p || "").trim();
  const n = normalize(s);
  if (n.includes("alta")) return "Alta";
  if (n.includes("medio") || n.includes("media")) return "Media";
  if (n.includes("baja") || n.includes("bajo")) return "Baja";
  return s;
}
function normalizeDate(value) {
  value = String(value || "").trim();
  if (!value) return "";
  const parts = value.split(/[\/\-]/);
  if (parts.length === 3) {
    let d, m, y;
    if (parts[0].length === 4) { y = parts[0]; m = parts[1]; d = parts[2]; }
    else { d = parts[0]; m = parts[1]; y = parts[2]; }
    return `${String(y).padStart(4,"0")}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  }
  return value;
}
function normalizeTime(value) {
  value = String(value || "").trim();
  if (!value) return "";
  const match = value.match(/(\d{1,2})[:;](\d{2})/);
  if (match) return `${match[1].padStart(2,"0")}:${match[2]}`;
  return value;
}
function updateClock() {
  const now = new Date();
  document.getElementById("currentDate").textContent = now.toLocaleDateString("es-PE", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
  document.getElementById("currentTime").textContent = now.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
setInterval(updateClock, 1000);
window.addEventListener("DOMContentLoaded", updateClock);

function goToday() {
  const today = new Date();
  currentDate = new Date(today.getFullYear(), today.getMonth(), 1);
  render();
}
function changeMonth(delta) { currentDate.setMonth(currentDate.getMonth() + delta); render(); }
function setView(view) {
  currentView = view;
  document.getElementById("btnMonth").classList.toggle("active", view === "month");
  document.getElementById("btnWeek").classList.toggle("active", view === "week");
  render();
}
function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth()+1).padStart(2,"0");
  const d = String(date.getDate()).padStart(2,"0");
  return `${y}-${m}-${d}`;
}
function parseDate(iso) { return new Date(iso + "T00:00:00"); }
function normalize(text) { return String(text || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }
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
  const ubicacion = document.getElementById("ubicacionFilter")?.value || "";
  const estado = document.getElementById("estadoFilter")?.value || "";
  const categoria = document.getElementById("categoriaFilter")?.value || "";
  return eventosBase.filter(e => {
    const blob = normalize(`${e.ot} ${e.evento} ${e.requerimientos} ${e.area} ${e.estado} ${e.categoria} ${e.ubicacion}`);
    return (!search || blob.includes(search)) && (!area || e.area === area) && (!ubicacion || e.ubicacion === ubicacion) && (!estado || e.estado === estado) && (!categoria || e.categoria === categoria);
  });
}
function initFilters() {
  fillSelect("areaFilter", [...new Set(eventosBase.map(e => e.area).filter(Boolean))].sort());
  fillSelect("ubicacionFilter", [...new Set(eventosBase.map(e => e.ubicacion).filter(Boolean))].sort());
  fillSelect("estadoFilter", [...new Set(eventosBase.map(e => e.estado).filter(Boolean))].sort());
  fillSelect("categoriaFilter", [...new Set(eventosBase.map(e => e.categoria).filter(Boolean))].sort());
}
function fillSelect(id, values) {
  const select = document.getElementById(id);
  const firstText = select.options[0].textContent;
  select.innerHTML = `<option value="">${firstText}</option>`;
  values.forEach(v => {
    const option = document.createElement("option");
    option.value = v; option.textContent = v; select.appendChild(option);
  });
}
function render() {
  updateTitle();
  if (currentView === "month") renderMonth(); else renderWeek();
  updateKPIs();
}
function updateTitle() {
  document.getElementById("monthTitle").textContent = currentDate.toLocaleDateString("es-PE", { month: "long", year: "numeric" });
}
function renderMonth() {
  const calendar = document.getElementById("calendar");
  calendar.innerHTML = "";
  ["LUN","MAR","MIÉ","JUE","VIE","SÁB","DOM"].forEach(d => {
    const div = document.createElement("div"); div.className = "day-name"; div.textContent = d; calendar.appendChild(div);
  });
  const year = currentDate.getFullYear(), month = currentDate.getMonth();
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let startOffset = first.getDay() - 1; if (startOffset < 0) startOffset = 6;
  for (let i=0; i<startOffset; i++) { const empty = document.createElement("div"); empty.className = "day empty"; calendar.appendChild(empty); }
  for (let day=1; day<=daysInMonth; day++) renderDayCell(calendar, new Date(year, month, day));
}
function renderWeek() {
  const calendar = document.getElementById("calendar");
  calendar.innerHTML = "";
  const today = new Date(currentDate);
  const day = today.getDay() || 7;
  const monday = new Date(today); monday.setDate(today.getDate() - day + 1);
  ["LUN","MAR","MIÉ","JUE","VIE","SÁB","DOM"].forEach(d => {
    const div = document.createElement("div"); div.className = "day-name"; div.textContent = d; calendar.appendChild(div);
  });
  for (let i=0; i<7; i++) { const date = new Date(monday); date.setDate(monday.getDate()+i); renderDayCell(calendar, date, true); }
}
function renderDayCell(calendar, date, isWeek=false) {
  const iso = toISODate(date);
  const events = filteredEvents().filter(e => e.fecha === iso);
  const holiday = feriadosPeru2026[iso];
  const todayIso = toISODate(new Date());
  const div = document.createElement("div");
  div.className = "day";
  if (holiday) div.classList.add("holiday");
  if (iso === todayIso) div.classList.add("today");
  const topPriority = events.some(e => priorityClass(e.prioridad)==="alta") ? "alta" : events.some(e => priorityClass(e.prioridad)==="media") ? "media" : events.some(e => priorityClass(e.prioridad)==="baja") ? "baja" : "";
  if (topPriority) div.classList.add(`priority-${topPriority}`);
  div.onclick = () => openModal(iso);
  const mainArea = events[0]?.area || "";
  const mainLocation = events.find(e => e.ubicacion)?.ubicacion || "";
  div.innerHTML = `
    <div class="day-number">${date.getDate()}</div>
    ${isWeek ? `<div class="area-label">${date.toLocaleDateString("es-PE", { month: "long" })}</div>` : ""}
    ${holiday ? `<div class="holiday-label">🇵🇪 ${holiday}</div>` : ""}
    <div class="event-summary"><span class="event-chip">${events.length} EV</span></div>
    ${mainLocation ? `<div class="location-label">📍 ${mainLocation}</div>` : ""}
    ${mainArea ? `<div class="area-label">🏢 ${mainArea}${events.length > 1 ? " +" + (events.length-1) : ""}</div>` : ""}
    <div class="mini-dots">${events.slice(0,10).map(e => `<i class="mini-dot ${priorityClass(e.prioridad)}"></i>`).join("")}</div>`;
  calendar.appendChild(div);
}
function monthEvents() {
  const year = currentDate.getFullYear(), month = currentDate.getMonth();
  return filteredEvents().filter(e => { const d = parseDate(e.fecha); return d.getFullYear() === year && d.getMonth() === month; });
}
function updateKPIs() {
  const events = monthEvents();
  const year = currentDate.getFullYear(), month = currentDate.getMonth();
  const holidayCount = Object.keys(feriadosPeru2026).filter(iso => { const d = parseDate(iso); return d.getFullYear() === year && d.getMonth() === month; }).length;
  document.getElementById("kpiTotal").textContent = events.length;
  document.getElementById("kpiDone").textContent = events.filter(e => normalize(e.estado).includes("ejecut")).length;
  document.getElementById("kpiPending").textContent = events.filter(e => normalize(e.estado).includes("pend")).length;
  document.getElementById("kpiHigh").textContent = events.filter(e => priorityClass(e.prioridad)==="alta").length;
  document.getElementById("kpiHoliday").textContent = holidayCount;
}
function eventCardHTML(e) {
  return `<article class="event-card ${priorityClass(e.prioridad)}">
      <div class="event-time">${e.hora}</div>
      <div class="event-title">${e.evento}</div>
      <div class="badges">
        <span class="badge">Área: ${e.area || "-"}</span>
        <span class="badge">📍 ${e.ubicacion || "Sin ubicación"}</span>
        <span class="badge">${e.ot || "Sin OT"}</span>
        <span class="badge">${e.prioridad || "-"}</span>
        <span class="badge">${e.categoria || "-"}</span>
        <span class="badge">${e.estado || "-"}</span>
      </div>
      <div class="requirements"><strong>Requerimientos / atención:</strong><br>${e.requerimientos || "Sin anotaciones registradas."}</div>
    </article>`;
}
function openModal(iso) {
  const modal = document.getElementById("eventModal");
  const scroll = document.getElementById("eventScroll");
  const events = filteredEvents().filter(e => e.fecha === iso).sort((a,b) => a.hora.localeCompare(b.hora));
  const date = parseDate(iso);
  document.getElementById("modalDate").textContent = date.toLocaleDateString("es-PE", { weekday:"long", day:"2-digit", month:"long", year:"numeric" }).toUpperCase();
  document.getElementById("modalInfo").textContent = feriadosPeru2026[iso] ? `🇵🇪 ${feriadosPeru2026[iso]} · ${events.length} evento(s)` : `${events.length} evento(s) registrado(s)`;
  if (!events.length) scroll.innerHTML = `<div class="no-events">No hay eventos registrados para este día.</div>`;
  else scroll.innerHTML = events.map(eventCardHTML).join("");
  modal.classList.remove("hidden");
  scroll.scrollTop = 0;
  setTimeout(updateFocusedCard, 100);
}
function closeModal() { document.getElementById("eventModal").classList.add("hidden"); }

function openKpiModal(type) {
  const list = document.getElementById("kpiList");
  const title = document.getElementById("kpiModalTitle");
  const info = document.getElementById("kpiModalInfo");
  const events = monthEvents().sort((a,b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora));
  let rows = [];
  if (type === "eventos") { title.textContent = "TODOS LOS EVENTOS"; rows = events; }
  if (type === "ejecutados") { title.textContent = "EVENTOS EJECUTADOS"; rows = events.filter(e => normalize(e.estado).includes("ejecut")); }
  if (type === "pendientes") { title.textContent = "EVENTOS PENDIENTES"; rows = events.filter(e => normalize(e.estado).includes("pend")); }
  if (type === "alta") { title.textContent = "PRIORIDAD ALTA"; rows = events.filter(e => priorityClass(e.prioridad)==="alta"); }
  if (type === "feriados") {
    title.textContent = "FERIADOS PERÚ";
    const y = currentDate.getFullYear(), m = currentDate.getMonth();
    const holidays = Object.entries(feriadosPeru2026).filter(([iso]) => {
      const d = parseDate(iso); return d.getFullYear() === y && d.getMonth() === m;
    }).sort();
    info.textContent = `${holidays.length} feriado(s) en el mes`;
    list.innerHTML = holidays.length ? holidays.map(([iso, name]) => {
      const d = parseDate(iso).toLocaleDateString("es-PE", { day:"2-digit", month:"short", year:"numeric" });
      return `<article class="kpi-row alta"><div class="kpi-row-title">🇵🇪 ${name}</div><div class="kpi-meta">${d}</div></article>`;
    }).join("") : `<div class="no-events">No hay feriados registrados en este mes.</div>`;
    document.getElementById("kpiModal").classList.remove("hidden");
    return;
  }
  info.textContent = `${rows.length} registro(s) del mes seleccionado`;
  list.innerHTML = rows.length ? rows.map(e => {
    const d = parseDate(e.fecha).toLocaleDateString("es-PE", { day:"2-digit", month:"short" });
    return `<article class="kpi-row ${priorityClass(e.prioridad)}">
      <div class="kpi-row-title">${d} · ${e.hora} · ${e.evento}</div>
      <div class="kpi-meta">
        <strong>Área:</strong> ${e.area || "-"}<br>
        <strong>Ubicación:</strong> ${e.ubicacion || "Sin ubicación"}<br>
        <strong>OT:</strong> ${e.ot || "-"} · <strong>Estado:</strong> ${e.estado || "-"}<br>
        <strong>Anotación:</strong> ${e.requerimientos || "Sin anotaciones registradas."}
      </div>
    </article>`;
  }).join("") : `<div class="no-events">No hay registros para este indicador.</div>`;
  document.getElementById("kpiModal").classList.remove("hidden");
}
function closeKpiModal() { document.getElementById("kpiModal").classList.add("hidden"); }

function updateFocusedCard() {
  const container = document.getElementById("eventScroll");
  const cards = container.querySelectorAll(".event-card");
  if (!cards.length) return;
  const center = container.getBoundingClientRect().top + container.clientHeight/2;
  let closest = null, min = Infinity;
  cards.forEach(card => {
    const rect = card.getBoundingClientRect();
    const distance = Math.abs(center - (rect.top + rect.height/2));
    card.classList.remove("focused");
    if (distance < min) { min = distance; closest = card; }
  });
  if (closest) closest.classList.add("focused");
}
document.getElementById("eventScroll").addEventListener("scroll", updateFocusedCard);
document.addEventListener("keydown", e => { if (e.key === "Escape") { closeModal(); closeKpiModal(); } });
