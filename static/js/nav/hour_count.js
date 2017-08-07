$(document).ready(function () {
    // 默认日期
    $('#select_date').datepicker({
        language: 'zh-CN',
        autoclose: true,
        todayHighlight: true
    });
    $("#select_date").datepicker('setDate', new Date());

    // 初始化渠道下拉列表框
    init_ad_network_select();

    // 定义全局变量
    if (!window.hour_data) {
        window.hour_data = {
            'item_list': [],
            'page_off_set': 0,
            'count_per_page': 10,
            'max_page_count': 10,
            'current_page_idx': 0
        };
    }

    // 查询数据并更新页面
    query_and_update_view();
});

// 根据返回值更新页面
function save_data_and_update_page_view(data) {
    if (data.success == "true") {
        // 清空部分数据
        window.hour_data.item_list = [];

        // 保存所有数据
        var length = data.content.length;
        for (var i = 0; i < length; i++) {
            var item = data.content[i];
            window.hour_data.item_list.push(item);
        }
        console.log("save data item:" + window.hour_data.item_list.length);

        // 更新view
        update_page_view(0);
    }
}

// 更新表格和分页
function update_page_view(page_idx) {
    // 更新表格
    var html = "";
    var count = 0;
    for (var i = page_idx * window.hour_data.count_per_page; i < window.hour_data.item_list.length; i++) {
        var item = window.hour_data.item_list[i];
        html += "<tr><td>" + item.dt + "</td><td>" + item.hour + "</td><td>" + item.ad_network_id + "</td><td>" + item.ad_action + "</td><td>" + item.count + "</td><td>" + item.update_time + "</td></tr>";
        count++;
        if (count >= window.hour_data.count_per_page) {
            break;
        }
    }
    $("#hour_result").find("tr:gt(0)").remove();
    $("#hour_result").append(html);

    // 更新分页标签
    update_page_partition(page_idx);

    // 改变窗口大小
    var newHeight = $(document).contents().find('body').height();
    if (newHeight < 1000) {
        newHeight = 1000;
    }
    $("#left_frame_col", window.parent.document).height(newHeight);
    $("#right_frame_col", window.parent.document).height(newHeight);
}

// 更新分页标签
function update_page_partition(page_idx) {
    var total_count = window.hour_data.item_list.length;
    var max_page_count = window.hour_data.max_page_count;
    var count_per_page = window.hour_data.count_per_page;
    var page_off_set = window.hour_data.page_off_set;
    window.hour_data.current_page_idx = page_idx;

    // head是否可用
    var head_enable = false;
    if (page_off_set > 0) {
        head_enable = true;
    }

    // tail是否可用
    var tail_enable = false;
    if (total_count >= max_page_count * count_per_page) {
        tail_enable = true;
    }

    // 页面数
    var show_page_count = Math.ceil(total_count / count_per_page);

    // 添加元素
    var $partition = $("#page_partition_id");

    $partition.find("li").remove();

    // 添加头
    if (head_enable) {
        $partition.append('<li class="hive-page-head"><a>&laquo;</a></li>');
    }

    // 添加分页
    for (var i = 0; i < show_page_count; i++) {
        var page_number = page_off_set + i + 1;
        var page_class = "hive-page-partition";
        if (i == page_idx) {
            page_class = "disabled hive-page-partition";
        }
        $partition.append('<li class="' + page_class + '"><a>' + page_number + '</a></li>');
    }

    // 添加尾
    if (tail_enable) {
        $partition.append('<li class="hive-page-tail"><a>&raquo;</a></li>');
    }
}

// 点击分页head标签
$(document).on("click", ".hive-page-head", function () {
    window.hour_data.page_off_set -= window.hour_data.max_page_count;
    window.current_page_idx = 0;
    query_and_update_view();
});

// 点击分页tail标签
$(document).on("click", ".hive-page-tail", function () {
    window.hour_data.page_off_set += window.hour_data.max_page_count;
    window.current_page_idx = 0;
    query_and_update_view();
});

// 点击其它分页标签
$(document).on("click", ".hive-page-partition", function () {
    var page_number = $(this).find('a').text() - 1;
    var page_idx = page_number % window.hour_data.max_page_count;
    update_page_view(page_idx);
});

// 查询并更新页面
function query_and_update_view() {
    // 获取日期
    var date = $("#select_date").datepicker('getDate');
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var dt = year + "-" + month + "-" + day;
    var off_set = window.hour_data.page_off_set * window.hour_data.max_page_count;
    var limit = window.hour_data.count_per_page * window.hour_data.max_page_count;

    // 获取 ad_network_id
    var ad_network_id = $("#ad_network_id_selector option:selected").text();
    if (ad_network_id == 'all_ad_network_id') {
        ad_network_id = "all";
    }

    // 获取 ad_action
    var ad_action = $("#ad_action option:selected").text();
    if (ad_action == "all_action") {
        ad_action = "all";
    }

    // 获取开始时间
    var start_hour = $("#start_hour option:selected").text();

    // 获取结束时间
    var end_hour = $("#end_hour option:selected").text();

    // 加载数据
    $.ajax({
        url: '/query_hour_page',
        type: "post",
        data: {
            'dt': dt,
            'ad_network_id': ad_network_id,
            'ad_action': ad_action,
            'start_hour': start_hour,
            'end_hour': end_hour,
            'off_set': off_set,
            'limit': limit
        },
        dataType:'json',
        success: function(data) {
            save_data_and_update_page_view(data);
        },
        error: function(){
            $.showErr("查询失败");
        }}
    );
}

$("#query_hour").click(function () {
   query_and_update_view();
});