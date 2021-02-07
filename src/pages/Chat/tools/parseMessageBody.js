/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
function parseMessageBody(text) {
    let last = 0;
    let results = [];
    for (const match of text.matchAll(/[#@]([\w\dА-Яа-яЁё]{1,50})/g)) {
        last !== match.index && results.push(text.slice(last, match.index));
        results.push(match[0][0] === "#" ? <a href="#" className="hashtag">{match[0]}</a> : <span className="blue-label">{match[0]}</span>);
        last = match.index + match[0].length;
    }
    results.push(text.slice(last));
    return results;
}
export default parseMessageBody;
