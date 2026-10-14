import { useAuthContext } from '../context/authContext.jsx';

export const useAuth = () => {
    return useAuthContext();
};

export default useAuth;
