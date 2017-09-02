import * as Promise from 'bluebird'

import * as Config from '../config'
import * as Stitch from '../services/stitch'

import * as path from 'path'
import * as uuid from 'node-uuid'
import * as validUrl from 'valid-url'
import * as url from 'url'
import * as mime from 'mime-types'
import * as request from 'request-promise'

export class UploadsAPI {

  private client: any
  private s3: any

  constructor() {
    this.client = Stitch.client.anonymousAuth()
  }

  /**
   * Generate an upload policy
   */
  generateUploadPolicy(contentType: string): Promise<{ signature: string, policy: string, accessKeyId: string, key: string }> {
    let uuidv4: string = uuid.v4()
    let ext = mime.extension(contentType)
    let key: string = `${uuidv4}${ext}`
    let s3 = this.client.service('aws/s3', 'uploads')

    return s3.signPolicy({
      contentType,
      key,
      acl: 'private',
      bucket: `${Config.AWS_BUCKET}`
    }).then((signed) => {
      signed.key = key
      return signed
    })
  }

  /**
   * Upload video to S3 bucket
   */
  uploadVideo(file: Blob, signed: { signature: string, policy: string, accessKeyId: string, key: string }): Promise<{ key: string }> {
    let hostname: string = `${Config.AWS_BUCKET}.s3.amazonaws.com/`
    let endpoint: string = url.format({ protocol: 'https', hostname })

    let formData = new FormData()
    formData.append('key', signed.key)
    formData.append('policy', signed.policy)
    formData.append('x-amz-signature', signed.signature)
    formData.append('x-amz-algorithm', 'AWS4-HMAC-SHA256')
    formData.append('x-amz-server-side-encryption', 'AES256')
    formData.append('x-amz-credential', `${signed.accessKeyId}/${Config.AWS_ACCOUNT_ID}/${Config.AWS_DEFAULT_REGION}/s3/aws4_request`)
    formData.append('file', file)

    return request.post(endpoint, formData)
      .then(() => {
        return { key: signed.key }
      })
  }

}
