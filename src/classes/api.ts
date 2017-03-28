import * as request from 'request'

export default class API {

  constructor(private apiKey: string) {}

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
    return new Promise((resolve, reject) => {
      request({
        url: `${Config.BASE_API_URL}/${this.path}`,
        method,
        body,
        headers: {
          Authorization: `Bearer ${this.apiKey}`
        }
      }, (err, response, body) => {
        if (err) {
          return reject(err)
        }

        if (response.statusCode >= 400) {
          return reject(body)
        }

        resolve(body)
      })
    })
  }
}
