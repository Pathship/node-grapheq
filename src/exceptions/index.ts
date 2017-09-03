export class NonExistentTaskException extends Error {

  constructor(taskId: string) {
    let message = `The task with id ${taskId} does not exist`
    super(message)
    this.name = 'NonExistentTaskException'
  }

}

export class GraphEQException extends Error {

  constructor() {
    let message = 'Sorry! There was a GraphEQ exception!'
    super(message)
    this.name = 'GraphEQ Exception'
  }

}
