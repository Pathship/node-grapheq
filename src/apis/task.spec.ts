import {TaskAPI} from './task'
import {expect} from 'chai'
import {NonExistentTaskException} from '../exceptions'
import * as uuid from 'node-uuid'

describe('TaskAPI', () => {

  let taskAPI: TaskAPI
  let apiKey: string = "k95VzZDltcM1W0x79WZZm0CCT81S4RPoknSFKsVAGG8qXud0SKzH17eOUuIZyWwi"

  let key: string = 'dd7b7a9a-d46c-4370-86d2-18c9e0452166.m4v'
  let contentType: string = 'm4v'

  beforeEach(() => {
    taskAPI = new TaskAPI(apiKey)
  })

  describe('start', () => {
    describe('When passing in an existing AWS S3 key as the video parameter', () => {
      it('should create a new task for that video', async () => {
        let task = await taskAPI.start(key, contentType)
        expect(task).to.be.ok
        expect(task).to.have.property('_id')
        expect(task).to.have.property('owner_id')
        expect(task).to.have.property('key', key)
        expect(task).to.have.property('billed_minutes', 0)
        expect(task).to.have.property('state', 'PENDING')
      })
    })
  })

  describe('stop', () => {
    describe('when the task does not exist', () => {
      it('should throw a NonExistentTaskException', async () => {
        try {
          let stoppedTask = await taskAPI.stop(uuid.v4())
          throw new Error('Stopping non-existent task was meant to fail!')
        } catch(err) {
          expect(err.name).to.equal('NonExistentTaskException')
        }
      })
    })

    describe('when the task exists', () => {
      var task

      beforeEach(async () => {
        task = await taskAPI.start(key, contentType)
      })

      it('should stop the task', async () => {
        let stoppedTask = await taskAPI.stop(task._id)
        expect(stoppedTask).to.be.ok
        expect(stoppedTask).to.have.property('_id')
        expect(String(stoppedTask._id)).to.equal(String(task._id))
        expect(stoppedTask).to.have.property('owner_id', task.owner_id)
        expect(stoppedTask).to.have.property('key', key)
        expect(stoppedTask).to.have.property('billed_minutes', 0)
        expect(stoppedTask).to.have.property('state', 'CANCELLED')
      })
    })
  })

  describe.only('getAll', () => {
    it('should return tasks as a readable stream', async () => {
      let tasks = await taskAPI.getAll({}, { stream: true })
      console.log(tasks)
      return tasks
    })
  })

  describe('data', () => {
    it('should return the task data as a readable stream', () => {
      return new Promise(async (resolve, reject) => {
        let dataStream = await taskAPI.data(uuid.v4())

        // console.log(dataStream)
        dataStream
          .on('data', (datum) => {
            console.log(datum)
          })
          .on('end', () => {
            console.log('ended!')
            return resolve()
          })
          .on('error', (err) => {
            console.log(err)
            return reject(err)
          })
      })
    })
  })

})
