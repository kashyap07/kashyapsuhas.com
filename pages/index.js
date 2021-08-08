import { readFiles } from "../utils/fileUtils";
import matter from "gray-matter";

export async function getStaticProps() {
  const frontMatters = [];
  await readFiles("Blog").then((files) => {
    files.forEach((post) => {
      let fm = matter(post.contents);

      // date is date object, fix this by modifying frontmatter config in forestry
      // console.log(fm.data.creation_date);
      let newFMData = { ...fm.data };
      newFMData.filename = post.filename;
      newFMData.creation_date = fm.data.creation_date.getTime();
      frontMatters.push(newFMData);
      console.log(newFMData);
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
        <div className="prose max-w-none">
          {fm.map((item, index) => {
            return (
              <div key={index}>
                <a href={`blog/post/${item.filename}`}>{item.title}</a>
                {/* <a href={`Blog/${item.filename}`}>{item.title}</a> */}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
};

export default Home;
