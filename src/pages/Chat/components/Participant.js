import React, { PureComponent } from "react";
import { Controllers } from './controllers';
import { RoomParticipantItem } from "./ChatListItems";
import { LeftChatIcon } from "./LeftChatIcon";


class Participant extends PureComponent {
    onSelectChat = ev => this.context.onSelectChat(ev, this.props.id);
    render() {
        const { nickName, fullName, onlineStatus } = this.props;
        return (
            <RoomParticipantItem onClick={this.onSelectChat}>
                <LeftChatIcon onlineStatus={ onlineStatus } className="fa fa-circle-o "/>
                <span title={nickName}>
                    {fullName}
                </span>
            </RoomParticipantItem>
        );
    }
}
Participant.contextType = Controllers;
export default Participant;
