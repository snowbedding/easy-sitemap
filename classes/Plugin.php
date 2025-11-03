<?php
/**
 * Main plugin class for Easy Sitemap
 *
 * @package EasySitemap
 */

namespace EasySitemap;

use EasySitemap\Admin\Admin;
use EasySitemap\Frontend\Shortcodes;
use EasySitemap\Frontend\Assets;

/**
 * Main Plugin class
 */
class Plugin {

	/**
	 * Plugin version
	 */
	const VERSION = '2.0.0';

	/**
	 * Plugin instance
	 *
	 * @var Plugin
	 */
	private static $instance = null;

	/**
	 * Plugin file path
	 *
	 * @var string
	 */
	private $plugin_file;

	/**
	 * Plugin directory path
	 *
	 * @var string
	 */
	private $plugin_dir;

	/**
	 * Plugin directory URL
	 *
	 * @var string
	 */
	private $plugin_url;

	/**
	 * Get plugin instance
	 *
	 * @return Plugin
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Constructor
	 */
	private function __construct() {
		$this->init_paths();
		$this->init_hooks();
	}

	/**
	 * Initialize paths
	 */
	private function init_paths() {
		$this->plugin_file = defined( 'EASY_SITEMAP_PLUGIN_FILE' ) ? EASY_SITEMAP_PLUGIN_FILE : dirname( __DIR__ ) . '/index.php';
		$this->plugin_dir  = defined( 'EASY_SITEMAP_PLUGIN_DIR' ) ? EASY_SITEMAP_PLUGIN_DIR : plugin_dir_path( $this->plugin_file );
		$this->plugin_url  = defined( 'EASY_SITEMAP_PLUGIN_URL' ) ? EASY_SITEMAP_PLUGIN_URL : plugin_dir_url( $this->plugin_file );
	}

	/**
	 * Initialize hooks
	 */
	private function init_hooks() {
		add_action( 'plugins_loaded', array( $this, 'load_textdomain' ) );
		add_action( 'init', array( $this, 'init' ) );
		add_action( 'after_setup_theme', array( $this, 'ensure_thumbnail_support' ) );

		// Activation/Deactivation hooks.
		register_activation_hook( $this->plugin_file, array( $this, 'activate' ) );
		register_deactivation_hook( $this->plugin_file, array( $this, 'deactivate' ) );
	}

	/**
	 * Initialize the plugin
	 */
	public function init() {
		// Initialize components.
		$this->init_admin();
		$this->init_frontend();
	}

	/**
	 * Initialize admin components
	 */
	private function init_admin() {
		if ( is_admin() ) {
			new Admin();
		}
	}

	/**
	 * Initialize frontend components
	 */
	private function init_frontend() {
		new Shortcodes();
		new Assets();
	}


	/**
	 * Load plugin textdomain
	 */
	public function load_textdomain() {
		load_plugin_textdomain(
			'easy-sitemap',
			false,
			dirname( plugin_basename( $this->plugin_file ) ) . '/languages'
		);
	}

	/**
	 * Plugin activation
	 */
	public function activate() {
		// Set default options.
		$defaults = array(
			'cache_enabled'         => '1',
			'cache_expiry'          => '3600',
			'custom_css'            => '',
		);

		foreach ( $defaults as $key => $value ) {
			if ( false === get_option( 'easy_sitemap_' . $key ) ) {
				add_option( 'easy_sitemap_' . $key, $value );
			}
		}

		// Flush rewrite rules.
		flush_rewrite_rules();
	}

	/**
	 * Plugin deactivation
	 */
	public function deactivate() {
		// Clear any cached data.
		$this->clear_cache();

		// Flush rewrite rules.
		flush_rewrite_rules();
	}

	/**
	 * Clear plugin cache
	 */
	private function clear_cache() {
		global $wpdb;

		// Clear transients.
		$wpdb->query(
			$wpdb->prepare(
				"DELETE FROM {$wpdb->options} WHERE option_name LIKE %s",
				'_transient_easy_sitemap_%'
			)
		);

		$wpdb->query(
			$wpdb->prepare(
				"DELETE FROM {$wpdb->options} WHERE option_name LIKE %s",
				'_transient_timeout_easy_sitemap_%'
			)
		);
	}

	/**
	 * Get plugin directory path
	 *
	 * @return string
	 */
	public function get_plugin_dir() {
		return $this->plugin_dir;
	}

	/**
	 * Get plugin directory URL
	 *
	 * @return string
	 */
	public function get_plugin_url() {
		return $this->plugin_url;
	}

	/**
	 * Get plugin version
	 *
	 * @return string
	 */
	public function get_version() {
		return self::VERSION;
	}

	/**
	 * Ensure featured image support for public post types so images can render in sitemap
	 */
	public function ensure_thumbnail_support() {
		// Enable global thumbnail support if not already enabled.
		add_theme_support( 'post-thumbnails' );

		// Ensure all public post types support thumbnails.
		$post_types = get_post_types( array( 'public' => true ) );
		foreach ( $post_types as $post_type ) {
			add_post_type_support( $post_type, 'thumbnail' );
		}
	}
}
