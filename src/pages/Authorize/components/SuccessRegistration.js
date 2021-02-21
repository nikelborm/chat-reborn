import React, { PureComponent } from 'react';

class SuccessRegistration extends PureComponent {
    render() {
        return (
            <div id="success">
                <div id="successtext">
                    <p>
                        Благодарим за регистрацию! Перейдите по ссылке из письма, чтобы завершить создание аккаунта.
                    </p>
                </div>
            </div>
        );
    }
}

export default SuccessRegistration;
