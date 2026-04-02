import React from 'react';
import { AuthContext } from '../contexts/AuthContext/AuthContext';

const useAuth = () => {
   const authInfo = React.useContext(AuthContext);
   return authInfo;

};

export default useAuth;