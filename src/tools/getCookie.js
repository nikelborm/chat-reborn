/* eslint-disable no-useless-escape */
// возвращает куки с указанным name,
// или undefined, если ничего не найдено
function getCookie(name) {
    // TODO: Пофиксить (когда стану опытнее), т. к. анализатор кода выдает предупреждение, мол использовать конструктор RegExp со строковым аргументом плохо, ведь это может привести к созданию произвольного regexp, но по моему тут нечего менять
    let matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") + "=([^;]*)"));
    return matches ? decodeURIComponent(matches[1]) : null;
}
export default getCookie;
