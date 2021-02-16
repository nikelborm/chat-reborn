const { clearCookies } = require("./clearCookies");
function logout(request, response) {
    request.session.destroy((err) => {
        if (err)
            return console.log(err);
        clearCookies(response, "nickName", "fullName", "statusText", "avatarLink", "_id");
        response.redirect("/");
    });
}
exports.logout = logout;
