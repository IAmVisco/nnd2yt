import * as express from 'express'
import { niconico, Nicovideo } from 'niconico'
import asyncHandler from '../utils/asyncHandler'

const router: express.Router = express.Router()

router.post('/', asyncHandler(async (req: express.Request, res: express.Response) => {
  const { videoId } = req.body

  const session = await niconico.login(process.env.NICO_EMAIL, process.env.NICO_PASSWORD)
  const client = new Nicovideo(session)
  // TODO: check if it times out
  const filePath = await client.download(videoId, './temp')

  res.send(`Downloaded ${filePath}`)
}))

export default router
