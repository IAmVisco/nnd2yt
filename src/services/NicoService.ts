import axios, { AxiosInstance } from 'axios'
import axiosCookieJarSupport from 'axios-cookiejar-support'
import { createWriteStream } from 'fs'
import * as filenamify from 'filenamify'
import { JSDOM } from 'jsdom'
import { join, resolve } from 'path'
import * as tough from 'tough-cookie'
import * as socketIo from 'socket.io'

import { IWatchData } from '../types/nico'
import { HttpException } from '../utils/errorMiddleware'
import formatBytes from '../utils/formatBytes'

// Based on https://github.com/uetchy/niconico
export default class NicoService {
  private readonly cookieJar: tough.CookieJar
  private readonly client: AxiosInstance
  private readonly baseApiUrl: string = 'https://www.nicovideo.jp/watch/'
  private readonly loginUrl: string = 'https://account.nicovideo.jp/api/v1/login?site=niconico&next_url='

  constructor(private readonly io: socketIo.Server) {
    this.io = io
    this.cookieJar = new tough.CookieJar()
    this.client = axios.create()
    axiosCookieJarSupport(this.client)
    this.client.defaults.withCredentials = true
    this.client.defaults.jar = this.cookieJar
  }

  public async login(email: string, password: string): Promise<void> {
    await this.client.post(this.loginUrl, { mail_tel: email, password })
    if (!this.cookieJar.getCookieStringSync('https://nicovideo.jp').includes('user_session')) {
      throw new HttpException(401, 'Invalid credentials')
    }
    console.log('Logged in')
  }

  public async watch(videoID: string): Promise<IWatchData> {
    const response = await this.client.get(`${this.baseApiUrl}${videoID}`)
    console.log('Fetched video data')
    const { document } = new JSDOM(response.data).window
    const rawData: string = document.querySelector('#js-initial-watch-data').getAttribute('data-api-data')
    const data = JSON.parse(rawData) as IWatchData

    return data
  }

  private async _httpExport(uri: string, targetPath: string): Promise<string> {
    const { headers } = await this.client.head(uri)
    let downloadedSize = 0
    const fileSize = Number.parseInt(headers['content-length'], 10)
    console.log(`Starting video download, content length ${formatBytes(fileSize)}`)

    return new Promise((resolve, reject) => {
      this.client.get(uri, { responseType: 'stream' }).then((response) => {
        response.data.on('data', (chunk) => {
          downloadedSize += chunk.length
          const progress = Math.floor((downloadedSize / fileSize) * 100)
          this.io.emit('progress', progress.toString())
        }).pipe(createWriteStream(targetPath))

        response.data.on('end', () => resolve(targetPath))
        response.data.on('error', (err) => reject(err))
      })
    })
  }

  public async download(videoID: string, targetPath: string): Promise<string> {
    const data = await this.watch(videoID)
    const fileName = `${filenamify(data.video.title)}.${data.video.movieType}`
    const filePath = resolve(join(targetPath, fileName))
    const exportedPath = await this._httpExport(data.video.smileInfo.url, filePath)

    return exportedPath
  }
}
