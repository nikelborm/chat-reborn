/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import styled from "styled-components";
const Mentioning = styled.span`
    background: #6ea0ff;
    color: #fff;
    padding: 0 5px;
    border-radius: 5px;
`;
// TODO: Не парсить сообщение единоразово при входе, как это сейчас.
// TODO: Нужно превратить эту функцию в нормальный компонент, обёрнутый в React.memo. Который от пропса сырого текста рендерит содержимое сообщения
// ? Но это надо поставить под сомннение, потому что при переключении между вкладками чатов, сообщения каждый раз будут рендерится как в первый
// ? Интересная идея состоит в том чтобы сделать некий компонент переадресатор к глобальному стору ( можно даже простой обьект )
// ? Стор хранит в себе как ключи - пришедшие тексты, а в качестве значений распарсенные сообщения
// ? А компонент либо вытаскивает распарсенные текста, либо парсит новое сообщение, заносит его в стор и ретёрнит
function parseMessageBody( text ) {
    let last = 0;
    let results = [];
    for ( const match of text.matchAll( /[#@]([\w\dА-Яа-яЁё]{1,50})/g ) ) {
        last !== match.index && results.push( text.slice( last, match.index ) );
        results.push(
            match[ 0 ][ 0 ] === "#"
                ? <a href="#">{ match[ 0 ] }</a>
                : <Mentioning>{ match[ 0 ] }</Mentioning>
        );
        last = match.index + match[ 0 ].length;
    }
    results.push( text.slice( last ) );
    return results;
}
export default parseMessageBody;
