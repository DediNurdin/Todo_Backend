const { v4: uuidv4 } = require('uuid');
// import { v4 as uuidv4 } from 'uuid';
let todos = [
    {
        id: uuidv4(),
        title: 'Belajar React',
        description: 'Membuat komponen dasar',
        isCompleted: false,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date()
    },
    {
        id: uuidv4(),
        title: 'Belajar Flutter',
        description: 'Membuat aplikasi mobile',
        isCompleted: false,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date()
    }
];

exports.getAllTodos = (req, res) => {
    try {
        res.json(todos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getTodo = (req, res) => {
    try {
        const todo = todos.find(t => t.id === req.params.id);
        if (!todo) return res.status(404).json({ error: 'Todo not found' });
        res.json(todo);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createTodo = (req, res) => {
    try {
        const { title, description, isCompleted, dueDate } = req.body;

        const newTodo = {
            id: uuidv4(),
            title,
            description: description || '',
            isCompleted: isCompleted || false,
            dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            createdAt: new Date()
        };

        todos.push(newTodo);
        res.status(201).json(newTodo);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.updateTodo = (req, res) => {
    try {
        const { title, description, isCompleted, dueDate } = req.body;
        const index = todos.findIndex(t => t.id === req.params.id);

        if (index === -1) return res.status(404).json({ error: 'Todo not found' });

        const updatedTodo = {
            ...todos[index],
            title: title || todos[index].title,
            description: description || todos[index].description,
            isCompleted: isCompleted !== undefined ? isCompleted : todos[index].isCompleted,
            dueDate: dueDate ? new Date(dueDate) : todos[index].dueDate
        };

        todos[index] = updatedTodo;
        res.json(updatedTodo);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deleteTodo = (req, res) => {
    try {
        const index = todos.findIndex(t => t.id === req.params.id);
        if (index === -1) return res.status(404).json({ error: 'Todo not found' });

        const deletedTodo = todos.splice(index, 1)[0];
        res.json({ message: 'Todo deleted successfully', deletedTodo });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getTodoStats = (req, res) => {
    try {
        const completedCount = todos.filter(todo => todo.isCompleted).length;
        const incompleteCount = todos.length - completedCount;

        res.json({
            total: todos.length,
            completed: completedCount,
            incomplete: incompleteCount
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};