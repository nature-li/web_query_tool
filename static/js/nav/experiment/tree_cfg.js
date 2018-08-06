$(document).ready(function () {
    // 改变菜单背景色
    set_page_active("#li_tree_cfg");

    // 定义全局变量
    if (!window.save_data) {
        reset_save_data();
    }

    // 初始化下拉列表框、层节点、配置节点、加载所有实验
    init_layer_selector();
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
        'all_cfg': [],
        'all_exp': [],
        'all_relation': []
    };
}

// 初始化层选择器
function init_layer_selector() {
    $.ajax({
            url: '/layer',
            type: "get",
            data: {
                'type': 'QUERY_LAYER',
                'layer_id': '',
                'off_set': 0,
                'limit': -1
            },
            dataType: 'json',
            success: function (data) {
                if (data.success !== "true") {
                    return;
                }

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

                reload_layer_node(init_cfg_selector);
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

// 更新树视图
function reload_layer_node(func_on_success) {
    reset_save_data();

    var layer_id = $("#layer_selector").val();
    $.ajax({
            url: '/layer',
            type: "get",
            data: {
                'type': 'QUERY_LAYER',
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
                load_cfg_node(window.save_data.all_layer, func_on_success);

                // 加载所有实验
                load_all_exp();
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

// 创建配置状态按钮
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

// 创建下拉菜单
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
            '<li><a href="#" class="add-cfg-item">增加配置</a></li>' +
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
            '<li><a href="#" class="modify-cfg-item">修改配置</a></li>';

        var layer_id = row['layer_id'];
        var cfg_id = row['cfg_id'];
        if (is_cfg_empty(layer_id, cfg_id)) {
            html += '<li><a href="#" class="delete-cfg-item">删除配置</a></li>';
        } else {
            html += '<li class="disabled"><a href="#" class="delete-cfg-item">删除配置</a></li>';
        }

        html += '<li role="separator" class="divider"></li>' +
            '<li><a href="#" class="add-exp-item">关联实验</a></li>' +
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
            '<li><a href="#" class="del-exp-item">移除实验</a></li>' +
            '</ul>' +
            '</div>';
    }
    return html;
}

// 层结点
function get_layer_node(item) {
    return {
        "unique_pid": 0,
        'unique_id': 'layer_' + item.id,
        "type": "layer",
        'name': item.name,
        'create_time': item.create_time,
        'desc': item.desc,
        'self_id': item.id,
        'layer_id': item.id,
        'layer_name': item.name,
        'layer_business': item.business,
        // "cfg_id": "",
        // "cfg_name": "",
        // "cfg_layer_id": "",
        // "cfg_position": "",
        // "cfg_start_value": "",
        // "cfg_stop_value": '',
        // "cfg_algo_request": '',
        // "cfg_algo_response": '',
        // "cfg_status": '',
        // "cfg_create_time": ''
    };
}

// 配置结点
function get_cfg_node(item) {
    return {
        "unique_pid": "layer_" + item.layer_id,
        "unique_id": "cfg_" + item.id,
        "type": "cfg",
        "name": item.name,
        "create_time": item.create_time,
        "desc": item.desc,
        'self_id': item.id,
        'layer_id': item.layer_id,
        // 'layer_name': '',
        // 'layer_business': '',
        "cfg_id": item.id,
        "cfg_name": item.name,
        "cfg_layer_id": item.layer_id,
        "cfg_position": item.position,
        "cfg_start_value": item.start_value,
        "cfg_stop_value": item.stop_value,
        "cfg_algo_request": item.algo_request,
        "cfg_algo_response": item.algo_response,
        "cfg_status": item.status
    };
}

// 实验结点
function get_exp_node(item) {
    return {
        "unique_pid": "cfg_" + item.cfg_id,
        "unique_id": "exp_" + item.exp_id,
        "type": "exp",
        "name": item.exp_name,
        "desc": item.desc,
        'self_id': item.exp_id,
        "create_time": item.create_time,
        "exp_id": item.exp_id,
        "exp_name": item.exp_name,
        "exp_cfg_id": item.cfg_id
    }
}

// 画树结点
function draw_layer_node(layer_items, cfg_items, exp_items) {
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
            field: 'cfg_position',
            title: '广告位'
        },
        {
            align: 'center',
            field: 'cfg_start_value',
            title: '起始值'
        },
        {
            align: 'center',
            field: 'cfg_stop_value',
            title: '结束值'
        },
        {
            align: 'center',
            field: 'cfg_algo_request',
            title: '请求串'
        },
        {
            align: 'center',
            field: 'cfg_algo_response',
            title: '应答串'
        },
        {
            align: 'center',
            field: 'cfg_status',
            title: '状态',
            formatter: 'create_status_button'
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
    for (i = 0; i < cfg_items.length; i++) {
        item = cfg_items[i];
        node = get_cfg_node(item);
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

    render_tree();
}

// 加载配置节点
function load_cfg_node(layer_items, func_on_success) {
    var layer_id = $("#layer_selector").val();
    var cfg_id = $("#cfg_selector").val();
    $.ajax({
            url: '/tree_cfg',
            type: "get",
            data: {
                'type': 'QUERY_CFG',
                'layer_id': layer_id,
                'cfg_id': cfg_id,
                'item_name': '',
                'off_set': 0,
                'limit': -1
            },
            dataType: 'json',
            success: function (data) {
                if (data.success !== 'true') {
                    return;
                }

                // 加载实验节点
                window.save_data.all_cfg = data.content;
                load_relation_exp_node(layer_items, window.save_data.all_cfg, func_on_success);
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

// 增加配置项
$(document).on('click', ".add-cfg-item", function () {
    var $this_tr = $(this).closest('tr');
    var layer_id = $this_tr.find('td:eq(1)').text().trim();

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
                '<input id="cfg_id" class="form-control clear-tips">' +
                '</div>';
            content += '<div class="form-group">' +
                '<div><label>配置名称：</label></div>' +
                '<input id="item_name" class="form-control clear-tips">' +
                '</div>';
            content += '<div class="form-group">' +
                '<div><label>位置：</label></div>' +
                '<input id="position" class="form-control clear-tips">' +
                '</div>';
            content += '<div class="form-group">' +
                '<div><label>起始值：</label></div>' +
                '<input id="start_value" type="number" class="form-control clear-tips">' +
                '</div>';
            content += '<div class="form-group">' +
                '<div><label>结束值：</label></div>' +
                '<input id="stop_value" type="number" class="form-control clear-tips">' +
                '</div>';
            content += '<div class="form-group">' +
                '<div><label>algo请求串：</label></div>' +
                '<input id="algo_request" class="form-control clear-tips">' +
                '</div>';
            content += '<div class="form-group">' +
                '<div><label>algo应答串：</label></div>' +
                '<input id="algo_response" class="form-control clear-tips">' +
                '</div>';
            content += '<div class="form-group">' +
                '<div><label>描述信息：</label></div>' +
                '<input id="item_desc" class="form-control clear-tips">' +
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
                var cfg_id = $("#cfg_id").val().trim();
                var item_name = $("#item_name").val().trim();
                var position = $("#position").val().trim();
                var start_value = $("#start_value").val().trim();
                var stop_value = $("#stop_value").val().trim();
                var algo_request = $("#algo_request").val().trim();
                var algo_response = $("#algo_response").val().trim();
                var item_desc = $("#item_desc").val().trim();

                if (!check_inputs(cfg_id, layer_id, item_name, position, start_value, stop_value, algo_request, algo_response, item_desc)) {
                    return;
                }

                // 发送请求
                $.ajax({
                        url: '/tree_cfg',
                        type: "post",
                        data: {
                            type: "ADD_CFG",
                            cfg_id: cfg_id,
                            layer_id: layer_id,
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

// 修改配置项
$(document).on('click', '.modify-cfg-item', function () {
    var tr = $(this).closest('tr');
    var layer_id = $(tr).treegrid('getParentNode').find('td:eq(1)').text().trim();
    var item_name = $(tr).find('td:eq(0)').find('span.node-value').html();
    var cfg_id = $(tr).find('td:eq(1)').text().trim();
    var position = $(tr).find('td:eq(2)').text().trim();
    var start_value = $(tr).find('td:eq(3)').text().trim();
    var stop_value = $(tr).find('td:eq(4)').text().trim();
    var algo_request = $(tr).find('td:eq(5)').text().trim();
    var algo_response = $(tr).find('td:eq(6)').text().trim();
    var status = $(tr).find('td:eq(7)').find('input').prop('checked');
    var item_desc = $(tr).find('td:eq(9)').text().trim();

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
                '<input id="cfg_id" class="form-control clear-tips" value="' + cfg_id + '" readonly>' +
                '</div>';
            content += '<div class="form-group">' +
                '<label>配置名称：</label>' +
                '<input id="item_name" class="form-control clear-tips" value="' + item_name + '">' +
                '</div>';
            content += '<div class="form-group">' +
                '<label>位置：</label>' +
                '<input id="position" class="form-control clear-tips" value="' + position + '">' +
                '</div>';
            content += '<div class="form-group">' +
                '<label>起始值：</label>' +
                '<input type="number" id="start_value" class="form-control clear-tips" value="' + start_value + '">' +
                '</div>';
            content += '<div class="form-group">' +
                '<label>结束值：</label>' +
                '<input type="number" id="stop_value" class="form-control clear-tips" value="' + stop_value + '">' +
                '</div>';
            content += '<div class="form-group">' +
                '<label>algo请求串：</label>' +
                '<input id="algo_request" class="form-control clear-tips" value="' + algo_request + '">' +
                '</div>';
            content += '<div class="form-group">' +
                '<label>algo应答串：</label>' +
                '<input id="algo_response" class="form-control clear-tips" value="' + algo_response + '">' +
                '</div>';
            content += '<div class="form-group">' +
                '<label>配置描述：</label>' +
                '<input id="item_desc" class="form-control clear-tips" value="' + item_desc + '">' +
                '</div>';
            content += '<div id="tip_div" class="form-group no-display">' +
                '<div><label id="tip_msg" style="color: red"></label></div>' +
                '</div>';

            // footer
            content += '</div>';

            return content;
        },
        title: "修改配置项（" + cfg_id + "）",
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
                var cfg_id = $("#cfg_id").val().trim();
                var item_name = $("#item_name").val().trim();
                var position = $("#position").val().trim();
                var start_value = $("#start_value").val().trim();
                var stop_value = $("#stop_value").val().trim();
                var algo_request = $("#algo_request").val().trim();
                var algo_response = $("#algo_response").val().trim();
                var item_desc = $("#item_desc").val().trim();

                if (!check_inputs(cfg_id, layer_id, item_name, position, start_value, stop_value, algo_request, algo_response, item_desc)) {
                    return;
                }

                // 发送请求
                $.ajax({
                        url: '/tree_cfg',
                        type: "put",
                        data: {
                            type: "MODIFY_CFG",
                            cfg_id: cfg_id,
                            layer_id: layer_id,
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

// 删除配置项
$(document).on('click', '.delete-cfg-item', function () {
    var cfg_id = $(this).closest('tr').find('td:eq(1)').text().trim();
    $.showConfirm("确定要删除吗?", delete_one_cfg_item(cfg_id));
});

// 删除配置项
function delete_one_cfg_item(cfg_id) {
    function work_func() {
        // 发送请求
        $.ajax({
                url: '/tree_cfg',
                type: "delete",
                data: {
                    type: 'DEL_CFG',
                    cfg_id: cfg_id
                },
                dataType: 'json',
                success: function (response) {
                    handle_delete_cfg_item_response(response, cfg_id);
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

// 配置状态切换
$(document).on('change', '.toggle-status', function () {
    var cfg_id = $(this).closest('tr').find('td:eq(1)').text().trim();

    var status = 0;
    if ($(this).prop('checked')) {
        status = 1;
    }

    // 发送请求
    $.ajax({
            url: '/tree_cfg',
            type: "put",
            data: {
                type: 'MODIFY_STATUS',
                cfg_id: cfg_id,
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

// 添加、修改配置时的输入检测
function check_inputs(cfg_id, layer_id, item_name, position, start_value, stop_value, algo_request, algo_response, item_desc) {
    if (cfg_id === "") {
        show_tip_msg("配置id不能为空");
        return false;
    }

    if (layer_id === "") {
        show_tip_msg("层id不能为空");
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

// 重构树视图
function handle_add_cfg_item_response(response) {
    if (response.success !== true) {
        $.showErr('添加失败');
        return;
    }

    reload_layer_node();
}

// 重构树视图
function handle_modify_cfg_item_response(response) {
    if (response.success !== true) {
        $.showErr("更新失败");
        return;
    }

    reload_layer_node();
}

// 重构树视图
function handle_delete_cfg_item_response(response, cfg_id) {
    if (response.success !== true) {
        $.showErr("删除失败");
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

// 层次下拉列表框更改
$(document).on('change', '#layer_selector', function () {
    clear_cfg_selector();
    reload_layer_node(init_cfg_selector);
});

// 清除配置下拉列表框
function clear_cfg_selector() {
    $("#cfg_selector").html('');
    var option = '<option value="">选择配置</option>';
    $("#cfg_selector").append(option);
    $("#cfg_selector").selectpicker('refresh');
}

// 初始化配置下拉列表框
function init_cfg_selector() {
    var layer_id = $("#layer_selector").val();

    $("#cfg_selector").html('');
    var option = '<option value="">选择配置</option>';
    $("#cfg_selector").append(option);

    if (layer_id === '') {
        $("#cfg_selector").selectpicker('refresh');
        return;
    }

    for (var i = 0; i < window.save_data.all_cfg.length; i++) {
        var item = window.save_data.all_cfg[i];
        if (item.layer_id !== layer_id) {
            continue;
        }

        option = '<option value="' + item.id + '">' + item.name + '</option>';
        $("#cfg_selector").append(option);
    }
    $("#cfg_selector").selectpicker('refresh');
}

// 配置下拉列表框更改
$(document).on('change', '#cfg_selector', function () {
    reload_layer_node();
});

// 加载某层次或全部层次下所有实验
function load_all_exp() {
    var layer_id = $("#layer_selector").val();
    $.ajax({
            url: '/tree_exp',
            type: "get",
            data: {
                'type': 'QUERY_EXP',
                'layer_id': layer_id,
                'off_set': 0,
                'limit': -1
            },
            dataType: 'json',
            success: function (data) {
                if (data.success !== "true") {
                    return;
                }

                window.save_data.all_exp = data.content;
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

// 为配置项关联实验
$(document).on('click', '.add-exp-item', function () {
    var $this_tr = $(this).closest('tr');
    var layer_id = $this_tr.treegrid('getParentNode').find('td:eq(1)').text().trim();
    var cfg_id = $this_tr.find('td:eq(1)').text().trim();

    BootstrapDialog.show({
        message: function (dialog) {
            // header
            var content = '<div class="form">';

            content += '<div class="form-group">' +
                '<label style="margin: 0 5px;">选择实验</label>' +
                '<div>' +
                '<select id="exp_selector" class="selectpicker form-control" data-size="10" data-live-search="true" multiple>' +
                '</select>' +
                '</div>' +
                '</div>';
            content += '<div id="tip_div" class="form-group no-display">' +
                '<div><label id="tip_msg" style="color: red">abc</label></div>' +
                '</div>';
            // footer
            content += '</div>';
            return content;
        },
        title: "关联实验",
        closable: false,
        draggable: true,
        onshown: function (dialog) {
            for (var i = 0; i < window.save_data.all_exp.length; i++) {
                var item = window.save_data.all_exp[i];
                if (item.layer_id !== layer_id) {
                    continue;
                }

                var option = '<option value="' + item.id + '">' + item.name + '</option>';
                if (has_relation(item.layer_id, cfg_id, item.id)) {
                    option = '<option value="' + item.id + '" selected="selected">' + item.name + '</option>';
                }

                $("#exp_selector").append(option);
            }
            $("#exp_selector").selectpicker('refresh');
            console.log($("#exp_selector").hasClass('selectpicker'));
        },
        buttons: [{
            label: '确定',
            action: function (dialogItself) {
                var exp_value = $("#exp_selector").val();
                console.log(exp_value);

                // 发送请求
                $.ajax({
                        url: '/cfg_relation',
                        type: "put",
                        data: {
                            type: "PUT_RELATION",
                            cfg_id: cfg_id,
                            layer_id: layer_id,
                            exp_id: exp_value,
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


// 为配置项添加关联实验
function handle_add_exp_relation_response(response) {
    reload_layer_node();
}

// 仅加载与配置项有关联的实验
function load_relation_exp_node(layer_items, cfg_items, func_on_success) {
    var layer_id = $("#layer_selector").val();
    var cfg_id = $("#cfg_selector").val();
    $.ajax({
            url: '/cfg_relation',
            type: "get",
            data: {
                'type': 'GET_RELATION',
                'layer_id': layer_id,
                'cfg_id': cfg_id,
                'off_set': 0,
                'limit': -1
            },
            dataType: 'json',
            success: function (data) {
                if (data.success !== "true") {
                    return;
                }

                window.save_data.all_relation = data.content;
                draw_layer_node(layer_items, cfg_items, window.save_data.all_relation);

                if (func_on_success) {
                    func_on_success();
                }
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

// 判断某配置项和实验项是否有关联
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

// 点击移除实验项
$(document).on('click', '.del-exp-item', function () {
    var $exp_tr = $(this).closest('tr');
    var $cfg_tr = $exp_tr.treegrid('getParentNode');
    var $layer_tr = $cfg_tr.treegrid('getParentNode');
    var layer_id = $layer_tr.find('td:eq(1)').text().trim();
    var cfg_id = $cfg_tr.find('td:eq(1)').text().trim();
    var exp_id = $exp_tr.find('td:eq(1)').text().trim();

    $.ajax({
            url: '/cfg_relation',
            type: "delete",
            data: {
                'type': 'DEL_RELATION',
                'layer_id': layer_id,
                'cfg_id': cfg_id,
                'exp_id': exp_id,
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

// 判断配置是否有关联配置
function is_cfg_empty(layer_id, cfg_id) {
    for (var i = 0; i < window.save_data.all_relation.length; i++) {
        var item = window.save_data.all_relation[i];

        if (item.layer_id === layer_id && item.cfg_id === cfg_id) {
            return false;
        }
    }

    return true;
}