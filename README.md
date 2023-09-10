
<img src="https://raw.githubusercontent.com/rse/pptx-prompter/master/src/client/app-icon.svg" width="200" align="right" alt=""/>

PPTX-Prompter
=============

**Prompter for PowerPoint**

[![github (author stars)](https://img.shields.io/github/stars/rse?logo=github&label=author%20stars&color=%233377aa)](https://github.com/rse)
[![github (author followers)](https://img.shields.io/github/followers/rse?label=author%20followers&logo=github&color=%234477aa)](https://github.com/rse)
[![github (project stdver)](https://img.shields.io/github/package-json/stdver/rse/pptx-prompter?logo=github&label=project%20stdver&color=%234477aa&cacheSeconds=900)](https://github.com/rse/pptx-prompter)
<br/>
[![npm (project license)](https://img.shields.io/npm/l/pptx-prompter?logo=npm&label=npm%20license&color=%23cc3333)](https://npmjs.com/pptx-prompter)
[![npm (project release)](https://img.shields.io/npm/v/pptx-prompter?logo=npm&label=npm%20release&color=%23cc3333)](https://npmjs.com/pptx-prompter)
[![npm (project downloads)](https://img.shields.io/npm/dm/pptx-prompter?logo=npm&label=npm%20downloads&color=%23cc3333)](https://npmjs.com/pptx-prompter)

About
-----

**PPTX-Prompter** is a client/server applications for showing a
prompter view for Microsoft PowerPoint &reg; presentations (under Windows or macOS), based on
embedded, hidden, even numbered, pre-exported slides. It is intended as
a replacement for the standard presenter view in Microsoft PowerPoint &reg; presentations,
which has two main drawbacks: it does not provide *reasonable* text formatting and
it does not provide an *analog* clock showing the remaining time.

The application, written in
[TypeScript](https://www.typescriptlang.org/), consists of a central
[Node.js](https://nodejs.org)-based server component and a HTML5
Single-Page Application (SPA) as the client component.

Overview
--------

The following is a screenshot of a prompter view, showing the
title slide of a keynote presentation:

![screenshot](doc/screenshot.png)

Here is the corresponding setup overview: On the left is PowerPoint in
its editing view, where the odd numbered slides carry the presentation
content and the even numbered slides carry the prompter content.
On the right top is the PowerPoint slideshow control view (usually
visible on the notebook monitor), on the right middle is the PowerPoint
presentation view (usually visible on the beamer) and on the right
bottom is once again the prompter view (usually projected onto an
external monitor, staying in front of the keynote speaker).

![overview](doc/overview.png)

Usage (Production)
------------------

- Under Windows/macOS install [Node.js](https://nodejs.org)
  for the server run-time, and [Google Chrome](https://www.google.com/chrome)
  for the client run-time.

- Run the prompter server component:<br/>
  `npx pptx-prompter [...]`

- Open the prompter client in Google Chrome:<br/>
  https://127.0.0.1:12345/

Usage (Development)
-------------------

- Under Windows/macOS install [Node.js](https://nodejs.org)
  for the server run-time and [Google Chrome](https://www.google.com/chrome)
  for the client run-time,
  plus [Visual Studio Code](https://code.visualstudio.com/) with its
  TypeScript, ESLint and VueJS extensions.

- Clone the source code:<br/>
  `git clone https://github.com/rse/pptx-prompter`

- Install all dependencies:<br/>
  `npm install`

- Run the development build-process once:<br/>
  `npm start build-dev`

- Run the development build-process and prompter server component continuously:<br/>
  `npm start dev`

- Open the prompter client in Google Chrome:<br/>
  https://127.0.0.1:12345/

See Also
--------

- [TypeScript](https://www.typescriptlang.org/)
- [Vue.js](https://vuejs.org/)
- [Node.js](https://nodejs.org)
- [Slideshow](https://npmjs.com/slideshow)
- [PowerPoint](https://www.microsoft.com/en/microsoft-365/powerpoint)

Copyright & License
-------------------

Copyright &copy; 2023 [Dr. Ralf S. Engelschall](mailto:rse@engelschall.com)<br/>
Licensed under [GPL 3.0](https://spdx.org/licenses/GPL-3.0-only)

