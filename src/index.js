import React from "react";
import { render } from "react-dom";
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";
import styled from "styled-components";
import ChatRoute from "./pages/Chat";
import RegistrationRoute from "./pages/Registration";
import SuccessRegistrationRoute from "./pages/SuccessRegistration";
import WelcomeRoute from "./pages/Welcome";
import LoginRoute from "./pages/Login";
import "./cleaner.css";
import bgimage from "./1.jpg";
const BackgroundWrapper = styled.div`
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center center;
    background: linear-gradient(#000a, #000a), url(${ bgimage }) no-repeat center center fixed;
    background-size: cover;
`;

render(
    <React.StrictMode>
        <BackgroundWrapper>
            <BrowserRouter>
                <Switch>
                    {/* TODO: Добавить также роут на котором можно посмотреть информацию о пользователе системы */}
                    {/* TODO: Добавить роут с настройками пользовательского профиля и интерфейса */}
                    {/* Роут с формой для создания аккаунта */}
                    <RegistrationRoute exact path="/auth/registration"/>
                    {/* Роут на котором показывается сообщение чтобы проверить почту */}
                    <SuccessRegistrationRoute exact path="/auth/successRegistration"/>
                    {/* Роут с формой на вход, который при успешном входе рендерит редирект на welcome */}
                    <LoginRoute exact path="/auth/login"/>
                    {/* Роут на который ведёт ссылка из письма и который делает запрос к беку на подтверждение аккаунта*/}
                    {/* Бэк кидает инфу и пользователе. Глобальный обработчик принимает её, потом устанавливает пользователя как авторизованного */}
                    {/* Потом Идёт ререндер и та же форма входа делает редирект на welcome */}
                    {/* <ConfirmRegistrationRoute exact path="/auth/confirmRegistration"/> */}
                    {/* Роут с 5 секундным приветствием вошедшего аккаунта */}
                    <WelcomeRoute exact path="/auth/welcome"/>
                    {/* Форма с вводом почты чтобы восстановить пароль */}
                    {/* <RestorePasswordRoute exact path="/auth/restorePassword"/> */}
                    {/* Форма с паролем и повтором пароля на которую попадает пользователь при смене пароля. А попадает он на неё из ссылки из письма */}
                    {/* А ссылка содержит в себе также email и токен */}
                    {/* И когда пользователь вводит два пароля в бек вместе с ними отправляются токен с мылом */}
                    {/* TODO: Чекнуть надо ли тут и как добавить email и токен в ссылке */}
                    {/* <ChangePasswordRoute exact path="/auth/changePassword"/> */}
                    <ChatRoute exact path="/chat"/>
                    {/* <LogoutRoute exact path="/logout"/> */}
                    <Route path="*">
                        <Redirect to="/auth/login"/>
                    </Route>
                </Switch>
            </BrowserRouter>
        </BackgroundWrapper>
    </React.StrictMode>,
    document.getElementById("root")
);
