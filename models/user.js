const bcrypt = require('bcrypt');
const _ = require('underscore');

module.exports = (sequelize, DataTypes) => {
  const user =  sequelize.define('user', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    salt: {
      type: DataTypes.STRING
    },
    password_hash: {
      type: DataTypes.STRING
    },
    password: {
      type: DataTypes.VIRTUAL,
      allowNull: false,
      validate: {
        len: [4, 30]
      },
      set: function(value) {
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(value, salt);

        this.setDataValue('password', value);
        this.setDataValue('salt', salt);
        this.setDataValue('password_hash', hashedPassword);
      }
    }
  }, {
    hooks: {
      beforeValidate: function (user, options) {
        // user.email
        if (typeof user.email === 'string') {
          user.email = user.email.toLowerCase();
        }
      }
    },
    classMethods: {
      authenticate: function (body) {
        const {email, password} = body;

        return new Promise((resolve, reject) => {
          if (typeof email !== 'string' || typeof password !== 'string') {
            return reject();
          }

          user.findOne({
            where: {
              email
            }
          })
            .then(user => {
              if (!user || !bcrypt.compareSync(password, user.get('password_hash'))) {
                return reject();
              }

              resolve(user);
            }, e => {
              reject();
            });
        })
      }
    },
    instanceMethods: {
      toPublicJSON: function () {
        const json = this.toJSON();
        return _.pick(json, 'id', 'email', 'createdAt', 'updatedAt');
      }
    }
  });

  return user;
};