'use strict';



class _Node{
  constructor(question) {
    this.question = question,
    this.next = null;
    this.prev = null;
  }
}
//<--1 <---2, <---3
class Queue {
  constructor() {
    this.first = null;
    this.last = null;
  }

  enqueue(question) {
    const node = new _Node(question);

    if (this.first === null) {
      this.first = node;
    }

    if (this.last) {
      node.next = this.last;
      this.last.prev = node;
    }
    this.last = node;
  }

  dequeue() {
    if (this.first === null) {
      return;
    }

    const node = this.first;
    this.first = node.prev;

    if (node === this.last) {
      this.last = null;
    }
    return node.question;
  }
}