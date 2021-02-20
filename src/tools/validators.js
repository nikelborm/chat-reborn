function isCorrect( field ) {
    return typeof field === "string" && !!field.length;
}

function validateFinishRegistrationPayload( payload = {} ) {
    let info = "";
    const { secureToken, id } = payload;

    if( !isCorrect( secureToken ) )
    {
        info = "Отсутствует поле одноразового токена";
    }
    else if( !isCorrect( id ) )
    {
        info = "Отсутствует поле id";
    }
    return { info };
}

function validateRegistrationPayload( payload = {} ) {
    let info = "";
    let pointerForDisplaing = "";
    const { nickName, password, confirmPassword, fullName, email } = payload;

    if( !isCorrect( fullName ) )
    {
        info = "Вы не ввели ваше имя";
        pointerForDisplaing = "fullName";
    }
    else if( !isCorrect( nickName ) )
    {
        info = "Вы не ввели никнейм";
        pointerForDisplaing = "nickName";
    }
    else if( !isCorrect( email ) )
    {
        info = "Вы не ввели почту";
        pointerForDisplaing = "email";
    }
    else if( !isCorrect( password ) )
    {
        info = "Вы не ввели пароль";
        pointerForDisplaing = "passwordRegister";
    }
    else if( !isCorrect( confirmPassword ) )
    {
        info = "Вы не ввели подтверждение пароля";
        pointerForDisplaing = "confirmPassword";
    }
    else if ( password.length < 8 )
    {
        info = "Длина пароля должна быть от 8 символов";
        pointerForDisplaing = "passwordRegister";
    }
    else if ( password.length > 40 )
    {
        info = "Длина пароля должна быть до 40 символов";
        pointerForDisplaing = "passwordRegister";
    }
    else if ( confirmPassword !== password )
    {
        info = "Пароли не совпадают";
        pointerForDisplaing = "confirmPassword";
    }

    return { info, pointerForDisplaing };
}
function validateLoginPayload( payload = {} ) {
    let info = "";
    let pointerForDisplaing = "";
    const { nickNameOrEmail, password } = payload;

    if( !isCorrect( nickNameOrEmail ) )
    {
        info = "Вы не ввели никнейм или почту";
        pointerForDisplaing = "nickNameOrEmail";
    }
    else if( !isCorrect( password ) )
    {
        info = "Вы не ввели пароль";
        pointerForDisplaing = "passwordLogin";
    }
    else if ( password.length < 8 )
    {
        info = "Длина пароля должна быть от 8 символов";
        pointerForDisplaing = "passwordLogin";
    }
    else if ( password.length > 40 )
    {
        info = "Длина пароля должна быть до 40 символов";
        pointerForDisplaing = "passwordLogin";
    }

    return { info, pointerForDisplaing };
}
function validateNewMessagePayload( payload = {} ) {
    let info = "";
    let pointerForDisplaing = "";
    const { to, text } = payload;

    if( !isCorrect( to ) )
    {
        info = "Отсутствует поле с указанием получателя";
        pointerForDisplaing = "nickNameOrEmail";
    }
    else if( !isCorrect( text ) )
    {
        info = "Сообщение не может быть пустым";
        pointerForDisplaing = "";
    }

    return { info, pointerForDisplaing };
}

exports.isCorrect = isCorrect;
exports.validateLoginPayload = validateLoginPayload;
exports.validateNewMessagePayload = validateNewMessagePayload;
exports.validateRegistrationPayload = validateRegistrationPayload;
exports.validateFinishRegistrationPayload = validateFinishRegistrationPayload;
