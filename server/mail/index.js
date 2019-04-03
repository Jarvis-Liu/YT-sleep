let nodemailer = require("nodemailer");	//调用邮件模块
let smtpTransport = require("nodemailer-smtp-transport");
let config = require("../config");

//配置邮件
let transporter = nodemailer.createTransport({
	service: config.email.service,
	auth: {
		user: config.email.user,
		pass: config.email.pass
	}
});

/**
 * @param {String} recipient 收件人 多个接受者使用,隔开
 * @param {String} subject 发送的主题
 * @param {String} html 发送的html内容
 * @param {Array} attachments 附件
 */


let sendMail = (recipient,subject,html,attachments) => {
    if(typeof(attachments) == "undefined") {
        attachments = [];
    }
    transporter.sendMail({
        from: config.email.user,
        to: recipient, 
        subject: subject,
        html: html,
        attachments: attachments
    },(err,response) => {
        if(err) {
            console.log(err);
        }else {
            console.log("发送成功！");
        }
    })
}

module.exports = sendMail;
