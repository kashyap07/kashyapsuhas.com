import getProcessedIGImages from "../utils/getProcessedIGImages";
import Link from "next/link";
import { useRouter } from "next/router";

export async function getServerSideProps() {
  const posts = await getProcessedIGImages(5);
  console.log(posts);

  return {
    props: {
      posts: posts,
    },
  };
}

const RecentInstagrams = ({ className, ...props }) => {
  const { posts } = props;
  const router = useRouter();

  return (
    <div data-component="recent-instagrams" className="flex">
      {router.isFallback ? (
        <span>Loading post, please wait...</span>
      ) : (
        <div>
          {posts.map((post) => (
            <Link key={post.id} href={post.permalink}>
              <a className="px-3 py-0.5 h-fit-content font-medium rounded-full hover:nav-button-hover">
                {post.media_url}
              </a>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentInstagrams;
