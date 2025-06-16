import axios from "axios";

var accessToken = localStorage.getItem('user');

export const Client = axios.create({
  headers: {
    "Content-Type": "multipart/form-data",
    "Accept": "application/json",
    "Authorization": `Bearer ${accessToken}`
  },
});

export const ErrorFunction = (error) => {

    if(error?.response?.data?.error == "Invalid token" || error?.response?.data?.error == "Token expired" || error?.response?.data?.error == "Token not found"){
        localStorage.removeItem('user');
        console.clear();
        console.log('ErrorFunction');
        window.location.href = "/user/login";
        return error;
    }
    return error;
}
