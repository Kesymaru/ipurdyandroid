/**
* SE ENCARGA DE TODO LO RELACIONADO CON EL ESTILO
*/
//var resultados = $.mobile.path.parseUrl("http://77digital.digimoblabs.com/webServiceJson.php?username=ipurdy&password=12345678&action=vehiculos");

var datos = [];
var tipos = [];
var estados = [];
var asesores = [];
var sucursales = [];
var table = '';
var reservas = [];

//identificadores 
var cargandoReservas = false;
var cargandoDatos = false;

/*************************** PHONEGAP **********************/

//espera que cordova cargue
document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
	console.log('device ready');

	$('.cancelar-dialogo').click(function(){
		$('.ui-dialog').dialog('close');
	});

	$("#resultados tr").each(function(){
		$(this).click(function(){
			InfoPage($(this).attr('id'));
		});
	});

	$("#consultar").click(function(){
		Consultar();
	});

	$("#sincronizar-boton, #bienvenida-sincronizar").click(function(){
		Sincronizar();
	});
	
	//FILTROS
	//Buscar();
	Tipos();
	Estados();
	Asesores();
	Sucursales();

	//CARGA LOS DATOS
	Consultar();

}

/************************** JQUERY *********************/

//var link = 'js/testdata.json';
//var link = 'http://77digital.digimoblabs.com/webServiceJson.php?username=ipurdy&password=12345678&&action=vehiculos';
var link = 'http://77digital.digimoblabs.com/webServiceJsonTest2.php';

$(document).bind('mobileinit',function(){
	$.mobile.selectmenu.prototype.options.nativeMenu = true;
	$.mobile.fixedToolbars.hide(true);
});


$(document).ready(function(){
	onDeviceReady();
});


/**
* REFRESCA LOS DATOS
*/
function Consultar(){
	//si tiene datos los carga
	if( window.localStorage.getItem("datos") === null ){
		$.mobile.changePage('#sincronizar', {role:'dialog', transition: "slideup"});
	}else{
		//loader
		$.mobile.showPageLoadingMsg();
		
		Cargar();
		Selects();

		$.mobile.hidePageLoadingMsg();
	}
}

