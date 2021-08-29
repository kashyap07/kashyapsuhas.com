/**
 * too much work
 * steps to follow maybe in the furure:
 *  setup /auth to redirect to ig login page to fetch auth code
 *  user user code to generate short lived auth token
 *  make server catch it, add client secret and get long lived auth token
 *  long live token lasts for 60 days
 *  then every 60 days log in to that ig page to fetch and do the whole thing
 *
 */

const { ACCESS_TOKEN } = process.env;

const getIGImages = async (req, res) => {
  try {
    const response = await fetch(
      `https://graph.instagram.com/me/media?fields=id,media_url,permalink,caption&access_token=${ACCESS_TOKEN}`,
      {
        method: "GET",
        redirect: "follow",
      }
    );

    if (!response.ok) {
      const message = `An error has occured: ${response.status}`;
      throw new Error(message);
    }

    const body = await response.json();
    res.status(200).json(body);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

export default getIGImages;
