import * as Billing from './src/billing'
import * as Tasks from './src/tasks'
import {api} from './src/classes'

export class Grapheq {

  protected api

  constructor(protected apiKey: string, protected apiSecret: string) {
    this.api = new api(apiKey, apiSecret)
  }

  public tasks: Tasks
  public billing: Billing
}

let grapheq = new Grapheq(apiKey)

grapheq.tasks.start()
