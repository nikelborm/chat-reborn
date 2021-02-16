import React from "react";
import styled from "styled-components";

const EmojiButton = styled.button`
    background: #eee;
    border: none;
    font-size: 1rem;
    padding: 0.5rem 1rem;
    outline: 0;
    border-radius: 0.2rem;
    background: none;
    font-size: 1.25rem;
    padding: 0 0.25rem;
    cursor: pointer;
    transition: transform 0.15s;
    will-change: transform;

    &[data-selected='true'] {
        background: #eee;
        border: 1px solid rgba(0, 100, 200, 0.5);
    }

    &:hover {
        transform: scale(1.2);
    }
`;
// TODO: Добавить больше эмодзи
const reactions = [
    {emoji: "👍", label: "Thumbs up"},
    {emoji: "👎", label: "Thumbs down"},
    {emoji: "❤️", label: "Heart"},
    {emoji: "😂", label: "Crying with laughter"},
    {emoji: "🎉", label: "Party"},
];
function createEmojiToolTipBody(onChoose) {
    return (
        <div> {
            reactions.map(
                (reaction) => (
                    <EmojiButton
                        key={reaction.label}
                        onClick={
                            (e) => {
                                e.preventDefault();
                                onChoose(reaction.emoji);
                            }
                        }
                    >
                        <div role="img"> {reaction.emoji} </div>
                    </EmojiButton>
                )
            )
        } </div>
    );
}
export default createEmojiToolTipBody;
