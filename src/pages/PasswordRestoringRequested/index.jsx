// TODO: render(if(globalcontext.isAuthorized) return <Redirect to="/auth/welcome"/>)
import React from "react";
import { withRouter } from "react-router-dom";

const PasswordRestoringRequested = props => <span> PasswordRestoringRequested </span>;

export default withRouter( PasswordRestoringRequested );
