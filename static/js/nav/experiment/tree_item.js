$(document).ready(function () {
    // 改变菜单背景色
    set_page_active("#li_tree_item");

    // 定义全局变量
    if (!window.save_data) {
        reset_save_data();
    }

    // 初始化下拉列表框
    init_layer_node();
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

function init_layer_node() {
    $.ajax({
            url: '/layer',
            type: "get",
            data: {
                'type': 'QUERY_LAYER',
                'layer_name': '',
                'off_set': 0,
                'limit': -1
            },
            dataType: 'json',
            success: function (data) {
                if (data.success !== "true") {
                    return;
                }

                init_item_node(data.content);
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

function create_operate_button(value, row, index) {
    if (value === "cfg") {
        return '<div class="text-center">' +
            '<button type="button" class="btn btn-primary btn-xs modify-cfg-item" style="margin-right: 5px;">' +
            '<span class="glyphicon glyphicon-wrench"></span>' +
            '</button>' +
            '<button type="button" class="btn btn-primary btn-xs delete-cfg-item">' +
            '<span class="glyphicon glyphicon-minus"></span>' +
            '</button>' +
            '</div>';
    }

    return null;
}

function get_layer_node(item) {
    return {
        "unique_pid": 0,
        'unique_id': 'layer_' + item.id,
        "type": "layer",
        // 'name': '&nbsp;&nbsp;<button type="button" class="btn btn-primary btn-xs add_cfg_item"><span class="glyphicon glyphicon-plus"></span></button>',
        'name': '&nbsp;&nbsp;<button type="button" class="btn btn-primary btn-xs add_cfg_item">实验层</button>',
        'create_time': item.create_time,
        'desc': item.desc,
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

function get_cfg_node(item) {
    return {
        "unique_pid": "layer_" + item.layer_id,
        "unique_id": "cfg_" + item.id,
        "type": "cfg",
        "name": '<span class="glyphicon glyphicon-leaf"></span>',
        "create_time": item.create_time,
        "desc": item.desc,
        // 'layer_id': '',
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

function draw_layer_node(layer_items, cfg_items) {
    var node_list = [];

    for (var i = 0; i < layer_items.length; i++) {
        var layer_node = get_layer_node(layer_items[i]);
        node_list.push(layer_node);
    }

    for (var i = 0; i < cfg_items.length; i++) {
        var cfg_node = get_cfg_node(cfg_items[i]);
        node_list.push(cfg_node);
    }

    var columns = [
        {
            align: 'center',
            field: 'name',
            title: '名称'
        },
        {
            align: 'center',
            field: 'layer_id',
            title: '层id'
        },
        {
            align: 'center',
            field: 'layer_name',
            title: '层名称',
        },
        {
            align: 'center',
            field: 'layer_business',
            title: '层业务'
        },
        {
            align: 'center',
            field: 'cfg_id',
            title: '配置id'
        },
        {
            align: 'center',
            field: 'cfg_name',
            title: '配置名称'
        },
        {
            align: 'center',
            field: 'cfg_layer_id',
            title: '配置所属层id'
        },
        {
            align: 'center',
            field: 'cfg_position',
            title: '配置位置'
        },
        {
            align: 'center',
            field: 'cfg_start_value',
            title: '配置起始值'
        },
        {
            align: 'center',
            field: 'cfg_stop_value',
            title: '配置结束值'
        },
        {
            align: 'center',
            field: 'cfg_algo_request',
            title: '配置请求串'
        },
        {
            align: 'center',
            field: 'cfg_algo_response',
            title: '配置应答串'
        },
        {
            align: 'center',
            field: 'cfg_status',
            title: '配置状态',
            formatter: 'create_status_button'
        },
        {
            align: 'center',
            field: 'type',
            title: '操作',
            formatter: 'create_operate_button'
        },
        {
            align: 'center',
            field: 'create_time',
            title: '创建时间'
        },
        {
            align: 'center',
            field: 'desc',
            title: '描述'
        }
    ];

    var $layer_tree = $("#layer_item");
    $layer_tree.bootstrapTable({
        striped: true,
        idField: "unique_id",
        parentIdField: "unique_pid",
        uniqueId: "unique_id",
        treeShowField: "name",
        data: node_list,
        columns: columns
    });

    $('.toggle-status').bootstrapToggle();

    $layer_tree.treegrid({
        initialState: 'collapsed',
        treeColumn: 0,
        saveState: true,
        expanderExpandedClass: 'glyphicon glyphicon-minus',
        expanderCollapsedClass: 'glyphicon glyphicon-plus',
        onChange: function () {
            $layer_tree.bootstrapTable('resetWidth');
        }
    });
}

// Reload page
function init_item_node(layer_items) {
    $.ajax({
            url: '/tree_item',
            type: "get",
            data: {
                'type': 'QUERY_ITEM',
                'layer_id': '',
                'item_name': '',
                'off_set': 0,
                'limit': -1
            },
            dataType: 'json',
            success: function (data) {
                if (data.success !== 'true') {
                    return;
                }

                draw_layer_node(layer_items, data.content)
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

// 增加实验项
$(document).on('click', ".add_cfg_item", function () {
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
    var item_id = $(tr).find('td:eq(4)').text().trim();
    var item_name = $(tr).find('td:eq(5)').text().trim();
    var layer_id = $(tr).find('td:eq(6)').text().trim();
    var position = $(tr).find('td:eq(7)').text().trim();
    var start_value = $(tr).find('td:eq(8)').text().trim();
    var stop_value = $(tr).find('td:eq(9)').text().trim();
    var algo_request = $(tr).find('td:eq(10)').text().trim();
    var algo_response = $(tr).find('td:eq(11)').text().trim();
    var status = $(tr).find('td:eq(12)').find('input').prop('checked');
    var item_desc = $(tr).find('td:eq(15)').text().trim();

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
    var item_id = $(this).closest('tr').find('td:eq(4)').text().trim();
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
    var item_id = $(this).closest('tr').find('td:eq(4)').text().trim();

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

        $('.toggle-status').bootstrapToggle();

        $layer_tree.treegrid({
            initialState: 'collapsed',
            treeColumn: 0,
            saveState: true,
            expanderExpandedClass: 'glyphicon glyphicon-minus',
            expanderCollapsedClass: 'glyphicon glyphicon-plus',
            onChange: function () {
                $layer_tree.bootstrapTable('resetWidth');
            }
        });
    }
}

function handle_modify_cfg_item_response(response) {
    if (response.success !== true) {
        $.showErr("更新失败");
        init_layer_node();
        return;
    }

    var $layer_tree = $("#layer_item");
    for (var i = 0; i < response.content.length; i++) {
        var item = response.content[i];
        $("#layer_item tbody").find("tr").each(function () {
            var item_id = $(this).find("td:eq(4)").text().trim();
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

            $('.toggle-status').bootstrapToggle();

            $layer_tree.treegrid({
                initialState: 'collapsed',
                treeColumn: 0,
                saveState: true,
                expanderExpandedClass: 'glyphicon glyphicon-minus',
                expanderCollapsedClass: 'glyphicon glyphicon-plus',
                onChange: function () {
                    $layer_tree.bootstrapTable('resetWidth');
                }
            });

            $layer_tree.treegrid('render');
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

    $layer_tree.treegrid({
        initialState: 'collapsed',
        treeColumn: 0,
        saveState: true,
        expanderExpandedClass: 'glyphicon glyphicon-minus',
        expanderCollapsedClass: 'glyphicon glyphicon-plus',
        onChange: function () {
            $layer_tree.bootstrapTable('resetWidth');
        }
    });
}

$(document).on('change', '#layer_selector', function () {
    var layer_id = $("#layer_selector").val();
    if (!layer_id) {
        return;
    }

    reload_page();
});