import * as Config from '../config'
import * as Stitch from '../services/stitch'
import * as path from 'path'
import * as uuid from 'node-uuid'
import * as Bluebird from 'bluebird'
import {Readable} from 'stream'
import * as validUrl from 'valid-url'
import * as url from 'url'
import * as mime from 'mime-types'
import * as request from 'request'

export class UploadsAPI {

  private _client: any
  private s3: any

  constructor(private apiKey: string) {}

  async client(): Promise<any> {
    if (!this._client) {
      await Stitch.client.authenticate('apiKey', this.apiKey)
      this._client = Stitch.client.service('aws/s3', 'upload')
    }

    return this._client
  }

  /**
   * Generate an upload policy
   * @param ext The file extension. Used to determine the required content-type
   */
  async generateUploadPolicy(ext: string): Promise<{ contentType: string, signature: string, policy: string, accessKeyId: string, key: string }> {
    let uuidv4: string = uuid.v4()
    let contentType = mime.lookup(ext)
    let key: string = `${uuidv4}.${ext}`

    let s3 = await this.client()
    let signed = await s3.signPolicy(Config.AWS_BUCKET, key, 'private', contentType)

    let result = signed.result[0]
    result.key = key
    result.contentType = contentType
    return result
  }

  /**
   * Upload video to S3 bucket
   * @param fileStream A readable stream (if using nodejs) or a blob (if using browser) representing the file to be uploaded
   */
  async uploadVideo(fileStream: Readable | Blob, signed: { contentType: string, signature: string, policy: string, accessKeyId: string, key: string }): Promise<any> {
    let hostname: string = `${Config.AWS_BUCKET}.s3.amazonaws.com`
    let endpoint: string = url.format({ protocol: 'https', hostname })

    return new Bluebird((resolve, reject) => {
      let req = request({
        method: 'put',
        uri: `${endpoint}/${signed.key}`,
        headers: {
          'Content-Type': signed.contentType
        },
        formData: {
          'file': fileStream,
          // 'key': signed.key,
          'policy': signed.policy,
          'x-amz-signature': signed.signature,
          'x-amz-algorithm': 'AWS4-HMAC-SHA256',
          'x-amz-server-side-encryption': 'AES256',
          'x-amz-credential': `${signed.accessKeyId}/${Config.AWS_ACCOUNT_ID}/${Config.AWS_DEFAULT_REGION}/s3/aws4_request`
        }
      }, (err, response, body) => {
        console.log('Finished uploading!')
        if (err) {
          return reject(err)
        }

        return resolve({ key: signed.key })
      })
      // .on('drain', () => {
      //   console.log()
      //   console.log('new chunk uploaded!')
      // })
    })
  }

}
