import * as http from 'http'
import * as socketIo from 'socket.io'
import * as express from 'express'
import * as bodyParser from 'body-parser'

import setupRoutes from './routes'
import errorMiddleware from './utils/errorMiddleware'

// TODO: Move this to the proper file
declare global {
  namespace Express {
    interface Request {
      io: socketIo.Server
    }
  }
}

const app: express.Express = express()
const port: number = +process.env.PORT || 3001

app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  req.io = io
  next()
})
app.use(bodyParser.json())
app.use(errorMiddleware)
setupRoutes('v1', app)
const server: http.Server = http.createServer(app)
const io: socketIo.Server = socketIo(server)

io.on('connection', (socket) => {
  console.log('Connected')
})

server.listen(port, () => {
  console.log(`Listening on port ${port} http://localhost:${port}`)
})
