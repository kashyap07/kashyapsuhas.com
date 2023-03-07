const urlPre =
  process.env.NODE_ENV !== 'production' ? 'http://localhost:3000' : 'https://www.kashyapsuhas.com';

/**
 * get last 5 images from Instagram along with url and caption for alt
 * @returns Array
 */

const getProcessedIGImages = (items = 5) => {
  return new Promise((resolve, reject) => {
    fetch(`https://www.kashyapsuhas.com/api/get-ig-images`, {
      method: 'GET',
    })
      .then(async response => {
        const a = await response.json();
        console.log({ response });
        resolve(a);
      })
      .catch(err => {
        console.log({ err });
        reject(err);
      });
  });
};

export default getProcessedIGImages;
