$(document).ready(function () {
    // 改变菜单背景色
    set_page_active("#li_tree_exp");

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
        'all_exp': [],
        'all_cfg': [],
        'all_relation': []
    };
}

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

                    var option = '<option value="' + item.id + '">' + item.name + '</option>';
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
            '<ul class="dropdown-menu dropdown-menu-right">' +
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
            '<ul class="dropdown-menu dropdown-menu-right">' +
            '<li><a href="#" class="modify-exp-item">修改实验</a></li>' +
            '<li><a href="#" class="delete-cxp-item">删除实验</a></li>' +
            '<li role="separator" class="divider"></li>' +
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
            '<ul class="dropdown-menu dropdown-menu-right">' +
            '<li><a href="#" class="del-cfg-item">移除配置</a></li>' +
            '</ul>' +
            '</div>';
    }
    return html;
}

function get_layer_node(item) {
    return {
        "unique_pid": 0,
        'unique_id': 'layer_' + item.id,
        "type": "layer",
        'name': item.name,
        'create_time': item.create_time,
        'desc': item.desc,
        'layer_id': item.id,
        'layer_name': item.name,
        'layer_business': item.business
    };
}

function get_exp_node(item) {
    return {
        "unique_pid": "layer_" + item.layer_id,
        "unique_id": "exp_" + item.id,
        "type": "exp",
        "name": item.name,
        "create_time": item.create_time,
        'desc': item.desc,
        "exp_id": item.id,
        "exp_name": item.name,
        "exp_status": item.status,
        "exp_online_time": item.online_time
    }
}

