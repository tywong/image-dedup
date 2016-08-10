var fs = require('fs');
var jimp = require('jimp');
var Promise = require('bluebird');
var hamming = require('hamming-distance');
var sprintf = require("sprintf-js").sprintf ;

function readdir(dir) {
  return new Promise(
    (fufill, reject) => {
        fs.readdir(dir,
          (err, data) => {
            if(err) reject(err);
            fufill(data);
          });
    }
  );
}

function main(dir, threshold, concurrency) {
  let filenames;

  readdir(dir).then(
    (files) => {
      filenames = files;
      return Promise.map(files,
        (fd) => {
          return jimp.read("images/" + fd).then( (im) => { return im.hash(); });
        },
        {"concurrency": concurrency}
      )
    }
  ).then(
    (hashes) => {
      let matches = [];
      for(let i = 0; i < hashes.length; i++) {
        matches[i] = {"name" : filenames[i]};
        for(let j = i+1; j < hashes.length; j++) {
          let distance = hamming(
            new Buffer(hashes[i], "base64"),
            new Buffer(hashes[j], "base64")
          );

          if(distance < threshold) {
            if(matches[i].match === undefined)
              matches[i].match = [];

            matches[i].match.push(filenames[j]);
          }
        }
      }
      return matches;
    }
  ).then (
    (matches) => {
      return matches
        .filter( m => m.match )
        .reduce( (acc, m) => {
          return acc + sprintf("%s %s\n", m.name, m.match.join(' '));
        }, "");
    }
  ).then (
    (output) => {
      console.log(output);
    }
  ).catch(
    (err) => {
      console.error(err);
    }
  )
}

main("small", 10, 100);
