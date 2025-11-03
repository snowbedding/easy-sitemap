<?php
/**
 * Autoloader class for Easy Sitemap plugin
 *
 * @package EasySitemap
 */

namespace EasySitemap;

/**
 * Autoloader class
 */
class Autoloader {

	/**
	 * Plugin base path
	 *
	 * @var string
	 */
	private static $base_path;

	/**
	 * Register the autoloader
	 *
	 * @param string $base_path Plugin base path.
	 */
	public static function register( $base_path ) {
		self::$base_path = $base_path;

		spl_autoload_register( array( __CLASS__, 'autoload' ) );
	}

	/**
	 * Autoload classes
	 *
	 * @param string $class_name Class name to load.
	 */
	public static function autoload( $class_name ) {
		// Only handle classes in our namespace.
		if ( 0 !== strpos( $class_name, 'EasySitemap\\' ) ) {
			return;
		}

		// Remove namespace prefix.
		$relative_class = str_replace( 'EasySitemap\\', '', $class_name );

		// Convert namespace separators to directory separators.
		$file_path = str_replace( '\\', DIRECTORY_SEPARATOR, $relative_class );
		$file_path = self::$base_path . 'classes' . DIRECTORY_SEPARATOR . $file_path . '.php';

		if ( file_exists( $file_path ) ) {
			require_once $file_path;
		}
	}
}
