cd C:\msweb\signagestudio_web-lite\_utils\
node updVersion.js
cd C:\msweb\signagestudio_web-lite
start "" /b cmd /c "uploadVerFiles.bat"
rem yuidoc .\

yuidoc .\ -t _doctheme -H _doctheme\helpers\helpers.js
