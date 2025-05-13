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

exports.handler = async function (event, context) {
  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      body: JSON.stringify(todos),
    };
  }

  if (event.httpMethod === 'POST') {
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
        body: JSON.stringify(newTodo),
      };
    } catch (err) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: err.message }),
      };
    }
  }

  return {
    statusCode: 405,
    body: JSON.stringify({ error: 'Method not allowed' }),
  };
};
