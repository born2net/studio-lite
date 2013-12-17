#!/usr/home/born2net/bin/tclsh8.2

#################################################################################
# In windows
#     copy common files to specific directories so they are included in github push
#################################################################################

if { $tcl_platform(platform) =="windows" } {
   # file copy -force C:/msweb/common/_js/Login.js C:/msweb/signagestudio_web-lite/_comp/
  #  file delete -force C:/msweb/signagestudio_web-lite/_themes/fontsawesome
   # file delete -force C:/msweb/signagestudio_web-lite/_themes/nativedroid
   # file copy -force C:/msweb/common/_themes/fontsawesome C:/msweb/signagestudio_web-lite/_themes/
   # file copy -force C:/msweb/common/_themes/nativedroid C:/msweb/signagestudio_web-lite/_themes/
   exit

}

#################################################################################
# In linux
#     copy all files to /var/www/sites/dynasite/htdocs/_studiolite release dir
#################################################################################

if { $tcl_platform(platform) =="unix" } {
   puts "releasing in linux"
   source /var/www/sites/mediasignage.com/cgi-bin/lib.tcl
   exec copyFiles.sh
   cd /var/www/sites/dynasite/htdocs/_studiolite
   set page [ fileToVariable /var/www/sites/dynasite/htdocs/_studiolite/studiolite.html  ]
   regsub -all {\-dev} $page "" page
   set f [ open /var/www/sites/dynasite/htdocs/_studiolite/studiolite.html w ]
   puts $f $page
   close $f
}




