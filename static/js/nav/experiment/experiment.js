$(document).ready(function () {
    // 改变菜单背景色
    $("#li_day_count", window.parent.document).removeClass("selected_menu");
    $("#li_hour_count", window.parent.document).removeClass("selected_menu");
    $("#li_position", window.parent.document).removeClass("selected_menu");
    $("#li_chart", window.parent.document).removeClass("selected_menu");
    $("#li_experiment_config", window.parent.document).removeClass("selected_menu");
    $("#li_user_list", window.parent.document).removeClass("selected_menu");
    $("#li_network_list", window.parent.document).removeClass("selected_menu");
    $("#li_experiment_config", window.parent.document).addClass("selected_menu");

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
        'view_item_count_per_page': 10,
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

        var status_td = '<input type="checkbox" class="toggle-status" data-toggle="toggle" data-style="radius" data-on="启用" ' +
            'data-off="禁用" data-size="mini" data-onstyle="primary" />';
        if (item.enable === 1) {
            status_td = '<input type="checkbox" class="toggle-status" data-toggle="toggle" data-style="radius" data-on="启用" ' +
                'data-off="禁用" data-size="mini" data-onstyle="primary" checked />';
        }

        var operate_dt =
            '<div class="text-center">' +
            '<button type="button" class="btn btn-primary btn-xs modify-experiment" style="margin-right: 5px;">' +
            '<span class="glyphicon glyphicon-wrench"></span>' +
            '</button>' +
            '<button type="button" class="btn btn-primary btn-xs delete-experiment">' +
            '<span class="glyphicon glyphicon-minus"></span>' +
            '</button>' +
            '</div>';
        console.log(operate_dt);

        html += "<tr>" +
            "<td class='text-center'>" + item.id + "</td>" +
            "<td class='text-center'>" + item.product + "</td>" +
            "<td class='text-center'>" + item.layer + "</td>" +
            "<td class='text-center'>" + item.position + "</td>" +
            "<td class='text-center'>" + item.min_value + "</td>" +
            "<td class='text-center'>" + item.max_value + "</td>" +
            "<td class='text-center'>" + item.algo_id + "</td>" +
            "<td class='text-center'>" + status_td + "</td>" +
            '<td style="text-center">' + operate_dt + '</td>' +
            "<td class='text-center'>" + item.create_time + "</td>" +
            "</tr>";
    }
    $("#experiment_result tbody").find("tr").remove();
    $("#experiment_result tbody").append(html);

    // 初始化 bootstrap-toggle
    $('.toggle-status').bootstrapToggle();

    // 更新分页标签
    update_page_partition(page_idx);

    // 改变窗口大小
    change_frame_size();
}

