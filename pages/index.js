import marked from "marked";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

/**
 * Promise all
 * @author Loreto Parisi (loretoparisi at gmail dot com)
 */
function promiseAllP(items, block) {
  var promises = [];
  items.forEach(function (item, index) {
    promises.push(
      (function (item, i) {
        return new Promise(function (resolve, reject) {
          return block.apply(this, [item, index, resolve, reject]);
        });
      })(item, index)
    );
  });
  return Promise.all(promises);
} //promiseAll

/**
 * read files
 * @param dirname string
 * @return Promise
 * @author Loreto Parisi (loretoparisi at gmail dot com)
 * @see http://stackoverflow.com/questions/10049557/reading-all-files-in-a-directory-store-them-in-objects-and-send-the-object
 */
function readFiles(dirname) {
  return new Promise((resolve, reject) => {
    fs.readdir(dirname, function (err, filenames) {
      if (err) return reject(err);
      promiseAllP(filenames, (filename, index, resolve, reject) => {
        fs.readFile(
          path.resolve(dirname, filename),
          "utf-8",
          function (err, content) {
            if (err) return reject(err);
            return resolve({ filename: filename, contents: content });
          }
        );
      })
        .then((results) => {
          return resolve(results);
        })
        .catch((error) => {
          return reject(error);
        });
    });
  });
}

export async function getStaticProps() {
  let frontMatters = [];
  await readFiles("Blog").then((files) => {
    files.forEach((post) => {
      let fm = matter(post.contents);

      // date is date object.
      // console.log(fm.data.creation_date.getTime());
      fm.data.creation_date = fm.data.creation_date.getTime();
      frontMatters.push(fm.data);
      console.log(fm.data);
    });
  });

  return {
    props: {
      frontMatterData: frontMatters,
    },
  };
}

const Home = (props) => {
  // call it file meta data or something and also have title (slug)
  const fm = props.frontMatterData;

  return (
    <main className="mb-auto">
      <div className="flex flex-col gap-4 sm:mt-20 font-bold text-5xl">
        <span>Hello 👋. I&apos;m Suhas.</span>
        <span>This is my slice on the Interwebs.</span>
        <span>Woldein for full site. Coming Soon™.</span>
        {/* <div
          dangerouslySetInnerHTML={{ __html: asd }}
          className="prose max-w-none"
        /> */}
        {fm.map((item, index) => {
          return <div key={index}>{item.title}</div>;
        })}
      </div>
    </main>
  );
};

export default Home;
