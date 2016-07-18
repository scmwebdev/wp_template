<?php

/**
 * This env_config variable are created for easier changes between environtment within the development cycle
 * Server side will have its own env_config file thus this file is ignored when pushing to github. 
 */
$env_config = [
	'site_url'		=>	'localhost/wp_template/', //url for the backend/admin page
	'home_url'		=>	'localhost/wp_template/', //url for the frontend/public
	'db_name'		=> 	'wp_template', //your database name.
	'db_host'		=>	'localhost', //your database host name
	'db_user'		=>	'root', //your username for the database
	'db_pass'		=>	'root' //your password the the database

];


?>