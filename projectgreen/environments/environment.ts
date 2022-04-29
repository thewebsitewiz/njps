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
