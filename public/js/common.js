//获取layui年月日格式
function getDate() {
    var dateTime = new Date();
    var dateNum = dateTime.getDate();
    var monthNum = parseInt(dateTime.getMonth()) + 1;
    var yearStr = dateTime.getFullYear();
    var monthStr;
    var dateStr;
    if (monthNum < 10) {
        monthStr = "0" + monthNum;
    } else {
        monthStr = monthNum
    }
    if (dateNum < 10) {
        dateStr = "0" + dateNum;
    } else {
        dateStr = dateNum
    }
    dateStr = yearStr + "-" + monthStr + "-" + dateStr;
    return dateStr;
}


//将普通数字转换为时分制
function fnChangeTime(text) {
    if (text > 24) {
        text -= 24;
    }
    if (String(text).length > 5) {
        text = Number(String(text).slice(0,5));         //解决计算bug
    }
    text = String(text);
    if (text.indexOf(".",0) == -1) {
        (text.length < 2)?text = "0" + text + ":00":text += ":00";      //整点
    }else {
        var text01 = text.slice(0,text.indexOf(".",0));
        if(text01.length < 2) {
            text01 = "0" + text01;
        }
        var text02 = text.slice(text.indexOf(".",0) + 1,text.length);   //非整点
        if (text02.length < 2) {
            text02 = parseInt(Number(text02) / 10 * 60);
        }else {
            text02 = parseInt(Number(text02) / 100 * 60);
        }
        if (String(text02).length < 2) {
            text02 = "0" + String(text02);
        }else if(String(text02).length > 2) {
            text02 = String(text02).substring(0,2);
        }
        text = text01 + ":" + text02;
    }
    return text;
}

//获取当月天数
function mGetDate(year, month){
    var d = new Date(year, month, 0);
    return d.getDate();
}

function reportError(data) {
    $.ajax({
        url: "/reportError",
        data: data,
        dataType: "json",
        type:"post",
        success: (data) => {

        }
    })
}

//监听错误
window.onerror = function(msg,url,line,col,error){
    //没有URL不上报！上报也不知道错误
    if (msg != "Script error." && !url){
            return true;
    }
    //采用异步的方式
    //我遇到过在window.onunload进行ajax的堵塞上报
    //由于客户端强制关闭webview导致这次堵塞上报有Network Error
    //我猜测这里window.onerror的执行流在关闭前是必然执行的
    //而离开文章之后的上报对于业务来说是可丢失的
    //所以我把这里的执行流放到异步事件去执行
    //脚本的异常数降低了10倍
    setTimeout(function(){
            var data = {};
            //不一定所有浏览器都支持col参数
            col = col || (window.event && window.event.errorCharacter) || 0;

            data.url = url;
            data.line = line;
            data.col = col;
            if (!!error && !!error.stack){
                    //如果浏览器有堆栈信息
                    //直接使用
                    data.msg = error.stack.toString();
            }else if (!!arguments.callee){
                    //尝试通过callee拿堆栈信息
                    var ext = [];
                    var f = arguments.callee.caller, c = 3;
                    //这里只拿三层堆栈信息
                    while (f && (--c>0)) {
                        ext.push(f.toString());
                        if (f  === f.caller) {
                                    break;//如果有环
                        }
                        f = f.caller;
                    }
                    ext = ext.join(",");
                    data.msg = error.stack.toString();
            }
            //把data上报到后台！
            console.log(data);
            reportError(data);
    },0);
    
    return true;
};