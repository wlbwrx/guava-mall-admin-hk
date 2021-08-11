var pluploadLayer = {
    uploader : null,
    callback : null ,
    layerIndex : null,
    loadIndex : null,
    initPanel : function(callback){
        pluploadLayer.callback = callback;
        pluploadLayer.layerIndex = layer.open({
            type: 1,
            title : '图片上传',
            offset: '100px',
            area: ['900px', '650px'], //宽高
            content: '<div id="filelist" class="row-flex">'
                +'	<div id="img-multiple" class="plupload-image-column">'
                +'        <div id="pickfiles" class="upload-container">'
                +'        	<img src="../img/upload-placeholder.jpg" class="img-responsive" alt="">'
                +'        </div>'
                +'    </div>'
                +'</div>',
            btn: ['上传', '取消'] ,
            btnAlign: 'c',
            yes: function(index, layero){
                pluploadLayer.loadIndex = layer.load(1);
                $('.plupload-image-column .btn-delete').remove();
                pluploadLayer.uploader.start();
            }
        });
        pluploadLayer.initUploader();
    },
    initUploader : function(){
        pluploadLayer.uploader = new plupload.Uploader({
            runtimes : 'html5,html4',
            browse_button : 'pickfiles', // you can pass an id.../product/{productId}/upload/image
            url : utils.prePath() + '/api/admin/category/icons/upload',
            file_data_name : 'images',
            filters : {
                max_file_size : '10mb',
                mime_types: [
                    {title : "Image files", extensions : "jpg,gif,png"}
                ]
            },
            multipart_params : {
				access_token : utils.cookie.getCookie('accessToken')
			},
            init: {
                FilesAdded: function(up, files) {
                    var HtmlStr = '' ;
                    plupload.each(files, function(file) {
                        HtmlStr += '<div id="' + file.id + '">' + file.name + ' (' + plupload.formatSize(file.size) + ') <b></b></div>';
                        var reader = new FileReader();
                        reader.onload = function(e){
                            $('#filelist').prepend(  '<div class="plupload-image-column">'+
                                '    <div class="thumbnail example">'+
                                '    	 <a class="btn-delete" onclick="pluploadLayer.uploadRemoveFile(this);" id="' + file.id + '"><i class="fa fa-trash-o"></i></a>'+
                                '		 <div class="progress-bar progress-bar-success progress-bar-striped active" role="progressbar" aria-valuenow="45" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>'+
                                '        <img src="'+e.target.result+'" class="img-responsive" alt="">'+
                                '        <div class="caption-info">' + file.name + ' (' + plupload.formatSize(file.size) + ')</div>'+
                                '    </div>'+
                                '</div>');
                        }
                        reader.readAsDataURL(file.getNative());
                    });
                    console.log(HtmlStr);

                },
                UploadProgress: function(up, file) {
                    //文件上传进度
                    $('#' + file.id).next().width(file.percent + '%');
                },
                FileUploaded : function(up, file , result){
                    //一个文件上传完成,
                    layer.close(pluploadLayer.layerIndex);
                },
                UploadComplete : function(up, files){
                    //所有文件上传完成,需要关闭窗口,执行回调
                    pluploadLayer.callback();
                    layer.close(pluploadLayer.layerIndex);
                },
                Error: function(up, err) {
                    console.log(document.createTextNode("\nError #" + err.code + ": " + err.message));
                }
            }
        });
        pluploadLayer.uploader.init();
    },
    uploadRemoveFile : function(target){
        pluploadLayer.uploader.removeFile($(target).attr('id'));
        $(target).parent().parent().remove();
    }
}
var pluploadLayerSingle = {
    uploader : null,
    callback : null ,
    layerIndex : null,
    loadIndex : null,
    categoryId:null,
    initPanel : function(callback,categoryId){
        pluploadLayerSingle.callback = callback;
        pluploadLayerSingle.categoryId = categoryId;
        pluploadLayerSingle.layerIndex = layer.open({
            type: 1,
            title : '图片上传',
            offset: '100px',
            area: ['900px', '650px'], //宽高
            content: '<div id="filelist" class="row-flex">'
                +'	<div id="img-multiple" class="plupload-image-column">'
                +'        <div id="pickfiles" class="upload-container">'
                +'        	<img src="../img/upload-placeholder.jpg" class="img-responsive" alt="">'
                +'        </div>'
                +'    </div>'
                +'</div>',
            btn: ['上传', '取消'] ,
            btnAlign: 'c',
            yes: function(index, layero){
                pluploadLayerSingle.loadIndex = layer.load(1);
                $('.plupload-image-column .btn-delete').remove();
                pluploadLayerSingle.uploader.start();
            }
        });
        pluploadLayerSingle.initUploader();
    },
    initUploader : function(){
        pluploadLayerSingle.uploader = new plupload.Uploader({
            runtimes : 'html5,html4',
            browse_button : 'pickfiles', // you can pass an id.../product/{productId}/upload/image
            url : utils.prePath() + '/api/admin/category/'+ pluploadLayerSingle.categoryId+'/image/upload',
            file_data_name : 'image',
            filters : {
                max_file_size : '10mb',
                mime_types: [
                    {title : "Image files", extensions : "jpg,gif,png"}
                ]
            },
            multipart_params : {
				access_token : utils.cookie.getCookie('accessToken')
			},
            init: {
                FilesAdded: function(up, files) {
                    var HtmlStr = '' ;
                    plupload.each(files, function(file) {
                        HtmlStr += '<div id="' + file.id + '">' + file.name + ' (' + plupload.formatSize(file.size) + ') <b></b></div>';
                        var reader = new FileReader();
                        reader.onload = function(e){
                            $('#img-multiple').prevAll().remove();
                            $('#filelist').prepend(  '<div class="plupload-image-column">'+
                                '    <div class="thumbnail example">'+
                                '    	 <a class="btn-delete" onclick="pluploadLayerSingle.uploadRemoveFile(this);" id="' + file.id + '"><i class="fa fa-trash-o"></i></a>'+
                                '		 <div class="progress-bar progress-bar-success progress-bar-striped active" role="progressbar" aria-valuenow="45" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>'+
                                '        <img src="'+e.target.result+'" class="img-responsive" alt="">'+
                                '        <div class="caption-info">' + file.name + ' (' + plupload.formatSize(file.size) + ')</div>'+
                                '    </div>'+
                                '</div>');
                        }
                        reader.readAsDataURL(file.getNative());
                    });
                    console.log(HtmlStr);

                },
                UploadProgress: function(up, file) {
                    //文件上传进度
                    $('#' + file.id).next().width(file.percent + '%');
                },
                FileUploaded : function(up, file , result){
                    //一个文件上传完成,
                    layer.close(pluploadLayerSingle.layerIndex);
                },
                UploadComplete : function(up, files){
                    //所有文件上传完成,需要关闭窗口,执行回调
                    pluploadLayerSingle.callback();
                    layer.close(pluploadLayerSingle.layerIndex);
                },
                Error: function(up, err) {
                    console.log(document.createTextNode("\nError #" + err.code + ": " + err.message));
                }
            }
        });
        pluploadLayerSingle.uploader.init();
    },
    uploadRemoveFile : function(target){
        pluploadLayerSingle.uploader.removeFile($(target).attr('id'));
        $(target).parent().parent().remove();
    }
}