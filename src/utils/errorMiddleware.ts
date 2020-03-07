import * as express from 'express'

export class HttpException extends Error {
  status: number;
  message: string;

  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.message = message
  }
}

export default (err: HttpException, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const errorCode = err.status || 400
  console.error('Body: ' + JSON.stringify(req.body))
  console.error(err)

  const errorResponse = {
    message: err.message || 'Unhandled error!'
  }

  res.status(errorCode).json(errorResponse)
}
