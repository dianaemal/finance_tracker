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

let isRefreshing = false;
let refreshQueue = [];

api.interceptors.response.use(
    // In normal scenario, return the response
    (res)=> res,
    // In case of an error:
    async (error)=> {
        console.log(error)
        /* Axios will have the origional request in error.config object*/
        const originalRequest = error.config
        console.log(originalRequest)

        /* Check if this is a login request that failed */
        const isLoginRequest = originalRequest.url && originalRequest.url.includes('auth/login');
        if (isLoginRequest) {
            return Promise.reject(error);
        }


        /* To avoid infinite loop, we add a flag _retry to our object*/
        if(!originalRequest._retry && error.response?.status === 401){
            originalRequest._retry = true;

            //  If already refreshing → wait
            if (isRefreshing){
                return new Promise((resolve, reject)=>{
                    refreshQueue.push({resolve, reject})
                })
                .then(()=> api(originalRequest))
                .catch((err)=> Promise.reject(err))

                }
            isRefreshing = true;
            try{
                await refreshAxios.post("/auth/refresh")
                //  retry all queued requests
                refreshQueue.forEach((p) => p.resolve());
                refreshQueue = [];
                /* return the origional request*/
                return api(originalRequest)
            }catch(err){
                refreshQueue.forEach((p) => p.reject(err));
                refreshQueue = [];
                console.log(err)
                /* redirect to login page*/
                
                window.location.href = '/login';
                return;
                
            }finally{
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
    
)
export default api;