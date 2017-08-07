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
        window.hour_data = {};
    }

    // 更新页面
    update_hour_page();
});

function updage_hour_tabel(data) {
    if (data.success == "true") {
        var length = data.content.length;
        var html = "";
        for (var i = 0; i < length; i++) {
            var item = data.content[i];
            html += "<tr><td>" + item['dt'] + "</td><td>" + item['hour'] + "</td><td>" + item['ad_network_id'] + "</td><td>" + item['ad_action'] + "</td><td>" + item['count'] + "</td><td>" + item['update_time'] + "</td></tr>";
        }

        $("#hour_result").find("tr:gt(0)").remove();
        $("#hour_result").append(html);
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

function update_hour_page() {
    // 获取日期
    var date = $("#select_date").datepicker('getDate');
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var dt = year + "-" + month + "-" + day;
    console.log(dt);

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

    // 获取开始时间
    var start_hour = $("#start_hour option:selected").text();
    console.log(start_hour);

    // 获取结束时间
    var end_hour = $("#end_hour option:selected").text();
    console.log(end_hour);

    // 加载数据
    $.ajax({
        url: '/update_hour_page',
        type: "post",
        data: {
            'dt': dt,
            'ad_network_id': ad_network_id,
            'ad_action': ad_action,
            'start_hour': start_hour,
            'end_hour': end_hour
        },
        dataType:'json',
        success: function(data) {
            updage_hour_tabel(data);
        },
        error: function(){
            $.showErr("查询失败");
        }}
    );
}

$("#query_hour").click(function () {
   update_hour_page();
});