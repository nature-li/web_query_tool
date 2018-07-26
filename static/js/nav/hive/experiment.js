$(document).ready(function () {
    // 改变菜单背景色
    $("#li_day_count", window.parent.document).removeClass("selected_menu");
    $("#li_hour_count", window.parent.document).removeClass("selected_menu");
    $("#li_position", window.parent.document).removeClass("selected_menu");
    $("#li_network_control", window.parent.document).removeClass("selected_menu");
    $("#li_chart", window.parent.document).removeClass("selected_menu");
    $("#li_experiment", window.parent.document).removeClass("selected_menu");
    $("#li_experiment", window.parent.document).addClass("selected_menu");

    // 定义全局变量
    if (!window.save_data) {
        reset_save_data();
    }

    // 查询数据并更新页面
    query_and_update_view();
});

// 初始化全局变量
function reset_save_data() {
    window.save_data = {
        'item_list': [],
        'db_total_item_count': 0,
        'db_return_item_count': 0,
        'db_max_page_idx': 0,
        'view_max_page_count': 5,
        'view_item_count_per_page': 100,
        'view_start_page_idx': 0,
        'view_current_page_idx': 0,
        'view_current_page_count': 0
    };
}

// 更新表格和分页
function update_page_view(page_idx) {
    // 更新表格
    var html = "";
    for (var i = 0; i < window.save_data.item_list.length; i++) {
        var item = window.save_data.item_list[i];
        html += "<tr><td>" + item.dt + "</td>" +
            "<td>" + item.ad_network_id + "</td>" +
            "<td>" + item.pv + "</td>" +
            "<td>" + item.impression + "</td>" +
            "<td>" + item.click + "</td>" +
            "<td>" + item.ctr + "</td>" +
            "<td>" + item.update_time + "</td></tr>";
    }
    $("#day_result").find("tr:gt(0)").remove();
    $("#day_result").append(html);

    // 更新分页标签
    update_page_partition(page_idx);

    // 改变窗口大小
    change_frame_size();
}

// 查询并更新页面
function query_and_update_view() {
    // 获取 ad_network_id
    var ad_network_id = $("#ad_network_id_selector option:selected").text();
    if (ad_network_id == 'all_ad_network_id') {
        ad_network_id = "all";
    }

    // 获取开始日期
    var start_date = $("#start_date").datepicker('getDate');
    var start_year = start_date.getFullYear();
    var start_month = start_date.getMonth() + 1;
    var start_day = start_date.getDate();
    var start_dt = start_year + "-" + start_month + "-" + start_day;

    // 获取结束日期
    var end_date = $("#end_date").datepicker('getDate');
    var end_year = end_date.getFullYear();
    var end_month = end_date.getMonth() + 1;
    var end_day = end_date.getDate();
    var end_dt = end_year + "-" + end_month + "-" + end_day;

    var off_set = window.save_data.view_current_page_idx * window.save_data.view_item_count_per_page;
    var limit = window.save_data.view_item_count_per_page;

    // 加载数据
    $.ajax({
            url: '/query_day_page',
            type: "post",
            data: {
                'ad_network_id': ad_network_id,
                'start_dt': start_dt,
                'end_dt': end_dt,
                'off_set': off_set,
                'limit': limit
            },
            dataType: 'json',
            success: function (data) {
                save_data_and_update_page_view(data);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                if (jqXHR.status == 302) {
                    window.parent.location.replace("/");
                } else {
                    $.showErr("查询失败");
                }
            }
        }
    );
}

$("#query_day").click(function () {
    reset_save_data();
    query_and_update_view();
});

