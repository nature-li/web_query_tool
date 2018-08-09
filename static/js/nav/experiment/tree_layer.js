var reload_page_count = 0;

$(document).ready(function () {
    // 改变菜单背景色
    set_page_active("#li_tree_layer");

    // 初始化业务下拉列表框
    reload_this_page();
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
        'all_bns': [],
        'all_layer': [],
        'all_cfg': [],
        'all_exp': [],
    };
}

// 重新加载页面
function reload_this_page() {
    // 加载次数加1
    reload_page_count += 1;

    // 获取当前选择项
    var current_bns_id = $("#business_selector").val();

    // 清空数据
    reset_save_data();

    $.ajax({
            url: '/business',
            type: "get",
            data: {
                'type': 'QUERY_BNS',
                'off_set': 0,
                'limit': -1
            },
            dataType: 'json',
            success: function (data) {
                if (data.success !== "true") {
                    return;
                }

                // 清空下拉菜单
                $("#business_selector").html('');

                // 添加空选项
                var option = '<option value="">选择业务</option>';
                $("#business_selector").append(option);

                var only_show_one;
                for (var i = 0; i < data.content.length; i++) {
                    var item = data.content[i];
                    option = '<option value="' + item.id + '">' + item.name + '</option>';

                    // 非首次加载且非空选项
                    if (reload_page_count > 1 && current_bns_id && current_bns_id === item.id) {
                        only_show_one = item;
                        option = '<option value="' + item.id + '" selected="selected">' + item.name + '</option>';
                    }
                    $("#business_selector").append(option);
                }
                $("#business_selector").selectpicker('refresh');

                // 控制展示内容
                if (only_show_one) {
                    window.save_data.all_bns.push(only_show_one);
                } else {
                    window.save_data.all_bns = data.content;
                }

                // 加载层次
                reload_layer_node();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                if (jqXHR.status == 302) {
                    window.parent.location.replace("/");
                } else {
                    console.log("loading error");
                }
            }
        }
    );
}

