@echo off
title pptx-prompter
"c:\Program Files\nodejs\node.exe" ^
    .\dst\server\index.js -v2 ^
    -a 0.0.0.0 -p 12346 ^
    -d smp
