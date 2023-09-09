
<img src="https://raw.githubusercontent.com/rse/pptx-prompter/master/src/client/app-icon.svg" width="200" align="right" alt=""/>

PPTX-Prompter
=============

**Prompter for PowerPoint**

About
-----

**PPTX-Prompter** is a client/server applications for showing a
prompter view for PowerPoint presentations, based on
embedded, hidden, even numbered, exported slides.

The application, written in
[TypeScript](https://www.typescriptlang.org/), consists of a central
[Node.js](https://nodejs.org)-based server component and a HTML5
Single-Page Application (SPA) as the client component.

Usage (Production)
------------------

- Under Windows/macOS/Linux install [Node.js](https://nodejs.org)
  for the server run-time, [Google Chrome](https://www.google.com/chrome)
  for the client run-time, and [vMix](https://www.vmix.com) for the target application.

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

- Under Windows/macOS/Linux install [Node.js](https://nodejs.org)
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

