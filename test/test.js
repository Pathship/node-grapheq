let crypto = require('crypto')
let Grapheq = require('../index.js')

let apiKey = '0aOVjtw6iGgs3g7nI923r9RmpGcH5htf'
let apiSecret = 'rjFv6rUlDG4h5EYQ6KvhaBHh-uQ938NIdve8uzBzQfKoCuUUm8I3i3HSg9tKVCzq'
let grapheq = new Grapheq(apiKey, apiSecret)

let videoPath = 'bill.mp4'
let videoPathSignature = crypto.createHmac('sha256', 'P6ye3DXM2PHiQ6l8wJ5M2Ge9iTNawKli').update(videoPath).digest('hex')

console.log(videoPathSignature)

grapheq.tasks.start(videoPath, videoPathSignature)
  .then((task) => {
    console.log(task)
  })
