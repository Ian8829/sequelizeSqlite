const Sequelize = require('sequelize');
const db = new Sequelize(undefined, undefined, undefined, {
  'dialect': 'sqlite',
  'storage': `${__dirname}/second-sqlite-database.sqlite`
});

const Todo = db.define('secondTodo', {
  description: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      len: [1, 250]
    }
  },
  completed: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
});

db.sync({})
  .then(() => {
    console.log('Everything is synced');

    Todo.findById(2)
      .then(todo => {
        if (todo) {
          console.log(todo.toJSON());
        } else {
          console.log('Todo not found');
        }
      })
  });


