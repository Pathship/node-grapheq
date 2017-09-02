import * as stitch from 'mongodb-stitch'
import * as Config from '../config'

export const client = new stitch.StitchClient(Config.MONGO_STITCH_APP_ID)
