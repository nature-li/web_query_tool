$(document).ready(function () {
    // 改变菜单背景色
    set_page_active("#li_position");

    // 默认日期
    $('#select_date').datepicker({
        language: 'zh-CN',
        autoclose: true,
        todayHighlight: true
    });
    $("#select_date").datepicker('setDate', new Date());

    // 定义全局变量
    if (!window.save_data) {
        reset_save_data();
    }

    // 初始化渠道下拉列表框
    init_ad_network_select(query_and_update_view);
});

// 初始化全局变量
function reset_save_data() {
    window.save_data = {
        'item_list': [],
        'db_total_item_count': 0,
        'db_return_item_count': 0,
        'db_max_page_idx': 0,
        'view_max_page_count': 5,
        'view_item_count_per_page': 100,
        'view_start_page_idx': 0,
        'view_current_page_idx': 0,
        'view_current_page_count': 0
    };
}

// 更新表格和分页
function update_page_view(page_idx) {
    // 更新表格
    var html = "";
    for (var i = 0; i < window.save_data.item_list.length; i++) {
        var item = window.save_data.item_list[i];

        html += "<tr><td>" + item.dt + "</td>" +
            "<td>" + item.hour + "</td>" +
            "<td>" + item.ad_network_id + "</td>" +
            "<td>" + item.position_id + "</td>" +
            "<td>" + number_with_comma(item.req) + "</td>" +
            "<td>" + number_with_comma(item.res) + "</td>" +
            "<td>" + number_with_comma(item.win) + "</td>" +
            "<td>" + number_with_comma(item.impression) + "</td>" +
            "<td>" + number_with_comma(item.click) + "</td>" +
            "<td>" + item.res_by_req + "%</td>";

        if (item.imp_by_win !== '0.00') {
            html += "<td>" + item.imp_by_win + "%</td>";
        } else {
            html += "<td>" + item.imp_by_res + "%</td>";
        }

        html += "<td>" + item.ctr + "%</td>" +
            "<td>" + item.update_time + "</td></tr>";
    }
    $("#hour_result").find("tr:gt(0)").remove();
    $("#hour_result").append(html);

    // 更新分页标签
    update_page_partition(page_idx);

    // 画图
    refresh_trend_chart(window.save_data.item_list);

    // 改变窗口大小
    change_frame_size();
}

// 画图
function refresh_trend_chart(item_list) {
    if (item_list.length <= 1) {
        return;
    }

    var categories = [];
    var imp_list = [];
    var clk_list = [];
    var req_list = [];
    var res_list = [];
    var win_list = [];
    var fill_rate_list = [];
    var show_rate_list = [];
    var ctr_list = [];
    for (var i = item_list.length - 1; i > 0; i--) {
        var item = item_list[i];
        var req = parseInt(item.req);
        var res = parseInt(item.res);
        var win = parseInt(item.win);
        var imp = parseInt(item.impression);
        var clk = parseInt(item.click);

        categories.push(parseInt(item.hour));
        // 请求数
        req_list.push(req);
        // 返回数
        res_list.push(res);
        // 胜出数
        win_list.push(win);
        // 曝光数
        imp_list.push(imp);
        // 点击数
        clk_list.push(clk);
        // 填充率
        fill_rate_list.push(parseFloat(item.res_by_req));
        // 展示率
        if (item.imp_by_win !== '0.00') {
            show_rate_list.push(parseFloat(item.imp_by_win));
        } else {
            show_rate_list.push(parseFloat(item.imp_by_res));
        }

        // 点击率
        ctr_list.push(parseFloat(item.ctr));
    }

    var line_dict = [];
    line_dict['chart'] = {'type': 'line'};
    line_dict['title'] = {'text': '走势图'};
    line_dict['credits'] = {'text': '', 'href': ''};
    line_dict['yAxis'] = {'title': {'text': '计数'}};
    line_dict['xAxis'] = {'categories': categories};
    line_dict['series'] = [
        {'name': '请求数', 'data': req_list},
        {'name': '返回数', 'data': res_list},
        {'name': '胜出数', 'data': win_list},
        {'name': '曝光数', 'data': imp_list},
        {'name': '点击数', 'data': clk_list},
        {'name': '填充率(%)', 'data': fill_rate_list},
        {'name': '展示率(%)', 'data': show_rate_list},
        {'name': '点击率(%)', 'data': ctr_list}
    ];
    var line_chart = Highcharts.chart('trend_chart', line_dict);
}

// 查询并更新页面
function query_and_update_view() {
    // 获取日期
    var date = $("#select_date").datepicker('getDate');
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var dt = year + "-" + month + "-" + day;

    // 获取 ad_network_id
    var ad_network_id = $("#ad_network_id_selector option:selected").text();

    // 获取位置id
    var position_id = $("#position_id").val();

    // 发送请求获取数据
    $.ajax({
            url: '/query_position_page',
            type: "post",
            data: {
                'dt': dt,
                'ad_network_id': ad_network_id,
                'position_id': position_id,
            },
            dataType: 'json',
            success: function (data) {
                save_data_and_update_page_view(data);
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

$("#query_hour").click(function () {
    reset_save_data();
    query_and_update_view();
});