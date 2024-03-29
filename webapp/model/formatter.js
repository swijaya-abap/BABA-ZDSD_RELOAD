sap.ui.define([], function () {
	"use strict";

	return {

		/**
		 * Rounds the number unit value to 2 digits
		 * @public
		 * @param {string} sValue the number string to be rounded
		 * @returns {string} sValue with 2 digits rounded
		 */
		numberUnit: function (sValue) {
			if (!sValue) {
				return "";
			}
			return parseFloat(sValue).toFixed(2);
		},
		
		colorval1: function (sValue) {
			if (sValue === "X") {
				return "sap-icon://accept";
			}
			// } else {
			// 	return "Warning";
			// }
		},

		colorval: function (sValue) {
			if (sValue === "X") {
				return "Success";
			}
			// } else {
			// 	return "Warning";
			// }
		},
		
			colorval2: function (sValue) {
			if (sValue === "X") {
				return "sap-icon://shipping-status";
			}
			else if ( sValue === "Y") {
				return "sap-icon://ppt-attachment";
			}
			// } else {
			// 	return "Warning";
			// }
		}


	};

});