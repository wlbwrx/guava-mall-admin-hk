/**
 * 表单序列化为JSON
 * @param {Object} $
 */
(function($){
    $.fn.serializeJson=function(){
        var serializeObj={};
        var array=this.serializeArray();
		var str=this.serialize();
        $(array).each(function(){
            if(serializeObj[this.name]){
                if($.isArray(serializeObj[this.name])){
                    serializeObj[this.name].push(this.value);
                }else{
                    serializeObj[this.name]=[serializeObj[this.name],this.value];
                }
            }else{
                serializeObj[this.name]=this.value;
            }
        });
        return serializeObj;
    };  
})(jQuery); 

var cacheLocalstorage = {
	setCache: function(name, value, days) {
		if(days <= 0) localStorage.removeItem(name);

		localStorage.setItem(name, escape(JSON.stringify(value)));
	},
	getCache: function(name) {
		var _value = localStorage.getItem(name);
		if(_value && _value != '') {
			return JSON.parse(unescape(_value));
		}
		return null;
	}
}
var cacheSessionStorage = {
	setCache: function(name, value) {
		sessionStorage.setItem(name, escape(JSON.stringify(value)));
	},
	getCache: function(name) {
		var _value = sessionStorage.getItem(name);
		if(_value && _value != '') {
			return JSON.parse(unescape(_value));
		}
		return null;
	},
	removeCache : function(name){
		sessionStorage.removeItem(name);
	}
}

/**
 * JS 模拟MAP
 *  var map = new Map();
	map.put("key","map");
	map.put("key","map1");
	alert(map.get("key"));//map1
	map.remove("key");
	alert(map.get("key"));//undefined
 */
function Map() {
  this.obj = {};
  this.count = 0;
}
Map.prototype.put = function (key, value) {
  var oldValue = this.obj[key];
  if (oldValue == undefined) {
    this.count++;
  }
  this.obj[key] = value;
}
Map.prototype.get = function (key) {
  return this.obj[key];
}
Map.prototype.remove = function (key) {
  var oldValue = this.obj[key];
  if (oldValue != undefined) {
    this.count--;
    delete this.obj[key];
  }
}
Map.prototype.size = function () {
  return this.count;
}



/**
 * 各种工具类
 */