/**
* SINCRONIZA OBTIENE DATOS
*/
function Sincronizar(){
	var username = $("#username").val();
	var password = $("#password").val();

	var queryParams = '&username='+username+"&password="+password;

	if( !Validar(username) && !Validar(password) ){
		alert('Por favor increse las credenciales');
		return;
	}else{
		if( !ValidaCredenciales(username, password) ){
			alert('Credenciales Invalidas');
			return;
		}
	}
	//$.mobile.showPageLoadingMsg();
	$.mobile.loading( 'show', {
		text: 'Por favor espere',
		textVisible: true,
		theme: 'a',
		html: ""
	});
	
	//link = 'js/testdata.json';
	var paramsDatos = {"username" : username, "password" : password, "action" : "vehiculos"};
	$.ajax({
		url: link,
		data: paramsDatos,
	    type: 'get',
	    crossDomain: true,
	    async: true,
		contentType: "application/json; charset=utf-8",
        dataType: "json",
		cache: true,
		beforeSend: function(){
			cargandoDatos = true;
			console.log('peticion datos');
		},
		success: function(data){
			console.log(data);

			//GUARDA DATOS
			window.localStorage.setItem( 'datos', JSON.stringify(data) );
			console.log('datos listos');

			//actualiza la hora de la ultima sincronizacion
			if( !jQuery.isEmptyObject(localStorage['datos']) > 0 ){
				var date = new Date();
				
				var horas = date.getHours();
				var minutos = date.getMinutes();
				var ampm = horas >= 12 ? 'pm' : 'am';
				horas = horas % 12;
				horas = horas ? horas : 12; 
				minutos = minutos < 10 ? '0'+minutos : minutos;

				var ahora = date.getMonth()+1+"/"+date.getDate()+"/"+date.getFullYear()+" - "+horas+":"+minutos+ampm;
				window.localStorage.setItem( "lastUpdate", ahora );
			}

			//CARGA LOS DATOS
			Cargar();
			
			//ELIMINA DUPLICADOS PARA SELECTS
			EliminarDuplicados();

			//compone los selects
			Selects();

			cargandoDatos = false;
		},
		fail: function(response){
			cargandoDatos = false;
			var error = '<h2>La sincronizacion de los datos ha fallado.</h2>'+
						'<h2>Por favor asegúrese de tener una conexion a internet</h2>'+
						'<fieldset class="ui-grid-a">'+
							'<div class="ui-block-a" >'+
								'<button type="button" class="cancelar-dialogo" >'+
									'Cancel'+
								'</button>'+
							'</div>'+
							'<div class="ui-block-b">'+
								'<a clas="reintentar" type="submit" href="#sincronizar" data-rel="dialog" data-transition="slideup" >'+
									'Re intentar'+
								'</a>'+
							'</div>'+   
						'</fieldset>';
			Error(error, 'Error Sincronizar');
		},
		error: function(){
			cargandoDatos = false;
			var error = '<h2>Ha ocurrido un error al sincronizar los datos.</h2>'+
						'<fieldset class="ui-grid-a">'+
							'<div class="ui-block-a" >'+
								'<button type="button" class="cancelar-dialogo" >'+
									'Cancel'+
								'</button>'+
							'</div>'+
							'<div class="ui-block-b">'+
								'<a clas="reintentar" type="submit" href="#sincronizar" data-rel="dialog" data-transition="slideup" >'+
									'Re intentar'+
								'</a>'+
							'</div>'+   
						'</fieldset>';
			Error(error, 'Error Sincronizar');
		}
	}).done(function(){
		cargandoDatos = false;
		
		$.mobile.hidePageLoadingMsg();
		$('.ui-dialog').dialog('close');
		
		//CARGA RESERVAS PASIVAMENTE
		Reservas(username, password);
	});
}

/**
* CARGAR LOS DATOS DE LAS RESERVAS
*/
function Reservas(username, password){
	var paramsRervas = {"username" : username, "password" : password, "action" : "reservas"};
	
	$.ajax({
		url: link,
		data: paramsRervas,
		type: 'get',
		crossDomain: true,
		async: true,
		contentType: "application/json; charset=utf-8",
        dataType: "json",
		cache: true,
		beforeSend: function(){
			console.log('peticion reservas');
			cargandoReservas = true;
		},
		success: function(reservas){
			window.localStorage.setItem( 'reservas', JSON.stringify(reservas) );
			console.log('reservas listas');
		},
		fail: function(response){
			cargandoReservas = false;
			var error = '<h2>La sincronizacion de las reservas ha fallado.</h2>'+
						'<h2>Por favor asegúrese de tener una conexion a internet</h2>'+
						'<fieldset class="ui-grid-a">'+
							'<div class="ui-block-a" >'+
								'<button type="button" class="cancelar-dialogo" >'+
									'Cancel'+
								'</button>'+
							'</div>'+
							'<div class="ui-block-b">'+
								'<a clas="reintentar" type="submit" href="#sincronizar" data-rel="dialog" data-transition="slideup" >'+
									'Re intentar'+
								'</a>'+
							'</div>'+   
						'</fieldset>';
			Error(error, 'Error Reservas');
		},
		error: function(){
			cargandoReservas = false;
			var error = '<h2>Ha ocurrido un error al sincronizar las reservas.</h2>'+
						'<fieldset class="ui-grid-a">'+
							'<div class="ui-block-a" >'+
								'<button type="button" class="cancelar-dialogo" >'+
									'Cancel'+
								'</button>'+
							'</div>'+
							'<div class="ui-block-b">'+
								'<a clas="reintentar" type="submit" href="#sincronizar" data-rel="dialog" data-transition="slideup" >'+
									'Re intentar'+
								'</a>'+
							'</div>'+   
						'</fieldset>';
			Error(error,'Error Reservas');
		}
	}).done(function(){
		//termino de cargar las reservas
		cargandoReservas = false;
	});
}

