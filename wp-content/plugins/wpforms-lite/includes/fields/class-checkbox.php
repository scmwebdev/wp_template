<?php
/**
 * Checkbox field.
 *
 * @package    WPForms
 * @author     WPForms
 * @since      1.0.0
 * @license    GPL-2.0+
 * @copyright  Copyright (c) 2016, WPForms LLC
*/
class WPForms_Field_Checkbox extends WPForms_Field {

	/**
	 * Primary class constructor.
	 *
	 * @since 1.0.0
	 */
	public function init() {

		// Define field type information
		$this->name     = __( 'Checkboxes', 'wpforms' );
		$this->type     = 'checkbox';
		$this->icon     = 'fa-check-square-o';
		$this->order    = 11;
		$this->defaults = array(
			1 => array(
				'label' => __( 'First Choice', 'wpforms' ),
				'value' => '',
				'default' => '',
			),
			2 => array(
				'label' => __( 'Second Choice', 'wpforms' ),
				'value' => '',
				'default' => '',
			),
			3 => array(
				'label' => __( 'Third Choice', 'wpforms' ),
				'value' => '',
				'default' => '',
			),
		);
	}

	/**
	 * Field options panel inside the builder.
	 *
	 * @since 1.0.0
	 * @param array $field
	 */
	public function field_options( $field ) {

		//--------------------------------------------------------------------//
		// Basic field options
		//--------------------------------------------------------------------//
		
		$this->field_option( 'basic-options', $field, array( 'markup' => 'open' ) );
		$this->field_option( 'label',         $field );

		$tooltip = __( 'Add choices for the form field.', 'wpforms' );
		$choices_values = !empty( $field['choices'] ) ? $field['choices'] : $this->defaults;
		$choices_class = !empty( $field['show_values'] ) && $field['show_values'] == '1' ? 'show-values' : '';
		$choices = $this->field_element( 'label', $field, array( 'slug' => 'choices', 'value' => __( 'Choices', 'wpforms' ), 'tooltip' => $tooltip ), false );
		$choices .= sprintf( '<ul data-next-id="%s" class="%s" data-field-id="%d" data-field-type="%s">', max( array_keys( $choices_values ) ) +1, $choices_class, $field['id'], $this->type );
		foreach ( $choices_values as $key => $value ) {
			$value['default'] = isset( $value['default'] ) ? $value['default'] : '';
			$choices .= '<li data-key="' . absint( $key ) . '">';
				$choices .= sprintf( '<input type="checkbox" name="fields[%s][choices][%s][default]" class="default" value="1" %s>', $field['id'], $key, checked( '1', $value['default'], false ) );
				$choices .= '<span class="move"><i class="fa fa-bars"></i></span>';
				$choices .= sprintf( '<input type="text" name="fields[%s][choices][%s][label]" value="%s" class="label">', $field['id'], $key, esc_attr( $value['label'] ) );
				$choices .= '<a class="add" href="#"><i class="fa fa-plus-circle"></i></a>';
				$choices .= '<a class="remove" href="#"><i class="fa fa-minus-circle"></i></a>';
				$choices .= sprintf( '<input type="text" name="fields[%s][choices][%s][value]" value="%s" class="value">', $field['id'], $key, esc_attr( $value['value'] ) );
			$choices .= '</li>';
		}
		$choices .= '</ul>';
		$this->field_element( 'row', $field, array( 'slug' => 'choices', 'content' => $choices ) );
		
		$this->field_option( 'description',   $field );
		$this->field_option( 'required',      $field );
		$this->field_option( 'basic-options', $field, array( 'markup' => 'close' ) );
		
		//--------------------------------------------------------------------//
		// Advanced field options
		//--------------------------------------------------------------------//
	
		$this->field_option( 'advanced-options', $field, array( 'markup' => 'open' ) );
		
		// Show Values toggle option
		$tooltip     = __( 'Check this to manual set form field values.', 'wpforms' );
		$show_values = isset( $field['show_values'] ) ? $field['show_values'] : '0';
		$show_values = $this->field_element( 'checkbox', $field, array( 'slug' => 'show_values', 'value' => $show_values, 'desc' => __( 'Show Values', 'wpforms' ), 'tooltip' => $tooltip ), false );
		$this->field_element( 'row',        $field, array( 'slug' => 'show_values', 'content' => $show_values ) );

		$this->field_option( 'input_columns',    $field );
		$this->field_option( 'label_hide',       $field );
		$this->field_option( 'css',              $field );
		$this->field_option( 'advanced-options', $field, array( 'markup' => 'close' ) );
	}

