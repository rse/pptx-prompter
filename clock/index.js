
/*  render a single instance of the clock  */
$(document).ready(() => {
    /*  initialize sound effects  */
    const sfx = new SoundFX({ basedir: "node_modules/@rse/soundfx" })
    soundfx = new Howl({ ...sfx.config(), volume: 0.50, preload: true })

    /*  initialize sound voice-messages  */
    const svm = new SoundVM({ basedir: "node_modules/@rse/soundvm" })
    soundvm = new Howl({ ...svm.config(), volume: 0.50, preload: true })

    /*  determine properties  */
    const props = {}
    const params = (new URL(document.location)).searchParams
    for (let [ key, val ] of params) {
        if (typeof val === "string") {
            if (val === "")
                val = true
            else if (val.match(/^(?:true|false)$/))
                val = (val === "true")
            else if (val.match(/^\d+$/))
                val = parseInt(val)
            else if (val.match(/^\d+\.\d+$/))
                val = parseFloat(val)
        }
        props[key] = val
    }

    /*  initialize and start clock  */
    const ac = new AnalogClock(props)
    ac.start(props)

    /*  provide timer keystrokes for 0-99 minutes duration  */
    for (let d1 = 0; d1 <= 9; d1++)
        for (let d2 = 0; d2 <= 9; d2++)
            Mousetrap.bind(`d ${d1} ${d2}`, () => { ac.timer({ duration: d1 * 10 + d2  }) })

    /*  provide timer keystrokes for 0-59 minutes until-time  */
    for (let d1 = 0; d1 <= 5; d1++) {
        for (let d2 = 0; d2 <= 9; d2++) {
            const minutes = d1 * 10 + d2
            const now   = moment()
            const until = moment().minutes(minutes).seconds(0)
            if (until.isBefore(now))
                until.add(1, "hours")
            Mousetrap.bind(`u ${d1} ${d2}`, () => { ac.timer({ until: until.format() }) })
        }
    }

    /*  provide timer termination  */
    Mousetrap.bind("x", () => { ac.timer({ duration: 0 }) })

    /*  provide timer keystrokes for 1-9 attention flashes  */
    for (let i = 1; i <= 9; i++) {
        Mousetrap.bind(`a ${i} s`, () => { ac.attention(i, "soft") })
        Mousetrap.bind(`a ${i} h`, () => { ac.attention(i, "hard") })
    }

    /*  provide timer hints  */
    Mousetrap.bind("h s", () => { ac.hint("slower") })
    Mousetrap.bind("h f", () => { ac.hint("faster") })
    Mousetrap.bind("h m", () => { ac.hint("message") })
})

