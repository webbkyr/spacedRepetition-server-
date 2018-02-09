'use strict';

const express = require('express');
const router = express.Router();
const passport = require('passport');
const { User } = require('../users/models');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const { questionQueue, helpers } = require('./algorithm');

const jwtAuth = passport.authenticate('jwt', { session: false});

router.get('/dashboard', jwtAuth, (req, res) => {
  return res.json({data: 'hooray!'});
});

router.get('/questions', jwtAuth, (req, res) => {
 
  User.findById(req.user.id) 
    .then(user => {
      res.json(user.performance[user.head]);
    });
});

router.get('/next', jwtAuth, (req, res) => {
  User.findById(req.user.id) 
    .then(user => {
      // console.log('USER HEAD IN NEXT ENDPOINT>>>>>>', user.head)
      res.json(user.performance[user.head]);
    });
});

router.post('/responses', jwtAuth, jsonParser, (req, res) => {
  const { response } = req.body;
  User.findById(req.user.id)
    .then(user => {
      user.performance.response = response;
      user.tail = (user.performance.length -1);

      const answeredQuestionIndex = user.head;
      const answeredQuestion = user.performance[answeredQuestionIndex];

      let assignNextPointer = 1;
      let assignPrevPointer = 0;

      for (let i=0; i <= user.tail; i++) {
        if (user.performance[i] === user.tail) {
          user.performance[i].next = user.head;
        }
        else {
          user.performance[i].next = assignNextPointer++;
        }
        if (user.performance[i] === user.head) {
          user.performamce[i].prev = user.tail;
        }
        else {
          user.performance[i].prev = assignPrevPointer++;
        }
      }

      console.log(user.performance);

      user.head = answeredQuestion.next;

      // if (user.head >= user.tail) {
      //   user.head = 0;
      // }
      // else {
      //   user.head = answeredQuestion.next;
      // }

      if (answeredQuestion.answer === response) {
        answeredQuestion.correctCount++; 
      }
      else {
        // 0 1 0 2 3
        let rightSpotIndex = user.performance[user.head].next;
        user.performance[rightSpotIndex].prev = answeredQuestionIndex;
        rightSpotIndex.next = answeredQuestionIndex;
        
        // user.head = answeredQuestionIndex-1;
      }

      console.log(user.performance[user.head]);
    

      // answeredQuestion.next = user.tail;

      return user.save();
    })
    .then(user => {
      console.log('THE NEW HEAD IN POST ENDPOINT',user.performance[user.head]);
      return res.status(200).json();
    });
});

module.exports = { router };