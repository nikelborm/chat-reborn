import React, { Component } from 'react';
import { Redirect, Route, Switch } from "react-router-dom";
import AuthWrapper from "./components/AuthWrapper";
import LoginRoute from "./pages/Login";
import RegistrationRoute from "./pages/Registration";
import WelcomeRoute from "./pages/Welcome";
import "./components/index.css";
class Auth extends Component {
    render() {
        return (
            <AuthWrapper>
                <Switch>
                        <RegistrationRoute  exact path="/auth/registration"/>
                        {/* <ConfirmRegistrationRoute  exact path="/auth/confirmRegistration"/> */}
                        {/* <SuccessRegistrationRoute  exact path="/auth/successRegistration"/> */}
                        <WelcomeRoute  exact path="/auth/welcome"/>
                        <LoginRoute  exact path="/auth/login"/>
                        {/* <RestorePasswordRoute  exact path="/auth/restorePassword"/> */}
                        {/* <ChangePasswordRoute  exact path="/auth/changePassword"/> */}
                        <Route path="*">
                            <Redirect to="/"/>
                        </Route>
                </Switch>
            </AuthWrapper>
        );
    }
}

export default Auth;
