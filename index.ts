import {TaskAPI,AuthAPI,UploadsAPI} from './src/apis/'
import * as browser from 'detect-browser'

class Grapheq {
  constructor(private _apiKey?: string) {}

  set apiKey(apiKey: string) {
    this._apiKey = apiKey
  }

  get auth() {
    return new AuthAPI()
  }

  get uploads() {
    return new UploadsAPI()
  }

  get tasks() {
    if (!this._apiKey) {
      throw new Error('Must provide an API Key to use the GraphEQ Tasks API')
    }

    return new TaskAPI(this._apiKey)
  }
}

//
// Grapheq.auth.register(username, password)
// let grapheq = new Grapheq(apiKey)
// grapheq.tasks.get()
export = Grapheq
