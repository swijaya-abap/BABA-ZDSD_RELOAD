/*global location history */
sap.ui.define([
	"com/baba/ZDSD_RELOAD/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"com/baba/ZDSD_RELOAD/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator, MessageBox) {
	"use strict";

	return BaseController.extend("com.baba.ZDSD_RELOAD.controller.Worklist", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function () {
			// var oViewModel,
			// 	iOriginalBusyDelay,
			// 	oTable = this.byId("table");

			var oViewModel = new JSONModel();
			this.setModel(oViewModel, "worklistView");
			this.getOwnerComponent().getModel().setSizeLimit('9999');

			var oViewModel1 = new JSONModel();
			this.setModel(oViewModel1, "worklistView1");
			this.getOwnerComponent().getModel().setSizeLimit('9999');

			// // Put down worklist table's original value for busy indicator delay,
			// // so it can be restored later on. Busy handling on the table is
			// // taken care of by the table itself.
			// iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
			// // keeps the search state
			// this._aTableSearchState = [];

			// // Model used to manipulate control states
			// oViewModel = new JSONModel({
			// 	worklistTableTitle : this.getResourceBundle().getText("worklistTableTitle"),
			// 	shareOnJamTitle: this.getResourceBundle().getText("worklistTitle"),
			// 	shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
			// 	shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
			// 	tableNoDataText : this.getResourceBundle().getText("tableNoDataText"),
			// 	tableBusyDelay : 0
			// });
			// this.setModel(oViewModel, "worklistView");

			// // Make sure, busy indication is showing immediately so there is no
			// // break after the busy indication for loading the view's meta data is
			// // ended (see promise 'oWhenMetadataIsLoaded' in AppController)
			// oTable.attachEventOnce("updateFinished", function(){
			// 	// Restore original busy indicator delay for worklist's table
			// 	oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
			// });

			var oModelt = new JSONModel();
			this.getView().byId("table1").setModel(oModelt);
			this.getView().byId("table1").getModel().setSizeLimit('10000');

			var oModelt1 = new JSONModel();
			this.getView().byId("table").setModel(oModelt1);
			this.getView().byId("table").getModel().setSizeLimit('10000');

			var oShipModel = new JSONModel();
			this.getView().byId("SHIP").setModel(oShipModel);

			// 			var oModelt2 = new JSONModel();
			// this.getView().byId("searchField").setModel(oModelt2);
			// this.getView().byId("searchField").getModel().setSizeLimit('10000');

		},

		onBusyS: function (oBusy) {
			oBusy.open();
			oBusy.setBusyIndicatorDelay(40000);
		},

		onBusyE: function (oBusy) {
			oBusy.close();
		},

		onEdes: function () {
			var that = this;
			that.getView().byId("EDES").setValue();
			var input = this.getView().byId("FET").getValue();
			if (input !== "") {
				// var val = this.getView().byId("searchField");
				// var oModel2 = val.getModel();
				//var itemData = this.getView().getModel(); //getProperty("/MATERIALINSet");

				// var oModel1 = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZDSDO_RELOAD_SRV/", true);
				// var val = oModel1.read("/GETDETSet");

				var sData = this.getView().getModel("worklistView").getProperty("/GETDETSet");

				// var item = oModel1.oData.data;
				var oTable1 = that.getView().byId("table1");

				var oModel1 = oTable1.getModel();
				var aItems1 = oModel1.oData.data; //All rows

				for (var iRowIndex2 = 0; iRowIndex2 < aItems1.length; iRowIndex2++) {
					var l_maktx = aItems1[iRowIndex2].MAKTX;
					var l_eanb = aItems1[iRowIndex2].EANB;
					var l_eanp = aItems1[iRowIndex2].EANP;

					if (l_eanb === input || l_eanp === input) {
						this.getView().byId("EDES").setValue(l_maktx);
					}
				}
			}
		},

		_clrShipment: function () {
			var oModel = this.byId("SHIP").getModel();
			var data;
			oModel.setData({
				modelData: data
			});
			oModel.refresh(true);
			this.byId("SHIP").setSelectedKey();
		},

		onChgRoute: function () {
			this._clrShipment();
			this.onShipSelectionChange();
		},

		onGetShipment: function () {
			var that = this;
			this._clrShipment();
			var route = this.byId("ROUTE").getSelectedKey();
			if (!route) {
				sap.m.MessageToast.show("Please select Route to Fetch Shipment");
			} else {
				var PLFilters = [];
				PLFilters.push(new sap.ui.model.Filter({
					path: "ROUTE",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: route
				}));

				var oBusy = new sap.m.BusyDialog();
				that.onBusyS(oBusy);

				var oModel = this.byId("SHIP").getModel();
				var oItem = oModel.getProperty("/shipmentData");
				var oModel1 = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZDSDO_RELOAD_SRV/", true);

				oModel1.read("/SHIPMENTSet", {
					filters: PLFilters,

					success: function (oData, oResponse) {
						var res = [];
						res = oData.results;

						if (res.length > 0) {
							for (var iRowIndex = 0; iRowIndex < res.length; iRowIndex++) {
								var itemRow = {
									SHIPMENTV: res[iRowIndex].SHIPMENTV,
								};

								if (typeof oItem !== "undefined" && oItem.length > 0) {
									oItem.push(itemRow);
								} else {
									oItem = [];
									oItem.push(itemRow);
								}
							}

							// // Set Model
							oModel.setData({
								shipmentData: oItem
							});
							oModel.refresh(true);

							sap.m.MessageToast.show("Shipment fetched");
						}else{
							sap.m.MessageToast.show("Shipment not found");
						}

						//************************get values from backend based on filter Date*******************************************//
						that.onBusyE(oBusy);
					},
					error: function (oResponse) {
						that.onBusyE(oBusy);
						var oMsg = JSON.parse(oResponse.responseText);
						jQuery.sap.require("sap.m.MessageBox");
						sap.m.MessageToast.show(oMsg.error.message.value);
					}
				});
			}
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Triggered by the table's 'updateFinished' event: after new table
		 * data is available, this handler method updates the table counter.
		 * This should only happen if the update was successful, which is
		 * why this handler is attached to 'updateFinished' and not to the
		 * table's list binding's 'dataReceived' method.
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
		onblank: function (iModel) {
			//************************set blank values to table*******************************************//
			var data;
			var noData = iModel.getProperty("/data");
			iModel.setData({
				modelData: noData
			});
			iModel.setData({
				modelData: data
			});
			iModel.refresh(true);
		},

		onShipSelectionChange: function (oEvent) {
			var that = this;
			// var sSelectedKey = oEvent.getSource().getSelectedKey();
			var oModel = that.getView().byId("table").getModel();
			that.onblank(oModel);
			that.getView().byId("table").removeSelections(true);
			var oModel1 = that.getView().byId("table1").getModel();
			that.onblank(oModel1);
			that.getView().byId("VEHICLE").setValue();
			that.getView().byId("DRIVER1").setValue();
			that.getView().byId("OBJ_ID").setValue();
			that.getView().byId("OBJ_TYP").setValue();
			that.getView().byId("OBJ_TYP").setValue();
			that.getView().byId("RELOAD_SEQUENCE").setValue();
			that.getView().byId("RELOAD_STATUS").setValue();
			that.getView().byId("PLANT").setValue();
			that.getView().byId("CREUSER").setValue();
			that.getView().byId("CNGUSER").setValue();
			that.getView().byId("CONF").setSelected(false);
		},

		onSearchA: function (oEvent) { //search by material
			// this.onRef(this, "X");
			var input0 = oEvent.getParameter("query");
			var input1 = input0.split(" - ");
			var input = input1[0];

			var flg = "";
			var oTable = this.byId("table");
			var oModel = oTable.getModel();
			var aItems = oModel.oData.data; //All rows  

			if (input !== "") {
				// var aItems = oTable.getItems(); //All rows  
				if (aItems === undefined) {
					sap.m.MessageToast.show("No Item to search");
				} else {
					for (var iRowIndex1 = 0; iRowIndex1 < aItems.length; iRowIndex1++) {
						// var l_ean11 = oModel.getProperty("EAN11", aItems[iRowIndex1].getBindingContext());
						var l_matnr = aItems[iRowIndex1].MATNR;
						if (l_matnr === input) {
							flg = "X";
							break;
						}
					}
				}

				if (flg === "X") {
					// this.getView().byId("NMATNR").setValue(input);
					var aTableSearchState = [];
					var sQuery = input; //oEvent.getParameter("query");

					if (sQuery && sQuery.length > 0) {
						aTableSearchState = [new Filter("MATNR", FilterOperator.Contains, sQuery)];
					}
					this._applySearch(aTableSearchState);
				} else {
					sap.m.MessageToast.show("Item doesn't exit in list");
				}
			} else {
				sQuery = input; //oEvent.getParameter("query");

				if (sQuery && sQuery.length > 0) {
					aTableSearchState = [new Filter("MATNR", FilterOperator.Contains, sQuery)];
					//new Filter("MATNR", FilterOperator.Contains, sQuery.toUpperCase())
				}
				this._applySearch(aTableSearchState);
			}

		},

		onSuggestM: function (event) {
			//////add
			var oView = this.getView();
			oView.setModel(this.oModel);
			this.oSearchField = oView.byId("searchField");

			var oModelt1 = new JSONModel();
			this.getView().byId("searchField").setModel(oModelt1);
			this.getView().byId("searchField").getModel().setSizeLimit('10000');

			var oTable = this.byId("table1");
			var oModel = oTable.getModel();
			var aItems = oModel.oData.data; //All rows  

			if (aItems.length > 0) {
				// this.getView().byId("searchField").setModel();
				var oModel2 = this.oSearchField.getModel();
				var itemData = oModel2.getProperty("/MATERIALINSet");

				for (var iRowIndex = 0; iRowIndex < aItems.length; iRowIndex++) {
					var l_matnr = aItems[iRowIndex].MATNR;
					var l_matkx = aItems[iRowIndex].MAKTX;

					var itemRow = {
						MATNR: l_matnr,
						MAKTX: l_matkx
					};

					if (typeof itemData !== "undefined" && itemData.length > 0) {
						itemData.push(itemRow);
					} else {
						itemData = [];
						itemData.push(itemRow);
					}
				}

				// // Set Model
				oModel2.setData({
					MATERIALINSet: itemData
				});
				oModel2.refresh(true);

				var sQuery = event.getParameter("suggestValue");
				var aFilters = [];
				if (sQuery) {
					aFilters = new Filter({
						filters: [
							new Filter("MATNR", FilterOperator.Contains, sQuery),
							new Filter("MATNR", FilterOperator.Contains, sQuery.toUpperCase()),
							new Filter("MAKTX", FilterOperator.Contains, sQuery),
							new Filter("MAKTX", FilterOperator.Contains, sQuery.toUpperCase())

						],
						and: false
					});
				}

				this.oSearchField.getBinding("suggestionItems").filter(aFilters);
				this.oSearchField.suggest();
			}
		},

		onGet: function (oEvent) {
			var that = this;
			that.onShipSelectionChange();

			var ship = this.getView().byId("SHIP").getSelectedKey();
			if (ship === "" || ship === undefined) {
				sap.m.MessageToast.show("No Shipment selected");
			} else {
				var sPath = "/DETAILSet(SHIPMENTV='" + ship + "',PLANT='')";

				var oModel1 = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZDSDO_RELOAD_SRV/", true);
				var oBusy = new sap.m.BusyDialog();
				that.onBusyS(oBusy);

				oModel1.read(sPath, {
					success: function (oData) {
						that.getView().byId("VEHICLE").setValue(oData.VEHICLE);
						that.getView().byId("DRIVER1").setValue(oData.DRIVER1);
						that.getView().byId("OBJ_ID").setValue(oData.OBJ_ID);
						that.getView().byId("OBJ_TYP").setValue(oData.OBJ_TYP);
						that.getView().byId("OBJ_TYP").setValue(oData.OBJ_TYP);
						that.getView().byId("RELOAD_SEQUENCE").setValue(oData.RELOAD_SEQUENCE);
						that.getView().byId("RELOAD_STATUS").setValue(oData.RELOAD_STATUS);
						that.getView().byId("PLANT").setValue(oData.PLANT);
						var val = oData.CREUSER + " / " + oData.CREDATE + " / " + oData.CRETIME;
						that.getView().byId("CREUSER").setValue(val);
						var val1 = oData.CNGUSER + " / " + oData.CNGDATE + " / " + oData.CNGTIME;
						that.getView().byId("CNGUSER").setValue(val1);
						// this.hideBusy();

						var PLFilters = [];
						PLFilters.push(new sap.ui.model.Filter({
							path: "SHIPMENTV",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: ship
						}));

						PLFilters.push(new sap.ui.model.Filter({
							path: "WERKS",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: that.getView().byId("PLANT").getValue()
						}));

						var oModel = that.getView().byId("table1").getModel();
						that.onblank(oModel);
						var itemData = oModel.getProperty("/data");

						oModel1.read("/MATERIALINSet", {
							filters: PLFilters,

							success: function (oData1, oResponse) {
								var res = [];
								res = oData1.results;

								if (res.length > 0) {
									for (var iRowIndex = 0; iRowIndex < res.length; iRowIndex++) {
										var itemRow = {
											MATNR: res[iRowIndex].MATNR,
											MAKTX: res[iRowIndex].MAKTX,
											UOMB: res[iRowIndex].UOMB,
											UOMP: res[iRowIndex].UOMP,
											EANB: res[iRowIndex].EANB,
											EANP: res[iRowIndex].EANP,
											WTB: res[iRowIndex].WTB,
											WTP: res[iRowIndex].WTP
										};

										if (typeof itemData !== "undefined" && itemData.length > 0) {
											itemData.push(itemRow);
										} else {
											itemData = [];
											itemData.push(itemRow);
										}
									}

									// // Set Model
									oModel.setData({
										data: itemData
									});
									oModel.refresh(true);

								}
								// that.onBusyE(oBusy);
								sap.m.MessageToast.show("You can start the RELOAD now");

								PLFilters = [];
								PLFilters.push(new sap.ui.model.Filter({
									path: "SHIPMENTV",
									operator: sap.ui.model.FilterOperator.EQ,
									value1: ship
								}));
								var oModel2 = that.getView().byId("table").getModel();
								that.onblank(oModel2);
								var itemData2 = oModel2.getProperty("/data");
								// that.onBusyS(oBusy);
								oModel1.read("/GETDETSet", {
									filters: PLFilters,

									success: function (oData2, oResponse2) {
										var res2 = [];
										res2 = oData2.results;

										if (res2.length > 0) {
											for (var iRowIndex2 = 0; iRowIndex2 < res2.length; iRowIndex2++) {
												var itemRow2 = {
													MATNR: res2[iRowIndex2].MATNR,
													MAKTX: res2[iRowIndex2].MAKTX,
													QTY: res2[iRowIndex2].QTY,
													UOM: res2[iRowIndex2].UOM,
													EAN11: res2[iRowIndex2].EAN11,
													CONF: res2[iRowIndex2].CONF,
													WT: res2[iRowIndex2].WT
												};

												if (typeof itemData2 !== "undefined" && itemData2.length > 0) {
													itemData2.push(itemRow2);
												} else {
													itemData2 = [];
													itemData2.push(itemRow2);
												}
											}

											// // Set Model
											oModel2.setData({
												data: itemData2
											});
											oModel2.refresh(true);
										}
										that.onBusyE(oBusy);

										//************************get values from backend based on filter Date*******************************************//

									},
									error: function (oResponse1) {
										that.onBusyE(oBusy);
										// var oMsg = JSON.parse(oResponse1.responseText);
										// jQuery.sap.require("sap.m.MessageBox");
										// sap.m.MessageToast.show(oMsg.error.message.value);
									}
								});

								//************************get values from backend based on filter Date*******************************************//

							},
							error: function (oResponse) {
								// that.onBusyE(oBusy);
								var oMsg = JSON.parse(oResponse.responseText);
								jQuery.sap.require("sap.m.MessageBox");
								sap.m.MessageToast.show(oMsg.error.message.value);
								that.onBusyE(oBusy);
							}
						});
					},
					error: function (oResponse) {
						var oMsg = JSON.parse(oResponse.responseText);
						jQuery.sap.require("sap.m.MessageBox");
						sap.m.MessageToast.show(oMsg.error.message.value);
						that.onBusyE(oBusy);
					}
				});

			}
		},

		onDel: function (oControlEvent) {
			var oTable = this.getView().byId("table");
			this.onDelM(oTable, "");
		},

		onDelM: function (oTable, val) {
			var oModel2 = oTable.getModel();
			var aRows = oModel2.getData().data;
			var aContexts = oTable.getSelectedContexts();
			// Loop backward from the Selected Rows
			// var aContexts = oTable.getContexts();
			if (aContexts.length > 0) {
				if (val === "") {
					for (var i = aContexts.length - 1; i >= 0; i--) {

						// Selected Row
						var oThisObj = aContexts[i].getObject();
						// $.map() is used for changing the values of an array.
						// Here we are trying to find the index of the selected row
						// refer - http://api.jquery.com/jquery.map/
						var oIndex = $.map(aRows, function (obj, oIndex) {
							if (obj === oThisObj) {
								return oIndex;
							}
						});

						// The splice() method adds/removes items to/from an array
						// Here we are deleting the selected index row
						// https://www.w3schools.com/jsref/jsref_splice.asp
						aRows.splice(oIndex, 1);
					}
					// Set the Model with the Updated Data after Deletion
					oModel2.setData({
						data: aRows
					});
					// Reset table selection in UI5
					oTable.removeSelections(true);
				} else if (val === "X") {
					// Selected Row
					for (i = aContexts.length - 1; i >= 0; i--) {
						oThisObj = aContexts[i].getObject();
						return oThisObj;
					}
				}
			} else {
				sap.m.MessageToast.show("No Line items selected for Deletion");
				return "X";
			}
		},

		onRef: function (oEvent, SMAT) {
			// var that = this;
			// that.getView().byId("searchField").setValue("");
			// if (SMAT === "X") {} else {
			// 	that.getView().byId("NMATNR").setValue();
			// }
			// that.getView().byId("oSelect2").setValue();
			var aTableSearchState = [];
			// var sQuery = "";

			// if (sQuery && sQuery.length > 0) {
			// 	aTableSearchState = [new Filter("EAN11", FilterOperator.Contains, sQuery)];
			// }
			this._applySearch(aTableSearchState);

		},

		onAddS: function (oEvent) { //sear by Material dialog
			var that = this;
			var oView = that.getView();
			var ship = this.getView().byId("SHIP").getSelectedKey();
			var plant = this.getView().byId("PLANT").getValue();
			if (ship === "" || ship === undefined) {
				sap.m.MessageToast.show("No Shipment data given");
			} else if (plant === "" || plant === undefined) {
				sap.m.MessageToast.show("No branch data given");
			} else {
				var oDialog = oView.byId("MDialog");
				// create dialog lazily
				if (!oDialog) {
					// create dialog via fragment factory
					oDialog = sap.ui.xmlfragment(oView.getId(), "com.baba.ZDSD_RELOAD.view.MDialog", this);
					// connect dialog to view (models, lifecycle)
					oView.addDependent(oDialog);
				}
				oDialog.setTitle("Add Material");
				oDialog.open(that);
			}

		},

		onMCloseDialog: function () {
			// var that = this;
			var oTable = this.byId("table");
			oTable.getBinding("items").refresh();

			var that = this;
			that.byId("MDialog").destroy();

		},

		onAddMD: function (oEvent) { //search by material dialog
			var that = this;
			var ship = this.getView().byId("SHIP").getSelectedKey();
			var plant = this.getView().byId("PLANT").getValue();

			if (ship === "" || ship === undefined) {
				sap.m.MessageToast.show("No Shipment data given");
			} else if (plant === "" || plant === undefined) {
				sap.m.MessageToast.show("No branch data");
			} else {

				var input0 = that.getView().byId("searchField").getValue();
				var input1 = input0.split(" - ");
				var input = input1[0];

				var val = that.getView().byId("FETV").getValue();
				var box = that.getView().byId("BOXD").getSelected();
				var pc = that.getView().byId("PCD").getSelected();

				if (box === true) {
					var uom = "BOX";
				} else if (pc === true) {
					uom = "PC";
				}

				if ((input !== "" && input !== undefined) && (uom !== "" && uom !== undefined)) {
					var oTable = that.getView().byId("table");
					var oModel = oTable.getModel();
					var itemData = oModel.getProperty("/data");

					var aItems = oModel.oData.data; //All rows  
					var flg = "";

					if (aItems !== undefined) {
						for (var iRowIndex1 = 0; iRowIndex1 < aItems.length; iRowIndex1++) {
							// var l_ean11 = oModel.getProperty("EAN11", aItems[iRowIndex1].getBindingContext());
							var l_matnr = aItems[iRowIndex1].MATNR;
							var l_uom = aItems[iRowIndex1].UOM;
							if (l_matnr === input && l_uom === uom) {
								flg = "X";
								break;
							}
						}
					}

					if (flg === "X") {
						sap.m.MessageToast.show("Material & UOM already in the list");
					} else {

						// //************************filter Date*******************************************//
						var oTable1 = that.getView().byId("table1");
						var oModel1 = oTable1.getModel();
						// var aItems = oModel.oData.data; //All rows  
						var aItems1 = oModel1.oData.data; //All rows

						for (var iRowIndex2 = 0; iRowIndex2 < aItems1.length; iRowIndex2++) {
							var l_matnr1 = aItems1[iRowIndex2].MATNR;
							var l_maktx = aItems1[iRowIndex2].MAKTX;
							var l_uomb = aItems1[iRowIndex2].UOMB;
							var l_uomp = aItems1[iRowIndex2].UOMP;
							if (l_matnr1 === input && (l_uomb === uom || l_uomp === uom)) {
								flg = "X";
								if (l_uomb === uom) {
									var ean11 = aItems1[iRowIndex2].EANB;
									var wt = aItems1[iRowIndex2].WTB;
								} else if (l_uomp === uom) {
									ean11 = aItems1[iRowIndex2].EANP;
									wt = aItems1[iRowIndex2].WTP;
								}

								var itemRow = {
									MATNR: l_matnr1,
									MAKTX: l_maktx,
									UOM: uom,
									QTY: val,
									EAN11: ean11,
									WT: wt
								};

								if (typeof itemData !== "undefined" && itemData.length > 0) {
									itemData.push(itemRow);
								} else {
									itemData = [];
									itemData.push(itemRow);
								}

								// // Set Model
								oModel.setData({
									data: itemData
								});

								oModel.refresh(true);

								var aTableSearchState = [];
								that._applySearch(aTableSearchState);
								sap.m.MessageToast.show("New Items " + input + "/" + uom + " Added");
								break;
							}
						}

						if (flg === "") {
							sap.m.MessageToast.show("No material & UOM for the same");
						}

						that.getView().byId("searchField").setValue();
						that.getView().byId("FETV").setValue("");

					}
				}

			}
		},

		onAdd: function (oEvent) { //sear by EAN
			var that = this;
			var oView = that.getView();
			var ship = that.getView().byId("SHIP").getValue();
			var plant = that.getView().byId("PLANT").getValue();
			if (ship === "" || ship === undefined) {
				sap.m.MessageToast.show("No Shipment data given");
			} else if (plant === "" || plant === undefined) {
				sap.m.MessageToast.show("No branch data fetched");
			} else {
				var oDialog = oView.byId("Dialog");
				// create dialog lazily
				if (!oDialog) {
					// create dialog via fragment factory
					oDialog = sap.ui.xmlfragment(oView.getId(), "com.baba.ZDSD_RELOAD.view.Dialog", this);
					// connect dialog to view (models, lifecycle)
					oView.addDependent(oDialog);
				}
				oDialog.setTitle("Add Material(Barcode)");
				oDialog.focus();
				oDialog.open(that);
			}

		},

		onDchk: function (oEvent) {
			var value = oEvent.getSource().getProperty('value');
			var nval = Number(value);
			if (value === "") {
				this.byId("FETV").setValue(0);
			} else if (nval < 0) {
				this.byId("FETV").setValue(0);
			} else {
				var input1 = value.split(".");
				var input = input1[0];

				var convval = Number(input).toFixed(0);
				this.byId("FETV").setValue(convval);

			}
		},

		onOkDialog: function (path) {
			var that = this;
			that.onRef();
			var input = that.getView().byId("FET").getValue();

			that.getView().byId("FET").focus();

			var qval = that.getView().byId("FETV").getValue(); //add

			if (input === "") {
				sap.m.MessageToast.show("Please provide EAN");
			} else {
				var oTable = this.byId("table");
				var oModel = oTable.getModel();
				var aItems = oModel.oData.data; //All rows 
				var itemData = oModel.getProperty("/data");
				var flg = "";

				if (aItems !== undefined) {
					for (var iRowIndex1 = 0; iRowIndex1 < aItems.length; iRowIndex1++) {
						var l_ean = aItems[iRowIndex1].EAN11;

						if (l_ean === input) {
							flg = "X";
							break;
						}
					}
				}
				if (flg === "X") {
					sap.m.MessageToast.show("EAN already in the list");
					var aTableSearchState = [];
					var sQuery = input; //oEvent.getParameter("query");

					if (sQuery && sQuery.length > 0) {
						aTableSearchState = [new Filter("EAN11", FilterOperator.Contains, sQuery)];
						//new Filter("MATNR", FilterOperator.Contains, sQuery.toUpperCase())
					}
					this._applySearch(aTableSearchState);

				} else {

					// //************************filter Date*******************************************//
					var oTable1 = that.getView().byId("table1");
					var oModel1 = oTable1.getModel();
					// var aItems = oModel.oData.data; //All rows  
					var aItems1 = oModel1.oData.data; //All rows

					for (var iRowIndex2 = 0; iRowIndex2 < aItems1.length; iRowIndex2++) {
						var l_matnr1 = aItems1[iRowIndex2].MATNR;
						var l_maktx = aItems1[iRowIndex2].MAKTX;
						var l_uomb = aItems1[iRowIndex2].UOMB;
						var l_uomp = aItems1[iRowIndex2].UOMP;
						var l_eanb = aItems1[iRowIndex2].EANB;
						var l_eanp = aItems1[iRowIndex2].EANP;

						if (l_eanb === input || l_eanp === input) {
							flg = "X";
							if (l_eanb === input) {
								var uom = l_uomb;
								var wt = aItems1[iRowIndex2].WTB;
							} else if (l_eanp === input) {
								uom = l_uomp;
								wt = aItems1[iRowIndex2].WTP;
							}

							var itemRow = {
								MATNR: l_matnr1,
								MAKTX: l_maktx,
								UOM: uom,
								QTY: qval,
								EAN11: input,
								WT: wt
							};

							if (typeof itemData !== "undefined" && itemData.length > 0) {
								itemData.push(itemRow);
							} else {
								itemData = [];
								itemData.push(itemRow);
							}

							// // Set Model
							oModel.setData({
								data: itemData
							});

							oModel.refresh(true);

							aTableSearchState = [];
							that._applySearch(aTableSearchState);
							sap.m.MessageToast.show("New Items " + input + "/" + uom + " Added");
							break;

						}
					}

					if (flg === "") {
						sap.m.MessageToast.show("No EAN found for the same");
					}

				}

				that.getView().byId("FET").setValue();
				that.getView().byId("EDES").setValue();
				that.getView().byId("FETV").setValue();

				// that.byId("Dialog").destroy();
			}

		},

		onCloseDialog: function () {
			// var that = this;
			var oTable = this.byId("table");
			oTable.getBinding("items").refresh();

			var that = this;
			that.byId("Dialog").destroy();
			// that.byId("Dialog").close();

		},

		onUpdateFinished: function (oEvent) {
			// // update the worklist's object counter after the table update
			// var sTitle,
			// 	oTable = oEvent.getSource(),
			// 	iTotalItems = oEvent.getParameter("total");
			// // only update the counter if the length is final and
			// // the table is not empty
			// if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
			// 	sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
			// } else {
			// 	sTitle = this.getResourceBundle().getText("worklistTableTitle");
			// }
			// this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);

			var that = this;
			var oTable = this.getView().byId("table");
			var oModel = oTable.getModel();

			var aItemsO = oModel.oData.data; //All rows  

			// Get Items of the Table
			var aItems = oTable.getItems(oModel);
			var l_qtyb = 0,
				l_cntb = 0,
				l_qtyp = 0,
				l_cntp = 0,
				no = 0,
				dec = 3,
				wt = 0,
				wtb = 0,
				wtp = 0;
			// l_cntr = 0;
			for (var iRowIndex = 0; iRowIndex < aItems.length; iRowIndex++) {
				if (aItems[iRowIndex]._bGroupHeader === false) {
					var l_val = oModel.getProperty("UOM", aItems[iRowIndex].getBindingContext());
					var l_qtyc = oModel.getProperty("QTY", aItems[iRowIndex].getBindingContext());
					var l_wt = oModel.getProperty("WT", aItems[iRowIndex].getBindingContext());
					// if ((l_val === "" || l_qtyc === "") && (l_val === undefined || l_qtyc === undefined)) 
					if (l_qtyc === "" || l_qtyc === undefined) {
						l_qtyc = 0;
					} else {
						var val = Number(l_qtyc).toFixed(no);
						var cval = Number(val);
					}

					if (l_val === "BOX") {
						l_qtyb = l_qtyb + cval;
						if (cval > 0) {
							l_cntb = l_cntb + 1;
						}

						var nwtb = Number(l_wt).toFixed(dec);
						nwtb = Number(nwtb);
						// wtb = Number(wtb).toFixed(dec);
						wtb = Number(wtb) + (cval * nwtb);
						wtb = Number(wtb).toFixed(dec);
					}

					if (l_val === "PC") {
						l_qtyp = l_qtyp + cval;
						if (cval > 0) {
							l_cntp = l_cntp + 1;
						}

						var nwtp = Number(l_wt).toFixed(dec);
						nwtp = Number(nwtp);
						// wtp = Number(wtp).toFixed(dec);
						wtp = Number(wtp) + (cval * nwtp);
						wtp = Number(wtp).toFixed(dec);
					}
				}
			}

			var box = l_qtyb + "/" + l_cntb;
			var pc = l_qtyp + "/" + l_cntp;
			wt = Number(wtb) + Number(wtp);
			wt = Number(wt).toFixed(dec);

			this.onTick();
			that.getView().byId("BOX").setValue(box);
			that.getView().byId("PC").setValue(pc);
			if (wt === isNaN) {
				wt = 0;
			}
			that.getView().byId("WTG").setValue(wt);

		},

		onTick: function () {
			var oTable = this.getView().byId("table");
			var aItems = oTable.getItems(); //All rows  
			var oModel = oTable.getModel();

			if (aItems.length > 0) {

				for (var iRowIndex = 0; iRowIndex < aItems.length; iRowIndex++) {
					if (aItems[iRowIndex]._bGroupHeader === false) {
						// var l_matnr = oModel.getProperty("MATNR", aItems[iRowIndex].getBindingContext());
						// if (l_matnr !== "" && l_matnr !== undefined && l_matnr !=== null ) {
						var l_comp = oModel.getProperty("CONF", aItems[iRowIndex].getBindingContext());
						if (l_comp === "X") {
							aItems[iRowIndex].getCells()[3].setEditable(false);
						}
					}
				}
			}

		},

		onRest: function () {
			var oTable = this.getView().byId("table");
			var aItems = oTable.getSelectedItems(); //All rows  ; //All rows  

			if (aItems.length > 0) {

				for (var iRowIndex = 0; iRowIndex < aItems.length; iRowIndex++) {
					if (aItems[iRowIndex]._bGroupHeader === false) {
						aItems[iRowIndex].getCells()[3].setEditable(true);
						// aItems[iRowIndex].getCells()[0].setIcon();
						// aItems[iRowIndex].getCells()[0].setText();

					}
				}
			}
		},

		/**
		 * Event handler when a table item gets pressed
		 * @param {sap.ui.base.Event} oEvent the table selectionChange event
		 * @public
		 */
		onPress: function (oEvent) {
			// The source is the list item that got pressed
			this._showObject(oEvent.getSource());
		},

		onPri: function (oEvent, so) {
			var ship = this.getView().byId("SHIP").getSelectedKey();
			var plant = this.getView().byId("PLANT")._lastValue;
			var seq = this.getView().byId("RELOAD_SEQUENCE")._lastValue;
			var flg = "";
			if (ship === "") {
				sap.m.MessageToast.show("No Shipment data given");
				flg = "X";
			}
			if (plant === "" || plant === undefined) {
				sap.m.MessageToast.show("No branch data fetched");
				flg = "X";
			}
			if (flg === "") {
				if (so === "" || so === undefined) {
					var url = "/sap/opu/odata/sap/ZDSDO_RELOAD_SRV/PRINTSet(SHIPMENTV='" + ship + "',VBELN='',SEQ='" + seq + "')/$value";
				} else {
					url = "/sap/opu/odata/sap/ZDSDO_RELOAD_SRV/PRINTSet(SHIPMENTV='" + ship + "',VBELN='" + so + "',SEQ='" + seq + "')/$value";
				}
				sap.m.URLHelper.redirect(url, true);
			}
		},

		onSave1: function (oEvent) {
			var that = this;
			var fconf = that.getView().byId("CONF").getSelected();
			if (fconf === true) {
				MessageBox.warning(
					"Do you want to close Reloading Process?", {
						actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
						onClose: function (sAction) {
							if (sAction === "OK") {
								that.onSave(oEvent);
							}
						}
					}
				);
			} else {
				that.onSave(oEvent);
			}
		},

		onSave: function (oEvent) {
			var that = this;
			var oTable = that.getView().byId("table");

			var oModel = oTable.getModel();
			that.onRef();
			var aItems = oTable.getItems(); //All rows 

			var oBusy = new sap.m.BusyDialog();

			var ship = that.getView().byId("SHIP")._lastValue;
			var plant = that.getView().byId("PLANT").getValue();
			var flg = "";
			var oModel2 = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZDSDO_RELOAD_SRV/", true);

			if ((ship === "" || ship === undefined) || (plant === "" || plant === undefined)) {
				sap.m.MessageToast.show("No Shipment or Branch has given");
			} else if (aItems.length === 0) {
				sap.m.MessageToast.show("No data for posting");
			} else {
				var val = that.getView().byId("CONF").getSelected();
				if (val === true) {
					var l_mark1 = "X";
					var cnt = 0;

					var aContexts = oTable.getSelectedContexts(); //selected rows marked with checkbox from table

					for (var i = 0; i < aItems.length; i++) {
						var l_matnr = oModel.getProperty("MATNR", aItems[i].getBindingContext());
						if (l_matnr !== null) {
							cnt = cnt + 1;
						}
					}
					if (cnt !== aContexts.length) {
						sap.m.MessageToast.show("For Final Confirmation, mark all Items");
						flg = "X";
					}
				} else {
					l_mark1 = "";
				}

				if (flg === "") {
					// Create one emtpy Object
					var oEntry1 = {};
					oEntry1.SHIPMENTV = ship;
					oEntry1.PLANT = plant;
					oEntry1.CONF = l_mark1;

					oEntry1.HEADITEMNAV = [];

					var itemData = [];
					for (var iRowIndex1 = 0; iRowIndex1 < aItems.length; iRowIndex1++) {
						// var oThisObj = oModel.getProperty("MATNR", aItems[iRowIndex].getBindingContext());
						if (aItems[iRowIndex1]._bGroupHeader === false) {
							var l_matnr = oModel.getProperty("MATNR", aItems[iRowIndex1].getBindingContext());

							if (l_matnr !== "" && l_matnr !== null) {

								var l_qtyc = oModel.getProperty("QTY", aItems[iRowIndex1].getBindingContext());
								var l_maktx = oModel.getProperty("MAKTX", aItems[iRowIndex1].getBindingContext());
								var l_uom = oModel.getProperty("UOM", aItems[iRowIndex1].getBindingContext());
								var l_ean11 = oModel.getProperty("EAN11", aItems[iRowIndex1].getBindingContext());

								if (aItems[iRowIndex1].getSelected() === true) {
									var l_conf = "X";
								} else {
									l_conf = "";
								}

								if (l_qtyc === "" || l_qtyc === undefined || l_qtyc === null) {
									l_qtyc = 0;
								}

								var no = "0";
								var valq = Number(l_qtyc).toFixed(no);
								l_qtyc = valq;

								itemData.push({
									SHIPMENTV: ship,
									MAKTX: l_maktx,
									MATNR: l_matnr,
									UOM: l_uom,
									QTY: l_qtyc,
									EAN11: l_ean11,
									CONF: l_conf
								});

							}

						}
					}

					//Using Deep entity the data is posted as shown below .
					oEntry1.HEADITEMNAV = itemData;
					that.onBusyS(oBusy);
					oModel2.create("/HEADERSet", oEntry1, {
						success: function (oData, oResponse) {
							if (l_mark1 === "X") {
								var so = oData.VBELN;
								that.onPri(that, so);
								that.onShipSelectionChange();
							} else {
								sap.m.MessageToast.show("Data updated successfully");
							}
							that.onBusyE(oBusy);
						},
						error: function (oResponse1) {
							that.onBusyE(oBusy);
							var oMsg = JSON.parse(oResponse1.responseText);
							jQuery.sap.require("sap.m.MessageBox");
							sap.m.MessageToast.show(oMsg.error.message.value);
						}
					});

				}
			}
		},

		onChk: function (oEvent) {
			// var NUM_DECIMAL_PLACES = 0;
			var value = oEvent.getSource().getProperty('value');
			var nval = Number(value);
			// var valueState = isNaN(value) ? "Error" : "Success";
			// oEvent.getSource().setValueState(valueState);

			// if (valueState === "Success") {
			if (value === "") {
				var oRow = oEvent.getSource().getParent();
				var aCells = oRow.getCells();
				aCells[3].setValue(0);
			} else if (nval < 0) {
				oRow = oEvent.getSource().getParent();
				aCells = oRow.getCells();
				aCells[3].setValue(0);
			} else {
				// var decimal = value.split(".");
				// if (decimal.length > 1) {
				// 	oRow = oEvent.getSource().getParent();
				// 	aCells = oRow.getCells();
				// 	aCells[6].setValue(0);
				// }
				oRow = oEvent.getSource().getParent();
				aCells = oRow.getCells();

				var val = aCells[3]._lastValue;

				var input1 = val.split(".");
				var input = input1[0];
				aCells[3].setValue(input);

				// var cval = Number(val).toFixed(NUM_DECIMAL_PLACES);
				// aCells[6].setValue(cval);
				this.onUpdateFinished();
			}
		},

		onPend: function (oEvent) {
			var that = this;

			//no filter
			var aTableSearchState = [];
			that._applySearch(aTableSearchState);

			var oTable = that.getView().byId("table");
			var aItems = oTable.getItems(); //All rows  
			if (aItems.length === 0) {
				sap.m.MessageToast.show("No data in the table");
			} else {
				var ship = that.getView().byId("SHIP").getValue();
				var plant = that.getView().byId("PLANT").getValue();

				if (ship === "" || plant === "") {
					sap.m.MessageToast.show("Shipment or Branch can not be blank");
				} else {
					var oView = that.getView();
					var oDialog = oView.byId("PDialog");
					// create dialog lazily
					if (!oDialog) {
						// create dialog via fragment factory
						oDialog = sap.ui.xmlfragment(oView.getId(), "com.baba.ZDSD_RELOAD.view.PDialog", this);
						// connect dialog to view (models, lifecycle)
						oView.addDependent(oDialog);
					}
					oDialog.setTitle("Search Pending Items");
					oDialog.open();
				}

			}

		},

		onPOkDialog: function () {
			var that = this;

			var alla = that.getView().byId("ALLA").getSelected();
			var boxa = that.getView().byId("BOXA").getSelected();
			var pca = that.getView().byId("PCA").getSelected();

			if (alla === true) {
				var val = "";
			} else if (boxa === true) {
				val = "BOX";
			} else if (pca === true) {
				val = "PC";
			}

			// var oModel = that.getView().byId("table").getModel();
			var aItems = that.getView().byId("table").getItems();

			if (aItems.length > 0) {
				// var oModel = that.getView().byId("table").getModel();
				var aTableSearchState = [];
				var sQuery = val; //oEvent.getParameter("query");
				if (val === "") {
					aTableSearchState = [new Filter("CONF", FilterOperator.NE, "X")];
				} else if (val !== "") {
					aTableSearchState = [new Filter("UOM", FilterOperator.Contains, sQuery),
						new Filter("CONF", FilterOperator.NE, "X")
					];
				}

				this._applySearch(aTableSearchState);
			} else {
				sap.m.MessageToast.show("No items fetched");
			}
			// table has data
			that.byId("PDialog").destroy();

		},

		/**
		 * Event handler for navigating back.
		 * We navigate back in the browser historz
		 * @public
		 */
		onNavBack: function () {
			history.go(-1);
		},

		onSearch: function (oEvent) {
			if (oEvent.getParameters().refreshButtonPressed) {
				// Search field's 'refresh' button has been pressed.
				// This is visible if you select any master list item.
				// In this case no new search is triggered, we only
				// refresh the list binding.
				this.onRefresh();
			} else {
				var aTableSearchState = [];
				var sQuery = oEvent.getParameter("query");

				if (sQuery && sQuery.length > 0) {
					aTableSearchState = [new Filter("SHIPMENTV", FilterOperator.Contains, sQuery)];
				}
				this._applySearch(aTableSearchState);
			}

		},

		///////////////////////////////////////////////////
		onAll: function (oEvent) {
			var that = this;

			// table has data
			var aTableSearchState = [];
			that._applySearch(aTableSearchState);

			var ship = that.getView().byId("SHIP").getValue();
			var plant = that.getView().byId("PLANT").getValue();

			if (ship === "" || plant === "") {
				sap.m.MessageToast.show("Shipment or Branch can not be blank");
			} else {
				var oView = that.getView();
				var oDialog = oView.byId("ADialog");
				// create dialog lazily
				if (!oDialog) {
					// create dialog via fragment factory
					oDialog = sap.ui.xmlfragment(oView.getId(), "com.baba.ZDSD_RELOAD.view.ADialog", this);
					// connect dialog to view (models, lifecycle)
					oView.addDependent(oDialog);
				}
				oDialog.setTitle("Search All Items");
				oDialog.open();
			}

		},

		onAOkDialog: function () {
			var that = this;

			var alla = that.getView().byId("ALLA").getSelected();
			var boxa = that.getView().byId("BOXA").getSelected();
			var pca = that.getView().byId("PCA").getSelected();

			if (alla === true) {
				var val = "";
			} else if (boxa === true) {
				val = "BOX";
			} else if (pca === true) {
				val = "PC";
			}

			// var oModel = that.getView().byId("table").getModel();
			var aItems = that.getView().byId("table").getItems();

			if (aItems.length > 0) {
				// var oModel = that.getView().byId("table").getModel();
				var aTableSearchState = [];
				var sQuery = val; //oEvent.getParameter("query");
				if (sQuery && sQuery.length > 0) {
					aTableSearchState = [new Filter("UOM", FilterOperator.Contains, sQuery)];
				}
				this._applySearch(aTableSearchState);
			} else {
				sap.m.MessageToast.show("No items fetched");
			}
			// table has data
			that.byId("ADialog").destroy();
		},

		// onACloseDialog: function () {
		// 	var oTable = this.byId("table");
		// 	oTable.getBinding("items").refresh();

		// 	var that = this;
		// 	that.byId("ADialog").destroy();
		// 	// that.byId("Dialog").close();
		// },

		/**
		 * Event handler for refresh event. Keeps filter, sort
		 * and group settings and refreshes the list binding.
		 * @public
		 */
		onRefresh: function () {
			var oTable = this.byId("table");
			oTable.getBinding("items").refresh();
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Shows the selected item on the object page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showObject: function (oItem) {
			this.getRouter().navTo("object", {
				objectId: oItem.getBindingContext().getProperty("SHIPMENTV")
			});
		},

		/**
		 * Internal helper method to apply both filter and search state together on the list binding
		 * @param {sap.ui.model.Filter[]} aTableSearchState An array of filters for the search
		 * @private
		 */
		_applySearch: function (aTableSearchState) {
			var oTable = this.byId("table"),
				oViewModel = this.getModel("worklistView");
			oTable.getBinding("items").filter(aTableSearchState, "Application");
			// changes the noDataText of the list in case there are no filter results
			if (aTableSearchState.length !== 0) {
				oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
			}
		}

	});
});