var utils = {
	cookie : {
		/*使用方法：setCookie('user', 'simon');*/
		setCookie : function(name,value , days) {
			var Days = days||30; 
	    	var exp = new Date(); 
			exp.setTime(exp.getTime() + Days*24*60*60*1000);
	    	document.cookie=name+"="+ escape(JSON.stringify(value)) + '; path=/' + "; expires=" + exp;//直接设置
		},
		/*使用方法：getCookie('user')*/
		getCookie : function(name) {
		    var arr = document.cookie.split('; '); //多个cookie值是以; 分隔的，用split把cookie分割开并赋值给数组
		    for(var i = 0 ; i < arr.length ; i++){
		        var arr2 = arr[i].split('='); //原来割好的数组是：user=simon，再用split('=')分割成：user simon 这样可以通过arr2[0] arr2[1]来分别获取user和simon 
		        if(arr2 && arr2[0] && arr2[0] == name){//如果数组的属性名等于传进来的name
		            return JSON.parse(unescape(arr2[1])); //就返回属性名对应的值
		        }
		    }
		    return null; //没找到就返回空
		},
		removeCookie : function(name){
		    utils.cookie.setCookie(name,1,-1);
		}
	},
	getURLParam : function(name){
	     var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
	     var r = window.location.search.substr(1).match(reg);
	     if(r != null)return unescape(r[2]);
	     return null;
	},
	/**
     * 生成唯一 id
     * @param pluginName 插件名，若传入该参数，guid 将以该参数作为前缀
     * @returns {string}
     */
    guid: function (pluginName) {
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
      }

      var guid = s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
      if (pluginName) {
        guid = 'mdui-' + pluginName + '-' + guid;
      }

      return guid;
    },
	_ajaxSetup : function(){
		$.ajaxSetup({
	        headers : {
	            requestId : utils.guid(),
	            requestTime : (new Date()).valueOf()
	        },
	        dataType : 'json',
	        contentType: 'application/json',
	        beforeSend : function(XMLHttpRequest, req){
	        	layer.load(3);
				var accessToken = utils.cookie.getCookie('accessToken');
	        	if(!accessToken && req.url.indexOf('/api/admin/login') < 0 || accessToken == 1){
					utils.reRegister();return;
				}
				if(accessToken == 1){
					utils.forcedLogout();
				}
	        	if(accessToken && accessToken.trim() != ''){
	        		XMLHttpRequest.setRequestHeader("Authorization", 'Bearer ' + accessToken);
				}
	        },
	        error : function (XMLHttpRequest, textStatus, errorThrown){
				if(XMLHttpRequest.status == 403){
					window.outState = 'direct';
	        		toastr.error('用户权限不足,如需操作,请联系管理员...');
	        	}else if(XMLHttpRequest.status == 401){
					if(XMLHttpRequest.responseJSON.body.error == "invalid_token"){
                        utils.reRegister();
                    }else{
						toastr.error('用户权限不足,如需操作,请联系管理员...');
						console.log(XMLHttpRequest, textStatus, errorThrown);
					}
	        	}else if(XMLHttpRequest.status == 500){
	        		toastr.error((XMLHttpRequest.responseJSON && XMLHttpRequest.responseJSON.body && XMLHttpRequest.responseJSON.body.message) ? XMLHttpRequest.responseJSON.body.message : '系统异常,请稍候重试或联系开发人员...');
	        	}else{
					console.log(XMLHttpRequest, textStatus, errorThrown);
				}
	        },
	        complete : function(XMLHttpRequest, TS){
	        	layer.closeAll('loading');
	        }
	    });
	},
	urlMap : null,
	prePath : function(){
		if(utils.urlMap == null) utils.initUrlMap();
    	return utils.urlMap.get(window.location.hostname) || 'http://' + window.location.hostname + ":8080";
	},
	initUrlMap : function(){
		utils.urlMap = new Map();
		utils.urlMap.put('127.0.0.1' , 'http://172.30.11.67:18080');
		utils.urlMap.put('172.30.30.207' , 'http://172.30.11.67:18080');
		utils.urlMap.put('172.30.11.67' , 'http://172.30.11.67:18080');
		utils.urlMap.put('172.30.41.141' , 'http://172.30.11.67:18080');
		utils.urlMap.put('admin.buytapp.com' , 'https://api.buytapp.com');
	},
	perviewPath : function(id){
		if(window.location.host == '127.0.0.1:8020'){
			return '/guava-mall-web/product/index.html?id=' + id + '&source=admin';
		}
		if(window.location.host == '172.30.30.24:8020'){
			return '/guava-mall-web/product/index.html?id=' + id + '&source=admin';
		}
		if(window.location.host == '172.30.30.214:5500'){
			return '/guava-mall-web/product/index.html?id=' + id + '&source=admin';
		}
		if(utils.prePath().indexOf('api.buytapp.com') > 0){
			return 'https://www.buytapp.com/product/index.html?id='+id + '&source=admin';
		}else if(utils.prePath().indexOf('172.30.10.186') > 0){
			return 'http://172.30.10.186:28080/product/index.html?id='+id + '&source=admin';
		}else {
			return 'http://127.0.0.1:5500/guava-mall-web/product/index.html?id='+id + '&source=admin';
		}
	},
	perviewSinglePath: function (id) {
		if (window.location.host == '172.30.30.156:5500'){
			return 'http://172.30.30.156:5503/singlePage/index.html?id=' + id;
		} else if (utils.prePath().indexOf('api.baleshop.tw') > 0){
			return 'https://www.buytapp.com/singlePage/index.html?id=' + id;
		} else {
			return 'http://172.30.11.67:19080/singlePage/index.html?id=' + id;
		}
	},
	login: function(params, callback){
        utils.cookie.setCookie('username' , params.username.trim());
        utils.cookie.setCookie('password' , params.password.trim());
        if(utils.cookie.getCookie('accessToken') && utils.cookie.getCookie('accessToken') != ''){
            utils.cookie.removeCookie('accessToken');
        }
		$.ajax({
			type : "POST",
			url : utils.prePath()+"/api/admin/login",
			data : JSON.stringify(params),
			success : function(result){
				if(result.statusCode == 'OK'){
					var clearTimes = result.body.expires_in / ( 24 * 60 * 60 );
					utils.cookie.setCookie('loginTime' , moment().format('YYYY/M/D HH:mm:ss') , clearTimes);
					utils.cookie.setCookie('accessToken' , result.body.access_token , clearTimes);
					utils.cookie.setCookie('refreshToken' , result.body.refresh_token , clearTimes);
					utils.cookie.setCookie('roles' , result.body.roles , clearTimes);
					// 格式化数据
					var menus = [];
					result.body.menus && result.body.menus.length && result.body.menus.map(function(e){
						if(e.authorities && e.authorities.length > 0){
							if(e.type == 1){
								var s_menu = []
								e.authorities.map(function(_e){
									s_menu.push({url: _e.url, name: _e.name, authorities: _e.authorities})
								})
								menus.push({name: e.name, value: e.id, icon: e.icon, data: s_menu})
							}else if(e.type == 2){
								menus.push({url: e.url, name: e.name, icon: e.icon, authorities: e.authorities})
							}
						}else{
							menus.push({url: e.url, name: e.name, icon: e.icon})
						}
					});
					cacheLocalstorage.setCache('userMenus' , menus , clearTimes);
					
					userAuthorities = [] ; 
					$.each(menus , function(index , userMenu){
						if(userMenu.data){
							$.each(userMenu.data , function(index , _data){
								$.each(_data.authorities , function(index , authority){
									userAuthorities.push(authority.value);
								});
							});
						}else if(userMenu.authorities){
							$.each(userMenu.authorities , function(index , authority){
								userAuthorities.push(authority.value);
							});
						}
					});
					cacheLocalstorage.setCache('userAuthorities' , userAuthorities);
					callback && callback();
				}else{
					toastr.error((result.body && result.body.message) ? result.body.message : '系统异常,请稍候重试或联系开发人员...');
				}
			},
			error : function(result){
				if(JSON.parse(result.responseText).body.message == 'Authentication Failed: Invalid password!'){
					toastr.error('密码错误！')
				}else{
					toastr.error(JSON.parse(result.responseText).body.message);
				}
			}
		});
	},
	forcedLogout: function(){
		// 登录失败，强制登出
		window.outState = 'direct';
		utils.cookie.setCookie('accessToken' , '' , -1);
		utils.cookie.setCookie('refreshToken' , '' , -1	);
		if(top.location.href.indexOf('guava-mall-admin') > 0){
			top.location.href = '/guava-mall-admin/login.html';
		}else{
			top.location.href = '/login.html';
		}
	},
	reRegister: function(){
		if($('#loginForm input[name="password"]').length > 0){
			return
		}
		if(!utils.cookie.getCookie('username') || utils.cookie.getCookie('username') == ''){
			utils.forcedLogout();
		}
		if(!utils.cookie.getCookie('loginTime') || utils.cookie.getCookie('loginTime') == ''){
			utils.forcedLogout();
		}
		document.onkeydown = function(e) {
			var ev = (typeof event!= 'undefined') ? window.event : e;
			if(ev.keyCode == 13) {
				return false;
			}
		}
		layer.open({
            type: 1,
            title: '请登录后再操作',
            content: '<form id="loginForm" class="form-auth-small">' +
                '<div class="form-group">'+
                    '<label for="signin-password" class="control-label">密码</label>' + 
                    '<input type="password" name="password" class="form-control" id="signin-password" value="" placeholder="Password">' + 
                '</div>' +
            '</form>',
			btn: ['登录','退出重登'] ,
			skin: 'login',
            btnAlign: 'c',
            yes: function(index, layero){
				var _loginForm = $('#loginForm').serializeJson();
				_loginForm['username'] = utils.cookie.getCookie('username');
                if(_loginForm.password.trim() == ''){
					toastr.error('密码不能为空...');
                    $('#loginForm input[name="password"]').focus();
                    return;
                }
                utils.login(_loginForm, function(){
                    layer.close(index);
				})
				$('#timeBox a').html('登录时间：'+(utils.cookie.getCookie('loginTime')||'登陆超时'));
				document.onkeydown = undefined
            },btn2: function(index, layero){
				utils.forcedLogout();
				document.onkeydown = undefined
			}
		});
	}	
}

$(function(){
	utils._ajaxSetup();
});
