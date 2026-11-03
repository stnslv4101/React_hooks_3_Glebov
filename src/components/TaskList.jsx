import { useLayoutEffect, useRef } from 'react';
import { TaskItem } from './TaskItem.jsx';

export function TaskList({ tasks, onToggle, onRemove }) {
  const listRef = useRef(null);

  useLayoutEffect(() => {
    const el = listRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [tasks.length]);

  return (
    <ul ref={listRef}>
      {tasks.map((t) => (
        <TaskItem 
          key={t.id} 
          task={t} 
          onToggle={onToggle} 
          onRemove={onRemove} 
        />
      ))}
    </ul>
  );
}
