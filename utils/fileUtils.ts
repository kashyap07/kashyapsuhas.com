import fs from "fs";
import path from "path";

/**
 * Promise all
 * @author Loreto Parisi (loretoparisi at gmail dot com)
 */
function promiseAllP(
  items: any[],
  block: {
    (filename: any, index: any, resolve: any, reject: any): void;
    apply?: any;
  }
) {
  var promises: any[] = [];
  items.forEach(function (item: any, index: any) {
    promises.push(
      (function (item, i) {
        return new Promise(function (resolve, reject) {
          // @ts-ignore
          return block.apply(this, [item, index, resolve, reject]);
        });
      })(item, index)
    );
  });
  return Promise.all(promises);
}

/**
 * read files
 * @param dirname string
 * @return Promise
 * @author Loreto Parisi (loretoparisi at gmail dot com)
 * @see http://stackoverflow.com/questions/10049557/reading-all-files-in-a-directory-store-them-in-objects-and-send-the-object
 */
function readFiles(dirname: fs.PathLike) {
  return new Promise((resolve, reject) => {
    fs.readdir(dirname, function (err, filenames) {
      if (err) return reject(err);
      promiseAllP(
        filenames,
        (
          filename: string,
          index: any,
          resolve: (arg0: { filename: any; contents: string }) => void,
          reject: (arg0: NodeJS.ErrnoException) => void
        ) => {
          fs.readFile(
            // @ts-ignore
            path.resolve(dirname, filename),
            "utf-8",
            function (err, content) {
              if (err) return reject(err);
              return resolve({ filename: filename, contents: content });
            }
          );
        }
      )
        .then((results) => {
          return resolve(results);
        })
        .catch((error) => {
          return reject(error);
        });
    });
  });
}

export { readFiles };