// 查询并更新页面
function query_and_update_view() {
    // 获取 product_name
    var query_product_name = $("#query_product_text").val().trim();

    var off_set = window.save_data.view_current_page_idx * window.save_data.view_item_count_per_page;
    var limit = window.save_data.view_item_count_per_page;

    // 加载数据
    $.ajax({
            url: '/experiment',
            type: "get",
            data: {
                'type': 'QUERY_EXPERIMENT',
                'product_name': query_product_name,
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

$("#query_product_btn").click(function () {
    reload_page();
});

// Reload page
function reload_page() {
    reset_save_data();
    query_and_update_view();
}

// 增加实验项
$(document).on('click', "#add_experiment", function () {
    BootstrapDialog.show({
        message: function (dialog) {
            // header
            var content = '<div class="form">';

            content += '<div class="form-group">' +
                '<label style="margin: 0 5px;">启用</label>' +
                '<input id="is_enable" type="checkbox" name="is_enable"/>' +
                '</div>';
            content += '<div class="form-group">' +
                '<div><label>名称：</label></div>' +
                '<input id="product_name" class="form-control clear_tips">' +
                '</div>';
            content += '<div class="form-group">' +
                '<div><label>层次：</label></div>' +
                '<input id="layer" class="form-control clear_tips">' +
                '</div>';
            content += '<div class="form-group">' +
                '<div><label>位置：</label></div>' +
                '<input id="position" class="form-control clear_tips">' +
                '</div>';
            content += '<div class="form-group">' +
                '<div><label>最小值：</label></div>' +
                '<input id="min_value" type="number" class="form-control clear_tips">' +
                '</div>';
            content += '<div class="form-group">' +
                '<div><label>最大值：</label></div>' +
                '<input id="max_value" type="number" class="form-control clear_tips">' +
                '</div>';
            content += '<div class="form-group">' +
                '<div><label>实验名称：</label></div>' +
                '<input id="experiment_name" class="form-control clear_tips">' +
                '</div>';
            content += '<div id="tip_div" class="form-group no-display">' +
                '<div><label id="tip_msg" style="color: red">abc</label></div>' +
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
                var enable = 0;
                if ($("#is_enable").prop('checked')) {
                    enable = 1;
                }
                var product_name = $("#product_name").val();
                var layer = $("#layer").val();
                var position = $("#position").val();
                var min_value = $("#min_value").val();
                var max_value = $("#max_value").val();
                var experiment_name = $("#experiment_name").val();

                if (!check_inputs(product_name, layer, position, min_value, max_value, experiment_name)) {
                    return;
                }

                // 发送请求
                $.ajax({
                        url: '/experiment',
                        type: "post",
                        data: {
                            type: "ADD_EXPERIMENT",
                            product_name: product_name,
                            layer: layer,
                            position: position,
                            min_value: min_value,
                            max_value: max_value,
                            experiment_name: experiment_name,
                            enable: enable
                        },
                        dataType: 'json',
                        success: function (response) {
                            handle_add_experiment_response(response);
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
    var enable = $(tr).find('td:eq(7)').find('input').prop('checked');

    BootstrapDialog.show({
        message: function (dialog) {
            // header
            var content = '<div class="form">';

            if (!enable) {
                content += '<div class="form-group">' +
                    '<label style="margin: 0 5px;">启用</label>' +
                    '<input id="is_enable" type="checkbox" name="is_enable"/>' +
                    '</div>';
            } else {
                content += '<div class="form-group">' +
                    '<label style="margin: 0 5px;">启用</label>' +
                    '<input id="is_enable" type="checkbox" name="is_enable" checked/>' +
                    '</div>';
            }
            content += '<div><hr /></div>';
            content += '<div class="form-group">' +
                '<label>名称：</label>' +
                '<input id="product_name" class="form-control clear_tips" value="' + product_name + '">' +
                '</div>';
            content += '<div class="form-group">' +
                '<label>层次：</label>' +
                '<input id="layer" class="form-control clear_tips" value="' + layer + '">' +
                '</div>';
            content += '<div class="form-group">' +
                '<label>位置：</label>' +
                '<input id="position" class="form-control clear_tips" value="' + position + '">' +
                '</div>';
            content += '<div class="form-group">' +
                '<label>最小值：</label>' +
                '<input type="number" id="min_value" class="form-control clear_tips" value="' + min_value + '">' +
                '</div>';
            content += '<div class="form-group">' +
                '<label>最大值：</label>' +
                '<input type="number" id="max_value" class="form-control clear_tips" value="' + max_value + '">' +
                '</div>';
            content += '<div class="form-group">' +
                '<label>实验名称：</label>' +
                '<input id="experiment_name" class="form-control clear_tips" value="' + experiment_name + '">' +
                '</div>';
            content += '<div id="tip_div" class="form-group no-display">' +
                '<div><label id="tip_msg" style="color: red">abc</label></div>' +
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
                var enable = 0;
                if ($("#is_enable").prop('checked')) {
                    enable = 1;
                }
                var product_name = $("#product_name").val();
                var layer = $("#layer").val();
                var position = $("#position").val();
                var min_value = $("#min_value").val();
                var max_value = $("#max_value").val();
                var experiment_name = $("#experiment_name").val();

                if (!check_inputs(product_name, layer, position, min_value, max_value, experiment_name)) {
                    return;
                }

                // 发送请求
                $.ajax({
                        url: '/experiment',
                        type: "put",
                        data: {
                            db_id: db_id,
                            type: "MODIFY_EXPERIMENT",
                            product_name: product_name,
                            layer: layer,
                            position: position,
                            min_value: min_value,
                            max_value: max_value,
                            experiment_name: experiment_name,
                            enable: enable
                        },
                        dataType: 'json',
                        success: function (response) {
                            handle_modify_experiment_response(response);
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            if (jqXHR.status == 302) {
                                window.parent.location.replace("/");
                            } else {
                                $.showErr("修改失败");
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
    $.showConfirm("确定要删除吗?", delete_one_experiment(db_id));
});

// 删除实验项
function delete_one_experiment(db_id) {
    function work_func() {
        // 发送请求
        $.ajax({
                url: '/experiment',
                type: "delete",
                data: {
                    type: 'DEL_EXPERIMENT',
                    db_id: db_id
                },
                dataType: 'json',
                success: function (response) {
                    handle_delete_experiment_response(response);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    if (jqXHR.status == 302) {
                        window.parent.location.replace("/");
                    } else {
                        $.showErr("删除失败");
                    }
                }
            }
        );
    }

    return work_func;
}

// 切换状态
$(document).on('change', '.toggle-status', function () {
    var db_id = $(this).closest('tr').find('td:eq(0)').text().trim();

    var enable = 0;
    if ($(this).prop('checked')) {
        enable = 1;
    }

    // 发送请求
    $.ajax({
            url: '/experiment',
            type: "put",
            data: {
                type: 'MODIFY_STATUS',
                db_id: db_id,
                enable: enable
            },
            dataType: 'json',
            success: function (response) {
                handle_modify_experiment_response(response);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                if (jqXHR.status == 302) {
                    window.parent.location.replace("/");
                } else {
                    $.showErr("删除失败");
                }
            }
        }
    );
});

// 清除错误提示
$(document).on('input', '.clear_tips', function () {
    if (!$("#tip_div").hasClass("no-display")) {
        $("#tip_div").addClass("no-display");
    }
});

// 显示错误提示
function show_tip_msg(msg) {
    $("#tip_msg").html(msg);
    if ($("#tip_div").hasClass("no-display")) {
        $("#tip_div").removeClass("no-display");
    }
}

function check_inputs(product_name, layer, position, min_value, max_value, experiment_name) {
    if (product_name === "") {
        show_tip_msg("名称不能为空");
        return false;
    }

    if (layer === "") {
        show_tip_msg("层次不能为空");
        return false;
    }

    if (position === "") {
        show_tip_msg("位置不能为空");
        return false;
    }

    if (min_value === "") {
        show_tip_msg("最小值不能为空");
        return false;
    }
    min_value = parseInt(min_value);

    if (max_value === "") {
        show_tip_msg("最大值不能为空");
        return false;
    }
    max_value = parseInt(max_value);

    if (min_value > max_value) {
        show_tip_msg("最小值不能大于最大值");
        return false;
    }

    if (experiment_name === "") {
        show_tip_msg("实验名称不能为空");
        return false;
    }

    return true;
}

function handle_add_experiment_response(response) {
    if (response.success !== true) {
        $.showErr('添加失败');
        reload_page();
        return;
    }

    reload_page();
}

function handle_modify_experiment_response(response) {
    if (response.success !== true) {
        $.showErr("更新失败");
        reload_page();
        return;
    }

    for (var i = 0; i < response.content.length; i++) {
        var item = response.content[i];
        $("#experiment_result tbody").find("tr").each(function () {
            var db_id = $(this).find("td:eq(0)").text().trim();
            if (db_id !== item.id.toString()) {
                return;
            }

            $(this).find("td:eq(1)").html(item.product);
            $(this).find("td:eq(2)").html(item.layer);
            $(this).find("td:eq(3)").html(item.position);
            $(this).find("td:eq(4)").html(item.min_value);
            $(this).find("td:eq(5)").html(item.max_value);
            $(this).find("td:eq(6)").html(item.algo_id);

            var status_td = '<input type="checkbox" class="toggle-status" data-toggle="toggle" data-style="radius" data-on="启用" ' +
                'data-off="禁用" data-size="mini" data-onstyle="primary" />';
            if (item.enable === 1) {
                status_td = '<input type="checkbox" class="toggle-status" data-toggle="toggle" data-style="radius" data-on="启用" ' +
                    'data-off="禁用" data-size="mini" data-onstyle="primary" checked />';
            }
            $(this).find("td:eq(7)").html(status_td);

            $(this).find("td:eq(7)").find("input").bootstrapToggle();
        });
    }
}

function handle_delete_experiment_response(response) {
    if (response.success !== true) {
        $.showErr("删除失败");
    }

    reload_page();
}