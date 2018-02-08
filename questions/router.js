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
  // console.log('user', req.session)
  //create a user's session and attach the queue to the user session
  // const user = req.user;
  // User.findById(user.id)
  //   .then(user => {
  //     user.performance.forEach(question => questionQueue.enqueue(question));
  //     // console.log('USER QUESTION QUEUE', questionQueue)
  //     return res.json(helpers.peek(questionQueue));
  //   })
  //   .catch(err => {
  //     res.status(500).json({code: 500, message: 'Something went wrong'});
  //   });
  User.findById(req.user.id) 
    .then(user => {
      // console.log('IN QUESTIONS ENDPOINT', user.head)
      res.json(user.performance[user.head]);
    });
});

router.get('/next', jwtAuth, (req, res) => {
  // console.log('Next question', questionQueue.first.data);
  // res.json(helpers.peek(questionQueue));
  //return the next word in perf arr
  User.findById(req.user.id) 
    .then(user => {
      // console.log('USER HEAD IN NEXT ENDPOINT>>>>>>', user.head)
      res.json(user.performance[user.head]);
    });
});

router.post('/responses', jwtAuth, jsonParser,(req, res) => {
  const { uid, question, response } = req.body;
  // res.json(response);
  console.log(req.user);
  User.findById(req.user.id)
    .then(user => {
      // console.log(user)
      user.performance.response = response;
      user.tail = (user.performance.length -1);
      console.log('TAIL', user.tail);

      const answeredQuestionIndex = user.head;
      const answeredQuestion = user.performance[answeredQuestionIndex];
      console.log('ANSWERED Q', answeredQuestion);

      if (user.head >= user.tail) {
        user.head = 0;
      }
      else {
        user.head = user.head+1;
      }
      console.log('HEAD', user.head);

      answeredQuestion.next = user.tail;

      return user.save();
    })
    .then(user => {
      console.log('THE NEW HEAD IN POST ENDPOINT',user.performance[user.head]);
      return res.status(200).json();
    });
});

module.exports = { router };