function get_cfg_node(item) {
    return {
        "unique_pid": "exp_" + item.exp_id,
        "unique_id": "cfg_" + item.id,
        "type": "cfg",
        "name": item.cfg_name,
        "create_time": item.create_time,
        "desc": item.desc,
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

function draw_layer_node(layer_items, exp_items, cfg_items) {
    var columns = [
        {
            field: 'name',
            title: '名称(0)',
            formatter: 'create_expand_name'
        },
        {
            align: 'center',
            field: 'layer_id',
            title: '层id(1)'
        },
        {
            align: 'center',
            field: 'layer_business',
            title: '层业务(2)'
        },
        {
            align: 'center',
            field: 'exp_id',
            title: '实验id(3)'
        },
        {
            align: 'center',
            field: 'exp_status',
            title: '实验状态(4)',
            formatter: 'create_status_button'
        },
        {
            align: 'center',
            field: 'exp_online_time',
            title: '上线时间(5)'
        },
        {
            align: 'center',
            field: 'cfg_id',
            title: '配置id(6)'
        },
        {
            align: 'center',
            field: 'cfg_name',
            title: '配置名称(7)'
        },
        {
            align: 'center',
            field: 'cfg_position',
            title: '位置(8)'
        },
        {
            align: 'center',
            field: 'cfg_start_value',
            title: '起始值(9)'
        },
        {
            align: 'center',
            field: 'cfg_stop_value',
            title: '结束值(10)'
        },
        {
            align: 'center',
            field: 'cfg_algo_request',
            title: 'algo请求串(11)'
        },
        {
            align: 'center',
            field: 'cfg_algo_response',
            title: 'algo应答串(12)'
        },
        {
            align: 'center',
            field: 'cfg_status',
            title: '配置状态(13)'
        },
        {
            align: 'center',
            field: 'create_time',
            title: '创建时间(14)'
        },
        {
            align: 'center',
            field: 'desc',
            title: '描述(15)'
        }
    ];

    var $layer_tree = $("#layer_item");

    $layer_tree.bootstrapTable({
        striped: true,
        idField: "unique_id",
        parentIdField: "unique_pid",
        uniqueId: "unique_id",
        treeShowField: "name",
        columns: columns,
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
    for (var i = 0; i < exp_items.length; i++) {
        var item = exp_items[i];
        var node = get_exp_node(item);
        $layer_tree.bootstrapTable('insertRow', {
            index: 0,
            row: node
        });
    }
    for (var i = 0; i < cfg_items.length; i++) {
        var item = cfg_items[i];
        var node = get_cfg_node(item);
        $layer_tree.bootstrapTable('insertRow', {
            index: 0,
            row: node
        });
    }

    render_tree();
}

// Reload page
function load_cfg_node(layer_items, exp_items, func_on_success) {
    var layer_id = $("#layer_selector").val();
    var exp_id = $("#exp_selector").val();
    $.ajax({
            url: '/exp_relation',
            type: "get",
            data: {
                'type': 'GET_RELATION',
                'layer_id': layer_id,
                'exp_id': exp_id,
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
                '<input id="item_id" class="form-control clear-tips">' +
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
                var item_id = $("#item_id").val().trim();
                var item_name = $("#item_name").val().trim();
                var position = $("#position").val().trim();
                var start_value = $("#start_value").val().trim();
                var stop_value = $("#stop_value").val().trim();
                var algo_request = $("#algo_request").val().trim();
                var algo_response = $("#algo_response").val().trim();
                var item_desc = $("#item_desc").val().trim();

                if (!check_inputs(item_id, layer_id, item_name, position, start_value, stop_value, algo_request, algo_response, item_desc)) {
                    return;
                }

                // 发送请求
                $.ajax({
                        url: '/tree_item',
                        type: "post",
                        data: {
                            type: "ADD_ITEM",
                            item_id: item_id,
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

// 修改实验项
$(document).on('click', '.modify-cfg-item', function () {
    var tr = $(this).closest('tr');
    var layer_id = $(tr).treegrid('getParentNode').find('td:eq(1)').text().trim();
    var item_name = $(tr).find('td:eq(0)').find('span.node-value').html();
    var item_id = $(tr).find('td:eq(3)').text().trim();
    var position = $(tr).find('td:eq(4)').text().trim();
    var start_value = $(tr).find('td:eq(5)').text().trim();
    var stop_value = $(tr).find('td:eq(6)').text().trim();
    var algo_request = $(tr).find('td:eq(7)').text().trim();
    var algo_response = $(tr).find('td:eq(8)').text().trim();
    var status = $(tr).find('td:eq(9)').find('input').prop('checked');
    var item_desc = $(tr).find('td:eq(12)').text().trim();

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
                '<input id="item_id" class="form-control clear-tips" value="' + item_id + '" readonly>' +
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

                if (!check_inputs(item_id, layer_id, item_name, position, start_value, stop_value, algo_request, algo_response, item_desc)) {
                    return;
                }

                // 发送请求
                $.ajax({
                        url: '/tree_item',
                        type: "put",
                        data: {
                            type: "MODIFY_ITEM",
                            item_id: item_id,
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

// 删除实验项
$(document).on('click', '.delete-cfg-item', function () {
    var item_id = $(this).closest('tr').find('td:eq(3)').text().trim();
    $.showConfirm("确定要删除吗?", delete_one_cfg_item(item_id));
});

// 删除实验项
function delete_one_cfg_item(item_id) {
    function work_func() {
        // 发送请求
        $.ajax({
                url: '/tree_item',
                type: "delete",
                data: {
                    type: 'DEL_ITEM',
                    item_id: item_id
                },
                dataType: 'json',
                success: function (response) {
                    handle_delete_cfg_item_response(response, item_id);
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
    var item_id = $(this).closest('tr').find('td:eq(3)').text().trim();

    var status = 0;
    if ($(this).prop('checked')) {
        status = 1;
    }

    // 发送请求
    $.ajax({
            url: '/tree_item',
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

function check_inputs(item_id, layer_id, item_name, position, start_value, stop_value, algo_request, algo_response, item_desc) {
    if (item_id === "") {
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

function handle_add_cfg_item_response(response) {
    if (response.success !== true) {
        $.showErr('添加失败');
        return;
    }

    var $layer_tree = $("#layer_item");
    for (var i = 0; i < response.content.length; i++) {
        var item = response.content[i];
        var cfg_node = get_cfg_node(item);

        $layer_tree.bootstrapTable('insertRow', {
            index: 0,
            row: cfg_node
        });

        render_tree();
    }
}

function handle_modify_cfg_item_response(response) {
    if (response.success !== true) {
        $.showErr("更新失败");
        reload_layer_node();
        return;
    }

    var $layer_tree = $("#layer_item");
    for (var i = 0; i < response.content.length; i++) {
        var item = response.content[i];
        $("#layer_item tbody").find("tr").each(function () {
            var item_id = $(this).find("td:eq(3)").text().trim();
            if (item_id !== item.id.toString()) {
                return;
            }

            var cfg_node = get_cfg_node(item);
            var row = $layer_tree.bootstrapTable('getRowByUniqueId', "cfg_" + item.id);
            var data = $layer_tree.bootstrapTable('getData');
            var row_idx = data.indexOf(row);

            $layer_tree.bootstrapTable('updateRow', {
                index: row_idx,
                row: cfg_node
            });

            render_tree();
        });
    }
}

function handle_delete_cfg_item_response(response, item_id) {
    if (response.success !== true) {
        $.showErr("删除失败");
        return;
    }

    var unique_id = 'cfg_' + item_id;
    var $layer_tree = $("#layer_item");
    $layer_tree.bootstrapTable('removeByUniqueId', unique_id);

    render_tree();
}

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

$(document).on('change', '#layer_selector', function () {
    clear_exp_selector();
    reload_layer_node(init_exp_selector);
});

function clear_exp_selector() {
    $("#exp_selector").html('');
    var option = '<option value="">选择实验</option>';
    $("#exp_selector").append(option);
    $("#exp_selector").selectpicker('refresh');
}

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

$(document).on('change', '#exp_selector', function () {
    reload_layer_node();
});

function load_all_cfg() {
    var layer_id = $("#layer_selector").val();
    $.ajax({
            url: '/tree_item',
            type: "get",
            data: {
                'type': 'QUERY_ITEM',
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

// 关联实验
$(document).on('click', '.add-exp-item', function () {
    var $this_tr = $(this).closest('tr');
    var layer_id = $this_tr.treegrid('getParentNode').find('td:eq(1)').text().trim();
    var item_id = $this_tr.find('td:eq(3)').text().trim();

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
                if (has_relation(item.layer_id, item_id, item.id)) {
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
                            item_id: item_id,
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

$(document).on('click', '.dropdown-toggle', function () {
    $("#layer_item").bootstrapTable('scrollTo', 'bottom');
});


function handle_add_exp_relation_response(response) {
    reload_layer_node();
}

function load_exp_node(layer_items, func_on_success) {
    var layer_id = $("#layer_selector").val();
    var exp_id = $("#exp_selector").val();
    $.ajax({
            url: '/experiment',
            type: "get",
            data: {
                'type': 'QUERY_EXP',
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
                load_cfg_node(layer_items, window.save_data.all_exp, func_on_success);
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


function has_relation(layer_id, cfg_id, exp_id) {
    for (var i = 0; i < window.save_data.all_relation.length; i++) {
        var item = window.save_data.all_relation[i];

        if (item.layer_id !== layer_id) {
            continue;
        }

        if (item.item_id !== cfg_id) {
            continue;
        }

        if (item.exp_id !== exp_id) {
            continue;
        }

        return true;
    }

    return false;
}

$(document).on('click', '.del-exp-item', function () {
    var $exp_tr = $(this).closest('tr');
    var $cfg_tr = $exp_tr.treegrid('getParentNode');
    var $layer_tr = $cfg_tr.treegrid('getParentNode');
    var layer_id = $layer_tr.find('td:eq(1)').text().trim();
    var cfg_id = $cfg_tr.find('td:eq(3)').text().trim();
    var exp_id = $exp_tr.find('td:eq(10)').text().trim();

    $.ajax({
            url: '/cfg_relation',
            type: "delete",
            data: {
                'type': 'DEL_RELATION',
                'layer_id': layer_id,
                'item_id': cfg_id,
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