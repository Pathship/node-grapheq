import api from './api'
import {TaskInterface} from '../interfaces'

export class Task implements TaskInterface {

  constructor(private task, apiKey: string, apiSecret: string) {
    this.api = new api(apiKey, apiSecret)
  }

  get _id() {
    return this.task._id
  }

  get state() {
    return this.task.state
  }

  get createdBy() {
    return this.task.createdBy
  }

  get videoUrl() {
    return this.task.videoUrl
  }

  get meetingId() {
    return this.task.meetingId
  }

  get maximumMinutes() {
    return this.task.maximumMinutes
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

  get rawS3Path() {
    return this.task.rawS3Path
  }

  private set state(state) {
    this.task.state = state
  }

  stop(): Promise<TaskInterface> {
    return this.api.post(`/tasks/${this._id}/stop`)
      .then((task) => {
        this.state = task.state
        return task
      })
  }

  status(): Promise<string> {
    return this.state
  }

  data(): Promise<any> {
    return this.api.get(`/tasks/${this._id}/data`)
  }
}
