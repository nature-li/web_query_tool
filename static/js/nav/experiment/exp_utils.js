function check_alphanumeric_(raw) {
    var reg = /^[a-z0-9_]+$/i;
    return reg.test(raw);
}

function check_alphanumeric_ver_(raw) {
    var reg = /^[a-z0-9|_]+$/i;
    return reg.test(raw);
}

function check_alphanumeric_ver_middle_(raw) {
    var reg = /^[a-z0-9|_\-]+$/i;
    return reg.test(raw);
}

// 初始化业务下拉列表框
function init_business_selector(func_on_success) {
    $.ajax({
            url: '/business',
            type: "get",
            data: {
                'type': 'QUERY_BNS',
                'off_set': 0,
                'limit': -1
            },
            dataType: 'json',
            success: function (data) {
                if (data.success !== "true") {
                    return;
                }

                for (var i = 0; i < data.content.length; i++) {
                    var item = data.content[i];

                    var option = '<option value="' + item.id + '">' + item.name + '</option>';
                    if (i === 0) {
                        // 首选项为默认选项
                        option = '<option value="' + item.id + '" selected="selected">' + item.name + '</option>';
                    }
                    $("#business_selector").append(option);
                }
                $("#business_selector").selectpicker('refresh');

                func_on_success();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                if (jqXHR.status == 302) {
                    window.parent.location.replace("/");
                } else {
                    console.log("error occurs");
                }
            }
        }
    );
}