import { useReducer, useEffect, useCallback, useTransition, useState, useMemo, useRef, useDeferredValue } from 'react';
import { tasksReducer } from './tasksReducer.js';
import { AddTaskForm } from './components/AddTaskForm.jsx';
import { TaskList } from './components/TaskList.jsx';
import { ThemeToggle } from './components/ThemeToggle.jsx';
import { useTheme } from './ThemeContext.jsx';
import { SearchBox } from './components/SearchBox.jsx'; // Импортируем компонент поиска

const initialTasks = [];

const mockFetchTasks = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, text: 'Изучить хук useReducer', done: true },
        { id: 2, text: 'Разобраться с useCallback', done: false },
        { id: 3, text: 'Проверить работу React 19', done: false },
      ]);
    }, 1000);
  });
};

// Вспомогательная функция, вставленная ровно перед компонентом App()
function makeTestTasks() {
  return Array.from({ length: 2000 }, (_, i) => ({
    id: 'test-' + Date.now() + '-' + i,
    text: 'Тестовая задача ' + (i + 1),
    done: false,
  }));
}

export default function App() {
  const [tasks, dispatch] = useReducer(tasksReducer, initialTasks);
  const { theme } = useTheme();
  const [isPending, startTransition] = useTransition(); // Хук для плавных вкладок
  
  // Состояние для фильтрации: 'all', 'active' или 'done'
  const [filter, setFilter] = useState('all');

  // Переменные для поиска по фото
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query); // Отложенное состояние поиска
  const searchRef = useRef(null); // Реф для вызова методов focus/clear

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  useEffect(() => {
    mockFetchTasks().then((loadedTasks) => {
      dispatch({ type: 'addMany', tasks: loadedTasks });
    });
  }, []);

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

  // Оптимизированный подсчет статистики
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.done).length;
    return { total, completed };
  }, [tasks]);

  // Заменили visibleTasks на версию с поиском из учебника
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

      <main>
        <AddTaskForm onAdd={handleAddTask} />
        
        {/* Кнопки переключения фильтров с использованием startTransition из фото */}
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

        {/* Перед блоком вставили поиск по фото */}
        <div className="toolbar">
          <SearchBox ref={searchRef} value={query} onChange={setQuery} />
          <button onClick={() => searchRef.current.clear()}>Сбросить</button>
        </div>

        {/* Измененная строка со счетчиком и индикатором обновления по фото */}
        <p className="muted">
          Всего: {tasks.length}, выполнено: {stats.completed}
          {isPending && ' . . . обновляем . . .'}
        </p>
        
        {/* Список выводит отфильтрованные задачи с учетом поиска */}
        <TaskList 
          tasks={visibleTasks} 
          onToggle={handleToggleTask} 
          onRemove={handleRemoveTask}
        />

        {/* Замененный блок кнопок управления списком по фото */}
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
