StudioLite, Digital Signage for the rest of us
---------------------------------------

<!-- [![NPM](https://nodei.co/npm/studiolite.png)](https://nodei.co/npm/studiolite/) -->

<p align="center">  
  <img src="http://www.digitalsignage.com/files/techlogos.png">
</p>


------------------------------------------------------------------------

StudioLite is an open source, 100% FREE, Digital Signage platform that was designed with ease of use in mind.
With StudioLite anyone can have a Digital Signage solution that is entirely customizable. 
Take the source code, modify it, brand it and build a product that's right for you and your customers.
Best of all, you will take full advantage of the world's most popular Digital Signage cloud so you don't have to worry about backend programming or even setup a server, it's all done for you using the mediaCLOUD.

 - Based on the poplar SignageStudio Pro ( [MediaSignage]: http://www.DigitalSignage.com )
 - Connected to a private mediaSERVER or the public free mediaCLOUD
 - 100% open source based on GNU V3 license
 - Contributors are welcome, fork, modify and send pull requests
 - Powered by Google's Angular Framework + TypeScript +  ngrx 

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
- Angular: https://angular.io/

Technical data:
------------------------------------------------------------------------
- Build on top the latest version Google's Angular framework with a clean MV* design
- Developed using the latest version of TypeScript and ngrx store
- Powered by Bootstrap using responsive design for phones, tablets and desktops
- Lazy loaded modules for best user load experience
- Driven using Soap API and includes Helper SDK
- Uses a local msdb (database) through SDK for offline work
- Support Angular AOT mode
- Support available through the MediaSignage support forum

Installation:
------------------------------------------------------------------------

StudioLite can be downloaded directly from GitHub
With git you will be able to easily update to the latest version of StudioLite as well as take advantage Angular CLI which is included in the bundle

to install and host:
```
git clone https://github.com/born2net/studio-lite.git
cd studio-lite
npm install -g @angular/cli@latest
npm install
open browser to: http://localhost:4208/
```

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
Since Angular is an opinionated framework, any developer who is verse in Angular, will be able to quickly customize a solution for your own business logic. 

previous version:
------------------------------------------------------------------------
If you are looking for the previous version of StudioLite which was developed using BackboneJS, go to the branch:
 - https://github.com/born2net/studio-lite/tree/studiolite-backbone

License:
------------------------------------------------------------------------
The SignageStudio Web Lite and Pepper SDK are available under GPL
 - V3 https://github.com/born2net/studio-lite/blob/master/LICENSE



