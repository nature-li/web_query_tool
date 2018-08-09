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
    set_menu_active("#menu_statistic_control");

    // 自适应框架大小
    frame_auto_size();
});

// a_hour_count 点击事件
$(document).on("click", "#a_hour_count", function () {
    $("#right_frame").attr("src", "hour_count");

    // 菜单 active 状态改变
    set_menu_active("#menu_statistic_control");

    // 自适应框架大小
    frame_auto_size();
});

// a_position 点击事件
$(document).on("click", "#a_position", function () {
    $("#right_frame").attr("src", "position");

    // 菜单 active 状态改变
    set_menu_active("#menu_statistic_control");

    // 自适应框架大小
    frame_auto_size();
});

// a_chart 点击事件
$(document).on("click", "#a_chart", function () {
    $("#right_frame").attr("src", "chart");

    // 菜单 active 状态改变
    set_menu_active("#menu_statistic_control");

    // 自适应框架大小
    frame_auto_size();
});

// // a_cfg_item 点击事件
// $(document).on("click", "#a_cfg_item", function () {
//     $("#right_frame").attr("src", "cfg_item");
//
//     // 菜单 active 状态改变
//     set_menu_active("#menu_experiment_control");
//
//     // 自适应框架大小
//     frame_auto_size();
// });

// a_tree_cfg 点击事件
$(document).on("click", "#a_tree_cfg", function () {
    $("#right_frame").attr("src", "tree_cfg");

    // 菜单 active 状态改变
    set_menu_active("#menu_experiment_control");

    // 自适应框架大小
    frame_auto_size();
});

// a_tree_exp 点击事件
$(document).on("click", "#a_tree_exp", function () {
    $("#right_frame").attr("src", "tree_exp");

    // 菜单 active 状态改变
    set_menu_active("#menu_experiment_control");

    // 自适应框架大小
    frame_auto_size();
});

// a_user_control 点击事件
$(document).on("click", "#a_user_list", function () {
    $("#right_frame").attr("src", "user_list");

    // 系统和用户管理态变 active
    set_menu_active("#menu_system_control");

    // 自适应框架大小
    frame_auto_size();
});

// a_ad_network_id_control 点击事件
$(document).on("click", "#a_network_list", function () {
    $("#right_frame").attr("src", "network_list");

    // 菜单 active 状态改变
    set_menu_active("#menu_develop_control");

    // 自适应框架大小
    frame_auto_size();
});

function set_page_active(page_id) {
    // 改变菜单背景色
    $("#li_day_count", window.parent.document).removeClass("selected_menu");
    $("#li_hour_count", window.parent.document).removeClass("selected_menu");
    $("#li_position", window.parent.document).removeClass("selected_menu");
    $("#li_chart", window.parent.document).removeClass("selected_menu");
    // $("#li_cfg_item", window.parent.document).removeClass("selected_menu");
    $("#li_user_list", window.parent.document).removeClass("selected_menu");
    $("#li_network_list", window.parent.document).removeClass("selected_menu");
    $("#li_tree_layer", window.parent.document).removeClass("selected_menu");
    $("#li_tree_cfg", window.parent.document).removeClass("selected_menu");
    $("#li_tree_exp", window.parent.document).removeClass("selected_menu");

    $(page_id, window.parent.document).addClass("selected_menu");
}

// a_ad_network_id_control 点击事件
$(document).on("click", "#a_layer_exp", function () {
    $("#right_frame").attr("src", "layer_exp");

    // 菜单 active 状态改变
    set_menu_active("#menu_experiment_control");

    // 自适应框架大小
    frame_auto_size();
});

// a_ad_network_id_control 点击事件
$(document).on("click", "#a_tree_layer", function () {
    $("#right_frame").attr("src", "tree_layer");

    // 菜单 active 状态改变
    set_menu_active("#menu_experiment_control");

    // 自适应框架大小
    frame_auto_size();
});