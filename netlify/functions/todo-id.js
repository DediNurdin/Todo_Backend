const { v4: uuidv4 } = require('uuid');

// Simulasi database in-memory
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
  const id = event.queryStringParameters.id;
  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing "id" query parameter' }),
    };
  }

  const index = todos.findIndex(todo => todo.id === id);
  if (index === -1) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Todo not found' }),
    };
  }

  switch (event.httpMethod) {
    case 'GET':
      return {
        statusCode: 200,
        body: JSON.stringify(todos[index]),
      };

    case 'PUT':
      try {
        const data = JSON.parse(event.body);
        todos[index] = {
          ...todos[index],
          title: data.title || todos[index].title,
          description: data.description || todos[index].description,
          isCompleted: data.isCompleted !== undefined ? data.isCompleted : todos[index].isCompleted,
          dueDate: data.dueDate ? new Date(data.dueDate) : todos[index].dueDate
        };
        return {
          statusCode: 200,
          body: JSON.stringify(todos[index]),
        };
      } catch (err) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: err.message }),
        };
      }

    case 'DELETE':
      const deleted = todos.splice(index, 1)[0];
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Todo deleted', deleted }),
      };

    default:
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method not allowed' }),
      };
  }
};
