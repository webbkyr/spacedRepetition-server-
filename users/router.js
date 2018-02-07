'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const { User } = require('./models');
const { Question } = require('../questions/models');
const router = express.Router();
const jsonParser = bodyParser.json();

//Register new users

router.post('/', jsonParser, (req, res) => {
  const requiredFields = ['username', 'password'];
  const missingField = requiredFields.find(field => !(field in req.body));
  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: missingField
    });
  }

  const stringFields = ['username', 'password'];
  const nonStringField = stringFields.find(field => field in req.body && typeof req.body[field] !== 'string');
  if (nonStringField) {
    return res.status(422).json({
      code: 422, 
      reason: 'ValidationError', 
      message: 'Expected string', 
      location: nonStringField
    });
  }

  const trimmedFields = ['username', 'password'];
  const nonTrimmedField = trimmedFields.find(field => req.body[field].trim() !== req.body[field]);
  if (nonTrimmedField) {
    return res.status(422).json({
      code: 422, 
      reason: 'ValidationError',
      message: 'Cannot start or end with whitespace', 
      location: nonTrimmedField
    });
  }
  
  const sizedFields = {
    username: {min: 1}, 
    password: {min: 7, max: 72}
  };
  const tooSmallField = Object.keys(sizedFields).find(
    field => 'min' in sizedFields[field] && req.body[field].trim().length < sizedFields[field].min
  );
  const tooLargeField = Object.keys(sizedFields).find(
    field => 'max' in sizedFields[field] && req.body[field].trim().length > sizedFields[field].max
  );
  if (tooSmallField || tooLargeField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: tooSmallField ? `Must be at least ${sizedFields[tooSmallField].min} characters long` :
        `Must be at most ${sizedFields[tooLargeField].max} characters long`,
      location: tooSmallField || tooLargeField
    });
  }

  let { username, password } = req.body;

  return User.find({username})
    .count()
    .then(count => {
      if (count > 0) {
        return Promise.reject({
          code: 422,
          reason: 'ValidationError',
          message: 'Username already taken',
          location: 'username'
        });
      }
      return User.hashPassword(password);
    })
    .then(hash => {
      return User.create({
        username,
        password: hash
      });
    })
    .then(user => {
      //send back a safe representation of the user (no passwords)
      return res.status(201).location(`/api/users/${user.id}`).json(user.apiRepr());
    })
    .catch(err => {
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({code: 500, message: 'Something went wrong'});
    });
});

//find the user, then find the performance in the user, 
//then update that performance's response property
//also need to send over all data from client

//if statement, can you find that performance object?

router.post('/responses', jsonParser,(req, res) => {
  const { id, response } = req.body;
  console.log('id: ', id, 'response: ', response);
  User.findById(id, function(err, user){
    if (err) return res.status(err.code).json(err);
    else if (!user.performance.id){
      user.performance.push({response: response.toLowerCase()});
      user.save(function (err, updatedQuestion) {
        if (err) return res.status(err.code).json(err);
        res.json(updatedQuestion);
      });
    }
    else {
      //update the object
    }
  });
  // res.json({message: 'Response info receieved'});
});

module.exports = {router};