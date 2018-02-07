'use strict';

const express = require('express');
const router = express.Router();
const passport = require('passport');
const { Question } = require('./models');
const { Queue, questionQueue, populateQueue, helpers } = require('./algorithm');

let q = new Queue();

const jwtAuth = passport.authenticate('jwt', { session: false});

router.get('/dashboard', jwtAuth, (req, res) => {
  return res.json({data: 'hooray!'});
});

router.get('/questions', jwtAuth, (req, res) => {
  Question.find()
    .then(questions => {
      questions.forEach(question => questionQueue.enqueue(question));
      res.json(helpers.peek(questionQueue));
    });
});

router.get('/next', jwtAuth, (req, res) => {
//respond with the next question based on a peek at the queue
  return res.json(helpers.peek(questionQueue));

});

module.exports = { router };