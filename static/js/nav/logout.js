$(document).ready(function () {
    if (self != top) {
        window.parent.location.replace("/login");
    } else {
        window.location.replace("/login");
    }
});