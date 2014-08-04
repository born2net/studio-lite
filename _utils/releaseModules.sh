dos2unix *
rm -r -f ../../_studiolite-bk/
rm -r -f ../../_studiolite-dist/
cp -r -f ../../_studiolite-dev/ ../../_studiolite-bk/
/var/www/sites/dynasite/htdocs/_msportal/_js/_node/localImportEN.js
r.js -o app.build.js
./presetDist.js
tar -pczf /tmp/studiolite-dist.tar.gz ../../_studiolite-dist/
echo 'uploading...'
./copyRemote.js
# cp ../redirect.html ../../_studiolite-dist/studiolite.html