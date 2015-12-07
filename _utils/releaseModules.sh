#!/bin/sh

echo 'publishing to npm'
cd /var/www/sites/dynasite/htdocs/_studiolite-dev
npm publish .


cd /var/www/sites/dynasite/htdocs/_studiolite-dev/_utils
dos2unix *


### remove old dirs ###
echo 'removing and copying new _studiolite-tmp'
rm -r -f ../../_studiolite-tmp/
cp -r -f ../../_studiolite-dev/ ../../_studiolite-tmp/


### inject new localizations ##
echo 'inserting localization to msdb'
/var/www/sites/dynasite/htdocs/_msportal/_js/_node/localization/importLite_en.js


### minified single file ###
## r.js -o app.build.js


### minified files ###
gulp uglify


### non minified ###
echo 'removing old dist'
rm -r -f ../../_studiolite-dist/
echo 'copying new dist from tmp to dist'
cp -r -f ../../_studiolite-tmp/ ../../_studiolite-dist/
echo 'copying finished'


### final source changes ###
./presetDist.js


### remove src from dist ###
rm ../../_studiolite-dist/src_studiolite.html


### create backup ###
tar -pczf /tmp/studiolite-dist.tar.gz ../../_studiolite-dist/


### upload to remote server ###
echo 'uploading to galaxy for private server distribution'
./copyRemote.js
# cp ../redirect.html ../../_studiolite-dist/studiolite.html