"use strict";

class PageFilterEquipment extends PageFilter {
	constructor () {
		super();

		this._typeFilter = new Filter({header: "Type", headerName: "類型", deselFn: (it) => PageFilterItems._DEFAULT_HIDDEN_TYPES.has(it), displayFn: Parser.ItemTypeToDisplay});
		this._propertyFilter = new Filter({header: "Property", headerName: "物品屬性", displayFn: StrUtil.uppercaseFirst});
		this._costFilter = new RangeFilter({header: "Cost", headerName: "價值", min: 0, max: 100, isAllowGreater: true, suffix: " gp"});
		this._weightFilter = new RangeFilter({header: "Weight", headerName: "重量",min: 0, max: 100, isAllowGreater: true, suffix: " lb."});
		this._focusFilter = new Filter({header: "Spellcasting Focus",  headerName: "施法法器",items: [...Parser.ITEM_SPELLCASTING_FOCUS_CLASSES], displayFn: Parser.ClassToDisplay});
		this._damageTypeFilter = new Filter({header: "Weapon Damage Type",  headerName: "武器傷害類型", displayFn: it => Parser.dmgTypeToFull(it).uppercaseFirst(), itemSortFn: (a, b) => SortUtil.ascSortLower(Parser.dmgTypeToFull(a), Parser.dmgTypeToFull(b))});
		this._miscFilter = new Filter({header: "Miscellaneous", items: ["Item Group", "SRD", "Has Images", "Has Info"], isSrdFilter: true});
		this._poisonTypeFilter = new Filter({header: "Poison Type", headerName:"藥水類型", items: ["ingested", "injury", "inhaled", "contact"], displayFn: Parser.PosisonTypeToDisplay});
	}

	static mutateForFilters (item) {
		item._fProperties = item.property ? item.property.map(p => Renderer.item.propertyMap[p].name).filter(n => n) : [];

		item._fMisc = item.srd ? ["SRD"] : [];
		if (item._isItemGroup) item._fMisc.push("Item Group");
		if (item.hasFluff) item._fMisc.push("Has Info");
		if (item.hasFluffImages) item._fMisc.push("Has Images");

		if (item.focus || item.type === "INS" || item.type === "SCF") {
			item._fFocus = item.focus ? item.focus === true ? [...Parser.ITEM_SPELLCASTING_FOCUS_CLASSES] : [...item.focus] : [];
			if (item.type === "INS" && !item._fFocus.includes("Bard")) item._fFocus.push("Bard");
			if (item.type === "SCF") {
				switch (item.scfType) {
					case "arcane": {
						if (!item._fFocus.includes("Sorcerer")) item._fFocus.push("Sorcerer");
						if (!item._fFocus.includes("Warlock")) item._fFocus.push("Warlock");
						if (!item._fFocus.includes("Wizard")) item._fFocus.push("Wizard");
						break;
					}
					case "druid": {
						if (!item._fFocus.includes("Druid")) item._fFocus.push("Druid");
						break;
					}
					case "holy":
						if (!item._fFocus.includes("Cleric")) item._fFocus.push("Cleric");
						if (!item._fFocus.includes("Paladin")) item._fFocus.push("Paladin");
						break;
				}
			}
		}

		item._fValue = (item.value || 0) / 100;
	}

	addToFilters (item, isExcluded) {
		if (isExcluded) return;

		this._typeFilter.addItem(item._typeListText);
		this._propertyFilter.addItem(item._fProperties);
		this._damageTypeFilter.addItem(item.dmgType);
		this._poisonTypeFilter.addItem(item.poisonTypes);
	}

	async _pPopulateBoxOptions (opts) {
		opts.filters = [
			this._typeFilter,
			this._propertyFilter,
			this._costFilter,
			this._weightFilter,
			this._focusFilter,
			this._damageTypeFilter,
			this._miscFilter,
			this._poisonTypeFilter,
		];
	}

	toDisplay (values, it) {
		return this._filterBox.toDisplay(
			values,
			it._typeListText,
			it._fProperties,
			it._fValue,
			it.weight,
			it._fFocus,
			it.dmgType,
			it._fMisc,
			it.poisonTypes,
		);
	}
}

class PageFilterItems extends PageFilterEquipment {
	// region static
	static _rarityValue (rarity) {
		switch (rarity) {
			case "none": return 0;
			case "common": case "常見": return 1;
			case "uncommon": case "非常見": return 2;
			case "rare": case "珍稀": return 3;
			case "very rare": case "非常珍稀": return 4;
			case "legendary":case "傳說": return 5;
			case "artifact":case "神器": return 6;
			case "varies":  case "可變": return 7;
			case "unknown (magic)": return 8;
			case "unknown": return 9;
			default: return 10;
		}
	}

