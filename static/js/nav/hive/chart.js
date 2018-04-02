$(document).ready(function () {
    // 改变菜单背景色
    $("#li_day_count", window.parent.document).removeClass("selected_menu");
    $("#li_hour_count", window.parent.document).removeClass("selected_menu");
    $("#li_position", window.parent.document).removeClass("selected_menu");
    $("#li_network_control", window.parent.document).removeClass("selected_menu");
    $("#li_chart", window.parent.document).addClass("selected_menu");

    // 开始日期
    $('#begin_date').datepicker({
        language: 'zh-CN',
        autoclose: true,
        todayHighlight: true
    });
    // $("#begin_date").datepicker('setDate', new Date() - 7 * 24 * 60 * 60 * 1000);
    var when = new Date(new Date() - 7 * 24 * 60 * 60 * 1000);
    $("#begin_date").datepicker('setDate', when);

    // 结束日期
    $('#end_date').datepicker({
        language: 'zh-CN',
        autoclose: true,
        todayHighlight: true
    });
    $("#end_date").datepicker('setDate', new Date());

    // 初始化图片类型
    init_chart_type_list();

    // 定义全局变量
    if (!window.save_data) {
        reset_save_data();
    }

    // 初始化渠道下拉列表框
    init_two_ad_network_select();
});

// 初始化渠道下拉列表框
function init_two_ad_network_select() {
    $.ajax({
            url: '/query_network_list',
            data: {
                'network_name': '',
                'off_set': 0,
                'limit': -1
            },
            // async: false,
            type: "post",
            dataType: 'json',
            success: function (response) {
                var success = response.success;
                var network_list = response.content;

                if (success != "true") {
                    return;
                }

                for (var i = 0; i < network_list.length; i++) {
                    var network = network_list[i];
                    var network_name = network.network_name;
                    var option = '<option>' + network_name + '</option>';
                    $("#ad_network_id_selector_1").append(option);
                }
                $("#ad_network_id_selector_1").selectpicker('refresh');

                for (var i = 0; i < network_list.length; i++) {
                    var network = network_list[i];
                    var network_name = network.network_name;
                    var option = '<option>' + network_name + '</option>';
                    $("#ad_network_id_selector_2").append(option);
                }
                $("#ad_network_id_selector_2").selectpicker('refresh');

                // 查询数据并更新页面
                query_and_update_view();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                if (jqXHR.status == 302) {
                    window.parent.location.replace("/");
                } else {
                    $.showErr("发生错误");
                }
            }
        }
    );
}

// 初始化图片类型
function init_chart_type_list() {
    $("#chart_type_id_selector").append('<option>走势图</option>');
    $("#chart_type_id_selector").append('<option>对比图</option>');
}

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
            "<td>" + item.pv + "</td>" +
            "<td>" + item.impression + "</td>" +
            "<td>" + item.click + "</td>" +
            "<td>" + item.ctr + "</td>" +
            "<td>" + item.update_time + "</td></tr>";
    }
    $("#hour_result").find("tr:gt(0)").remove();
    $("#hour_result").append(html);

    // 更新分页标签
    update_page_partition(page_idx);

    // 改变窗口大小
    change_frame_size();
}

// 查询并更新页面
function query_and_update_view() {
    // 获取开始日期
    var begin_date = $("#begin_date").datepicker('getDate');
    var begin_year = begin_date.getFullYear();
    var begin_month = begin_date.getMonth() + 1;
    var begin_day = begin_date.getDate();
    var begin_dt = begin_year + "-" + begin_month + "-" + begin_day;

    // 获取结束日期
    var end_date = $("#end_date").datepicker('getDate');
    var end_year = end_date.getFullYear();
    var end_month = end_date.getMonth() + 1;
    var end_day = end_date.getDate();
    var end_dt = end_year + "-" + end_month + "-" + end_day;

    // 获取 ad_network_id_1
    var ad_network_id_1 = $("#ad_network_id_selector_1 option:selected").text();

    // 获取 ad_network_id_2
    var ad_network_id_2 = $("#ad_network_id_selector_2 option:selected").text();

    // 获取位置id
    var position_id = $("#position_id").val();

    // 获取图片类型
    var chart_type = $("#chart_type_id_selector option:selected").text();

    // 发送请求获取数据
    $.ajax({
            url: '/query_chart_data',
            type: "post",
            data: {
                'start_dt': begin_dt,
                'end_dt': end_dt,
                'ad_network_id_1': ad_network_id_1,
                'ad_network_id_2': ad_network_id_2,
                'position_id': position_id,
                'chart_type': chart_type
            },
            dataType: 'json',
            success: function (total_data) {
                update_high_charts(total_data);
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

// 更新 high charts
function update_high_charts(total_data) {
    // 更新线状图
    var line_dict = total_data['line'];
    var line_chart = Highcharts.chart('container', line_dict);

    // 更新柱状图
    var column_data = total_data['column'];
    name = column_data['start_ctr']['name'];
    var a_dict = column_data['start_ctr']['list'];
    update_column_charts("start_ctr_column", name, a_dict);

    name = column_data['end_ctr']['name'];
    a_dict = column_data['end_ctr']['list'];
    update_column_charts("end_ctr_column", name, a_dict);

    // 更新饼状图
    var pie_data = total_data['pie'];
    var name = pie_data['start_imp']['name'];
    var list_data = pie_data['start_imp']['list'];
    update_pie_charts("start_imp_pie", name, list_data);

    name = pie_data['start_clk']['name'];
    list_data = pie_data['start_clk']['list'];
    update_pie_charts("start_clk_pie", name, list_data);

    name = pie_data['end_imp']['name'];
    list_data = pie_data['end_imp']['list'];
    update_pie_charts("end_imp_pie", name, list_data);

    name = pie_data['end_clk']['name'];
    list_data = pie_data['end_clk']['list'];
    update_pie_charts("end_clk_pie", name, list_data);

    // 改变窗口大小
    change_frame_size();
}

// 更新柱状图
function update_column_charts(div_id, title, a_dict) {
    var this_id = "#" + div_id;
    var name_list = a_dict['name'];
    var ctr_list = a_dict['ctr'];

    $(this_id).highcharts({
        chart: {
            type: 'column'
        },
        title: {
            text: title
        },
        xAxis: {
            categories: name_list,
            crosshair: true
        },
        yAxis: {
            min: 0,
            title: {
                text: '点击率 (%)'
            }
        },
        tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
            '<td style="padding:0"><b>{point.y:.1f}%</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        plotOptions: {
            column: {
                borderWidth: 0
            }
        },
        series: [{
            name: '点击率',
            data: ctr_list
        }],
        credits: {
            text: '',
            href: ''
        }
    });

}

// 更新饼状图
function update_pie_charts(div_id, title, list_data) {
    var this_id = "#" + div_id;
    $(this_id).highcharts({
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false
        },
        title: {
            text: title
        },
        tooltip: {
            headerFormat: '{series.name}<br>',
            pointFormat: '{point.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    }
                }
            }
        },
        series: [{
            type: 'pie',
            name: title,
            data: list_data
        }],
        credits: {
            text: '',
            href: ''
        }
    });
}

$("#query_hour").click(function () {
    // reset_save_data();
    // 查询数据并更新页面
    query_and_update_view();
});