	/**
	 * Field preview inside the builder.
	 *
	 * @since 1.0.0
	 * @param array $field
	 */
	public function field_preview( $field ) {

		$values  = !empty( $field['choices'] ) ? $field['choices'] : $this->defaults;

		$this->field_preview_option( 'label', $field );

		echo '<ul class="primary-input">';
			foreach ( $values as $key => $value ) {
				$value['default'] = isset( $value['default'] ) ? $value['default'] : '';
				printf( '<li><input type="checkbox" %s disabled>%s</li>', checked( '1', $value['default'], false ), $value['label'] );
			}
		echo '</ul>';

		$this->field_preview_option( 'description', $field );
	}

	/**
	 * Field display on the form front-end.
	 *
	 * @since 1.0.0
	 * @param array $field
	 * @param array $form_data
	 */
	public function field_display( $field, $field_atts, $form_data ) {
	
		// Setup and sanitize the necessary data
		$field             = apply_filters( 'wpforms_checkbox_field_display', $field, $field_atts, $form_data );
		$field_placeholder = !empty( $field['placeholder']) ? esc_attr( $field['placeholder'] ) : '';
		$field_required    = !empty( $field['required'] ) ? ' required' : '';
		$field_class       = implode( ' ', array_map( 'sanitize_html_class', $field_atts['input_class'] ) );
		$field_id          = implode( ' ', array_map( 'sanitize_html_class', $field_atts['input_id'] ) );
		$field_data        = '';	
		$form_id           = $form_data['id'];

		if ( !empty( $field_atts['input_data'] ) ) {
			foreach ( $field_atts['input_data'] as $key => $val ) {
			  $field_data .= ' data-' . $key . '="' . $val . '"';
			}
		}

		// Primary checkbox fields
		printf( '<ul id="%s" class="%s" %s>', $field_id, $field_class, $field_data );
			foreach( $field['choices'] as $key=> $choice ) {
				$selected = isset( $choice['default'] ) ? '1' : '0' ;
				$val      = isset( $field['show_values'] ) ?  esc_attr( $choice['value'] ) : esc_attr( $choice['label'] );
				printf( '<li class="choice-%d">', $key );
					printf( '<input type="checkbox" id="wpforms-%d-field_%d_%d" name="wpforms[fields][%d][]" value="%s" %s %s>',
						$form_id, 
						$field['id'],
						$key,
						$field['id'],
						$val,
						checked( '1', $selected, false ),
						$field_required
					);
					printf( '<label class="wpforms-field-label-inline" for="wpforms-%d-field_%d_%d">%s</label>', $form_id, $field['id'], $key, wp_kses_post( $choice['label'] ) );
				echo '</li>';
			}
		echo '</ul>';
	}

	/**
	 * Formats and sanitizes field.
	 *
	 * @since 1.0.2
	 * @param int $field_id
	 * @param array $field_submit
	 * @param array $form_data
	 */
	public function format( $field_id, $field_submit, $form_data ) {

		$field_submit = (array) $field_submit;

		$value_raw = implode( "\n", array_map( 'sanitize_text_field', $field_submit ) );

		// If show_values is true, that means values posted are the raw values
		// and not the labels. So we need to get the label values.
		if ( !empty( $form_data['fields'][$field_id]['show_values'] ) && '1' == $form_data['fields'][$field_id]['show_values'] ) {
			
			$value = array();
			foreach( $field_submit as $field_submit_single ) {
				foreach( $form_data['fields'][$field_id]['choices'] as $choice ) {
					if ( $choice['value'] == $field_submit_single ) {
						$value[] = $choice['label'];
						break;
					}
				}
			}
			
			$value = !empty( $value ) ? implode( "\n", array_map( 'sanitize_text_field', $value ) ) : '';

		} else {
			
			$value = $value_raw;
		}

		$name = !empty( $form_data['fields'][$field_id]['label'] ) ? sanitize_text_field( $form_data['fields'][$field_id]['label'] ) : '';
		
		wpforms()->process->fields[$field_id] = array(
			'name'      => $name,
			'value'     => $value,
			'value_raw' => $value_raw,
			'id'        => absint( $field_id ),
			'type'      => $this->type,
		);
	}
}
new WPForms_Field_Checkbox;