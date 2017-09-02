import * as Promise from 'bluebird'

import * as Config from '../config'
import * as Stitch from '../services/stitch'

import * as path from 'path'
import * as uuid from 'node-uuid'
import * as validUrl from 'valid-url'
import * as url from 'url'
import * as mime from 'mime-types'
import * as request from 'request-promise'
import * as browser from 'detect-browser'
import {UploadsAPI} from './uploads'

export class TaskAPI {

  private stitch: any
  private db: any
  private uploads: any

  constructor(private apiKey: string) {
    if (browser) {
      console.warn('We have detected that you are loading the Task API into a browser environment. It is highly recommended that you keep your API key secret and only use the Task API from a server environment!')
    }

    this.stitch = Stitch.client.authenticate('apiKey', apiKey)
    this.db = this.stitch.service('mongodb', 'mongodb-atlas').db('grapheq')
    this.uploads = new UploadsAPI()
  }

  /**
   * Start a new task with the video key
   * If the video is a blob, upload and start
   * If the video is a string, validate the url and start the task
   */
  start(video: Blob | string): Promise<any> {
    if (video instanceof Blob) {
       var promise: Promise<string> = this.uploads.generateUploadPolicy(video.type)
        .then((signed) => {
          return this.uploads.uploadVideo(video, signed)
        })
        .then((upload) => {
          return upload.key
        })
    } else if (validUrl.isWebUri(video)) {
      var promise: Promise<string> = Promise.resolve(video)
    } else {
      throw new Error('Input is not a file blob or a valid web-based url')
    }

    return promise.then((key: string) => {
      return this.stitch.executeNamedPipeline('start-task', { key })
    })
    .then((task) => {
      console.log(task)
      return task
    })
  }

  retry(taskId: string): Promise<any> {
    return this.stitch.executeNamedPipeline('retry-task', { taskId })
  }

  stop(taskId: string): Promise<any> {
    return this.stitch.executeNamedPipeline('stop-task', { taskId })
  }

  get(taskId: string): Promise<any> {
    return this.db.collection('tasks').find({ _id: taskId }, { limit: 1 })
      .then((tasks) => {
        return tasks[0]
      })
  }

  getAll({ state, page }: { state?: string, page?: number }): any {
    let limit = 100
    let skip  = limit*(page || 0)

    let query = {}
    if (state) {
      query['state'] = state.toUpperCase()
    }

    return this.db.collection('tasks').find(query, { limit, skip })
  }

  /**
   * Get state of single task
   */
  state(taskId: string): Promise<string> {
    return this.get(taskId).then((task) => {
      return task && task.state
    })
  }

  /**
   * Returns a readable stream for the data
   */
  data(taskId: string): any {
    return this.db.collection('data').find({ _id: taskId })
  }

}
