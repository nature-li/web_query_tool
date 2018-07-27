$(document).ready(function () {
    // 改变菜单背景色
    $("#li_day_count", window.parent.document).removeClass("selected_menu");
    $("#li_hour_count", window.parent.document).removeClass("selected_menu");
    $("#li_position", window.parent.document).removeClass("selected_menu");
    $("#li_chart", window.parent.document).removeClass("selected_menu");
    $("#li_experiment_config", window.parent.document).removeClass("selected_menu");
    $("#li_user_list", window.parent.document).removeClass("selected_menu");
    $("#li_network_list", window.parent.document).removeClass("selected_menu");
    $("#li_user_list", window.parent.document).addClass("selected_menu");

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
    var statistic_control = $tr.find("td:eq(3)").html();
    var experiment_control = $tr.find("td:eq(4)").html();
    var develop_control = $tr.find("td:eq(5)").html();
    var system_control = $tr.find("td:eq(6)").html();

    show_edit_dialog(user_id, user_account, develop_control, system_control, statistic_control, experiment_control);
});

// 弹出编辑对话框
function show_edit_dialog(user_id, user_account, develop_control, system_control, statistic_control, experiment_control) {
    var old_user_right = 0;

    BootstrapDialog.show({
        message: function (dialog) {
            // header
            var content = '<div>';

            // id
            content += '<div style="display: none"><input id="edit_user_id" type="text" class="form-control" value="' + user_id + '" disabled></div>';

            // 账号
            content += '<div><input id="edit_user_account" type="text" class="form-control" value="' + user_account + '" disabled></div>';

            // 系统
            content += '<div class="checkbox">';
            content += '<span style="margin-right: 30px;">权限:</span>';

            var statistic_bit = 0;
            if (statistic_control !=='') {
                statistic_bit = USER_RIGHT.STATISTIC;
                content += '<label style="margin: 0 10px;"><input id="statistic_control_in_dialog" type="checkbox" name="is_admin" value="' + statistic_bit + '" checked/>数据统计</label>';
            } else {
                content += '<label style="margin: 0 10px;"><input id="statistic_control_in_dialog" type="checkbox" name="is_admin" value="' + statistic_bit + '"/>数据统计</label>';
            }

            var experiment_bit = 0;
            if (experiment_control !=='') {
                experiment_bit = USER_RIGHT.EXPERIMENT;
                content += '<label style="margin: 0 10px;"><input id="experiment_control_in_dialog" type="checkbox" name="is_admin" value="' + experiment_bit + '" checked/>实验平台</label>';
            } else {
                content += '<label style="margin: 0 10px;"><input id="experiment_control_in_dialog" type="checkbox" name="is_admin" value="' + experiment_bit + '"/>实验平台</label>';
            }

            var develop_bit = 0;
            if (develop_control !== '') {
                develop_bit = USER_RIGHT.DEVELOP;
                content += '<label style="margin: 0 10px;"><input id="develop_control_in_dialog" type="checkbox" name="is_admin" value="'+ develop_bit + '" checked/>渠道</label>';
            } else {
                content += '<label style="margin: 0 10px;"><input id="develop_control_in_dialog" type="checkbox" name="is_admin" value="'+ develop_bit + '"/>渠道</label>';
            }

            var system_bit = 0;
            if (system_control !== '') {
                system_bit = USER_RIGHT.SYSTEM;
                content += '<label style="margin: 0 10px;"><input id="system_control_in_dialog" type="checkbox" name="is_admin" value="'+ system_bit + '" checked/>系统</label>';
            } else {
                content += '<label style="margin: 0 10px;"><input id="system_control_in_dialog" type="checkbox" name="is_admin" value="'+ system_bit + '"/>系统</label>';
            }


            old_user_right = develop_bit | system_bit | statistic_bit | experiment_bit;
            content += '</div>';

            // footer
            content += '</div>';

            return content;
        },
        title: "编辑用户",
        closable: false,
        draggable: true,
        buttons: [{
            label: '确定',
            action: function (dialogItself) {
                // 获取用户添加数据
                var user_id = $("#edit_user_id").val();

                var develop_bit = 0;
                if ($("#develop_control_in_dialog").prop('checked')) {
                    develop_bit = USER_RIGHT.DEVELOP;
                }

                var system_bit = 0;
                if ($("#system_control_in_dialog").prop('checked')) {
                    system_bit = USER_RIGHT.SYSTEM;
                }

                var statistic_bit = 0;
                if ($("#statistic_control_in_dialog").prop('checked')) {
                    statistic_bit = USER_RIGHT.STATISTIC;
                }

                var experiment_bit = 0;
                if ($("#experiment_control_in_dialog").prop('checked')) {
                    experiment_bit = USER_RIGHT.EXPERIMENT;
                }

                var user_right = develop_bit | system_bit | statistic_bit | experiment_bit;

                // 权限发生变化后发送请求
                if (old_user_right !== user_right) {
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

// 根据response更新用户权限
function edit_user_page_view(response) {
    if (response.success == 'false') {
        $.showErr("更新失败");
        return;
    }

    var user = response.content;
    var user_id = user.user_id.toString();
    var user_account = user.user_account;
    var user_right = user.user_right;
    var update_time = user.update_time;

    $('#t_user_control > tbody  > tr').each(function () {
        var $check_box = $(this).find("td:eq(0)").find("input[name='user_list[]']");
        var bind_user_id = $check_box.val();

        if (bind_user_id === user_id) {

            var develop_control = '<img src="/static/images/ok.png" alt="是">';
            if ((user_right & USER_RIGHT.DEVELOP) === 0) {
                develop_control = '';
            }

            var system_control = '<img src="/static/images/ok.png" alt="是">';
            if ((user_right & USER_RIGHT.SYSTEM) === 0) {
                system_control = '';
            }

            var statistic_control = '<img src="/static/images/ok.png" alt="是">';
            if ((user_right & USER_RIGHT.STATISTIC) === 0) {
                statistic_control = '';
            }

            var experiment_control = '<img src="/static/images/ok.png" alt="是">';
            if ((user_right & USER_RIGHT.EXPERIMENT) === 0) {
                experiment_control = '';
            }

            $(this).find("td:eq(1)").html(user_id);
            $(this).find("td:eq(2)").html(user_account);
            $(this).find("td:eq(3)").html(statistic_control);
            $(this).find("td:eq(4)").html(experiment_control);
            $(this).find("td:eq(5)").html(develop_control);
            $(this).find("td:eq(6)").html(system_control);
            $(this).find("td:eq(7)").html(update_time);
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
            content += '<label style="margin: 0 10px;"><input id="statistic_control_in_dialog" type="checkbox" name="user_right[]" value="2" />数据统计</label>';
            content += '<label style="margin: 0 10px;"><input id="experiment_control_in_dialog" type="checkbox" name="user_right[]" value="3" />实验平台</label>';
            content += '<label style="margin: 0 10px;"><input id="develop_control_in_dialog" type="checkbox" name="user_right[]" value="1" />渠道</label>';
            content += '<label style="margin: 0 10px;"><input id="system_control_in_dialog" type="checkbox" name="user_right[]" value="1" />系统</label>';
            content += '</div>';

            // footer
            content += '</div>';

            return content;
        },
        title: "增加用户",
        closable: false,
        draggable: true,
        buttons: [{
            label: '确定',
            action: function (dialogItself) {
                // 获取用户添加数据
                var user_account = $("#add_user_account").val();

                var develop_control = 0;
                if ($("#develop_control_in_dialog").prop('checked')) {
                    develop_control = USER_RIGHT.DEVELOP;
                }

                var system_control = 0;
                if ($("#system_control_in_dialog").prop('checked')) {
                    system_control = USER_RIGHT.SYSTEM;
                }

                var statistic_bit = 0;
                if ($("#statistic_control_in_dialog").prop('checked')) {
                    statistic_bit = USER_RIGHT.STATISTIC;
                }

                var experiment_bit = 0;
                if ($("#statistic_control_in_dialog").prop('checked')) {
                    experiment_bit = USER_RIGHT.EXPERIMENT;
                }

                var user_right = develop_control | system_control | statistic_bit | experiment_bit;

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
        change_frame_size();
    } else {
        $.showErr("添加失败");
    }
}

// 在表格中增加用户
function add_row(user_id, user_account, user_right, update_time) {
    var develop_control = '<img src="/static/images/ok.png" alt="是">';
    if ((user_right & USER_RIGHT.DEVELOP) === 0) {
        develop_control = '';
    }

    var system_control = '<img src="/static/images/ok.png" alt="是">';
    if ((user_right & USER_RIGHT.SYSTEM) === 0) {
        system_control = '';
    }

    var statistic_control = '<img src="/static/images/ok.png" alt="是">';
    if ((user_right & USER_RIGHT.STATISTIC) === 0) {
        statistic_control = '';
    }

    var experiment_control = '<img src="/static/images/ok.png" alt="是">';
    if ((user_right & USER_RIGHT.EXPERIMENT) === 0) {
        experiment_control = '';
    }

    var table = $("#t_user_control");
    var tr = $('<tr>' +
        '<td style="text-align:center;"><input name="user_list[]" type="checkbox" value="' + user_id + '"></td>' +
        '<td style="text-align:center;">' + user_id + '</td>' +
        '<td style="text-align:center;">' + user_account + '</td>' +
        '<td style="text-align:center;">' + statistic_control + '</td>' +
        '<td style="text-align:center;">' + experiment_control + '</td>' +
        '<td style="text-align:center;">' + develop_control + '</td>' +
        '<td style="text-align:center;">' + system_control + '</td>' +
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
