@echo off
"C:\Program Files\nodejs\node.exe" --no-warnings --eval "require('expo-modules-autolinking')(process.argv.slice(1))" -- resolve --platform android
