<?php

include 'env.php';

/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the
 * installation. You don't have to use the web site, you can
 * copy this file to "wp-config.php" and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * MySQL settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://codex.wordpress.org/Editing_wp-config.php
 *
 * @package WordPress
 */

// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define('DB_NAME', $env_config['db_name']);

/** MySQL database username */
// define('DB_USER', 'root');
define('DB_USER', $env_config['db_user']);

/** MySQL database password */
define('DB_PASSWORD', $env_config['db_pass']);

/** MySQL hostname */
define('DB_HOST', $env_config['db_host']);

/** Database Charset to use in creating database tables. */
define('DB_CHARSET', 'utf8mb4');

/** The Database Collate type. Don't change this if in doubt. */
define('DB_COLLATE', '');

define('WP_HOME',  'http://' . $env_config['home_url'] );
define('WP_SITEURL', 'http://' . $env_config['site_url'] );

/**#@+
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define('AUTH_KEY',         'vF_F%czRa{;X8%Q99zcF<Npy8S@Xo@[a!N#~#)IUI$vfS^|m1O9Ebq{qM=HA9sX2');
define('SECURE_AUTH_KEY',  'N/^CdE9$16v|os,yMzafl!q+HZAZ81j?p(hA#<%!b]M[|t,LJ.>>fj4MiD?` ?O&');
define('LOGGED_IN_KEY',    '5GN>t<+yQ{1SRuHEyT0Y>$dBbt/NjH(#^9@3X 3c_F ]/kC8Xd}7?yS ^0#x3.jR');
define('NONCE_KEY',        'YB8MZKdC1JVi05U+KOFb::9Bh ~!R7vK:^t-cO&2`=ewdP9)VK&+NEFDUZ*0x  z');
define('AUTH_SALT',        '6qAQ#VG([1#</)BEkHAXTPZW3/+5=WIr6t:yv,P=({ _RDMZiu35R% o.Q={^%GC');
define('SECURE_AUTH_SALT', 'kC8s}wqYR>[mbD32ajtF*E_CP0~G:zu-_m.!!]|bz~xB[oF@Syem`N0HY+vC*V)>');
define('LOGGED_IN_SALT',   'Hn F<|Ljev-JvkRRi0AFT4{rsObgzn&~t%o`HAz#az|YQzZ6p#8`*5/:Ey,F8jYG');
define('NONCE_SALT',       'TWHyJtu1}J0RRgQ+alWi|,<.#OAToIjiKe_Zjt8aBP)?-&)a?YYHow=y>0Hk[|G:');

/**#@-*/

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix  = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the Codex.
 *
 * @link https://codex.wordpress.org/Debugging_in_WordPress
 */
define('WP_DEBUG', false);

/* That's all, stop editing! Happy blogging. */

/** Absolute path to the WordPress directory. */
if ( !defined('ABSPATH') )
	define('ABSPATH', dirname(__FILE__) . '/');

/** Sets up WordPress vars and included files. */
require_once(ABSPATH . 'wp-settings.php');
