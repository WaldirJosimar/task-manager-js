const STORAGE_KEY = "task-manager:v1";
const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const list = document.getElementById("task-list");
const counter = document.getElementById("counter");
const filterButtons = document.querySelectorAll(".filters button");

let tasks = load();
let filter = "all";

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    /* el almacenamiento puede estar bloqueado: la app sigue funcionando */
  }
}

function visibleTasks() {
  if (filter === "pending") return tasks.filter((t) => !t.done);
  if (filter === "done") return tasks.filter((t) => t.done);
  return tasks;
}

function render() {
  list.replaceChildren();
  for (const task of visibleTasks()) {
    const li = document.createElement("li");
    li.className = task.done ? "done" : "";

    const check = document.createElement("input");
    check.type = "checkbox";
    check.checked = task.done;
    check.setAttribute("aria-label", `Marcar "${task.text}" como hecha`);
    check.addEventListener("change", () => toggle(task.id));

    const text = document.createElement("span");
    text.textContent = task.text; // textContent evita inyección de HTML

    const del = document.createElement("button");
    del.className = "delete";
    del.textContent = "Eliminar";
    del.setAttribute("aria-label", `Eliminar "${task.text}"`);
    del.addEventListener("click", () => remove(task.id));

    li.append(check, text, del);
    list.append(li);
  }
  const pending = tasks.filter((t) => !t.done).length;
  counter.textContent = tasks.length
    ? `${pending} pendiente${pending === 1 ? "" : "s"} de ${tasks.length}`
    : "No hay tareas. Escribe la primera arriba.";
}

function add(text) {
  tasks.unshift({ id: crypto.randomUUID(), text, done: false });
  save();
  render();
}
function toggle(id) {
  const task = tasks.find((t) => t.id === id);
  if (task) task.done = !task.done;
  save();
  render();
}
function remove(id) {
  tasks = tasks.filter((t) => t.id !== id);
  save();
  render();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  add(text);
  input.value = "";
  input.focus();
});

filterButtons.forEach((btn) =>
  btn.addEventListener("click", () => {
    filter = btn.dataset.filter;
    filterButtons.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
    render();
  })
);

// Consumo de una API pública, con respaldo si falla la red
async function loadAdvice() {
  const box = document.getElementById("advice");
  try {
    const res = await fetch("https://api.adviceslip.com/advice", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    box.textContent = `Consejo del día: ${data.slip.advice}`;
  } catch {
    box.textContent = "Divide las tareas grandes en pasos pequeños.";
  }
}

render();
loadAdvice();
