@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe"  "%~dp0\..\opn\cli.js" %*
) ELSE (
  node  "%~dp0\..\opn\cli.js" %*
)