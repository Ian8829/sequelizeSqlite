const bcrypt = require('bcrypt');
const _ = require('underscore');
const crpytojs = require('crypto-js');
const jwt = require('jsonwebtoken');

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
        });
      },
      findByToken: function (token) {
        return new Promise((resolve, reject) => {
          try {
            const decodedJWT = jwt.verify(token, 'qwerty098');
            const bytes = crpytojs.AES.decrypt(decodedJWT.token, 'abc123!@#!');
            const tokenData = JSON.parse(bytes.toString(crpytojs.enc.Utf8));

            user.findById(tokenData.id)
              .then(user => {
                if (user) {
                  resolve(user);
                } else {
                  reject();
                }
              }, e => {
                reject();
              });

          } catch (e) {
            reject();
          }
        });
      }
    },
    instanceMethods: {
      toPublicJSON: function () {
        const json = this.toJSON();
        return _.pick(json, 'id', 'email', 'createdAt', 'updatedAt');
      },
      generateToken: function (type) {
        if (!_.isString(type)) {
          return undefined;
        }

        try {
          const stringData = JSON.stringify({id: this.get('id'), type});
          const encryptedData = crpytojs.AES.encrypt(stringData, 'abc123!@#!').toString();
          const token = jwt.sign({
            token: encryptedData
          }, 'qwerty098');

          return token;

        } catch (e) {
          console.error(e);
          return undefined;
        }
      }
    }
  });

  return user;
};