import {CreditCardDetails} from './interfaces'
import {Stripe} from './classes'

export const cards = () => {
  return this.api.get('/payment/cards')
}

export const addCard = (cardDetails: CreditCardDetails) => {
  return Stripe.getCreditCardToken(cardDetails).then((token: string) => {
    return this.api.post('/payment/cards', { token })
  })
}

export const removeCard = (sourceId: string) => {
  return this.api.delete(`/payment/cards/:sourceId`)
}

export const listCharges = () => {
  return this.api.get(`/payment/charges`)
}

export const getAccount = () => {
  return this.api.get(`/payment/account`)
}