	static sortItems (a, b, o) {
		if (o.sortBy === "name") return SortUtil.compareListNames(a, b);
		else if (o.sortBy === "type") return SortUtil.ascSortLower(a.values.type, b.values.type) || SortUtil.compareListNames(a, b);
		else if (o.sortBy === "source") return SortUtil.ascSortLower(a.values.source, b.values.source) || SortUtil.compareListNames(a, b);
		else if (o.sortBy === "rarity") return SortUtil.ascSort(PageFilterItems._rarityValue(a.values.rarity), PageFilterItems._rarityValue(b.values.rarity)) || SortUtil.compareListNames(a, b);
		else if (o.sortBy === "attunement") return SortUtil.ascSort(a.values.attunement, b.values.attunement) || SortUtil.compareListNames(a, b);
		else if (o.sortBy === "count") return SortUtil.ascSort(a.values.count, b.values.count) || SortUtil.compareListNames(a, b);
		else if (o.sortBy === "weight") return SortUtil.ascSort(a.values.weight, b.values.weight) || SortUtil.compareListNames(a, b);
		else if (o.sortBy === "cost") return SortUtil.ascSort(a.values.cost, b.values.cost) || SortUtil.compareListNames(a, b);
		else return 0;
	}

	// endregion
	constructor () {
		super();

		this._tierFilter = new Filter({header: "Tier", headerName: "階級", items: ["none", "minor", "major"], itemSortFn: null, displayFn: Parser.ItemTierToDisplay});
		this._attachedSpellsFilter = new Filter({header: "Attached Spells", headerName: "附加法術", displayFn: (it) => it.split("|")[0].toTitleCase(), itemSortFn: SortUtil.ascSortLower});
		this._lootTableFilter = new Filter({
			header: "Found On",
			headerName: "列於魔法物品表",
			items: ["魔法物品表A", "魔法物品表B", "魔法物品表C", "魔法物品表D", "魔法物品表E", "魔法物品表F", "魔法物品表G", "魔法物品表H", "魔法物品表I"],
			displayFn: it => {
				const [name, sourceJson] = it.split("|");
				return `${name}${sourceJson ? ` (${Parser.sourceJsonToAbv(sourceJson)})` : ""}`
			},
		});
		this._rarityFilter = new Filter({
			header: "Rarity",
			headerName: "稀有度",
			items: [...Parser.ITEM_RARITIES],
			itemSortFn: null,
			displayFn: Parser.translateItemKeyToDisplay,
		});
		this._attunementFilter = new Filter({header: "Attunement", headerName: "同調", items: ["Requires Attunement", "Requires Attunement By...", "Attunement Optional", VeCt.STR_NO_ATTUNEMENT], itemSortFn: null, displayFn: function(str)
		{
			switch(str){
			case "Requires Attunement": return "需要";
			case "Requires Attunement By...": return "限定...";
			case "Attunement Optional": return "可選";
			case VeCt.STR_NO_ATTUNEMENT: return "不須";
			default: return str;
		};}});
		this._categoryFilter = new Filter({
			header: "Category",
			headerName: "分類",
			items: ["Basic", "Generic Variant", "Specific Variant", "Other"],
			deselFn: (it) => it === "Specific Variant",
			itemSortFn: null,
			displayFn: function(str){
				switch(str){
				case "Basic": return "基本";
				case "Generic Variant": return "通用變體";
				case "Specific Variant": return "特定變體";
				case "Other": return "其他";
				default: return str;
			};}
		});
		this._bonusFilter = new Filter({header: "Bonus", items: ["Armor Class", "Proficiency Bonus", "Spell Attacks", "Spell Save DC", "Saving Throws", "Weapon Attack and Damage Rolls", "Weapon Attack Rolls", "Weapon Damage Rolls"]});
		this._miscFilter = new Filter({header: "Miscellaneous", headerName: "雜項",items: ["Ability Score Adjustment", "Charges", "Cursed", "Grants Proficiency", "Has Images", "Has Info", "Item Group", "Magic", "Mundane", "Sentient", "SRD"], isSrdFilter: true, displayFn: Parser.ItemMiscToDisplay});
		this._baseSourceFilter = new SourceFilter({header: "Base Source", selFn: null});
	}

