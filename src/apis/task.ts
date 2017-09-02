import * as Promise from 'bluebird'

import * as Config from '../config'
import * as Stitch from '../services/stitch'

import * as path from 'path'
import * as uuid from 'node-uuid'
import * as validUrl from 'valid-url'
import * as url from 'url'
import * as mime from 'mime-types'
import * as request from 'request-promise'

export class TaskAPI {

  private stitch: any
  private db: any
  private s3: any

  constructor(private apiKey: string) {
    this.stitch = Stitch.client.authenticate('apiKey', apiKey)
    this.db = this.stitch.service('mongodb', 'mongodb-atlas').db('grapheq')
  }

  start(video: Blob): Promise<any> {
    // start createTask pipeline
    // if the video is a qualified url, just start the task without uploading
    // otherwise, generate an S3 policy first

    // if we have a blob, upload that
    if (!(video instanceof Blob))
      throw new Error('You must pass either a video Blob, or a valid web-based URL!')

    let uuidv4: string = uuid.v4()
    let contentType: string = video.type
    let key: string = `${uuidv4}${ext}`
    let ext = mime.extension(contentType)

    let s3 = this.stitch.service('aws/s3', 'uploads')

    return s3.signPolicy({
      contentType,
      key,
      acl: 'private',
      bucket: `${Config.AWS_BUCKET}`
    }).then((signed) => {
      let fd = new FormData()

      fd.append('file', <Blob> video)
      fd.append('key', key)
      fd.append('file', video)
      fd.append('policy', signed.policy)
      fd.append('x-amz-signature', signed.signature)
      fd.append('x-amz-algorithm', 'AWS4-HMAC-SHA256')
      fd.append('x-amz-server-side-encryption', 'AES256')
      fd.append('x-amz-credential', `${signed.accessKeyId}/${Config.AWS_ACCOUNT_ID}/${Config.AWS_DEFAULT_REGION}/s3/aws4_request`)

      let hostname: string = `${Config.AWS_BUCKET}.s3.amazonaws.com/`
      let endpoint: string = url.format({ protocol: 'https', hostname })

      return request.post(endpoint, fd)
    })
    .then(() => {
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
    return this.db.collection('tasks').findOne({ _id: taskId })
  }

  getAll(): any {
    return this.db.collection('tasks').find({})
  }

  status(taskId: string): Promise<string> {
    return this.get(taskId).then((task) => {
      return task && task.status
    })
  }

  /**
   * Returns a readable stream for the data
   */
  data(taskId: string): any {
    return this.db.collection('data').find({ _id: taskId })
  }

}
