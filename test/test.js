let apiKey = '0aOVjtw6iGgs3g7nI923r9RmpGcH5htf'
let apiSecret = 'rjFv6rUlDG4h5EYQ6KvhaBHh-uQ938NIdve8uzBzQfKoCuUUm8I3i3HSg9tKVCzq'

let Grapheq = require('../index.js')
let grapheq = new Grapheq(apiKey, apiSecret)

console.log(grapheq)
grapheq.tasks.start('bill.mp4')
  .then((task) => {
    console.log(task)
  })
