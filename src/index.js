import React from "react";
import { render } from "react-dom";
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";
// import Chat from "./pages/Chat";
import Auth from "./pages/Auth";
import "./cleaner.css";

render(
    <React.StrictMode>
        <BrowserRouter>
            {/* <Chat /> */}
            {/* <Authorize /> */}
            {/* TODO: Добавить также роут на котором можно посмотреть информацию о пользователе системы */}
            {/* TODO: Добавить роут с настройками пользовательского профиля и интерфейса */}
            <Switch>
                <Auth exact path="/auth/*"/>
                {/* <ChatRoute exact path="/chat"/> */}
                {/* <LogoutRoute exact path="/logout"/> */}
                <Route path="*">
                    <Redirect to="/"/>
                </Route>
            </Switch>
        </BrowserRouter>
    </React.StrictMode>,
    document.getElementById("root")
);
