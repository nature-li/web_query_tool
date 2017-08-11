$(document).ready(function () {
    // 改变菜单背景色
    $("#li_user_control", window.parent.document).addClass("selected_menu");

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
        'query_user_account': ''
    };
}

// 查询数据并更新页面
function query_and_update_view() {
    var off_set = window.save_data.view_current_page_idx * window.save_data.view_item_count_per_page;
    var limit = window.save_data.view_item_count_per_page;

    $.ajax({
            url: '/query_user_list',
            type: "post",
            data: {
                'user_account': window.save_data.query_user_account,
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
    // 删除表格
    $('#t_user_control > tbody  > tr').each(function () {
        $(this).remove();
    });

    // 添加表格
    for (var i = 0; i < window.save_data.item_list.length; i++) {
        var user = window.save_data.item_list[i];
        add_row(user.user_id, user.user_account, user.user_right, user.update_time);
    }

    // 更新分页标签
    update_page_partition(page_idx);

    // 改变窗口大小
    change_frame_size();
}

// 全选多选框
$("#check_all").click(function () {
    if ($(this).prop('checked')) {
        $("#t_user_control").find("input[name='user_list[]']").each(function (i, e) {
            $(e).prop('checked', true);
        })
    } else {
        $("#t_user_control").find("input[name='user_list[]']").each(function (i, e) {
            $(e).prop('checked', false);
        })
    }
});

// 点击删除用户操作
$("#del_user_button").click(function () {
    var count = 0;
    $('#t_user_control > tbody  > tr').each(function () {
        var $check_box = $(this).find("td:eq(0)").find("input[name='user_list[]']");
        if ($check_box.prop('checked')) {
            count += 1;
        }
    });

    if (count > 0) {
        $.showConfirm("确定要删除吗?", query_delete_selected_user);
    }
});

// 删除用户操作
function query_delete_selected_user() {
    var content = '';
    $('#t_user_control > tbody  > tr').each(function () {
        var $check_box = $(this).find("td:eq(0)").find("input[name='user_list[]']");
        if ($check_box.prop('checked')) {
            var user_id = $check_box.val();
            content += user_id + ","
        }
    });

    // 发送请求删除后台数据
    if (content != '') {
        $.ajax({
                url: '/delete_user_list',
                type: "post",
                data: {
                    'user_id_list': content
                },
                dataType: 'json',
                success: function (response) {
                    delete_user_list_from_view(response);
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

// 根据返回值从列表中删除用户信息
function delete_user_list_from_view(response) {
    if (response.success == 'false') {
        $.showErr("删除失败");
        return;
    }

    var user_id_list = response.content;
    for (var i = 0; i < user_id_list.length; i++) {
        var del_user_id = user_id_list[i];

        $('#t_user_control > tbody  > tr').each(function () {
            var $check_box = $(this).find("td:eq(0)").find("input[name='user_list[]']");
            var user_id = $check_box.val();
            if (user_id == del_user_id) {
                $(this).remove();
            }
        });
    }
}

// 编辑用户信息
$(document).on("click", ".user-edit-button", function () {
    var $tr = $(this).parent().parent();
    var user_id = $tr.find("td:eq(1)").text();
    var user_account = $tr.find("td:eq(2)").text();
    var user_control = $tr.find("td:eq(3)").text();
    var adtech_control = $tr.find("td:eq(4)").text();

    show_edit_dialog(user_id, user_account, user_control, adtech_control);
});

// 弹出编辑对话框
function show_edit_dialog(user_id, user_account, user_control, adtech_control) {
    var old_user_right = 0;

    BootstrapDialog.show({
        message: function (dialog) {
            // header
            var content = '<div>';

            // id
            content += '<div style="display: none"><input id="edit_user_id" type="text" class="form-control" value="' + user_id + '" disabled></div>';

            // 账号
            content += '<div><input id="edit_user_account" type="text" class="form-control" value="' + user_account + '" disabled></div>';

            // 用户管理
            content += '<div class="checkbox">';
            content += '<span style="margin-right: 30px;">权限:</span>';
            var user_bit = 0B00;
            if (user_control == '是') {
                user_bit = 0B10;
                content += '<label style="margin: 0 10px;"><input id="user_control_in_dialog" type="checkbox" name="is_admin" value="'+ user_bit + '" checked/>系统管理</label>';
            } else {
                content += '<label style="margin: 0 10px;"><input id="user_control_in_dialog" type="checkbox" name="is_admin" value="'+ user_bit + '"/>系统管理</label>';
            }

            var adtech_bit = 0B000;
            if (adtech_control == '是') {
                adtech_bit = 0B100;
                content += '<label style="margin: 0 10px;"><input id="adtech_control_in_dialog" type="checkbox" name="is_admin" value="' + adtech_bit + '" checked/>adtech小组</label>';
            } else {
                content += '<label style="margin: 0 10px;"><input id="adtech_control_in_dialog" type="checkbox" name="is_admin" value="' + adtech_bit + '"/>adtech小组</label>';
            }
            old_user_right = user_bit | adtech_bit;
            content += '</div>';

            // footer
            content += '</div>';

            return content;
        },
        title: "编辑用户",
        closable: false,
        buttons: [{
            label: '确定',
            action: function (dialogItself) {
                // 获取用户添加数据
                var user_id = $("#edit_user_id").val();

                var user_bit = 0B00;
                if ($("#user_control_in_dialog").prop('checked')) {
                    user_bit = 0B10;
                }
                var adtech_bit = 0B000;
                if ($("#adtech_control_in_dialog").prop('checked')) {
                    adtech_bit = 0B100;
                }
                var user_right = user_bit | adtech_bit;

                // 权限发生变化后发送请求
                if (old_user_right != user_right) {
                    // 发送请求
                    $.ajax({
                            url: '/edit_user',
                            type: "post",
                            data: {
                                'user_id': user_id,
                                'user_right': user_right
                            },
                            dataType: 'json',
                            success: function (response) {
                                edit_user_page_view(response);
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                if (jqXHR.status == 302) {
                                    window.parent.location.replace("/");
                                } else {
                                    $.showErr("更新失败");
                                }
                            }
                        }
                    );
                }

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
}

// 根据response更新用户列表
function edit_user_page_view(response) {
    if (response.success == 'false') {
        $.showErr("更新失败");
        return;
    }

    var user = response.content;
    var user_id = user.user_id;
    var user_account = user.user_account;
    var user_right = user.user_right;
    var update_time = user.update_time;

    $('#t_user_control > tbody  > tr').each(function () {
        var $check_box = $(this).find("td:eq(0)").find("input[name='user_list[]']");
        var bind_user_id = $check_box.val();

        if (bind_user_id == user_id) {

            var user_control = '是';
            if ((user_right & 0B10) == 0) {
                user_control = '否';
            }

            var adtech_control = '是';
            if ((user_right & 0B100) == 0) {
                adtech_control = '否';
            }

            $(this).find("td:eq(1)").html(user_id);
            $(this).find("td:eq(2)").html(user_account);
            $(this).find("td:eq(3)").html(user_control);
            $(this).find("td:eq(4)").html(adtech_control);
            $(this).find("td:eq(5)").html(update_time);
        }
    });
}

// 增加用户
$("#add_user_button").click(function () {
    BootstrapDialog.show({
        message: function (dialog) {
            // header
            var content = '<div>';

            // 账号
            content += '<div><input id="add_user_account" type="text" class="form-control" placeholder="输入账号"></div>';

            // 权限
            content += '<div class="checkbox">';
            content += '<span style="margin-right: 30px;">权限:</span>';
            content += '<label style="margin: 0 10px;"><input id="user_control_in_dialog" type="checkbox" name="user_right[]" value="1" />系统管理</label>';
            content += '<label style="margin: 0 10px;"><input id="adtech_control_in_dialog" type="checkbox" name="user_right[]" value="2" />adtech小组</label>';
            content += '</div>';

            // footer
            content += '</div>';

            return content;
        },
        title: "增加用户",
        closable: false,
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
                var user_right = user_control | adtech_bit;

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

// 根据ajax返回值更新页面
function append_user_list_to_view(data) {
    if (data.success == "true") {
        var user_list = data.content;
        for (var i = 0; i < user_list.length; i++) {
            var user = user_list[i];
            add_row(user.user_id, user.user_account, user.user_right, user.update_time);
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

// 在表格中增加用户
function add_row(user_id, user_account, user_right, update_time) {
    var user_control = '是';
    if ((user_right & 0B10) == 0) {
        user_control = '否';
    }

    var adtech_control = '是';
    if ((user_right & 0B100) == 0) {
        adtech_control = '否';
    }

    var table = $("#t_user_control");
    var tr = $('<tr>' +
        '<td style="text-align:center;"><input name="user_list[]" type="checkbox" value="' + user_id + '"></td>' +
        '<td style="text-align:center;">' + user_id + '</td>' +
        '<td style="text-align:center;">' + user_account + '</td>' +
        '<td style="text-align:center;">' + user_control + '</td>' +
        '<td style="text-align:center;">' + adtech_control + '</td>' +
        '<td style="text-align:center;">' + update_time + '</td>' +
        '<td style="text-align:center;"><button type="button" class="btn btn-primary user-edit-button">编辑</button></td>');
    table.append(tr);
}

// 点击查找用户按钮
$("#query_user_button").click(function () {
    // 获取查找账号
    var query_user_account = $("#query_user_text").val();

    // 清空数据并设置查找账号
    reset_save_data();
    window.save_data.query_user_account = query_user_account;

    // 查询数据并更新页面
    query_and_update_view();
});
