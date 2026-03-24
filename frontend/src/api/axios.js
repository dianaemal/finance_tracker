import axios from "axios"

const baseURL = "http://localhost:8000"
const api = axios.create({
    baseURL: baseURL,
    timeout: 30000,
    withCredentials: true // Mandatory to send/receive cookies
})

const refreshAxios = axios.create({
    baseURL: baseURL,
    timeout: 30000, // 10 seconds for refresh token requests
    withCredentials: true
});


api.interceptors.response.use(
    // In normal scenario, return the response
    (res)=> res,
    // In case of an error:
    async (error)=> {
        console.log(error)
        /* Axios will have the origional request in error.config object*/
        const origionalRequest = error.config
        /* To avoid infinite loop, we add a flag _retry to our object*/
        if(!origionalRequest._retry && error.response?.status === 401){
            origionalRequest._retry = true;
            try{
                await refreshAxios.post("/auth/refresh")
                /* return the origional request*/
                return api(origionalRequest)
            }catch(err){
                console.log(err)
                /* redirect to login page*/
                window.location.href = '/login';
                return;
            }
        }
        return Promise.reject(error);
    }
    
)
export default api;