# GraphEQ Node.js SDK

Welcome to the GraphEQ Node.js SDK!

Native integrations with express and browser applications are coming soon!

### Description

This library allows you to integrate GraphEQ into your server-side Node.js applications. It is _highly_ recommended that you use this from the server, and not the browser. Using this library in a client-side environment will expose your API key to the public!

### Tutorial

#### Installing the library

```bash
npm install --save node-grapheq
```

#### Get an API Key

Your API keys will appear in your GraphEQ dashboard: https://grapheq.com/dashboard/. Since we are currently in beta, we have turned off the ability to generate or modify API keys.

### Usage

The first thing you want to do is to instantiate a new `grapheq` instance using your API key:
````typescript
import * as Grapheq from 'node-grapheq'

let grapheq = new Grapheq(process.env.API_KEY)
````

For example, you can create a `services/grapheq.ts` file and load that into your application:

```typescript
// src/services/grapheq.ts

import * as Grapheq from 'node-grapheq'

export default new Grapheq(process.env.API_KEY)
```

```typescript
// src/routes/index.ts

import * as express from 'express'
import * as grapheq from '../services/grapheq'

let router = express.Router()

router
  .get('/my/get/tasks/route', async (req: express.Request, res: express.Response: next: express.NextFunction) => {
    let taskStream = await grapheq.tasks.getAll({ state: 'RUNNING', limit: 1, offset: 5 })

    taskStream
      .on('data', (task) => {
        res.write(JSON.stringify(task))
      })
      .on('end', () => {
        res.end()
      })
    
    res.status(200).send(taskStream)
  })
  .get('/my/get/task/data/route' , (req: express.Request, res: express.Response: next: express.NextFunction) => {
    let dataStream = grapheq.tasks.data(req.params.taskId)

    dataStream
      .on('data', (task) => {
        res.write(JSON.stringify(task))
      })
      .on('end', () => {
        res.end()
      })
  })

export default router

```
