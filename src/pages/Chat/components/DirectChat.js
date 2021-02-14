import React, { PureComponent } from "react";
import { Controllers } from './controllers';
import { DirectChatItem } from "./ChatListItems";
import { LeftChatIcon } from "./LeftChatIcon";
class DirectChat extends PureComponent {
    // Это надо чтобы тысячу раз не пересоздавать фунции и не запускать часто garbage collector, хотя я не до конца уверен, что это сработает
    onDeleteChat = ev => this.context.onDeleteChat(ev, this.props.id, true);
    onMuteChange = ev => this.context.onMuteChange(ev, this.props.id, this.props.isMuted);
    onSelectChat = ev => this.context.onSelectChat(ev, this.props.id);
    render() {
        const { isMuted, nickName, fullName, onlineStatus } = this.props;

        return (
            <DirectChatItem onClick={this.onSelectChat}>
                <LeftChatIcon onlineStatus={onlineStatus} className="fa fa-circle-o"/>
                <span title={ nickName }>
                    { fullName }
                </span>
                <LeftChatIcon
                    className="far fa-trash-alt"
                    onClick={this.onDeleteChat}
                />
                <LeftChatIcon
                    className={"far fa-bell" + (isMuted ? "-slash": "")}
                    onClick={this.onMuteChange}
                />
            </DirectChatItem>
        );
    }
}
DirectChat.contextType = Controllers;
export default DirectChat;
