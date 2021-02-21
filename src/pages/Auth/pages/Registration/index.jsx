/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import { ConfirmButton, Field, Form } from "../../components/FormComponents";
import { LongFrame } from "../../components/Frames";
import { Menu, MenuItem } from "../../components/NavComponents";
class RegistrationRoute extends Component {
    onGoToLogin = () => this.props.history.push("/auth/login");

    onSubmitRegisterForm = async ( event ) => {
        // TODO: Добавить валидацию данных перед отправкой, чтобы не стучать по серверу зря
        event.preventDefault();
        const body = {
            nickName: event.target.elements.nickName.value,
            password: event.target.elements.password.value,
            confirmPassword: event.target.elements.confirmPassword.value,
            email: event.target.elements.email.value,
            fullName: event.target.elements.fullName.value
        };
        console.log('body: ', body);
        // TODO: вызов какого-то action для запроса входа в аккаунт взятого из глобального контекста
    };
    render() {
        return (
            <LongFrame>
                <Menu>
                    <MenuItem onClick={ this.onGoToLogin }>
                        Sign in
                    </MenuItem>
                    <MenuItem isActive={ true }>
                        Sign up
                    </MenuItem>
                </Menu>
                <Form onSubmit={ this.onSubmitRegisterForm }>
                    <Field name="fullName" type="text" autoComplete="name">
                        Полное имя
                    </Field>
                    <Field name="nickName" type="text" autoComplete="username">
                        Никнейм
                    </Field>
                    <Field name="email" type="email" autoComplete="email">
                        Почта
                    </Field>
                    <Field name="password" type="password" autoComplete="new-password">
                        Пароль
                    </Field>
                    <Field name="confirmPassword" type="password" autoComplete="new-password">
                        Повторите пароль
                    </Field>
                    <ConfirmButton>
                        Создать аккаунт
                    </ConfirmButton>
                </Form>
            </LongFrame>
        );
    }
}

export default withRouter( RegistrationRoute );
