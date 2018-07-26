$(document).ready(function () {
    init_main_page();
});

// 日统计作为主页
function init_main_page() {
    // 清空侧边栏
    $("#main-nav").html("");

    var login_user_right = $("#login_user_right").val();

    // 添加侧边栏
    var html = `
    <li><a href="#systemViewer" class="nav-header collapse" data-toggle="collapse"><i
            class="glyphicon glyphicon-th-list"></i>hive统计<span class="pull-right glyphicon glyphicon-chevron-down"></span></a>
        <ul id="systemViewer" class="nav nav-list collapse secondmenu" aria-expanded="true">
            <li id="li_day_count"><a id="a_day_count" href="#">日统计<i id="i_day_count" class="glyphicon glyphicon-eye-open"></i></a></li>
            <li id="li_hour_count"><a id="a_hour_count" href="#">时统计<i id="i_hour_count" class="glyphicon glyphicon-eye-open"></i></a></li>
            <li id="li_position"><a id="a_position" href="#">自查询<i id="i_position" class="glyphicon glyphicon-eye-open"></i></a></li>
            <li id="li_chart"><a id="a_chart" href="#">可视化<i id="i_chart" class="glyphicon glyphicon-eye-open"></i></a></li>`;

    if (login_user_right & 0B1000) {
        html += `<li id="li_experiment"><a id="a_experiment" href="#">实验平台<i id="i_experiment" class="glyphicon glyphicon-eye-open"></i></a></li>`;
    }

    html += `</ul></li>`;

    if (login_user_right & 0B01) {
        html +=
            `<li><a href="#systemControl" class="nav-header collapse" data-toggle="collapse"><i
            class="glyphicon glyphicon-th-list"></i>开发者<span
            class="pull-right glyphicon glyphicon-chevron-down"></span></a>
        <ul id="systemControl" class="nav nav-list collapse secondmenu" aria-expanded="true">
            <li id="li_network_control"><a id="a_network_control" href="#">渠道管理<i id="i_network_control" class="glyphicon glyphicon-pencil"></i></a>
            </li>
        </ul>
    </li>`;
    }

    $("#main-nav").append(html);

    // 数据统计和日统计状态变 active
    $("#menu_data_statistic").addClass("active");
    $("#menu_system_control").removeClass("active");

    // 加载数据
    $("#right_frame").attr("src", "day_count");

    // 自适应框架大小
    frame_auto_size();
}

// nav_hive_ref_a 点击事件
$("#nav_hive_ref_a").click(function () {
    init_main_page();
});

// nav_user_ref_a 点击事件
$("#nav_user_ref_a").click(function () {
    // 清空侧边栏
    $("#main-nav").html("");

    // 添加侧边栏
    var html = `
    <li><a href="#systemViewer" class="nav-header collapse" data-toggle="collapse" aria-expanded="true"><i
        class="glyphicon glyphicon-th-list"></i>系统管理<span class="pull-right glyphicon glyphicon-chevron-down"></span></a>
    <ul id="systemViewer" class="nav nav-list collapse secondmenu" aria-expanded="true"">
        <li id="li_user_control"><a id="a_user_control" href="#">用户管理<i id="i_user_control" class="glyphicon glyphicon-pencil"></i></a></li>
    </ul>
    </li>`;

    $("#main-nav").append(html);

    // 系统管理和用户管理态变 active
    $("#menu_data_statistic").removeClass("active");
    $("#menu_system_control").addClass("active");

    // 加载数据
    $("#right_frame").attr("src", "user_list");

    // 自适应框架大小
    frame_auto_size();
});