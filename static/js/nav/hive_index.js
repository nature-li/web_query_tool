// frame改变大小
function frame_auto_size() {
    var newHeight = $("#right_frame").contents().find('body').height();
    if (newHeight < 600) {
        newHeight = 600;
    }
    $("#left_frame_col").height(newHeight);
    $("#right_frame_col").height(newHeight);
}

// frame 加载时自适应大小
$("#right_frame").load(function () {
    frame_auto_size();
});

// a_day_count 点击事件
$(document).on("click", "#a_day_count", function () {
    $("#right_frame").attr("src", "day_count");
    // 自适应框架大小
    frame_auto_size();
});

// a_hour_count 点击事件
$(document).on("click", "#a_hour_count", function () {
    $("#right_frame").attr("src", "hour_count");
    // 自适应框架大小
    frame_auto_size();
});

// a_user_control 点击事件
$(document).on("click", "#a_user_control", function () {
    $("#right_frame").attr("src", "user_list");
    // 自适应框架大小
    frame_auto_size();
});

// a_ad_network_id_control 点击事件
$(document).on("click", "#a_network_control", function () {
    $("#right_frame").attr("src", "network_list");
    // 自适应框架大小
    frame_auto_size();
});
