import PasswordRestoringRequestedRoute from "./pages/PasswordRestoringRequested";
import RegistrationRequestedRoute      from "./pages/RegistrationRequested";
import ConfirmRegistrationRoute        from "./pages/ConfirmRegistration";
import RestorePasswordRoute            from "./pages/RestorePassword";
import ChangePasswordRoute             from "./pages/ChangePassword";
import RegistrationRoute               from "./pages/Registration";
import WelcomeRoute                    from "./pages/Welcome";
import LoginRoute                      from "./pages/Login";
import ChatRoute                       from "./pages/Chat";

import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";
import styled from "styled-components";
import bgimage from "./styles/1.jpg";

const BackgroundWrapper = styled.div`
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center center;
    background: linear-gradient(#000a, #000a), url(${ bgimage }) no-repeat center center fixed;
    background-size: cover;
`;
// TODO: Интересная идея возникла в том чтобы использовать роуты не так, как сейчас типа High Ordered Components
// TODO: А использовать обычные роуты и передавать им пропс component в котором решать какой компонент передать
// TODO: И решать на основе того, что было передано через consumer глобального контекста. То есть и provider и consumer
// TODO: прямо в одном месте. А вложенные consumer`ы будут работать также как и раньше. Единственный вопрос который возникает
// TODO: это же ведь приложение будет перерендериваться каждый раз когда будет меняться контекст
const App = props => (
    <BackgroundWrapper>
        <BrowserRouter>
            <Switch>
                <RegistrationRoute exact path="/auth/registration"/>
                    {/* TODO: Добавить также роут на котором можно посмотреть информацию о пользователе системы */}
                    {/* TODO: Добавить роут с настройками пользовательского профиля и интерфейса */}
                    {/* Роут с формой для создания аккаунта */}
                <RegistrationRequestedRoute exact path="/auth/registrationRequested"/>
                    {/* Роут на котором показывается сообщение чтобы проверить почту */}
                <ConfirmRegistrationRoute exact path="/auth/confirmRegistration"/>
                    {/*
                        Исключительно функциональный Роут на который ведёт ссылка из письма и который делает
                        запрос к беку на подтверждение аккаунта. Бэк кидает инфу о пользователе или ошибку что
                        ссылка не валидна. Глобальный обработчик принимает ответ и думает либо редиректнуть на
                        welcome, либо на login. А как ConfirmRegistrationRoute поймёт, что пользователь
                        авторизовался или ошибка? Я думаю в глобальный стейт надо добавить пункт о валидности
                        ссылки и держать его либо null либо true либо undefined.
                    */}
                <LoginRoute exact path="/auth/login"/>
                    {/*
                        Роут с формой на вход, который при успешном входе рендерит редирект на welcome
                    */}
                <WelcomeRoute exact path="/auth/welcome"/>
                    {/* Роут с 5 секундным приветствием вошедшего аккаунта */}
                <RestorePasswordRoute exact path="/auth/restorePassword"/>
                    {/* Форма с вводом почты чтобы восстановить пароль */}
                <PasswordRestoringRequestedRoute exact path="/auth/passwordRestoringRequested"/>
                    {/* Декоративный роут с сообщением проверить почту. Такой же как и RegistrationRequestedRoute  */}
                <ChangePasswordRoute exact path="/auth/changePassword"/>
                    {/* Форма с паролем и повтором пароля на которую попадает пользователь при смене пароля. А попадает он на неё из ссылки из письма */}
                    {/* А ссылка содержит в себе также email и токен */}
                    {/* И когда пользователь вводит два пароля в бек вместе с ними отправляются токен с мылом */}
                    {/* TODO: Чекнуть надо ли тут и как добавить email и токен в ссылке */}
                <ChatRoute exact path="/chat"/>
                    {/* Понятное дело роут с чатом */}
                {/* <LogoutRoute exact path="/logout"/> */}
                    {/* Довольно сомнительное наличие роута выхода из аккаунта ну да ладно */}
                <Route path="*">
                    <Redirect to="/auth/login"/>
                </Route>
            </Switch>
        </BrowserRouter>
    </BackgroundWrapper>
);
export default App;
