#!/usr/bin/php -q
<?php
$f = '../../_studiolite-dist/init.js';
$page = file_get_contents($f);
$pattern = '/-dev/is';
$page = preg_replace($pattern, '-dist', $page);
$fd = fopen($f,'w');
fwrite($fd,$page);
fclose($fd);

$f = '../../_studiolite-dist/studiolite.html';
$page = file_get_contents($f);
$pattern = '/-dev/is';
$page = preg_replace($pattern, '-dist', $page);
$fd = fopen($f,'w');
fwrite($fd,$page);
fclose($fd);
?>