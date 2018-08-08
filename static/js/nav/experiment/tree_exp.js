$(document).ready(function () {
    // 改变菜单背景色
    set_page_active("#li_tree_exp");

    // 定义全局变量
    if (!window.save_data) {
        reset_save_data();
    }

    // 初始化业务下拉列表框
    init_business_selector(init_layer_selector);
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
        'all_layer': [],
        'all_exp': [],
        'all_cfg': [],
        'all_relation': []
    };
}

// 初始化下拉列表框、层节点、配置节点、加载所有实验
function init_layer_selector() {
    $.ajax({
            url: '/layer',
            type: "get",
            data: {
                'type': 'QUERY_LAYER',
                'bns_id': $("#business_selector").val(),
                'layer_id': '',
                'off_set': 0,
                'limit': -1
            },
            dataType: 'json',
            success: function (data) {
                if (data.success !== "true") {
                    return;
                }

                $("#layer_selector").html('');
                var option = '<option value="">选择层</option>';
                $("#layer_selector").append(option);
                for (var i = 0; i < data.content.length; i++) {
                    var item = data.content[i];

                    option = '<option value="' + item.id + '">' + item.name + '</option>';
                    if (i === 0) {
                        option = '<option value="' + item.id + '" selected="selected">' + item.name + '</option>';
                    }
                    $("#layer_selector").append(option);
                }
                $("#layer_selector").selectpicker('refresh');

                reload_layer_node(init_exp_selector);
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

// 重构树视图
function reload_layer_node(func_on_success) {
    reset_save_data();

    var layer_id = $("#layer_selector").val();
    $.ajax({
            url: '/layer',
            type: "get",
            data: {
                'type': 'QUERY_LAYER',
                'bns_id': $("#business_selector").val(),
                'layer_id': layer_id,
                'off_set': 0,
                'limit': -1
            },
            dataType: 'json',
            success: function (data) {
                if (data.success !== "true") {
                    return;
                }

                // 加载配置节点、实验节点
                window.save_data.all_layer = data.content;
                load_exp_node(window.save_data.all_layer, func_on_success);

                // 加载所有配置项
                load_all_cfg();
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

// 为实验可用状态添加按钮
function create_status_button(value, row, index) {
    if (value === 0) {
        return '<input type="checkbox" class="toggle-status" data-toggle="toggle" data-style="radius" data-on="启用" ' +
            'data-off="禁用" data-size="mini" data-onstyle="primary" />';
    }

    if (value === 1) {
        return '<input type="checkbox" class="toggle-status" data-toggle="toggle" data-style="radius" data-on="启用" ' +
            'data-off="禁用" data-size="mini" data-onstyle="primary" checked />';
    }

    return null;
}

// 为配置项添加状态图片
function create_cfg_status(value, row, index) {
    if (value === 0) {
        return '<img src="/static/images/error.png" alt="禁用"/>'
    }

    if (value === 1) {
        return '<img src="/static/images/right.png" alt="开启"/>'
    }

    return null;
}

// 创建每一行对应的下拉菜单
function create_expand_name(value, row, index) {
    var html = '<span class="node-value">' +
        value +
        '</span>';

    var type = row['type'];
    if (type === "layer") {
        html = '<img src="/static/images/layer.png"/>' + html;
        html +=
            '<div class="btn-group" style="float: right;">' +
            '<button style="background-color: transparent" type="button" class="btn dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
            '<span class="glyphicon glyphicon-option-vertical"></span>' +
            '</button>' +
            '<ul class="dropdown-menu">' +
            '<li><a href="#" class="add-exp-item">增加实验</a></li>' +
            '</ul>' +
            '</div>';
    } else if (type === "exp") {
        html = '<img src="/static/images/exp.png"/>' + html;
        html +=
            '<div class="btn-group" style="float: right;">' +
            '<button style="background-color: transparent" type="button" class="btn dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
            '<span class="glyphicon glyphicon-option-vertical"></span>' +
            '</button>' +
            '<ul class="dropdown-menu">' +
            '<li><a href="#" class="modify-exp-item">修改实验</a></li>';

        var layer_id = row['layer_id'];
        var exp_id = row['exp_id'];
        if (is_exp_empty(layer_id, exp_id)) {
            html += '<li><a href="#" class="delete-exp-item">删除实验</a></li>';
        } else {
            html += '<li class="disabled"><a href="#" class="delete-exp-item">删除实验</a></li>';
        }

        html += '<li role="separator" class="divider"></li>' +
            '<li><a href="#" class="add-cfg-item">关联配置</a></li>' +
            '</ul>' +
            '</div>';
    } else if (type === "cfg") {
        html = '<img src="/static/images/config.png"/>' + html;
        html +=
            '<div class="btn-group" style="float: right;">' +
            '<button style="background-color: transparent" type="button" class="btn dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
            '<span class="glyphicon glyphicon-option-vertical"></span>' +
            '</button>' +
            '<ul class="dropdown-menu">' +
            '<li><a href="#" class="del-cfg-item">移除配置</a></li>' +
            '</ul>' +
            '</div>';
    }
    return html;
}

// 创建层节点
function get_layer_node(item) {
    return {
        "unique_pid": 0,
        'unique_id': toHex('layer_' + item.id),
        "type": "layer",
        'name': item.name,
        'create_time': item.create_time,
        'desc': item.desc,
        'self_id': item.id,
        'layer_id': item.id,
        'layer_name': item.name,
        'layer_business': item.business
    };
}

// 创建实验结点
function get_exp_node(item) {
    return {
        "unique_pid": toHex("layer_" + item.layer_id),
        "unique_id": toHex("exp_" + item.id),
        "type": "exp",
        "name": item.name,
        "create_time": item.create_time,
        'desc': item.desc,
        'self_id': item.id,
        'layer_id': item.layer_id,
        "exp_id": item.id,
        "exp_name": item.name,
        "exp_status": item.status,
        "exp_online_time": item.online_time
    }
}

// 创建配置结点
function get_cfg_node(item) {
    return {
        "unique_pid": toHex("exp_" + item.exp_id),
        "unique_id": toHex("cfg_" + item.id),
        "type": "cfg",
        "name": item.cfg_name,
        "create_time": item.create_time,
        "desc": item.desc,
        'self_id': item.cfg_id,
        "cfg_id": item.cfg_id,
        "cfg_name": item.cfg_name,
        "cfg_position": item.position,
        "cfg_start_value": item.start_value,
        "cfg_stop_value": item.stop_value,
        "cfg_algo_request": item.algo_request,
        "cfg_algo_response": item.algo_response,
        "cfg_status": item.status
    };
}

// 重构树视图
function draw_layer_node(layer_items, exp_items, cfg_items) {
    var columns = [
        {
            field: 'name',
            title: '名称',
            formatter: 'create_expand_name'
        },
        {
            align: 'center',
            field: 'self_id',
            title: 'id'
        },
        {
            align: 'center',
            field: 'exp_status',
            title: '实验状态',
            formatter: 'create_status_button'
        },
        {
            align: 'center',
            field: 'exp_online_time',
            title: '上线时间'
        },
        {
            align: 'center',
            field: 'cfg_status',
            title: '配置状态',
            formatter: create_cfg_status
        },
        {
            align: 'center',
            field: 'create_time',
            title: '创建时间'
        },
        {
            align: 'center',
            field: 'desc',
            title: '描述',
            class: 'no-display'
        }
    ];

    var $layer_tree = $("#layer_item");

    $layer_tree.bootstrapTable({
        striped: true,
        idField: "unique_id",
        parentIdField: "unique_pid",
        uniqueId: "unique_id",
        treeShowField: "name",
        columns: columns
    });

    $layer_tree.bootstrapTable('removeAll');

    for (var i = 0; i < layer_items.length; i++) {
        var item = layer_items[i];
        var node = get_layer_node(item);
        $layer_tree.bootstrapTable('insertRow', {
            index: 0,
            row: node
        });
    }
    for (i = 0; i < exp_items.length; i++) {
        item = exp_items[i];
        node = get_exp_node(item);
        $layer_tree.bootstrapTable('insertRow', {
            index: 0,
            row: node
        });
    }
    for (i = 0; i < cfg_items.length; i++) {
        item = cfg_items[i];
        node = get_cfg_node(item);
        $layer_tree.bootstrapTable('insertRow', {
            index: 0,
            row: node
        });
    }

    render_tree();
}

// 仅加载与某实验有关联的配置
function load_relation_cfg_node(layer_items, exp_items, func_on_success) {
    var layer_id = $("#layer_selector").val();
    var exp_id = $("#exp_selector").val();
    $.ajax({
            url: '/exp_relation',
            type: "get",
            data: {
                'type': 'GET_RELATION',
                'bns_id': $("#business_selector").val(),
                'layer_id': layer_id,
                'exp_id': exp_id,
                'cfg_name': '',
                'off_set': 0,
                'limit': -1
            },
            dataType: 'json',
            success: function (data) {
                if (data.success !== 'true') {
                    return;
                }

                // 加载实验节点
                window.save_data.all_relation = data.content;
                draw_layer_node(layer_items, exp_items, window.save_data.all_relation);
                if (func_on_success) {
                    func_on_success();
                }
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

// 修改实验项
$(document).on('click', '.modify-exp-item', function () {
    var tr = $(this).closest('tr');
    var layer_id = $(tr).treegrid('getParentNode').find('td:eq(1)').text().trim();
    var exp_name = $(tr).find('td:eq(0)').find('span.node-value').html();
    var exp_id = $(tr).find('td:eq(1)').text().trim();
    var exp_status = $(tr).find('td:eq(2)').find('input').prop('checked');
    var online_time = $(tr).find('td:eq(3)').text().trim();
    var exp_desc = $(tr).find('td:eq(6)').text().trim();

    BootstrapDialog.show({
        message: function (dialog) {
            // header
            var content = '';
            content +=
                '<form class="form-inline">' +
                '<div class="form-group form-group-margin">' +
                '<div style="margin-top: 10px;">' +
                '<label class="control-label" style="margin: 0 5px;">启用</label>' +
                '<div class="input-group">';

                if (!exp_status) {
                    content += '<input id="exp_status" type="checkbox" name="status"/>';
                } else {
                    content += '<input id="exp_status" type="checkbox" name="status" checked/>';
                }
                content += '</div>' +
                '</div>' +
                '</div>' +

                '<div class="form-group form-group-margin" style="float: right">' +
                '<label class="control-label" style="margin: 0 5px;">上线时间:</label>' +
                '<div id="online_time_div" class="input-group date">' +
                '<input id="online_time_value" class="form-control" size="16" value="" readonly>' +
                '<span class="input-group-addon"><span class="glyphicon glyphicon-th"></span></span>' +
                '</div>' +
                '</div>' +
                '</form>';

            content += '<div><hr /></div>';
            content += '<div class="form">';
            content += '<div class="form-group">' +
                '<input id="layer_id" class="hidden-self" value="' + layer_id + '" readonly>' +
                '</div>';
            content += '<div class="form-group">' +
                '<div><label>实验id：</label><label id="exp_id_tip" style="color: red"></label></div>' +
                '<input id="exp_id" class="form-control clear-tips" value="' + exp_id + '" readonly>' +
                '</div>';
            content += '<div class="form-group">' +
                '<div><label>实验名称：</label><label id="exp_name_tip" style="color: red"></label></div>' +
                '<input id="exp_name" class="form-control clear-tips" value="' + exp_name + '">' +
                '</div>';
            content += '<div class="form-group">' +
                '<div><label>描述信息：</label></div>' +
                '<input id="exp_desc" class="form-control clear-tips" value="' + exp_desc + '">' +
                '</div>';
            content += '<div id="tip_div" class="form-group no-display">' +
                '<div><label id="tip_msg" style="color: red"></label></div>' +
                '</div>';
            // footer
            content += '</div>';

            return content;
        },
        title: "修改实验项",
        closable: false,
        draggable: true,
        onshown: function () {
            $("#online_time_div").datetimepicker({
                language: 'zh-CN',
                format: "yyyy-mm-dd hh:ii",
                autoclose: true,
                todayBtn: true,
                pickerPosition: "bottom-left",
                todayHighlight: true
            });

            // set default time
            var tomorrow = new Date(online_time);
            $("#online_time_value").val(format_time_picker(tomorrow));
        },
        buttons: [{
            label: '确定',
            action: function (dialogItself) {
                // 获取用户添加数据
                var exp_status = 0;
                if ($("#exp_status").prop('checked')) {
                    exp_status = 1;
                }

                var online_time = $("#online_time_value").val() + ":00";
                var exp_id = $("#exp_id").val().trim();
                var exp_name = $("#exp_name").val().trim();
                var exp_desc = $("#exp_desc").val().trim();

                if (!check_invalid_tips()) {
                    return;
                }

                if (!check_inputs(layer_id, exp_id, exp_name, exp_status, online_time, exp_desc)) {
                    return;
                }

                // 发送请求
                $.ajax({
                        url: '/tree_exp',
                        type: "put",
                        data: {
                            type: "MODIFY_EXP",
                            bns_id: $("#business_selector").val(),
                            layer_id: layer_id,
                            exp_id: exp_id,
                            exp_name: exp_name,
                            exp_status: exp_status,
                            online_time: online_time,
                            exp_desc: exp_desc
                        },
                        dataType: 'json',
                        success: function (response) {
                            handle_modify_exp_response(response);
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
$(document).on('click', '.delete-exp-item', function () {
    var exp_id = $(this).closest('tr').find('td:eq(1)').text().trim();
    $.showConfirm("确定要删除吗?", delete_one_exp_item(exp_id));
});

// 删除实验项
function delete_one_exp_item(exp_id) {
    function work_func() {
        // 发送请求
        $.ajax({
                url: '/tree_exp',
                type: "delete",
                data: {
                    type: 'DEL_EXP',
                    bns_id: $("#business_selector").val(),
                    exp_id: exp_id
                },
                dataType: 'json',
                success: function (response) {
                    handle_delete_exp_response(response, exp_id);
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

// 实验切换状态
$(document).on('change', '.toggle-status', function () {
    var exp_id = $(this).closest('tr').find('td:eq(1)').text().trim();

    var exp_status = 0;
    if ($(this).prop('checked')) {
        exp_status = 1;
    }

    // 发送请求
    $.ajax({
            url: '/tree_exp',
            type: "put",
            data: {
                type: 'MODIFY_STATUS',
                bns_id: $("#business_selector").val(),
                exp_id: exp_id,
                exp_status: exp_status
            },
            dataType: 'json',
            success: function (response) {
                handle_modify_exp_response(response);
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
$(document).on('input', '.clear-tips', function () {
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

// 输入检测
function check_inputs(layer_id, exp_id, exp_name, exp_status, online_time, exp_desc) {
    if (layer_id === "") {
        show_tip_msg("层id不能为空");
        return false;
    }

    if (exp_id === "") {
        show_tip_msg("实验id不能为空");
        return false;
    }

    if (exp_name === "") {
        show_tip_msg("实验名称不能为空");
        return false;
    }

    if (exp_status === "") {
        show_tip_msg("状态不能为空");
        return false;
    }

    if (online_time === "") {
        show_tip_msg("上线时间不能为空");
        return false;
    }

    return true;
}

// 修改实验
function handle_modify_exp_response(response) {
    if (response.success !== true) {
        $.showErr("更新失败");
        reload_layer_node();
        return;
    }

    reload_layer_node();
}

// 删除实验
function handle_delete_exp_response(response, exp_id) {
    if (response.success !== true) {
        $.showErr("删除失败");
        reload_layer_node();
        return;
    }

    reload_layer_node();
}

// 重构树视图
function render_tree() {
    var $layer_tree = $("#layer_item");

    $('.toggle-status').bootstrapToggle();

    $layer_tree.treegrid({
        initialState: 'collapsed',
        treeColumn: 0,
        saveState: true,
        // expanderExpandedClass: 'glyphicon glyphicon-folder-open',
        // expanderCollapsedClass: 'glyphicon glyphicon-folder-close',
        expanderExpandedClass: 'glyphicon glyphicon-minus',
        expanderCollapsedClass: 'glyphicon glyphicon-plus',
        onChange: function () {
            $layer_tree.bootstrapTable('resetWidth');
        }
    });
}

// 触发层次下拉列表框
$(document).on('change', '#layer_selector', function () {
    clear_exp_selector();
    reload_layer_node(init_exp_selector);
});

// 初始化实验下拉列表框
function init_exp_selector() {
    var layer_id = $("#layer_selector").val();

    $("#exp_selector").html('');
    var option = '<option value="">选择实验</option>';
    $("#exp_selector").append(option);

    if (layer_id === '') {
        $("#exp_selector").selectpicker('refresh');
        return;
    }

    for (var i = 0; i < window.save_data.all_exp.length; i++) {
        var item = window.save_data.all_exp[i];
        if (item.layer_id !== layer_id) {
            continue;
        }

        option = '<option value="' + item.id + '">' + item.name + '</option>';
        $("#exp_selector").append(option);
    }
    $("#exp_selector").selectpicker('refresh');
}

// 触发实验下拉列表框
$(document).on('change', '#exp_selector', function () {
    reload_layer_node();
});

// 清除实验下拉列表框
function clear_exp_selector() {
    $("#exp_selector").html('');
    var option = '<option value="">选择实验</option>';
    $("#exp_selector").append(option);
    $("#exp_selector").selectpicker('refresh');
}

// 加载所有配置
function load_all_cfg() {
    var layer_id = $("#layer_selector").val();
    $.ajax({
            url: '/tree_cfg',
            type: "get",
            data: {
                'type': 'QUERY_CFG',
                'bns_id': $("#business_selector").val(),
                'layer_id': layer_id,
                'off_set': 0,
                'limit': -1
            },
            dataType: 'json',
            success: function (data) {
                if (data.success !== "true") {
                    return;
                }

                window.save_data.all_cfg = data.content;
            },
            error: function (jqXHR, textStatus, errorThrown) {
                if (jqXHR.status == 302) {
                    window.parent.location.replace("/");
                } else {
                    console.log('occur error');
                }
            }
        }
    );
}

// 为实验关联配置
$(document).on('click', '.add-cfg-item', function () {
    var $this_tr = $(this).closest('tr');
    var layer_id = $this_tr.treegrid('getParentNode').find('td:eq(1)').text().trim();
    var exp_id = $this_tr.find('td:eq(1)').text().trim();

    BootstrapDialog.show({
        message: function (dialog) {
            // header
            var content = '<div class="form">';

            content += '<div class="form-group">' +
                '<label style="margin: 0 5px;">选择配置</label>' +
                '<div>' +
                '<select id="cfg_selector" class="selectpicker form-control" data-size="10" data-live-search="true" multiple data-actions-box="true">' +
                '</select>' +
                '</div>' +
                '</div>';
            content += '<div id="tip_div" class="form-group no-display">' +
                '<div><label id="tip_msg" style="color: red"></label></div>' +
                '</div>';
            // footer
            content += '</div>';
            return content;
        },
        title: "关联配置",
        closable: false,
        draggable: true,
        onshown: function (dialog) {
            for (var i = 0; i < window.save_data.all_cfg.length; i++) {
                var cfg = window.save_data.all_cfg[i];
                if (cfg.layer_id !== layer_id) {
                    continue;
                }

                var option = '<option value="' + cfg.id + '">' + cfg.name + '</option>';
                if (has_relation(cfg.layer_id, cfg.id, exp_id)) {
                    option = '<option value="' + cfg.id + '" selected="selected">' + cfg.name + '</option>';
                }

                $("#cfg_selector").append(option);
            }
            $("#cfg_selector").selectpicker('refresh');
        },
        buttons: [{
            label: '确定',
            action: function (dialogItself) {
                var cfg_value = $("#cfg_selector").val();

                // 发送请求
                $.ajax({
                        url: '/exp_relation',
                        type: "put",
                        data: {
                            type: "PUT_RELATION",
                            bns_id: $("#business_selector").val(),
                            layer_id: layer_id,
                            exp_id: exp_id,
                            cfg_id: cfg_value
                        },
                        dataType: 'json',
                        success: function (response) {
                            handle_add_exp_relation_response(response);
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

// 菜单显示前 resize 页面
$(document).on('click', '.dropdown-toggle', function () {
    $("#layer_item").bootstrapTable('scrollTo', 'bottom');
});


// 为实验关联配置
function handle_add_exp_relation_response(response) {
    reload_layer_node();
}

// 加载所有实验
function load_exp_node(layer_items, func_on_success) {
    var layer_id = $("#layer_selector").val();
    var exp_id = $("#exp_selector").val();
    $.ajax({
            url: '/tree_exp',
            type: "get",
            data: {
                'type': 'QUERY_EXP',
                'bns_id': $("#business_selector").val(),
                'layer_id': layer_id,
                'exp_id': exp_id,
                'off_set': 0,
                'limit': -1
            },
            dataType: 'json',
            success: function (data) {
                if (data.success !== "true") {
                    return;
                }

                window.save_data.all_exp = data.content;
                load_relation_cfg_node(layer_items, window.save_data.all_exp, func_on_success);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                if (jqXHR.status == 302) {
                    window.parent.location.replace("/");
                } else {
                    console.log('occur error');
                }
            }
        }
    );
}

// 判断实验和配置间关系
function has_relation(layer_id, cfg_id, exp_id) {
    for (var i = 0; i < window.save_data.all_relation.length; i++) {
        var item = window.save_data.all_relation[i];

        if (item.layer_id !== layer_id) {
            continue;
        }

        if (item.cfg_id !== cfg_id) {
            continue;
        }

        if (item.exp_id !== exp_id) {
            continue;
        }

        return true;
    }

    return false;
}

// 移除配置
$(document).on('click', '.del-cfg-item', function () {
    var $cfg_tr = $(this).closest('tr');
    var $exp_tr = $cfg_tr.treegrid('getParentNode');
    var $layer_tr = $exp_tr.treegrid('getParentNode');
    var layer_id = $layer_tr.find('td:eq(1)').text().trim();
    var exp_id = $exp_tr.find('td:eq(1)').text().trim();
    var cfg_id = $cfg_tr.find('td:eq(1)').text().trim();

    $.ajax({
            url: '/exp_relation',
            type: "delete",
            data: {
                'type': 'DEL_RELATION',
                'bns_id': $("#business_selector").val(),
                'layer_id': layer_id,
                'exp_id': exp_id,
                'cfg_id': cfg_id
            },
            dataType: 'json',
            success: function (data) {
                if (data.success !== true) {
                    return;
                }

                reload_layer_node();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                if (jqXHR.status == 302) {
                    window.parent.location.replace("/");
                } else {
                    console.log('occur error');
                }
            }
        }
    );
});

// 添加实验
$(document).on('click', '.add-exp-item', function () {
    var $this_tr = $(this).closest('tr');
    var layer_id = $this_tr.find('td:eq(1)').text().trim();

    BootstrapDialog.show({
        message: function (dialog) {
            // header
            var content = '';
            content +=
                '<form class="form-inline">' +
                '<div class="form-group form-group-margin">' +
                '<div style="margin-top: 10px;">' +
                '<label class="control-label" style="margin: 0 5px;">启用</label>' +
                '<div class="input-group">' +
                '<input id="exp_status" type="checkbox" name="status"/>' +
                '</div>' +
                '</div>' +
                '</div>' +

                '<div class="form-group form-group-margin" style="float: right">' +
                '<label class="control-label" style="margin: 0 5px;">上线时间:</label>' +
                '<div id="online_time_div" class="input-group date">' +
                '<input id="online_time_value" class="form-control" size="16" value="" readonly>' +
                '<span class="input-group-addon"><span class="glyphicon glyphicon-th"></span></span>' +
                '</div>' +
                '</div>' +
                '</form>';

            content += '<div><hr /></div>';
            content += '<div class="form">';
            content += '<div class="form-group">' +
                '<input id="layer_id" class="hidden-self" value="' + layer_id + '" readonly>' +
                '</div>';
            content += '<div class="form-group">' +
                '<div><label>实验id：</label><label id="exp_id_tip" style="color: red"></label></div>' +
                '<input id="exp_id" class="form-control clear-tips">' +
                '</div>';
            content += '<div class="form-group">' +
                '<div><label>实验名称：</label><label id="exp_name_tip" style="color: red"></label></div>' +
                '<input id="exp_name" class="form-control clear-tips">' +
                '</div>';
            content += '<div class="form-group">' +
                '<div><label>描述信息：</label></div>' +
                '<input id="exp_desc" class="form-control clear-tips">' +
                '</div>';
            content += '<div id="tip_div" class="form-group no-display">' +
                '<div><label id="tip_msg" style="color: red"></label></div>' +
                '</div>';
            // footer
            content += '</div>';

            return content;
        },
        title: "增加实验项",
        closable: false,
        draggable: true,
        onshown: function () {
            $("#online_time_div").datetimepicker({
                language: 'zh-CN',
                format: "yyyy-mm-dd hh:ii",
                autoclose: true,
                todayBtn: true,
                pickerPosition: "bottom-left",
                todayHighlight: true
            });

            // set time limit
            // var now = new Date();
            // $("#online_time_div").datetimepicker('setStartDate', format_time_picker(now));

            // set default time
            var tomorrow = new Date();
            tomorrow.setHours(23);
            tomorrow.setMinutes(59);
            tomorrow.setSeconds(59);
            tomorrow.setMilliseconds(59);
            $("#online_time_value").val(format_time_picker(tomorrow));
        },
        buttons: [{
            label: '确定',
            action: function (dialogItself) {
                // 获取用户添加数据
                var exp_status = 0;
                if ($("#exp_status").prop('checked')) {
                    exp_status = 1;
                }

                var online_time = $("#online_time_value").val() + ":00";
                var exp_id = $("#exp_id").val().trim();
                var exp_name = $("#exp_name").val().trim();
                var exp_desc = $("#exp_desc").val().trim();

                if (!check_invalid_tips()) {
                    return;
                }

                if (!check_inputs(layer_id, exp_id, exp_name, exp_status, online_time, exp_desc)) {
                    return;
                }

                // 发送请求
                $.ajax({
                        url: '/tree_exp',
                        type: "post",
                        data: {
                            type: "ADD_EXP",
                            bns_id: $("#business_selector").val(),
                            layer_id: layer_id,
                            exp_id: exp_id,
                            exp_name: exp_name,
                            exp_status: exp_status,
                            online_time: online_time,
                            exp_desc: exp_desc
                        },
                        dataType: 'json',
                        success: function (response) {
                            handle_add_exp_response(response);
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

// 添加实验
function handle_add_exp_response(response) {
    if (response.success !== true) {
        $.showErr('添加失败');
        reload_layer_node();
        return;
    }

    reload_layer_node();
}

// 判断实验是否有关联配置
function is_exp_empty(layer_id, exp_id) {
    for (var i = 0; i < window.save_data.all_relation.length; i++) {
        var item = window.save_data.all_relation[i];

        if (item.layer_id === layer_id && item.exp_id === exp_id) {
            return false;
        }
    }

    return true;
}

$(document).on('input', '#exp_id', function () {
    $("#exp_id_tip").html('');

    var exp_id = $("#exp_id").val().trim();
    if (!exp_id) {
        return;
    }

    if (!check_alphanumeric_(exp_id)) {
        $("#exp_id_tip").html("只能包含字符(a-zA-Z)、数字(0-9)、下划线(_)");
        return;
    }

    $.ajax({
            url: '/tree_exp',
            type: "get",
            data: {
                'type': 'CHECK_ID_EXIST',
                'bns_id': $("#business_selector").val(),
                'exp_id': exp_id
            },
            dataType: 'json',
            success: function (data) {
                if (data.success !== true) {
                    return;
                }

                if (data.count > 0) {
                    $("#exp_id_tip").html(exp_id + '已存在!');
                }
            }
        }
    );
});

$(document).on('input', '#exp_name', function () {
    $("#exp_name_tip").html('');

    var exp_id = $("#exp_id").val().trim();
    var exp_name = $("#exp_name").val().trim();
    if (!exp_name) {
        return;
    }

    $.ajax({
            url: '/tree_exp',
            type: "get",
            data: {
                'type': 'CHECK_NAME_EXIST',
                'bns_id': $("#business_selector").val(),
                'exp_id': exp_id,
                'exp_name': exp_name
            },
            dataType: 'json',
            success: function (data) {
                if (data.success !== true) {
                    return;
                }

                if (data.count > 0) {
                    $("#exp_name_tip").html(exp_name + '已存在!');
                }
            }
        }
    );
});


function check_invalid_tips() {
    if ($("#exp_id_tip").html() !== '') {
        return false;
    }

    if ($("#exp_name_tip").html() !== '') {
        return false;
    }

    return true;
}