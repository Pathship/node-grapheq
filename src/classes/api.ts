import * as request from 'request-promise'
import * as moment from 'moment'

export default class API {

  // the temporary api token
  private token: string
  private audience: string = 'https://api.grapheq.com'
  private tokenExpiresIn: Date

  constructor(private apiKey: string, private apiSecret: string) {}

  get tokenExpired() {
    if (!this.token) {
      return true
    }

    return moment().isAfter(this.tokenExpiresIn)
  }

  get(path) {
    return this.call('GET', path)
  }

  post(path, body) {
    return this.call('POST', path, body)
  }

  put(path, body) {
    return this.call('PUT', path, body)
  }

  delete(path, body) {
    return this.call('DELETE', path, body)
  }

  call(method, path, body) {
    let promise
    // if we don't have a token
    // get a temporary one from a client credentials grant
    if (!this.tokenExpired) {
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
        this.tokenExpiresIn = moment().add(body.expires_in, 'seconds').toDate()
        return body.access_token
      })
    } else {
      promise = Promise.resolve(this.token)
    }

    promise.then((token) => {
      return request({
        url: `${Config.BASE_API_URL}/${this.path}`,
        method,
        body,
        json: true,
        headers: {
          'X-API-KEY': this.apiKey,
          'X-API-SECRET': this.apiSecret,
          'Authorization': `Bearer ${token}`
        }
      })
    })
  }
}
