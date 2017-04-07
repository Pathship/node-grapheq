import {TaskAPI} from './src/task-api'

class Grapheq {
  private tasks
  constructor(private apiKey: string, private apiSecret: string) {
    this.tasks = new TaskAPI(apiKey, apiSecret)
  }
}

export = Grapheq
