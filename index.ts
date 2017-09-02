import {TaskAPI,AuthAPI} from './src/apis/'

class Grapheq {
  constructor(private _apiKey?: string) {}

  get auth() {
    return new AuthAPI()
  }

  set apiKey(apiKey: string) {
    this._apiKey = apiKey
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
