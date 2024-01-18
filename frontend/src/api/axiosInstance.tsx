// axiosInstance.js
import axios from 'axios';
import Cookies from 'js-cookie';

// Function to get the token from the cookie
const getTokenFromCookie = () => {
    return Cookies.get('myCookie'); // Replace 'your_cookie_name' with the actual cookie name
};
console.log(getTokenFromCookie());

const instance = axios.create({
    baseURL: 'https://task.ardapektezol.com/api/', // Set your base URL here
    headers: {
        'Authorization': `${getTokenFromCookie()}`, // Set your Authorization header value from the cookie
        'Content-Type': 'application/json', // You can add other common headers here
    },
});

export default instance;
