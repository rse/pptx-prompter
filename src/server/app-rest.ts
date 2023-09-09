/*
**  pptx-prompter - Prompter for PowerPoint
**  Copyright (c) 2023 Dr. Ralf S. Engelschall <rse@engelschall.com>
**  Licensed under GPL 3.0 <https://spdx.org/licenses/GPL-3.0-only>
*/

/*  internal requirement  */
import path           from "node:path"
import http           from "node:http"

/*  external requirement  */
import * as HAPI      from "@hapi/hapi"
import Boom           from "@hapi/boom"
import { Server }     from "@hapi/hapi"
import Inert          from "@hapi/inert"
import HAPIWebSocket  from "hapi-plugin-websocket"
import HAPIHeader     from "hapi-plugin-header"
import HAPITraffic    from "hapi-plugin-traffic"
import HAPIDucky      from "hapi-plugin-ducky"
import ducky          from "ducky"
import WebSocket      from "ws"

/*  application requirement  */
import Pkg            from "./app-pkg"
import Argv           from "./app-argv"
import Log            from "./app-log"
import PPTX           from "./app-pptx"

/*  application requirement (common)  */
import { StateType }  from "../common/app-state"

/*  HTTP/REST communication class  */
export default class REST {
    /*  internal state  */
    public server: Server | null = null

    /*  constructor (foreign objects injection point)  */
    constructor (
        private pkg:    Pkg,
        private argv:   Argv,
        private log:    Log,
        private pptx:   PPTX
    ) {}

