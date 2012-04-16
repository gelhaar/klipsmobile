<?php

/**
 *	Beinhaltet die Methoden, die zur Manipulation der Session benötigt werden.
 *
 *	@author: Benjamin Gelhaar
 */

/* Validiert die Session eines Benutzers*/

function validateUser($username)
{
    //session_regenerate_id (); //this is a security measure
    $_SESSION['valid'] = 1;
    $_SESSION['username'] = $username;
}

/* Prüft ob der Benutzer eingeloggt ist*/


function isLoggedIn()
{
    if(isset($_SESSION['valid']) && $_SESSION['valid'])
        return true;
    return false;
}

/* Benutzer ausloggen */

function logout()
{
    $_SESSION = array(); //destroy all of the session variables
    session_destroy();
}

?>