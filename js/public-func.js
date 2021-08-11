var authoritys = {
    getAuthority: function(url){
        // 链接矫正
        var url = window.location.pathname + window.location.search;
        var url_data = url.split('/');
        if(url_data.length > 2 && url_data[1] == 'guava-mall-admin'){
            url = url.split('/').slice(2).join('/');
        }else{
            url = url.split('/').slice(1).join('/');
        }
        // 去权限
        var userMenus = cacheLocalstorage.getCache('userMenus');
        (!userMenus || userMenus.length == 0) && (window.location.href = './login.html')
        var authority = [];
        for(var i = 0; i < userMenus.length; i++){
            if(userMenus[i].data){
                for(var j = 0; j < userMenus[i].data.length; j++){
                    if(userMenus[i].data[j].url == url){
                        authority = userMenus[i].data[j].authorities
                        break;
                    }
                }
            }else{
                if(userMenus[i].url == url){
                    authority = userMenus[i].authorities
                    break;
                }
            }
        }
        return authority;
    },
    useAuthority: function(){
        var table_state = false;
        var authority_data = authoritys.getAuthority();
        authority_data && authority_data.map(function(e){
            switch(e.name){
                case '查询': table_state = true;break;
                default: $('*[authority="' + e.value + '"]').removeClass('hidden').show();break;
            }
        })
        $('*[authority]').each(function(){
            if($(this).css('display') == 'none'){
                $(this).remove();
            }
        });
        return table_state;
    },
    havAuthority: function(authority){
        var authority_data = authoritys.getAuthority();
        for(var i = 0;i < authority_data.length;i++){
            if(authority_data[i].value == authority){
                return true;
            }
        }
        return false;
    },
}

