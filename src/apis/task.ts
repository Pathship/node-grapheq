import * as Config from '../config'
import * as Stitch from '../services/stitch'
import * as path from 'path'
import * as uuid from 'node-uuid'
import * as validUrl from 'valid-url'
import * as url from 'url'
import {Readable} from 'stream'
import * as mime from 'mime-types'
import * as browser from 'detect-browser'

import {UploadsAPI} from './uploads'

import {NonExistentTaskException,GraphEQException} from '../exceptions'

class StitchReadable extends Readable {

  private limit: number = 1000
  private offset: number = 0
  private _ended: boolean = false

  constructor(private collection: string, private query: Object, private db: any, limit?: number, offset?: number) {
    super({
      objectMode: true
    })
    if (limit) this.limit = limit
    if (offset) this.offset = offset
  }

  _read() {
    if (this._ended) {
      this.push(null)
      return
    }

    this.db.collection(this.collection).find(this.query).limit(this.limit).skip(this.offset)
      .then((data) => {
        if (data.length < this.limit) {
          this._ended = true
        } else {
          this.offset += this.limit
        }

        data.forEach((datum) => {
          this.push(datum)
        })
      })
      .catch((err) => {
        this.emit('error', new GraphEQException())
      })
  }
}

class TaskReadable extends StitchReadable {
  constructor(query: Object, db: any, limit: number, offset: number) {
    super('tasks', query, db, limit, offset)
  }

  _read() {
    super._read()
  }
}

class DataReadable extends StitchReadable {
  constructor(taskId: string, db: any) {
    super('data', { _id: taskId }, db)
  }

  _read() {
    super._read()
  }
}


export class TaskAPI {

  private uploads: any
  private _client: any
  private _db: any

  constructor(private apiKey: string) {
    if (browser) {
      console.warn('We have detected that you are loading the Task API into a browser environment. It is highly recommended that you keep your API key secret and only use the Task API from a server environment!')
    }

    this.uploads = new UploadsAPI(apiKey)
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
      let db = await client.service('mongodb', 'mongodb-atlas').db(Config.MONGO_STITCH_DB_NAME)
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
    if (typeof video === 'string') {
      var key = video
    } else {
      //if ((video instanceof Buffer) || (video instanceof Readable)) {
      let signed = await this.uploads.generateUploadPolicy(contentType)
      let upload = await this.uploads.uploadVideo(video, signed)

      var key: string = upload.key
    }
    // } else if (validUrl.isWebUri(video)) {
    //   var key: string = video
    // } else {
    //   throw new Error('Input is not a file blob or a valid web-based url')
    // }

    let client = await this.client()
    let task   = await client.executeNamedPipeline('start-task', { key })

    return task.result[0]
  }

  async retry(taskId: string): Promise<any> {
    let client = await this.client()

    let item = await this.get(taskId)
    if (!item) {
      throw new NonExistentTaskException(taskId)
    }
    let key = item.key

    let task = await client.executeNamedPipeline('start-task', { key })

    return task.result[0]
  }

  async stop(taskId: string): Promise<any> {
    let client = await this.client()
    let exists = await this.exists(taskId)
    if (!exists) {
      throw new NonExistentTaskException(taskId)
    }
    await client.executeNamedPipeline('stop-task', { taskId })
    return this.get(taskId)
  }

  async exists(taskId: string): Promise<boolean> {
    let db = await this.db()
    let count = await db.collection('tasks').count({ _id: taskId })
    return count > 0
  }

  async get(taskId: string): Promise<any> {
    let db = await this.db()
    let tasks = await db.collection('tasks').find({ _id: taskId }, { limit: 1 })
    let item = tasks[0]
    return item
  }

  /**
   * Get state of single task
   */
  async state(taskId: string): Promise<string> {
    let task = await this.get(taskId)
    if (!task) {
      throw new NonExistentTaskException(taskId)
    }
    return task.state
  }

  async getAll(q?: { state?: string }, opts?: { page?: number, stream?: boolean }): Promise<any> {
    opts = opts || {}
    q = q || {}

    let limit = 10
    let skip  = limit*(opts.page || 0)

    let query = {}
    if (q.state) {
      query['state'] = q.state.toUpperCase()
    }

    let filter = { limit, skip }

    let db = await this.db()

    // if (opts.stream) {
    //   return new TaskReadable(query, db, filter.limit, filter.skip)
    // }

    return db.collection('tasks').find(query)
  }

  /**
   * Returns a readable stream for the data
   */
  async data(taskId: string): Promise<any> {
    let db = await this.db()
    // construct a new readable stream from the output
    return new DataReadable(taskId, db)
  }

}
