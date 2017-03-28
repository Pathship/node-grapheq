import * as validurl from 'valid-url'
import {UploadPolicy} from './interfaces'
import {Task} from './classes'

export const start = (pathOrUrl: string): Promise<Task> => {
  let promise = Promise.resolve(pathOrUrl)
  // if we don't have a url, upload to s3
  if (!validurl.isUri(pathOrUrl)) {
    let promise: Promise<UploadPolicy> = api.get(`/upload/policy?fileName=${pathToFile}`)
      .then((uploadPolicy: UploadPolicy) => {
        // upload to s3
        // return the path or url
      })
  }

  promise.then((videoUrl) => {
    return this.api.post('/tasks', { videoUrl })
  }).then((task) => {
    return new Task(task, this.apiKey)
  })
}

export const get = (taskId: string): Promise<Task> => {
  return this.api.get(`/tasks/${taskId}`).then((task) => {
    return new Task(task, this.apiKey)
  })
}

export const getAll = (): Promise<Array<Task>> => {
  return this.api.get(`/tasks`).then((tasks) => {
    return tasks.map((task) => { return new Task(task, this.apiKey) })
  })
}
