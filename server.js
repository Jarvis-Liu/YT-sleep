let express = require("express");
let bodyParser = require("body-parser");
let fs = require("fs");
let cookieParser = require('cookie-parser');
let path = require("path");
let formater = require("ua-format-js").UAFormat();
let cors = require("cors");
let https = require("https");
let mongoose = require("mongoose");
let nodeCmd = require("node-cmd");	//调用cmd命令模块
let mailsend = require("./server/mail");	//调用邮件发送

let app = express()
app.use(cookieParser());
app.use(bodyParser.urlencoded({
	extended:true		
}))	
app.use(bodyParser.json());
	
app.use(express.static(path.join(__dirname,'public')));

app.use(cors({
	credentials: true, 
    origin: 'http://10.2.150.110:3001'
}))

//启动mongoDB
nodeCmd.get("mongod --dbpath F:\MongoData",function(data) {
	console.log("MongoDB服务器启动");
	return 0;
})

//连接mongoDB
var db = mongoose.connect("mongodb://127.0.0.1:27017/mobileDB",{useNewUrlParser: true});
let user = mongoose.model("users",{
	uid:String
});

let sleep = mongoose.model("sleeps",{
	uid:String,
	dateList: Array,
	timeList: Array
});




//重定向
// app.use("",(req,res) => {
// 	res.redirect("/index");
// })

//运行本地文件
app.use("/index",(req,res)  =>{
	res.writeHead(200,{'Content-Type':'text/html'});
	fs.readFile('./LightDemo.html','utf-8',function(err,data){
		if(err){
			throw err ;
		}
		res.end(data);
	});
})


app.use("/getHomeTitle",(req,res)  =>{
	console.log("545454");
	// res.writeHead(200,{'Content-Type':'text/html'});
	let obj = {
		flag : 1,
		data : "首页"
	}
	res.send(obj)
	// fs.readFile('./LightDemo.html','utf-8',function(err,data){
	// 	if(err){
	// 		throw err ;
	// 	}
	// 	res.end(data);
	// });
})


function resObj(flag,data) {
	this.flag = flag,
	this.data = data
}

