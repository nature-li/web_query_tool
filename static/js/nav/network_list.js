$(document).ready(function () {
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
        'view_item_count_per_page': 10,
        'view_start_page_idx': 0,
        'view_current_page_idx': 0,
        'view_current_page_count': 0,
        'query_network_name': ''
    };
}

// 查询数据并更新页面
function query_and_update_view() {
    var off_set = window.save_data.view_current_page_idx * window.save_data.view_item_count_per_page;
    var limit = window.save_data.view_item_count_per_page;

    $.ajax({
            url: '/query_network_list',
            type: "post",
            data: {
                'network_name': window.save_data.query_network_name,
                'off_set': off_set,
                'limit': limit
            },
            dataType: 'json',
            success: function (response) {
                save_data_and_update_page_view(response);
            },
            error: function () {
                $.showErr("查询失败");
            }
        }
    );
}

// 更新页表
function update_page_view(page_idx) {
    // 删除表格
    $('#t_network_control > tbody  > tr').each(function () {
        $(this).remove();
    });

    // 添加表格
    for (var i = 0; i < window.save_data.item_list.length; i++) {
        var network = window.save_data.item_list[i];
        add_network_row(network.network_id, network.network_name, network.update_time);
    }

    // 更新分页标签
    update_page_partition(page_idx);

    // 改变窗口大小
    change_frame_size();
}

// 点击复选框全选渠道
$("#network_check_all").click(function () {
    if ($(this).prop('checked')) {
        $("#t_network_control").find("input[name='network_list[]']").each(function (i, e) {
            $(e).prop('checked', true);
        })
    } else {
        $("#t_network_control").find("input[name='network_list[]']").each(function (i, e) {
            $(e).prop('checked', false);
        })
    }
});

// 点击删除按钮
$("#del_network_button").click(function () {
    var count = 0;
    $('#t_network_control > tbody  > tr').each(function () {
        var $check_box = $(this).find("td:eq(0)").find("input[name='network_list[]']");
        if ($check_box.prop('checked')) {
            count += 1;
        }
    });

    if (count > 0) {
        $.showConfirm("确定要删除吗?", query_delete_selected_network);
    }
});

// 发送删除选中的渠道请求
function query_delete_selected_network() {
    var content = '';
    $('#t_network_control > tbody  > tr').each(function () {
        var $check_box = $(this).find("td:eq(0)").find("input[name='network_list[]']");
        if ($check_box.prop('checked')) {
            var network_id = $check_box.val();
            content += network_id + ","
        }
    });

    // 发送请求删除后台数据
    if (content != '') {
        $.ajax({
                url: '/delete_network_list',
                type: "post",
                data: {
                    'network_id_list': content
                },
                dataType: 'json',
                success: function (response) {
                    delete_network_list_from_view(response);
                },
                error: function () {
                    $.showErr("删除失败");
                }
            }
        );
    }
}

// 根据返回值从列表中删除用户信息
function delete_network_list_from_view(response) {
    if (response.success == 'false') {
        $.showErr("删除失败");
        return;
    }

    var network_id_list = response.content;
    for (var i = 0; i < network_id_list.length; i++) {
        var del_network_id = network_id_list[i];

        $('#t_network_control > tbody  > tr').each(function () {
            var $check_box = $(this).find("td:eq(0)").find("input[name='network_list[]']");
            var network_id = $check_box.val();
            if (network_id == del_network_id) {
                $(this).remove();
            }
        });
    }
}

// 点击增加按钮
$("#add_network_button").click(function () {
    BootstrapDialog.show({
        message: function (dialog) {
            // header
            var content = '<div>';

            // 账号
            content += '<div><input id="add_network_name" type="text" class="form-control" placeholder="输入渠道名称"></div>';

            // footer
            content += '</div>';

            return content;
        },
        title: "增加渠道",
        closable: false,
        buttons: [{
            label: '确定',
            action: function (dialogItself) {
                // 获取用户添加数据
                var network_name = $("#add_network_name").val();

                // 发送请求
                $.ajax({
                        url: '/add_network',
                        type: "post",
                        data: {
                            'network_name': network_name,
                        },
                        dataType: 'json',
                        success: function (response) {
                            append_network_list_to_view(response);
                        },
                        error: function () {
                            $.showErr("添加失败");
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
function append_network_list_to_view(data) {
    if (data.success == "true") {
        var network_list = data.content;
        for (var i = 0; i < network_list.length; i++) {
            var network = network_list[i];
            add_network_row(network.network_id, network.network_name, network.update_time);
        }

        // 改变窗口大小
        var newHeight = $(document).contents().find('body').height();
        if (newHeight < 1000) {
            newHeight = 1000;
        }
        $("#left_frame_col", window.parent.document).height(newHeight);
        $("#right_frame_col", window.parent.document).height(newHeight);
    } else {
        $.showErr("添加失败");
    }
}

// 在表格中增加渠道
function add_network_row(network_id, network_name, update_time) {
    var table = $("#t_network_control");
    var tr = $('<tr>' +
        '<td style="text-align:center;"><input name="network_list[]" type="checkbox" value="' + network_id + '"></td>' +
        '<td style="text-align:center;">' + network_id + '</td>' +
        '<td style="text-align:center;">' + network_name + '</td>' +
        '<td style="text-align:center;">' + update_time + '</td>');
    table.append(tr);
}

// 点击查找渠道按钮
$("#query_network_button").click(function () {
    // 获取查找渠道
    var query_network_name = $("#query_network_text").val();

    // 清空数据并设置查找账号
    reset_save_data();
    window.save_data.query_network_name = query_network_name;

    // 查询数据并更新页面
    query_and_update_view();
});