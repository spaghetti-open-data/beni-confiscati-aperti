var BC = {

	//menuOpen: false,
	init: function(){
		BC.initCoroplete('region');
	},
	initCoroplete: function(level){

		switch(level){
			case 'region':
				BC.initCoroMap(Beni_Regioni);
				break;
			case 'province':
				BC.initCoroMap(Beni_Province);
				break;
			case 'city':
				BC.initCoroMap(Beni_Comuni);
				break;
		}

	},
	initCoroMap: function(obj){

		var map = L.map('map').setView([41.91, 12.832], 5);
		var layer = L.tileLayer('http://{s}.acetate.geoiq.com/tiles/acetate/{z}/{x}/{y}.png',{
			attribution: 'Acetate tileset from GeoIQ'
		}).addTo(map);
		var info = L.control();

		info.onAdd = function (map) {
			this._div = L.DomUtil.create('div', 'info');
			this.update();
			return this._div;
		};
		info.update = function (props) {
			this._div.innerHTML = '<h4>Beni immobili confiscati</h4>' +  (props ?
				'<b> Regione: </b>' + props.NOME_REG + '<br />' + 
				'<b> Numero totale: </b>' + props.totale + '<br />' + 
				'<b> Abitazioni: </b>' + props.Abitazione + '<br />' +
				'<b> Altri beni: </b>' + props.Altri_beni + '<br />' +
				'<b> Capannoni: </b>' + props.Capannone + '<br />' +
				'<b> Fabbricati: </b>' + props.Fabbricato + '<br />' +
				'<b> Locale: </b>' + props.Locale + '<br />' +
				'<b> Terreni: </b>' + props.Terreno + '<br />' 
				: 'Mouse su un poligono');
		};
		info.addTo(map);

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
				color: '#666',
				dashArray: '',
				fillOpacity: 0.7
			});

			if (!L.Browser.ie && !L.Browser.opera) {
				layer.bringToFront();
			}

			info.update(layer.feature.properties);
		}

		var geojson;

		function resetHighlight(e) {
			geojson.resetStyle(e.target);
			info.update();
		}
		function zoomToFeature(e) {
			map.fitBounds(e.target.getBounds());
		}
		function onEachFeature(feature, layer) {
			layer.on({
				mouseover: highlightFeature,
				mouseout: resetHighlight,
				click: zoomToFeature
			});
		}

		geojson = L.geoJson(obj, {
			style: style,
			onEachFeature: onEachFeature
		}).addTo(map);
	},
	// initGeoJson: function(obj,style,onEachFeature){
	// 	geojson = L.geoJson(obj, {
	// 		style: style,
	// 		onEachFeature: onEachFeature
	// 	}).addTo(map);
	// },
	registerUI: function(){

		$('body').on('click', '#toggle-menu', function(e){
			var destR = 0;
			$('#menu').animate({ right: destR },100)
		});
		$('body').on('mouseleave', '#menu', function(e){
			var destR = '-20%';
			$('#menu').animate({ right: destR },100)
		});

		$('body').on('click', '.coro-switch', function(e){
			//BC.initCoroplete($(this).attr('id'))
		});

	}

}

$(document).ready(function(){

	BC.init();
	BC.registerUI();

});


