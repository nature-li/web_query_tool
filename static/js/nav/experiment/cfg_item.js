$(document).ready(function () {
    // 改变菜单背景色
    set_page_active("#li_cfg_item");

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
        if (item.status === 1) {
            status_td = '<input type="checkbox" class="toggle-status" data-toggle="toggle" data-style="radius" data-on="启用" ' +
                'data-off="禁用" data-size="mini" data-onstyle="primary" checked />';
        }

        var operate_dt =
            '<div class="text-center">' +
            '<button type="button" class="btn btn-primary btn-xs modify-cfg-item" style="margin-right: 5px;">' +
            '<span class="glyphicon glyphicon-wrench"></span>' +
            '</button>' +
            '<button type="button" class="btn btn-primary btn-xs delete-cfg-item">' +
            '<span class="glyphicon glyphicon-minus"></span>' +
            '</button>' +
            '</div>';

        html += "<tr>" +
            "<td class='text-center'>" + item.id + "</td>" +
            "<td class='text-center'>" + item.name + "</td>" +
            "<td class='text-center'>" + item.position + "</td>" +
            "<td class='text-center'>" + item.start_value + "</td>" +
            "<td class='text-center'>" + item.stop_value + "</td>" +
            "<td class='text-center'>" + item.algo_request + "</td>" +
            "<td class='text-center'>" + item.algo_response + "</td>" +
            "<td class='text-center'>" + item.create_time + "</td>" +
            "<td class='text-center'>" + item.desc + "</td>" +
            "<td class='text-center'>" + status_td + "</td>" +
            '<td style="text-center">' + operate_dt + '</td>' +
            "</tr>";
    }
    $("#cfg_item_result tbody").find("tr").remove();
    $("#cfg_item_result tbody").append(html);

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
    var query_cfg_item_name = $("#query_cfg_item_text").val().trim();

    var off_set = window.save_data.view_current_page_idx * window.save_data.view_item_count_per_page;
    var limit = window.save_data.view_item_count_per_page;

    // 加载数据
    $.ajax({
            url: '/cfg_item',
            type: "get",
            data: {
                'type': 'QUERY_ITEM',
                'item_name': query_cfg_item_name,
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

$("#query_cfg_item_btn").click(function () {
    reload_page();
});

// Reload page
function reload_page() {
    reset_save_data();
    query_and_update_view();
}

// 增加实验项
$(document).on('click', "#add_cfg_item", function () {
    BootstrapDialog.show({
        message: function (dialog) {
            // header
            var content = '<div class="form">';

            content += '<div class="form-group">' +
                '<label style="margin: 0 5px;">启用</label>' +
                '<input id="status" type="checkbox" name="status"/>' +
                '</div>';
            content += '<div class="form-group">' +
                '<div><label>配置id：</label></div>' +
                '<input id="item_id" class="form-control clear_tips">' +
                '</div>';
            content += '<div class="form-group">' +
                '<div><label>配置名称：</label></div>' +
                '<input id="item_name" class="form-control clear_tips">' +
                '</div>';
            content += '<div class="form-group">' +
                '<div><label>位置：</label></div>' +
                '<input id="position" class="form-control clear_tips">' +
                '</div>';
            content += '<div class="form-group">' +
                '<div><label>起始值：</label></div>' +
                '<input id="start_value" type="number" class="form-control clear_tips">' +
                '</div>';
            content += '<div class="form-group">' +
                '<div><label>结束值：</label></div>' +
                '<input id="stop_value" type="number" class="form-control clear_tips">' +
                '</div>';
            content += '<div class="form-group">' +
                '<div><label>algo请求串：</label></div>' +
                '<input id="algo_request" class="form-control clear_tips">' +
                '</div>';
            content += '<div class="form-group">' +
                '<div><label>algo应答串：</label></div>' +
                '<input id="algo_response" class="form-control clear_tips">' +
                '</div>';
            content += '<div class="form-group">' +
                '<div><label>描述信息：</label></div>' +
                '<input id="item_desc" class="form-control clear_tips">' +
                '</div>';
            content += '<div id="tip_div" class="form-group no-display">' +
                '<div><label id="tip_msg" style="color: red">abc</label></div>' +
                '</div>';
            // footer
            content += '</div>';

            return content;
        },
        title: "增加配置项",
        closable: false,
        draggable: true,
        buttons: [{
            label: '确定',
            action: function (dialogItself) {
                // 获取用户添加数据
                var status = 0;
                if ($("#status").prop('checked')) {
                    status = 1;
                }
                var item_id = $("#item_id").val().trim();
                var item_name = $("#item_name").val().trim();
                var position = $("#position").val().trim();
                var start_value = $("#start_value").val().trim();
                var stop_value = $("#stop_value").val().trim();
                var algo_request = $("#algo_request").val().trim();
                var algo_response = $("#algo_response").val().trim();
                var item_desc = $("#item_desc").val().trim();

                if (!check_inputs(item_id, item_name, position, start_value, stop_value, algo_request, algo_response, item_desc)) {
                    return;
                }

                // 发送请求
                $.ajax({
                        url: '/cfg_item',
                        type: "post",
                        data: {
                            type: "ADD_ITEM",
                            item_id: item_id,
                            item_name: item_name,
                            position: position,
                            start_value: start_value,
                            stop_value: stop_value,
                            algo_request: algo_request,
                            algo_response: algo_response,
                            status: status,
                            desc: item_desc
                        },
                        dataType: 'json',
                        success: function (response) {
                            handle_add_cfg_item_response(response);
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
$(document).on('click', '.modify-cfg-item', function () {
    var tr = $(this).closest('tr');
    var item_id = $(tr).find('td:eq(0)').text().trim();
    var item_name = $(tr).find('td:eq(1)').text().trim();
    var position = $(tr).find('td:eq(2)').text().trim();
    var start_value = $(tr).find('td:eq(3)').text().trim();
    var stop_value = $(tr).find('td:eq(4)').text().trim();
    var algo_request = $(tr).find('td:eq(5)').text().trim();
    var algo_response = $(tr).find('td:eq(6)').text().trim();
    var item_desc = $(tr).find('td:eq(8)').text().trim();
    var status = $(tr).find('td:eq(9)').find('input').prop('checked');

    BootstrapDialog.show({
        message: function (dialog) {
            // header
            var content = '<div class="form">';

            if (!status) {
                content += '<div class="form-group">' +
                    '<label style="margin: 0 5px;">启用</label>' +
                    '<input id="status" type="checkbox" name="status"/>' +
                    '</div>';
            } else {
                content += '<div class="form-group">' +
                    '<label style="margin: 0 5px;">启用</label>' +
                    '<input id="status" type="checkbox" name="status" checked/>' +
                    '</div>';
            }
            content += '<div><hr /></div>';
            content += '<div class="form-group">' +
                '<label>配置id：</label>' +
                '<input id="item_id" class="form-control clear_tips" value="' + item_id + '" readonly>' +
                '</div>';
            content += '<div class="form-group">' +
                '<label>配置名称：</label>' +
                '<input id="item_name" class="form-control clear_tips" value="' + item_name + '">' +
                '</div>';
            content += '<div class="form-group">' +
                '<label>位置：</label>' +
                '<input id="position" class="form-control clear_tips" value="' + position + '">' +
                '</div>';
            content += '<div class="form-group">' +
                '<label>起始值：</label>' +
                '<input type="number" id="start_value" class="form-control clear_tips" value="' + start_value + '">' +
                '</div>';
            content += '<div class="form-group">' +
                '<label>结束值：</label>' +
                '<input type="number" id="stop_value" class="form-control clear_tips" value="' + stop_value + '">' +
                '</div>';
            content += '<div class="form-group">' +
                '<label>algo请求串：</label>' +
                '<input id="algo_request" class="form-control clear_tips" value="' + algo_request + '">' +
                '</div>';
            content += '<div class="form-group">' +
                '<label>algo应答串：</label>' +
                '<input id="algo_response" class="form-control clear_tips" value="' + algo_response + '">' +
                '</div>';
            content += '<div class="form-group">' +
                '<label>配置描述：</label>' +
                '<input id="item_desc" class="form-control clear_tips" value="' + item_desc + '">' +
                '</div>';
            content += '<div id="tip_div" class="form-group no-display">' +
                '<div><label id="tip_msg" style="color: red"></label></div>' +
                '</div>';

            // footer
            content += '</div>';

            return content;
        },
        title: "修改配置项（" + item_id + "）",
        closable: false,
        draggable: true,
        buttons: [{
            label: '确定',
            action: function (dialogItself) {
                // 获取用户添加数据
                var status = 0;
                if ($("#status").prop('checked')) {
                    status = 1;
                }
                var item_id = $("#item_id").val().trim();
                var item_name = $("#item_name").val().trim();
                var position = $("#position").val().trim();
                var start_value = $("#start_value").val().trim();
                var stop_value = $("#stop_value").val().trim();
                var algo_request = $("#algo_request").val().trim();
                var algo_response = $("#algo_response").val().trim();
                var item_desc = $("#item_desc").val().trim();

                if (!check_inputs(item_id, item_name, position, start_value, stop_value, algo_request, algo_response, item_desc)) {
                    return;
                }

                // 发送请求
                $.ajax({
                        url: '/cfg_item',
                        type: "put",
                        data: {
                            type: "MODIFY_ITEM",
                            item_id: item_id,
                            item_name: item_name,
                            position: position,
                            start_value: start_value,
                            stop_value: stop_value,
                            algo_request: algo_request,
                            algo_response: algo_response,
                            status: status,
                            desc: item_desc
                        },
                        dataType: 'json',
                        success: function (response) {
                            handle_modify_cfg_item_response(response);
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
$(document).on('click', '.delete-cfg-item', function () {
    var item_id = $(this).closest('tr').find('td:eq(0)').text().trim();
    $.showConfirm("确定要删除吗?", delete_one_cfg_item(item_id));
});

// 删除实验项
function delete_one_cfg_item(item_id) {
    function work_func() {
        // 发送请求
        $.ajax({
                url: '/cfg_item',
                type: "delete",
                data: {
                    type: 'DEL_ITEM',
                    item_id: item_id
                },
                dataType: 'json',
                success: function (response) {
                    handle_delete_cfg_item_response(response);
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
    var item_id = $(this).closest('tr').find('td:eq(0)').text().trim();

    var status = 0;
    if ($(this).prop('checked')) {
        status = 1;
    }

    // 发送请求
    $.ajax({
            url: '/cfg_item',
            type: "put",
            data: {
                type: 'MODIFY_STATUS',
                item_id: item_id,
                status: status
            },
            dataType: 'json',
            success: function (response) {
                handle_modify_cfg_item_response(response);
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

function check_inputs(item_id, item_name, position, start_value, stop_value, algo_request, algo_response, item_desc) {
    if (item_id === "") {
        show_tip_msg("配置id不能为空");
        return false;
    }

    if (item_name === "") {
        show_tip_msg("配置名称不能为空");
        return false;
    }

    if (position === "") {
        show_tip_msg("位置不能为空");
        return false;
    }

    if (start_value === "") {
        show_tip_msg("起始值不能为空");
        return false;
    }
    start_value = parseInt(start_value);

    if (stop_value === "") {
        show_tip_msg("结束值不能为空");
        return false;
    }
    stop_value = parseInt(stop_value);

    if (start_value > stop_value) {
        show_tip_msg("起始值不能大于结束值");
        return false;
    }

    if (algo_request === "") {
        show_tip_msg("algo请求串不能为空");
        return false;
    }

    if (algo_response === "") {
        show_tip_msg("algo应答串不能为空");
        return false;
    }

    return true;
}

function handle_add_cfg_item_response(response) {
    if (response.success !== true) {
        $.showErr('添加失败');
        reload_page();
        return;
    }

    reload_page();
}

function handle_modify_cfg_item_response(response) {
    if (response.success !== true) {
        $.showErr("更新失败");
        reload_page();
        return;
    }

    for (var i = 0; i < response.content.length; i++) {
        var item = response.content[i];
        $("#cfg_item_result tbody").find("tr").each(function () {
            var item_id = $(this).find("td:eq(0)").text().trim();
            if (item_id !== item.id.toString()) {
                return;
            }

            $(this).find("td:eq(1)").html(item.name);
            $(this).find("td:eq(2)").html(item.position);
            $(this).find("td:eq(3)").html(item.start_value);
            $(this).find("td:eq(4)").html(item.stop_value);
            $(this).find("td:eq(5)").html(item.algo_request);
            $(this).find("td:eq(6)").html(item.algo_response);
            $(this).find("td:eq(7)").html(item.create_time);
            $(this).find("td:eq(8)").html(item.desc);

            var status_td = '<input type="checkbox" class="toggle-status" data-toggle="toggle" data-style="radius" data-on="启用" ' +
                'data-off="禁用" data-size="mini" data-onstyle="primary" />';
            if (item.status === 1) {
                status_td = '<input type="checkbox" class="toggle-status" data-toggle="toggle" data-style="radius" data-on="启用" ' +
                    'data-off="禁用" data-size="mini" data-onstyle="primary" checked />';
            }
            $(this).find("td:eq(9)").html(status_td);

            $(this).find("td:eq(9)").find("input").bootstrapToggle();
        });
    }
}

function handle_delete_cfg_item_response(response) {
    if (response.success !== true) {
        $.showErr("删除失败");
    }

    reload_page();
}