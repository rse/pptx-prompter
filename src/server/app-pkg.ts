/*
**  pptx-prompter - Prompter for PowerPoint
**  Copyright (c) 2023 Dr. Ralf S. Engelschall <rse@engelschall.com>
**  Licensed under GPL 3.0 <https://spdx.org/licenses/GPL-3.0-only>
*/

// @ts-ignore
import pkg from "../../package.json"

/*  package information class  */
export default class Pkg {
    /*  internal state  */
    public name:        string
    public version:     string
    public date:        string
    public homepage:    string
    public license:     string
    public description: string
    public authorName:  string
    public authorUrl:   string

    /*  constructor (foreign objects injection point)  */
    constructor () {
        this.name         = pkg.name
        this.version      = pkg.version
        this.date         = pkg["x-date"]
        this.homepage     = pkg.homepage
        this.license      = pkg.license
        this.description  = pkg.description
        this.authorName   = pkg.author.name
        this.authorUrl    = pkg.author.url
    }

    /*  initialize instance  */
    async init () {}

    /*  shutdown instance  */
    async shutdown () {}
}

