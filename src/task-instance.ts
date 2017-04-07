import {BaseAPI} from './base-api'
import * as Promise from 'bluebird'

interface TaskInterface {
  _id: string
  teamId: string
  state: string
  videoUrl: string
  billedMinutes: number
  createdAt: Date
  cancelledAt: Date
  updatedAt: Date
  finishedAt: Date

  toJSON(): Object
  stop(): Promise<TaskInterface>
  data(): Promise<any>
}

export class TaskInstance extends BaseAPI implements TaskInterface {

  private task

  constructor(task, apiKey: string, apiSecret: string) {
    super(apiKey, apiSecret)
    this.task = task
  }

  get _id() {
    return this.task._id
  }

  get state() {
    return this.task.state
  }

  get teamId() {
    return this.task.createdBy
  }

  get videoUrl() {
    return this.task.videoUrl
  }

  get billedMinutes() {
    return this.task.billedMinutes
  }

  get createdAt() {
    return this.task.createdAt
  }

  get updatedAt() {
    return this.task.updatedAt
  }

  get cancelledAt() {
    return this.task.cancelledAt
  }

  get finishedAt() {
    return this.task.finishedAt
  }

  set state(state) {
    this.task.state = state
  }

  toJSON() {
    return {
      _id: this.task._id,
      state: this.task.state,
      teamId: this.task.teamId,
      videoUrl: this.task.videoUrl,
      billedMinutes: this.task.billedMinutes,
      createdAt: this.task.createdAt,
      updatedAt: this.task.updatedAt,
      cancelledAt: this.task.cancelledAt,
      finishedAt: this.task.finishedAt
    }
  }

  stop(): Promise<any> {
    return super.post(`/tasks/${this._id}/stop`)
      .then((task) => {
        this.state = task['state']
        return task
      })
  }

  data(): Promise<any> {
    return super.get(`/tasks/${this._id}/data`)
  }

}
