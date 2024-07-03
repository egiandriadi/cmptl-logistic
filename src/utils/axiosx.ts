import axios, { InternalAxiosRequestConfig } from "axios";
import { LocalStorage } from "node-localstorage";
var localStorage = new LocalStorage("./data-ninja");
export const client = axios.create();

// interceptors to a custom instance of axios.
const requestHandler = async (config: InternalAxiosRequestConfig<any>) => {
  const accessToken = await getToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
};

client.interceptors.request.use(requestHandler);

client.interceptors.response.use(response => {
  return response;
});

const getToken = async () => {
  const checkToken = await localStorage.getItem("token");

  return checkToken;
};
