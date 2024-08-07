import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      const { data } = await axios.get('http://localhost:4000/api/tasks');
      setTasks(data.tasks);
    };
    fetchTasks();
  }, []);

  const handleCreateTask = async () => {
    await axios.post('http://localhost:4000/api/task', { title, description });
    setTitle('');
    setDescription('');
    const { data } = await axios.get('http://localhost:4000/api/tasks');
    setTasks(data.tasks);
  };

  return (
    <div>
      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
      <button onClick={handleCreateTask}>Add Task</button>
      <ul>
        {tasks.map((task) => (
          <li key={task._id}>{task.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default TaskManager;
