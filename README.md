
<img src="https://raw.githubusercontent.com/rse/pptx-prompter/master/src/client/app-icon.svg" width="200" align="right" alt=""/>

PPTX-Prompter
=============

**Prompter for PowerPoint**

[![github (author stars)](https://img.shields.io/github/stars/rse?logo=github&label=author%20stars&color=%233377aa)](https://github.com/rse)
[![github (author followers)](https://img.shields.io/github/followers/rse?label=author%20followers&logo=github&color=%234477aa)](https://github.com/rse)
[![github (project stdver)](https://img.shields.io/github/package-json/stdver/rse/pptx-prompter?logo=github&label=project%20stdver&color=%234477aa&cacheSeconds=900)](https://github.com/rse/pptx-prompter)

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

Usage (Production)
------------------

- Under Windows/macOS install [Node.js](https://nodejs.org)
  for the server run-time, and [Google Chrome](https://www.google.com/chrome)
  for the client run-time.

- Install all dependencies:<br/>
  `npm install --production`

- Run the production build-process once:<br/>
  `npm start build`

- Run the bare prompter server component:<br/>
  `npm start server`

- Open the prompter client in Google Chrome:<br/>
  https://127.0.0.1:12345/

Usage (Development)
-------------------

- Under Windows/macOS install [Node.js](https://nodejs.org)
  for the server run-time and [Google Chrome](https://www.google.com/chrome)
  for the client run-time,
  plus [Visual Studio Code](https://code.visualstudio.com/) with its
  TypeScript, ESLint and VueJS extensions.

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

