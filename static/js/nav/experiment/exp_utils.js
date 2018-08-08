function check_alphanumeric_(raw) {
    var reg = /^[a-z0-9_]+$/i;
    return reg.test(raw);
}

function check_alphanumeric_ver_(raw) {
    var reg = /^[a-z0-9|_]+$/i;
    return reg.test(raw);
}