    /*  initialization  */
    async init () {
        /*  establish network service  */
        this.server = new Server({
            address: this.argv.httpAddr,
            port:    this.argv.httpPort
        })
        await this.server.register({ plugin: Inert })
        await this.server.register({
            plugin: HAPIHeader,
            options: {
                Server: `${this.pkg.name}/${this.pkg.version}`
            }
        })
        await this.server.register({ plugin: HAPITraffic })
        await this.server.register({ plugin: HAPIWebSocket })
        await this.server.register({ plugin: HAPIDucky })

        /*  hook into network service logging  */
        this.server.events.on("response", (request: HAPI.Request) => {
            const traffic = request.traffic()
            let protocol = `HTTP/${request.raw.req.httpVersion}`
            const ws = request.websocket()
            if (ws.mode === "websocket") {
                const wsVersion = (ws.ws as any).protocolVersion ??
                    request.headers["sec-websocket-version"] ?? "13?"
                protocol = `WebSocket/${wsVersion}+${protocol}`
            }
            const msg =
                "remote="   + request.info.remoteAddress + ", " +
                "method="   + request.method.toUpperCase() + ", " +
                "url="      + request.url.pathname + ", " +
                "protocol=" + protocol + ", " +
                "response=" + ("statusCode" in request.response ? request.response.statusCode : "<unknown>") + ", " +
                "recv="     + traffic.recvPayload + "/" + traffic.recvRaw + ", " +
                "sent="     + traffic.sentPayload + "/" + traffic.sentRaw + ", " +
                "duration=" + traffic.timeDuration
            this.log.log(2, `HAPI: request: ${msg}`)
        })
        this.server.events.on({ name: "request", channels: [ "error" ] }, (request: HAPI.Request, event: HAPI.RequestEvent, tags: { [key: string]: true }) => {
            if (event.error instanceof Error)
                this.log.log(0, `HAPI: request-error: ${event.error.message}`)
            else
                this.log.log(0, `HAPI: request-error: ${event.error}`)
        })
        this.server.events.on("log", (event: HAPI.LogEvent, tags: { [key: string]: true }) => {
            if (tags.error) {
                const err = event.error
                if (err instanceof Error)
                    this.log.log(2, `HAPI: log: ${err.message}`)
                else
                    this.log.log(2, `HAPI: log: ${err}`)
            }
        })

        /*  ==== Endpoint: User Interface (Static Files) ====  */

        /*  serve static client files  */
        this.server.route({
            method: "GET",
            path: "/{param*}",
            handler: {
                directory: {
                    path: path.join(__dirname, "../../dst/client"),
                    redirectToSlash: true,
                    index: true
                }
            }
        })

        /*  ==== Endpoint: Content (Static Files) ====  */

        /*  serve preview image files  */
        this.server.route({
            method: "GET",
            path: "/previews/{number*}",
            handler: async (request: HAPI.Request, h: HAPI.ResponseToolkit) => {
                const number = parseInt(request.params.number)
                const info = this.pptx.getImageInfo("previews", number)
                if (!info.url || !info.fn)
                    return Boom.badRequest("invalid request")
                return h.file(info.fn)
            }
        })

        /*  serve notes image files  */
        this.server.route({
            method: "GET",
            path: "/notes/{number*}",
            handler: async (request: HAPI.Request, h: HAPI.ResponseToolkit) => {
                const number = parseInt(request.params.number)
                const info = this.pptx.getImageInfo("notes", number)
                if (!info.url || !info.fn)
                    return Boom.badRequest("invalid request")
                return h.file(info.fn)
            }
        })

        /*  serve clock client files  */
        this.server.route({
            method: "GET",
            path: "/clock/{param*}",
            handler: {
                directory: {
                    path: path.join(__dirname, "../../clock"),
                    redirectToSlash: true,
                    index: true
                }
            }
        })

        /*  ==== Endpoint: User Interface (State) ====  */

        /*  serve WebSocket connections  */
        type wsPeerCtx = {
            id:   string
        }
        type wsPeerInfo = {
            ctx:  wsPeerCtx
            ws:   WebSocket
            req:  http.IncomingMessage
        }
        const wsPeers = new Map<string, wsPeerInfo>()

        /*  notify clients about state  */
        const notifyState = (state: StateType) => {
            const msg = JSON.stringify({ cmd: "STATE", arg: { state } })
            for (const info of wsPeers.values()) {
                this.log.log(3, `WebSocket: notify: id=${info.ctx.id}`)
                if (info.ws.readyState === WebSocket.OPEN)
                    info.ws.send(msg)
            }
        }

        /*  forward state changes to clients  */
        let notifyTimer: ReturnType<typeof setTimeout> | null = null
        let notifyData:  StateType | null = null
        this.pptx.on("state-change", async () => {
            notifyData = await this.pptx.getState()
            if (notifyTimer === null) {
                notifyTimer = setTimeout(() => {
                    notifyTimer = null
                    if (notifyData !== null) {
                        const data = notifyData
                        notifyData = null
                        notifyState(data)
                    }
                }, 250)
            }
        })

        /*  provide the REST/WebSocket endpoint  */
        this.server.route({
            method: "POST",
            path:   "/ws",
            options: {
                plugins: {
                    websocket: {
                        only: true,
                        autoping: 30 * 1000,

                        /*  on WebSocket connection open  */
                        connect: async (args: any) => {
                            const ctx: wsPeerCtx            = args.ctx
                            const ws:  WebSocket            = args.ws
                            const req: http.IncomingMessage = args.req
                            const id = `${req.socket.remoteAddress}:${req.socket.remotePort}`
                            ctx.id = id
                            wsPeers.set(id, { ctx, ws, req })
                            this.log.log(2, `WebSocket: connect: remote=${id}`)

                            /*  initially, emit the state at least once  */
                            const state = await this.pptx.getState()
                            notifyState(state)
                        },

                        /*  on WebSocket connection close  */
                        disconnect: (args: any) => {
                            const ctx: wsPeerCtx = args.ctx
                            const id = ctx.id
                            wsPeers.delete(id)
                            this.log.log(2, `WebSocket: disconnect: remote=${id}`)
                        }
                    }
                }
            },
            handler: async (request: HAPI.Request, h: HAPI.ResponseToolkit) => {
                /*  on WebSocket message transfer  */
                const { ctx, ws } = request.websocket()
                if (typeof request.payload !== "object" || request.payload === null)
                    return Boom.badRequest("invalid request")
                if (!ducky.validate(request.payload, "{ cmd: string, arg?: string }"))
                    return Boom.badRequest("invalid request")
                const { cmd, arg } = request.payload as any satisfies { cmd: string, arg: any }
                if (cmd === "STATE") {
                    const data = await this.pptx.getState()
                    const json = JSON.stringify({ cmd: "STATE", arg: { state: data } })
                    return h.response(json).code(200)
                }
                else
                    return Boom.badRequest("not implemented")
            }
        })
    }

    /*  startup  */
    async start () {
        /*  start service  */
        if (this.server !== null) {
            await this.server.start()
            this.log.log(2, `started HTTP network service: http://${this.argv.httpAddr}:${this.argv.httpPort}`)
        }
    }

    /*  shutdown  */
    async shutdown () {
        /*  stop service  */
        if (this.server !== null) {
            this.log.log(2, "stopping HTTP network service")
            await this.server.stop()
        }
    }
}
