import * as express from 'express'
import NicoService from '../services/NicoService'
import asyncHandler from '../utils/asyncHandler'

const router: express.Router = express.Router()

router.post('/', asyncHandler(async (req: express.Request, res: express.Response) => {
  const { videoId } = req.body
  const nicoService = new NicoService(req.io)

  await nicoService.login(process.env.NICO_EMAIL, process.env.NICO_PASSWORD)
  const data = await nicoService.download(videoId, './temp')
  console.log('Finished downloading')

  res.json(data)
}))

export default router
