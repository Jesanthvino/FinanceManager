import axios from "axios";

const apiBaseUrl = process.env.REACT_APP_BACKEND_URL;

const instance = axios.create({
  baseURL:apiBaseUrl,
  headers: {
    "Content-Type": "application/json"
  }
});

export default instance;
