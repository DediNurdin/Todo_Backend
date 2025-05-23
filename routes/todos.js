const express = require('express');
const router = express.Router();
const todosController = require('../netlify/functions/todos');

router.get('/', todosController.getAllTodos);
router.get('/stats', todosController.getStats);
router.get('/:id', todosController.getTodo);
router.post('/', todosController.createTodo);
router.put('/:id', todosController.updateTodo);
router.delete('/:id', todosController.deleteTodo);

module.exports = router;