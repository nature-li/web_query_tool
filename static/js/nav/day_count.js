$(document).ready(function () {
    // 开始日期
    $('#start_date').datepicker({
        language: 'zh-CN',
        autoclose: true,
        todayHighlight: true
    });
    $("#start_date").datepicker('setDate', new Date());

    // 结束日期
    $('#end_date').datepicker({
        language: 'zh-CN',
        autoclose: true,
        todayHighlight: true
    });
    $("#end_date").datepicker('setDate', new Date());

    // 初始化渠道下拉列表框
    init_ad_network_select();

    // 更新页面
    update_day_page();
});

function updage_day_tabel(data) {
    if (data.success == "true") {
        var length = data.content.length;
        var html = "";
        for (var i = 0; i < length; i++) {
            var item = data.content[i];
            html += "<tr><td>" + item['dt'] + "</td><td>" + item['ad_network_id'] + "</td><td>" + item['ad_action'] + "</td><td>" + item['count'] + "</td><td>" + item['update_time'] + "</td></tr>";
        }

        $("#day_result").find("tr:gt(0)").remove();
        $("#day_result").append(html);
    }

    // 改变窗口大小
    var newHeight = $(document).contents().find('body').height();
    console.log(newHeight);
    if (newHeight < 1000) {
        newHeight = 1000;
    }
    console.log(newHeight);
    $("#left_frame_col", window.parent.document).height(newHeight);
    $("#right_frame_col", window.parent.document).height(newHeight);
}

function update_day_page() {
    // 获取 ad_network_id
    var ad_network_id = $("#ad_network_id_selector option:selected").text();
    if (ad_network_id == 'all_ad_network_id') {
        ad_network_id = "all";
    }
    console.log(ad_network_id);

    // 获取 ad_action
    var ad_action = $("#ad_action option:selected").text();
    if (ad_action == "all_action") {
        ad_action = "all";
    }
    console.log(ad_action);


    // 获取开始日期
    var start_date = $("#start_date").datepicker('getDate');
    var start_year = start_date.getFullYear();
    var start_month = start_date.getMonth() + 1;
    var start_day = start_date.getDate();
    var start_dt = start_year + "-" + start_month + "-" + start_day;
    console.log(start_dt);

    // 获取结束日期
    var end_date = $("#end_date").datepicker('getDate');
    var end_year = end_date.getFullYear();
    var end_month = end_date.getMonth() + 1;
    var end_day = end_date.getDate();
    var end_dt = end_year + "-" + end_month + "-" + end_day;
    console.log(end_dt);

    // 加载数据
    $.ajax({
        url: '/update_day_page',
        type: "post",
        data: {
            'ad_network_id': ad_network_id,
            'ad_action': ad_action,
            'start_dt': start_dt,
            'end_dt': end_dt
        },
        dataType:'json',
        success: function(data) {
            updage_day_tabel(data);
        },
        error: function(){
            $.showErr("查询失败");
        }}
    );
}

$("#query_day").click(function () {
    update_day_page();
});