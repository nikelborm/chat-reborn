/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
// TODO: Добавить обработку ошибки соединения
function setNewTippy(field, content) {
    // @ts-ignore
    const instance = id(field)._tippy;
    if (!instance) {
        // @ts-ignore
        tippy(id(field), { content });
    } else {
        instance.setContent(content);
        instance.show();
    }
}
// @ts-ignore
tippy.setDefaultProps({
    ignoreAttributes: true,
    placement: "bottom",
    showOnCreate: true,
    trigger: "manual",
    theme: "error"
});
// @ts-ignore
tippy([id("nickName"), id("email")], { interactive: true });
