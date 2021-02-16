function randomString(len) {
    const chrs = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let str = "";
    for (let i = 0; i < len; i++) {
        str += chrs[Math.floor(Math.random() * chrs.length)];
    }
    return str;
}
exports.randomString = randomString;
