var fs = require('fs');
var jimp = require('jimp');
var Promise = require('bluebird');

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

main("images", 0.1, 100);
