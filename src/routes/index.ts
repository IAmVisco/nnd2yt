import { Express } from 'express'
import nicoRoutes from './nico'

export default (version: string, app: Express) => {
  app.use(`/api/${version}/nico`, nicoRoutes)
}