//首页模块请求
app.use("/getHomeCard",(req,res) => {
	let changeNum = Number(req.body.changeNum);
	changeNum += 1;
	if (changeNum > 15) {
		changeNum = null;
	}
	console.log(changeNum);
	// let str = "这是第" + changeNum + "次请求返回的内容";
	let obj = new resObj(1,changeNum);		//拼接返回值

	//获取用户设备
	formater.setUA(req.headers["user-agent"]);
	let userAgent = formater.getResult();			//设备信息
	let userDevice = userAgent.device.model;		//提取设备名



	console.log(`请求了无限滚动的接口----- ${changeNum}-----${userDevice}`);

	

    // var aaa = JSON.stringify(userAgent)
	res.send(obj);
})

	//第三方接口方法
	function GetOtherFn(url,res,reqObj,fn) {
		let urlStr = url;
		let obj = (reqObj)?reqObj:"";
		console.log(obj);
		let req = {
			hostname:'www.easy-mock.com',
			port :8080,
			path:'/mock/5b681e2d1695b64321fa17b7/getCode/upload',
			method: 'POST',
			headers: {   
				'Content-Type':'application/x-www-form-urlencoded',
				'Content-Length': 0 
			} 
		}
		https.request(req,obj,(data_res) => {
			// console.log(data_res)
			// if(fn) {
			// 	fn();
			// }else {
				
			// 	res.send(data_res)
			// }
			let str = "";
			data_res.on("data",(chunck) => {
					str += chunck;
				})
				data_res.on("end",(err) => {
					console.log(str);
				 res.send()
				})
		})
	}


	//请求用户信息
	app.use("/getUserMessage",(req,res) => {
		user.find({},function(err,data) {
			result = data[0];
			console.log(data);
			res.send(result)
		})
	})

	//请求sleep图表
	app.use("/getChartSleep",(req,res) => {
		sleep.find({},function(err,data) {
			result = JSON.parse(JSON.stringify(data[0]));		//取得数据库源数据
			var sum = 0;
			var length = result.timeList.length;
			result.timeList.forEach((val,index,arr) => {
				if(val === null) {
					length--;
					return false;
				}
				sum += val;
			})
			sum /= length;
			console.log(length)
			result["average"] = sum.toFixed(2);
			let obj = new resObj(1,result);
			res.send(obj);
		})
	})

	//提交sleep时间
	app.use("/refSleepTime",(req,res) => {
		console.log(req.body)
		let reqObj = req.body;
		sleep.find({},function(err,data) {

			result = JSON.parse(JSON.stringify(data[0]));			//取得数据库源数据
			let lastData_DB = result.dateList[result.dateList.length - 1];		//数据库最新一条数据（日期）
			let lastMonth = lastData_DB.substr(5,2);		//数据库最新一条数据的月份
			let newMonth = reqObj.dateStr.substr(5,2);										//接收到的数据月份


			if(lastData_DB.substr(8,2) ==  reqObj.dateStr.substr(8,2)) {	//重复提交
				let errObj = {
					type:"0",
					msg:"重复提交"
				} 
				let obj = new resObj(1,errObj);		//拼接返回值
				res.send(obj);
				return 0;
			}

			if(lastMonth === newMonth) {		//不跨月
				// console.log(Number(reqObj.dateStr.substr(8,2)) -1)
				// console.log(result.dateList[result.dateList.length - 1].substr(8,2))
				if(Number(reqObj.dateStr.substr(8,2)) -1 === Number(lastData_DB.substr(8,2))) {	//昨日记录完整
					result.dateList.push(reqObj.dateStr);
					result.timeList.push(Number(reqObj.timeStr));
					delete result["_id"];
					sleep.updateOne({uid:result.uid},result,(err,docs) => {
										if(err) {
											console.log(err)
										}else {
											console.log("修改成功");
											console.log(docs)
										}
									})
				}else {	
					if(reqObj.timeStr < 4) {		//当前时间为凌晨,该条记录录为昨日
						let d = Number(reqObj.dateStr.substr(8,2)) -1;
						if(d < 10) {
							d = "0" + String(d);
						}
						var lastDate = reqObj.dateStr.substr(0,8) + d;
						result.dateList.push(lastDate);
						result.timeList.push(Number(reqObj.timeStr));
						delete result["_id"]
						sleep.updateOne({uid:result.uid},result,(err,docs) => {
										if(err) {
											console.log(err)
										}else {
											console.log("修改成功02");
											console.log(docs)
										}
									})
					}else {							//当前时间不是凌晨,将昨日记录录为null,并将本次记录录为今日
						let d = Number(reqObj.dateStr.substr(8,2)) -1;
						if(d < 10) {
							d = "0" + String(d);
						}
						var lastDate = reqObj.dateStr.substr(0,8) + d;
						result.dateList.push(lastDate);
						result.dateList.push(reqObj.dateStr);
						result.timeList.push(null);
						result.timeList.push(Number(reqObj.timeStr));
						delete result["_id"]
						sleep.updateOne({uid:result.uid},result,(err,docs) => {
										if(err) {
											console.log(err)
										}else {
											console.log("修改成功");
											console.log(docs)
										}
									})
					}
				}
			}else {				//跨月
				console.log(lastMonth );
				let lastMonthDays = GetMonthDate(lastData_DB.substr(0,4),lastMonth);		//取得上月天数
				console.log(lastMonthDays)
				if(Number(lastMonthDays) === Number(lastData_DB.substr(8,2))) {	//昨日记录完整
					result.dateList.push(reqObj.dateStr);
					result.timeList.push(Number(reqObj.timeStr));
					delete result["_id"];
					sleep.updateOne({uid:result.uid},result,(err,docs) => {
										if(err) {
											console.log(err)
										}else {
											console.log("修改成功");
											console.log(docs)
										}
									})
				}else {			//记录不完整
					if(reqObj.timeStr < 4) {		//当前时间为凌晨,该条记录录为昨日
						let d = Number(reqObj.dateStr.substr(8,2)) -1;
						if(d < 10) {
							d = "0" + String(d);
						}
						var lastDate = reqObj.dateStr.substr(0,8) + d;
						result.dateList.push(lastDate);
						result.timeList.push(Number(reqObj.timeStr));
						delete result["_id"]
						sleep.updateOne({uid:result.uid},result,(err,docs) => {
										if(err) {
											console.log(err)
										}else {
											console.log("修改成功02");
											console.log(docs)
										}
									})
					}else {							//当前时间不是凌晨,将昨日记录录为null,并将本次记录录为今日
						var lastDate = lastData_DB.substr(0,8) + lastMonthDays;
						result.dateList.push(lastDate);
						result.dateList.push(reqObj.dateStr);
						result.timeList.push(null);
						result.timeList.push(Number(reqObj.timeStr));
						delete result["_id"]
						sleep.updateOne({uid:result.uid},result,(err,docs) => {
										if(err) {
											console.log(err)
										}else {
											console.log("修改成功");
											console.log(docs)
										}
									})
					}
				}
			}
			let errObj = {
				type:"1",
				msg:"提交成功"
			}
			let obj = new resObj(1,errObj);		//拼接返回值
			res.send(obj);

			// console.log(result)
		// sleep.find({},function(err,data) {
		// 	result = JSON.parse(JSON.stringify(data[0]));		//取得数据库源数据
		// 	var sum = 0;
		// 	// var arr = JSON.parse(JSON.stringify(result)).timeList;
		// 	result.timeList.forEach((val,index,arr) => {
		// 		if(val === null) {
		// 			val = 0;
		// 		}
		// 		sum += val;
		// 	})
		// 	sum /= result.timeList.length;
		// 	result["average"] = sum.toFixed(2);
		// 	let obj = new resObj(1,result);
		// 	res.send(obj);
		})
		// res.end();
	})




	//发送邮件
	app.use("/sendMail",(req,res) => {
		mailsend("823867852@qq.com","这是一则第二次邮件测试","<h2 style='color:#99ff60;'>我变绿了</h2>")
		res.end();
	})


	//监听错误
	app.use("/reportError",(req,res) => {
		let reqObj = req.body;
		let domStr = `<h2 style="text-align: center;">javascript运行报错</h2>
		<div><span style="padding-right: 20px;border-right: 1px solid #FF6600">行</span>${reqObj.line}</div>
		<div><span style="padding-right: 20px;border-right: 1px solid #FF6600">列</span>${reqObj.col}</div>
		<div><span style="padding-right: 20px;border-right: 1px solid #FF6600">错误信息</span>${reqObj.msg}</div>
		<div><span style="padding-right: 20px;border-right: 1px solid #FF6600">地址</span>${reqObj.url}</div>`;
		mailsend("823867852@qq.com","项目错误报告",domStr);
		res.end();
	})

	//获取当月天数
	function GetMonthDate(year, month){
		var d = new Date(year, month, 0);
		return d.getDate();
	}

app.listen(3001,"10.2.151.164",() => {
	console.log("start");
})