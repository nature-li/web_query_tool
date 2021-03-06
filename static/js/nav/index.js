$(document).ready(function () {
    init_main_page();
});

function init_main_page() {
    var login_user_right = $("#login_user_right").val();

    // 添加侧边栏
    if (login_user_right & USER_RIGHT.STATISTIC) {
        set_statistic_nav();
    } else if (login_user_right & USER_RIGHT.EXPERIMENT) {
        set_experiment_nav();
    } else if (login_user_right & USER_RIGHT.SYSTEM) {
        set_system_nav();
    } else if (login_user_right & USER_RIGHT.DEVELOP) {
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

function set_menu_active(menu_id) {
    $("#menu_statistic_control").removeClass("active");
    $("#menu_experiment_control").removeClass("active");
    $("#menu_system_control").removeClass("active");
    $("#menu_develop_control").removeClass("active");

    $(menu_id).addClass("active");
}

function set_statistic_nav() {
    // 清空侧边栏
    $("#main-nav").html("");
    $("#main-nav").append(statistic_html());

    // 数据统计和日统计状态变 active
    set_menu_active("#menu_statistic_control");

    // 加载数据
    $("#right_frame").attr("src", "/position");

    // 自适应框架大小
    frame_auto_size();
}

function set_experiment_nav() {
    // 清空侧边栏
    $("#main-nav").html("");
    $("#main-nav").append(experiment_html());

    // 数据统计和日统计状态变 active
    set_menu_active("#menu_experiment_control");

    // 加载数据
    $("#right_frame").attr("src", "/tree_layer");

    // 自适应框架大小
    frame_auto_size();
}

function set_system_nav() {
    // 清空侧边栏
    $("#main-nav").html("");
    $("#main-nav").append(system_html());

    // 数据统计和日统计状态变 active
    set_menu_active("#menu_system_control");

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
    set_menu_active("#menu_develop_control");

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
                <li id="li_position">
                    <a id="a_position" href="#">自查询
                        <img src="/static/images/blue_search.png" />
                    </a>
                </li>
                <li id="li_chart">
                    <a id="a_chart" href="#">可视化
                        <img src="/static/images/blue_chart.png" />
                    </a>
                </li>
                <li id="li_day_count">
                    <a id="a_day_count" href="#">日统计
                        <img src="/static/images/blue_day.png" />
                    </a>
                </li>
                <li id="li_hour_count">
                    <a id="a_hour_count" href="#">时统计
                        <img src="/static/images/blue_hour.png" />
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
                <li id="li_tree_layer">
                    <a id="a_tree_layer" href="#">业务层次
                        <img src="/static/images/blue_layer.png" />
                    </a>
                </li>
                <li id="li_exp_position">
                    <a id="a_exp_position" href="#">实验位置
                        <img src="/static/images/blue_location.png" />
                    </a>
                </li>
                <li id="li_tree_cfg">
                    <a id="a_tree_cfg" href="#">配置视图
                    <img src="/static/images/blue_config.png" />
                    </a>
                </li>
                <li id="li_tree_exp">
                    <a id="a_tree_exp" href="#">实验视图
                        <img src="/static/images/blue_exp.png" />
                    </a>
                </li>
            </ul>
        </li>`;
}

function system_html() {
    return `
        <li>
            <a href="#systemViewer" class="nav-header collapse" data-toggle="collapse">
            <i class="glyphicon glyphicon-th-list"></i>系统
                <span class="pull-right glyphicon glyphicon-chevron-down"></span>
            </a>
           <ul id="systemViewer" class="nav nav-list collapse secondmenu in">
                <li id="li_user_list">
                    <a id="a_user_list" href="#">用户权限
                        <img src="/static/images/blue_user.png" />
                    </a>
                </li>
            </ul>
        </li>`;
}

function develop_html() {
    return `
        <li>
            <a href="#developViewer" class="nav-header collapse" data-toggle="collapse">
            <i class="glyphicon glyphicon-th-list"></i>渠道
                <span class="pull-right glyphicon glyphicon-chevron-down"></span>
            </a>
           <ul id="developViewer" class="nav nav-list collapse secondmenu in">
                <li id="li_network_list">
                    <a id="a_network_list" href="#">渠道信息
                        <i id="i_netwrok_list" class="glyphicon glyphicon-send"></i>
                    </a>
                </li>
            </ul>
        </li>`;
}