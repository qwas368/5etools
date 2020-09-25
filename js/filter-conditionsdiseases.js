"use strict";

class PageFilterConditionsDiseases extends PageFilter {
	// region static
	static getDisplayProp (prop) {
		var translater = {
			"other": "其它",
			"condition": "狀態",
			"disease": "疾病"
		};
		return translater[prop === "status" ? "other" : prop];
	}
	// endregion

	constructor () {
		super();

		this._sourceFilter = new SourceFilter();
		this._typeFilter = new Filter({
			header: "類型",
			items: ["condition", "disease", "status"],
			displayFn: PageFilterConditionsDiseases.getDisplayProp,
			deselFn: (it) => it === "disease" || it === "status"
		});
		this._miscFilter = new Filter({header: "雜項", items: ["SRD"]});
	}

	mutateForFilters (it) {
		it._fMisc = it.srd ? ["SRD"] : [];
	}

	addToFilters (it, isExcluded) {
		if (isExcluded) return;

		this._sourceFilter.addItem(it.source);
	}

	async _pPopulateBoxOptions (opts) {
		opts.filters = [
			this._sourceFilter,
			this._typeFilter,
			this._miscFilter
		];
	}

	toDisplay (values, it) {
		return this._filterBox.toDisplay(
			values,
			it.source,
			it.__prop,
			it._fMisc
		)
	}
}
