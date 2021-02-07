import React from "react";

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
        <div className="ReactionButtons"> {
            reactions.map(
                (reaction) => (
                    <button
                        key={reaction.label}
                        className="emoji"
                        onClick={
                            (e) => {
                                e.preventDefault();
                                onChoose(reaction.emoji);
                            }
                        }
                    >
                        <div role="img"> {reaction.emoji} </div>
                    </button>
                )
            )
        } </div>
    );
}
export default createEmojiToolTipBody;
