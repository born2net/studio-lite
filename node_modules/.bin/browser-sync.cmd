@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe"  "%~dp0\..\browser-sync\bin\browser-sync.js" %*
) ELSE (
  node  "%~dp0\..\browser-sync\bin\browser-sync.js" %*
)