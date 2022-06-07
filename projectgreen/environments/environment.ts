

const protocol = 'http://';
const host = 'localhost:3000/';
const apiPath = 'api/v1/';

export const environment = {
  production: false,
  protocol: 'http://',
  host: 'localhost:3000/',
  apiPath: 'api/v1/',
  apiUrl: `${protocol}${host}${apiPath}`,
  imageUrl: `${protocol}${host}`
};

/*
const protocol = 'http://';
const host = 'www.njpotshop.com:3000/';
const apiPath = 'api/v1/';

export const environment = {
  production: true,
  protocol: 'https://',
  host: 'www.njpotshop.com:3000/',
  apiPath: 'api/v1/',
  apiUrl: `${protocol}${host}${apiPath}`,
  imageUrl: `${protocol}${host}`
}
*/

