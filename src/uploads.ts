import {UploadPolicy} from './interfaces'

export const generatePolicy = (name: string): Promise<UploadPolicy> => {
  return this.api.get(`/uploads/policy?filename=${name}`)
}
