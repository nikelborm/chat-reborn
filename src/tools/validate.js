/* eslint-disable default-case */
const { createEmptyResponseData } = require("./createEmptyResponseData");
const { isAllStrings } = require("./isAllStrings");

function validate1lvl(mode, body) {
    // login, registration и тому подобные
    let { resdata, rp } = createEmptyResponseData();
    const { nickNameOrEmail, password, nickName, confirmPassword, fullName, email } = body;
    let info = "";
    let errorField = "";
    if (!isAllStrings(body)) {
        rp.info = "Неправильно составлен запрос";
        return { resdata, rp: resdata.report };
    }
    if (mode === "register") {
        if (password.length < 8) {
            info = "Длина пароля должна быть от 8 символов";
            errorField = "password";
        }
        else if (password.length > 40) {
            info = "Длина пароля должна быть до 40 символов";
            errorField = "password";
        }
        else if (confirmPassword !== password) {
            info = "Пароли не совпадают";
            errorField = "confirmPassword";
        }
    }
    switch ("") {
        case nickNameOrEmail:
            info = "Вы не ввели никнейм или почту";
            errorField = "nickNameOrEmail";
            break;
        case fullName:
            info = "Вы не ввели ваше имя";
            errorField = "fullName";
            break;
        case nickName:
            info = "Вы не ввели никнейм";
            errorField = "nickName";
            break;
        case email:
            info = "Вы не ввели почту";
            errorField = "email";
            break;
        case password:
            info = "Вы не ввели пароль";
            errorField = "password";
    }
    resdata.reply.errorField = errorField;
    rp.info = info;
    return { resdata, rp: resdata.report };
}
function validate2lvl(body, authInfo) {
    // message, loadChatHistory и тому подобные
    let { resdata, rp } = createEmptyResponseData();
    const { text } = body;
    let info = "";

    if (!isAllStrings(body)) {
        info = "Неправильно составлен запрос";
    } else if (!authInfo) {
        info = "Вы не авторизованы";
    } else if (text === "") {
        info = "Вы отправили пустое сообщение";
    }

    rp.info = info;
    return { resdata, rp: resdata.report };
}
exports.validate1lvl = validate1lvl;
exports.validate2lvl = validate2lvl;
