// Load saved tasks from local storage, or start with an empty array if none exist
let tasks = JSON.parse(localStorage.getItem('flask_tasks')) || [];
let filter = 'all';

// Find the highest ID to prevent duplicating IDs on reload
let uid = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;

const listEl = document.getElementById('list');
const emptyEl = document.getElementById('empty-msg');
const countEl = document.getElementById('count');
const form = document.getElementById('add-form');
const input = document.getElementById('task-input');

// Render date beautifully using Lora/Courier styling
document.getElementById('dateline').textContent =
  new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

form.addEventListener('submit', e => {
  e.preventDefault();
  const text = input.value.trim();
  if(!text) return;
  tasks.push({ id: uid++, text, done:false });
  input.value = '';
  saveAndRender();
});

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    filter = btn.dataset.filter;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    render();
  });
});

document.getElementById('clear-done').addEventListener('click', () => {
  tasks = tasks.filter(t => !t.done);
  saveAndRender();
});

// Setup globally safe click actions
window.toggle = function(id) {
  const t = tasks.find(t => t.id === id);
  if(t){ t.done = !t.done; saveAndRender(); }
}

window.remove = function(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveAndRender();
}

function saveAndRender() {
  localStorage.setItem('flask_tasks', JSON.stringify(tasks));
  render();
}

function render(){
  const visible = tasks.filter(t => {
    if(filter === 'open') return !t.done;
    if(filter === 'done') return t.done;
    return true;
  });

  listEl.innerHTML = '';
  
  // FIX: Toggles using 'block' layout configuration safely
  emptyEl.style.display = visible.length ? 'none' : 'block';

  visible.forEach(t => {
    const li = document.createElement('li');

    const box = document.createElement('div');
    box.className = 'box' + (t.done ? ' done' : '');
    box.addEventListener('click', () => window.toggle(t.id));

    const span = document.createElement('span');
    span.className = 'task-text' + (t.done ? ' done' : '');
    span.textContent = t.text;

    const del = document.createElement('button');
    del.className = 'del';
    del.textContent = '✕';
    del.addEventListener('click', (e) => {
      e.stopPropagation(); // Stops checking the item when deleting
      window.remove(t.id);
    });

    li.appendChild(box);
    li.appendChild(span);
    li.appendChild(del);
    listEl.appendChild(li);
  });

  const openCount = tasks.filter(t => !t.done).length;
  countEl.textContent = openCount + ' open · ' + tasks.length + ' total';
}

// Fire render on boot
render();
