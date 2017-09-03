import {TaskAPI,AuthAPI,UploadsAPI} from './src/apis/'
import * as browser from 'detect-browser'
// import * as express from 'express'

if (!browser) {
  process.on('unhandledRejection', (err) => {
    console.warn(err)
  })

  process.on('unhandledException', (err) => {
    console.warn(err)
  })
}

class Grapheq {

  private Tasks: any
  private Uploads: any
  private Auth: any

  constructor(private _apiKey?: string) {}

  set apiKey(apiKey: string) {
    this._apiKey = apiKey
  }

  // get routes() {
  //   let router = express.Router({mergeParams:true})
  //   router
  //     /**
  //      * Start upload policy
  //      */
  //     .get('/uploads/')
  //
  //   return router
  // }

  get auth() {
    if (!this.Auth)
      this.Auth = new AuthAPI()

    return this.Auth
  }

  get uploads() {
    if (!this.Uploads) {
      if (!this._apiKey) {
        throw new Error('Must provide an API Key to use the GraphEQ Tasks API')
      }

      this.Uploads = new UploadsAPI(this._apiKey)
    }

    return this.Uploads
  }

  get tasks() {
    if (!this.Tasks) {
      if (!this._apiKey) {
        throw new Error('Must provide an API Key to use the GraphEQ Tasks API')
      }

      this.Tasks = new TaskAPI(this._apiKey)
    }

    return this.Tasks
  }
}

//
// Grapheq.auth.register(username, password)
// let grapheq = new Grapheq(apiKey)
// grapheq.tasks.get()
export = Grapheq
