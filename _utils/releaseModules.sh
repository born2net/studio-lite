#!/bin/sh
#cd /var/www/sites/dynasite/htdocs/_studiolite-dev
#npm publish .

cd /var/www/sites/dynasite/htdocs/_studiolite-dev/_utils
dos2unix *

### remove old dirs ###
rm -r -f ../../_studiolite-bk/
rm -r -f ../../_studiolite-dist/
cp -r -f ../../_studiolite-dev/ ../../_studiolite-bk/

### inject new localizations ##
/var/www/sites/dynasite/htdocs/_msportal/_js/_node/localization/importLite_en.js

### minified ###
## r.js -o app.build.js
### non minified ###
cp -r -f ../../_studiolite-dev/ ../../_studiolite-dist/

### final source file changes ###
./presetDist.js

### create backup ###
tar -pczf /tmp/studiolite-dist.tar.gz ../../_studiolite-dist/

### upload to remote server ###
echo 'uploading...'
./copyRemote.js
# cp ../redirect.html ../../_studiolite-dist/studiolite.html