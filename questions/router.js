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

module.exports = { router };