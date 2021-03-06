/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Component, createRef } from 'react';
import { withRouter } from "react-router-dom";
import styled from "styled-components";
import { Field, Form, CheckboxField, ConfirmButton } from "../../components/FormComponents";
import { AuthFrame } from "../../components/Frames";
import { Menu, MenuItem } from "../../components/NavComponents";
const ForgotLinkWrapper = styled.div`
    width: 80%;
    margin-left: auto;
    margin-right: auto;
    text-align: center;
    padding-top: 24px;
    border-top: solid 1px rgba(255, 255, 255, .3);
    transition: all 0.5s ease;

    & a {
        color: rgba(255, 255, 255, .7);
        font-weight: 400;
        font-size: 13px;
        text-decoration: none;
    }
`;
class Login extends Component {
    constructor(props) {
        super(props);
        this.nickNameOrEmail = createRef();
        this.password = createRef();
    }
    onGoToRegistration = () => this.props.history.push( "/auth/registration" );

    onSubmitLoginForm = async ( event ) => {
        // TODO: Добавить валидацию данных перед отправкой, чтобы не стучать по серверу зря
        event.preventDefault();
        const body = {
            nickNameOrEmail: event.target.elements.nickNameOrEmail.value,
            password: event.target.elements.password.value
        };
        console.log('body: ', body);
        // TODO: вызов какого-то action для запроса входа в аккаунт взятого из глобального контекста
    }
    render() {
        // TODO: if(globalcontext.isAuthorized) return <Redirect to="/auth/welcome"/>
        return (
            <AuthFrame>
                <Menu>
                    <MenuItem isActive={ true }>
                        Sign in
                    </MenuItem>
                    <MenuItem onClick={ this.onGoToRegistration }>
                        Sign up
                    </MenuItem>
                </Menu>

                <Form onSubmit={ this.onSubmitLoginForm }>
                    <Field name="nickNameOrEmail" type="text" autoComplete="username">
                        Почта или никнейм
                    </Field>
                    <Field name="password" type="password" autoComplete="current-password">
                        Пароль
                    </Field>
                    <CheckboxField name="rememberMe">
                        Запомнить меня
                    </CheckboxField>
                    <ConfirmButton>
                        Войти
                    </ConfirmButton>
                </Form>
                <ForgotLinkWrapper>
                    <a href="#"
                        // TODO: Здесь обработать клик нормально используя Link из react-router-dom
                    >
                        Забыли пароль?
                    </a>
                </ForgotLinkWrapper>
            </AuthFrame>
        );
    }
}

export default withRouter(Login);
