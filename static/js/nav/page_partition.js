// 更新分页标签
function update_page_partition(page_idx) {
    var total_count = window.save_data.item_list.length;
    var max_page_count = window.save_data.max_page_count;
    var count_per_page = window.save_data.count_per_page;
    var page_off_set = window.save_data.page_off_set;
    window.save_data.current_page_idx = page_idx;

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
    window.save_data.page_off_set -= window.save_data.max_page_count;
    window.current_page_idx = 0;
    query_and_update_view();
});

// 点击分页tail标签
$(document).on("click", ".hive-page-tail", function () {
    window.save_data.page_off_set += window.save_data.max_page_count;
    window.current_page_idx = 0;
    query_and_update_view();
});

// 点击其它分页标签
$(document).on("click", ".hive-page-partition", function () {
    var page_number = $(this).find('a').text() - 1;
    var page_idx = page_number % window.save_data.max_page_count;
    update_page_view(page_idx);
});