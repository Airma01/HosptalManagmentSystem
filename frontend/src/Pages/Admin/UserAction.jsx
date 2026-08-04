import React from "react";
import { useNavigate } from "react-router-dom";
import API from "../../Config/API";

const UserAction = () => {
    const navigate = useNavigate(); 
    const { id } = useParams();


    return (
        <div>
            <h1>{id}</h1>
            {/* Render user action UI here */}
        </div>
    );
};

export default UserAction;