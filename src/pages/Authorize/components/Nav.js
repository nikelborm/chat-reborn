/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { PureComponent } from 'react';

class Nav extends PureComponent {
    render() {
        const isLogin = this.props.mode === "login";
        return (
            <div className="nav">
                <ul>
                    <li
                        className={ isLogin ? "active" : "inactive" }
                        onClick={ !isLogin ? this.props.onChangeCard : () => {} }
                    >
                        <a>Sign in</a>
                    </li>
                    <li
                        className={ !isLogin ? "active" : "inactive" }
                        onClick={ isLogin ? this.props.onChangeCard : () => {} }
                    >
                        <a>Sign up </a>
                    </li>
                </ul>
            </div>
        );
    }
}

export default Nav;
