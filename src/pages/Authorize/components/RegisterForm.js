import React, { PureComponent } from 'react';

class RegisterForm extends PureComponent {
    render() {
        const { refs, onSubmit } = this.props;
        return (
            <form id="form-signup" onSubmit={ onSubmit }>
                <label htmlFor="fullName">Полное имя</label>
                <input className="form-styling" type="text" id="fullName" autoComplete="name" ref={refs.fullName}/>
                <label htmlFor="nickName">Никнейм</label>
                <input className="form-styling" type="text" id="nickName" autoComplete="username" ref={refs.nickName}/>
                <label htmlFor="email">Почта</label>
                <input className="form-styling" type="email" id="email" autoComplete="email" ref={refs.email}/>
                <label htmlFor="password">Пароль</label>
                <input className="form-styling" type="password" id="password" autoComplete="new-password" ref={refs.password}/>
                <label htmlFor="confirmPassword">Повторите пароль</label>
                <input className="form-styling" type="password" id="confirmPassword" autoComplete="new-password" ref={refs.confirmPassword}/>
                <div className="btn-wrapper">
                    <input type="submit" className="btn" value="Создать аккаунт" />
                </div>
            </form>
        );
    }
}

export default RegisterForm;
