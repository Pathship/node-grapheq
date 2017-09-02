const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const Grapheq = require('../index.js')

const API_KEY = 'cU78k2M1kdAhyHAaMR5Bnml41f4da7UqjGmgWtIZCiske8V5Xs009e4v6OjOjnXC'

let grapheq = new Grapheq(API_KEY)

let video = fs.readFileSync(path.join(__dirname, 'videos/demo.m4v'))

grapheq.tasks.start(video, 'm4v')
  .then((task) => {
    console.log(task)
  })
