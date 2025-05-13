const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const todosRoutes = require('./routes/todos');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use('/api/todos', todosRoutes);

app.get('/docs', (req, res) => {
    res.render('api-docs');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API Documentation: http://localhost:${PORT}/docs`);
});