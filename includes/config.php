<?php
$show_errors = 0;
$show_debug = 0;
$ver = "1.0";
$alvl_admin = 5;
$alvl_user = 1;
$database = [
	"TABLE_FILES" => "FILES",
	"TABLE_USERS" => "USERS"
];
$colors = [
	"PRIMARY" => "#80069D",
	"SECONDARY" => "#400946",
	"TEXT" => "#ccc",
	"TEXT_SECONDARY" => "#606060",
	"VERT_DIV" => "#333",
	"HORIZ_DIV" => "#2c2c2c",
	"BACKGROUND" => "#222"
];

//add the path to foxfile if you have it installed, as an alterate way of logins
//THIS DOES NOT WORK DO NOT USE IT
$foxfile_install_dir = '';