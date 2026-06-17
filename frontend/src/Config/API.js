import axios from "axios";

const API = axios.create({
    baseURL:"http://localhost:5241",
    withCredentials:true,
    headers:{
        "Content-Type":"multipart/form-data"
    }
})

export default API;