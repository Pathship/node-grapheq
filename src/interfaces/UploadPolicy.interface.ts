export interface UploadPolicy {
  endpoint: string
  signature: string
  policy: {
    key: string
  }
}