/**
* VALIDA LOS INPUTS DE SINCRONIZAR
*/
function Validar(text){
	if( text != null && text != '' && text != undefined ){
		return true;
	}else{
		return false;
	}
}

/**
* VALIDA CREDENCIALES
*/
function ValidaCredenciales(username, password){
	if( username === 'IPURDY' && password === 'GPM2013' ){
		return true;
	}else if( username === 'IPURDYL' && password === 'LEXUS2013' ){
		return true;
	}else if( username === 'IPURDYPM' && password === 'PMCR2013' ){
		return true;
	}else{
		return false;
	}
}

/**
* CARGA LOS DATOS EN LA TABLA
* datos -> object con los datos a cargar
*/
function Cargar(){
	datos = JSON.parse( window.localStorage.getItem('datos') );

	//carga la datbla sin filtrar
	$.each(datos.INFOUNIDAD, function(f, c){
		
		var clase = c.TIPO_VEHICULO+' '+c.ESTADO+' ';
		if( !jQuery.isEmptyObject(c.NOMBRE_VENDEDOR) ){
			var vendedor = c.NOMBRE_VENDEDOR;
			vendedor = vendedor.replace(/\s+/g, ''); //elimina espacios en blanco
			clase += vendedor+' ';
		}
		if( !jQuery.isEmptyObject(c.SUCURSAL) ){
			clase += c.SUCURSAL;
		}

		//compone la fila
		var tr = '<tr id="'+c.UNIDAD+'" class="'+clase+'">'+
					'<td><b class="ui-table-cell-label">Unidad</b>'+
						c.UNIDAD+'</td>'+
					'<td><b class="ui-table-cell-label">Color</b>'+c.DESC_COLOR_EXT+'</td>'+
					'<td><b class="ui-table-cell-label">Modelo</b>'+
						c.MODELO+'</td>'+
					'<td><b class="ui-table-cell-label">Fecha llegada</b>';
				
		if( jQuery.isEmptyObject(c.FECHA_LLEGADA) ){
			$.each(c.FECHA_LLEGADA, function(x,valor){
			tr += '---';
			})
		}else{
			tr += c.FECHA_LLEGADA;
		}
		
		tr	+='</td>'+
			'<td><b class="ui-table-cell-label">Cliente</b>';

		if( jQuery.isEmptyObject(c.NOMBRE_CLIENTE) ){
			tr += '---';
		}else{
			tr += c.NOMBRE_CLIENTE;
		}
		tr	+='</td>';

		//sucursal
		tr	+='<td><b class="ui-table-cell-label">Sucursal</b>';
		if( jQuery.isEmptyObject(c.SUCURSAL) ){
			tr += '---';
		}else{
			tr += c.SUCURSAL;

			//array para las sucursales
			sucursales.push(c.SUCURSAL);
		}
			tr += '</td>';

		//dias reserva
		if( !jQuery.isEmptyObject(c.DIAS_RESERVA) ){
			tr +='<td><b class="ui-table-cell-label">Días Reserva</b>'+c.DIAS_RESERVA+'</td>';
		}else{
			tr +='<td><b class="ui-table-cell-label">Días Reserva</b>---</td>';
		}

		tr +=	'</tr>';
				
		table += tr;

		tipos.push(c.TIPO_VEHICULO);
		
		if( !jQuery.isEmptyObject(c.NOMBRE_VENDEDOR) ){
			asesores.push(c.NOMBRE_VENDEDOR);
		}
	});
	
	//$("#resultados tbody").html('');
	$("#resultados tbody").html(table).trigger('create');
	
	//actualiza la ultima hora de sincronizacion
	if( window.localStorage.getItem("lastUpdate") === null ){
		$("#home-footer h3, #info-footer h3").html("Sin Sincronizar");
	}else{
		$("#home-footer h3, #info-footer h3").html("Ultima actualizacion: "+ window.localStorage.getItem('lastUpdate') );
	}
	
	//funciones de la tabla
	$("#resultados tbody tr").each(function(){
		$(this).click(function(){
			InfoPage($(this).attr('id'));
		});
	});
	
}

