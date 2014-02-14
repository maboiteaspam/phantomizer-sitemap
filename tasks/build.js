'use strict';

module.exports = function(grunt) {

  var wrench = require('wrench'),
    util = require('util');
  //-
  var ph_libutil  = require("phantomizer-libutil");
  var path        = require("path");
  var fs          = require("fs");
  var ProgressBar = require("progress");

  grunt.registerMultiTask("phantomizer-sitemap",
    "Generates sitemap for a phantomizer project", function(){

    var options = this.options({
      target_path:"export/",
      file_name:"sitemap.xml",
      base_location:"http://localhost/"
    });

    var done = this.async();

    // get phantomizer main instance
    var phantomizer = ph_libutil.get("main");
    var router = phantomizer.get_router();
    router.load(function(){

      var sitemap_fn = options.target_path+"/"+options.file_name;
      if( fs.existsSync(sitemap_fn) ) fs.unlinkSync(sitemap_fn)

      var output = "";
      var eol = "\n";
      var tab = "\t";
      var base_location = options.base_location.substr(-1)=="/"?options.base_location:options.base_location+"/";
      if( ! base_location.match(/^https?:\/\//) &&
        ! base_location.match(/^:\/\//) ){
        base_location = "http://"+base_location;
      }

      // fetch urls to build
      var not_added = [];
      var meta_urls = router.collect_meta_urls(function(route){
        if( route.export == false ){
          not_added.push(route);
          return false;
        }
        if( route.sitemap == false ){
          not_added.push(route);
          return false;
        }
        return true;
      });
      grunt.log.ok("URL to process: "+meta_urls.length+"/"+(meta_urls.length+not_added.length));

// initialize a progress bar
      var bar = new ProgressBar(' done=[:current/:total] elapsed=[:elapseds] sprint=[:percent] eta=[:etas] [:bar]', {
        complete: '#'
        , incomplete: '-'
        , width: 80
        , total: meta_urls.length
      });

      for( var n in meta_urls ){
        var meta = meta_urls[n].meta;
        if( meta.sitemap != false &&  meta.export != false ){
          var last_mod = meta.sitemap&&meta.sitemap.last_mod || meta.last_mod || false;
          var changefreq = meta.sitemap&&meta.sitemap.changefreq || meta.changefreq || false;
          var priority = meta.sitemap&&meta.sitemap.priority || meta.priority || false;

          var url = meta_urls[n].url;
          url = url.substr(0,1)=="/"?url.substr(1):url;
          url = base_location + url;

          output += tab + '<url>' + eol;
          output += tab + tab + '<loc>'+ url +'</loc>' + eol;
          if( last_mod !== false )
            output += tab + tab + '<lastmod>'+last_mod+'</lastmod>' + eol;
          if( changefreq !== false )
            output += tab + tab + '<changefreq>'+changefreq+'</changefreq>' + eol;
          if( priority !== false )
            output += tab + tab + '<priority>'+priority+'</priority>' + eol;
          output += tab + '</url>' + eol;
          bar.tick();
        }
      }

      if( output != "" ){
        output += "</urlset>";
        output = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + eol +output;
        output = '<?xml version="1.0" encoding="UTF-8"?>' + eol +output;
        wrench.mkdirSyncRecursive(options.target_path, "0777");
        fs.writeFileSync(sitemap_fn, output);
      }
      grunt.log.ok();
      done(true);
    })
  });


};