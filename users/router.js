'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const { User } = require('./models');
const { Question } = require('../questions/models');
const router = express.Router();
const jsonParser = bodyParser.json();
const { helpers, questionQueue, setQuestions } = require('../questions');

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
      return new User({
        username,
        password: hash
      });
    })
    .then(user => Question.find().then(questions => ({user, questions})))
    .then(({user, questions}) => {
      user.performance = questions.map((question, index) => ({
        word: question.question,
        answer: question.answer
      }));
      return user.save();
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

router.post('/responses', jsonParser,(req, res) => {
  const { uid, question, response } = req.body;
  // res.json(response);
  console.log(req.user)
  User.findById(uid)
    .then(user => {
      // console.log(user)
      console.log('IN POST ENDPOINT', user.head)
      user.performance.response = response;
      user.tail = (user.performance.length -1);
      console.log('IN POST ENDPOINT', user.tail)

      const answeredQuestionIndex = user.head;
      const answeredQuestion = user.performance[answeredQuestionIndex];
      console.log('ANSWERED Q', answeredQuestion)
      // if (response === user.performance[0].answer) {
      //it's correct
      // answeredQuestion.next = answeredQuestionIndex+1;
      user.head = answeredQuestion.next;
      // let tempNode = answeredQuestion;
      answeredQuestion.next = user.performance[user.tail].next;
      // user.tail = answeredQuestion;
      // user.performance[user.tail].next = answeredQuestionIndex;
      // }
      // else {
        
      // }

      return user.save();
    })
    .then(user => {
      console.log('THE NEW HEAD IN POST ENDPOINT',user.performance[user.head])
      return res.status(200).json();
    });

  // if(err) return res.status(err.code).json(err);
  // else {
  //   user.set(
  //     {'performance.0.response': response}
  //   );
  //   user.save();
  // }
  // let answered = questionQueue.first.data;
  // setQuestions(answered);
  // });
  
});

module.exports = {router};