var ImageSelections = function (context) {
  var ui = $.summernote.ui;
  // create button
  var button = ui.button({
    contents: '<i class="fa fa-file-image-o" style="padding: 4px 0px;" />',
    tooltip: '图片选择器',
    click: function () {    	
    	var html = '<div class="row row-flex img-container masonry">' ; 
    		$.each(app.data.productInfos.productImages , function(index, temp){
    			html +=  '<div class="col-sm-4 col-md-3 image-item">'
						+'	    <div src="'+temp.url+'" class="example" style="margin-bottom:0px">'
						+'	        <img src="'+temp.url+'" class="img-responsive" alt="">'
						+'	        <i class="fa fa-3x fa-check-circle-o img-check"></i>'
						+'	    </div>'
						+'	    <p class="text-info">'+(temp.fileName || "")+'</p>'
						+'	</div>';
				});
				html += '</div>';
				layer.open({
			    type: 1,
			    title : '图片选择器',
			    offset: '50px',
	    		area: ['750px', '550px'], //宽高
			    content: html,
			    btn: ['确定', '取消'] ,
			    btnAlign: 'c',
			    yes: function(index, layero){
//					  $.each($('.img-container .example.active'), function(index , temp) {
//							context.invoke('editor.insertImage', $(temp).attr('src'), 'i am image');
//						});
						layer.close(index);
					}
				});
				
				$('.img-container.masonry .image-item > .example').click(function(){
						if(!$(this).hasClass('active')){
							$(this).addClass('active');
							context.invoke('editor.insertImage', $(this).attr('src'), 'i am image');
						}
						
					});
				
			if($('.img-container.masonry').length > 0){
        	$('.img-container.masonry').imagesLoaded(function() {
						$('.img-container.masonry').masonry({
							itemSelector: '.image-item'
						});
					});
    	}
    }
  });
  return button.render();   // return button as jquery object
}

function chosenImagesSingle(callback , _type){
	var html = '<div class="row row-flex img-container masonry">' ; 
	$.each(app.data.productInfos.productImages , function(index, temp){
		html +=  '<div class="col-sm-4 col-md-3 image-item">'
				+'	    <div id="'+temp.id+'" src="'+temp.url+'" class="example"  style="margin-bottom:0px" onclick="$(\'.img-container .example.active\').removeClass(\'active\');$(this).addClass(\'active\');">'
				+'	        <img src="'+temp.url+'" class="img-responsive" alt="">'
				+'	        <i class="fa fa-3x fa-check-circle-o img-check"></i>'
				+'	    </div>'
				+'	    <p class="text-info">'+(temp.fileName || "")+'</p>'
				+'	</div>';
		});
		html += '</div>';
	layer.open({
	    type: 1,
	    title : '图片选择器',
		skin: 'picSelect',
	    offset: '50px',
	    area: ['750px', '550px'], //宽高
	    content: html,
	    btn: ['确定', '取消'] ,
	    btnAlign: 'c',
	    yes: function(index, layero){
			    // invoke insertText method with 'hello' on editor module.
			  $.each($('.img-container .example.active'), function(index , temp) {
					callback( $(temp).attr('id'), $(temp).attr('src') , _type);
				});
				layer.close(index);
			}
	});
	if($('.img-container.masonry').length > 0){
    	$('.img-container.masonry').imagesLoaded(function() {
					$('.img-container.masonry').masonry({
						itemSelector: '.image-item'
					});
			});
	}
}
function chosenImagesMultiple(callback){
	var html = '<div class="row row-flex img-container masonry">' ; 
	$.each(app.data.productInfos.productImages , function(index, temp){
		html +=  '<div class="col-sm-4 col-md-3 image-item">'
				+'	    <div id="'+temp.id+'" src="'+temp.url+'" class="example"  style="margin-bottom:0px" onclick="$(this).toggleClass(\'active\');">'
				+'	        <img src="'+temp.url+'" class="img-responsive" alt="">'
				+'	        <i class="fa fa-3x fa-check-circle-o img-check"></i>'
				+'	    </div>'
				+'	    <p class="text-info">'+(temp.fileName || "")+'</p>'
				+'	</div>';
		});
		html += '</div>';
	layer.open({
	    type: 1,
	    title : '图片选择器',
		skin: 'picSelect',
	    offset: '50px',
	    area: ['750px', '550px'], //宽高
	    content: html,
	    btn: ['确定', '取消'] ,
	    btnAlign: 'c',
	    yes: function(index, layero){
			    // invoke insertText method with 'hello' on editor module.
			  $.each($('.img-container .example.active'), function(index , temp) {
					callback( $(temp).attr('id'), $(temp).attr('src'));
				});
				layer.close(index);
			}
	});
	if($('.img-container.masonry').length > 0){
    	$('.img-container.masonry').imagesLoaded(function() {
					$('.img-container.masonry').masonry({
						itemSelector: '.image-item'
					});
			});
	}
}
