$(document).ready(function () {
    init_main_page();
});

function init_main_page() {
    var login_user_right = $("#login_user_right").val();

    // 添加侧边栏
    if (login_user_right & 0B100) {
        set_statistic_nav();
    } else if (login_user_right & 0B1000) {
        set_experiment_nav();
    } else if (login_user_right & 0B10) {
        set_system_nav();
    } else if (login_user_right & 0B1) {
        set_develop_nav();
    }
}

// nav_statistic_ref_a 点击事件
$("#nav_statistic_ref_a").click(function () {
    set_statistic_nav();
});

// nav_experiment_ref_a 点击事件
$("#nav_experiment_ref_a").click(function () {
    set_experiment_nav();
});

// nav_system_ref_a 点击事件
$("#nav_system_ref_a").click(function () {
    set_system_nav();
});

// nav_develop_ref_a 点击事件
$("#nav_develop_ref_a").click(function () {
    set_develop_nav();
});

function set_statistic_nav() {
    // 清空侧边栏
    $("#main-nav").html("");
    $("#main-nav").append(statistic_html());

    // 数据统计和日统计状态变 active
    $("#menu_statistic_control").removeClass("active");
    $("#menu_experiment_control").removeClass("active");
    $("#menu_system_control").removeClass("active");
    $("#menu_develop_control").removeClass("active");
    $("#menu_statistic_control").addClass("active");

    // 加载数据
    $("#right_frame").attr("src", "/day_count");

    // 自适应框架大小
    frame_auto_size();
}

function set_experiment_nav() {
    // 清空侧边栏
    $("#main-nav").html("");
    $("#main-nav").append(experiment_html());

    // 数据统计和日统计状态变 active
    $("#menu_statistic_control").removeClass("active");
    $("#menu_experiment_control").removeClass("active");
    $("#menu_system_control").removeClass("active");
    $("#menu_develop_control").removeClass("active");
    $("#menu_experiment_control").addClass("active");

    // 加载数据
    $("#right_frame").attr("src", "/experiment");

    // 自适应框架大小
    frame_auto_size();
}

function set_system_nav() {
    // 清空侧边栏
    $("#main-nav").html("");
    $("#main-nav").append(system_html());

    // 数据统计和日统计状态变 active
    $("#menu_statistic_control").removeClass("active");
    $("#menu_experiment_control").removeClass("active");
    $("#menu_system_control").removeClass("active");
    $("#menu_develop_control").removeClass("active");
    $("#menu_system_control").addClass("active");

    // 加载数据
    $("#right_frame").attr("src", "/user_list");

    // 自适应框架大小
    frame_auto_size();
}

function set_develop_nav() {
    // 清空侧边栏
    $("#main-nav").html("");
    $("#main-nav").append(develop_html());

    // 数据统计和日统计状态变 active
    $("#menu_statistic_control").removeClass("active");
    $("#menu_experiment_control").removeClass("active");
    $("#menu_system_control").removeClass("active");
    $("#menu_develop_control").removeClass("active");
    $("#menu_develop_control").addClass("active");

    // 加载数据
    $("#right_frame").attr("src", "/network_list");

    // 自适应框架大小
    frame_auto_size();
}

function statistic_html() {
    return `
        <li>
            <a href="#statisticViewer" class="nav-header collapse" data-toggle="collapse">
            <i class="glyphicon glyphicon-th-list"></i>数据统计
                <span class="pull-right glyphicon glyphicon-chevron-down"></span>
            </a>
           <ul id="statisticViewer" class="nav nav-list collapse secondmenu in">
                <li id="li_day_count">
                    <a id="a_day_count" href="#">日统计
                        <i id="i_day_count" class="glyphicon glyphicon-eye-open"></i>
                    </a>
                </li>
                <li id="li_hour_count">
                    <a id="a_hour_count" href="#">时统计
                        <i id="i_hour_count" class="glyphicon glyphicon-eye-open"></i>
                    </a>
                </li>
                <li id="li_position">
                    <a id="a_position" href="#">自查询
                        <i id="i_position" class="glyphicon glyphicon-eye-open"></i>
                    </a>
                </li>
                <li id="li_chart">
                    <a id="a_chart" href="#">可视化
                        <i id="i_chart" class="glyphicon glyphicon-eye-open"></i>
                    </a>
                </li>
            </ul>
        </li>`;
}

function experiment_html() {
    return `
        <li>
            <a href="#experimentViewer" class="nav-header collapse" data-toggle="collapse">
            <i class="glyphicon glyphicon-th-list"></i>实验平台
                <span class="pull-right glyphicon glyphicon-chevron-down"></span>
            </a>
           <ul id="experimentViewer" class="nav nav-list collapse secondmenu in">
                <li id="li_experiment_config">
                    <a id="a_experiment_config" href="#">配置管理
                        <i id="i_experiment_config" class="glyphicon glyphicon-eye-open"></i>
                    </a>
                </li>
            </ul>
        </li>`;
}

function system_html() {
    return `
        <li>
            <a href="#systemViewer" class="nav-header collapse" data-toggle="collapse">
            <i class="glyphicon glyphicon-th-list"></i>系统管理
                <span class="pull-right glyphicon glyphicon-chevron-down"></span>
            </a>
           <ul id="systemViewer" class="nav nav-list collapse secondmenu in">
                <li id="li_user_list">
                    <a id="a_user_list" href="#">用户列表
                        <i id="i_user_list" class="glyphicon glyphicon-eye-open"></i>
                    </a>
                </li>
            </ul>
        </li>`;
}

function develop_html() {
    return `
        <li>
            <a href="#developViewer" class="nav-header collapse" data-toggle="collapse">
            <i class="glyphicon glyphicon-th-list"></i>其它工具
                <span class="pull-right glyphicon glyphicon-chevron-down"></span>
            </a>
           <ul id="developViewer" class="nav nav-list collapse secondmenu in">
                <li id="li_network_list">
                    <a id="a_network_list" href="#">渠道列表
                        <i id="i_netwrok_list" class="glyphicon glyphicon-eye-open"></i>
                    </a>
                </li>
            </ul>
        </li>`;
}