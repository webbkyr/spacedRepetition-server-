'use strict';

const express = require('express');
const router = express.Router();
const { Question } = require('./models');

router.get('/', (req, res) => {
  return Question
    .findOne()
    .select('question')
    .then(question => {
      res.json(question);
    });
});

//fetch answer after submission?or send with question object
// router.get('/:id', (req, res))

module.exports = { router };