/**
* ELIMINA DUPLICADOS DE LOS DATOS PARA SELECTS
* COMPONE EL ARRAY PARA SELECTS
*/
function EliminarDuplicados(){
	//elimina elementos duplicacos
	tipos = tipos.filter(function(elem, pos) {
		return tipos.indexOf(elem) == pos;
	});
	tipos.sort();
	window.localStorage.setItem( 'tipos', JSON.stringify(tipos) );

	asesores = asesores.filter(function(elem, pos) {
		return asesores.indexOf(elem) == pos;
	});
	asesores.sort();
	window.localStorage.setItem( 'asesores', JSON.stringify(asesores) );

	sucursales = sucursales.filter(function(elem, pos) {
		return sucursales.indexOf(elem) == pos;
	});
	sucursales.sort();
	window.localStorage.setItem( 'sucursales', JSON.stringify(sucursales) );
}

/**
* CARGA LOS FILTROS
* USA EL localStorage PARA OBTENER LOS DATOS
*/
function Selects(){
	//defaults
	$("#select-tipo").append('<option value="todos" selected>Todos</option>');
	$("#select-asesor").append('<option value="todos" selected>Todos</option>');
	$("#select-sucursal").append('<option value="todos" selected>Todos</option>');

	tipos = JSON.parse( window.localStorage.getItem('tipos') );
	$.each(tipos, function(f, valor){
		var option = '<option value="'+valor+'">'+valor+'</option>';
		$("#select-tipo").append(option);
	});

	asesores = JSON.parse( window.localStorage.getItem('asesores') );
	$.each(asesores, function(f, valor){
		var option = '<option value="'+valor+'">'+valor+'</option>';
		$("#select-asesor").append(option);
	});

	sucursales = JSON.parse( window.localStorage.getItem('sucursales') );
	$.each(sucursales, function(f, valor){
		var option = '<option value="'+valor+'">'+valor+'</option>';
		$("#select-sucursal").append(option);
	});

	//refresca
	$("#select-tipo, #select-asesor, #select-sucursal").selectmenu('refresh', true);
}

/************************* FILTROS ******************/

/**
* BUSQUEDA
*/
function Buscar(){
	//permite mostrar todos al borrar o resetear la busqueda
	/*$("#buscar").change(function(){
		if( $(this).val() == '' ){
			$("#resultados tbody").removeClass('no');
        	$("#resultados tbody").removeClass('si');
        	$("#resultados tbody tr").show();
		}
	});*/

	$.mobile.showPageLoadingMsg();
	
	//busca en la tabla, solo en el tbody
	$("#buscar").change(function(){
		if( $(this).val() == '' ){
			$("#resultados tbody").removeClass('no');
        	$("#resultados tbody").removeClass('si');
        	$("#resultados tbody tr").show();
        	return;
		}

		var busqueda = $("#buscar").val();
		busqueda = busqueda.replace(/\s/g, ""); //quita espacios en blanco
		busqueda = busqueda.split(","); //compone array separando por las comas
		busqueda = busqueda, count = 0;

		//recorre opciones para buscar
        $("#resultados tbody tr").each(function(){
        	var element = $(this);

        	$.each(busqueda,function(fila, valor){

        		//busqueda
        		if( element.text().search(new RegExp(valor, "i")) < 0 ){
	                
	                element.hide();
	                
	                /*if( !element.hasClass('si') ){
		 				element.addClass('no');	                	
	                }*/

	            //muestra considencias
	            } else {
	            	element.show();

	            	/*if( !element.hasClass('no') ){
	            		element.show();
	                	count++;
	            	}else{
	            		element.removeClass('no');
	            		element.addClass('si');
	            	}*/
	            }
        	});

        });
        $("#resultados tbody").removeClass('no');
        $("#resultados tbody").removeClass('si');
	});
	$.mobile.hidePageLoadingMsg();
}

