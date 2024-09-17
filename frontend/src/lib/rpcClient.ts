import type { DLMetadata, LiveStreamProgress, RPCRequest, RPCResponse, RPCResult } from '../types'
import { WebSocketSubject, webSocket } from 'rxjs/webSocket'

import { Observable } from 'rxjs'

type DownloadRequestArgs = {
  url: string,
  args: string,
  pathOverride?: string,
  renameTo?: string,
  playlist?: boolean
}

type WaitUntil = (result: RPCResult[]) => boolean

export class RPCClient {
  private seq: number
  private httpEndpoint: string
  private readonly _socket$: WebSocketSubject<any>
  private readonly token?: string

  constructor(httpEndpoint: string, webSocketEndpoint: string, token?: string) {
    this.seq = 0
    this.httpEndpoint = httpEndpoint
    this._socket$ = webSocket<any>({
      url: token ? `${webSocketEndpoint}?token=${token}` : webSocketEndpoint
    })
    this.token = token
  }

  public get socket$(): Observable<RPCResponse<RPCResult[]>> {
    return this._socket$
  }

  private incrementSeq() {
    return String(this.seq++)
  }

  private send(req: RPCRequest) {
    this._socket$.next({
      ...req,
      id: this.incrementSeq(),
    })
  }

  private argsSanitizer(args: string) {
    return args
      .split(' ')
      .map(a => a.trim().replaceAll("'", '').replaceAll('"', ''))
      .filter(Boolean)
  }

  private async sendHTTP<T>(req: RPCRequest) {
    const res = await fetch(this.httpEndpoint, {
      method: 'POST',
      headers: {
        'X-Authentication': this.token ?? ''
      },
      body: JSON.stringify({
        ...req,
        id: this.incrementSeq(),
      })
    })
    const data: RPCResponse<T> = await res.json()

    return data
  }

  private async sendHTTPAndWait<T>(req: RPCRequest, until: WaitUntil, timeout: number = 10000): Promise<RPCResult[]> {
    await this.sendHTTP<T>(req)
    return new Promise<RPCResult[]>((resolve, reject) => {
      const subscribe = this._socket$.asObservable().subscribe(
        (data: RPCResponse<RPCResult[]>) => {
          if (data.error !== null) {
            subscribe.unsubscribe()
            reject(new Error(`Error Code ${data.error}: ${JSON.stringify(data.result)}`))
          } else if (until(data.result)) {
            subscribe.unsubscribe()
            resolve(data.result)
          }
        }
      )
      if (timeout > 0) {
        setTimeout(() => {
          subscribe.unsubscribe()
          reject(new Error('Timeout'))
        }, timeout)
      }
    })
  }

  public download(req: DownloadRequestArgs) {
    if (!req.url) {
      return
    }

    const rename = req.args.includes('-o')
      ? req.args
        .substring(req.args.indexOf('-o'))
        .replaceAll("'", '')
        .replaceAll('"', '')
        .split('-o')
        .map(s => s.trim())
        .join('')
        .split(' ')
        .at(0) ?? ''
      : ''

    const sanitizedArgs = this.argsSanitizer(
      req.args
        .replace('-o', '')
        .replace(rename, '')
    )

    if (req.playlist) {
      return this.sendHTTP({
        method: 'Service.ExecPlaylist',
        params: [{
          URL: req.url,
          Params: sanitizedArgs,
          Path: req.pathOverride,
          Rename: req.renameTo || rename,
        }]
      })
    }
    this.sendHTTP({
      method: 'Service.Exec',
      params: [{
        URL: req.url.split('?list').at(0)!,
        Params: sanitizedArgs,
        Path: req.pathOverride,
        Rename: req.renameTo || rename,
      }]
    })
  }

  public formats(url: string) {
    if (url) {
      return this.sendHTTP<DLMetadata>({
        method: 'Service.Formats',
        params: [{
          URL: url.split('?list').at(0)!,
        }]
      })
    }
  }

  public running() {
    this.send({
      method: 'Service.Running',
      params: [],
    })
  }

  public async kill(id: string) {
    return this.sendHTTPAndWait({
      method: 'Service.Kill',
      params: [id],
    }, (results) => results.every(r => r.id !== id))
  }

  public async clear(id: string) {
    return this.sendHTTPAndWait({
      method: 'Service.Clear',
      params: [id],
    }, (results) => results.every(r => r.id !== id))
  }

  public killAll() {
    this.sendHTTP({
      method: 'Service.KillAll',
      params: [],
    })
  }

  public freeSpace() {
    return this.sendHTTP<number>({
      method: 'Service.FreeSpace',
      params: [],
    })
  }

  public directoryTree() {
    return this.sendHTTP<string[]>({
      method: 'Service.DirectoryTree',
      params: [],
    })
  }

  public execLivestream(url: string) {
    return this.sendHTTP({
      method: 'Service.ExecLivestream',
      params: [{
        URL: url
      }]
    })
  }

  public progressLivestream() {
    return this.sendHTTP<LiveStreamProgress>({
      method: 'Service.ProgressLivestream',
      params: []
    })
  }

  public killLivestream(url: string) {
    return this.sendHTTPAndWait({
      method: 'Service.KillLivestream',
      params: [url]
    }, (results) => results.every(r => r.info.url !== url))
  }

  public killAllLivestream() {
    return this.sendHTTPAndWait({
      method: 'Service.KillAllLivestream',
      params: []
    }, (results) => results.every(r => r.progress.process_status === 2))
  }

  public updateExecutable() {
    return this.sendHTTP({
      method: 'Service.UpdateExecutable',
      params: []
    })
  }
}