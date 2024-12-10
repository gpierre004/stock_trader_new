import { useSelector, useDispatch } from 'react-redux';
import { logout as logoutAction } from '../features/Auth/authSlice';

const useAuth = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user, token } = useSelector((state) => state.auth);

  const logout = () => {
    dispatch(logoutAction());
  };

  return {
    isAuthenticated,
    user,
    token,
    logout
  };
};

export default useAuth;
