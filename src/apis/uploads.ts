import * as Config from '../config'
import * as Stitch from '../services/stitch'
import * as path from 'path'
import * as uuid from 'node-uuid'
import {Readable} from 'stream'
import * as validUrl from 'valid-url'
import * as url from 'url'
import * as mime from 'mime-types'
import * as request from 'request-promise'

export class UploadsAPI {

  private _client: any
  private s3: any

  constructor() {}

  async client(): Promise<any> {
    if (!this._client) {
      let client = await Stitch.client.anonymousAuth()
      this._client = Stitch.client.service('aws/s3', 'uploads')
    }

    return this._client
  }

  /**
   * Generate an upload policy
   * @param ext The file extension. Used to determine the required content-type
   */
  async generateUploadPolicy(ext: string): Promise<{ signature: string, policy: string, accessKeyId: string, key: string }> {
    let uuidv4: string = uuid.v4()
    let contentType = mime.lookup(ext)
    let key: string = `${uuidv4}.${ext}`

    let s3 = await this.client()
    let signed = await s3.signPolicy(Config.AWS_BUCKET, key, 'private', contentType)

    let result = signed.result[0]
    result.key = key
    return result
  }

  /**
   * Upload video to S3 bucket
   * @param fileStream A readable stream (if using nodejs) or a blob (if using browser) representing the file to be uploaded
   */
  async uploadVideo(fileStream: Readable | Blob, signed: { signature: string, policy: string, accessKeyId: string, key: string }): Promise<{ key: string }> {
    let hostname: string = `${Config.AWS_BUCKET}.s3.amazonaws.com/`
    let endpoint: string = url.format({ protocol: 'https', hostname })

    let resp = await request({
      method: 'post',
      uri: endpoint,
      json: true,
      form: {
        'key': signed.key,
        'policy': signed.policy,
        'x-amz-signature': signed.signature,
        'x-amz-algorithm': 'AWS4-HMAC-SHA256',
        'x-amz-server-side-encryption': 'AES256',
        'x-amz-credential': `${signed.accessKeyId}/${Config.AWS_ACCOUNT_ID}/${Config.AWS_DEFAULT_REGION}/s3/aws4_request`
      }
    })

    return { key: signed.key }
  }

}
