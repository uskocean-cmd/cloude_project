(() => {
  const STORAGE_KEY = 'todo-app-tasks';

  let todos = loadTodos();
  let currentFilter = 'all';

  const form = document.getElementById('todo-form');
  const input = document.getElementById('todo-input');
  const list = document.getElementById('todo-list');
  const countEl = document.getElementById('todo-count');
  const filterBtns = document.querySelectorAll('.filter-btn');

  // --- Storage ---

  function loadTodos() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveTodos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }

  // --- CRUD ---

  function addTodo(text) {
    todos.push({ id: Date.now(), text, completed: false });
    saveTodos();
    render();
  }

  function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    saveTodos();
    render();
  }

  function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      saveTodos();
      render();
    }
  }

  function editTodo(id, newText) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      todo.text = newText;
      saveTodos();
      render();
    }
  }

  // --- Filtering ---

  function getFilteredTodos() {
    switch (currentFilter) {
      case 'active':
        return todos.filter(t => !t.completed);
      case 'completed':
        return todos.filter(t => t.completed);
      default:
        return todos;
    }
  }

  // --- Render ---

  function render() {
    const filtered = getFilteredTodos();
    list.innerHTML = '';

    filtered.forEach(todo => {
      const li = document.createElement('li');
      li.className = 'todo-item' + (todo.completed ? ' completed' : '');

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = todo.completed;
      checkbox.addEventListener('change', () => toggleTodo(todo.id));

      const span = document.createElement('span');
      span.className = 'todo-text';
      span.textContent = todo.text;

      // Double-click to edit
      span.addEventListener('dblclick', () => startEdit(span, todo.id));

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.textContent = '削除';
      deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

      li.append(checkbox, span, deleteBtn);
      list.appendChild(li);
    });

    updateCount();
  }

  function updateCount() {
    const active = todos.filter(t => !t.completed).length;
    const total = todos.length;
    countEl.textContent = total === 0
      ? ''
      : `${active} 件の未完了タスク / 全 ${total} 件`;
  }

  // --- Inline Edit ---

  function startEdit(span, id) {
    span.contentEditable = 'true';
    span.classList.add('editing');
    span.focus();

    // Select all text
    const range = document.createRange();
    range.selectNodeContents(span);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);

    function finishEdit() {
      span.contentEditable = 'false';
      span.classList.remove('editing');
      const newText = span.textContent.trim();
      if (newText) {
        editTodo(id, newText);
      } else {
        deleteTodo(id);
      }
    }

    span.addEventListener('blur', finishEdit, { once: true });
    span.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        span.blur();
      }
      if (e.key === 'Escape') {
        span.textContent = todos.find(t => t.id === id)?.text || '';
        span.blur();
      }
    });
  }

  // --- Event Listeners ---

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (text) {
      addTodo(text);
      input.value = '';
      input.focus();
    }
  });

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      render();
    });
  });

  // --- Init ---
  render();
})();
