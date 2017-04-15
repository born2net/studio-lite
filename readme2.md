<h5>by digitalsignage.com</h5> 
==========

<pre>
   _____ _             _ _       _      _ _       
  / ____| |           | (_)     | |    (_) |      
 | (___ | |_ _   _  __| |_  ___ | |     _| |_ ___ 
  \___ \| __| | | |/ _` | |/ _ \| |    | | __/ _ \
  ____) | |_| |_| | (_| | | (_) | |____| | ||  __/
 |_____/ \__|\__,_|\__,_|_|\___/|______|_|\__\___|
                                                  
                                                                                                                            
</pre>

StudioLite, Digital Signage for the rest of us
---------------------------------------

[![NPM](https://nodei.co/npm/studiolite.png)](https://nodei.co/npm/studiolite/)


------------------------------------------------------------------------

StudioLite is an open source, 100% FREE, Digital Signage platform that was designed with ease of use in mind.
With StudioLite anyone can have a Digital Signage solution that is entirely customizable. 
Take the source code, modify it, brand it and build a product that's right for you and your customers.
Best of all, you will take full advantage of the world's most popular Digital Signage cloud so you don't have to worry about backend programming or even setup a server, it's all done for you using the mediaCLOUD.

 - Based on the poplar SignageStudio Pro ( [MediaSignage]: http://www.DigitalSignage.com )
 - Connected to a private mediaSERVER or the public free mediaCLOUD
 - 100% open source based on GNU V3 license
 - Contributors are welcome, fork, modify and send pull requests

Links:
------------------------------------------------------------------------
- Cloud web app: https://galaxy.signage.me/_studiolite-dist/studiolite.html
- Home: http://lite.digitalsignage.com
- Docs: http://www.digitalsignage.com/msdocs/
- Support: http://script.digitalsignage.com/forum/index.php/board,9.0.html
- Developer video tutorial: http://goo.gl/nkx7wr
- StudioLite intro video: http://lite.digitalsignage.com/video1.html
- StudioLite advanced  video: http://lite.digitalsignage.com/video2.html
- Developers page: http://www.digitalsignage.com/_html/open_source_digital_signage.html

Technical data:
------------------------------------------------------------------------
- Build on top Backbone js with a clean MV* design
- Includes jQuery, Underscore as base libs
- Powered by Bootstrap using responsive design for phones, tablets and desktops
- Runs with require js for on demand modulated loading
- Driven using Soap API and includes Helper SDK
- Uses a local msdb (database) through SDK for offline work
- Available as obfuscated and raw source
- Support available through the MediaSignage support forum

Installation:
------------------------------------------------------------------------

StudioLite can be downloaded directly from GitHub, or (recommended) is to install it through node.js and npm.
With node.js and npm you will be able to easily update to the latest version of StudioLite as well as take advantage of the the built in Express server that is included with StudioLite.

<h4>Option 1 (recommended):</h4>
- Download node.js (all major operating systems supported): http://nodejs.org/
- Install node.js 
- open a terminal (Mac / Linux) or command prompt (windows)
- switch to node.js directory and run: ```npm install studiolite -g --prefix ./```
- change directory to: ```cd ./lib/node_modules/studiolite``` 
- run the command ```node server.js``` if you wish to use the bundled express server
- you may also host it directly on your own web server if you like, such as apache or IIS
- open browser and point it to ```[YOUR_IP]:8080/_studiolite-dev/studiolite.html```

<h4>Option 2:</h4>
- Download the zip from GitHub
- On your web server (i.e.: apache, IIS) create a root directory and name it: _studiolite-dev
- Unzip all files into _studiolite-dev directory
- open browser and point it to ```[YOUR_IP]/_studiolite-dev/studiolite.html```
- IMPORTANT: make sure _studiolite-dev is in the root of web server

Main html files
------------------------------------------------------------------------
- If you are using the mediaCLOUD or this repo on GithHub, to host this 
 project on your own server you will use: ```studiolite.html``` to load the app
- If you are using a private or hybrid mediaSERVER you will find in your 
 server distribution the file: ```index.html``` to load the app
 

Updates:
------------------------------------------------------------------------
If you used ```npm install studiolite``` updating is as easy as switching to your node directory and typing ```node update studiolite``` to get the latest release
If you downloaded directly from GitHub, you will need to re-download the zip file and expand over your existing installation.
 
npm registry: https://www.npmjs.org/package/studiolite 

Customization:
------------------------------------------------------------------------
Keep in mind the SignageStudio lite as well as its related SDK Pepper are often released with new updates, so you will lose any changes you make to your code if you overwrite it with our release builds.

To overcome this you can follow these guidelines:

1.	Always be sure to override files and not modify the original source file. This is true for both CSS and JavaScript code. Simply load your version of the CSS after ours to apply your latest changes. HTML files can be diffed (see below).
2.	Our code base is modulated and uses 100% object oriented design pattern. This allows you to sub class (aka inherit) from our classes and make your applied changes (use _.extend to mixin).
3.	You can also use pre-processor scripts which replace code segments automatically using directives.
4.	And finally, even while following steps 1-3 you may find that your code is broken due to design changes in the original repository. That’s when GitHub comes to the rescue. When your fork the source repository, you can always merge the tree onto your forked project. Use source control diff tool to merge the changes into your code and resolve any conflicts.

With the above steps you can ensure that your source code is fully customizable while still keeping it synchronized with our ongoing development efforts.
And if you built something wonderful, just send us a pull request so we check it out. 
If we like what you did we we will merge it into our code base, so you will always receive it when you fetch our changes.

If you are not a developer you can hire professional, inexpensive help from sites like oDesk and Freelancer.
Just post you are looking for a JavaScript, jQuery, Backbone experienced developer.



License:
------------------------------------------------------------------------
- The SignageStudio Web Lite and Pepper SDK are available under GPL V3 3 https://github.com/born2net/signagestudio_web-lite/blob/master/LICENSE