// 增加实验项
$(document).on('click', "#add_experiment", function () {
    BootstrapDialog.show({
        message: function (dialog) {
            // header
            var content = '<div class="form">';

            content += '<div class="form-group">' +
                '<label>名称：</label>' +
                '<input id="product_name" class="form-control">' +
                '</div>';
            content += '<div class="form-group">' +
                '<label>层次：</label>' +
                '<input id="layer" class="form-control">' +
                '</div>';
            content += '<div class="form-group">' +
                '<label>位置：</label>' +
                '<input id="layer" class="form-control">' +
                '</div>';
            content += '<div class="form-group">' +
                '<label>最小值：</label>' +
                '<input id="position" class="form-control">' +
                '</div>';
            content += '<div class="form-group">' +
                '<label>最大值：</label>' +
                '<input id="min_value" class="form-control">' +
                '</div>';
            content += '<div class="form-group">' +
                '<label>实验名称：</label>' +
                '<input id="max_value" class="form-control">' +
                '</div>';
            // footer
            content += '</div>';

            return content;
        },
        title: "增加实验项",
        closable: false,
        draggable: true,
        buttons: [{
            label: '确定',
            action: function (dialogItself) {
                // 获取用户添加数据
                var user_account = $("#add_user_account").val();

                var user_control = 0B00;
                if ($("#user_control_in_dialog").prop('checked')) {
                    user_control = 0B10;
                }
                var adtech_bit = 0B000;
                if ($("#adtech_control_in_dialog").prop('checked')) {
                    adtech_bit = 0B100;
                }

                var experiment_bit = 0B0000;
                if ($("#adtech_control_in_dialog").prop('checked')) {
                    experiment_bit = 0B1000;
                }

                var user_right = user_control | adtech_bit | experiment_bit;

                // 发送请求
                $.ajax({
                        url: '/add_user',
                        type: "post",
                        data: {
                            'user_account': user_account,
                            'user_right': user_right,
                        },
                        dataType: 'json',
                        success: function (response) {
                            append_user_list_to_view(response);
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            if (jqXHR.status == 302) {
                                window.parent.location.replace("/");
                            } else {
                                $.showErr("添加失败");
                            }
                        }
                    }
                );

                // 关闭窗口
                dialogItself.close();
            }
        },
            {
                label: '取消',
                action: function (dialogItself) {
                    dialogItself.close();
                }
            }]
    });
});

// 修改实验项
$(document).on('click', '.modify-experiment', function () {
    var tr = $(this).closest('tr');
    var db_id = $(tr).find('td:eq(0)').text().trim();
    var product_name = $(tr).find('td:eq(1)').text().trim();
    var layer = $(tr).find('td:eq(2)').text().trim();
    var position = $(tr).find('td:eq(3)').text().trim();
    var min_value = $(tr).find('td:eq(4)').text().trim();
    var max_value = $(tr).find('td:eq(5)').text().trim();
    var experiment_name = $(tr).find('td:eq(6)').text().trim();

    BootstrapDialog.show({
        message: function (dialog) {
            // header
            var content = '<div class="form">';

            content += '<div class="form-group">' +
                '<label>名称：</label>' +
                '<input id="product_name" class="form-control" value="' + product_name + '">' +
                '</div>';
            content += '<div class="form-group">' +
                '<label>层次：</label>' +
                '<input id="layer" class="form-control" value="' + layer + '">' +
                '</div>';
            content += '<div class="form-group">' +
                '<label>位置：</label>' +
                '<input id="layer" class="form-control" value="' + position + '">' +
                '</div>';
            content += '<div class="form-group">' +
                '<label>最小值：</label>' +
                '<input id="position" class="form-control" value="' + min_value + '">' +
                '</div>';
            content += '<div class="form-group">' +
                '<label>最大值：</label>' +
                '<input id="min_value" class="form-control" value="' + max_value + '">' +
                '</div>';
            content += '<div class="form-group">' +
                '<label>实验名称：</label>' +
                '<input id="max_value" class="form-control" value="' + experiment_name + '">' +
                '</div>';

            // footer
            content += '</div>';

            return content;
        },
        title: "修改实验项（" + db_id + "）",
        closable: false,
        draggable: true,
        buttons: [{
            label: '确定',
            action: function (dialogItself) {
                // 获取用户添加数据
                var user_account = $("#add_user_account").val();

                var user_control = 0B00;
                if ($("#user_control_in_dialog").prop('checked')) {
                    user_control = 0B10;
                }
                var adtech_bit = 0B000;
                if ($("#adtech_control_in_dialog").prop('checked')) {
                    adtech_bit = 0B100;
                }

                var experiment_bit = 0B0000;
                if ($("#adtech_control_in_dialog").prop('checked')) {
                    experiment_bit = 0B1000;
                }

                var user_right = user_control | adtech_bit | experiment_bit;

                // 发送请求
                $.ajax({
                        url: '/add_user',
                        type: "post",
                        data: {
                            'user_account': user_account,
                            'user_right': user_right,
                        },
                        dataType: 'json',
                        success: function (response) {
                            append_user_list_to_view(response);
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            if (jqXHR.status == 302) {
                                window.parent.location.replace("/");
                            } else {
                                $.showErr("添加失败");
                            }
                        }
                    }
                );

                // 关闭窗口
                dialogItself.close();
            }
        },
            {
                label: '取消',
                action: function (dialogItself) {
                    dialogItself.close();
                }
            }]
    });
});

// 删除实验项
$(document).on('click', '.delete-experiment', function () {
    var db_id = $(this).closest('tr').find('td:eq(0)').text().trim();
    console.log(db_id);
});