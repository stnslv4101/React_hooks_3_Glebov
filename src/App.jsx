import { useReducer, useEffect, useCallback, useTransition, useState, useMemo, useRef, useDeferredValue } from 'react';
import { tasksReducer } from './tasksReducer.js';
import { AddTaskForm } from './components/AddTaskForm.jsx';
import { TaskList } from './components/TaskList.jsx';
import { ThemeToggle } from './components/ThemeToggle.jsx';
import { useTheme } from './ThemeContext.jsx';
import { SearchBox } from './components/SearchBox.jsx';
import { useOnlineStatus } from './hooks/useOnlineStatus.js';

// Функция загрузки задач из localStorage перед компонентом App()
function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem('tasks')) ?? [];
  } catch {
    return [];
  }
}

// Вспомогательная функция генерирования тестовых задач
function makeTestTasks() {
  return Array.from({ length: 2000 }, (_, i) => ({
    id: 'test-' + Date.now() + '-' + i,
    text: 'Тестовая задача ' + (i + 1),
    done: false,
  }));
}

export default function App() {
  // Инициализация хука useReducer с ленивой загрузкой и получением статуса сети
  const [tasks, dispatch] = useReducer(tasksReducer, [], loadTasks);
  const online = useOnlineStatus();

  // Автоматическое сохранение задач в localStorage при их изменении
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const { theme } = useTheme();
  const [isPending, startTransition] = useTransition();
  
  // Состояние для фильтрации: 'all', 'active' или 'done'
  const [filter, setFilter] = useState('all');

  // Состояния для поиска по списку
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const searchRef = useRef(null);

  // Изменение класса body для смены темы оформления
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const handleAddTask = useCallback((text) => {
    dispatch({
      type: 'add',
      task: { id: Date.now(), text, done: false }
    });
  }, []);

  const handleToggleTask = useCallback((id) => {
    dispatch({ type: 'toggle', id });
  }, []);

  const handleRemoveTask = useCallback((id) => {
    dispatch({ type: 'remove', id });
  }, []);

  // Оптимизированный подсчет статистики задач
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.done).length;
    return { total, completed };
  }, [tasks]);

  // Фильтрация и поиск задач
  const visibleTasks = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return tasks.filter((t) => {
      const byFilter = filter === 'all' || (filter === 'done' ? t.done : !t.done);
      return byFilter && t.text.toLowerCase().includes(q);
    });
  }, [tasks, deferredQuery, filter]);

  return (
    <div className="app-container">
      <header>
        <h1>Менеджер задач</h1>
        <ThemeToggle />
      </header>

      {/* Индикатор сети, добавленный строго по инструкции */}
      <p className="muted">{online ? 'Онлайн' : 'Нет сети'}</p>

      <main>
        <AddTaskForm onAdd={handleAddTask} />
        
        {/* Кнопки переключения фильтров */}
        <div className="filter-buttons">
          <button 
            className={filter === 'all' ? 'active' : ''} 
            onClick={() => startTransition(() => setFilter('all'))}
          >
            Все
          </button>
          <button 
            className={filter === 'active' ? 'active' : ''} 
            onClick={() => startTransition(() => setFilter('active'))}
          >
            Активные
          </button>
          <button 
            className={filter === 'done' ? 'active' : ''} 
            onClick={() => startTransition(() => setFilter('done'))}
          >
            Готовые
          </button>
        </div>

        {/* Блок поиска */}
        <div className="toolbar">
          <SearchBox ref={searchRef} value={query} onChange={setQuery} />
          <button onClick={() => searchRef.current.clear()}>Сбросить</button>
        </div>

        {/* Индикатор обновления и статистика */}
        <p className="muted">
          Всего: {tasks.length}, выполнено: {stats.completed}
          {isPending && ' . . . обновляем . . .'}
        </p>
        
        {/* Список задач */}
        <TaskList 
          tasks={visibleTasks} 
          onToggle={handleToggleTask} 
          onRemove={handleRemoveTask}
        />

        {/* Кнопки управления списком */}
        <div className="toolbar">
          <button onClick={() => dispatch({ type: 'clearDone' })}>
            Удалить выполненные
          </button>
          <button onClick={() => dispatch({ type: 'addMany', tasks: makeTestTasks() })}>
            +2000 тестовых
          </button>
          <button onClick={() => dispatch({ type: 'clearAll' })}>
            Удалить все
          </button>
        </div>
      </main>
    </div>
  );
}
