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

// 改变窗口大小
function change_frame_size() {
    var newHeight = $(document).contents().find('body').height();
    if (newHeight < 900) {
        newHeight = 900;
    }
    $("#left_frame_col", window.parent.document).height(newHeight);
    $("#right_frame_col", window.parent.document).height(newHeight);
    $("#right_frame", window.parent.document).height(newHeight);
}

// 初始化渠道下拉列表框
function init_ad_network_select() {
    $.ajax({
            url: '/query_network_list',
            data: {
                'network_name': '',
                'off_set': 0,
                'limit': -1
            },
            // async: false,
            type: "post",
            dataType: 'json',
            success: function (response) {
                var success = response.success;
                var network_list = response.content;

                if (success != "true") {
                    return;
                }

                for (var i = 0; i < network_list.length; i++) {
                    var network = network_list[i];
                    var network_name = network.network_name;
                    var option = '<option>' + network_name + '</option>';
                    $("#ad_network_id_selector").append(option);
                    $("#ad_network_id_selector").selectpicker('refresh');
                }
            },
            error: function () {
                $.showErr("查询失败");
            }
        }
    );
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
