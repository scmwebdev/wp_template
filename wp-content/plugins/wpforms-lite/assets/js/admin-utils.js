;
var wpf = {

	// This file contains a collection of utility functions.

	/**
	 * Start the engine.
	 *
	 * @since 1.0.1
	 */
	init: function() {

		wpf.bindUIActions();

		jQuery(document).ready(wpf.ready);
	},

	/**
	 * Document ready.
	 *
	 * @since 1.0.1
	 */
	ready: function() {
	},

	/**
	 * Element bindings.
	 *
	 * @since 1.0.1
	 */
	bindUIActions: function() {

		// The following items should all trigger the fieldUpdate trigger
		jQuery(document).on('wpformsFieldAdd', wpf.fieldUpdate);
		jQuery(document).on('wpformsFieldDelete', wpf.fieldUpdate);
		jQuery(document).on('wpformsFieldMove', wpf.fieldUpdate);
		jQuery(document).on('focusout', '.wpforms-field-option-row-label input', wpf.fieldUpdate);
		jQuery(document).on('wpformsFieldChoiceAdd', wpf.fieldUpdate);
		jQuery(document).on('wpformsFieldChoiceDelete', wpf.fieldUpdate);
		jQuery(document).on('wpformsFieldChoiceMove', wpf.fieldUpdate);
		jQuery(document).on('focusout', '.wpforms-field-option-row-choices input.label', wpf.fieldUpdate);
	},

	/**
	 * Trigger fired for all field update related actions.
	 *
	 * @since 1.0.1
	 */
	fieldUpdate: function() {

		var fields = wpf.getFields();
		jQuery(document).trigger('wpformsFieldUpdate', [fields] );
		// console.log('Field update detected');
	},

	/**
	 * Dynamically get the fields from the current form state.
	 *
	 * @since 1.0.1
	 * @param array allowedFields
	 * @return object
	 */
	getFields: function(allowedFields) {

		var formData       = jQuery('#wpforms-builder-form').serializeObject(),
			fields         = formData.fields,
			fieldOrder     = [],
			fieldsOrdered  = new Array(),
			fieldBlacklist = ['html','divider','pagebreak'];

		if (!fields) {
			return false;
		}
				
		// Find and store the order of forms. The order is lost when javascript
		// serilizes the form.
		jQuery('.wpforms-field-option').each(function(index, ele) {
			fieldOrder.push(jQuery(ele).data('field-id'));
		});

		// Remove fields that are not supported and check for white list
		jQuery.each(fields, function(index, ele) {
			if (ele) {
				if (jQuery.inArray(fields[index].type, fieldBlacklist) == '1' ){
					delete fields[index];
					wpf.removeArrayItem(fieldOrder, index);
				} else if (typeof allowedFields !== 'undefined' && allowedFields && allowedFields.constructor === Array) {
					if (jQuery.inArray(fields[index].type, allowedFields) == '-1' ){
						delete fields[index];
						wpf.removeArrayItem(fieldOrder, index);
					}
				}
			}
		});

		// Preserve the order of field choices 
		for(var key in fields) {
			if (fields[key].choices) {
				jQuery('#wpforms-field-option-row-'+fields[key].id+'-choices li').each(function(index, ele) {
					var choiceKey = jQuery(ele).data('key');
					fields[key].choices['choice_'+choiceKey] = fields[key].choices[choiceKey];
					fields[key].choices['choice_'+choiceKey].key = choiceKey;
					delete fields[key].choices[choiceKey];
				});
			}
		}

		// Preserve the order of fields 
		for(var key in fieldOrder) {
			fieldsOrdered['field_'+fieldOrder[key]] = fields[fieldOrder[key]];
		}

		return fieldsOrdered;
	},

	/**
	 * todo: get a single field
	 *
	 * @since 1.1.10
	 * @param {[type]} id
	 * @param {[type]} key
	 * @return {[type]}
	 */
	getField: function(id,key) {
		// @todo
	},

	// hasField @todo

	/**
	 * Remove items from an array.
	 *
	 * @since 1.0.1
	 * @param array array
	 * @param mixed item index/key
	 * @return array
	 */
	removeArrayItem: function(array, item) {
		var removeCounter = 0;
		for (var index = 0; index < array.length; index++) {
			if (array[index] === item) {
				array.splice(index, 1);
				removeCounter++;
			index--;
			}
		}
		return removeCounter;
	},

	/**
	 * Sanitize string.
	 *
	 * @since 1.0.1
	 */
	sanitizeString: function(str) {
		str = str.replace(/[^a-z0-9() \.,'_-]/gim,"");
		return str.trim();
	},

	/**
	 * Update query string in URL.
	 *
	 * @since 1.0.0
	 */
	updateQueryString: function(key, value, url) {

		if (!url) url = window.location.href;
		var re = new RegExp("([?&])" + key + "=.*?(&|#|$)(.*)", "gi"),
			hash;

		if (re.test(url)) {
			if (typeof value !== 'undefined' && value !== null)
				return url.replace(re, '$1' + key + "=" + value + '$2$3');
			else {
				hash = url.split('#');
				url = hash[0].replace(re, '$1$3').replace(/(&|\?)$/, '');
				if (typeof hash[1] !== 'undefined' && hash[1] !== null) 
					url += '#' + hash[1];
				return url;
			}
		} else {
			if (typeof value !== 'undefined' && value !== null) {
				var separator = url.indexOf('?') !== -1 ? '&' : '?';
				hash = url.split('#');
				url = hash[0] + separator + key + '=' + value;
				if (typeof hash[1] !== 'undefined' && hash[1] !== null) 
					url += '#' + hash[1];
				return url;
			}
			else
				return url;
		}
	},

	/**
	 * Get query string in a URL.
	 *
	 * @since 1.0.0
	 */
	getQueryString: function(name) {
	
		var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
		return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
	},

	/**
	 * Is number?
	 *
	 * @since 1.2.3
	 */
	isNumber: function(n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	}
}
wpf.init();