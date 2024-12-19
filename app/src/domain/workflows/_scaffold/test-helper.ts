import crypto from 'crypto'

export const randomString = ():string => {
  return crypto.randomBytes(16).toString('hex')
}