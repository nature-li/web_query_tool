// 错误提示框
$.showErr = function (str, func) {
    BootstrapDialog.show({
        type: BootstrapDialog.TYPE_DANGER,
        title: '错误 ',
        message: str,
        size: BootstrapDialog.SIZE_SMALL,
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
    BootstrapDialog.confirm({
        title: '确认',
        message: str,
        type: BootstrapDialog.TYPE_WARNING,
        draggable: true,
        btnCancelLabel: '取消',
        btnOKLabel: '确定',
        btnOKClass: 'btn-warning',
        size: BootstrapDialog.SIZE_SMALL,
        onhide: func_close,
        callback: function (result) {
            if (result) {
                func_ok.call();
            }
        }
    });
};
