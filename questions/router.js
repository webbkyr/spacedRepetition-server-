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

router.get('/', jwtAuth, (req, res) => {
  const user = req.user;
  User.findById(user.id)
    .then(user => {
      user.performance.forEach(question => questionQueue.enqueue(question));
      res.json(helpers.peek(questionQueue));
    });
});

router.get('/next', jwtAuth, (req, res) => {
//respond with the next question based on a peek at the queue
//get the User's record 
  return res.json(helpers.peek(questionQueue));

});

module.exports = { router };