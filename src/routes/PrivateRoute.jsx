import React, { Children } from 'react';

const PrivateRoute = ({Children}) => {
    const {user, loading} = useAuth();
    if(loading){
        return <span className="loading loading-spinner loading-xl"></span>
    }
    if(!user){
        return <Navigate to="/src/pages/Authentication/Login/Login" replace></Navigate>
    }

    return Children
};

export default PrivateRoute;