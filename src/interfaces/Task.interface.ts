export interface TaskInterface {
  _id: string
  state: string
  createdBy: string
  videoUrl: string
  meetingId?: string
  maximumMinutes: number
  createdAt: Date
  updatedAt?: Date
  cancelledAt: Date
  finishedAt?: Date
  rawS3Path?: string

  stop(): Promise<TaskInterface>
  status(): Promise<string>
  data(): Promise<any>
}
