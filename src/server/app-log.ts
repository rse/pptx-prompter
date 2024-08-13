/*
**  pptx-prompter - Prompter for PowerPoint
**  Copyright (c) 2023-2024 Dr. Ralf S. Engelschall <rse@engelschall.com>
**  Licensed under GPL 3.0 <https://spdx.org/licenses/GPL-3.0-only>
*/

/*  internal requirements  */
import fs     from "node:fs"

/*  external requirements  */
import chalk  from "chalk"
import moment from "moment"

/*  own requirements  */
import Pkg    from "./app-pkg"
import Argv   from "./app-argv"

/*  logging levels and style  */
const levels = [
    { name: "ERROR",   style: chalk.red.bold },
    { name: "WARNING", style: chalk.yellow.bold },
    { name: "INFO",    style: chalk.blue },
    { name: "DEBUG",   style: chalk.green }
]

/*  logging class  */
export default class Log {
    /*  internal state  */
    private stream: fs.WriteStream | null = null

    /*  constructor (foreign objects injection point)  */
    constructor (
        private pkg:  Pkg,
        private argv: Argv
    ) {}

    /*  initialize instance  */
    async init () {
        if (this.argv.logLevel >= levels.length)
            throw new Error("invalid maximum verbose level")
        if (this.argv.logFile !== "-")
            this.stream = fs.createWriteStream(this.argv.logFile, { flags: "a", encoding: "utf8" })
        this.log(2, `starting ${this.pkg.name} ${this.pkg.version} (${this.pkg.date}) <${this.pkg.homepage}>`)
    }

    /*  shutdown instance  */
    async shutdown () {
        this.log(2, "shutdown application!")
    }

    /*  custom logging method  */
    log (level: number, msg: string) {
        if (level <= this.argv.logLevel) {
            /*  determine text line  */
            const timestamp = moment().format("YYYY-MM-DD hh:mm:ss.SSS")
            let line = `[${timestamp}]: `
            if (this.argv.logFile === "-" && process.stdout.isTTY)
                line += `${levels[level].style("[" + levels[level].name + "]")}`
            else
                line += `[${levels[level].name}]`
            line += `: ${msg}\n`

            /*  output text line  */
            if (this.argv.logFile === "-")
                process.stdout.write(line)
            else if (this.stream !== null)
                this.stream.write(line)
        }
    }
}

