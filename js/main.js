var BC = {

	//menuOpen: false,
	init: function(){
		BC.initLayout();
		setInterval(BC.slide,5000)
		BC.initCoroplete('region');
	},
	actualSlide: 0,
	slide: function(){
		$('.slide').eq(BC.actualSlide).removeClass('hidden');
		if(BC.actualSlide > 0) { $('.slide').eq(BC.actualSlide-1).addClass('hidden'); } else { $('.slide').eq(4).addClass('hidden'); }
		BC.actualSlide++;
		if( BC.actualSlide > 4 ) { BC.actualSlide = 0; }
	},
	initLayout: function(){},
	initCoroplete: function(level){
		switch(level){
			case 'region':
				BC.initCoroMap( Beni_Regioni, [2, 3, 18, 60, 86, 505, 1029, 1659] );
				break;
			case 'province':
				BC.initCoroMap( Beni_Province, [1, 28, 89, 153, 261, 361, 608, 1101] );
				break;
			case 'city':
				BC.initCoroMap( Beni_Comuni, [1, 5, 13, 26, 47, 84, 163, 256] );
				break;
		}
	},
	geojson: null,
	map: L.map('map').setView([41.91, 12.832], 5),
	layer: L.tileLayer (
		'http://{s}.acetate.geoiq.com/tiles/acetate/{z}/{x}/{y}.png',
		{
			attribution: 'Acetate tileset from GeoIQ',
			opacity: .7
		}
	),
	info: null,
	legend: null,
	initCoroMap: function(obj,gr){

		if ( !BC.map.hasLayer(BC.layer) ) { BC.layer.addTo( BC.map ); };

		if ( BC.info != null ) { BC.info.removeFrom(BC.map); }
		BC.info = L.control();
		BC.info.setPosition('topright');

		BC.info.onAdd = function (map) {
			this._div = L.DomUtil.create('div', 'info');
			this.update();
			return this._div;
		};
		BC.info.update = function (props) {
			
			if(props)
			{
				var itemKey, itemName;

				if(props.NOME_REG) { itemKey = 'Regione: '; itemName = props.NOME_REG; }
				else if(props.NOME_PRO) { itemKey = 'Provincia: '; itemName = props.NOME_PRO; }
				else if(props.NOME_COM) { itemKey = 'Comune: '; itemName = props.NOME_COM; }
				else { itemKey = ''; itemName = ''; }

				this._div.innerHTML = 	'<h4>Beni immobili confiscati</h4>' + 
										'<b> ' + itemKey + ' </b>' + itemName + '<br />' + 
										'<b> Numero totale: </b>' + props.totale + '<br />' + 
										'<b> Abitazioni: </b>' + props.Abitazione + '<br />' +
										'<b> Altri beni: </b>' + props.Altri_beni + '<br />' +
										'<b> Capannoni: </b>' + props.Capannone + '<br />' +
										'<b> Fabbricati: </b>' + props.Fabbricato + '<br />' +
										'<b> Locale: </b>' + props.Locale + '<br />' +
										'<b> Terreni: </b>' + props.Terreno + '<br />';

			}
			else
			{
				this._div.innerHTML = '<h4>Beni immobili confiscati</h4>Mouse su un poligono';
			}
		};

		BC.info.addTo(BC.map);

		function getColor(d) {
			return d > 1659 ? '#BD0026' :
			d > 1029  ? '#DA2122' :
			d > 505  ? '#F14624' :
			d > 86  ? '#F97534' :
			d > 60   ? '#FD9F45' :
			d > 18   ? '#FDC357' :
			d > 3   ? '#FEE180' :
			'#FFFFB2';
		}
		function style(feature) {
			return {
				fillColor: getColor(feature.properties.totale),
				weight: 0.3,
				opacity: 1,
				color: 'white',
				fillOpacity: 0.7
			};
		}
		function highlightFeature(e) {
			var layer = e.target;

			layer.setStyle({
				weight: 0.5,
				//color: '#666',
				dashArray: '',
				fillOpacity: 1
			});

			if (!L.Browser.ie && !L.Browser.opera) {
				layer.bringToFront();
			}

			BC.info.update(layer.feature.properties);
		}

		function resetHighlight(e) {
			BC.geojson.resetStyle(e.target);
			BC.info.update();
		}
		function zoomToFeature(e) {
			BC.map.fitBounds(e.target.getBounds());
		}
		function onEachFeature(feature, layer) {
			layer.on({
				mouseover: highlightFeature,
				mouseout: resetHighlight,
				click: zoomToFeature
			});
		}

		if ( BC.map.hasLayer(BC.geojson) ) { BC.map.removeLayer(BC.geojson); }
		BC.geojson = L.geoJson(obj, {
			style: style,
			onEachFeature: onEachFeature
		}).addTo(BC.map);

		if ( BC.legend != null ) { BC.legend.removeFrom(BC.map); }
		BC.legend = L.control();
		BC.legend.setPosition('topleft');

		BC.legend.onAdd = function (map) {

			var div = L.DomUtil.create('div', 'info legend'),
			grades = gr,
			labels = [],
			from, to;

			for (var i = 0; i < grades.length; i++) {
				from = grades[i];
				to = grades[i + 1];

				labels.push(
					'<i style="background:' + getColor(from + 1) + '" ></i> ' +
					from + (to ? '&ndash;' + to : '+'));
			}

			div.innerHTML = labels.join('<br>');
			return div;
		};

		BC.legend.addTo(BC.map);

		//BC.map.tap();
	},
	registerUI: function(){

		$('body').on('click', '#toggle-menu', function(e){
			var destR = 0;
			$('#menu').animate({ right: destR },100)
		});
		$('body').on('mouseleave', '#menu', function(e){
			var destR = '-210px';
			$('#menu').animate({ right: destR },100)
		});

		$('body').on('click', '.hover-box', function(e){
			$('.hover-box').removeClass('active');
			$(this).addClass('active');
			BC.initCoroplete($(this).attr('id'));
		});

		$('body').on('click','.menu-entry', function(e){
			var target = '#' + $(this).attr('id').replace('-btn','');
			var targetTop = $(target).offset().top - $('header').height();
			//$(window).scrollTop(targetTop);
			$('html, body').animate({
				scrollTop : targetTop + 'px'
			},500)
		});

	}

}

$(document).ready(function(){

	BC.init();
	BC.registerUI();

});
