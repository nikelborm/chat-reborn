import React from "react";
import styled from "styled-components";

const InterlocutorMessage = styled.li`
    border-top: 1px solid #cfdae1;
    overflow: hidden;
    position: relative;
`;

const MyMessage = styled( InterlocutorMessage )`
    background: #e4eaee;
`;

const SendersName = styled( InterlocutorMessage )`
    padding: 14px;
    text-align: right;
    width: 80px;
    float: left;
    color: #5d7185;
    font-weight: bold;
    line-height: 20px;
`;

const MessageContainer = styled.div`
    padding: 14px;
    border-left: 1px solid #cfdae1;
    float: left;
    color: #333f4d;
    width: 265px;
`;

const ParsedMessageBody = styled.p`
    line-height: 20px;
`;

const ParsedMessageTime = styled.span`
    position: absolute;
    top: 5px;
    right: 10px;
    color: #738ba3;
    font-size: 9px;
`;

// TODO: Сделать так, чтобы при наведении на div.name выводилась Tippy с инфой о пользователе
const Message = ( { authorID, myID, nickName, correctTime, messageBody } ) => {
    const OneOfMessagePerformances = authorID === myID ? MyMessage : InterlocutorMessage;
    return (
        <OneOfMessagePerformances>
            <SendersName>
                { nickName }
            </SendersName>
            <MessageContainer>
                <ParsedMessageBody>
                    { messageBody }
                </ParsedMessageBody>
                <ParsedMessageTime>
                    { correctTime }
                </ParsedMessageTime>
            </MessageContainer>
        </OneOfMessagePerformances>
    );
}
export default React.memo( Message );
