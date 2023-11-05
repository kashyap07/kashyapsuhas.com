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

const getIGImages = async (req: any, res: any) => {
  const fetchImages = new Promise((resolve, reject) => {
    fetch(
      `https://graph.instagram.com/me/media?fields=id,media_url,permalink&access_token=${ACCESS_TOKEN}`,
      {
        method: 'GET',
        redirect: 'follow',
      },
    )
      .then(async response => {
        const body = await response.json();
        resolve(body);
      })
      .catch(err => {
        const message = `An error has occured: ${err.status}`;
        reject(message);
      });
  });

  // TODO: clean this up perhaps
  const response = await fetchImages;
  res.status(200).json(response);
};

export default getIGImages;
