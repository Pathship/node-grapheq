import * as request from 'request-promise'
import * as moment from 'moment'
import * as Promise from 'bluebird'
import * as Config from './config'

export class BaseAPI {
  constructor(protected apiKey: string) {}

  protected get(path: string) {
    return this.call('GET', path)
  }

  protected post(path: string, body?: Object) {
    return this.call('POST', path, body)
  }

  protected put(path: string, body?: Object) {
    return this.call('PUT', path, body)
  }

  protected delete(path: string, body?: Object) {
    return this.call('DELETE', path, body)
  }

  call(method: string, path: string, body?: Object): Promise<any> {
    body = body || {}
    let promise
    // if we don't have a token
    // get a temporary one from a client credentials grant
    if (this.tokenExpired) {
      promise = request({
        url: 'https://grapheq.auth0.com/oauth/token',
        method: 'POST',
        json: true,
        body: {
          grant_type: 'client_credentials',
          client_id: this.apiKey,
          client_secret: this.apiSecret,
          audience: this.audience
        }
      })
      .then((body) => {
        console.log(body)
        this.tokenExpiresIn = moment().add(body.expires_in, 'seconds').toDate()
        return body.access_token
      })
    } else {
      promise = Promise.resolve(this.token)
    }

    return promise.then((token) => {
      console.log(token)
      return request({
        url: `${Config.GRAPHEQ_API_URL}${path}`,
        method,
        body,
        json: true,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
    })
  }
}
