<?php
/**
 * Ajax actions used in by admin.
 *
 * @package    WPForms
 * @author     WPForms
 * @since      1.0.0
 * @license    GPL-2.0+
 * @copyright  Copyright (c) 2016, WPForms LLC
*/

/**
 * Save a form
 *
 * @todo  pull out the saving function to the form handler class
 * @since 1.0.0
 */
function wpforms_save_form() {

	// Run a security check
	check_ajax_referer( 'wpforms-builder', 'nonce' );

	// Check for permissions
	if ( !current_user_can( apply_filters( 'wpforms_manage_cap', 'manage_options' ) ) )
		die( __( 'You do no have permission.', 'wpforms' ) );

	// Check for form data
	if ( empty( $_POST['data'] ) ) 
		die( __( 'No data provided', 'wpforms' ) );

	$form_post = json_decode( stripslashes( $_POST['data'] ) ); 
	$data      = array();

	if ( ! is_null( $form_post ) && $form_post ) { 
		foreach ( $form_post as $post_input_data ) { 
			// For input names that are arrays (e.g. `menu-item-db-id[3][4][5]`), 
			// derive the array path keys via regex and set the value in $_POST. 
			preg_match( '#([^\[]*)(\[(.+)\])?#', $post_input_data->name, $matches ); 

			$array_bits = array( $matches[1] ); 

			if ( isset( $matches[3] ) ) { 
				$array_bits = array_merge( $array_bits, explode( '][', $matches[3] ) ); 
			} 

			$new_post_data = array(); 

			// Build the new array value from leaf to trunk. 
			for ( $i = count( $array_bits ) - 1; $i >= 0; $i -- ) { 
				if ( $i == count( $array_bits ) - 1 ) { 
						$new_post_data[ $array_bits[ $i ] ] = wp_slash( $post_input_data->value ); 
				} else { 
						$new_post_data = array( $array_bits[ $i ] => $new_post_data ); 
				} 
			} 

			$data = array_replace_recursive( $data, $new_post_data ); 
		} 
	} 

	$form_id = wpforms()->form->update( $data['id'], $data );

	do_action( 'wpforms_builder_save_form', $form_id, $data );

	if ( ! $form_id ) {
		die( __( 'An error occured and the form could not be saved', 'wpforms'  ) );
	} else {
		$data = array(
			'form_name' => esc_html( $data['settings']['form_title'] ),
			'form_desc' => $data['settings']['form_desc'],
			'redirect'  => admin_url( 'admin.php?page=wpforms-overview' ),
		);
		wp_send_json_success( $data );
	}
}
add_action( 'wp_ajax_wpforms_save_form', 'wpforms_save_form' );

/**
 * Create a new form
 *
 * @since 1.0.0
 */
function wpforms_new_form() {

	// Run a security check
	check_ajax_referer( 'wpforms-builder', 'nonce' );

	// Check for form title
	if ( empty( $_POST['title'] ) ) 
		die( __( 'No form title provided', 'wpforms' ) );

	// Create form
	$form_title    = sanitize_text_field( $_POST['title'] );
	$form_template = sanitize_text_field( $_POST['template'] );
	$title_exists  = get_page_by_title( $form_title, 'OBJECT', 'wpforms' );
	$form_id       = wpforms()->form->add( 
		$form_title,
		array(), 
		array( 'template' => $form_template )
	);
	if ( NULL != $title_exists ) {
		wp_update_post( array( 
			'ID'         => $form_id,
			'post_title' => $form_title . ' (ID #' . $form_id . ')',
		) );
	}

	if ( $form_id ) {
		$data = array(
			'id'       => $form_id,
			'redirect' => add_query_arg( array( 'view' => 'fields', 'form_id' => $form_id, 'newform' => '1' ), admin_url( 'admin.php?page=wpforms-builder' ) ),
		);
		wp_send_json_success( $data );
	} else {
		die( __( 'Error creating form', 'wpforms' ) ); 
	}
}
add_action( 'wp_ajax_wpforms_new_form', 'wpforms_new_form' );

/**
 * Update form template.
 *
 * @since 1.0.0
 */
function wpforms_update_form_template() {

	// Run a security check
	check_ajax_referer( 'wpforms-builder', 'nonce' );

	// Check for form title
	if ( empty( $_POST['form_id'] ) ) 
		die( __( 'No form ID provided', 'wpforms' ) );

	$data    = wpforms()->form->get( $_POST['form_id'], array( 'content_only' => true ) );
	$form_id = wpforms()->form->update( $_POST['form_id'], $data, array( 'template' => $_POST['template'] ) );

	if ( $form_id ) {
		$data = array(
			'id'       => $form_id,
			'redirect' => add_query_arg( array( 'view' => 'fields', 'form_id' => $form_id ), admin_url( 'admin.php?page=wpforms-builder' ) ),
		);
		wp_send_json_success( $data );
	} else {
		die( __( 'Error updating form template', 'wpforms' ) ); 
	}
}
add_action( 'wp_ajax_wpforms_update_form_template', 'wpforms_update_form_template' );