	static mutateForFilters (item) {
		super.mutateForFilters(item);

		item._fTier = [item.tier ? item.tier : "none"];

		if (item.curse) item._fMisc.push("Cursed");
		const isMundane = item.rarity === "none" || item.rarity === "unknown" || item._category === "basic";
		item._fMisc.push(isMundane ? "Mundane" : "Magic");
		item._fIsMundane = isMundane;
		if (item.ability) item._fMisc.push("Ability Score Adjustment");
		if (item.charges) item._fMisc.push("Charges");
		if (item.sentient) item._fMisc.push("Sentient");
		if (item.grantsProficiency) item._fMisc.push("Grants Proficiency");

		item._fBonus = [];
		if (item.bonusAc) item._fBonus.push("Armor Class");
		if (item.bonusWeapon) item._fBonus.push("Weapon Attack and Damage Rolls");
		if (item.bonusWeaponAttack) item._fBonus.push("Weapon Attack Rolls");
		if (item.bonusWeaponDamage) item._fBonus.push("Weapon Damage Rolls");
		if (item.bonusSpellAttack) item._fBonus.push("Spell Attacks");
		if (item.bonusSpellSaveDc) item._fBonus.push("Spell Save DC");
		if (item.bonusSavingThrow) item._fBonus.push("Saving Throws");
		if (item.bonusProficiencyBonus) item._fBonus.push("Proficiency Bonus");
	}

	addToFilters (item, isExcluded) {
		if (isExcluded) return;

		super.addToFilters(item, isExcluded);

		this._sourceFilter.addItem(item.source);
		this._tierFilter.addItem(item._fTier)
		this._attachedSpellsFilter.addItem(item.attachedSpells);
		this._lootTableFilter.addItem(item.lootTables);
		this._baseSourceFilter.addItem(item._baseSource);
	}

	async _pPopulateBoxOptions (opts) {
		await super._pPopulateBoxOptions(opts);

		opts.filters = [
			this._sourceFilter,
			this._typeFilter,
			this._tierFilter,
			this._rarityFilter,
			this._propertyFilter,
			this._attunementFilter,
			this._categoryFilter,
			this._costFilter,
			this._weightFilter,
			this._focusFilter,
			this._damageTypeFilter,
			this._bonusFilter,
			this._miscFilter,
			this._lootTableFilter,
			this._baseSourceFilter,
			this._poisonTypeFilter,
			this._attachedSpellsFilter,
		];
	}

	toDisplay (values, it) {
		return this._filterBox.toDisplay(
			values,
			it.source,
			it._typeListText,
			it._fTier,
			it.rarity,
			it._fProperties,
			it._attunementCategory,
			it._category,
			it._fValue,
			it.weight,
			it._fFocus,
			it.dmgType,
			it._fBonus,
			it._fMisc,
			it.lootTables,
			it._baseSource,
			it.poisonTypes,
			it.attachedSpells,
		);
	}
}
PageFilterItems._DEFAULT_HIDDEN_TYPES = new Set(["Treasure", "Futuristic", "Modern", "Renaissance"]);

class ModalFilterItems extends ModalFilter {
	/**
	 * @param opts
	 * @param opts.namespace
	 * @param [opts.isRadio]
	 * @param [opts.allData]
	 */
	constructor (opts) {
		opts = opts || {};
		super({
			...opts,
			modalTitle: "Items",
			pageFilter: new PageFilterItems(),
		})
	}

	_$getColumnHeaders () {
		const btnMeta = [
			{sort: "name", text: "Name", width: "5"},
			{sort: "type", text: "Type", width: "5"},
			{sort: "source", text: "Source", width: "1"},
		];
		return ModalFilter._$getFilterColumnHeaders(btnMeta);
	}

	async _pInit () {
		await Renderer.item.populatePropertyAndTypeReference();
	}

	async _pLoadAllData () {
		const brew = await BrewUtil.pAddBrewData();
		const fromData = await Renderer.item.pBuildList({isAddGroups: true, isBlacklistVariants: true});
		const fromBrew = await Renderer.item.getItemsFromHomebrew(brew);
		return [...fromData, ...fromBrew];
	}

	_getListItem (pageFilter, item, itI) {
		if (item.noDisplay) return null;

		Renderer.item.enhanceItem(item);
		pageFilter.mutateAndAddToFilters(item);

		const eleLabel = document.createElement("label");
		eleLabel.className = "w-100 flex-vh-center lst--border no-select lst__wrp-cells";

		const hash = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_ITEMS](item);
		const source = Parser.sourceJsonToAbv(item.source);
		const type = item._typeListText.join(", ");

		eleLabel.innerHTML = `<div class="col-1 pl-0 flex-vh-center"><input type="checkbox" class="no-events"></div>
		<div class="col-5 bold">${item.name}</div>
		<div class="col-5">${type.uppercaseFirst()}</div>
		<div class="col-1 text-center ${Parser.sourceJsonToColor(item.source)} pr-0" title="${Parser.sourceJsonToFull(item.source)}" ${BrewUtil.sourceJsonToStyle(item.source)}>${source}</div>`;

		return new ListItem(
			itI,
			eleLabel,
			item.name,
			{
				hash,
				source,
				sourceJson: item.source,
				type,
			},
			{
				cbSel: eleLabel.firstElementChild.firstElementChild,
			},
		);
	}
}