/**
* FILTRA SELECION DE TIPOS
*/
function Tipos(){
	$("#select-tipo").change(function(){
		Filtrar();
	});
}

/**
* FILTRA SELECCION DE ESTADOS
*/
function Estados(){
	$("#select-estado").change(function(){
		Filtrar();
	});
}

/**
* FILTRA SELECCION
*/
function Asesores(){
	$("#select-asesor").change(function(){
		Filtrar();
	});
}

/**
* FILTRO PARA SELECCION DE SUCURSAL
*/
function Sucursales(){
	$("#select-sucursal").change(function(){
		Filtrar();
	});
}

/**
* FILTRA SELECCIONES SIN USAR LOOPS
*/
function Filtrar(){
	$.mobile.showPageLoadingMsg();
	
	if($('#no-resultados').is(":visible")){
		$('#no-resultados').css('display','none');		
	}

	var select = '';
	var mostrado = false;

	var tipo = $("#select-tipo option:selected").val();
	var estado = $("#select-estado option:selected").val();
	var asesor = $("#select-asesor option:selected").val();
	asesor = asesor.replace(/\s+/g, ''); //elimina espacios blancos
	var sucursal = $("#select-sucursal option:selected").val();
	
	//compone el selector para el filtro	
	if( tipo != 'todos' ){
		select += '.'+tipo;
	}else if(!mostrado){
		$("#resultados tbody tr").css('display','table-row');
		mostrado = true;
	}
	if( asesor != 'todos' ){
		select += '.'+asesor;
	}else if(!mostrado){
		$("#resultados tbody tr").css('display','table-row');
		mostrado = true;
	}
	if( sucursal != 'todos'){
		select += '.'+sucursal;
	}else if(!mostrado){
		$("#resultados tbody tr").css('display','table-row');
		mostrado = true;
	}
	
	var superSelect = '';

	//compone seleccion con los estados
	switch (estado){
		case 'disponible':
			superSelect += '.S' +select+', ';
			superSelect += '.ST'+select+', ';
			superSelect += '.L'+select+', ';
			superSelect += '.T'+select;
			break;

		case 'disponibleInventario':
			superSelect += '.S' +select+', ';
			superSelect += '.L'+select;
			break;

		case 'libre':
			superSelect += '.L'+select+', ';
			superSelect += '.T'+select;
			break;

		case 'libreInventario':
			superSelect += '.L'+select;
			break;

		case 'separado':
			superSelect += '.S' +select+', ';
			superSelect += '.ST'+select;
			break;

		case 'separadoInventario':
			superSelect += '.S' +select;
			break;

		case 'todos':
			superSelect = select;
			if(!mostrado){
				$("#resultados tbody tr").css('display','table-row');
				mostrado = true;
			}
			break;
	}

	if( superSelect != '' ){
		//esconde todos
		$("#resultados tbody tr").css('display','none');
		
		console.log(superSelect);
		
		var ac = $(superSelect);
		ac.css('display','table-row');
		//$("'"+superSelect+"'").css('display','table-row');
	}

	//si hay resultados
	if( !$("#resultados tbody tr").is(":visible") ){
		$('#no-resultados').css('display','block');
	}

	$.mobile.hidePageLoadingMsg();
}

/************************* PAGINA DE INFORMACION ***************************/

