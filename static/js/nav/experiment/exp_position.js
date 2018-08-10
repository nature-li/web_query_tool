$(document).ready(function () {
    // 改变菜单背景色
    set_page_active('#li_exp_position');

    // 定义全局变量
    if (!window.save_data) {
        reset_save_data();
    }

    // 查询全部用户并更新列表
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
        'view_item_count_per_page': 15,
        'view_start_page_idx': 0,
        'view_current_page_idx': 0,
        'view_current_page_count': 0,
        'query_position_code': ''
    };
}

// 查询数据并更新页面
function query_and_update_view() {
    var off_set = window.save_data.view_current_page_idx * window.save_data.view_item_count_per_page;
    var limit = window.save_data.view_item_count_per_page;

    $.ajax({
            url: '/exp_position',
            type: "get",
            data: {
                'type': 'QUERY_POS',
                'position': window.save_data.query_position_code,
                'off_set': off_set,
                'limit': limit
            },
            dataType: 'json',
            success: function (response) {
                save_data_and_update_page_view(response);
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

// 更新页表
function update_page_view(page_idx) {
    // 反选表格
    $("#position_check_all").prop('checked', false);

    // 删除表格
    $('#t_position_control > tbody  > tr').each(function () {
        $(this).remove();
    });

    // 添加表格
    for (var i = 0; i < window.save_data.item_list.length; i++) {
        var pos = window.save_data.item_list[i];
        add_position_row(pos);
    }

    // 更新分页标签
    update_page_partition(page_idx);

    // 改变窗口大小
    change_frame_size();
}

// 点击复选框全选渠道
$("#position_check_all").click(function () {
    if ($(this).prop('checked')) {
        $("#t_position_control").find("input[name='position_list[]']").each(function (i, e) {
            $(e).prop('checked', true);
        })
    } else {
        $("#t_position_control").find("input[name='position_list[]']").each(function (i, e) {
            $(e).prop('checked', false);
        })
    }
});

// 点击删除按钮
$("#del_position_button").click(function () {
    var count = 0;
    $('#t_position_control > tbody  > tr').each(function () {
        var $check_box = $(this).find("td:eq(0)").find("input[name='position_list[]']");
        if ($check_box.prop('checked')) {
            count += 1;
        }
    });

    if (count > 0) {
        $.showConfirm("此操作<span style='color: red'>不会删除已有配置中位置</span>，你确定要删除吗?", delete_selected_position);
    }
});

// 发送删除请求
function delete_selected_position() {
    var content = '';
    $('#t_position_control > tbody  > tr').each(function () {
        var $check_box = $(this).find("td:eq(0)").find("input[name='position_list[]']");
        if ($check_box.prop('checked')) {
            var position_id = $check_box.val();
            content += position_id + ","
        }
    });

    // 发送请求删除后台数据
    if (content !== '') {
        $.ajax({
                url: '/exp_position',
                type: "delete",
                data: {
                    'type': 'DEL_POS',
                    'position_id': content
                },
                dataType: 'json',
                success: function (response) {
                    handle_delete_response(response);
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
}

// 处理删除应答
function handle_delete_response(response) {
    if (response.success === false) {
        $.showErr("删除失败");
    }

    // 重画页面
    reload_this_page();
}

// 重新加载页面
function reload_this_page() {
    reset_save_data();
    query_and_update_view();
}


// 点击增加按钮
$("#add_position_button").click(function () {
    BootstrapDialog.show({
        message: function (dialog) {
            // header
            var content = '';
            content += '<div class="form">';

            // 位置id
            content += '<div class="form-group">' +
                '<div><label>位置：</label><label id="position_tip" style="color: red"></label></div>' +
                '<input id="add_position" type="number" class="form-control clear-tips">' +
                '</div>';

            // 描述
            content += '<div class="form-group">' +
                '<div><label>描述：</label><label id="desc_tip" style="color: red"></label></div>' +
                '<input id="add_desc" class="form-control clear-tips">' +
                '</div>';

            // footer
            content += '</div>';

            return content;
        },
        title: "增加位置",
        closable: false,
        buttons: [{
            label: '确定',
            action: function (dialogItself) {
                var position = $("#add_position").val();
                var desc = $("#add_desc").val();

                if (!position) {
                    return;
                }

                // 发送请求
                $.ajax({
                        url: '/exp_position',
                        type: "post",
                        data: {
                            'type': 'ADD_POS',
                            'position': position,
                            'desc': desc
                        },
                        dataType: 'json',
                        success: function (response) {
                            handle_add_position_response(response);
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


// 根据ajax返回值更新页面
function handle_add_position_response(data) {
    if (data.success !== true) {
        $.showErr("添加失败");
    }

    reload_this_page();
}

// 在表格中增加位置信息
function add_position_row(pos) {
    var id = pos.id;
    var position = pos.position;
    var desc = pos.desc;
    var create_time = pos.create_time;

    var table = $("#t_position_control");
    var tr = $('<tr>' +
        '<td style="text-align:center;"><input name="position_list[]" type="checkbox" value="' + id + '"></td>' +
        '<td style="text-align:center;">' + position + '</td>' +
        '<td style="text-align:center;">' + desc + '</td>' +
        '<td style="text-align:center;">' + create_time + '</td>');
    table.append(tr);
}

// 点击查找位置信息
$("#query_position_button").click(function () {
    // 获取查找渠道
    var query_position_code = $("#query_position_text").val();

    // 清空数据并设置查找账号
    reset_save_data();
    window.save_data.query_position_code = query_position_code;

    // 查询数据并更新页面
    query_and_update_view();
});