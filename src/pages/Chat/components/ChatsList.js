import React, { Component } from "react";
import Room from "./Room";
import DirectChat from "./DirectChat";

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
                isExpanded={entities[id].isExpanded}
                entities={entities}
                users={usersInRooms[id]}
            />
        ));
        return (
            <ul className="chatListsUl">
                <li className="item header" key="directChatsHeader">
                    <i className="fa fa-list-alt"></i>
                    <span>Прямые чаты</span>
                </li>
                { directChatsComponents }
                <li className="item header" key="roomsHeader">
                    <i className="fa fa-list-alt"></i>
                    <span>Комнаты</span>
                </li>
                { roomsComponents }
            </ul>
        );
    }
}
export default ChatsList;
