import React, { PureComponent } from "react";
import { Controllers } from './controllers';

class Participant extends PureComponent {
    onSelectChat = ev => this.context.onSelectChat(ev, this.props.id);
    render() {
        const { nickName, fullName, onlineStatus } = this.props;
        return (
            <li className="item tabbed" onClick={this.onSelectChat}>
                <i className={"fa fa-circle-o " + onlineStatus}></i>
                <span title={nickName}>
                    {fullName}
                </span>
            </li>
        );
    }
}
Participant.contextType = Controllers;
export default Participant;
