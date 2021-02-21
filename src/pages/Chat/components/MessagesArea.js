import React, { Component, createRef } from "react";
import styled from "styled-components";
import Message from "./Message";
// import shallowEqual from "../tools/shallowEqual";

const MessagesAreaWrapper = styled.div`
    border-top: 1px solid #cfdae1;
    border-bottom: 1px solid #cfdae1;
    position: absolute;
    left: 0;
    top: 35px;
    right: 0;
    bottom: 44px;
    overflow-y: scroll;
    overflow-x: hidden;
    outline: none;
`;

const InfoInsteadMessages = styled.strong``;

const MessagesList = styled.ul`
    margin: 0 -4px 0 0;
    padding: 0;
    // margin-right: -4px;

    & > li:first-child {
        border-top: none;
    }
`;

class MessagesArea extends Component {
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
        this.chatList.current.scrollTo( 0, this.down.current.offsetTop );
    }
    render() {
        const { history, entities, activeChat, myID, isDownloading } = this.props;

        let info, msgList;

        if ( !activeChat ) {
            info = <InfoInsteadMessages>Пожалуйста выберите чат для отображения</InfoInsteadMessages>;
        } else if ( isDownloading ) {
            info = <InfoInsteadMessages>Сообщения загружаются, пожалуйста подождите</InfoInsteadMessages>;
        } else if ( activeChat === myID ) {
            info = <InfoInsteadMessages>Функцию сохранённых сообщений (избранное) мы скоро добавим)</InfoInsteadMessages>;
        } else if ( !history ) { // history !== {}: либо undefined либо со свойствами
            info = <InfoInsteadMessages>Сообщений нет. Напишите первым!</InfoInsteadMessages>;
        } else {
            msgList = Object.keys( history ).map( msgID => (
                <Message
                    key={msgID}
                    authorID={history[msgID].authorID}
                    myID={myID}
                    nickName={entities[history[msgID].authorID].nickName}
                    correctTime={history[msgID].correctTime}
                    messageBody={history[msgID].messageBody}
                />
            ) );
        }
        return (
            <MessagesAreaWrapper ref={ this.chatList }>
                { info || <MessagesList> { msgList } </MessagesList> }
                <span ref={ this.down }></span>
            </MessagesAreaWrapper>
        );
    }
}
export default MessagesArea;
