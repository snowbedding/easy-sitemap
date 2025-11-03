<?php
/**
 * Assets class for Easy Sitemap
 *
 * @package EasySitemap
 */

namespace EasySitemap\Frontend;

/**
 * Assets class
 */
class Assets {

	/**
	 * Constructor
	 */
	public function __construct() {
		$this->init_hooks();
	}

	/**
	 * Initialize hooks
	 */
	private function init_hooks() {
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_frontend_assets' ) );
		add_action( 'wp_head', array( $this, 'add_custom_css' ) );
	}

	/**
	 * Enqueue frontend assets
	 */
	public function enqueue_frontend_assets() {
		// Always enqueue assets - they're lightweight and provide important styling

		// Enqueue main stylesheet.
		wp_enqueue_style(
			'easy-sitemap-frontend',
			$this->get_asset_url( 'css/frontend.css' ),
			array(),
			'2.0.0'
		);

		// Enqueue JavaScript for interactive features.
		wp_enqueue_script(
			'easy-sitemap-frontend',
			$this->get_asset_url( 'js/frontend.js' ),
			array( 'jquery' ),
			'2.0.0',
			true
		);

		// Localize script with data.
		wp_localize_script(
			'easy-sitemap-frontend',
			'easySitemapData',
			array(
				'ajaxUrl' => admin_url( 'admin-ajax.php' ),
				'nonce'   => wp_create_nonce( 'easy_sitemap_nonce' ),
			)
		);
	}

	/**
	 * Add custom CSS from settings
	 */
	public function add_custom_css() {
		$custom_css = get_option( 'easy_sitemap_custom_css', '' );

		if ( ! empty( $custom_css ) ) {
			echo '<style type="text/css" id="easy-sitemap-custom-css">' . "\n";
			echo wp_strip_all_tags( $custom_css ) . "\n";
			echo '</style>' . "\n";
		}
	}

	/**
	 * Get asset URL
	 *
	 * @param string $path Asset path relative to assets directory.
	 * @return string
	 */
	private function get_asset_url( $path ) {
		// Use the plugin constants for reliable URL generation
		if ( defined( 'EASY_SITEMAP_PLUGIN_URL' ) ) {
			return EASY_SITEMAP_PLUGIN_URL . 'assets/' . $path;
		}

		// Fallback: use plugin_dir_url with the main plugin file
		$plugin_file = plugin_dir_path( __DIR__ . '/../..' ) . 'index.php';
		return plugin_dir_url( $plugin_file ) . 'assets/' . $path;
	}

	/**
	 * Check if the current page has easy sitemap shortcode
	 *
	 * @return bool
	 */
	private function has_shortcode() {
		global $post;

		if ( ! is_a( $post, 'WP_Post' ) ) {
			return false;
		}

		// Check if shortcode exists in post content
		if ( has_shortcode( $post->post_content, 'easy_sitemap' ) ) {
			return true;
		}

		// Also check for legacy shortcodes
		$legacy_shortcodes = array( 'easy_posts_sitemap', 'easy_pages_sitemap', 'easy_cpt_sitemap' );
		foreach ( $legacy_shortcodes as $shortcode ) {
			if ( has_shortcode( $post->post_content, $shortcode ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Get asset path
	 *
	 * @param string $path Asset path relative to assets directory.
	 * @return string
	 */
	private function get_asset_path( $path ) {
		return plugin_dir_path( __DIR__ ) . '../assets/' . $path;
	}
}