/**
* CARGA INFORMACION EN INFO PAGE
* id -> id de la info
*/
function InfoPage(id){

	if( window.localStorage.getItem('reservas') != null ){

		$.mobile.changePage('#info', { transition: "slide"} );


		reservas = JSON.parse( window.localStorage.getItem('reservas') );

		$.each(reservas.INFOUNIDAD, function(f, c){
			if( c.UNIDAD === id ){
				$("#reserva").html('<b class="ui-table-cell-label">Reserva</b>'+c.FECHA_RESERVACION).trigger('create').trigger('create');
				$("#entrega").html('<b class="ui-table-cell-label">Entrega</b>'+c.FECHA_ENTREGA).trigger('create').trigger('create');
				$("#cliente").html('<b class="ui-table-cell-label">Cliente</b>'+c.NOMBRE_CLIENTE).trigger('create').trigger('create');
				$("#vendedor").html('<b class="ui-table-cell-label">Vendedor</b>'+c.NOMBRE_VENDEDOR).trigger('create').trigger('create');
				$("#sucursal").html('<b class="ui-table-cell-label">Sucursal</b>'+c.SUCURSAL).trigger('create').trigger('create');
			}
		});

		datos = JSON.parse( window.localStorage.getItem('datos') );

		$.each(datos.INFOUNIDAD, function(f,c){
			if( c.UNIDAD === id ){
				$("#dias-reserva").html('<b class="ui-table-cell-label">Días Reserva</b>'+c.DIAS_RESERVA).trigger('create').trigger('create');

				$("#unidad").html('<b class="ui-table-cell-label">Unidad</b>'+c.UNIDAD).trigger('create').trigger('create');
				$("#precio").html('<b class="ui-table-cell-label">Precio</b>'+c.PRECIO).trigger('create').trigger('create');
				$('#tipo-vehiculo').html('<b class="ui-table-cell-label">Tipo Vehiculo</b>'+c.TIPO_VEHICULO).trigger('create');
				$('#color').html('<b class="ui-table-cell-label">Color</b>'+c.DESC_COLOR_EXT).trigger('create');
				$('#codigo-color').html('<b class="ui-table-cell-label">Código Color</b>'+c.COLOR_EXTERNO).trigger('create');
				$('#ano-modelo').html('<b class="ui-table-cell-label">Año Modelo</b>'+c.MODELO).trigger('create');
				$('#ubicacion').html('<b class="ui-table-cell-label">Ubicacion</b>'+c.DESC_UBICACION).trigger('create');
				$('#fecha-llegada').html('<b class="ui-table-cell-label">Fecha Llegada</b>'+c.FECHA_LLEGADA).trigger('create');
				$('#equipamiento').html('<b class="ui-table-cell-label">Equipamiento</b>'+c.EQUIPAMIENTO).trigger('create');
				$('#extras-instaladas').html('<b class="ui-table-cell-label">Extras Instaladas</b>'+c.EXTRAS_INSTALADAS).trigger('create');
				
				if( !jQuery.isEmptyObject(c.NOTAS) ){
					$('#notas').html('<b class="ui-table-cell-label">Notas</b>'+c.NOTAS).trigger('create');
				}
			}
		});
	
	}else{
		if(cargandoReservas){
			alert('Por favor espere..');
		}else{
			alert('Error: datos de reservas no disponible.');
		}
	}
}

/************************* HELPES *******************/

/**
* MUESTRA UN MENSAJE DE ERROR GENERICO
*/
function Error(error, title){
	if(title === null || title == ''){
		title = 'Error';
	}
	$("#error div[data-role='header'] h1").html(title).trigger( "create" );
	$("#error div[data-role='content']").html(error).trigger( "create" );
	
	$.mobile.changePage('#error', {role:'dialog'});

	$('.cancelar-dialogo').click(function(){
		//$('.ui-dialog').dialog('close');
	});
	
	$('.reintentar').click(function(){
		//$('.ui-dialog').dialog('close');
	});
}