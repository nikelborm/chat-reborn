import React, { PureComponent } from "react";
import { Controllers } from './controllers';
import { LeftChatIcon } from "./LeftChatIcon";
import { RoomItem } from "./ChatListItems";

class RoomHeader extends PureComponent {
    // Это надо чтобы тысячу раз не пересоздавать фунции и не запускать часто garbage collector, хотя я не до конца уверен, что это сработает
    onExpandChange = ev => this.context.onExpandChange(ev, this.props.id);
    onDeleteChat = ev => this.context.onDeleteChat(ev, this.props.id, false);
    onMuteChange = ev => this.context.onMuteChange(ev, this.props.id, this.props.isMuted);
    onSelectChat = ev => this.context.onSelectChat(ev, this.props.id);
    render() {
        const { nickName, fullName, isExpanded, isMuted } = this.props;

        return (
            <RoomItem onClick={this.onSelectChat} isExpanded={ isExpanded }>
                <LeftChatIcon className="fas fa-user-alt"/>
                <span title={nickName}>
                    {fullName}
                </span>
                <LeftChatIcon
                    className={"fa fa-angle-down" + (isExpanded ? " reversed": "")}
                    onClick={this.onExpandChange}
                />
                <LeftChatIcon
                    className="far fa-trash-alt"
                    onClick={this.onDeleteChat}
                />
                <LeftChatIcon
                    className={"far fa-bell" + (isMuted ? "-slash": "")}
                    onClick={this.onMuteChange}
                />
            </RoomItem>
        );
    }
}
RoomHeader.contextType = Controllers;
export default RoomHeader;
