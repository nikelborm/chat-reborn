import React, { Component } from "react";
import Room from "./Room";
import DirectChat from "./DirectChat";
import styled from "styled-components";
import { HeaderItem } from "./ChatListItems";

const ChatListsWrapper = styled.ul`
    list-style: none;
`;
const Header = ({ children }) => (
    <HeaderItem>
        <i className="fa fa-list-alt"></i>
        <span>{ children }</span>
    </HeaderItem>
)
class ChatsList extends Component {
    render() {
        const { rooms, directChats, muted, entities, usersInRooms } = this.props;
        const directChatsComponents = Array.from(directChats, id => (
            <DirectChat
                key={id}
                id={id}
                isMuted={muted.has(id)}
                nickName={entities[id].nickName}
                fullName={entities[id].fullName}
                onlineStatus={entities[id].onlineStatus}
            />
        ));
        const roomsComponents = Array.from(rooms, id => (
            <Room
                key={id}
                id={id}
                isMuted={muted.has(id)}
                // isExpanded={entities[id].isExpanded}
                isExpanded={false}
                entities={entities}
                users={usersInRooms[id]}
            />
        ));
        return (
            <ChatListsWrapper>
                <Header>
                    Прямые чаты
                </Header>
                { directChatsComponents }
                <Header>
                    Комнаты
                </Header>
                { roomsComponents }
            </ChatListsWrapper>
        );
    }
}
export default ChatsList;
