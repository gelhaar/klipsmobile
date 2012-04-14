<?php

function validateUser($username)
{
    session_regenerate_id (); //this is a security measure
    $_SESSION['valid'] = 1;
    $_SESSION['username'] = $username;
}

function isLoggedIn()
{
    if(isset($_SESSION['valid']) && $_SESSION['valid'])
        return true;
    return false;
}

function logout()
{
    $_SESSION = array(); //destroy all of the session variables
    session_destroy();
}

?>