

function foo (res) {
	console.time();
	var obj = res.data.linedetails;
	var arr = res.data.lines.split(',');
	var arr_gj = [],arr_dt = [],arr_other = [];
	var arr_new = [];
	var arr_result = [];
	// var arr_gj = arr.filter(filterFn01);
	// var arr_dt = arr.filter(filterFn02);
	//区分三种类型数组
	arr.forEach((val,index,arr) => {
		var str = /^(\d)/;
		var str02 = /^(地铁)/;
		if (str.test(val)) {
			arr_gj.push(val);
		}else if(str02.test(val)) {
			arr_dt.push(val);
		}else {
			arr_other.push(val)
		}
	})

	//对第一种进行排序
	arr_gj.sort((a,b) => {
		var val01 = parseInt(a);
		var val02 = parseInt(b);
		return val01 - val02;
	})

	//对第二种进行排序
	arr_dt.sort((a,b) => {
		var val01 = parseInt(a);
		var val02 = parseInt(b);
		return val01 - val02;
	})

	//对第三种进行排序
	arr_other.sort((a,b) => {
		var val01 = a.length;
		var val02 = b.length;
		return val01 - val02;
	})

	//合并新数组
	arr_new = arr_gj.concat(arr_dt,arr_other);

	//生成结果数组
	arr_new.forEach((val,index) => {
		for(i in obj){
			if(obj[i]["name"] == val) {
				arr_result.push(obj[i]);
				return 0;
			}
		}
	})
	console.timeEnd();
	return arr_result;
}




function filterFn01(val) {
	var str = /^(\d)/;
	if (str.test(val)) {
		return val
	}
}

function filterFn02(val) {
	var str = /^(地铁)/;
	// console.log(val);
	// console.log(str.test(val));
	if (str.test(val)) {
		return val
	}
}


const res = { code: 0, 
	data: { 
		lines: '20路,301路,5路,地铁5号线,机场大巴线,107路,机场快轨',
	 	lineids: 'lzbd,lwes,lxid,lwic,lwdf,ldfx,loin',
	    linedetails: { 
		  	lwdf: { name: '机场大巴线' },
		   	lwes: { name: '301路' },
		    lwic: { name: '地铁5号线' },
		    ldfx: { name: '107路' },
	        lzbd: { name: '20路' },
		    lxid: { name: '5路' },
		    loin: { name: '机场快轨'} 
	    }  
	}
} 
const data = foo(res)
console.log(data);