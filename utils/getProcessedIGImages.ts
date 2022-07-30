const urlPre =
  process.env.NODE_ENV !== 'production' ? 'http://localhost:3000' : 'https://www.kashyapsuhas.com';

/**
 * get last 5 images from Instagram along with url and caption for alt
 * @returns Array
 */
const getProcessedIGImages = async (items = 5) => {
  try {
    const response = await fetch(`${urlPre}/api/get-ig-images`, {
      method: 'GET',
    });

    if (!response.ok) {
      const message = `An error has occured: ${response.status}`;
      throw new Error(message);
    }

    const body = await response.json();
    return body.data.slice(0, items);
  } catch (err) {
    console.log(err);
    return false;
  }
};

export default getProcessedIGImages;
