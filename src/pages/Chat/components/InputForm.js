// @ts-nocheck
import React, { PureComponent } from "react";
import Tippy from "@tippyjs/react";
import createEmojiToolTipBody from "../tools/createEmojiToolTipBody";

import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";
import "tippy.js/animations/perspective.css";

class InputForm extends PureComponent {
    constructor(props) {
        super(props);
        this.inputArea = React.createRef();
        this.instanceRef = React.createRef();
        this.emojiPicker = createEmojiToolTipBody(this.chooseEmoji);
    }
    sendMsgInChat = (e) => {
        e.preventDefault();
        if (window.isSocketAvailable) {
            this.instanceRef.current.hide();
            const data = {
                handlerType: "message",
                to: this.props.activeChat,
                text: this.inputArea.current.value
            };
            this.inputArea.current.value = "";
            window.socket.send(JSON.stringify(data));
        } else {
            // TODO: Добавить Tippy с выводом, что соединение потеряно
            console.log("Сокет недоступен");
        }
    };
    chooseEmoji = (emoji) => {
        this.inputArea.current.value += emoji;
    };
    render() {
        return (
            <form className="input-area">
                <div className="input-wrapper">
                    <input type="text" defaultValue="" ref={this.inputArea}/>
                    <Tippy
                        content={this.emojiPicker}
                        animation="perspective"
                        trigger="click"
                        theme="emoji"
                        interactive={true}
                        inertia={true}
                        arrow={false}
                        duration={[350, 200]}
                        onCreate={(instance) => (this.instanceRef.current = instance)}
                    >
                        <i className="fa fa-smile-o"></i>
                    </Tippy>
                    <i className="fa fa-paperclip"></i>
                </div>
                <button onClick={this.sendMsgInChat}></button>
            </form>
        );
    }
}
export default InputForm;
