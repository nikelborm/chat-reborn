import React from "react";
import { render } from "react-dom";
import { BrowserRouter } from "react-router-dom";
import Chat from "./pages/Chat";
import "./cleaner.css";
// import Authorize from "./pages/Authorize";

render(
    <div id="app">
        <React.StrictMode>
            <BrowserRouter>
                <Chat />
                {/* TODO: Добавить также роут на котором можно посмотреть информацию о пользователе системы */}
                {/* TODO: Добавить роут с настройками пользовательского профиля и интерфейса */}
                {/* <Switch>
                    <AuthorizeRoute exact path="/auth"/>
                    <ChatRoute exact path="/chat"/>
                    <LogoutRoute exact path="/logout"/>
                    <Route path="*">
                        <Redirect to="/"/>
                    </Route>
                </Switch> */}
            </BrowserRouter>
        </React.StrictMode>
    </div>,
    document.getElementById("root")
);
