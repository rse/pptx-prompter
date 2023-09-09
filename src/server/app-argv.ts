/*
**  pptx-prompter - Prompter for PowerPoint
**  Copyright (c) 2023 Dr. Ralf S. Engelschall <rse@engelschall.com>
**  Licensed under GPL 3.0 <https://spdx.org/licenses/GPL-3.0-only>
*/

/*  internal requirements  */
import path  from "node:path"

/*  external requirements  */
import yargs from "yargs"

/*  own requirements  */
import Pkg   from "./app-pkg"

/*  command-line argument class  */
export default class Argv {
    /*  exposed state  */
    public help           = false
    public version        = false
    public logLevel       = 0
    public logFile        = ""
    public stateDir       = ""
    public httpAddr       = ""
    public httpPort       = 0
    public exportDir      = ""
    public untilTime      = ""

    /*  constructor (foreign objects injection point)  */
    constructor (
        private pkg: Pkg
    ) {}

    /*  initialize instance  */
    async init () {
        /*  command-line option parsing  */
        // @ts-ignore
        const args = yargs
            /* eslint indent: off */
            .usage(
                "Usage: $0 [-h] [-V] " +
                "[-v <log-level>] [-l|--log-file <log-file>] " +
                "[-a <http-addr>] [-p <http-port>] " +
                "[-d <export-dir>] [-u <until-time>]"
            )
            .help("h").alias("h", "help").default("h", false)
                .describe("h", "show usage help")
            .boolean("V").alias("V", "version").default("V", false)
                .describe("V", "show program version information")
            .number("v").nargs("v", 1).alias("v", "log-level").default("v", 2)
                .describe("v", "level for verbose logging (0-3)")
            .string("l").nargs("l", 1).alias("l", "log-file").default("l", "-")
                .describe("l", "file for verbose logging")
            .string("a").nargs("a", 1).alias("a", "http-addr").default("a", "0.0.0.0")
                .describe("a", "HTTP/Websocket listen IP address")
            .number("p").nargs("p", 1).alias("p", "http-port").default("p", 8080)
                .describe("p", "HTTP/Websocket listen TCP port")
            .string("d").nargs("d", 1).alias("d", "export-dir").default("d", path.join(__dirname, "../../smp/sample"))
                .describe("s", "directory of PowerPoint slide export files")
            .string("u").nargs("u", 1).alias("u", "until-time").default("u", "")
                .describe("u", "time until when the event lasts")
            .version(false)
            .strict()
            .showHelpOnFail(true)
            .demand(0)
            .parse(process.argv.slice(2)) as any

        /*  shuffle results  */
        this.help           = args.help
        this.version        = args.version
        this.logLevel       = args.logLevel
        this.logFile        = args.logFile
        this.httpAddr       = args.httpAddr
        this.httpPort       = args.httpPort
        this.exportDir      = args.exportDir
        this.untilTime      = args.untilTime

        /*  short-circuit processing of "-V" command-line option  */
        if (this.version) {
            process.stderr.write(`${this.pkg.name} ${this.pkg.version} <${this.pkg.homepage}>\n`)
            process.stderr.write(`${this.pkg.description}\n`)
            process.stderr.write(`Copyright (c) 2023 ${this.pkg.authorName} <${this.pkg.authorUrl}>\n`)
            process.stderr.write(`Licensed under ${this.pkg.license} <http://spdx.org/licenses/${this.pkg.license}.html>\n`)
            process.exit(0)
        }
    }

    /*  shutdown instance  */
    async shutdown () {}
}

