/*
** NOTE: This file is generated by Gulp and should not be edited directly!
** Any changes made directly to this file will be overwritten next time its asset group is processed by Gulp.
*/

/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function(){
	var initializing = false;

	// The base JQClass implementation (does nothing)
	window.JQClass = function(){};

	// Collection of derived classes
	JQClass.classes = {};
 
	// Create a new JQClass that inherits from this class
	JQClass.extend = function extender(prop) {
		var base = this.prototype;

		// Instantiate a base class (but only create the instance,
		// don't run the init constructor)
		initializing = true;
		var prototype = new this();
		initializing = false;

		// Copy the properties over onto the new prototype
		for (var name in prop) {
			// Check if we're overwriting an existing function
			prototype[name] = typeof prop[name] == 'function' &&
				typeof base[name] == 'function' ?
				(function(name, fn){
					return function() {
						var __super = this._super;

						// Add a new ._super() method that is the same method
						// but on the super-class
						this._super = function(args) {
							return base[name].apply(this, args || []);
						};

						var ret = fn.apply(this, arguments);				

						// The method only need to be bound temporarily, so we
						// remove it when we're done executing
						this._super = __super;

						return ret;
					};
				})(name, prop[name]) :
				prop[name];
		}

		// The dummy class constructor
		function JQClass() {
			// All construction is actually done in the init method
			if (!initializing && this._init) {
				this._init.apply(this, arguments);
			}
		}

		// Populate our constructed prototype object
		JQClass.prototype = prototype;

		// Enforce the constructor to be what we expect
		JQClass.prototype.constructor = JQClass;

		// And make this class extendable
		JQClass.extend = extender;

		return JQClass;
	};
})();

