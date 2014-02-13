#!/usr/home/born2net/bin/tclsh8.2
source /var/www/sites/dynasite/htdocs/cgi_bin/lib.tcl
set f "../../_studiolite-dist/studiolite.html"
set page [ fileToVariable $f ]
regsub -all {\-dev} $page {-dist} page
set fd [ open $f WRONLY]
puts $fd $page
close $fd
