import React, { PureComponent } from 'react';

class LoginForm extends PureComponent {
    render() {
        const { refs, onSubmit } = this.props;
        return (
            <form id="form-signin" onSubmit={ onSubmit }>
                <label htmlFor="nickNameOrEmail">Почта или никнейм</label>
                <input className="form-styling" type="text" id="nickNameOrEmail" autoComplete="username" ref={refs.nickNameOrEmail}/>
                <label htmlFor="password">Пароль</label>
                <input className="form-styling" type="password" id="password" autoComplete="current-password" ref={refs.password}/>
                <input type="checkbox" id="checkbox" />
                <label htmlFor="checkbox"><span className="ui"></span>Запомнить меня</label>
                <div id="btn-animate" className="btn-wrapper">
                    <input type="submit" className="btn" value="Войти" />
                </div>
            </form>
        );
    }
}

export default LoginForm;
