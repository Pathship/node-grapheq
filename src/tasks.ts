import {Task} from './classes'

export const start = (videoUrl: string, videoPathSignature?: string): Promise<Task> => {
  return this.api.post('/tasks', { videoUrl, videoPathSignature })
    .then((task) => {
      return new Task(task, this.apiKey, this.apiSecret)
    })
}

export const get = (taskId: string): Promise<Task> => {
  return this.api.get(`/tasks/${taskId}`).then((task) => {
    return new Task(task, this.apiKey, this.apiSecret)
  })
}

export const getAll = (): Promise<Array<Task>> => {
  return this.api.get(`/tasks`).then((tasks) => {
    return tasks.map((task) => { return new Task(task, this.apiKey, this.apiSecret) })
  })
}
