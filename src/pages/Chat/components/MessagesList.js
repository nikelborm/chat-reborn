import React, { Component, createRef } from "react";
import Message from "./Message";
// import shallowEqual from "../tools/shallowEqual";

class MessagesList extends Component {
    constructor(props) {
        super(props);
        this.chatList = createRef();
        this.down = createRef();
    }
    shouldComponentUpdate(nextProps) {
        return (
            this.props.activeChat !== nextProps.activeChat ||
            this.props.history !== nextProps.history ||
            this.props.isDownloading !== nextProps.isDownloading
        ); // Поддерживает редактирование сообщений, но если кто то изменит свой никнейм, то эта ситуация обработается со следующим весомым рендером
        // Потому что перерендеривать весь список сообщений из-за того что entities иммутабельна и она по тысяче причин изменилась - глупо
    }
    componentDidUpdate() {
        this.chatList.current.scrollTo(0, this.down.current.offsetTop);
    }
    render() {
        const { history, entities, activeChat, myID, isDownloading} = this.props;

        let info, msgList;

        if (!activeChat) {
            info = <strong>Пожалуйста выберите чат для отображения</strong>;
        } else if (isDownloading) {
            info = <strong>Сообщения загружаются, пожалуйста подождите</strong>;
        } else if (activeChat === myID) {
            info = <strong>Функцию сохранённых сообщений (избранное) мы скоро добавим)</strong>;
        } else if ( !history ) { // history !== {}: либо undefined либо со свойствами
            info = <strong>Сообщений нет. Напишите первым!</strong>;
        } else {
            msgList = Object.keys(history).map(msgID => (
                <Message
                    key={msgID}
                    authorID={history[msgID].authorID}
                    myID={myID}
                    nickName={entities[history[msgID].authorID].nickName}
                    correctTime={history[msgID].correctTime}
                    messageBody={history[msgID].messageBody}
                />
            ));
        }
        return (
            <div className="chat-list" ref={this.chatList}>
                {info ? info : <ul> { msgList } </ul>}
                <span ref={this.down}></span>
            </div>
        );
    }
}
export default MessagesList;
