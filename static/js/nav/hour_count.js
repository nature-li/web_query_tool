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
    if (!window.save_data) {
        reset_save_data();
    }

    // 查询数据并更新页面
    query_and_update_view();
});

// 初始化全局变量
function reset_save_data() {
    window.save_data = {
        'item_list': [],
        'page_off_set': 0,
        'current_page_idx': 0,
        'count_per_page': 10,
        'max_page_count': 10,
        'more_data': false,
        'item_count': 0,
    };
}

// 更新表格和分页
function update_page_view(page_idx) {
    // 更新表格
    var html = "";
    var count = 0;
    for (var i = page_idx * window.save_data.count_per_page; i < window.save_data.item_list.length; i++) {
        var item = window.save_data.item_list[i];
        html += "<tr><td>" + item.dt + "</td><td>" + item.hour + "</td><td>" + item.ad_network_id + "</td><td>" + item.ad_action + "</td><td>" + item.count + "</td><td>" + item.update_time + "</td></tr>";
        count++;
        if (count >= window.save_data.count_per_page) {
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

// 查询并更新页面
function query_and_update_view() {
    // 获取日期
    var date = $("#select_date").datepicker('getDate');
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var dt = year + "-" + month + "-" + day;
    var off_set = window.save_data.count_per_page * window.save_data.page_off_set;
    var limit = window.save_data.count_per_page * window.save_data.max_page_count;

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
                'limit': limit + 1
            },
            dataType: 'json',
            success: function (data) {
                save_data_and_update_page_view(data);
            },
            error: function () {
                $.showErr("查询失败");
            }
        }
    );
}

$("#query_hour").click(function () {
    reset_save_data();
    query_and_update_view();
});