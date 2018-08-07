// 错误提示框
$.showErr = function (str, func) {
    BootstrapDialog.show({
        type: BootstrapDialog.TYPE_DANGER,
        title: '错误 ',
        message: str,
        size: BootstrapDialog.SIZE_SMALL,
        draggable: true,
        buttons: [{
            label: '关闭',
            action: function (dialogItself) {
                dialogItself.close();
            }
        }],
        onhide: func
    });
};

// 确认对话框
$.showConfirm = function (str, func_ok, func_close) {
    BootstrapDialog.show({
        title: '确认',
        message: str,
        cssClass: 'bootstrap_center_dialog',
        type: BootstrapDialog.TYPE_WARNING,
        size: BootstrapDialog.SIZE_SMALL,
        draggable: true,
        closable: false,
        buttons: [{
            label: '取消',
            action: function (dialogItself) {
                dialogItself.close();
            }
        }, {
            label: '确定',
            cssClass: 'btn-warning',
            action: function (dialogItself) {
                dialogItself.close();
                func_ok();
            }
        }],
        onhide: func_close,
    });
};

// 改变窗口大小
function change_frame_size() {
    var newHeight = $(document).contents().find('body').height();
    if (newHeight < 900) {
        newHeight = 900;
    }
    $("#left_frame_col", window.parent.document).height(newHeight);
    $("#right_frame_col", window.parent.document).height(newHeight);
    $("#right_frame", window.parent.document).height = newHeight;
}

// 初始化渠道下拉列表框
function init_ad_network_select(function_on_success) {
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
                    $("#ad_network_id_selector").append(option);
                }
                $("#ad_network_id_selector").selectpicker('refresh');

                if (function_on_success) {
                    function_on_success();
                }
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

function zeroize(value, length) {
    if (!length) {
        length = 2;
    }

    value = String(value);
    for (var i = 0, zeros = ''; i < (length - value.length); i++) {
        zeros += '0';
    }

    return zeros + value;
}

// 格式化 datetime_picker
function format_time_picker(date) {
    var year = date.getFullYear();
    var month = zeroize(date.getMonth() + 1);
    var day = zeroize(date.getDate());
    var hour = zeroize(date.getHours());
    var minute = zeroize(date.getMinutes());

    return year + '-' + month + '-' + day + ' ' + hour + ":" + minute;
}

// 转化为十六进制
function toHex(raw) {
    if (!raw) {
        return '';
    }

    var result = '';
    for (var i = 0; i < raw.length; i++) {
        var ascii = raw.charCodeAt(i);
        var hex = ascii.toString(16);
        result += hex;
    }

    return result;
}