import axios from "axios"

const baseURL = import.meta.env.VITE_API_URL
const api = axios.create({
    baseURL: baseURL,
    timeout: 30000
})

const refreshAxios = axios.create({
    baseURL: baseURL,
    timeout: 30000
});

let isRefreshing = false;
let refreshQueue = [];

const getAccessToken = () => localStorage.getItem("access_token");
const getRefreshToken = () => localStorage.getItem("refresh_token");

const setTokens = ({ access_token, refresh_token }) => {
    if (access_token) {
        localStorage.setItem("access_token", access_token);
    }
    if (refresh_token) {
        localStorage.setItem("refresh_token", refresh_token);
    }
};

const clearTokens = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
};

api.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

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
                const refreshToken = getRefreshToken();
                if (!refreshToken) {
                    throw new Error("No refresh token available");
                }
                const refreshResponse = await refreshAxios.post("/auth/refresh", {
                    refresh_token: refreshToken
                });
                setTokens(refreshResponse.data);
                //  retry all queued requests
                refreshQueue.forEach((p) => p.resolve());
                refreshQueue = [];
                /* return the origional request*/
                return api(originalRequest)
            }catch(err){
                refreshQueue.forEach((p) => p.reject(err));
                refreshQueue = [];
                console.log(err)
                clearTokens();
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