var tableUi = {
    data:{
        linkName: window.location.pathname.split('.')[0].replace(/\//g,'-'),
        tableOption_page:{
            pagination : true,
            cache: false,
            height: 1,
            sortable: false,
            sidePagination: "server",
            clickToSelect : true,
            templateView : false,
            showHeader : true,
            showColumns : true,
            pageNumber : 1 ,
            pageSize : 30 ,
            pageList : [30 , 50 , 100 , 200],
            toolbarAlign : 'left',
            queryParamsType : 'page' ,
            totalField: 'body.totalElements',
            dataField: 'body.content',
            queryParams : function(params){
                params.size = params.pageSize;
                params.page = parseInt(params.pageNumber)-1;
                delete params['pageSize'];
                delete params['pageNumber'];
                return Object.assign(params, tools.getParams());
            },
            onColumnSwitch: function(){
                tableUi.initBootstrapTableStyle();
                // 记录列筛选项
                var optData = app.data.table.bootstrapTable('getHiddenColumns');
                var opt = [];
                if(optData && optData.length > 0){
                    optData.map(function(e){
                        opt.push(e.field)
                    })
                }
                cacheLocalstorage.setCache('tableOpt' + tableUi.data.linkName,opt)
                authoritys.useAuthority();
            },
            onLoadError: function(result,resultXHR){
                if(result == 401){
					if(resultXHR.responseJSON.body.error == "invalid_token"){
                        utils.reRegister();
                    }
	        	}else if(result == 403){
	        		var accessToken = utils.cookie.getCookie('accessToken');
                    if(!accessToken || accessToken == ''){
                        utils.reRegister();
                    }else{
                        toastr.error("权限不足，不允许访问...")
                    }
                }else{
                    toastr.error(resultXHR.responseJSON.body.message || '系统异常,请稍候重试或联系开发人员...');
                }
            }
        },
        tableOption_list:{
            cache: false,
            sortable: false,
            height: 1,
            sidePagination: "server",
            clickToSelect : true,
            templateView : false,
            showColumns : true,
            showHeader : true,
            totalField: 'body',
            dataField: 'body',
            queryParamsType : 'page' ,
            queryParams : function(params){
                return Object.assign(params, tools.getParams());
            },
            onColumnSwitch: function(){
                tableUi.initBootstrapTableStyle();
                // 记录列筛选项
                var optData = app.data.table.bootstrapTable('getHiddenColumns');
                var opt = [];
                if(optData && optData.length > 0){
                    optData.map(function(e){
                        opt.push(e.field)
                    })
                }
                cacheLocalstorage.setCache('tableOpt' + tableUi.data.linkName,opt)
                authoritys.useAuthority();
            },
            onLoadError: function(result,resultXHR){
                if(result == 401){
					if(resultXHR.responseJSON.body.error == "invalid_token"){
                        utils.reRegister();
                    }
	        	}else if(result == 403){
                    var accessToken = utils.cookie.getCookie('accessToken');
                    if(!accessToken || accessToken == ''){
                        utils.reRegister();
                    }else{
                        toastr.error("权限不足，不允许访问...")
                    }
                }else{
                    toastr.error('系统异常,请稍候重试或联系开发人员...');
                }
            }
        }
    },
    showSearchView: function () {
        $('#toolbar').toggle()
        $('.searchOpen').find('i').toggleClass('fa-angle-double-down fa-angle-double-up')
        tableUi.initBootstrapTableStyle();
    },
    initTabMixTable: function(table){
        tableUi.initHideColumn(table);
        tableUi.initTabMixTableStyle(table);
    },
    initBootstrapTable: function(){
        tableUi.initHideColumn();
        tableUi.initBootstrapTableStyle();
    },
    initTabMixTableStyle: function(table){
        var parentTab = table.parents('.tab-pane');
        if($('.tab-pane > .btn-group').length > 0){
            parentTab.children('.bootstrap-table').css({'height':'calc(100% - ' + parentTab.children('.btn-group').outerHeight(true) + 'px)'});
            if(parentTab.children('.bootstrap-table').find('.fixed-table-pagination').css('display') != 'none'){
                parentTab.children('.bootstrap-table').find('.fixed-table-container').css({'height':'calc(100% - ' + parentTab.find('.fixed-table-container .fixed-table-pagination').outerHeight(true) + 'px)','padding-bottom': '41px'});
            }else{
                parentTab.children('.bootstrap-table').find('.fixed-table-container').css({'height':'100%'})
            }
        }else{
            parentTab.children('.bootstrap-table').css({'height':'100%'});
            parentTab.children('.bootstrap-table').find('.fixed-table-container').css({'height':'calc(100% - 54px)','padding-bottom': '41px'})
        }
    },
    initBootstrapTableStyle: function(){
        var mainTable = $('.panel .panel-body .bootstrap-table');
        if($('#toolbar').length == 0){
            $('.panel .panel-body').css({'padding-bottom': '10px'})
            mainTable.css({'height':'100%'});
            mainTable.find('.fixed-table-container').css({'height':'calc(100% - '+mainTable.find('.fixed-table-container .fixed-table-pagination').outerHeight(true)+'px)'});
        }else{
            if($('#toolbar').css('display') != 'none'){
                mainTable.css({'height':'calc(100% - '+$('#toolbar').outerHeight(true)+'px)'});
            }else{
                mainTable.css({'height':'100%'});
            }
            $('.panel .panel-body').css({'height':'calc(100% - '+$('.panel-heading').outerHeight(true)+'px)'});
            mainTable.find('.fixed-table-container').css({'height':'calc(100% - '+mainTable.find('.fixed-table-container .fixed-table-pagination').outerHeight(true)+'px)'});
        }
    },
    initHideColumn: function(table){
        var _table = table || app.data.table;
        // 根据历史存入的数据渲染,根绝用户习惯渲染指定列,全部订单页
        var tableOpt = cacheLocalstorage.getCache('tableOpt' + tableUi.data.linkName);
        if(tableOpt && tableOpt.length > 0){
            tableOpt.map(function(e){
                _table.bootstrapTable('hideColumn',e);
            })
        }
    }
}

var tools = {
    $dom:{
        toolbar: $('#toolbar')
    },
    test:{
        webSite: function(site){
            return /^https?:\/\/(([a-zA-Z0-9_-])+(\.)?)*(:\d+)?(\/((\.)?(\?)?=?&?[a-zA-Z0-9_-](\?)?)*)*$/i.test(site);
        },
    },
    exec:{
        upperString: function(string){
            return /[A-Z]/g.exec(string).index;
        },
        formatData: function(data, pid, level){
            var level = level;
            if(pid == null){level = 0}
            level++;
            for(var i = 0; i < data.length; i++){
                data[i]['level'] = level;
                data[i]['text'] = data[i]['name'];
                if(data[i].adminCategories && data[i].adminCategories.length > 0){
                    data[i]['children'] = data[i].adminCategories;
                    data[i]['state'] = 'closed';
                    tools.exec.formatData(data[i].adminCategories, data[i].id, level)
                }
            }
        },
    },
    renderSelect:{
        storageType:function(select){
            var storageTypeData = cacheSessionStorage.getCache('storageType');
            if(!storageTypeData || !storageTypeData.length > 0){
                $.ajax({
                    type: "GET",
                    url: utils.prePath() + "/api/admin/erp/storehouse/storageType",
                    async: false,
                    success: function (result) {
                        if (result.statusCode == 'OK') {
                            cacheSessionStorage.setCache('storageType',result.body);
                            storageTypeData = result.body;
                        } else {
                            toastr.error((result.body && result.body.message) ? result.body.message : '系统异常,请稍候重试或联系开发人员...');
                        }
                    }
                });
            }
            var optHtml = '';
            storageTypeData.map(function(e){
                optHtml += '<option value="'+e.id+'" data-subtext="' + e.comments + '">' + e.name + '</option>';
            })
            $(select).html(optHtml).selectpicker();
        },
        undeliveredType:function(select){
            var undeliveredTypeData = cacheSessionStorage.getCache('undeliveredType');
            if(!undeliveredTypeData || !undeliveredTypeData.length > 0){
                $.ajax({
                    type: "GET",
                    url: utils.prePath() + "/api/admin/erp/delivery/undelivered/type",
                    async: false,
                    success: function (result) {
                        if (result.statusCode == 'OK') {
                            cacheSessionStorage.setCache('undeliveredType',result.body);
                            undeliveredTypeData = result.body;
                        } else {
                            toastr.error((result.body && result.body.message) ? result.body.message : '系统异常,请稍候重试或联系开发人员...');
                        }
                    }
                });
            }
            var optHtml = '<option value="">全部问题类型</option>';
            undeliveredTypeData.map(function(e){
                optHtml += '<option value="'+e.type+'" >' + e.desc + '</option>';
            })
            $(select).html(optHtml).selectpicker();
        },
        organizes:function(select, name, havMultiple, width, disabled){
            var status = disabled ? 'disabled="disabled"' : '' // 是否禁止选择
            if($(select || '#toolbar').find('select[name="' + (name || 'organizes') + '"]').length > 0){return}
            var havMultipleState = havMultiple == undefined ? true : havMultiple;
            tools.initAjaxData('organizes', "/api/admin/product/organizes", function(organizesData){
                var optHtml = '';
                organizesData.map(function(e){optHtml += '<option value="' + e + '">' + e + '</option>';});
                var html = '<select ' + ((havMultipleState) ? 'multiple' : '') + ' class="selectpicker" data-live-search="true" name="' + (name || 'organizes') + '" data-width="' + (width || '150px') + '" data-title="商品分组"' + status + '>' + optHtml + '</select>';
                $(select || '#toolbar').prepend(html).find('select[name="' + (name || 'organizes') + '"]').selectpicker();
            });
        },
        supplier:function(selectname, allopt){
            $('.ajaxpicker[name="'+selectname+'"]').html(`
                <input name="supplierName" type="text" class="ajaxpicker-input" disabled placeholder="供应商名称">
                <input name="supplierId" type="text" class="ajaxpicker-input hide" disabled style="display: none;">
                <div class="ajaxpicker-box">
                    ${allopt == true ? '' : '<button class="ajaxpicker-all btn btn-info btn-sm">全部供应商</button>'}
                    <input type="text" class="ajaxpicker-search">
                    <div class="ajaxpicker-ul">
                        <span>请输入关键词搜索</span>
                    </div>
                </div>
            `)
            $('.ajaxpicker[name="'+selectname+'"]').on('click', function(){
                $('.ajaxpicker[name="'+selectname+'"] .ajaxpicker-box').show()
                return false
            })
            $('.ajaxpicker[name="'+selectname+'"] .ajaxpicker-search').keyup(function(event){
                if(event.keyCode ==13){
                    var supplierName = $(this).val().trim()
                    if(supplierName == ''){
                        return
                    }
                    $.ajax({
                        type: "GET",
                        url: utils.prePath() + "/api/admin/erp/supplier?sortOrder=asc&size=30&page=0&supplierName=" + supplierName,
                        success : function(result){
                            if(result.statusCode == 'OK'){
                                if(result.body.content.length == 0){
                                    toastr.warning('未查询到...');
                                }
                                if(result.body.totalElements > 30){
                                    toastr.info('如果没查到，请精确查询条件...');
                                }
                                app.data.supplier = result.body.content
                                var optHtml = ''
                                app.data.supplier.map(function(e,i){
                                    optHtml += '<span data-id="'+e.id+'" data-name="'+e.supplier_name+'">' + e.supplier_name + '</span>';
                                })
                                // 选择
                                $('.ajaxpicker[name="'+selectname+'"] .ajaxpicker-box .ajaxpicker-ul').html(optHtml).find('span').on('click', function(){
                                    var value = $(this).attr('data-name')
                                    var id = $(this).attr('data-id')
                                    $(this).addClass('active').siblings().removeClass('active')
                                    $('.ajaxpicker[name="'+selectname+'"] input[name="supplierId"]').val(id)
                                    $('.ajaxpicker[name="'+selectname+'"] input[name="supplierName"]').val(value)
                                    $('.ajaxpicker[name="'+selectname+'"] .ajaxpicker-box').hide()
                                    return false
                                })
                            }else{
                                toastr.error((result.body && result.body.message) ? result.body.message : '系统异常,请稍候重试或联系开发人员...');
                            }
                        }
                    });
                }
                return false
            });
            $('.ajaxpicker[name="'+selectname+'"] .ajaxpicker-all').on('click', function(){
                $('.ajaxpicker[name="'+selectname+'"] input[name="supplierId"]').val('')
                $('.ajaxpicker[name="'+selectname+'"] input[name="supplierName"]').val('')
                $('.ajaxpicker[name="'+selectname+'"] .ajaxpicker-box').hide()
                return false
            })
            $(document).on('click', function(){
                $('.ajaxpicker[name="'+selectname+'"] .ajaxpicker-box').hide()
            })
        },
        supplierOut:function(select){
            $.ajax({
                type: "GET",
                url: utils.prePath() + "/api/admin/erp/purchased/pending/supplier/list",
                async: false,
                success : function(result){
                    if(result.statusCode == 'OK'){
                        var optHtml = '<option value="">缺货供应商</option>';
                        result.body.map(function(e,i){
                            optHtml += '<option value="'+e.id+'" data-subtext="' + (e.supplierCode || '') + '">' + e.supplierName + '</option>';
                        })
                        $(select).html(optHtml).selectpicker();
                    }else{
                        toastr.error((result.body && result.body.message) ? result.body.message : '系统异常,请稍候重试或联系开发人员...');
                    }
                }
            });
        },
        storehouse:function(select, defaultValState){
            var storehouseId = tools.findUserInStore();
            var storehouseData = cacheSessionStorage.getCache('storehouse');
            if(!storehouseData || !storehouseData.length > 0){
                $.ajax({
                    type: "GET",
                    url: utils.prePath() + "/api/admin/erp/storehouse",
                    async: false,
                    success : function(result){
                        if(result.statusCode == 'OK'){
                            cacheSessionStorage.setCache('storehouse',result.body);
                            storehouseData = result.body;
                        }else{
                            toastr.error((result.body && result.body.message) ? result.body.message : '系统异常,请稍候重试或联系开发人员...');
                        }
                    }
                });
            };
            var optHtml = '<option value="">全部仓库</option>';
            storehouseData.map(function(e){
                optHtml += '<option value="'+e.id+'" data-subtext="' + e.comments + '">' + e.storehouseName + '</option>';
            });
            if(defaultValState == undefined || defaultValState == false){
                $(select).html(optHtml).selectpicker();
            }else{
                $(select).html(optHtml).selectpicker('val', storehouseData[1].storehouseName);
            }
            if(storehouseId){
                $(select).selectpicker('val', storehouseId).parent().hide();
            }else{
                $(select).parent().show();
            }
        },
        scope:function(select, status){
            var scopeData = cacheSessionStorage.getCache('scope');
            if(!scopeData || !scopeData.length > 0){
                $.ajax({
                    type: "GET",
                    url: utils.prePath() + "/api/admin/scope/list",
                    async: false,
                    success: function(result){
                        if(result.statusCode == 'OK'){
                            cacheSessionStorage.setCache('scope',result.body.content);
                            scopeData = result.body.content;
                        }else{
                            toastr.error((result.body && result.body.message) ? result.body.message : '系统异常,请稍候重试或联系开发人员...');
                        }
                    }
                });
            }
            var optHtml = status != 'no' ? '<option value="">全部商城</option>' : '';
            scopeData.map(function(e,i){
                optHtml += '<option value="'+e.id+'" data-subtext="' + e.domains + '">' + e.name + '</option>';
            })
            $(select).html(optHtml).selectpicker();
        },
        sale:function(select){
            var optHtml = `<option value="">营销模式</option><option value="clean">出清</option><option value="multiple">多件</option>`
            $(select).html(optHtml).selectpicker()
        },
        returnsProValue:function(select, type){
            var data = cacheSessionStorage.getCache(type);
            if(!data || !data.length > 0 || data[1] == null){
                $.ajax({
                    type: "GET",
                    url: utils.prePath() + "/api/admin/erp/rc/select/" + type,
                    async: false,
                    success: function(result){
                        if(result.statusCode == 'OK'){
                            cacheSessionStorage.setCache(type, result.body);
                            data = result.body;
                        }else{
                            toastr.error((result.body && result.body.message) ? result.body.message : '系统异常,请稍候重试或联系开发人员...');
                        }
                    }
                });
            }
            var optHtml = '';
            data.map(function(e,i){
                if(e != null){
                    optHtml += '<option value="' + e + '">' + e + '</option>';
                }
            })
            $(select).html(optHtml).selectpicker();
        },
        blackReson:function(select){
            var data = cacheSessionStorage.getCache('blackReson');
            if(!data || !data.length > 0 || data[1] == null){
                $.ajax({
                    type: "GET",
                    url: utils.prePath() + "/api/admin/erp/order/approval/reson",
                    async: false,
                    success: function(result){
                        if(result.statusCode == 'OK'){
                            cacheSessionStorage.setCache('blackReson', result.body);
                            data = result.body;
                        }else{
                            toastr.error((result.body && result.body.message) ? result.body.message : '系统异常,请稍候重试或联系开发人员...');
                        }
                    }
                });
            }
            var optHtml = '<option value="">全部过滤状态</option>';
            data.map(function(e,i){
                if(e != null){
                    optHtml += '<option value="' + e + '">' + e + '</option>';
                }
            })
            $(select).html(optHtml).selectpicker();
        },
        // permission:function(select){
        //     var data = cacheSessionStorage.getCache('permission');
        //     if(!data || !data.length > 0){
        //         $.ajax({
        //             type: "GET",
        //             url: utils.prePath() + "/api/admin/authority",
        //             async: false,
        //             success: function(result){
        //                 if(result.statusCode == 'OK'){
        //                     cacheSessionStorage.setCache('permission', result.body);
        //                     data = result.body;
        //                 }else{
        //                     toastr.error((result.body && result.body.message) ? result.body.message : '系统异常,请稍候重试或联系开发人员...');
        //                 }
        //             }
        //         });
        //     }
        //     var optHtml = '';
        //     data.map(function(e,i){
        //         if(e != null){
        //             optHtml += '<option value="' + e.id + '">' + e.name + '</option>';
        //         }
        //     })
        //     $(select).html(optHtml).selectpicker();
        // },
        roleData:function(select){
            var data = cacheSessionStorage.getCache('roleData');
            if(!data || !data.length > 0){
                $.ajax({
                    type: "GET",
                    url: utils.prePath() + "/api/admin/role/list",
                    async: false,
                    success: function(result){
                        if(result.statusCode == 'OK'){
                            cacheSessionStorage.setCache('roleData', result.body);
                            data = result.body;
                        }else{
                            toastr.error((result.body && result.body.message) ? result.body.message : '系统异常,请稍候重试或联系开发人员...');
                        }
                    }
                });
            }
            var optHtml = '';
            data.map(function(e,i){
                if(e != null){
                    optHtml += '<option value="' + e.id + '">' + e.name + '</option>';
                }
            })
            $(select).html(optHtml).selectpicker();
        },
        agency:function(select){
            var data = cacheSessionStorage.getCache('agency');
            if(!data || !data.length > 0){
                $.ajax({
                    type: "GET",
                    url: utils.prePath() + "/api/admin/erp/finance/agency",
                    async: false,
                    success: function(result){
                        if(result.statusCode == 'OK'){
                            cacheSessionStorage.setCache('agency', result.body);
                            data = result.body;
                        }else{
                            toastr.error((result.body && result.body.message) ? result.body.message : '系统异常,请稍候重试或联系开发人员...');
                        }
                    }
                });
            }
            var optHtml = '<option value="">全部货代</option>';
            data.map(function(e,i){
                if(e != null){
                    optHtml += '<option value="' + e + '">' + e + '</option>';
                }
            })
            $(select).html(optHtml).selectpicker();
        },
        depletionPrice: function(select){
            var optHtml = '';
            [{value:'设置为',num:'10'},
            {value:'sku价减去',num:'20'},
            {value:'sku打折',num:'30'}].map(function(e,i){
                optHtml += '<option value="'+e.num+'">' + e.value + '</option>';
            })
            $(select).html(optHtml).selectpicker();
        },
        depletionRange: function(select){
            var optHtml = '';
            [{value:'全部商品',num:''},
            {value:'全部出清',num:'0'},
            {value:'出清 - 未开始',num:'10'},
            {value:'出清 - 进行中',num:'20'},
            {value:'出清 - 已结束',num:'30'}].map(function(e,i){
                optHtml += '<option value="'+e.num+'">' + e.value + '</option>';
            })
            $(select).html(optHtml).selectpicker();
        },
        agencyCompany: function (select) {
            var optHtml = '';
            [{value:'全部货代公司',num:''},
            {value:'天鸟',num:'天鸟'},
            {value:'尚为（备选）',num:'尚为'}].map(function(e,i){
                optHtml += '<option value="'+e.num+'">' + e.value + '</option>';
            })
            $(select).html(optHtml).selectpicker();
        },
        storehouseId: function (select) {
            var optHtml = '';
            [{value:'全部仓库',num:''},
            {value:'西安仓',num:'8'},
            {value:'台湾仓',num:'9'},
            {value:'深圳仓（备选）',num:'10'}].map(function(e,i){
                optHtml += '<option value="'+e.num+'">' + e.value + '</option>';
            })
            $(select).html(optHtml).selectpicker();
        },
        carrierCode : function (select) {
            var optHtml = '';
            [{value:'全部快递类别',num:''},
            {value:'新竹',num:'hct'},
            {value:'711',num:'qi-eleven'}].map(function(e,i){
                optHtml += '<option value="'+e.num+'">' + e.value + '</option>';
            })
            $(select).html(optHtml).selectpicker();
        },
        paybackStatus : function (select) {
            var optHtml = '';
            [{value:'全部回款状态',num:''},
            {value:'已回款',num:'1'},
            {value:'未回款',num:'2'},
            {value:'无需回款',num:'3'},
            {value:'信用卡/换货',num:'4'}].map(function(e,i){
                optHtml += '<option value="'+e.num+'">' + e.value + '</option>';
            })
            $(select).html(optHtml).selectpicker();
        },
        paybackConsistent : function (select) {
            var optHtml = '';
            [{value:'全部金额状态',num:''},
            {value:'金额一致',num:'1'},
            {value:'金额不一致',num:'2'}].map(function(e,i){
                optHtml += '<option value="'+e.num+'">' + e.value + '</option>';
            })
            $(select).html(optHtml).selectpicker();
        },
        // 全部退款方式
        refundType: function (select){
            var optHtml = '';
            [{value:'全部退款方式',num:''},
            {value:'线上',num:'线上'},
            {value:'店退',num:'店退'}].map(function(e,i){
                optHtml += '<option value="'+e.num+'">' + e.value + '</option>';
            })
            $(select).html(optHtml).selectpicker();
        },
        // 选择时间方式
        dateType: function (select) {
            var optHtml = '';
            [{value:'发货时间',num:'2'},
            {value:'物流确认时间',num:'1'},
            {value:'下单时间',num:'3'}].map(function(e,i){
                optHtml += '<option value="'+e.num+'">' + e.value + '</option>';
            })
            $(select).html(optHtml).selectpicker();
        },
        // 全部支付方式
        paymentType:function(select){
            var optHtml = '<option value="">全部付款类型</option>';
            [{value:'到付',num:'1'},
            {value:'PayPal',num:'2'},
            {value:'信用卡',num:'3'}].map(function(e,i){
                optHtml += '<option value="'+e.num+'">' + e.value + '</option>';
            })
            $(select).html(optHtml).selectpicker();
        },
        product: function(select){
            var optHtml = '';
            [{value:'全部产品状态',num:''},
            {value:'失败品',num:'-1'},
            {value:'已创建',num:'1'},
            {value:'创建中',num:'0'},
            {value:'已上架',num:'10'},
            {value:'已下架',num:'20'}].map(function(e,i){
                optHtml += '<option value="'+e.num+'">' + e.value + '</option>';
            })
            $(select).html(optHtml).selectpicker();
        },
        delivery:function(select){
            var optHtml = '';
            [{value:'全部发货单状态',num:''},
            {value:'待发货',num:'10'},
            {value:'待拣货',num:'13'},
            {value:'待确认',num:'16'},
            {value:'已发货',num:'20'},
            {value:'已签收',num:'30'},
            {value:'拒收',num:'40'},].map(function(e,i){
                optHtml += '<option value="'+e.num+'">' + e.value + '</option>';
            })
            $(select).html(optHtml).selectpicker();
        },
        column:function(select){
            var optHtml = '';
            [{value:'价格',num:'10'},
            {value:'电话',num:'20'},
            {value:'姓名',num:'30'},
            {value:'地址',num:'40'},
            {value:'留言',num:'50'}].map(function(e,i){
                optHtml += '<option value="'+e.num+'">' + e.value + '</option>';
            })
            $(select).html(optHtml).selectpicker();
        },
        audit:function(select){
            var optHtml = '';
            [{value:'等于',num:'10'},
            {value:'包含',num:'20'},
            {value:'小于',num:'30'},
            {value:'大于',num:'40'},
            {value:'不为空',num:'50'}].map(function(e,i){
                optHtml += '<option value="'+e.num+'">' + e.value + '</option>';
            })
            $(select).html(optHtml).selectpicker();
        },
        orderStatusStr:function(select){
            var optHtml = '';
            [{value:'掛起',num:'-30'},
                {value:'未審過',num:'-20'},
                {value:'已取消',num:'-10'},
                {value:'客户取消',num:'-5'},
                {value:'待稽核',num:'5'},
                {value:'備貨中',num:'25'},
                {value:'配送中',num:'30'},
                {value:'已完成',num:'50'},].map(function(e,i){
                optHtml += '<option value="'+e.num+'">' + e.value + '</option>';
            })
            $(select).html(optHtml).selectpicker();
        },
        orderStatus:function(select){
            var optHtml = '<option value="">全部订单状态</option>';
            [{value:'掛起',num:'-30'},
                {value:'未審過',num:'-20'},
                {value:'已取消',num:'-10'},
                {value:'客户取消',num:'-5'},
                {value:'待稽核',num:'5'},
                {value:'備貨中',num:'25'},
                {value:'配送中',num:'30'},
                {value:'已完成',num:'50'},].map(function(e,i){
                optHtml += '<option value="'+e.num+'">' + e.value + '</option>';
            })
            $(select).html(optHtml).selectpicker();
        },
        orderProStatus:function(select){
            var optHtml = '<option value="">全部SKU状态</option>';
            [{value:'掛起',num:'-40'},
            {value:'拒收',num:'-30'},
            {value:'未审过',num:'-20'},
            {value:'已取消',num:'-10'},
            {value:'客户取消',num:'-5'},
            {value:'待審核',num:'10'},
            {value:'配送中',num:'20'},
            {value:'待打包',num:'30'},
            {value:'待出庫',num:'40'},
            {value:'待簽收',num:'50'},
            {value:'已簽收',num:'60'},].map(function(e,i){
                optHtml += '<option value="'+e.num+'">' + e.value + '</option>';
            })
            $(select).html(optHtml).selectpicker();
        },
        trackerStatus:function(select,multiple){
            if(multiple == true){
                var optHtml = '';
            }else{
                var optHtml = '<option value="">全部货运状态</option>';
            }
            [{value:'查询中',num:'pending'},
            {value:'查询不到',num:'notfound'},
            {value:'运输途中',num:'transit'},
            {value:'到达待取',num:'pickup'},
            {value:'成功签收',num:'delivered'},
            {value:'投递失败',num:'undelivered'},
            {value:'可能异常',num:'exception'},
            {value:'其他状态',num:'other'},
            {value:'运输过久',num:'expired'},
            {value:'查询超时',num:'null'},].map(function(e,i){
                optHtml += '<option value="'+e.num+'">' + e.value + '</option>';
            })
            $(select).html(optHtml).selectpicker();
        },
        payment:function(select){
            var optHtml = '<option value="">全部付款类型</option>';
            [{value:'到付',num:'1'},
            {value:'PayPal',num:'2'},
            {value:'信用卡',num:'3'}].map(function(e,i){
                optHtml += '<option value="'+e.num+'">' + e.value + '</option>';
            })
            $(select).html(optHtml).selectpicker();
        },
        purchasedStatus:function(select){
            var optHtml = '<option value="">全部采购单状态</option>';
            [{value:'已完成',num:'10'},
            {value:'进行中',num:'20'}].map(function(e,i){
                optHtml += '<option value="'+e.num+'">' + e.value + '</option>';
            })
            $(select).html(optHtml).selectpicker();
        },
        returnStatus: function(select){
            var optHtml = '<option value="">全部退换货状态</option>';
            [{value:'处理中',num:'0'},
            {value:'已完成',num:'1'}].map(function(e,i){
                optHtml += '<option value="'+e.num+'">' + e.value + '</option>';
            })
            $(select).html(optHtml).selectpicker();
        },
        deliveryProductStatus: function(select){
            var optHtml = '<option value="">全部售后状态</option>';
            [{value:'未售后',num:'0'},
            {value:'已售后',num:'-10'}].map(function(e,i){
                optHtml += '<option value="'+e.num+'">' + e.value + '</option>';
            })
            $(select).html(optHtml).selectpicker();
        },
        settlementStatus: function(select){
            var optHtml = '<option value="">全部对账状态</option>';
            [{value:'未对账',num:'0'},
            {value:'已确认',num:'10'},
            {value:'存在异常',num:'-10'}].map(function(e,i){
                optHtml += '<option value="'+e.num+'">' + e.value + '</option>';
            })
            $(select).html(optHtml).selectpicker();
        },
        categoryTree: function(select, chooseEnd){
            // chooseEnd 只允许选择叶子节点
            // var categoryData = tools.initAjaxData('category', "/api/admin/erp/category/tree");
            // tools.exec.formatData(categoryData, null);
            // if(!chooseEnd){
            //     categoryData = [{
            //         'level': 1,
            //         'id': '',
            //         'text': '全部分类',
            //     }].concat(categoryData)
            // }
            // $(select).combotree({
            //     onBeforeSelect: function(node){
            //         if(chooseEnd){
            //             if(node.children && node.children.length != 0){
            //                 toastr.warning('分类只能从叶子节点中选择...')
            //                 return false;
            //             }
            //         }
            //     }
            // });
            // $(select).combotree('loadData', categoryData);
            $(select).combotree({
                url: utils.prePath() + "/api/admin/erp/category/tree",
                method: 'GET',
                loadFilter: function(data){
                    var menu_data = data.body
                    tools.exec.formatData(menu_data, null);
                    if(!chooseEnd){
                        menu_data = [{
                            'level': 1,
                            'id': '',
                            'text': '全部分类',
                        }].concat(menu_data)
                    }
                    return menu_data;
                },
                onBeforeSelect: function(node){
                    if(chooseEnd){
                        if(node.children && node.children.length != 0){
                            toastr.warning('分类只能从叶子节点中选择...')
                            return false;
                        }
                    }
                }
            });
        }
    },
    formatterFunction:{
        handleStatus: function(value){
            var mes = '--',
                stateColor = '';
            switch (value) {
                case -10: mes = '拒绝';stateColor = 'label-danger';break;
                case -20: mes = '已撤销';stateColor = 'label-default';break;
                case -30: mes = '已删除';stateColor = 'text-danger';break;
                case 10: mes = '处理中';stateColor = 'label-info';break;
                case 20: mes = '通过';stateColor = 'label-success';break;
                case 30: mes = '待退回';stateColor = 'label-warning';break;
                case 40: mes = '已退回';stateColor = 'label-success';break;
            }
            return '<span class="label ' + stateColor + '">' + mes + '</span>';
        },
        proStatus: function(value){
            var mes = '--',
                stateColor = '';
            switch (value) {
                case -1: mes = '失败品';stateColor = 'label-warning';break;
                case 1: mes = '已创建';stateColor = 'label-info';break;
                case 0: mes = '创建中';stateColor = 'label-info';break;
                case 10: mes = '已上架';stateColor = 'label-info';break;
                case 20: mes = '已下架';stateColor = 'label-danger';break;
            }
            return '<span class="label ' + stateColor + '">' + mes + '</span>';
        },
        putStatus: function(value){
            var mes = '--',
                stateColor = '';
            switch (value) {
                case 0: mes = '未投放';stateColor = 'label-danger';break;
                case 1: mes = '已投放';stateColor = 'label-info';break;
            }
            return '<span class="label ' + stateColor + '">' + mes + '</span>';
        },
        orderProStatus: function(value, realNum){
            var mes = '--',
                stateColor = '';
            switch (value - 0){
                case -40: mes = '掛起';stateColor = 'label-warning';break;
                // case -40: mes = '退貨';stateColor = 'label-warning';break;
                case -30: mes = '拒收';stateColor = 'label-warning';break;
                case -20: mes = '未審過';stateColor = 'label-default';break;
                case -10: mes = '已取消';stateColor = 'label-default';break;
                case -5: mes = '客户取消';stateColor = 'label-default';break;
                case 10: mes = '待審核';stateColor = 'label-primary';break;
                case 20:
					if(realNum && realNum > 0){
						mes = '有貨';stateColor = 'label-success';
					}else{
						mes = '缺貨';stateColor = 'label-info';
					}
					break;
                case 30: mes = '待打包';stateColor = 'label-danger';break;
                case 40: mes = '待出庫';stateColor = 'label-info';break;
                case 50: mes = '待簽收';stateColor = 'label-success';break;
                case 60: mes = '已簽收';stateColor = 'label-success';break;
            }
            return '<span class="label ' + stateColor + '">' + mes + '</span>';
        },
        orderStatus: function(value){
            var mes = '--',
                stateColor = '';
            switch (value - 0) {
                case -30: mes = '掛起';stateColor = 'label-warning';break;
                case -20: mes = '未審過';stateColor = 'label-default';break;
                case -10: mes = '已取消';stateColor = 'label-default';break;
                case -5: mes = '客户取消';stateColor = 'label-default';break;
                case 5: mes = '待稽核';stateColor = 'label-primary';break;
                case 25: mes = '備貨中';stateColor = 'label-info';break;
                case 30: mes = '配送中';stateColor = 'label-info';break;
                case 50: mes = '已完成';stateColor = 'label-success';break;
                // 历史订单
                case 0: mes = '旧-已提交';stateColor = 'label-primary old';break;
                case 10: mes = '旧-已审核';stateColor = 'label-primary old';break;
                case 20: mes = '旧-待分仓';stateColor = 'label-warning old';break;
                case 21: mes = '旧-已分仓';stateColor = 'label-primary old';break;
                case 35: mes = '旧-已出库';stateColor = 'label-info old';break;
                case 40: mes = '旧-已发货';stateColor = 'label-info old';break;
                default: mes = '未知狀態';stateColor = 'label-default';break;
            }
            return '<span class="label ' + stateColor + '">' + mes + '</span>';
        },
        trackerStatus: function(value){
            var stateVal = '--';
            switch(value){
                case "pending" : stateVal =  "查询中";break;
                case "notfound" : stateVal =  "查询不到";break;
                case "transit" : stateVal =  "运输途中";break;
                case "pickup" : stateVal =  "到达待取";break;
                case "delivered" : stateVal =  "成功签收";break;
                case "undelivered" : stateVal =  "投递失败";break;
                case "exception" : stateVal =  "可能异常";break;
                case "other" : stateVal =  "其他状态";break;
                case "expired" : stateVal =  "运输过久";break;
                case "null" : stateVal =  "查询超时";break;
            }
            return stateVal;
        },
        deliveryStatus: function(value){
            var stateVal = '--',
                stateColor = '';
            switch(value - 0){
                case 10 : stateVal =  "待发货";stateColor = 'label-primary';break;
                case 20 : stateVal =  "已发货";stateColor = 'label-warning';break;
                case 30 : stateVal =  "已签收";stateColor = 'label-success';break;
                case 40 : stateVal =  "拒收";stateColor = 'label-default';break;
            }
            return '<span class="label ' + stateColor + '">' + stateVal + '</span>';
        },
        returnStatus: function(value){
            var stateVal = '--',
                stateColor = '';
            switch(value){
                case 0 : stateVal =  "处理中";stateColor = 'label-warning';break;
                case 1 : stateVal =  "已完成";stateColor = 'label-success';break;
            }
            return '<span class="label ' + stateColor + '">' + stateVal + '</span>';
        },
        paymentStatus: function(value){
            var typeVal = '';
            switch(value){
                case 1: typeVal = "到付";break;
                case 2: typeVal = "PayPal";break;
                case 3: typeVal = "信用卡";break;
                default:console.log('状态错误');break;
            }
            return (value == 1) ? typeVal : '<b style="color: fuchsia;">'+ typeVal +'</b>';
        },
        // returnType: function(value){
        //     var typeVal = '';
        //     switch(value){
        //         case 1: typeVal = "退货";break;
        //         case 2: typeVal = "换货";break;
        //     }
        //     return typeVal;
        // },
        logStatus: function(value){
            var mes = '--',
                stateColor = '';
            switch (value) {
                case 10: mes = '盘点入库';stateColor = 'label-danger';break;
                case 20: mes = '盘点出库';stateColor = 'label-danger';break;
                case 30: mes = '采购入库';stateColor = 'label-info';break;
                case 40: mes = '销售出库';stateColor = 'label-info';break;
            }
            return '<span class="label ' + stateColor + '">' + mes + '</span>';
        },
        deliveryProductStatus: function(value){
            var mes = '--',
                stateColor = '';
            switch (value - 0) {
                case 0: mes = '未售后';stateColor = 'label-info';break;
                case -10: mes = '已售后';stateColor = 'label-danger';break;
            }
            return '<span class="label ' + stateColor + '">' + mes + '</span>';
        },
        settlementStatus: function(value){
            var mes = '--',
                stateColor = '';
            switch (value - 0) {
                case 0: mes = '未对账';stateColor = 'label-info';break;
                case 10: mes = '已确认';stateColor = 'label-success';break;
                case -10: mes = '存在异常';stateColor = 'label-danger';break;
            }
            return '<span class="label ' + stateColor + '">' + mes + '</span>';
        },
        trackingName: function(value){
            var mes = '--';
            switch (value) {
                case 't-cat': mes = '黑猫';break;
                case 'hct': mes = '新竹';break;
                default: mes = (value == null ? '--' : value);break;
            }
            return mes;
        },
        warningDays: function(order_code, days){
            var valColor = '';
            if(days > 5){
                valColor = 'text-danger';
            }else if(days > 3){
                valColor = 'text-warning';
            }else if(days > 1){
                valColor = 'text-success';
            }
            if(days > 1){
                return '<span class="' + valColor + '">' + order_code + '<br>（' + days + '天）' + '</span>';
            }else{
                return '<span class="' + valColor + '">' + order_code + '</span>';
            }
        },
        serviceInfos: function(skuData,i){
            var html = '<ul class="serviceInfoBox">';
            skuData.map(function(e,j){
                var img_html = ''
                e.serviceUserImgs && e.serviceUserImgs.split(',').map(function(e){
                    img_html += '<img src="'+e+'">'
                })
                html += '<li>'+
                    '<span>' + e.productId + '</span>'+
                    '<span>' + e.sourceProductSkuBarcode  + '<br>' + (e.sourceProductSkuName || '') + (e.sourceProductIsLimit == 1 ? '<strong style="padding: 1px 4px; background: red; color: #fff; display: inline-block; margin: 2px; border-radius:4px; font-size: 12px;">限</strong>' : '') + '</span>'+
                    '<span>' + tools.formatterFunction.proImage(e.sourceProductSkuImage) + '</span>'+
                    '<span>' + e.quantity + '</span>'+
                    '<span>' + e.serviceType + '</span>'+
                    '<span>' + (e.serviceDesc || '') + '</span>'+
                    '<span class="imgBox" i="'+i+'" j="'+j+'">' + img_html + '</span>'+
                    '<span>' + tools.formatterFunction.handleStatus(e.handleStatus) + '</span>'+
                    '<span>' + e.sourceDiscountPrice + '</span>'+
                    '<span>' + (e.avgPurchasedPrice ? e.avgPurchasedPrice:'') + '</span>'+
                    '<span>' + (e.productSkuBarcode || '') + '<br>' + (e.productSkuName || '') + '</span>'+
                    '<span>' + (e.productSkuImage ? tools.formatterFunction.proImage(e.productSkuImage) : '') + '</span>'+
                    '</li>';
            });
            html += '</ul>';
            return html;
        },
        skuInfos: function(value, no_pass_reson){
            var skuData = tools.specialStringToArray(value);
            var html = '<ul class="productInfoBox">';
            skuData.map(function(e){
                var highlight = ''
                if (no_pass_reson == '重复订单' && e.repeatCount > 0) {
                    highlight = 'background: beige;'
                }
                html += '<li style="' + highlight + '">'+
                    '<span><label class="fancy-checkbox"><input type="checkbox" class="checkOrderPro" data-orderproid="' + e.order_product_id + '"><span></span></label></span>'+
                    '<span>' + e.product_id + '</span>'+
                    '<span>' + tools.formatterFunction.proImage(e.product_image_url, e.product_id, e.product_title) + '</span>'+
                    '<span style="text-align:left;">' + e.product_title + '（'+e.product_sku_name+'）</span>'+
                    '<span>' + e.product_sku_barcode  + '</span>'+
                    '<span>' + e.quantity + '</span>'+
                    '<span class="money">' + (e.original_price || 0) + '</span>'+
                    '<span class="money">' + (e.coupon_price || 0) + '</span>'+
                    '<span authority="ORDER_WRITE" class="money '+(e.order_product_status > 40 || e.order_product_status < 10 ? '' : 'ediePrice useCkick')+'" data-orderproductid="' + e.order_product_id + '">' + (e.discount_price || 0) + '</span>'+
                    '<span>' + tools.formatterFunction.orderProStatus(e.order_product_status, e.storehouse_inventory - e.pendding_delivery_inventory) + '</span>'+
                    '<span>' + (e.storehouse_inventory || '--') + ' / ' + (e.pendding_delivery_inventory || '--') + ' / ' + (e.purchased_quantity || '--') + '</span>'+
                    '<span>' +
                        (e.order_product_status > 0 && e.order_product_status <= 30 ? '<button authority="ORDER_WRITE" type="button" class="btn btn-danger btn-xs cancelOrderSku" data-ordersku="' + e.order_product_id + '">取消SKU</button>' : '' )+
                    '</span>'+
                '</li>';
            });
            html += '</ul>';
            return html;
        },
        skuInfosAd: function(value, no_pass_reson){
            var skuData = tools.specialStringToArray(value);
            var html = '<ul class="productInfoAdBox">';
            skuData.map(function(e){
                var highlight = ''
                if (no_pass_reson == '重复订单' && e.repeatCount > 0) {
                    highlight = 'background: beige;'
                }
                html += '<li style="' + highlight + '">'+
                    '<span>' + e.product_id + '</span>'+
                    '<span>' + tools.formatterFunction.proImage(e.product_image_url, e.product_id, e.product_title) + '</span>'+
                    '<span style="text-align:left;">' + e.product_title + '（'+e.product_sku_name+'）</span>'+
                    '<span>' + e.product_sku_barcode  + '</span>'+
                    '<span>' + e.quantity + '</span>'+
                    '<span class="money">' + (e.original_price || 0) + '</span>'+
                    '<span class="money">' + (e.coupon_price || 0) + '</span>'+
                    '<span authority="ORDER_WRITE" class="money '+(e.order_product_status > 40 || e.order_product_status < 10 ? '' : 'ediePrice useCkick')+'" data-orderproductid="' + e.order_product_id + '">' + (e.discount_price || 0) + '</span>'+
                    '<span>' + e.source_affiliate_product_id + '</span>' +
                    '<span>' + e.source_affiliate + '</span>' +
                '</li>';
            });
            html += '</ul>';
            return html;
        },
        skuInfosFinance: function(value){
            var skuData = tools.specialStringToArray(value);
            var html = '<ul class="productInfoFinanceBox">';
            skuData.map(function(e){
                console.log(e)
                html += '<li>'+
                    '<span>' + e.product_id + '</span>'+
                    '<span style="text-align:left;">' + e.product_title + '（'+e.product_sku_name+'）</span>'+
                    '<span>' + e.product_sku_barcode  + '</span>'+
                    '<span>' + e.product_quantity + '</span>'+
                    '<span class="money">' + (e.product_discount_total_price || 0) + '</span>'+
                    '<span class="money">' + (e.avg_purchased_price || 0) + '</span>'+
                    '<span class="money">' + (e.product_system_purchase_price || 0) + '</span>'+
                    '<span>' + tools.formatterFunction.orderProStatus(e.order_product_status, e.oldInventory) + '</span>'+
                    '<span>' + tools.formatterFunction.orderProStatus(e.current_order_product_status, e.currentInventory) + '</span>'+
                '</li>';
            });
            html += '</ul>';
            return html;
        },
        skuInfoShort: function(value){
            var skuData = tools.specialStringToArray(value);
            var html = '<ul class="productInfoShortBox">';
            skuData.map(function(e,i){
                html += '<li>'+
                    '<span><label class="fancy-checkbox"><input type="checkbox" class="checkOrderPro" data-j="' + i + '"><span></span></label></span>'+
                    '<span>' + e.product_id + '</span>'+
                    '<span style="text-align:left;">' + e.product_title + '（'+e.product_sku_name+'）</span>'+
                    '<span>' + tools.formatterFunction.proImage(e.o_order_product_img, e.product_id, e.product_title) + '</span>'+
                    '<span>' + e.product_sku_barcode  + '</span>'+
                    '<span>' + e.quantity + '</span>'+
                    '<span class="money">' + (e.discount_price || 0) + '</span>'+
                    '<span>' + tools.formatterFunction.orderProStatus(e.order_product_status) + '</span>'+
                '</li>';
            });
            html += '</ul>';
            return html;
        },
        analysisSku: function(value){
            var skuData = tools.specialStringToArray(value);
            var html = '<ul class="analysisSkuBox">';
            skuData.map(function(e){
                html += '<li>'+
                    '<span>' + e.product_id + '</span>'+
                    '<span style="text-align:left;">' + e.product_title + '（'+e.product_sku_name+'）</span>'+
                    '<span>' + e.product_sku_barcode  + '</span>'+
                    '<span>' + e.product_quantity + '</span>'+
                    '<span class="money">' + e.product_discount_total_price + '</span>'+
                    '<span class="money">' + (e.avg_purchased_price ? (e.avg_purchased_price - 0).toFixed(2) : '--') + '</span>'+
                    '<span class="money">' + (e.product_system_purchase_price || '--') + '</span>'+
                    '<span>' + tools.formatterFunction.orderProStatus(e.order_product_status) + '</span>'+
                '</li>';
            });
            html += '</ul>';
            return html;
        },
        orderSkuInfos: function(value){
            var skuData = tools.specialStringToJson(value);
            var html = '<ul class="orderProductInfoBox">';
            skuData.map(function(e, index){
                var _html = '<ul class="orderProductInfo">';
                e.sku_info.map(function(_e, _index){
                    _html += '<li>'+
                        '<span>' + tools.formatterFunction.proImage(_e.product_sku_img, _e.product_id, _e.product_title) + '</span>'+
                        '<span>' + _e.product_id + '</span>'+
                        '<span>' + _e.product_title + '</span>'+
                        '<span>' + _e.product_sku_barcode + '</span>'+
                        '<span>' + _e.delivery_quantity + '</span>'+
                        '<span>' + _e.product_sku_price + '</span>'+
                        '<span>' + (_e.positions ? _e.positions.replace(/\)\&/g,'\)<br>') : '库位异常') + '</span>'+
                    '</li>';
                })
                _html += '</ul>';
                html += '<li data-index="' + index + '"><span>' + e.order_code + '</span><span>' + _html + '</span></li>';
            });
            html += '</ul>';
            return html;
        },
        rejectOrderSkuInfos: function(value){
            var skuData = tools.specialStringToJson(value);
            var html = '<ul class="orderProductInfoBox">';
            skuData.map(function(e, index){
                var _html = '<ul class="orderProductInfo">';
                e.sku_info.map(function(_e, _index){
                    _html += '<li>'+
                        '<span>' + tools.formatterFunction.proImage(_e.product_sku_img, _e.product_id, _e.product_title) + '</span>'+
                        '<span>' + _e.product_id + '</span>'+
                        '<span>' + _e.product_title + '</span>'+
                        '<span>' + _e.product_sku_barcode + '</span>'+
                        '<span>' + _e.delivery_quantity + '</span>'+
                        '<span>' + _e.product_sku_price + '</span>'+
                        '<span>' + (_e.avg_purchased_price?_e.avg_purchased_price:"") + '</span>'+
                        '<span>' + (_e.positions ? _e.positions.replace(/\)\&/g,'\)<br>') : '库位异常') + '</span>'+
                        '</li>';
                })
                _html += '</ul>';
                html += '<li data-index="' + index + '"><span>' + e.order_code + '</span><span>' + _html + '</span></li>';
            });
            html += '</ul>';
            return html;
        },
        orderSkuInfos1: function(value){
            var skuData = tools.specialStringToJson1(value);
            var html = '<ul class="orderProductInfoBox">';
            skuData.map(function(e, index){
                var _html = '<ul class="orderProductInfo">';
                e.sku_info.map(function(_e, _index){
                    _html += '<li>'+
                        '<span>' + tools.formatterFunction.proImage(_e.product_sku_img, _e.product_id, _e.product_title) + '</span>'+
                        '<span>' + _e.product_id + '</span>'+
                        '<span>' + _e.product_title + '</span>'+
                        '<span>' + _e.product_sku_barcode + '</span>'+
                        '<span>' + _e.delivery_quantity + '</span>'+
                        '<span>' + _e.product_sku_price + '</span>'+
                    '</li>';
                })
                _html += '</ul>';
                html += '<li data-index="' + index + '"><span>' + e.order_code + '</span><span>' + _html + '</span><span><button type="button" class="btn btn-info btn-xs" onclick="app.methods.showHistory(\'' + e.order_code + '\')">查看历史</button></span></li>';            });
            html += '</ul>';
            return html;
        },
        overviewSkuInfos: function(value){
            var skuData = tools.specialStringToArray(value);
            var html = '<ul class="overviewSkuInfoBox">';
            skuData.map(function(e, index){
                html += '<li>'+
                    '<span>' + e.product_sku_barcode + '</span>'+
                    '<span>' + e.product_sku_name + '</span>'+
                    '<span>' + e.product_sku_total + '</span>'+
                '</li>';
            });
            html += '</ul>';
            return html;
        },
        stockSkuInfos: function(skuData, state, isDel){
            if(typeof skuData == 'string'){
                skuData = tools.specialStringToArray(skuData)
            }
            var html = '<ul class="stockInfoBox">';
            skuData.map(function(e,j){
                html += '<li>'
                if(state){
                    html += '<span>' + e.product_id + '</span>'
                }
                html += '<span>' + e.product_sku_barcode + '</span>';
                if(state){
                    html += '<span>' + tools.formatterFunction.proImage(e.product_sku_image) + '</span>'
                }else{
                    html += '<span>' + tools.formatterFunction.proImage(e.product_sku_image, e.product_id, e.product_title) + '</span>'
                }
                html += '<span style="text-align:left;"><span>' + e.product_sku_name + '</span> - ' + (e.product_title ? e.product_title.replace('(','（').replace(')','）') : '') + '</span>'+
                    '<span>' + (e.storaged_quantity || 0) + ' / ' + e.purchased_quantity + '</span>'+
                    '<span class="money">' + e.purchased_price + '</span>'+
                    '<span class="btn-group">';
                    html += '<button type="button" class="btn btn-info btn-xs editOrderSku" data-ordersku="' + e.purchased_product_id + '" data-quantity="' + e.purchased_quantity + '"  data-storaged_quantity="' + e.storaged_quantity + '"><i class="fa fa-edit"></i></button>'
                if(state){
                    if(e.remind_quantitiy > 0){
                        html += '<button type="button" class="btn btn-warning btn-xs cancelOrderSku" data-ordersku="' + e.purchased_product_id + '" data-quantity="' + e.purchased_quantity + '"><i class="fa fa-ban"></i></button>'
                        if(e.storaged_quantity == 0){
                            html += '<button type="button" class="btn btn-danger btn-xs delOrderSku" data-ordersku="' + e.purchased_product_id + '"><i class="fa fa-trash"></i></button>'
                        }
                    }
                }else{
                    if(isDel || e.cancel_reson){
                        html += e.cancel_reson || '缺少原因';
                    }else{
                        // 完成后取消展示
                        if(e.purchased_quantity - (e.storaged_quantity || 0) > 0){
                            html += '<a class="simpleBtn inToSku" style="display:inline;padding-right:16px" data-j="' + j + '" data-skubarcode="' + e.product_sku_barcode + '" data-quantity="' + (e.purchased_quantity - e.storaged_quantity) + '">收货</a>'
                        }
                        html += '<i onclick="tools.printProductTag('+e.product_id+', \''+e.product_sku_name+'\', \''+e.product_title+'\', '+e.product_sku_barcode+');" class="fa fa-print" style="font-size: 18px;"></i>'
                    }
                }
                html += '</span></li>';
            });
            if(skuData.length > 3 && !state){
                html += '<li><button type="button" class="btn btn-info btn-xs btn-block toggleOrder">展开</button></li>';
            }
            if(skuData.length == 0){
                html += '<li style="text-align:center">暂未查到对应数据</li>'
            }
            html += '</ul>';
            return html;
        },
        trackerInfos: function(value){
            var trackerData = tools.specialStringToArray(value);
            var html = '<ul class="trackerInfoBox">';
            trackerData.map(function(e){
                html += '<li>'+
                    '<span>' + (e.delivery_code || '--') + '</span>'+
                    '<span>' + (e.delivery_pack_time?tools.formatterFunction.time(e.delivery_pack_time):'--') + '</span>'+
                    '<span>' + (e.agency_company || '--') + '</span>'+
                    '<span class="showTracking useCkick" delivery_code="'+e.delivery_code+'">' + (e.tracking_number || '--') + '</span>'+
                    '<span class="refreshTracking useCkick">' + tools.formatterFunction.trackerStatus(e.tracker_status)  + '</span>'+
                    '<span>' + (e.last_update_time?tools.formatterFunction.time(e.last_update_time):'--') + '</span>'+
                '</li>';
            });
            html += '</ul>';
            return html;
        },
        trackerInfosShort: function(value){
            var trackerData = tools.specialStringToArray(value);
            var html = '<ul class="trackerInfosShortBox">';
            trackerData.map(function(e){
                html += '<li>'+
                    '<span>' + (e.delivery_code || '--') + '</span>'+
                    '<span>' + (e.tracking_number || '--') + '</span>'+
                    '<span>' + tools.formatterFunction.trackerStatus(e.tracking_status)  + '</span>'+
                    '<span>' + (e.tracking_last_update_time?tools.formatterFunction.time(e.tracking_last_update_time):'--') + (e.tracking_last_event || '--') + '</span>'+
                '</li>';
            });
            html += '</ul>';
            return html;
        },
        trackerInfosSuperShort: function(value){
            var trackerData = tools.specialStringToArray(value);
            var html = '<ul class="trackerInfosShortBox">';
            trackerData.map(function(e){
                html += '<li>'+
                    '<span>' + (e.delivery_code || '--') + '</span>'+
                    '<span class="showTracking1 useCkick" delivery_code="'+e.delivery_code+'">' + (e.tracking_number || '--') + '</span>'+
                    '<span class="refreshTracking1 useCkick">' + tools.formatterFunction.trackerStatus(e.tracker_status)  + '</span>'+
                '</li>';
            });
            html += '</ul>';
            return html;
        },
        expressInfos: function(value){
            var expressData = tools.specialStringToArray(value);
            var html = '<ul class="expressInfoBox">';
            expressData.map(function(e){
                html += '<li>'+
                    '<span>' + (e.express_company || '--') + '</span>'+
                    '<span><a href="https://m.kuaidi100.com/result.jsp?com=shentong&nu=' + e.express_code + '" target="_blank">' + (e.express_code || '--') + '</a></span>';
                if(e.association_id){
                    html += '<span class="btn-group">'+
                        '<button type="button" class="btn btn-info btn-xs editExpress" authority="PURCHASED_WRITE" data-expressid="' + e.express_id + '" data-expresscode="' + e.express_code + '" data-expresscompany="' + e.express_company + '" data-associationid="' + e.association_id + '"><i class="fa fa-edit"></i></button>'+
                        '<button type="button" class="btn btn-danger btn-xs cancelExpress" authority="PURCHASED_WRITE" data-expressid="' + e.express_id + '"><i class="fa fa-trash"></i></button>'+
                    '</span></li>';
                }else{
                    html += '<span></span></li>';
                }
            });
            html += '</ul>';
            return html;
        },
        delivery_tracker_infos: function(value){
            console.log(value)
            var trackerData = JSON.parse(value.replace(/\t/g,''));
            var html = '<ul class="delivery_tracker_infos">';
            trackerData.map(function(e){
                // var _html = '';
                // e.sku_infos.map(function(_e){
                //     _html += '<li>'+
                //         '<span>' + (_e.order_code || '--') + '</span>'+
                //         '<span>' + (_e.product_id || '--') + '</span>'+
                //         '<span>' + ((_e.product_title + _e.product_sku_name) || '--') + '</span>'+
                //         '<span>' + (_e.product_sku_barcode || '--') + '</span>'+
                //         '<span>' + (_e.product_sku_price || '0') + '</span>'+
                //         '<span>' + (_e.delivery_quantity || '0') + '</span>'+
                //         '<span>' + tools.formatterFunction.deliveryProductStatus(_e.delivery_product_status) + '</span>'+
                //     '</li>';
                // });
                html += '<li>'+
                    '<span>' + (e.delivery_code || '--') + '</span>'+
                    '<span class="address_warp">' + tools.formatterFunction.address(e.consignee, (e.tel || ''), (e.email || ''), ((e.city + e.district + e.detail) || '')) + '</span>'+
                    '<span>' + (e.accounts_receivable || '--') + '</span>'+
                    '<span>' + tools.formatterFunction.deliveryStatus(e.delivery_status) + '</span>'+
                    '<span>' + tools.formatterFunction.time(e.delivery_created_at) + '</span>'+
                    // '<span><ul class="delivery_product_infos">' + _html + '</ul></span>'+
                '</li>';
            });
            html += '</ul>';
            return html;
        },
        time: function(value){
            if(value == 'null' || !value){
                return '--';
            }else{
                var time = moment(value).format('YYYY-MM-DD HH:mm:ss');
                // var time = moment(value,'YYYY-MM-DD HH:mm:ss');
                return time;
            }
        },
        dateDiff:function(sDate) { //sDate和eDate是yyyy-MM-dd格式
            let date1 = new Date(sDate);
            let date2 = new Date();
            let date3=date2.getTime()-date1.getTime();
            let days=Math.floor(date3/(24*3600*1000));
            return days;
        },
        proImage: function(src, proId, title){
            if(proId){
                return '<img src="'+src+'" onclick="tools.previewPro('+proId+',this);" alt="'+title+'" class="img-responsive proImage">';
            }else{
                return '<img src="'+src+'" class="img-responsive proImage">';
            }
        },
        address: function(consignee, tel, email, address, index){
            var html = '';
            html += '<ul class="addressBox">'+
                '<li>'+
                    '<span class="nowarp">' + consignee + '</span>'+
                    '<span class="text-primary">' + tel + '</span>'+
                    '<span class="text-muted">' + (email || '') + '</span>'+
                    (index == undefined ? '' : '<span class="addressBoxEdit glyphicon glyphicon glyphicon-edit" aria-hidden="true" authority="ORDER_WRITE" data-index="' + index + '"></span>')+
                '</li>'+
                '<li class="nowarp">' + address + '</li>'+
            '</ul>';
            return html;
        },

		addressText: function(consignee, tel, city, district, detail){
			return '<ul class="addressBox">'+
				'<li>'+
					'<span class="nowarp">' + consignee + '</span>'+
					'<span class="text-primary">' + tel + '</span>'+
				'</li>'+
				'<li class="nowarp">' + city + district + detail + '</li>'+
			'</ul>';
		},
        customerType:function(lastOrderCreatedAt,createOrderCount,direct_cancel){
            if(lastOrderCreatedAt==null || createOrderCount==1){
                let customerTypeHtml= '<p style="padding: 1px 4px; background: orangered; color: #fff; display: inline-block;  border-radius:4px; font-size: 12px;">新用户</p>';
                if(direct_cancel){
                    customerTypeHtml+='<p style="padding: 1px 4px;margin-left: 5px; background: #0c1312; color: #fff; display: inline-block;  border-radius:4px; font-size: 12px;">黑名单</p>';
                }else if(direct_cancel==false){
                    customerTypeHtml+='<p style="padding: 1px 4px;margin-left: 5px; background: #7b7b7b; color: #fff; display: inline-block;  border-radius:4px; font-size: 12px;">灰名单</p>';
                }else if(direct_cancel==null){
                    customerTypeHtml+='<p style="padding: 1px 4px;margin-left: 5px; background: orange; color: #fff; display: inline-block;  border-radius:4px; font-size: 12px;">信用良好</p>';
                }
                return customerTypeHtml;
            }else{
                let time=tools.formatterFunction.time(lastOrderCreatedAt);
                let customerTypeHtml= '<p style="padding: 1px 4px; background: green; color: #fff; display: inline-block; border-radius:4px; font-size: 12px;">老用户</p>';
                if(direct_cancel){
                    customerTypeHtml+='<p style="padding: 1px 4px;margin-left: 5px; background: #0c1312; color: #fff; display: inline-block;  border-radius:4px; font-size: 12px;">黑名单</p>';
                }else if(direct_cancel==false){
                    customerTypeHtml+='<p style="padding: 1px 4px;margin-left: 5px; background: #7b7b7b; color: #fff; display: inline-block;  border-radius:4px; font-size: 12px;">灰名单</p>';
                }else if(direct_cancel==null){
                    customerTypeHtml+='<p style="padding: 1px 4px;margin-left: 5px; background: orange; color: #fff; display: inline-block;  border-radius:4px; font-size: 12px;">信用良好</p>';
                }
                customerTypeHtml+='<p>最近下单：'+time+'</p><p>距今 '+tools.formatterFunction.dateDiff(time)+' 天</p>';
                customerTypeHtml+='<p>下单数：'+createOrderCount+'</p></p>';
                return customerTypeHtml;
            }
        },
    },
    findUserInStore: function(){
        var username = utils.cookie.getCookie('username') + ',';
        var storehouse;
        var storehouseData = cacheSessionStorage.getCache('storehouse');
        if(!storehouseData || storehouseData.length == 0){
            $.ajax({
                type: "GET",
                url: utils.prePath() + "/api/admin/erp/storehouse",
                async: false,
                success : function(result){
                    if(result.statusCode == 'OK'){
                        cacheSessionStorage.setCache('storehouse',result.body);
                        storehouseData = result.body;
                    }else{
                        toastr.error((result.body && result.body.message) ? result.body.message : '系统异常,请稍候重试或联系开发人员...');
                    }
                }
            });
        }
        storehouseData.map(function(e){
            var manager_data = e.manager.toString() + ','
            if(manager_data.indexOf(username) > -1){
                storehouse = e.id;
            }
        });
        return storehouse;
    },
    rangeTime: function(select, initType, justDay, endType){
        var clear = false, initType;
        if(initType == true){
            clear = true;
        }else{
            initType = initType || 'yesterday';
        }
        moment.locale('zh-cn', {
            week : {
             dow : 1
            }
        });
        var timeJson = {
            sevenDaysAgo: moment().subtract(7, 'days').hours(0).minutes(0).second(0),
            yesterday: moment().subtract(1, 'days').hours(0).minutes(0).second(0),
            thisDay: moment().hours(0).minutes(0).second(0),
            thisWeek: moment().startOf('week').hours(0).minutes(0).second(0),
            lastWeek: moment().startOf('week').subtract(7, 'days').hours(0).minutes(0).second(0),
            thisMonth: moment().date(1).hours(0).minutes(0).second(0),
            prevMonth: moment().subtract(1, 'month').startOf('month').hours(0).minutes(0).second(0),
        }
        $(select).daterangepicker({
            "timePicker": justDay ? false : true,
            "timePicker24Hour": true,
            "timePickerIncrement": 10,
            "showDropdowns": true,
            "autoApply": true,
            "startDate": timeJson[initType],
            "endDate": endType ? timeJson[endType] : moment(),
            "locale": {
                "format": justDay ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss',
            },
            "ranges": {
                '今天': [timeJson.thisDay, moment()],
                '昨天': [timeJson.yesterday, timeJson.thisDay],
                '环比昨天': [timeJson.yesterday, moment().subtract(1, 'days')],
                '本周': [timeJson.thisWeek, moment()],
                '上周': [timeJson.lastWeek, timeJson.thisWeek],
                '本月': [timeJson.thisMonth, moment()],
                '上个月': [timeJson.prevMonth, timeJson.thisMonth]
            },
        }).on('cancel.daterangepicker',function(){
            $(select).val('');
        });
        clear && $(select).val('');
    },

    rangeDate: function(select, initType, endType){
        var clear = false, initType;
        if(initType == true){
            clear = true;
        }else{
            initType = initType || 'yesterday';
        }
        moment.locale('zh-cn', {
            week : {
                dow : 1
            }
        });
        var timeJson = {
            sevenDaysAgo: moment().subtract(7, 'days').hours(0).minutes(0).second(0),
            yesterday: moment().subtract(1, 'days').hours(0).minutes(0).second(0),
            thisDay: moment().hours(0).minutes(0).second(0),
            thisWeek: moment().startOf('week').hours(0).minutes(0).second(0),
            lastWeek: moment().startOf('week').subtract(7, 'days').hours(0).minutes(0).second(0),
            thisMonth: moment().date(1).hours(0).minutes(0).second(0),
            prevMonth: moment().subtract(1, 'month').startOf('month').hours(0).minutes(0).second(0),
        }
        $(select).daterangepicker({
            "timePicker":false,
            "timePicker24Hour": true,
            "timePickerIncrement": 10,
            "showDropdowns": true,
            "autoApply": true,
            "startDate": timeJson[initType],
            "endDate": endType ? timeJson[endType] : moment(),
            "locale": {
                "format": 'YYYY-MM-DD',
            },
            "ranges": {
                '今天': [timeJson.thisDay, moment()],
                '昨天': [timeJson.yesterday, timeJson.yesterday],
                '环比昨天': [timeJson.yesterday, moment().subtract(1, 'days')],
                '本周': [timeJson.thisWeek, moment()],
                '上周': [timeJson.lastWeek, moment().startOf('week').subtract(1, 'days').hours(0).minutes(0).second(0)],
                '本月': [timeJson.thisMonth, moment()],
                '上个月': [timeJson.prevMonth, moment().date(1).hours(-24).minutes(0).second(0)]
            },
        }).on('cancel.daterangepicker',function(){
            $(select).val('');
        });
        clear && $(select).val('');
    },
    getParams: function(dom){
        var parame = {};
        var $dom = dom ? $(dom) : tools.$dom.toolbar;
        if($dom.find('input[type="text"]:not([inputTpye="daterange"])').length > 0){
            $dom.find('input[type="text"]:not([inputTpye="daterange"])').each(function(i,e){
                if($(this).val() != null && $(this).val() != '' && $(this).attr('name') && $(this).attr('name') != ''){
                    // 新增多个id筛选功能
                    if($(this).attr('name') == "ids"){
                        let idsIn = $(this).val().trim().replace(/，|\n|\.|\。|\s+/g, ',');
                        parame.ids = Array.from(new Set(idsIn.split(','))).join(',')
                    }else{
                        parame[$(this).attr('name')] = $(this).val()
                    }
                }
            })
        }
        if($dom.find('input[type="number"]').length > 0){
            $dom.find('input[type="number"]').each(function(i,e){
                if($(this).val() != null && $(this).val() != '' && $(this).attr('name') && $(this).attr('name') != ''){
                    parame[$(this).attr('name')] = $(this).val()
                }
            })
        }
        if($dom.find('input[type="password"]').length > 0){
            $dom.find('input[type="password"]').each(function(i,e){
                if($(this).val() != null && $(this).val() != '' && $(this).attr('name') && $(this).attr('name') != ''){
                    parame[$(this).attr('name')] = $(this).val()
                }
            })
        }
        if($dom.find('input[type="checkbox"]').length > 0){
            $dom.find('input[type="checkbox"]').each(function(i,e){
                parame[$(this).attr('name')] = ($(this).is(":checked") ? 1 : 0)
            })
        }
        if($dom.find('input[inputTpye="daterange"]').length > 0){
            $dom.find('input[inputTpye="daterange"]').each(function(i,e){
                if($(this).val() != null && $(this).val() != ''){
                    if($(this).attr('tostring') == 'true'){
                        if($(this).attr('onlyhour') == 'true'){
                            parame[$(this).attr('rangestart')] = $(this).val().split(' - ')[0].split(' ')[0]
                            parame[$(this).attr('rangeend')] = $(this).val().split(' - ')[1].split(' ')[0]
                        }else{
                            parame[$(this).attr('rangestart')] = $(this).val().split(' - ')[0]
                            parame[$(this).attr('rangeend')] = $(this).val().split(' - ')[1]
                        }
                    }else{
                        parame[$(this).attr('rangestart')] = moment($(this).val().split(' - ')[0]).unix()
                        parame[$(this).attr('rangeend')] = moment($(this).val().split(' - ')[1]).unix()
                    }
                }
            })
        }
        if($dom.find('textarea').length > 0){
            $dom.find('textarea').each(function(i,e){
                if($(this).val() != null && $(this).val() != '' && $(this).attr('name') && $(this).attr('name') != ''){
                    parame[$(this).attr('name')] = $(this).val()
                }
            })
        }
        if($dom.find('select').length > 0){
            $dom.find('select').each(function(i,e){
                if($(this).val() != null && $(this).val() != ''){
                    if(typeof $(this).val() == "string" && $(this).val().split(' · ')){
                        // 获取不展示的值
                        parame[$(this).attr('name')] = $(this).val().split(' · ')[0]
                    }else if(typeof $(this).val() == "string" && $(this).val().split(' - ')){
                        // 获取展示的值
                        parame[$(this).attr('name')] = $(this).val().split(' - ')[0]
                    }else{
                        if(typeof $(this).val() == "object"){
                            parame[$(this).attr('name')] = $(this).val().toString()
                        }else{
                            parame[$(this).attr('name')] = $(this).val()
                        }
                    }
                }
            })
        }
        if($dom.find('input[comboname]').length > 0){
            $dom.find('input[comboname]').each(function(i,e){
                var classify = $(this).combotree('tree').tree('getSelected')
                if(classify && classify.text){
                    parame[$(this).attr('comboname')] = classify.id;
                }
            })
        }
        // console.log(parame)
        return parame;
    },
    jsonToParameString:function(json){
        var parameStr = '?';
        for(var i in json){
            parameStr += i + '=' + escape(json[i]) + '&';
        }
        parameStr = parameStr.substring(0,parameStr.length - 1)
        return parameStr;
    },
    previewPro:function(id,_img){
        if(cacheLocalstorage.getCache('userAuthorities').indexOf('PRODUCT_IMAGE_PREVIEW') >= 0){
            layer.open({
                type: 2,
                title: '产品预览',
                maxmin : true,
                shadeClose: true,
                resize : false,
                shade: 0.8,
                area: ['375px', '667px'],
                skin: 'product-preview',
                content: utils.perviewPath(id)
            });
        }else{
            layer.photos({
                photos: {"data": [{"src": _img.currentSrc}]},
                anim: 5
            });
        }
    },
    previewSinglePro:function(id){
        if(cacheLocalstorage.getCache('userAuthorities').indexOf('PRODUCT_IMAGE_PREVIEW') >= 0){
            layer.open({
                type: 2,
                title: '产品预览',
                maxmin : true,
                shadeClose: true,
                resize : false,
                shade: 0.8,
                area: ['375px', '667px'],
                skin: 'product-preview',
                content: utils.perviewSinglePath(id)
            });
        }
    },
    toolbarEnterEvent:function(callback){
        $('#toolbar').keyup(function(event){
            event.keyCode ==13 && callback && callback();
        });
    },
    initInput:function(select,json){
        for(var i in json){
            if($(select).find('input[name="'+[i]+'"]').length > 0){
                $(select).find('input[name="'+[i]+'"]').val(json[i]);
            }
            if($(select).find('textarea[name="'+[i]+'"]').length > 0){
                $(select).find('textarea[name="'+[i]+'"]').val(json[i]);
            }
            if($(select).find('select[name="'+[i]+'"]').length > 0){
                $(select).find('select[name="'+[i]+'"]').selectpicker('val', json[i]).trigger("change");
            }
        }
    },
    initCheckbox: function(select,value){
        var $isDefault = $(select);
        if(value == 1){
            if(!$isDefault.is(":checked")){
                $isDefault.trigger('click');
            }
        }else{
            if($isDefault.is(":checked")){
                $isDefault.trigger('click');
            }
        }
    },
    initSelect:function(select,value){
        $(select).selectpicker('val', value);
    },
    specialStringToArray: function(string){
        var data = [];
        string.split(' &,& ').map(function(e){
            var _data = {};
            e.replace(/{/,'').replace(/}/,'').replace(/}/,'').split(',').map(function(_e){
                var d = _e.split(':');
                var s = '';
                if(d[1] == 'http'){
                    s += d[1] + ':' + d[2];
                }else{
                    s += d[1];
                }
                _data[d[0]] = s;
            })
            data.push(_data);
        })
        return data;
    },
    specialStringToJson: function(string){
        try{
            var data = [];
            if(typeof string == 'object'){
                return string
            }
            string.replace(/\)\;/g,'\)\&').split(';').map(function(e){
                var _data = JSON.parse(e.replace(/:{/,':"{').replace(/}}/,'}"}').replace(/order_code:/,'"order_code":"').replace(/,sku_info/,'","sku_info"').replace(/,payment_type/,'","payment_type"').replace(/\t/g,' '));
                _data.sku_info = tools.specialStringToArray(_data.sku_info);
                data.push(_data);
            })
            return data;
        }catch(e){return []}
    },
    specialStringToJson1: function(string){
        try{
            var data = [];
            if(typeof string == 'object'){
                return string
            }
            string.replace(/\)\;/g,'\)\&').split(';').map(function(e){
                var _data = JSON.parse(e.replace(/:{/,':"{').replace(/}}/,'}"}').replace(/order_code:/,'"order_code":"').replace(/,sku_info/,'","sku_info"').replace(/,payment_type:/,'","payment_type":"').replace(/,ip_info:/,'","ip_info":"').replace(/,days/,'","days"').replace(/\t/g,' '));
                _data.sku_info = tools.specialStringToArray(_data.sku_info);
                data.push(_data);
            })
            return data;
        }catch(e){return []}
    },
    exportByFrom: function(href,parame){
        var parame = parame || tools.getParams();
        var form = $("<form method='get'></form>");
        form.attr({'action' : utils.prePath() + href});
        var args = Object.assign(parame, {access_token : utils.cookie.getCookie('accessToken')})
        $.each(args,function(key,value){
            form.append($("<input type='hidden'>").attr({"name":key}).val(value));
        });
        form.appendTo($('body')).submit().remove();
    },
    parameWritingType: function(parame, type){
        var newParame = {};
        if(type == 'Upper'){
            for(var i in parame){
                var newParameName = '';
                if(i.split('_').length == 1){
                    newParameName = i;
                }else{
                    newParameName = i.split('_')[0];
                    i.split('_').map(function(e,index){
                        if(index != 0){
                            e.split('').map(function(e,i){
                                newParameName += (i == 0 ? e.split('')[0].toUpperCase() : e);
                            })
                        }
                    })
                }
                newParame[newParameName] = parame[i];
            }
        }else if(type == 'Lower'){
            for(var i in parame){
                var newParameName = '';
                if(i.split('_').length > 1){
                    newParameName = i;
                }else{
                    var upperString = i.substr(tools.exec.upperString(i), 1);
                    newParameName = i.split(upperString)[0] + '_' + upperString.toLowerCase() + i.split(upperString)[1];
                }
                newParame[newParameName] = parame[i];
            }
        }else{
            console.log('方法调用错误。')
        }
        return newParame;
    },
    formatNumber: function(number){
        var n_number = '';
        if(number >= 1){
            var l_number = (number + '').split('.')[0],
                r_number = (number + '').split('.')[1];
            // 逗号分隔
            var data = l_number.split('').reverse();
            for(var i = 0;i < data.length;i++){
                n_number += data[i];
                if((i + 1) % 3 == 0){
                    n_number += ',';
                }
            }
            n_number = n_number.split('').reverse();
            n_number[0] == ',' && n_number.splice(0,1);
            n_number = n_number.join('');
            r_number && (n_number += '.' + r_number);
        }else if(number > 0){
            // 转换为百分比
            n_number = (number * 100).toFixed(2) + '%';
        }if(number == 0){
            return 0;
        }
        return n_number || '--';
    },
    formatNumberType: function(number, isPercentage){
        var n_number = '';
        if(!isPercentage){
            var l_number,r_number = (number.toFixed(2) + '').split('.')[1];
            if(number > 0){
                l_number = (number.toFixed(2) + '').split('.')[0];
            }else{
                l_number = ((0 - number).toFixed(2) + '').split('.')[0];
            }
            // 逗号分隔
            var data = l_number.split('').reverse();
            for(var i = 0;i < data.length;i++){
                n_number += data[i];
                if((i + 1) % 3 == 0){
                    n_number += ',';
                }
            }
            n_number = n_number.split('').reverse();
            n_number[0] == ',' && n_number.splice(0,1);
            n_number = n_number.join('');
            if(number < 0){n_number = '-' + n_number}
            r_number && (n_number += '.' + r_number);
        }else{
            // 转换为百分比
            n_number = (number * 100).toFixed(2) + '%';
        }
        return n_number || '--';
    },
    printProductTag: function(product_id,product_sku_name,product_title,product_sku_barcode){
        var sku_name = product_sku_name.length <= 24 ? product_sku_name : (product_sku_name.slice(0,24) + '···');
        var product_title = product_title.length <= 13 ? product_title : (product_title.slice(0,13) + '···');
        var html = '<form method="post" action="#" id="printBoxForm">'+
                        '<div style="margin:20px 4px 0;font-weight:700"><span style="margin-right: 2px;font-weight:500;font-size:14px">'+product_id+'</span> '+product_title.split('(')[0]+'</div>'+
                        '<div style="margin:6px 4px 0;">'+ sku_name+'</div>'+
                        '<img id="imgcode" style="transform: scale(.9);"/>'+
                        '<div style="font-size:30px;text-align:center;margin-top:-10px">'+product_sku_barcode+'</div>'+
                    '</form>';
        if($('.printBox').length == 0){
            $('.printBox').appendTo('body');
        }
        $('.printBox').html(html);
        JsBarcode("#imgcode", product_sku_barcode, {
            height: 50,
            width: 3,
            margin: 6,
            fontSize: 0
        });
        $('#printBoxForm').print();
    },
    filterData: function(data,val,valName){
        for(var i = 0;i < data.length;i++){
            if(data[i][valName] == val){
                return data[i];
            }
        }
    },
    initAjaxData: function(name, url, callback){
        if(!window.selectCatch){
            window.selectCatch = {}
        }
        var ajaxData = selectCatch[name];
        if(!ajaxData || !ajaxData.length > 0){
            $.ajax({
                type: "GET",
                url:utils.prePath() + url,
                async: false,
                success : function(result){
                    if(result.statusCode == 'OK'){
                        selectCatch[name] = result.body
                        callback && callback(result.body)
                    }else{
                        toastr.error((result.body && result.body.message) ? result.body.message : '系统异常,请稍候重试或联系开发人员...');
                    }
                }
            });
        }else{
            callback && callback(ajaxData)
        }
    },
    uniq: function(array){
        // 去重
        var temp = {}, r = [], len = array.length, val, type;
        for (var i = 0; i < len; i++) {
            val = array[i];
            type = typeof val;
            if (!temp[val]) {
                temp[val] = [type];
                r.push(val);
            } else if (temp[val].indexOf(type) < 0) {
                temp[val].push(type);
                r.push(val);
            }
        }
        return r;
    },
}