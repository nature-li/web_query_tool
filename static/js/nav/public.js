// 错误提示框
$.showErr = function(str, func) {
    BootstrapDialog.show({
        type : BootstrapDialog.TYPE_DANGER,
        title : '错误 ',
        message : str,
        size : BootstrapDialog.SIZE_SMALL,
        buttons : [ {
            label : '关闭',
            action : function(dialogItself) {
                dialogItself.close();
            }
        } ],
        onhide : func
    });
};

// 确认对话框
$.showConfirm = function(str, func_ok, func_close) {
    BootstrapDialog.confirm({
        title : '确认',
        message : str,
        type : BootstrapDialog.TYPE_WARNING,
        draggable : true,
        btnCancelLabel : '取消',
        btnOKLabel : '确定',
        btnOKClass : 'btn-warning',
        size : BootstrapDialog.SIZE_SMALL,
        onhide : func_close,
        callback : function(result) {
            if (result) {
                func_ok.call();
            }
        }
    });
};

// 初始化渠道下拉列表框
function init_ad_network_select() {
    $.ajax({
            url: '/query_network_list',
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
                    $("#ad_network_id_selector").append('<option>' + network_name + '</option>');
                }
            },
            error: function () {
                $.showErr("查询失败");
            }
        }
    );
}