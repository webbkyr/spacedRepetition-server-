'use strict';

const express = require('express');
const router = express.Router();
const passport = require('passport');
const { User } = require('../users/models');
const { questionQueue, helpers } = require('./algorithm');

const jwtAuth = passport.authenticate('jwt', { session: false});

router.get('/dashboard', jwtAuth, (req, res) => {
  return res.json({data: 'hooray!'});
});

router.get('/questions', jwtAuth, (req, res) => {
  const user = req.user;
  User.findById(user.id)
    .then(user => {
      user.performance.forEach(question => questionQueue.enqueue(question));
      // console.log(questionQueue)
      return res.json(helpers.peek(questionQueue));
    })
    .catch(err => {
      res.status(500).json({code: 500, message: 'Something went wrong'});
    });
  // console.log('INSIDE QUESTIONS',questionQueue);
  //not null inside questions when you hit questions endpoint
});

router.get('/next', jwtAuth, (req, res) => {
  // console.log('INSIDE NEXT', questionQueue);
  //not null when you hit the next endpoint
  // questionQueue.dequeue();
  res.json(helpers.peek(questionQueue));
});

module.exports = { router };