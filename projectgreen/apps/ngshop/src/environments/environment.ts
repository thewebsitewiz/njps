const protocol: { [key: string]: string } = {
  prod: 'http://',
  dev: 'http://'
};
const host: { [key: string]: string } = {
  prod: 'www.njpotshop.com',
  dev: 'localhost'
};
const port: { [key: string]: number } = {
  prod: 3000,
  dev: 3000
};
const apiPath: { [key: string]: string } = {
  prod: 'api/v1/',
  dev: 'api/v1/'
};

const env = require("@anchor");

export const environment = {
  production: true,
  protocol: `${protocol[env]}`,
  host: `${host[env]}`,
  port: `${port[env]}`,
  apiPath: `${apiPath[env]}`,
  apiUrl: `${protocol[env]}${host[env]}:${port[env]}/${apiPath[env]}`,
  imageUrl: `${protocol[env]}${host[env]}`
}


