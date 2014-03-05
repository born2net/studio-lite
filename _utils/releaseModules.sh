dos2unix *
rm -r -f ../../_studiolite-bk/
rm -r -f ../../_studiolite-dist/
cp -r -f ../../_studiolite-dev/ ../../_studiolite-bk/
r.js -o app.build.js
./presetDist.js