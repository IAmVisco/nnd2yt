import * as http from 'http'
import * as express from 'express'
import * as bodyParser from 'body-parser'

import setupRoutes from './routes'

const app: express.Express = express()
const port: number = +process.env.PORT || 3001

app.use(bodyParser.json())
setupRoutes('v1', app)

const server: http.Server = http.createServer(app)

server.listen(port, () => {
  console.log(`Listening on port ${port} http://localhost:${port}`)
})
