const { v4: uuidv4 } = require('uuid');

let todos = [
    {
        id: uuidv4(),
        title: 'Belajar React',
        description: 'Membuat komponen dasar',
        isCompleted: false,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date()
    }
];

function getTodoStats() {
    const completedCount = todos.filter(todo => todo.isCompleted).length;
    return {
        total: todos.length,
        completed: completedCount,
        incomplete: todos.length - completedCount
    };
}

exports.handler = async function (event) {
    const method = event.httpMethod;
    const id = event.queryStringParameters?.id;

    if (method === 'GET') {
        if (event.path === '/stats') {
            const completedCount = todos.filter(todo => todo.isCompleted).length;
            const incompleteCount = todos.length - completedCount;

            return {
                statusCode: 200,
                body: JSON.stringify({
                    total: todos.length,
                    completed: completedCount,
                    incomplete: incompleteCount
                }),
            };
        }

        if (id) {
            const todo = todos.find(t => t.id === id);
            if (!todo) {
                return {
                    statusCode: 404,
                    body: JSON.stringify({ error: 'Todo not found' }),
                };
            }
            return {
                statusCode: 200,
                body: JSON.stringify(todo),
            };
        } else {
            const completedCount = todos.filter(todo => todo.isCompleted).length;
            return {
                statusCode: 200,
                body: JSON.stringify({
                    todos,
                    stats: {
                        total: todos.length,
                        completed: completedCount,
                        incomplete: todos.length - completedCount
                    }
                }),
            };
        }
    }

    if (method === 'POST') {
        try {
            const data = JSON.parse(event.body);
            const { title, description, isCompleted, dueDate } = data;

            const newTodo = {
                id: uuidv4(),
                title,
                description: description || '',
                isCompleted: isCompleted || false,
                dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                createdAt: new Date()
            };

            todos.push(newTodo);

            return {
                statusCode: 201,
                body: JSON.stringify({
                    todo: newTodo,
                    stats: getTodoStats()
                }),
            };
        } catch (err) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: err.message }),
            };
        }
    }

    if (method === 'PUT') {
        if (!id) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing id in query' }),
            };
        }

        const index = todos.findIndex(t => t.id === id);
        if (index === -1) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'Todo not found' }),
            };
        }

        try {
            const data = JSON.parse(event.body);
            todos[index] = {
                ...todos[index],
                title: data.title || todos[index].title,
                description: data.description || todos[index].description,
                isCompleted: data.isCompleted !== undefined ? data.isCompleted : todos[index].isCompleted,
                dueDate: data.dueDate ? new Date(data.dueDate) : todos[index].dueDate,
            };

            return {
                statusCode: 200,
                body: JSON.stringify({
                    todo: todos[index],
                    stats: getTodoStats()
                }),
            };
        } catch (err) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: err.message }),
            };
        }
    }

    if (method === 'DELETE') {
        if (!id) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing id in query' }),
            };
        }

        const index = todos.findIndex(t => t.id === id);
        if (index === -1) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'Todo not found' }),
            };
        }

        const deleted = todos.splice(index, 1)[0];
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Todo deleted',
                deleted,
                stats: getTodoStats()
            }),
        };
    }

    return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method not allowed' }),
    };
};