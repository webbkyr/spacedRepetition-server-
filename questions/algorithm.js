'use strict';

class _Node {
  constructor(data) {
    this.data = data,
    this.next = null,
    this.prev = null;
  }
}

class Queue {
  constructor() {
    this.first = null,
    this.last = null;
  }
  enqueue(data) {
    const question = new _Node(data);
    if (this.first === null) {
      this.first = question;
    }
    if (this.last) {
      question.next = this.last;
      this.last.prev = question;
    }
    this.last = question;
  }

  dequeue() {
    if (this.first === null) {
      return;
    }

    const question = this.first;
    this.first = question.prev;

    if (question === this.last) {
      this.last = null;
    }
    return question.data;
  }
}

const helpers = {
  peek: queue => {
    return queue.first.data;
  },
  getCount: queue => {
    let count = 0;
    let temp = queue.first;
    while(queue.first.prev !== null) {
      queue.first.prev = temp;
      count++;
    }
    return count;
  }
};

const setQuestions = question => {
  questionQueue.dequeue();
  questionQueue.enqueue(question);
};

let questionQueue = new Queue();

module.exports = { helpers, setQuestions, questionQueue };


