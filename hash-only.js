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
          let h = (jimp.read("images/" + f)).hash();
          console.log(h);
          return h;
        }
      )
    );
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
