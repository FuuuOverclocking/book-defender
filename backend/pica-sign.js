const crypto = require('crypto');

exports.sign = function sign(path, method, time, nonce) {
    const key = 'C69BAF41DA5ABD1FFEDC6D2FEA56B';
    const key2 =
        '~d}$Q7$eIni=V)9\\RK/P.RM4;9[7|@/CA}b~OW!3?EV`:<>M7pddUBL5n|0/*Cn';

    let str = path + time + nonce + method + key;
    str = str.toLowerCase();

    return hmacsha256(key2, str);
};

function hmacsha256(key, content) {
    const hmac = crypto.createHmac('sha256', key);
    hmac.update(content, 'utf8');
    return hmac.digest('hex');
}
