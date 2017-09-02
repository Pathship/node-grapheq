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

  private uploads: any
  private _client: any
  private _db: any

  constructor(private apiKey: string) {
    if (browser) {
      console.warn('We have detected that you are loading the Task API into a browser environment. It is highly recommended that you keep your API key secret and only use the Task API from a server environment!')
    }

    this.uploads = new UploadsAPI()
  }

  async client(): Promise<any> {
    if (!this._client) {
      await Stitch.client.authenticate('apiKey', this.apiKey)
      this._client = Stitch.client
    }

    return this._client
  }

  async db(): Promise<any> {
    if (!this._db) {
      let client = await this.client()
      let db = await client.service('mongodb', 'mongodb-atlas').db('grapheq')
      this._db = db
    }

    return this._db
  }

  /**
   * Start a new task with the video key
   * If the video is a blob, upload and start
   * If the video is a string, validate the url and start the task
   */
  async start(video: Buffer | string, contentType: string): Promise<any> {
    if (video instanceof Buffer) {
      let signed = await this.uploads.generateUploadPolicy(contentType)
      let upload = await this.uploads.uploadVideo(video, signed)

      var key: string = upload.key
    } else if (validUrl.isWebUri(video)) {
      var key: string = video
    } else {
      throw new Error('Input is not a file blob or a valid web-based url')
    }

    let client = await this.client()
    let task   = await client.executeNamedPipeline('start-task', { key })

    console.log(task)
    return task
  }

  async retry(taskId: string): Promise<any> {
    let client = await this.client()
    return client.executeNamedPipeline('retry-task', { taskId })
  }

  async stop(taskId: string): Promise<any> {
    let client = await this.client()
    return client.executeNamedPipeline('stop-task', { taskId })
  }

  async get(taskId: string): Promise<any> {
    let db = await this.db()
    let tasks = await db.collection('tasks').find({ _id: taskId }, { limit: 1 })
    return tasks[0]
  }

  async getAll({ state, page }: { state?: string, page?: number }): Promise<any> {
    let limit = 100
    let skip  = limit*(page || 0)

    let query = {}
    if (state) {
      query['state'] = state.toUpperCase()
    }

    let db = await this.db()
    return db.collection('tasks').find(query, { limit, skip })
  }

  /**
   * Get state of single task
   */
  async state(taskId: string): Promise<string> {
    let task = await this.get(taskId)
    return task && task.state
  }

  /**
   * Returns a readable stream for the data
   */
  async data(taskId: string): Promise<any> {
    let db = await this.db()
    return db.collection('data').find({ _id: taskId })
  }

}
