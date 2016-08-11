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

function main(dir, concurrency) {
  let filenames;

  readdir(dir).then(
    (files) => {
      filenames = files;
      return Promise.map(files,
        (fd) => {
          return jimp.read(dir + "/" + fd).then( im => ({ "phash": im.hash(), "file": fd}) );
        },
        {"concurrency": concurrency}
      )
    }
  ).then (
    (hashes) => {
      return hashes.reduce(
        (acc, elem) => {
          if(!acc[elem.phash])
            acc[elem.phash] = [];
          acc[elem.phash].push(elem.file);
          return acc;
        }, []
      );
    }
  ).then (
    (output) => {
      for(key in output) {
        console.log(key + "\n" + output[key].join(' ') + "\n");
      }
    }
  ).catch(
    (err) => {
      console.error(err);
    }
  )
}

if(process.argv.length < 2+1) {
  console.error("Usage: [image directory]");
  process.exit(1);
}

main(process.argv[2].trim(), 100);
