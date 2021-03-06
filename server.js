const express = require('express');
const bodyParser = require('body-parser');
const _ = require('underscore');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const todos = [];
let todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.send('Todo API Root');
});

// GET /todos?completed=false&q=work
app.get('/todos', function(req, res) {
	const query = req.query;
	const where = {};

	if (query.hasOwnProperty('completed') && query.completed === 'true') {
	  where.completed = true;
  } else if (query.hasOwnProperty('completed' && query.completed === 'false')) {
	  where.completed = false;
  }

  if (query.hasOwnProperty('q') && query.q.length > 0) {
	  where.description = {
	    $like: `%${query.q}%`
    };
  }

  db.todo.findAll({where})
    .then(todos => {
	    res.json(todos);
    }, e => {
	    res.status(500).send();
    })
});

// GET /todos/:id
app.get('/todos/:id', function(req, res) {
	const todoId = parseInt(req.params.id, 10);

	db.todo.findById(todoId)
    .then((todo) => {
	    if (!!todo) {
	      res.json(todo.toJSON());
      } else {
	      res.status(404).send();
      }
    }, e => {
      res.status(500).send();
    });
});

// POST /todos
app.post('/todos', function(req, res) {
	const body = _.pick(req.body, 'description', 'completed');

	// call create on db.todo
  db.todo.create(body)
    .then(todo => {
      res.json(todo.toJSON());
    }, e => {
      res.status(400).json(e);
    });
  // respond with 200 and todo
  // e res.status(400).json(e)
});

// DELETE /todos/:id
app.delete('/todos/:id', function(req, res) {
	const todoId = parseInt(req.params.id, 10);

	db.todo.destroy({
    where: {
      id: todoId
    }
  })
    .then(rowsDeleted => {
	    if (rowsDeleted === 0) {
	      res.status(404).json({
          error: 'No todo with id'
        });
      } else {
	      res.status(204).send();
      }
    }, () => {
	    res.status(500).send();
    })
});

// PUT /todos/:id
app.put('/todos/:id', function(req, res) {
	const todoId = parseInt(req.params.id, 10);
	const body = _.pick(req.body, 'description', 'completed');
	const attributes = {};

	if (body.hasOwnProperty('completed')) {
		attributes.completed = body.completed;
	}

	if (body.hasOwnProperty('description')) {
		attributes.description = body.description;
	}

	db.todo.findById(todoId)
    .then(todo => {
	    if (todo) {
	      todo.update(attributes)
          .then((todo) => {
            res.json(todo.toJSON());
          }, e => {
            res.status(400).json(e);
          });
      } else {
	      res.status(404).send();
      }
    }, () => {
      res.status(500).send();
    })
});

db.sequelize.sync()
  .then(() => {
    app.listen(PORT, function() {
      console.log(`Express listening on port ${PORT}!`);
    });
  });