(function($) { // Ensure $, encapsulate

	/** Abstract base class for collection plugins v1.0.1.
		Written by Keith Wood (kbwood{at}iinet.com.au) December 2013.
		Licensed under the MIT (https://github.com/jquery/jquery/blob/master/MIT-LICENSE.txt) license.
		@module $.JQPlugin
		@abstract */
	JQClass.classes.JQPlugin = JQClass.extend({

		/** Name to identify this plugin.
			@example name: 'tabs' */
		name: 'plugin',

		/** Default options for instances of this plugin (default: {}).
			@example defaultOptions: {
 	selectedClass: 'selected',
 	triggers: 'click'
 } */
		defaultOptions: {},
		
		/** Options dependent on the locale.
			Indexed by language and (optional) country code, with '' denoting the default language (English/US).
			@example regionalOptions: {
	'': {
		greeting: 'Hi'
	}
 } */
		regionalOptions: {},
		
		/** Names of getter methods - those that can't be chained (default: []).
			@example _getters: ['activeTab'] */
		_getters: [],

		/** Retrieve a marker class for affected elements.
			@private
			@return {string} The marker class. */
		_getMarker: function() {
			return 'is-' + this.name;
		},
		
		/** Initialise the plugin.
			Create the jQuery bridge - plugin name <code>xyz</code>
			produces <code>$.xyz</code> and <code>$.fn.xyz</code>. */
		_init: function() {
			// Apply default localisations
			$.extend(this.defaultOptions, (this.regionalOptions && this.regionalOptions['']) || {});
			// Camel-case the name
			var jqName = camelCase(this.name);
			// Expose jQuery singleton manager
			$[jqName] = this;
			// Expose jQuery collection plugin
			$.fn[jqName] = function(options) {
				var otherArgs = Array.prototype.slice.call(arguments, 1);
				if ($[jqName]._isNotChained(options, otherArgs)) {
					return $[jqName][options].apply($[jqName], [this[0]].concat(otherArgs));
				}
				return this.each(function() {
					if (typeof options === 'string') {
						if (options[0] === '_' || !$[jqName][options]) {
							throw 'Unknown method: ' + options;
						}
						$[jqName][options].apply($[jqName], [this].concat(otherArgs));
					}
					else {
						$[jqName]._attach(this, options);
					}
				});
			};
		},

		/** Set default values for all subsequent instances.
			@param options {object} The new default options.
			@example $.plugin.setDefauls({name: value}) */
		setDefaults: function(options) {
			$.extend(this.defaultOptions, options || {});
		},
		
		/** Determine whether a method is a getter and doesn't permit chaining.
			@private
			@param name {string} The method name.
			@param otherArgs {any[]} Any other arguments for the method.
			@return {boolean} True if this method is a getter, false otherwise. */
		_isNotChained: function(name, otherArgs) {
			if (name === 'option' && (otherArgs.length === 0 ||
					(otherArgs.length === 1 && typeof otherArgs[0] === 'string'))) {
				return true;
			}
			return $.inArray(name, this._getters) > -1;
		},
		
		/** Initialise an element. Called internally only.
			Adds an instance object as data named for the plugin.
			@param elem {Element} The element to enhance.
			@param options {object} Overriding settings. */
		_attach: function(elem, options) {
			elem = $(elem);
			if (elem.hasClass(this._getMarker())) {
				return;
			}
			elem.addClass(this._getMarker());
			options = $.extend({}, this.defaultOptions, this._getMetadata(elem), options || {});
			var inst = $.extend({name: this.name, elem: elem, options: options},
				this._instSettings(elem, options));
			elem.data(this.name, inst); // Save instance against element
			this._postAttach(elem, inst);
			this.option(elem, options);
		},

		/** Retrieve additional instance settings.
			Override this in a sub-class to provide extra settings.
			@param elem {jQuery} The current jQuery element.
			@param options {object} The instance options.
			@return {object} Any extra instance values.
			@example _instSettings: function(elem, options) {
 	return {nav: elem.find(options.navSelector)};
 } */
		_instSettings: function(elem, options) {
			return {};
		},

		/** Plugin specific post initialisation.
			Override this in a sub-class to perform extra activities.
			@param elem {jQuery} The current jQuery element.
			@param inst {object} The instance settings.
			@example _postAttach: function(elem, inst) {
 	elem.on('click.' + this.name, function() {
 		...
 	});
 } */
		_postAttach: function(elem, inst) {
		},

		/** Retrieve metadata configuration from the element.
			Metadata is specified as an attribute:
			<code>data-&lt;plugin name>="&lt;setting name>: '&lt;value>', ..."</code>.
			Dates should be specified as strings in this format: 'new Date(y, m-1, d)'.
			@private
			@param elem {jQuery} The source element.
			@return {object} The inline configuration or {}. */
		_getMetadata: function(elem) {
			try {
				var data = elem.data(this.name.toLowerCase()) || '';
				data = data.replace(/'/g, '"');
				data = data.replace(/([a-zA-Z0-9]+):/g, function(match, group, i) { 
					var count = data.substring(0, i).match(/"/g); // Handle embedded ':'
					return (!count || count.length % 2 === 0 ? '"' + group + '":' : group + ':');
				});
				data = $.parseJSON('{' + data + '}');
				for (var name in data) { // Convert dates
					var value = data[name];
					if (typeof value === 'string' && value.match(/^new Date\((.*)\)$/)) {
						data[name] = eval(value);
					}
				}
				return data;
			}
			catch (e) {
				return {};
			}
		},

		/** Retrieve the instance data for element.
			@param elem {Element} The source element.
			@return {object} The instance data or {}. */
		_getInst: function(elem) {
			return $(elem).data(this.name) || {};
		},
		
		/** Retrieve or reconfigure the settings for a plugin.
			@param elem {Element} The source element.
			@param name {object|string} The collection of new option values or the name of a single option.
			@param [value] {any} The value for a single named option.
			@return {any|object} If retrieving a single value or all options.
			@example $(selector).plugin('option', 'name', value)
 $(selector).plugin('option', {name: value, ...})
 var value = $(selector).plugin('option', 'name')
 var options = $(selector).plugin('option') */
		option: function(elem, name, value) {
			elem = $(elem);
			var inst = elem.data(this.name);
			if  (!name || (typeof name === 'string' && value == null)) {
				var options = (inst || {}).options;
				return (options && name ? options[name] : options);
			}
			if (!elem.hasClass(this._getMarker())) {
				return;
			}
			var options = name || {};
			if (typeof name === 'string') {
				options = {};
				options[name] = value;
			}
			this._optionsChanged(elem, inst, options);
			$.extend(inst.options, options);
		},
		
		/** Plugin specific options processing.
			Old value available in <code>inst.options[name]</code>, new value in <code>options[name]</code>.
			Override this in a sub-class to perform extra activities.
			@param elem {jQuery} The current jQuery element.
			@param inst {object} The instance settings.
			@param options {object} The new options.
			@example _optionsChanged: function(elem, inst, options) {
 	if (options.name != inst.options.name) {
 		elem.removeClass(inst.options.name).addClass(options.name);
 	}
 } */
		_optionsChanged: function(elem, inst, options) {
		},
		
		/** Remove all trace of the plugin.
			Override <code>_preDestroy</code> for plugin-specific processing.
			@param elem {Element} The source element.
			@example $(selector).plugin('destroy') */
		destroy: function(elem) {
			elem = $(elem);
			if (!elem.hasClass(this._getMarker())) {
				return;
			}
			this._preDestroy(elem, this._getInst(elem));
			elem.removeData(this.name).removeClass(this._getMarker());
		},

		/** Plugin specific pre destruction.
			Override this in a sub-class to perform extra activities and undo everything that was
			done in the <code>_postAttach</code> or <code>_optionsChanged</code> functions.
			@param elem {jQuery} The current jQuery element.
			@param inst {object} The instance settings.
			@example _preDestroy: function(elem, inst) {
 	elem.off('.' + this.name);
 } */
		_preDestroy: function(elem, inst) {
		}
	});
	
	/** Convert names from hyphenated to camel-case.
		@private
		@param value {string} The original hyphenated name.
		@return {string} The camel-case version. */
	function camelCase(name) {
		return name.replace(/-([a-z])/g, function(match, group) {
			return group.toUpperCase();
		});
	}
	
	/** Expose the plugin base.
		@namespace "$.JQPlugin" */
	$.JQPlugin = {
	
		/** Create a new collection plugin.
			@memberof "$.JQPlugin"
			@param [superClass='JQPlugin'] {string} The name of the parent class to inherit from.
			@param overrides {object} The property/function overrides for the new class.
			@example $.JQPlugin.createPlugin({
 	name: 'tabs',
 	defaultOptions: {selectedClass: 'selected'},
 	_initSettings: function(elem, options) { return {...}; },
 	_postAttach: function(elem, inst) { ... }
 }); */
		createPlugin: function(superClass, overrides) {
			if (typeof superClass === 'object') {
				overrides = superClass;
				superClass = 'JQPlugin';
			}
			superClass = camelCase(superClass);
			var className = camelCase(overrides.name);
			JQClass.classes[className] = JQClass.classes[superClass].extend(overrides);
			new JQClass.classes[className]();
		}
	};

})(jQuery);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImpxdWVyeS5wbHVnaW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEFBTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJqcXVlcnkucGx1Z2luLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogU2ltcGxlIEphdmFTY3JpcHQgSW5oZXJpdGFuY2VcclxuICogQnkgSm9obiBSZXNpZyBodHRwOi8vZWpvaG4ub3JnL1xyXG4gKiBNSVQgTGljZW5zZWQuXHJcbiAqL1xyXG4vLyBJbnNwaXJlZCBieSBiYXNlMiBhbmQgUHJvdG90eXBlXHJcbihmdW5jdGlvbigpe1xyXG5cdHZhciBpbml0aWFsaXppbmcgPSBmYWxzZTtcclxuXHJcblx0Ly8gVGhlIGJhc2UgSlFDbGFzcyBpbXBsZW1lbnRhdGlvbiAoZG9lcyBub3RoaW5nKVxyXG5cdHdpbmRvdy5KUUNsYXNzID0gZnVuY3Rpb24oKXt9O1xyXG5cclxuXHQvLyBDb2xsZWN0aW9uIG9mIGRlcml2ZWQgY2xhc3Nlc1xyXG5cdEpRQ2xhc3MuY2xhc3NlcyA9IHt9O1xyXG4gXHJcblx0Ly8gQ3JlYXRlIGEgbmV3IEpRQ2xhc3MgdGhhdCBpbmhlcml0cyBmcm9tIHRoaXMgY2xhc3NcclxuXHRKUUNsYXNzLmV4dGVuZCA9IGZ1bmN0aW9uIGV4dGVuZGVyKHByb3ApIHtcclxuXHRcdHZhciBiYXNlID0gdGhpcy5wcm90b3R5cGU7XHJcblxyXG5cdFx0Ly8gSW5zdGFudGlhdGUgYSBiYXNlIGNsYXNzIChidXQgb25seSBjcmVhdGUgdGhlIGluc3RhbmNlLFxyXG5cdFx0Ly8gZG9uJ3QgcnVuIHRoZSBpbml0IGNvbnN0cnVjdG9yKVxyXG5cdFx0aW5pdGlhbGl6aW5nID0gdHJ1ZTtcclxuXHRcdHZhciBwcm90b3R5cGUgPSBuZXcgdGhpcygpO1xyXG5cdFx0aW5pdGlhbGl6aW5nID0gZmFsc2U7XHJcblxyXG5cdFx0Ly8gQ29weSB0aGUgcHJvcGVydGllcyBvdmVyIG9udG8gdGhlIG5ldyBwcm90b3R5cGVcclxuXHRcdGZvciAodmFyIG5hbWUgaW4gcHJvcCkge1xyXG5cdFx0XHQvLyBDaGVjayBpZiB3ZSdyZSBvdmVyd3JpdGluZyBhbiBleGlzdGluZyBmdW5jdGlvblxyXG5cdFx0XHRwcm90b3R5cGVbbmFtZV0gPSB0eXBlb2YgcHJvcFtuYW1lXSA9PSAnZnVuY3Rpb24nICYmXHJcblx0XHRcdFx0dHlwZW9mIGJhc2VbbmFtZV0gPT0gJ2Z1bmN0aW9uJyA/XHJcblx0XHRcdFx0KGZ1bmN0aW9uKG5hbWUsIGZuKXtcclxuXHRcdFx0XHRcdHJldHVybiBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdFx0dmFyIF9fc3VwZXIgPSB0aGlzLl9zdXBlcjtcclxuXHJcblx0XHRcdFx0XHRcdC8vIEFkZCBhIG5ldyAuX3N1cGVyKCkgbWV0aG9kIHRoYXQgaXMgdGhlIHNhbWUgbWV0aG9kXHJcblx0XHRcdFx0XHRcdC8vIGJ1dCBvbiB0aGUgc3VwZXItY2xhc3NcclxuXHRcdFx0XHRcdFx0dGhpcy5fc3VwZXIgPSBmdW5jdGlvbihhcmdzKSB7XHJcblx0XHRcdFx0XHRcdFx0cmV0dXJuIGJhc2VbbmFtZV0uYXBwbHkodGhpcywgYXJncyB8fCBbXSk7XHJcblx0XHRcdFx0XHRcdH07XHJcblxyXG5cdFx0XHRcdFx0XHR2YXIgcmV0ID0gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcdFx0XHRcdFxyXG5cclxuXHRcdFx0XHRcdFx0Ly8gVGhlIG1ldGhvZCBvbmx5IG5lZWQgdG8gYmUgYm91bmQgdGVtcG9yYXJpbHksIHNvIHdlXHJcblx0XHRcdFx0XHRcdC8vIHJlbW92ZSBpdCB3aGVuIHdlJ3JlIGRvbmUgZXhlY3V0aW5nXHJcblx0XHRcdFx0XHRcdHRoaXMuX3N1cGVyID0gX19zdXBlcjtcclxuXHJcblx0XHRcdFx0XHRcdHJldHVybiByZXQ7XHJcblx0XHRcdFx0XHR9O1xyXG5cdFx0XHRcdH0pKG5hbWUsIHByb3BbbmFtZV0pIDpcclxuXHRcdFx0XHRwcm9wW25hbWVdO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFRoZSBkdW1teSBjbGFzcyBjb25zdHJ1Y3RvclxyXG5cdFx0ZnVuY3Rpb24gSlFDbGFzcygpIHtcclxuXHRcdFx0Ly8gQWxsIGNvbnN0cnVjdGlvbiBpcyBhY3R1YWxseSBkb25lIGluIHRoZSBpbml0IG1ldGhvZFxyXG5cdFx0XHRpZiAoIWluaXRpYWxpemluZyAmJiB0aGlzLl9pbml0KSB7XHJcblx0XHRcdFx0dGhpcy5faW5pdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gUG9wdWxhdGUgb3VyIGNvbnN0cnVjdGVkIHByb3RvdHlwZSBvYmplY3RcclxuXHRcdEpRQ2xhc3MucHJvdG90eXBlID0gcHJvdG90eXBlO1xyXG5cclxuXHRcdC8vIEVuZm9yY2UgdGhlIGNvbnN0cnVjdG9yIHRvIGJlIHdoYXQgd2UgZXhwZWN0XHJcblx0XHRKUUNsYXNzLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEpRQ2xhc3M7XHJcblxyXG5cdFx0Ly8gQW5kIG1ha2UgdGhpcyBjbGFzcyBleHRlbmRhYmxlXHJcblx0XHRKUUNsYXNzLmV4dGVuZCA9IGV4dGVuZGVyO1xyXG5cclxuXHRcdHJldHVybiBKUUNsYXNzO1xyXG5cdH07XHJcbn0pKCk7XHJcblxyXG4oZnVuY3Rpb24oJCkgeyAvLyBFbnN1cmUgJCwgZW5jYXBzdWxhdGVcclxuXHJcblx0LyoqIEFic3RyYWN0IGJhc2UgY2xhc3MgZm9yIGNvbGxlY3Rpb24gcGx1Z2lucyB2MS4wLjEuXHJcblx0XHRXcml0dGVuIGJ5IEtlaXRoIFdvb2QgKGtid29vZHthdH1paW5ldC5jb20uYXUpIERlY2VtYmVyIDIwMTMuXHJcblx0XHRMaWNlbnNlZCB1bmRlciB0aGUgTUlUIChodHRwczovL2dpdGh1Yi5jb20vanF1ZXJ5L2pxdWVyeS9ibG9iL21hc3Rlci9NSVQtTElDRU5TRS50eHQpIGxpY2Vuc2UuXHJcblx0XHRAbW9kdWxlICQuSlFQbHVnaW5cclxuXHRcdEBhYnN0cmFjdCAqL1xyXG5cdEpRQ2xhc3MuY2xhc3Nlcy5KUVBsdWdpbiA9IEpRQ2xhc3MuZXh0ZW5kKHtcclxuXHJcblx0XHQvKiogTmFtZSB0byBpZGVudGlmeSB0aGlzIHBsdWdpbi5cclxuXHRcdFx0QGV4YW1wbGUgbmFtZTogJ3RhYnMnICovXHJcblx0XHRuYW1lOiAncGx1Z2luJyxcclxuXHJcblx0XHQvKiogRGVmYXVsdCBvcHRpb25zIGZvciBpbnN0YW5jZXMgb2YgdGhpcyBwbHVnaW4gKGRlZmF1bHQ6IHt9KS5cclxuXHRcdFx0QGV4YW1wbGUgZGVmYXVsdE9wdGlvbnM6IHtcclxuIFx0c2VsZWN0ZWRDbGFzczogJ3NlbGVjdGVkJyxcclxuIFx0dHJpZ2dlcnM6ICdjbGljaydcclxuIH0gKi9cclxuXHRcdGRlZmF1bHRPcHRpb25zOiB7fSxcclxuXHRcdFxyXG5cdFx0LyoqIE9wdGlvbnMgZGVwZW5kZW50IG9uIHRoZSBsb2NhbGUuXHJcblx0XHRcdEluZGV4ZWQgYnkgbGFuZ3VhZ2UgYW5kIChvcHRpb25hbCkgY291bnRyeSBjb2RlLCB3aXRoICcnIGRlbm90aW5nIHRoZSBkZWZhdWx0IGxhbmd1YWdlIChFbmdsaXNoL1VTKS5cclxuXHRcdFx0QGV4YW1wbGUgcmVnaW9uYWxPcHRpb25zOiB7XHJcblx0Jyc6IHtcclxuXHRcdGdyZWV0aW5nOiAnSGknXHJcblx0fVxyXG4gfSAqL1xyXG5cdFx0cmVnaW9uYWxPcHRpb25zOiB7fSxcclxuXHRcdFxyXG5cdFx0LyoqIE5hbWVzIG9mIGdldHRlciBtZXRob2RzIC0gdGhvc2UgdGhhdCBjYW4ndCBiZSBjaGFpbmVkIChkZWZhdWx0OiBbXSkuXHJcblx0XHRcdEBleGFtcGxlIF9nZXR0ZXJzOiBbJ2FjdGl2ZVRhYiddICovXHJcblx0XHRfZ2V0dGVyczogW10sXHJcblxyXG5cdFx0LyoqIFJldHJpZXZlIGEgbWFya2VyIGNsYXNzIGZvciBhZmZlY3RlZCBlbGVtZW50cy5cclxuXHRcdFx0QHByaXZhdGVcclxuXHRcdFx0QHJldHVybiB7c3RyaW5nfSBUaGUgbWFya2VyIGNsYXNzLiAqL1xyXG5cdFx0X2dldE1hcmtlcjogZnVuY3Rpb24oKSB7XHJcblx0XHRcdHJldHVybiAnaXMtJyArIHRoaXMubmFtZTtcclxuXHRcdH0sXHJcblx0XHRcclxuXHRcdC8qKiBJbml0aWFsaXNlIHRoZSBwbHVnaW4uXHJcblx0XHRcdENyZWF0ZSB0aGUgalF1ZXJ5IGJyaWRnZSAtIHBsdWdpbiBuYW1lIDxjb2RlPnh5ejwvY29kZT5cclxuXHRcdFx0cHJvZHVjZXMgPGNvZGU+JC54eXo8L2NvZGU+IGFuZCA8Y29kZT4kLmZuLnh5ejwvY29kZT4uICovXHJcblx0XHRfaW5pdDogZnVuY3Rpb24oKSB7XHJcblx0XHRcdC8vIEFwcGx5IGRlZmF1bHQgbG9jYWxpc2F0aW9uc1xyXG5cdFx0XHQkLmV4dGVuZCh0aGlzLmRlZmF1bHRPcHRpb25zLCAodGhpcy5yZWdpb25hbE9wdGlvbnMgJiYgdGhpcy5yZWdpb25hbE9wdGlvbnNbJyddKSB8fCB7fSk7XHJcblx0XHRcdC8vIENhbWVsLWNhc2UgdGhlIG5hbWVcclxuXHRcdFx0dmFyIGpxTmFtZSA9IGNhbWVsQ2FzZSh0aGlzLm5hbWUpO1xyXG5cdFx0XHQvLyBFeHBvc2UgalF1ZXJ5IHNpbmdsZXRvbiBtYW5hZ2VyXHJcblx0XHRcdCRbanFOYW1lXSA9IHRoaXM7XHJcblx0XHRcdC8vIEV4cG9zZSBqUXVlcnkgY29sbGVjdGlvbiBwbHVnaW5cclxuXHRcdFx0JC5mbltqcU5hbWVdID0gZnVuY3Rpb24ob3B0aW9ucykge1xyXG5cdFx0XHRcdHZhciBvdGhlckFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xyXG5cdFx0XHRcdGlmICgkW2pxTmFtZV0uX2lzTm90Q2hhaW5lZChvcHRpb25zLCBvdGhlckFyZ3MpKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gJFtqcU5hbWVdW29wdGlvbnNdLmFwcGx5KCRbanFOYW1lXSwgW3RoaXNbMF1dLmNvbmNhdChvdGhlckFyZ3MpKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0cmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ3N0cmluZycpIHtcclxuXHRcdFx0XHRcdFx0aWYgKG9wdGlvbnNbMF0gPT09ICdfJyB8fCAhJFtqcU5hbWVdW29wdGlvbnNdKSB7XHJcblx0XHRcdFx0XHRcdFx0dGhyb3cgJ1Vua25vd24gbWV0aG9kOiAnICsgb3B0aW9ucztcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHQkW2pxTmFtZV1bb3B0aW9uc10uYXBwbHkoJFtqcU5hbWVdLCBbdGhpc10uY29uY2F0KG90aGVyQXJncykpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0XHRcdCRbanFOYW1lXS5fYXR0YWNoKHRoaXMsIG9wdGlvbnMpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9O1xyXG5cdFx0fSxcclxuXHJcblx0XHQvKiogU2V0IGRlZmF1bHQgdmFsdWVzIGZvciBhbGwgc3Vic2VxdWVudCBpbnN0YW5jZXMuXHJcblx0XHRcdEBwYXJhbSBvcHRpb25zIHtvYmplY3R9IFRoZSBuZXcgZGVmYXVsdCBvcHRpb25zLlxyXG5cdFx0XHRAZXhhbXBsZSAkLnBsdWdpbi5zZXREZWZhdWxzKHtuYW1lOiB2YWx1ZX0pICovXHJcblx0XHRzZXREZWZhdWx0czogZnVuY3Rpb24ob3B0aW9ucykge1xyXG5cdFx0XHQkLmV4dGVuZCh0aGlzLmRlZmF1bHRPcHRpb25zLCBvcHRpb25zIHx8IHt9KTtcclxuXHRcdH0sXHJcblx0XHRcclxuXHRcdC8qKiBEZXRlcm1pbmUgd2hldGhlciBhIG1ldGhvZCBpcyBhIGdldHRlciBhbmQgZG9lc24ndCBwZXJtaXQgY2hhaW5pbmcuXHJcblx0XHRcdEBwcml2YXRlXHJcblx0XHRcdEBwYXJhbSBuYW1lIHtzdHJpbmd9IFRoZSBtZXRob2QgbmFtZS5cclxuXHRcdFx0QHBhcmFtIG90aGVyQXJncyB7YW55W119IEFueSBvdGhlciBhcmd1bWVudHMgZm9yIHRoZSBtZXRob2QuXHJcblx0XHRcdEByZXR1cm4ge2Jvb2xlYW59IFRydWUgaWYgdGhpcyBtZXRob2QgaXMgYSBnZXR0ZXIsIGZhbHNlIG90aGVyd2lzZS4gKi9cclxuXHRcdF9pc05vdENoYWluZWQ6IGZ1bmN0aW9uKG5hbWUsIG90aGVyQXJncykge1xyXG5cdFx0XHRpZiAobmFtZSA9PT0gJ29wdGlvbicgJiYgKG90aGVyQXJncy5sZW5ndGggPT09IDAgfHxcclxuXHRcdFx0XHRcdChvdGhlckFyZ3MubGVuZ3RoID09PSAxICYmIHR5cGVvZiBvdGhlckFyZ3NbMF0gPT09ICdzdHJpbmcnKSkpIHtcclxuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gJC5pbkFycmF5KG5hbWUsIHRoaXMuX2dldHRlcnMpID4gLTE7XHJcblx0XHR9LFxyXG5cdFx0XHJcblx0XHQvKiogSW5pdGlhbGlzZSBhbiBlbGVtZW50LiBDYWxsZWQgaW50ZXJuYWxseSBvbmx5LlxyXG5cdFx0XHRBZGRzIGFuIGluc3RhbmNlIG9iamVjdCBhcyBkYXRhIG5hbWVkIGZvciB0aGUgcGx1Z2luLlxyXG5cdFx0XHRAcGFyYW0gZWxlbSB7RWxlbWVudH0gVGhlIGVsZW1lbnQgdG8gZW5oYW5jZS5cclxuXHRcdFx0QHBhcmFtIG9wdGlvbnMge29iamVjdH0gT3ZlcnJpZGluZyBzZXR0aW5ncy4gKi9cclxuXHRcdF9hdHRhY2g6IGZ1bmN0aW9uKGVsZW0sIG9wdGlvbnMpIHtcclxuXHRcdFx0ZWxlbSA9ICQoZWxlbSk7XHJcblx0XHRcdGlmIChlbGVtLmhhc0NsYXNzKHRoaXMuX2dldE1hcmtlcigpKSkge1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cdFx0XHRlbGVtLmFkZENsYXNzKHRoaXMuX2dldE1hcmtlcigpKTtcclxuXHRcdFx0b3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCB0aGlzLmRlZmF1bHRPcHRpb25zLCB0aGlzLl9nZXRNZXRhZGF0YShlbGVtKSwgb3B0aW9ucyB8fCB7fSk7XHJcblx0XHRcdHZhciBpbnN0ID0gJC5leHRlbmQoe25hbWU6IHRoaXMubmFtZSwgZWxlbTogZWxlbSwgb3B0aW9uczogb3B0aW9uc30sXHJcblx0XHRcdFx0dGhpcy5faW5zdFNldHRpbmdzKGVsZW0sIG9wdGlvbnMpKTtcclxuXHRcdFx0ZWxlbS5kYXRhKHRoaXMubmFtZSwgaW5zdCk7IC8vIFNhdmUgaW5zdGFuY2UgYWdhaW5zdCBlbGVtZW50XHJcblx0XHRcdHRoaXMuX3Bvc3RBdHRhY2goZWxlbSwgaW5zdCk7XHJcblx0XHRcdHRoaXMub3B0aW9uKGVsZW0sIG9wdGlvbnMpO1xyXG5cdFx0fSxcclxuXHJcblx0XHQvKiogUmV0cmlldmUgYWRkaXRpb25hbCBpbnN0YW5jZSBzZXR0aW5ncy5cclxuXHRcdFx0T3ZlcnJpZGUgdGhpcyBpbiBhIHN1Yi1jbGFzcyB0byBwcm92aWRlIGV4dHJhIHNldHRpbmdzLlxyXG5cdFx0XHRAcGFyYW0gZWxlbSB7alF1ZXJ5fSBUaGUgY3VycmVudCBqUXVlcnkgZWxlbWVudC5cclxuXHRcdFx0QHBhcmFtIG9wdGlvbnMge29iamVjdH0gVGhlIGluc3RhbmNlIG9wdGlvbnMuXHJcblx0XHRcdEByZXR1cm4ge29iamVjdH0gQW55IGV4dHJhIGluc3RhbmNlIHZhbHVlcy5cclxuXHRcdFx0QGV4YW1wbGUgX2luc3RTZXR0aW5nczogZnVuY3Rpb24oZWxlbSwgb3B0aW9ucykge1xyXG4gXHRyZXR1cm4ge25hdjogZWxlbS5maW5kKG9wdGlvbnMubmF2U2VsZWN0b3IpfTtcclxuIH0gKi9cclxuXHRcdF9pbnN0U2V0dGluZ3M6IGZ1bmN0aW9uKGVsZW0sIG9wdGlvbnMpIHtcclxuXHRcdFx0cmV0dXJuIHt9O1xyXG5cdFx0fSxcclxuXHJcblx0XHQvKiogUGx1Z2luIHNwZWNpZmljIHBvc3QgaW5pdGlhbGlzYXRpb24uXHJcblx0XHRcdE92ZXJyaWRlIHRoaXMgaW4gYSBzdWItY2xhc3MgdG8gcGVyZm9ybSBleHRyYSBhY3Rpdml0aWVzLlxyXG5cdFx0XHRAcGFyYW0gZWxlbSB7alF1ZXJ5fSBUaGUgY3VycmVudCBqUXVlcnkgZWxlbWVudC5cclxuXHRcdFx0QHBhcmFtIGluc3Qge29iamVjdH0gVGhlIGluc3RhbmNlIHNldHRpbmdzLlxyXG5cdFx0XHRAZXhhbXBsZSBfcG9zdEF0dGFjaDogZnVuY3Rpb24oZWxlbSwgaW5zdCkge1xyXG4gXHRlbGVtLm9uKCdjbGljay4nICsgdGhpcy5uYW1lLCBmdW5jdGlvbigpIHtcclxuIFx0XHQuLi5cclxuIFx0fSk7XHJcbiB9ICovXHJcblx0XHRfcG9zdEF0dGFjaDogZnVuY3Rpb24oZWxlbSwgaW5zdCkge1xyXG5cdFx0fSxcclxuXHJcblx0XHQvKiogUmV0cmlldmUgbWV0YWRhdGEgY29uZmlndXJhdGlvbiBmcm9tIHRoZSBlbGVtZW50LlxyXG5cdFx0XHRNZXRhZGF0YSBpcyBzcGVjaWZpZWQgYXMgYW4gYXR0cmlidXRlOlxyXG5cdFx0XHQ8Y29kZT5kYXRhLSZsdDtwbHVnaW4gbmFtZT49XCImbHQ7c2V0dGluZyBuYW1lPjogJyZsdDt2YWx1ZT4nLCAuLi5cIjwvY29kZT4uXHJcblx0XHRcdERhdGVzIHNob3VsZCBiZSBzcGVjaWZpZWQgYXMgc3RyaW5ncyBpbiB0aGlzIGZvcm1hdDogJ25ldyBEYXRlKHksIG0tMSwgZCknLlxyXG5cdFx0XHRAcHJpdmF0ZVxyXG5cdFx0XHRAcGFyYW0gZWxlbSB7alF1ZXJ5fSBUaGUgc291cmNlIGVsZW1lbnQuXHJcblx0XHRcdEByZXR1cm4ge29iamVjdH0gVGhlIGlubGluZSBjb25maWd1cmF0aW9uIG9yIHt9LiAqL1xyXG5cdFx0X2dldE1ldGFkYXRhOiBmdW5jdGlvbihlbGVtKSB7XHJcblx0XHRcdHRyeSB7XHJcblx0XHRcdFx0dmFyIGRhdGEgPSBlbGVtLmRhdGEodGhpcy5uYW1lLnRvTG93ZXJDYXNlKCkpIHx8ICcnO1xyXG5cdFx0XHRcdGRhdGEgPSBkYXRhLnJlcGxhY2UoLycvZywgJ1wiJyk7XHJcblx0XHRcdFx0ZGF0YSA9IGRhdGEucmVwbGFjZSgvKFthLXpBLVowLTldKyk6L2csIGZ1bmN0aW9uKG1hdGNoLCBncm91cCwgaSkgeyBcclxuXHRcdFx0XHRcdHZhciBjb3VudCA9IGRhdGEuc3Vic3RyaW5nKDAsIGkpLm1hdGNoKC9cIi9nKTsgLy8gSGFuZGxlIGVtYmVkZGVkICc6J1xyXG5cdFx0XHRcdFx0cmV0dXJuICghY291bnQgfHwgY291bnQubGVuZ3RoICUgMiA9PT0gMCA/ICdcIicgKyBncm91cCArICdcIjonIDogZ3JvdXAgKyAnOicpO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHRcdGRhdGEgPSAkLnBhcnNlSlNPTigneycgKyBkYXRhICsgJ30nKTtcclxuXHRcdFx0XHRmb3IgKHZhciBuYW1lIGluIGRhdGEpIHsgLy8gQ29udmVydCBkYXRlc1xyXG5cdFx0XHRcdFx0dmFyIHZhbHVlID0gZGF0YVtuYW1lXTtcclxuXHRcdFx0XHRcdGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHZhbHVlLm1hdGNoKC9ebmV3IERhdGVcXCgoLiopXFwpJC8pKSB7XHJcblx0XHRcdFx0XHRcdGRhdGFbbmFtZV0gPSBldmFsKHZhbHVlKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0cmV0dXJuIGRhdGE7XHJcblx0XHRcdH1cclxuXHRcdFx0Y2F0Y2ggKGUpIHtcclxuXHRcdFx0XHRyZXR1cm4ge307XHJcblx0XHRcdH1cclxuXHRcdH0sXHJcblxyXG5cdFx0LyoqIFJldHJpZXZlIHRoZSBpbnN0YW5jZSBkYXRhIGZvciBlbGVtZW50LlxyXG5cdFx0XHRAcGFyYW0gZWxlbSB7RWxlbWVudH0gVGhlIHNvdXJjZSBlbGVtZW50LlxyXG5cdFx0XHRAcmV0dXJuIHtvYmplY3R9IFRoZSBpbnN0YW5jZSBkYXRhIG9yIHt9LiAqL1xyXG5cdFx0X2dldEluc3Q6IGZ1bmN0aW9uKGVsZW0pIHtcclxuXHRcdFx0cmV0dXJuICQoZWxlbSkuZGF0YSh0aGlzLm5hbWUpIHx8IHt9O1xyXG5cdFx0fSxcclxuXHRcdFxyXG5cdFx0LyoqIFJldHJpZXZlIG9yIHJlY29uZmlndXJlIHRoZSBzZXR0aW5ncyBmb3IgYSBwbHVnaW4uXHJcblx0XHRcdEBwYXJhbSBlbGVtIHtFbGVtZW50fSBUaGUgc291cmNlIGVsZW1lbnQuXHJcblx0XHRcdEBwYXJhbSBuYW1lIHtvYmplY3R8c3RyaW5nfSBUaGUgY29sbGVjdGlvbiBvZiBuZXcgb3B0aW9uIHZhbHVlcyBvciB0aGUgbmFtZSBvZiBhIHNpbmdsZSBvcHRpb24uXHJcblx0XHRcdEBwYXJhbSBbdmFsdWVdIHthbnl9IFRoZSB2YWx1ZSBmb3IgYSBzaW5nbGUgbmFtZWQgb3B0aW9uLlxyXG5cdFx0XHRAcmV0dXJuIHthbnl8b2JqZWN0fSBJZiByZXRyaWV2aW5nIGEgc2luZ2xlIHZhbHVlIG9yIGFsbCBvcHRpb25zLlxyXG5cdFx0XHRAZXhhbXBsZSAkKHNlbGVjdG9yKS5wbHVnaW4oJ29wdGlvbicsICduYW1lJywgdmFsdWUpXHJcbiAkKHNlbGVjdG9yKS5wbHVnaW4oJ29wdGlvbicsIHtuYW1lOiB2YWx1ZSwgLi4ufSlcclxuIHZhciB2YWx1ZSA9ICQoc2VsZWN0b3IpLnBsdWdpbignb3B0aW9uJywgJ25hbWUnKVxyXG4gdmFyIG9wdGlvbnMgPSAkKHNlbGVjdG9yKS5wbHVnaW4oJ29wdGlvbicpICovXHJcblx0XHRvcHRpb246IGZ1bmN0aW9uKGVsZW0sIG5hbWUsIHZhbHVlKSB7XHJcblx0XHRcdGVsZW0gPSAkKGVsZW0pO1xyXG5cdFx0XHR2YXIgaW5zdCA9IGVsZW0uZGF0YSh0aGlzLm5hbWUpO1xyXG5cdFx0XHRpZiAgKCFuYW1lIHx8ICh0eXBlb2YgbmFtZSA9PT0gJ3N0cmluZycgJiYgdmFsdWUgPT0gbnVsbCkpIHtcclxuXHRcdFx0XHR2YXIgb3B0aW9ucyA9IChpbnN0IHx8IHt9KS5vcHRpb25zO1xyXG5cdFx0XHRcdHJldHVybiAob3B0aW9ucyAmJiBuYW1lID8gb3B0aW9uc1tuYW1lXSA6IG9wdGlvbnMpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmICghZWxlbS5oYXNDbGFzcyh0aGlzLl9nZXRNYXJrZXIoKSkpIHtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHRcdFx0dmFyIG9wdGlvbnMgPSBuYW1lIHx8IHt9O1xyXG5cdFx0XHRpZiAodHlwZW9mIG5hbWUgPT09ICdzdHJpbmcnKSB7XHJcblx0XHRcdFx0b3B0aW9ucyA9IHt9O1xyXG5cdFx0XHRcdG9wdGlvbnNbbmFtZV0gPSB2YWx1ZTtcclxuXHRcdFx0fVxyXG5cdFx0XHR0aGlzLl9vcHRpb25zQ2hhbmdlZChlbGVtLCBpbnN0LCBvcHRpb25zKTtcclxuXHRcdFx0JC5leHRlbmQoaW5zdC5vcHRpb25zLCBvcHRpb25zKTtcclxuXHRcdH0sXHJcblx0XHRcclxuXHRcdC8qKiBQbHVnaW4gc3BlY2lmaWMgb3B0aW9ucyBwcm9jZXNzaW5nLlxyXG5cdFx0XHRPbGQgdmFsdWUgYXZhaWxhYmxlIGluIDxjb2RlPmluc3Qub3B0aW9uc1tuYW1lXTwvY29kZT4sIG5ldyB2YWx1ZSBpbiA8Y29kZT5vcHRpb25zW25hbWVdPC9jb2RlPi5cclxuXHRcdFx0T3ZlcnJpZGUgdGhpcyBpbiBhIHN1Yi1jbGFzcyB0byBwZXJmb3JtIGV4dHJhIGFjdGl2aXRpZXMuXHJcblx0XHRcdEBwYXJhbSBlbGVtIHtqUXVlcnl9IFRoZSBjdXJyZW50IGpRdWVyeSBlbGVtZW50LlxyXG5cdFx0XHRAcGFyYW0gaW5zdCB7b2JqZWN0fSBUaGUgaW5zdGFuY2Ugc2V0dGluZ3MuXHJcblx0XHRcdEBwYXJhbSBvcHRpb25zIHtvYmplY3R9IFRoZSBuZXcgb3B0aW9ucy5cclxuXHRcdFx0QGV4YW1wbGUgX29wdGlvbnNDaGFuZ2VkOiBmdW5jdGlvbihlbGVtLCBpbnN0LCBvcHRpb25zKSB7XHJcbiBcdGlmIChvcHRpb25zLm5hbWUgIT0gaW5zdC5vcHRpb25zLm5hbWUpIHtcclxuIFx0XHRlbGVtLnJlbW92ZUNsYXNzKGluc3Qub3B0aW9ucy5uYW1lKS5hZGRDbGFzcyhvcHRpb25zLm5hbWUpO1xyXG4gXHR9XHJcbiB9ICovXHJcblx0XHRfb3B0aW9uc0NoYW5nZWQ6IGZ1bmN0aW9uKGVsZW0sIGluc3QsIG9wdGlvbnMpIHtcclxuXHRcdH0sXHJcblx0XHRcclxuXHRcdC8qKiBSZW1vdmUgYWxsIHRyYWNlIG9mIHRoZSBwbHVnaW4uXHJcblx0XHRcdE92ZXJyaWRlIDxjb2RlPl9wcmVEZXN0cm95PC9jb2RlPiBmb3IgcGx1Z2luLXNwZWNpZmljIHByb2Nlc3NpbmcuXHJcblx0XHRcdEBwYXJhbSBlbGVtIHtFbGVtZW50fSBUaGUgc291cmNlIGVsZW1lbnQuXHJcblx0XHRcdEBleGFtcGxlICQoc2VsZWN0b3IpLnBsdWdpbignZGVzdHJveScpICovXHJcblx0XHRkZXN0cm95OiBmdW5jdGlvbihlbGVtKSB7XHJcblx0XHRcdGVsZW0gPSAkKGVsZW0pO1xyXG5cdFx0XHRpZiAoIWVsZW0uaGFzQ2xhc3ModGhpcy5fZ2V0TWFya2VyKCkpKSB7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblx0XHRcdHRoaXMuX3ByZURlc3Ryb3koZWxlbSwgdGhpcy5fZ2V0SW5zdChlbGVtKSk7XHJcblx0XHRcdGVsZW0ucmVtb3ZlRGF0YSh0aGlzLm5hbWUpLnJlbW92ZUNsYXNzKHRoaXMuX2dldE1hcmtlcigpKTtcclxuXHRcdH0sXHJcblxyXG5cdFx0LyoqIFBsdWdpbiBzcGVjaWZpYyBwcmUgZGVzdHJ1Y3Rpb24uXHJcblx0XHRcdE92ZXJyaWRlIHRoaXMgaW4gYSBzdWItY2xhc3MgdG8gcGVyZm9ybSBleHRyYSBhY3Rpdml0aWVzIGFuZCB1bmRvIGV2ZXJ5dGhpbmcgdGhhdCB3YXNcclxuXHRcdFx0ZG9uZSBpbiB0aGUgPGNvZGU+X3Bvc3RBdHRhY2g8L2NvZGU+IG9yIDxjb2RlPl9vcHRpb25zQ2hhbmdlZDwvY29kZT4gZnVuY3Rpb25zLlxyXG5cdFx0XHRAcGFyYW0gZWxlbSB7alF1ZXJ5fSBUaGUgY3VycmVudCBqUXVlcnkgZWxlbWVudC5cclxuXHRcdFx0QHBhcmFtIGluc3Qge29iamVjdH0gVGhlIGluc3RhbmNlIHNldHRpbmdzLlxyXG5cdFx0XHRAZXhhbXBsZSBfcHJlRGVzdHJveTogZnVuY3Rpb24oZWxlbSwgaW5zdCkge1xyXG4gXHRlbGVtLm9mZignLicgKyB0aGlzLm5hbWUpO1xyXG4gfSAqL1xyXG5cdFx0X3ByZURlc3Ryb3k6IGZ1bmN0aW9uKGVsZW0sIGluc3QpIHtcclxuXHRcdH1cclxuXHR9KTtcclxuXHRcclxuXHQvKiogQ29udmVydCBuYW1lcyBmcm9tIGh5cGhlbmF0ZWQgdG8gY2FtZWwtY2FzZS5cclxuXHRcdEBwcml2YXRlXHJcblx0XHRAcGFyYW0gdmFsdWUge3N0cmluZ30gVGhlIG9yaWdpbmFsIGh5cGhlbmF0ZWQgbmFtZS5cclxuXHRcdEByZXR1cm4ge3N0cmluZ30gVGhlIGNhbWVsLWNhc2UgdmVyc2lvbi4gKi9cclxuXHRmdW5jdGlvbiBjYW1lbENhc2UobmFtZSkge1xyXG5cdFx0cmV0dXJuIG5hbWUucmVwbGFjZSgvLShbYS16XSkvZywgZnVuY3Rpb24obWF0Y2gsIGdyb3VwKSB7XHJcblx0XHRcdHJldHVybiBncm91cC50b1VwcGVyQ2FzZSgpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cdFxyXG5cdC8qKiBFeHBvc2UgdGhlIHBsdWdpbiBiYXNlLlxyXG5cdFx0QG5hbWVzcGFjZSBcIiQuSlFQbHVnaW5cIiAqL1xyXG5cdCQuSlFQbHVnaW4gPSB7XHJcblx0XHJcblx0XHQvKiogQ3JlYXRlIGEgbmV3IGNvbGxlY3Rpb24gcGx1Z2luLlxyXG5cdFx0XHRAbWVtYmVyb2YgXCIkLkpRUGx1Z2luXCJcclxuXHRcdFx0QHBhcmFtIFtzdXBlckNsYXNzPSdKUVBsdWdpbiddIHtzdHJpbmd9IFRoZSBuYW1lIG9mIHRoZSBwYXJlbnQgY2xhc3MgdG8gaW5oZXJpdCBmcm9tLlxyXG5cdFx0XHRAcGFyYW0gb3ZlcnJpZGVzIHtvYmplY3R9IFRoZSBwcm9wZXJ0eS9mdW5jdGlvbiBvdmVycmlkZXMgZm9yIHRoZSBuZXcgY2xhc3MuXHJcblx0XHRcdEBleGFtcGxlICQuSlFQbHVnaW4uY3JlYXRlUGx1Z2luKHtcclxuIFx0bmFtZTogJ3RhYnMnLFxyXG4gXHRkZWZhdWx0T3B0aW9uczoge3NlbGVjdGVkQ2xhc3M6ICdzZWxlY3RlZCd9LFxyXG4gXHRfaW5pdFNldHRpbmdzOiBmdW5jdGlvbihlbGVtLCBvcHRpb25zKSB7IHJldHVybiB7Li4ufTsgfSxcclxuIFx0X3Bvc3RBdHRhY2g6IGZ1bmN0aW9uKGVsZW0sIGluc3QpIHsgLi4uIH1cclxuIH0pOyAqL1xyXG5cdFx0Y3JlYXRlUGx1Z2luOiBmdW5jdGlvbihzdXBlckNsYXNzLCBvdmVycmlkZXMpIHtcclxuXHRcdFx0aWYgKHR5cGVvZiBzdXBlckNsYXNzID09PSAnb2JqZWN0Jykge1xyXG5cdFx0XHRcdG92ZXJyaWRlcyA9IHN1cGVyQ2xhc3M7XHJcblx0XHRcdFx0c3VwZXJDbGFzcyA9ICdKUVBsdWdpbic7XHJcblx0XHRcdH1cclxuXHRcdFx0c3VwZXJDbGFzcyA9IGNhbWVsQ2FzZShzdXBlckNsYXNzKTtcclxuXHRcdFx0dmFyIGNsYXNzTmFtZSA9IGNhbWVsQ2FzZShvdmVycmlkZXMubmFtZSk7XHJcblx0XHRcdEpRQ2xhc3MuY2xhc3Nlc1tjbGFzc05hbWVdID0gSlFDbGFzcy5jbGFzc2VzW3N1cGVyQ2xhc3NdLmV4dGVuZChvdmVycmlkZXMpO1xyXG5cdFx0XHRuZXcgSlFDbGFzcy5jbGFzc2VzW2NsYXNzTmFtZV0oKTtcclxuXHRcdH1cclxuXHR9O1xyXG5cclxufSkoalF1ZXJ5KTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
