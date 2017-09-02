import { client } from '../services/stitch'

export class AuthAPI {

  constructor() {}

  get userId() {
    return client.authedId()
  }

  register(email: string, password: string): Promise<any> {
    return client.register(email, password)
  }

  resetPassword(email: string): Promise<any> {
    return client.sendPasswordReset(email)
  }

  sendConfirmationEmail(email: string): Promise<any> {
    return client.sendEmailConfirm(email)
  }

  login(email: string, password: string): Promise<any> {
    return client.login(email, password)
  }

  logout(): Promise<any> {
    return client.logout()
  }

  profile(): Promise<any> {
    return client.userProfile()
  }

}
