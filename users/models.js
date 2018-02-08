'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.Promise = global.Promise;

const UserSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  performance: [{
    word: {
      type: String,
      required: true
    },
    answer: {
      type: String,
      required: true
    },
    response: { 
      type: String,
      default: null
    },
    correctCount: { type: Number, default: 0 },
    next: { type: Number, default: null},
    prev: Number
  }],
  head: { type: Number, default: 0},
  tail: Number
  
});

//performance is an array with node objects containing info about the word/response/correct  

UserSchema.methods.apiRepr = function(){
  return {
    id: this._id,
    username: this.username
  };
};

UserSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

UserSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
};


const User = mongoose.model('User', UserSchema);

module.exports = { User };