import React, { Component } from "react";
class WindowTitle extends Component {
    shouldComponentUpdate() {
        return false;
    }
    render() {
        return (
            <div className="window-title">
                <div className="dots">
                    <i className="fa fa-circle"></i>
                    <i className="fa fa-circle"></i>
                    <i className="fa fa-circle"></i>
                </div>
                <div className="title">
                    <span>Чат</span>
                </div>
                <div className="exit" title="Выйти из аккаунта">
                    <i className="fa fa-times" onClick={() => document.location.assign("logout")}></i>
                </div>
            </div>
        );
    }
}
export default WindowTitle;
