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
  let paths = [];

  function dfs(g, u, start, vis) {
    for(let i = 0; i < g.length; i++) {
      if(!vis[i] && g[u][i]) {
        vis[i] = true;
        if(!paths[start])
          paths[start] = [];
        paths[start].push(filenames[i]);
        dfs(g, u, start, vis);
      }
    }
  }

  readdir(dir).then(
    (files) => {
      filenames = files;
      return Promise.map(files,
        (fd) => {
          return jimp.read(dir + "/" + fd).then( (im) => { return im.hash(); });
        },
        {"concurrency": concurrency}
      )
    }
  ).then(
    (hashes) => {
      let graph = [];
      console.log(hashes);
      graph.length = hashes.length;
      for(let i = 0; i < hashes.length; i++) {
        graph[i] = [];
        graph[i].length = hashes.length;
      }
      for(let i = 0; i < hashes.length; i++) {
        for(let j = i+1; j < hashes.length; j++) {
          // console.log(filenames[i], filenames[j], hashes[i], hashes[i].length, hashes[j], hashes[j].length);
          let distance = hamming(
            new Buffer(hashes[i], "base64"),
            new Buffer(hashes[j], "base64")
          );

          if(distance <= threshold) {
            graph[i][j] = graph[j][i] = true;
          }
        }
      }
      return graph;
    }
  ).then (
    (graph) => {
      let visited = [], start = 0;

      visited.length = graph.length;
      for(let i = 0; i < graph.length; i++)
        visited[i] = false;
      visited[0] = true;

      for(let i = 0; i < graph.length; i++) {
        visited[i] = true;
        dfs( graph, i, i, visited);
      }

      return;
    }
  ).then (
    () => {
      return paths.reduce(
        (acc, p, idx) => {
          if(!p) {
            return acc + str;
          }
          else {
            return acc +
              sprintf( "%s %s\n", filenames[idx], p.join(' ') );
          }
        },
        ""
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

if(process.argv.length < 2+2) {
  console.error("Usage: [image directory] [threshold]");
  process.exit(1);
}

main(process.argv[2].trim(), parseInt(process.argv[3]), 100);
