USER_RIGHT = {};
USER_RIGHT.DEVELOP = 0B1;
USER_RIGHT.SYSTEM = 0B10;
USER_RIGHT.STATISTIC = 0B100;
USER_RIGHT.EXPERIMENT = 0B1000;

// frame改变大小
function frame_auto_size() {
    var newHeight = $("#right_frame").contents().find('body').height();
    if (newHeight < 900) {
        newHeight = 900;
    }
    $("#left_frame_col").height(newHeight);
    $("#right_frame_col").height(newHeight);
    $("#right_frame").height = newHeight;
}

// frame 加载时自适应大小
$("#right_frame").load(function () {
    frame_auto_size();
});

// a_day_count 点击事件
$(document).on("click", "#a_day_count", function () {
    $("#right_frame").attr("src", "day_count");

    // 菜单 active 状态改变
    $("#menu_statistic_control").removeClass("active");
    $("#menu_experiment_control").removeClass("active");
    $("#menu_system_control").removeClass("active");
    $("#menu_develop_control").removeClass("active");
    $("#menu_statistic_control").addClass("active");

    // 自适应框架大小
    frame_auto_size();
});

// a_hour_count 点击事件
$(document).on("click", "#a_hour_count", function () {
    $("#right_frame").attr("src", "hour_count");

    // 菜单 active 状态改变
    $("#menu_statistic_control").removeClass("active");
    $("#menu_experiment_control").removeClass("active");
    $("#menu_system_control").removeClass("active");
    $("#menu_develop_control").removeClass("active");
    $("#menu_statistic_control").addClass("active");

    // 自适应框架大小
    frame_auto_size();
});

// a_position 点击事件
$(document).on("click", "#a_position", function () {
    $("#right_frame").attr("src", "position");

    // 菜单 active 状态改变
    $("#menu_statistic_control").removeClass("active");
    $("#menu_experiment_control").removeClass("active");
    $("#menu_system_control").removeClass("active");
    $("#menu_develop_control").removeClass("active");
    $("#menu_statistic_control").addClass("active");

    // 自适应框架大小
    frame_auto_size();
});

// a_chart 点击事件
$(document).on("click", "#a_chart", function () {
    $("#right_frame").attr("src", "chart");

    // 菜单 active 状态改变
    $("#menu_statistic_control").removeClass("active");
    $("#menu_experiment_control").removeClass("active");
    $("#menu_system_control").removeClass("active");
    $("#menu_develop_control").removeClass("active");
    $("#menu_statistic_control").addClass("active");

    // 自适应框架大小
    frame_auto_size();
});

// a_experiment 点击事件
$(document).on("click", "#a_experiment_config", function () {
    $("#right_frame").attr("src", "experiment");

    // 菜单 active 状态改变
    $("#menu_statistic_control").removeClass("active");
    $("#menu_experiment_control").removeClass("active");
    $("#menu_system_control").removeClass("active");
    $("#menu_develop_control").removeClass("active");
    $("#menu_experiment_control").addClass("active");

    // 自适应框架大小
    frame_auto_size();
});

// a_user_control 点击事件
$(document).on("click", "#a_user_list", function () {
    $("#right_frame").attr("src", "user_list");

    // 系统和用户管理态变 active
    $("#menu_statistic_control").removeClass("active");
    $("#menu_experiment_control").removeClass("active");
    $("#menu_system_control").removeClass("active");
    $("#menu_develop_control").removeClass("active");
    $("#menu_system_control").addClass("active");

    // 自适应框架大小
    frame_auto_size();
});

// a_ad_network_id_control 点击事件
$(document).on("click", "#a_network_list", function () {
    $("#right_frame").attr("src", "network_list");

    // 菜单 active 状态改变
    $("#menu_statistic_control").removeClass("active");
    $("#menu_experiment_control").removeClass("active");
    $("#menu_system_control").removeClass("active");
    $("#menu_develop_control").removeClass("active");
    $("#menu_develop_control").addClass("active");

    // 自适应框架大小
    frame_auto_size();
});
