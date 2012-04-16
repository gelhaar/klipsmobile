/**
 * Klasse, die die clientseitigen Authentifizierungsfunktionen ausführt Zugriff auf den Benutzernamen ermöglicht.
 * @author Roman Quiring
 */

function session() {

	//Konstruktor
	if (typeof(_login_prototype_called) == "undefined") {
		_session_prototype_called = true;
		session.prototype.initUsername = initUsername;
		session.prototype.ping = ping;
	}
	
	/**
	 * Führt einen AJAX-Request an den Server aus und lädt den Benutzernamen in die Logout-Leiste.
	 */
	function initUsername() {
		$.ajax({		
			type: "POST",
			url: "../backend/ajax.php",
			data: "request=User&type=getName",
			dataType: "json",
			success: function(data) {
				$(".userName").html(data.username);
			}
		});
	}

	/**
	 * Führt einen AJAX-Request an den Server aus, um die Session aufrecht zu erhalten.
	 */
	function ping() {
		$.ajax({
			type: "POST",
			url: "../backend/auth/ping.php",
			data: "",
			success: function(data) {}
		});
	}
	
}