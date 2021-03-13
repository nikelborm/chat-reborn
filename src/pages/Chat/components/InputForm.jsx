// @ts-nocheck
import React, { PureComponent } from "react";
import Tippy from "@tippyjs/react";
import createEmojiToolTipBody from "../tools/createEmojiToolTipBody";
import styled from "styled-components";
import paperplaneIconPath from './paper-plane-solid.svg';

import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";
import "tippy.js/animations/perspective.css";

const InputArea = styled.form`
    background: #e4eaee;
    padding: 6px;
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    border-top: 1px solid #cfdae1;
`;

const InputWrapper = styled.div`
    background: #fff;
    border: 1px solid #cfdae1;
    border-radius: 5px;
    overflow: hidden;
    float: left;

    & i {
        font-size: 18px;
        color: #a0b4c0;
        margin-right: 10px;
        cursor: pointer;
    }
`;

const MessageEnteringField = styled.input`
    height: 30px;
    line-height: 30px;
    border: 0;
    margin: 0;
    padding: 0 10px;
    outline: none;
    color: #5D7185;
    min-width: 318px;
`;

const SendMessageButton = styled.button`
    background-repeat: no-repeat;
	background-image: url(${ paperplaneIconPath });
	background-color: #e4eaee;
	background-position: center;
	width: 20px;
	border: none;
    letter-spacing:1px;
	font-weight: bold;
	color: #fff;
	border-radius: 5px;
	float:right;
	height: 32px;
	line-height: 30px;
	cursor: pointer;
	font-family: 'Open Sans', Arial, sans-serif;
    outline: none;
`;

class InputForm extends PureComponent {
    constructor(props) {
        super(props);
        this.inputArea = React.createRef();
        this.instanceRef = React.createRef();
        this.emojiPicker = createEmojiToolTipBody( this.chooseEmoji );
    }
    sendMsgInChat = (e) => {
        e.preventDefault();
        if ( window.isSocketAvailable ) {
            this.instanceRef.current.hide();
            this.props.actions.sendMessage( this.inputArea.current.value );
            this.inputArea.current.value = "";
        } else {
            // TODO: Добавить Tippy с выводом, что соединение потеряно
            console.log( "Сокет недоступен" );
        }
    };
    chooseEmoji = ( emoji ) => {
        this.inputArea.current.value += emoji;
    };
    onEmojiChooserCreate = ( instance ) => {
        this.instanceRef.current = instance;
    };
    componentDidMount() {
        console.log(this.props);
    }
    
    render() {
        return (
            <InputArea>
                <InputWrapper>
                    <MessageEnteringField type="text" defaultValue="" ref={ this.inputArea }/>
                    <Tippy
                        content={ this.emojiPicker }
                        animation="perspective"
                        trigger="click"
                        theme="emoji"
                        interactive={ true }
                        inertia={ true }
                        arrow={ false }
                        duration={ [ 350, 200 ] }
                        onCreate={ this.onEmojiChooserCreate }
                    >
                        <i className="fa fa-smile-o"></i>
                    </Tippy>
                    <i className="fa fa-paperclip"></i>
                </InputWrapper>
                <SendMessageButton onClick={ this.sendMsgInChat }/>
            </InputArea>
        );
    }
}
export default InputForm;
