var BC = {

	//menuOpen: false,
	init: function(){},
	registerUI: function(){

		$('body').on('click', '#toggle-menu', function(e){
			var destR = 0;
			$('#menu').animate({ right: destR },100)
		});
		$('body').on('mouseleave', '#menu', function(e){
			var destR = '-20%';
			$('#menu').animate({ right: destR },100)
		});

	}

}

$(document).ready(function(){

	BC.registerUI();

});