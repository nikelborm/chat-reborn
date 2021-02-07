import React, { PureComponent } from "react";

class Message extends PureComponent {
    render() {
        const { authorID, myID, nickName, correctTime, messageBody } = this.props;
        // TODO: Сделать так, чтобы при наведении на div.name выводилась Tippy с инфой о пользователе
        return (
            <li className={authorID === myID ? "me" : ""}>
                <div className="name">
                    <span className="">
                        {nickName}
                    </span>
                </div>
                <div className="message">
                    <p>
                        {messageBody}
                    </p>
                    <span className="msg-time">
                        {correctTime}
                    </span>
                </div>
            </li>
        );
    }
}
export default Message;