// 加载层次
function reload_layer_node() {
    $.ajax({
            url: '/tree_layer',
            type: "get",
            data: {
                'type': 'QUERY_LAYER',
                'bns_id': $("#business_selector").val(),
                'off_set': 0,
                'limit': -1
            },
            dataType: 'json',
            success: function (data) {
                if (data.success !== "true") {
                    return;
                }

                // 保存层次
                window.save_data.all_layer = data.content;

                // 加载配置
                load_cfg_node();
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

// 加载配置节点
function load_cfg_node() {
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
                if (data.success !== 'true') {
                    return;
                }

                // 保存配置节点
                window.save_data.all_cfg = data.content;

                // 加载实验节点
                load_exp_node();
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

// 创建每一行对应的下拉菜单
function create_expand_name(value, row, index) {
    var self_id = row['self_id'];
    var bns_id = row['bns_id'];
    var type = row['type'];

    var html = '<span class="node-value">' + value + '</span>';
    if (type === 'bns') {
        html = '<img src="/static/images/global.png"' + html;
        html +=
            '<div class="btn-group" style="float: right">' +
            '<button style="background-color: transparent" type="button" class="btn dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
            '<span class="glyphicon glyphicon-option-vertical"></span>' +
            '</button>' +
            '<ul class="dropdown-menu">' +
            '<li><a href="#" class="mod-bns-item">修改业务</a></li>';

        if (check_empty_bns(bns_id)) {
            html += '<li><a href="#" class="del-bns-item">删除业务</a></li>';
        } else {
            html += '<li class="disabled"><a href="#" class="del-bns-item">删除业务</a></li>';
        }

        html += '<li role="separator" class="divider"></li>' +
            '<li><a href="#" class="add-layer-item">增加层次</a></li>' +
            '</ul>' +
            '</div>'
    } else if (type === "layer") {
        html = '<img src="/static/images/layer.png"/>' + html;
        html +=
            '<div class="btn-group" style="float: right;">' +
            '<button style="background-color: transparent" type="button" class="btn dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
            '<span class="glyphicon glyphicon-option-vertical"></span>' +
            '</button>' +
            '<ul class="dropdown-menu">';

        html += '<li><a href="#" class="mod-layer-item">修改层次</a></li>';
        if (check_empty_layer(bns_id, self_id)) {
            html += '<li><a href="#" class="del-layer-item">删除层次</a></li>';
        } else {
            html += '<li class="disabled"><a href="#" class="del-layer-item">删除层次</a></li>';
        }

        html += '</ul>' +
            '</div>';
    } else if (type === "exp") {
        html = '<img src="/static/images/exp.png"/>' + html;
    } else if (type === "cfg") {
        html = '<img src="/static/images/config.png"/>' + html;
    }
    return html;
}

// 判断业务是否为空
function check_empty_bns(bns_id) {
    for (var i = 0; i < window.save_data.all_layer.length; i++) {
        var item = window.save_data.all_layer[i];
        if (item.bns_id === bns_id) {
            return false;
        }
    }

    return true;
}

// 判断是否为空层次
function check_empty_layer(bns_id, layer_id) {
    for (var i = 0; i < window.save_data.all_cfg.length; i++) {
        var item = window.save_data.all_cfg[i];
        if (item.bns_id === bns_id && item.layer_id === layer_id) {
            return false;
        }
    }

    for (i = 0; i < window.save_data.all_exp.length; i++) {
        item = window.save_data.all_exp[i];
        if (item.bns_id === bns_id && item.layer_id === layer_id) {
            return false;
        }
    }

    return true;
}

// 创建业务节点
function get_bns_node(item) {
    return {
        "unique_pid": 0,
        'unique_id': toHex('bns_' + item.id),
        "type": "bns",
        'name': item.name,
        'create_time': item.create_time,
        'bns_id': item.id,
        'desc': item.desc,
        'self_id': item.id,
        'bns_name': item.name,
    };
}

// 创建层节点
function get_layer_node(item) {
    return {
        // 多个业务之间层 id 可以重复
        "unique_pid": toHex('bns_' + item.bns_id),
        'unique_id': toHex('layer_' + item.bns_id + '@' + item.id),
        "type": "layer",
        'name': item.name,
        'create_time': item.create_time,
        'bns_id': item.bns_id,
        'desc': item.desc,
        'self_id': item.id,
        'layer_id': item.id,
        'layer_name': item.name
    };
}

// 创建配置节点
function get_cfg_node(item) {
    return {
        // 多个业务之间配置 id 可以重复
        "unique_pid": toHex('layer_' + item.bns_id + '@' + item.layer_id),
        'unique_id': toHex('layer_' + item.bns_id + '@' + item.id),
        "type": "cfg",
        'name': item.name,
        'create_time': item.create_time,
        'bns_id': item.bns_id,
        'desc': item.desc,
        'self_id': item.id,
        'cfg_id': item.id,
        'cfg_name': item.name
    };
}

// 创建实验节点
function get_exp_node(item) {
    return {
        // 多个业务之间实验 id 可以重复
        "unique_pid": toHex('layer_' + item.bns_id + '@' + item.layer_id),
        'unique_id': toHex('layer_' + item.bns_id + '@' + item.id),
        "type": "exp",
        'name': item.name,
        'create_time': item.create_time,
        'bns_id': item.bns_id,
        'desc': item.desc,
        'self_id': item.id,
        'exp_id': item.id,
        'exp_name': item.name
    };
}

// 重构树视图
function draw_layer_node() {
    var bns_items = window.save_data.all_bns;
    var layer_items = window.save_data.all_layer;
    var cfg_items = window.save_data.all_cfg;
    var exp_items = window.save_data.all_exp;

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
            field: 'bns_name',
            title: '业务名称'
        },
        {
            align: 'center',
            field: 'layer_name',
            title: '层名称'
        },
        {
            align: 'center',
            field: 'cfg_name',
            title: '配置名称'
        },
        {
            align: 'center',
            field: 'exp_name',
            title: '实验名称'
        },
        {
            align: 'center',
            field: 'create_time',
            title: '创建时间'
        },
        {
            align: 'center',
            field: 'bns_id',
            title: '业务id',
            class: 'no-display'
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

    for (var i = 0; i < bns_items.length; i++) {
        var item = bns_items[i];
        var node = get_bns_node(item);
        $layer_tree.bootstrapTable('insertRow', {
            index: 0,
            row: node
        });
    }

    for (var i = 0; i < layer_items.length; i++) {
        item = layer_items[i];
        node = get_layer_node(item);
        $layer_tree.bootstrapTable('insertRow', {
            index: 0,
            row: node
        });
    }

    for (var i = 0; i < cfg_items.length; i++) {
        item = cfg_items[i];
        node = get_cfg_node(item);
        $layer_tree.bootstrapTable('insertRow', {
            index: 0,
            row: node
        });
    }

    for (var i = 0; i < exp_items.length; i++) {
        item = exp_items[i];
        node = get_exp_node(item);
        $layer_tree.bootstrapTable('insertRow', {
            index: 0,
            row: node
        });
    }

    render_tree();
}

// 删除业务
function delete_one_bns_item(bns_id) {
    function work_func() {
        // 发送请求
        $.ajax({
                url: '/business',
                type: "delete",
                data: {
                    type: 'DEL_BNS',
                    bns_id: bns_id,
                },
                dataType: 'json',
                success: function (response) {
                    handle_delete_bns_response(response);
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

// 删除层次
function delete_one_layer_item(bns_id, layer_id) {
    function work_func() {
        // 发送请求
        $.ajax({
                url: '/tree_layer',
                type: "delete",
                data: {
                    type: 'DEL_LAYER',
                    bns_id: bns_id,
                    layer_id: layer_id
                },
                dataType: 'json',
                success: function (response) {
                    handle_delete_layer_response(response);
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

// 菜单显示前 resize 页面
$(document).on('click', '.dropdown-toggle', function () {
    $("#layer_item").bootstrapTable('scrollTo', 'bottom');
});

// 加载所有实验
function load_exp_node() {
    var layer_id = $("#layer_selector").val();
    $.ajax({
            url: '/tree_exp',
            type: "get",
            data: {
                'type': 'QUERY_EXP',
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

                // 保存实验节点
                window.save_data.all_exp = data.content;

                // 重构视图
                draw_layer_node();
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

// 业务下拉列表框更新
$(document).on('change', '#business_selector', function () {
    reload_this_page();
});


// 增加业务
$(document).on('click', '#add_bns', function () {
    BootstrapDialog.show({
        message: function (dialog) {
            // header
            var content = '';
            content += '<div class="form">';
            content += '<div class="form-group">' +
                '<div><label>业务id：</label><label id="bns_id_tip" style="color: red"></label></div>' +
                '<input id="bns_id" class="form-control clear-tips">' +
                '</div>';
            content += '<div class="form-group">' +
                '<div><label>业务名称：</label><label id="bns_name_tip" style="color: red"></label></div>' +
                '<input id="bns_name" class="form-control clear-tips">' +
                '</div>';
            content += '<div class="form-group">' +
                '<div><label>描述信息：</label></div>' +
                '<input id="bns_desc" class="form-control clear-tips">' +
                '</div>';
            content += '<div id="tip_div" class="form-group no-display">' +
                '<div><label id="tip_msg" style="color: red"></label></div>' +
                '</div>';
            // footer
            content += '</div>';

            return content;
        },
        title: "增加业务",
        closable: false,
        draggable: true,
        onshown: function () {
        },
        buttons: [{
            label: '确定',
            action: function (dialogItself) {
                // 获取用户添加数据
                var bns_id = $("#bns_id").val().trim();
                var bns_name = $("#bns_name").val().trim();
                var bns_desc = $("#bns_desc").val().trim();

                if (!check_bns_inputs(bns_id, bns_name, bns_desc)) {
                    return;
                }

                // 发送请求
                $.ajax({
                        url: '/business',
                        type: "post",
                        data: {
                            type: "ADD_BNS",
                            bns_id: bns_id,
                            bns_name: bns_name,
                            bns_desc: bns_desc
                        },
                        dataType: 'json',
                        success: function (response) {
                            handle_add_item_response(response);
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

// 删除业务
$(document).on('click', '.del-bns-item', function () {
    var $this_tr = $(this).closest('tr');
    var bns_id = $this_tr.find('td:eq(1)').text().trim();
    $.showConfirm("确定要删除吗?", delete_one_bns_item(bns_id));
});

// 修改业务
$(document).on('click', '.mod-bns-item', function () {
    var $this_tr = $(this).closest('tr');
    var bns_id = $this_tr.find('td:eq(1)').text().trim();
    var bns_name = $this_tr.find('td:eq(2)').text().trim();
    var bns_desc = $this_tr.find('td:eq(8)').text().trim();

    BootstrapDialog.show({
        message: function (dialog) {
            // header
            var content = '';
            content += '<div class="form">';
            content += '<div class="form-group">' +
                '<div><label>业务id：</label><label id="bns_id_tip" style="color: red"></label></div>' +
                '<input id="bns_id" class="form-control clear-tips" value="' + bns_id + '" readonly>' +
                '</div>';
            content += '<div class="form-group">' +
                '<div><label>业务名称：</label><label id="bns_name_tip" style="color: red"></label></div>' +
                '<input id="bns_name" class="form-control clear-tips" value="' + bns_name + '">' +
                '</div>';
            content += '<div class="form-group">' +
                '<div><label>描述信息：</label></div>' +
                '<input id="bns_desc" class="form-control clear-tips" value="' + bns_desc + '">' +
                '</div>';
            content += '<div id="tip_div" class="form-group no-display">' +
                '<div><label id="tip_msg" style="color: red"></label></div>' +
                '</div>';
            // footer
            content += '</div>';

            return content;
        },
        title: "修改业务",
        closable: false,
        draggable: true,
        onshown: function () {
        },
        buttons: [{
            label: '确定',
            action: function (dialogItself) {
                // 获取用户添加数据
                var bns_id = $("#bns_id").val().trim();
                var bns_name = $("#bns_name").val().trim();
                var bns_desc = $("#bns_desc").val().trim();

                if (!check_bns_inputs(bns_id, bns_name, bns_desc)) {
                    return;
                }

                // 发送请求
                $.ajax({
                        url: '/business',
                        type: "put",
                        data: {
                            type: "MOD_BNS",
                            bns_id: bns_id,
                            bns_name: bns_name,
                            bns_desc: bns_desc
                        },
                        dataType: 'json',
                        success: function (response) {
                            handle_mod_bns_response(response);
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

// 增加层次
$(document).on('click', '.add-layer-item', function () {
    var $this_tr = $(this).closest('tr');
    var bns_id = $this_tr.find('td:eq(1)').text().trim();

    BootstrapDialog.show({
        message: function (dialog) {
            // header
            var content = '';
            content += '<div class="form">';
            content += '<div class="form-group">' +
                '<div><label>业务id：</label><label id="bns_id_tip" style="color: red"></label></div>' +
                '<input id="bns_id" class="form-control clear-tips" value="' + bns_id + '" readonly>' +
                '</div>';
            content += '<div class="form-group">' +
                '<div><label>层次id：</label><label id="layer_id_tip" style="color: red"></label></div>' +
                '<input id="layer_id" class="form-control clear-tips">' +
                '</div>';
            content += '<div class="form-group">' +
                '<div><label>层次名称：</label><label id="layer_name_tip" style="color: red"></label></div>' +
                '<input id="layer_name" class="form-control clear-tips">' +
                '</div>';
            content += '<div class="form-group">' +
                '<div><label>描述信息：</label></div>' +
                '<input id="layer_desc" class="form-control clear-tips">' +
                '</div>';
            content += '<div id="tip_div" class="form-group no-display">' +
                '<div><label id="tip_msg" style="color: red"></label></div>' +
                '</div>';
            // footer
            content += '</div>';

            return content;
        },
        title: "增加层次",
        closable: false,
        draggable: true,
        onshown: function () {
        },
        buttons: [{
            label: '确定',
            action: function (dialogItself) {
                // 获取用户添加数据
                var layer_id = $("#layer_id").val().trim();
                var layer_name = $("#layer_name").val().trim();
                var layer_desc = $("#layer_desc").val().trim();

                if (!check_layer_inputs(bns_id, layer_id, layer_name, layer_desc)) {
                    return;
                }

                // 发送请求
                $.ajax({
                        url: '/tree_layer',
                        type: "post",
                        data: {
                            type: "ADD_LAYER",
                            bns_id: bns_id,
                            layer_id: layer_id,
                            layer_name: layer_name,
                            layer_desc: layer_desc
                        },
                        dataType: 'json',
                        success: function (response) {
                            handle_add_item_response(response);
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

// 删除层次
$(document).on('click', '.del-layer-item', function () {
    var $this_tr = $(this).closest('tr');
    var bns_id = $this_tr.treegrid('getParentNode').find('td:eq(1)').text().trim();
    var layer_id = $this_tr.find('td:eq(1)').text().trim();
    $.showConfirm("确定要删除吗?", delete_one_layer_item(bns_id, layer_id));
});

// 修改层次
$(document).on('click', '.mod-layer-item', function () {
    var $this_tr = $(this).closest('tr');
    var bns_id = $this_tr.treegrid('getParentNode').find('td:eq(1)').text().trim();
    var layer_id = $this_tr.find('td:eq(1)').text().trim();
    var layer_name = $this_tr.find('td:eq(3)').text().trim();
    var layer_desc = $this_tr.find('td:eq(8)').text().trim();

    BootstrapDialog.show({
        message: function (dialog) {
            // header
            var content = '';
            content += '<div class="form">';
            content += '<div class="form-group">' +
                '<div><label>业务id：</label><label id="bns_id_tip" style="color: red"></label></div>' +
                '<input id="bns_id" class="form-control clear-tips" value="' + bns_id + '" readonly>' +
                '</div>';
            content += '<div class="form-group">' +
                '<div><label>层次id：</label><label id="layer_id_tip" style="color: red"></label></div>' +
                '<input id="layer_id" class="form-control clear-tips" value="' + layer_id + '" readonly>' +
                '</div>';
            content += '<div class="form-group">' +
                '<div><label>层次名称：</label><label id="layer_name_tip" style="color: red"></label></div>' +
                '<input id="layer_name" class="form-control clear-tips" value="' + layer_name + '">' +
                '</div>';
            content += '<div class="form-group">' +
                '<div><label>描述信息：</label></div>' +
                '<input id="layer_desc" class="form-control clear-tips" value="' + layer_desc + '">' +
                '</div>';
            content += '<div id="tip_div" class="form-group no-display">' +
                '<div><label id="tip_msg" style="color: red"></label></div>' +
                '</div>';
            // footer
            content += '</div>';

            return content;
        },
        title: "修改层次",
        closable: false,
        draggable: true,
        onshown: function () {
        },
        buttons: [{
            label: '确定',
            action: function (dialogItself) {
                // 获取用户添加数据
                var layer_id = $("#layer_id").val().trim();
                var layer_name = $("#layer_name").val().trim();
                var layer_desc = $("#layer_desc").val().trim();

                if (!check_layer_inputs(bns_id, layer_id, layer_name, layer_desc)) {
                    return;
                }

                // 发送请求
                $.ajax({
                        url: '/tree_layer',
                        type: "put",
                        data: {
                            type: "MOD_LAYER",
                            bns_id: bns_id,
                            layer_id: layer_id,
                            layer_name: layer_name,
                            layer_desc: layer_desc
                        },
                        dataType: 'json',
                        success: function (response) {
                            handle_add_item_response(response);
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


// 检测输入业务参数是否正常
function check_bns_inputs(bns_id, bns_name, bns_desc) {
    if (bns_id === "") {
        show_tip_msg("业务id不能为空");
        return false;
    }

    if (bns_name === "") {
        show_tip_msg("业务名称不能为空");
        return false;
    }

    return true;
}

// 检测输入层次参数是否正常
function check_layer_inputs(bns_id, layer_id, layer_name, layer_desc) {
    if (bns_id === "") {
        show_tip_msg("业务id不能为空");
        return false;
    }

    if (layer_id === "") {
        show_tip_msg("层次id不能为空");
        return false;
    }

    if (layer_name === "") {
        show_tip_msg("层次名称不能为空");
        return false;
    }
    return true;
}

// 添加业务返回成功或失败
function handle_add_item_response(response) {
    if (response.success !== true) {
        $.showErr("添加失败");
    }

    reload_this_page();
}

// 删除层次
function handle_delete_layer_response(response) {
    if (response.success !== true) {
        $.showErr("删除失败");
    }

    reload_this_page();
}

// 删除业务
function handle_delete_bns_response(response) {
    if (response.success !== true) {
        $.showErr("删除失败");
    }

    reload_this_page();
}

// 修改业务
function handle_mod_bns_response(response) {
    if (response.success !== true) {
        $.showErr("修改失败");
    }

    reload_this_page();
}