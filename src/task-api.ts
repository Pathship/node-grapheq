import {BaseAPI} from './base-api'
import * as Promise from 'bluebird'
import {TaskInstance} from './task-instance'

export class TaskAPI extends BaseAPI {

  constructor(apiKey: string, apiSecret: string) {
    super(apiKey, apiSecret)
  }

  start(videoUrl: string, videoPathSignature?: string): Promise<TaskInstance> {
    return super.post('/tasks', { videoUrl, videoPathSignature })
      .then((task) => {
        return new TaskInstance(task, this.apiKey, this.apiSecret)
      })
  }

  get(taskId: string): Promise<TaskInstance> {
    return super.get(`/tasks/${taskId}`).then((task) => {
      return new TaskInstance(task, this.apiKey, this.apiSecret)
    })
  }

  getAll(): Promise<Array<TaskInstance>> {
    return super.get(`/tasks`).then((tasks: any) => {
      return tasks.map((task) => { return new TaskInstance(task, this.apiKey, this.apiSecret) })
    })
  }


}
