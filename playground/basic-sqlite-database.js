const Sequelize = require('sequelize');
const db = new Sequelize(undefined, undefined, undefined, {
  'dialect': 'sqlite',
  'storage': __dirname + '/basic-sqlite-database.sqlite'
});

const Todo = db.define('todo', {
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

db.sync({force: true}).then(() => {
  // force true -> automatically drop
  // force false -> render only when the db isn't exist
  console.log('Everything is synced');

  Todo.create({
    description: 'Take out trash',
    completed: false
  })
    .then(todo => {
      return Todo.create({
        description: 'Clean office'
      });
    })
    .then(() => {
      // return Todo.findById(1);
      return Todo.findAll({
        where: {
          description: {
            $like: '%Office%'
          }
        }
      });
    })
    .then((todos) => {
      if (todos) {
        todos.map((todo) => {
          console.log(todo.toJSON());
        });
      } else {
        console.log('no todo found');
      }
    })
    .catch(e => {
      console.log(e);
    });
});