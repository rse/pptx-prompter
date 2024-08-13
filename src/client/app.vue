<!--
**
**  pptx-prompter - Prompter for PowerPoint
**  Copyright (c) 2023-2024 Dr. Ralf S. Engelschall <rse@engelschall.com>
**  Licensed under GPL 3.0 <https://spdx.org/licenses/GPL-3.0-only>
**
-->

<template>
    <div class="app">
        <div v-if="!online && !starting" class="hint error">
            Error: Connection to WebSocket service dropped.<br/>
            Attempting to reconnect...
        </div>
        <div v-if="online && !starting && state.state !== 'viewing'" class="hint notice">
            Hint: <i><b>Microsoft PowerPoint</b></i> &reg; is<br/>
            still not in <b>Slideshow</b> viewing mode.<br/>
            Please start <b>Slideshow</b> first!
        </div>
        <div v-if="online && state.state === 'viewing'" class="canvas">
            <div class="notes">
                <img v-if="state.notes !== ''" v-bind:src="state.notes">
            </div>
            <div class="sidebar">
                <div class="row1">
                    <div class="preview">
                        <img v-if="state.preview !== ''" v-bind:src="state.preview">
                    </div>
                </div>
                <div class="row2">
                    <div class="slide-number">
                        <div v-if="state.number > 0">{{ state.number }}</div>
                    </div>
                    <div class="preview-next">
                        <img v-if="state.previewNext !== ''" v-bind:src="state.previewNext">
                    </div>
                </div>
                <div class="row3">
                    <div class="clock">
                        <iframe v-if="state.clock !== ''" v-bind:src="state.clock"></iframe>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="stylus" scoped>
.app
    user-select: none
    width: 100vw
    height: 100vh
    background-color: var(--color-std-bg-1)
    display: flex
    justify-content: center
    align-items: center
    .hint
        text-align: center
        font-size: 3vw
        &.notice
            color: var(--color-acc-fg-3)
        &.error
            color: var(--color-sig-fg-3)
    .offline
        text-align: center
        font-size: 3vw
        color: var(--color-sig-fg-3)
    .canvas
        background-color: var(--color-std-bg-2)
        aspect-ratio: 16 / 9
        display: flex
        flex-direction: row
        justify-content: flex-start
        align-items: flex-start
        position: relative
        .sidebar
            background-color: var(--color-std-bg-3)
            z-index: 20
            position: absolute
            aspect-ratio: 32 / 59
            width: auto
            height: 100%
        .notes
            z-index: 10
            position: absolute
            aspect-ratio: 16 / 9
            width: 100%
            height: auto
@media (min-aspect-ratio: 16/9)
    .app
        flex-direction: row
        .canvas
            width: auto
            height: 100%
@media (max-aspect-ratio: 16/9)
    .app
        flex-direction: column
        .canvas
            width: 100%
            height: auto
.app
    .canvas
        .sidebar
            display: flex
            flex-direction: column
            .row1
                display: flex
                flex-direction: row
                .preview
                    width: 100%
                    height: auto
                    aspect-ratio: 16 / 9
                    overflow: hidden
                    img
                        width: 100%
            .row2
                display: flex
                flex-direction: row
                .slide-number
                    width: 50%
                    height: auto
                    aspect-ratio: 16 / 9
                    div
                        width: 100%
                        height: 100%
                        background-color: var(--color-acc-bg-3)
                        color: var(--color-acc-fg-5)
                        line-height: 9vw
                        font-size: 8vw
                        font-weight: bold
                        text-align: center
                .preview-next
                    width: 50%
                    height: auto
                    aspect-ratio: 16 / 9
                    overflow: hidden
                    img
                        width: 100%
            .row3
                display: flex
                flex-direction: row
                justify-content: flex-first
                align-items: flex-first
                .clock,
                .clock iframe
                    display: block
                    width: calc(100% - 8px)
                    height: calc(100% - 8px)
                    aspect-ratio: 1 / 1
                    padding: 4px
                .clock iframe
                    border: 0
                    outline: none
        .notes
            overflow: hidden
            img
                width: 100%
</style>

<script setup lang="ts">
import { defineComponent, toHandlerKey, toHandlers } from "vue"
import URI                 from "urijs"
import RecWebSocket        from "reconnecting-websocket"
import Ducky               from "ducky"
import moment              from "moment"

import {
    StateType,
    StateSchema,
    StateDefault,
    StateUtil
}                          from "../common/app-state"
</script>

<script lang="ts">
export default defineComponent({
    name: "app",
    components: {
    },
    data: () => ({
        rsURL:      "",
        wsURL:      "",
        starting:   true,
        online:     false,
        state:      StateDefault as StateType
    }),
    created () {
        /*  determine URL for WebSocket connections  */
        let url = new URI(window.location.href)
        url.protocol(`ws${url.protocol() === "https" ? "s" : ""}`)
        url.pathname("/ws")
        url.search("")
        url.hash("")
        this.wsURL = url.toString()
        this.log("INFO", `HTTP/WebSocket URL: ${this.wsURL}`)

        /*  determine URL for REST connections  */
        url = new URI(window.location.href)
        url.pathname("")
        url.search("")
        url.hash("")
        this.rsURL = url.toString()
        this.log("INFO", `HTTP/REST URL: ${this.rsURL}`)
    },
    async mounted () {
        /*  establish server connection  */
        const ws = new RecWebSocket(this.wsURL, [], {
            reconnectionDelayGrowFactor: 1.3,
            maxReconnectionDelay:        4000,
            minReconnectionDelay:        1000,
            connectionTimeout:           4000,
            minUptime:                   5000
        })
        ws.addEventListener("open", (ev) => {
            this.online = true
            this.log("INFO", "WebSocket connection established")
        })
        ws.addEventListener("close", (ev) => {
            this.online = false
            this.log("ERROR", "WebSocket connection failed/closed")
        })

        /*  receive server messages  */
        ws.addEventListener("message", (ev: MessageEvent) => {
            if (typeof ev.data !== "string") {
                this.log("WARNING", "invalid WebSocket message received")
                return
            }
            const data: any = JSON.parse(ev.data)
            if (!(typeof data === "object" && typeof data.cmd === "string" && data.arg !== undefined)) {
                this.log("WARNING", "invalid WebSocket message received")
                return
            }
            if (data.cmd === "STATE") {
                const state = data.arg.state as StateType
                const errors = [] as Array<string>
                if (Ducky.validate(state, StateSchema, errors))
                    this.setState(state)
                else
                    this.log("WARNING", `invalid schema of received state: ${errors.join(", ")}`)
            }
        })
        this.log("INFO", "established user interface")

        /*  after some time we are no longer starting  */
        setTimeout(() => {
            this.starting = false
        }, 1000)
    },
    methods: {
        log (level: string, msg: string) {
            const timestamp = moment().format("YYYY-MM-DD hh:mm:ss.SSS")
            console.log(`${timestamp} [${level}]: ${msg}`)
        },
        onLog (level: string, msg: string) {
            this.log(level, msg)
        },
        setState (state: StateType) {
            /* this.log("DEBUG", "received state: " + JSON.stringify(state)) */
            const changes = StateUtil.changed(this.state, state)
            if (changes.length > 0) {
                this.log("INFO", `state changed (${changes.length} update${changes.length > 1 ? "s" : ""})`)
                StateUtil.copy(this.state, state)
            }
        }
    }
})
</script>

