var fs = require('fs');
var jimp = require('jimp');

let THRESHOLD = 0.1;

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

let filenames;

readdir("images").then(
  (files) => {
    filenames = files;
    return Promise.all(
      files.map(
        (f) => {
          return jimp.read("images/" + f);
        }
      )
    );
  }
).then(
  (images) => {
    let matches = [];
    for(i = 0; i < images.length; i++) {
      for(j = i+1; j < images.length; j++) {
        let d = jimp.distance(images[i], images[j]);
        if(d < THRESHOLD) {
          if(matches[i] == undefined) {
            matches[i] = new Array();
          }
          matches[i].push(filenames[j]);
        }
      }
    }
    return Promise.resolve(matches);
  }
).then(
  (matches) => {
    let result = matches.filter((e) => {return e != undefined;}).map(
      (array, idx) => {
        return [filenames[idx], array.join(' ')].join(' ');
      }
    );
    return Promise.resolve(result);
  }
).then (
  (output) => {console.log(output);}
).catch(
  (err) => {console.error(err);}
)
