let fn = function() {
	console.log("执行");
	let domStr = `<div class="card">
				    <div class="card-header">
				    	<div class="card-header-content row">
				    		<span class="col-25"><i class="iconfont icon-CalendarControl"></i>开始</span>
				    		<input class="col-75" id="beginDate"  type="text" data-toggle='date' />
				    	</div>
				    	<div class="card-header-content row">
				    		<span class="col-25"><i class="iconfont icon-CalendarControl"></i>结束</span>
				    		<input class="col-75" id="endDate"  type="text" data-toggle='date' />
				    	</div>
				    	
					</div>
				    <div class="card-content">
				      <div class="card-content-inner">
				        
				      </div>
				    </div>
				  </div>`;
	$("#homeContent .cardBox").prepend(domStr);
	//时间选择器初始化	(必须在对应dom树加载完成之后就开始加载，否则如当前js下初始化就会导致change事件无法监听，需要依靠原生change监听val)
	var thisDate = getDate();
	$("#beginDate").val(thisDate);
	$("#endDate").val(thisDate);
	//时间选择器初始化配置项
	var timeOption = {
		value: [thisDate],
	    monthNames:["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"],
	    dayNames:["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"],
	    dayNamesShort:["周日","周一","周二","周三","周四","周五","周六"]
	}

	$("#beginDate").calendar({
	    ...timeOption,
	    onChange: function(p,values,displayValues) {	//对象	//时间戳		//格式化日期
	    	console.log(p);
	    	console.log(values);
	    	console.log(displayValues);
	    }
	});

	$("#endDate").calendar({
	    ...timeOption,
	    onChange: function(p,values,displayValues) {	//对象	//时间戳		//格式化日期
	    	console.log(p);
	    	console.log(values);
	    	console.log(displayValues);
	    }
	});
}
fn();
// export {fn}