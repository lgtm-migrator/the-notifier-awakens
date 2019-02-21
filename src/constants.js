export const API_HOST =
  process.env.REACT_APP_API_HOST || 'https://passoa.online.ntnu.no';
export const API_ROOT = process.env.REACT_APP_API_ROOT || 'api';
export const API_URL = `${API_HOST}/${API_ROOT}`;
export const DEBUG = (process.env.REACT_APP_DEBUG || 'false') === 'true';
const targetWhitelist = process.env.REACT_APP_TARGET_WHITELIST
  ? process.env.REACT_APP_TARGET_WHITELIST.split(',')
  : [];
export const whiteList = ['abakus.no'].concat(targetWhitelist);
