/*
**  pptx-prompter - Prompter for PowerPoint
**  Copyright (c) 2023 Dr. Ralf S. Engelschall <rse@engelschall.com>
**  Licensed under GPL 3.0 <https://spdx.org/licenses/GPL-3.0-only>
*/

/*  external requirements  */
import EventEmitter  from "eventemitter2"
import Slideshow     from "slideshow"

/*  own requirements  */
import Argv          from "./app-argv"
import Log           from "./app-log"

/*  own requirements (common)  */
import { StateType, StateDefault } from "../common/app-state"

/*  slideshow status  */
type SlideshowStat = {
    state:    string,
    position: number
    slides:   number
}

/*  the PPTX management class  */
export default class PPTX extends EventEmitter {
    /*  internal state  */
    private slideshow: Slideshow                     | null = null
    private timer:     ReturnType<typeof setTimeout> | null = null
    private stat:      SlideshowStat                 | null = null
    private notes      = new Map<number, string>()
    private previews   = new Map<number, string>()
    private maxSlide   = 0

    /*  constructor (foreign objects injection point)  */
    constructor (
        private argv:   Argv,
        private log:    Log
    ) {
        super()
    }

    /*  initialize instance  */
    async init () {
        /*  read the exported slides  */
        const { globby } = await import("globby")
        const files = await globby(`${this.argv.exportDir}/**/*.{png,PNG}`, {
            onlyFiles:           true,
            followSymbolicLinks: false,
            suppressErrors:      true
        })

        /*  sort exported slides  */
        for (const file of files) {
            const m = file.match(/^.+\/(?:Slide|File)(\d+)\.(?:png|PNG)$/)
            if (m !== null) {
                const number = parseInt(m[1])
                if (number < 1)
                    continue
                if (number % 2 === 1)
                    this.previews.set(((number - 1) / 2) + 1, m[0])
                else
                    this.notes.set(number / 2, m[0])
                if (this.maxSlide < ((number - 1) / 2 + 1))
                    this.maxSlide = ((number - 1) / 2 + 1)
            }
        }

        /*  establish connection to PowerPoint and continuously poll state  */
        this.slideshow = new Slideshow("powerpoint")
        const poller = async () => {
            this.timer = setTimeout(poller, 1000)
            const stat = await this.slideshow!.stat().catch((err) => {
                this.log.log(1, `PowerPoint status failed: ${err}`)
                return null
            })
            if (stat === null)
                return
            if (this.stat === null
                || (   this.stat.state    !== stat.state
                    || this.stat.position !== stat.position
                    || this.stat.slides   !== stat.slides  )) {
                if (stat.position > 0) {
                    this.stat = stat
                    this.log.log(2, `PowerPoint state change: state=${this.stat.state} position=${this.stat.position}/${this.stat.slides}`)
                    this.emit("state-change")
                }
            }
        }
        this.timer = setTimeout(poller, 600)
    }

    /*  shutdown instance  */
    async shutdown () {
        if (this.slideshow !== null) {
            await this.slideshow.end()
            this.slideshow = null
        }
        if (this.timer !== null) {
            clearTimeout(this.timer)
            this.timer = null
        }
    }

    /*  custom method for retrieving the state  */
    async getState () {
        const state = StateDefault
        if (this.stat !== null) {
            const number = Math.round((this.stat.position + 1) / 2)
            state.state       = this.stat.state
            state.notes       = this.getImageInfo("notes", number)?.url ?? ""
            state.number      = number
            state.preview     = this.getImageInfo("previews", number)?.url ?? ""
            state.previewNext = this.getImageInfo("previews", number + 1)?.url ?? ""
            state.clock       = `/clock/?silent=true&moving=false&until=${this.argv.untilTime}`
        }
        return state
    }

    /*  custom method for determining image information  */
    getImageInfo (type: string, slide: number) {
        if (slide < 1 || slide > this.maxSlide)
            return {}
        return {
            fn:  type === "previews" ? this.previews.get(slide) : this.notes.get(slide),
            url: type === "previews" ? `/previews/${slide}` : `/notes/${slide}`
        }
    }
}

