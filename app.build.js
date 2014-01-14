({
    /// entire structure to: ./dist
    /*
    appDir: "./",
    baseUrl: "./",
    dir: "./dist",
    mainConfigFile: "main.js",
    name: "main",
    optimizeCss: "standard"
    */
    /// compile used content only to main-built.js

     baseUrl: "./",
     mainConfigFile: "main.js",
     name: "main",
     optimizeCss: "standard",
     out: "main-built.js",
     include: ["_common/_js/requirejs/require.js"]
})