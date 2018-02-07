'use strict';

const express = require('express');
const router = express.Router();
const passport = require('passport');
const { Question } = require('./models');
const { questionQueue, populateQueue, helpers } = require('./algorithm');

const jwtAuth = passport.authenticate('jwt', { session: false});

router.get('/dashboard', jwtAuth, (req, res) => {
  return res.json({data: 'hooray!'});
});

router.get('/questions', jwtAuth, (req, res) => {
  return Question
    .findOne()
    .then(question => {
      populateQueue(Question, questionQueue);
      console.log(questionQueue);
      res.json(question);
    });
});

router.get('/next', jwtAuth, (req, res) => {
//respond with the next question based on a peek at the queue
  return res.json(helpers.peek(questionQueue));

});

module.exports = { router };