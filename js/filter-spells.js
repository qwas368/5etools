"use strict";

if (typeof module !== "undefined") {
	const imports = require("./filter");
	Object.assign(global, imports);
}

class PageFilterSpells extends PageFilter {
	// region static
	static sortSpells (a, b, o) {
		switch (o.sortBy) {
			case "name": return SortUtil.compareListNames(a, b);
			case "source": return SortUtil.ascSort(a.values.source, b.values.source) || SortUtil.compareListNames(a, b);
			case "level": return SortUtil.ascSort(a.values.level, b.values.level) || SortUtil.compareListNames(a, b);
			case "school": return SortUtil.ascSort(a.values.school, b.values.school) || SortUtil.compareListNames(a, b);
			case "concentration": return SortUtil.ascSort(a.values.concentration, b.values.concentration) || SortUtil.compareListNames(a, b);
			case "time": return SortUtil.ascSort(a.values.normalisedTime, b.values.normalisedTime) || SortUtil.compareListNames(a, b);
			case "range": return SortUtil.ascSort(a.values.normalisedRange, b.values.normalisedRange) || SortUtil.compareListNames(a, b);
		}
	}

	static sortMetaFilter (a, b) {
		const ixA = PageFilterSpells._META_FILTER_BASE_ITEMS.indexOf(a.item);
		const ixB = PageFilterSpells._META_FILTER_BASE_ITEMS.indexOf(b.item);

		if (~ixA && ~ixB) return ixA - ixB;
		if (~ixA) return -1;
		if (~ixB) return 1;
		if (a.item === "SRD") return 1;
		if (b.item === "SRD") return -1;
		return SortUtil.ascSortLower(a, b);
	}

	static getFilterAbilitySave (ability) {
		return `${Parser.translateAbility(ability)}豁免`;
	}

	static getFilterAbilityCheck (ability) {
		return `${Parser.translateAbility(ability)}檢定`;
	}

	static getMetaFilterObj (s) {
		const out = [];
		if (s.meta) {
			Object.entries(s.meta)
				.filter(([_, v]) => v)
				.sort(SortUtil.ascSort)
				.forEach(([k]) => out.push(k.toTitleCase()));
		}
		if (s.duration.filter(d => d.concentration).length) {
			out.push(PageFilterSpells._META_ADD_CONC);
			s._isConc = true;
		} else s._isConc = false;
		if (s.components && s.components.v) out.push(PageFilterSpells._META_ADD_V);
		if (s.components && s.components.s) out.push(PageFilterSpells._META_ADD_S);
		if (s.components && s.components.m) out.push(PageFilterSpells._META_ADD_M);
		if (s.components && s.components.r) out.push(PageFilterSpells._META_ADD_R);
		if (s.components && s.components.m && s.components.m.cost) out.push(PageFilterSpells._META_ADD_M_COST);
		if (s.components && s.components.m && s.components.m.consume) out.push(PageFilterSpells._META_ADD_M_CONSUMED);
		if ((s.miscTags && s.miscTags.includes("PRM")) || s.duration.filter(it => it.type === "permanent").length) out.push(Parser.spMiscTagToFull("PRM"));
		if ((s.miscTags && s.miscTags.includes("SCL")) || s.entriesHigherLevel) out.push(Parser.spMiscTagToFull("SCL"));
		if (s.miscTags && s.miscTags.includes("HL")) out.push(Parser.spMiscTagToFull("HL"));
		if (s.miscTags && s.miscTags.includes("HL")) out.push(Parser.spMiscTagToFull("HL"));
		if (s.miscTags && s.miscTags.includes("SMN")) out.push(Parser.spMiscTagToFull("SMN"));
		if (s.miscTags && s.miscTags.includes("SGT")) out.push(Parser.spMiscTagToFull("SGT"));
		if (s.miscTags && s.miscTags.includes("THP")) out.push(Parser.spMiscTagToFull("THP"));
		if (s.srd) out.push("SRD");
		return out;
	}

	static getFilterDuration (spell) {
		const fDur = spell.duration[0] || {type: "special"};
		switch (fDur.type) {
			case "instant": return "Instant";
			case "timed": {
				if (!fDur.duration) return "Special";
				switch (fDur.duration.type) {
					case "turn":
					case "round": return "1 Round";

					case "minute": {
						const amt = fDur.duration.amount || 0;
						if (amt <= 1) return "1 Minute";
						if (amt <= 10) return "10 Minutes";
						if (amt <= 60) return "1 Hour";
						if (amt <= 8 * 60) return "8 Hours";
						return "24+ Hours";
					}

					case "hour": {
						const amt = fDur.duration.amount || 0;
						if (amt <= 1) return "1 Hour";
						if (amt <= 8) return "8 Hours";
						return "24+ Hours";
					}

					case "week":
					case "day":
					case "year": return "24+ Hours";
					default: return "Special";
				}
			}
			case "permanent": return "Permanent";
			case "special":
			default: return "Special";
		}
	}

	static getNormalisedTime (time) {
		const firstTime = time[0];
		let multiplier = 1;
		let offset = 0;
		switch (firstTime.unit) {
			case Parser.SP_TM_B_ACTION: offset = 1; break;
			case Parser.SP_TM_REACTION: offset = 2; break;
			case Parser.SP_TM_ROUND: multiplier = 6; break;
			case Parser.SP_TM_MINS: multiplier = 60; break;
			case Parser.SP_TM_HRS: multiplier = 3600; break;
		}
		if (time.length > 1) offset += 0.5;
		return (multiplier * firstTime.number) + offset;
	}

	static getNormalisedRange (range) {
		let multiplier = 1;
		let distance = 0;
		let offset = 0;

		switch (range.type) {
			case RNG_SPECIAL: return 1000000000;
			case RNG_POINT: adjustForDistance(); break;
			case RNG_LINE: offset = 1; adjustForDistance(); break;
			case RNG_CONE: offset = 2; adjustForDistance(); break;
			case RNG_RADIUS: offset = 3; adjustForDistance(); break;
			case RNG_HEMISPHERE: offset = 4; adjustForDistance(); break;
			case RNG_SPHERE: offset = 5; adjustForDistance(); break;
			case RNG_CYLINDER: offset = 6; adjustForDistance(); break;
			case RNG_CUBE: offset = 7; adjustForDistance(); break;
		}

		// value in inches, to allow greater granularity
		return (multiplier * distance) + offset;

		function adjustForDistance () {
			const dist = range.distance;
			switch (dist.type) {
				case UNT_FEET: multiplier = PageFilterSpells.INCHES_PER_FOOT; distance = dist.amount; break;
				case UNT_MILES: multiplier = PageFilterSpells.INCHES_PER_FOOT * PageFilterSpells.FEET_PER_MILE; distance = dist.amount; break;
				case RNG_SELF: distance = 0; break;
				case RNG_TOUCH: distance = 1; break;
				case RNG_SIGHT: multiplier = PageFilterSpells.INCHES_PER_FOOT * PageFilterSpells.FEET_PER_MILE; distance = 12; break; // assume sight range of person ~100 ft. above the ground
				case RNG_UNLIMITED_SAME_PLANE: distance = 900000000; break; // from BolS (homebrew)
				case RNG_UNLIMITED: distance = 900000001; break;
				default: {
					// it's homebrew?
					const fromBrew = MiscUtil.get(BrewUtil.homebrewMeta, "spellDistanceUnits", dist.type);
					if (fromBrew) {
						const ftPerUnit = fromBrew.feetPerUnit;
						if (ftPerUnit != null) {
							multiplier = PageFilterSpells.INCHES_PER_FOOT * ftPerUnit;
							distance = dist.amount;
						} else {
							distance = 910000000; // default to max distance, to have them displayed at the bottom
						}
					}
					break;
				}
			}
		}
	}

	static getFltrSpellLevelStr (level) {
		return level === 0 ? Parser.spLevelToFull(level) : `${Parser.spLevelToFull(level)} level`;
	}

	static getRangeType (range) {
		switch (range.type) {
			case RNG_SPECIAL: return PageFilterSpells.F_RNG_SPECIAL;
			case RNG_POINT:
				switch (range.distance.type) {
					case RNG_SELF: return PageFilterSpells.F_RNG_SELF;
					case RNG_TOUCH: return PageFilterSpells.F_RNG_TOUCH;
					default: return PageFilterSpells.F_RNG_POINT;
				}
			case RNG_LINE:
			case RNG_CONE:
			case RNG_RADIUS:
			case RNG_HEMISPHERE:
			case RNG_SPHERE:
			case RNG_CYLINDER:
			case RNG_CUBE:
				return PageFilterSpells.F_RNG_SELF_AREA
		}
	}

	static getTblTimeStr (time) {
		return (time.number === 1 && Parser.SP_TIME_SINGLETONS.includes(time.unit))
			? `${Parser.TIME_UNIT_TARNSLATE[time.unit] || time.unit.uppercaseFirst()}`
			: `${time.number} ${Parser.TIME_UNIT_TARNSLATE[time.unit] || time.unit.uppercaseFirst()}`;
	}

	static getClassFilterItem (c) {
		const nm = c.name.split("(")[0].trim();
		const addSuffix = SourceUtil.isNonstandardSource(c.source || SRC_PHB) || BrewUtil.hasSourceJson(c.source || SRC_PHB);
		const name = `${nm}${addSuffix ? ` (${Parser.sourceJsonToAbv(c.source)})` : ""}`;
		return new FilterItem({
			item: name,
			userData: SourceUtil.getFilterGroup(c.source || SRC_PHB)
		});
	}

	static getRaceFilterItem (r) {
		const addSuffix = (r.source === SRC_DMG || SourceUtil.isNonstandardSource(r.source || SRC_PHB) || BrewUtil.hasSourceJson(r.source || SRC_PHB)) && !r.name.includes(Parser.sourceJsonToAbv(r.source));
		const name = `${r.name}${addSuffix ? ` (${Parser.sourceJsonToAbv(r.source)})` : ""}`;
		const opts = {
			item: name,
			userData: SourceUtil.getFilterGroup(r.source || SRC_PHB)
		};
		if (r.baseName) opts.nest = r.baseName;
		else opts.nest = "(No Subraces)"
		return new FilterItem(opts);
	}
	// endregion

	constructor () {
		super();

		const levelFilter = new Filter({
			header: "Level", displayHeader: "環階",
			items: [
				0, 1, 2, 3, 4, 5, 6, 7, 8, 9
			],
			displayFn: Parser.spLevelToFull
		});
		const classFilter = new Filter({
			header: "Class", displayHeader: "職業", displayFn: Parser.translateMainClass,
			groupFn: it => it.userData
		});
		const subclassFilter = new Filter({
			header: "Subclass", displayHeader: "子職業", displayFn: Parser.translateSubClass,
			nests: {},
			groupFn: (it) => SourceUtil.isSubclassReprinted(it.userData.class.name, it.userData.class.source, it.userData.subClass.name, it.userData.subClass.source) || Parser.sourceJsonToFull(it.userData.subClass.source).startsWith(UA_PREFIX) || Parser.sourceJsonToFull(it.userData.subClass.source).startsWith(PS_PREFIX),
			itemSortFn: (a, b)=>SortUtil.ascSortLower(a.item, b.item)
		});
		const variantClassFilter = new Filter({header: "Variant Class", displayHeader: "變體職業", displayFn: Parser.translateMainClass, headerHelp: `資源: ${Parser.sourceJsonToFull(SRC_UACFV)}`});
		const classAndSubclassFilter = new MultiFilter({header: "Classes", displayHeader: "職業", mode: "or", filters: [classFilter, subclassFilter, variantClassFilter]});
		const raceFilter = new Filter({
			header: "Race", displayHeader: "種族", displayFn: Parser.translateSubRace,
			nests: {},
			groupFn: it => it.userData,
			itemSortFn: (a, b)=>SortUtil.ascSortLower(a.item, b.item)
		});
		const backgroundFilter = new Filter({header: "Background", displayHeader: "背景", displayFn: it=>Parser.translate(PageFilterSpells.SP_BACKGROUND_TO_TRANS, it)});
		const metaFilter = new Filter({
			header: "Components & Miscellaneous", displayHeader: "構材 & 雜項",
			items: [...PageFilterSpells._META_FILTER_BASE_ITEMS, "Ritual", "Technomagic", "SRD"],
			itemSortFn: PageFilterSpells.sortMetaFilter,
			displayFn: (it)=>Parser.translate(PageFilterSpells.COMPONENT_TO_TRANS, it)
		});
		const schoolFilter = new Filter({
			header: "School", displayHeader: "學派",
			items: [...Parser.SKL_ABVS],
			displayFn: Parser.spSchoolAbvToFull,
			itemSortFn: (a, b) => SortUtil.ascSortLower(Parser.spSchoolAbvToFull(a.item), Parser.spSchoolAbvToFull(b.item))
		});
		const subSchoolFilter = new Filter({
			header: "Subschool", displayHeader: "子學派",
			items: [],
			displayFn: Parser.spSchoolAbvToFull
		});
		const damageFilter = new Filter({
			header: "Damage Type", displayHeader: "傷害類型",
			items: MiscUtil.copy(Parser.DMG_TYPES),
			displayFn: Parser.translateDmgType
		});
		const conditionFilter = new Filter({
			header: "Conditions Inflicted", displayHeader: "造成狀態",
			items: MiscUtil.copy(Parser.CONDITIONS),
			displayFn: Parser.translateCondition
		});
		const spellAttackFilter = new Filter({
			header: "Spell Attack", displayHeader: "法術攻擊",
			items: ["M", "R", "O"],
			displayFn: Parser.spAttackTypeToFull,
			itemSortFn: null
		});
		const saveFilter = new Filter({
			header: "Saving Throw", displayHeader: "豁免檢定",
			items: ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"],
			displayFn: PageFilterSpells.getFilterAbilitySave,
			itemSortFn: null
		});
		const checkFilter = new Filter({
			header: "Ability Check", displayHeader: "屬性檢定",
			items: ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"],
			displayFn: PageFilterSpells.getFilterAbilityCheck,
			itemSortFn: null
		});
		const timeFilter = new Filter({
			header: "Cast Time", displayHeader: "施法時間",
			items: [
				Parser.SP_TM_ACTION,
				Parser.SP_TM_B_ACTION,
				Parser.SP_TM_REACTION,
				Parser.SP_TM_ROUND,
				Parser.SP_TM_MINS,
				Parser.SP_TM_HRS
			],
			displayFn: Parser.spTimeUnitToFull,
			itemSortFn: null
		});
		const durationFilter = new RangeFilter({
			header: "Duration", displayHeader: "持續時間",
			isLabelled: true,
			labelSortFn: null,
			labels: ["Instant", "1 Round", "1 Minute", "10 Minutes", "1 Hour", "8 Hours", "24+ Hours", "Permanent", "Special"],
			labelDisplayFn: Parser.translateSpDuration
		});
		const rangeFilter = new Filter({
			header: "Range", displayHeader: "射程",
			items: [
				PageFilterSpells.F_RNG_SELF,
				PageFilterSpells.F_RNG_TOUCH,
				PageFilterSpells.F_RNG_POINT,
				PageFilterSpells.F_RNG_SELF_AREA,
				PageFilterSpells.F_RNG_SPECIAL
			],
			displayFn: (it)=>Parser.translate(PageFilterSpells.RANGE_TO_TRANS, it),
			itemSortFn: null
		});
		const areaTypeFilter = new Filter({
			header: "Area Style", displayHeader: "範圍類型",
			items: ["ST", "MT", "R", "N", "C", "Y", "H", "L", "S", "Q", "W"],
			displayFn: Parser.spAreaTypeToFull,
			itemSortFn: null
		});

		this._classFilter = classFilter;
		this._subclassFilter = subclassFilter;
		this._levelFilter = levelFilter;
		this._variantClassFilter = variantClassFilter;
		this._classAndSubclassFilter = classAndSubclassFilter;
		this._raceFilter = raceFilter;
		this._backgroundFilter = backgroundFilter;
		this._eldritchInvocationFilter = new Filter({header: "Eldritch Invocation", displayHeader: "魔能祈喚"});
		this._metaFilter = metaFilter;
		this._schoolFilter = schoolFilter;
		this._subSchoolFilter = subSchoolFilter;
		this._damageFilter = damageFilter;
		this._conditionFilter = conditionFilter;
		this._spellAttackFilter = spellAttackFilter;
		this._saveFilter = saveFilter;
		this._checkFilter = checkFilter;
		this._timeFilter = timeFilter;
		this._durationFilter = durationFilter;
		this._rangeFilter = rangeFilter;
		this._areaTypeFilter = areaTypeFilter;
	}

	mutateForFilters (spell) {
		Renderer.spell.initClasses(spell);

		// used for sorting
		spell._normalisedTime = PageFilterSpells.getNormalisedTime(spell.time);
		spell._normalisedRange = PageFilterSpells.getNormalisedRange(spell.range);

		// used for filtering
		spell._fSources = SourceFilter.getCompleteFilterSources(spell);
		spell._fMeta = PageFilterSpells.getMetaFilterObj(spell);
		spell._fClasses = Renderer.spell.getCombinedClasses(spell, "fromClassList").map(PageFilterSpells.getClassFilterItem);
		spell._fSubclasses = Renderer.spell.getCombinedClasses(spell, "fromSubclass")
			.map(c => {
				// if (c.subclass.name === "Land") debugger
				return new FilterItem({
					item: `${c.class.name}: ${PageFilterSpells.getClassFilterItem(c.subclass).item}${c.subclass.subSubclass ? `, ${c.subclass.subSubclass}` : ""}`,
					nest: c.class.name,
					userData: {
						subClass: {
							name: c.subclass.name,
							source: c.subclass.source
						},
						class: {
							name: c.class.name,
							source: c.class.source
						}
					}
				});
			});
		spell._fVariantClasses = spell.classes && spell.classes.fromClassListVariant ? spell.classes.fromClassListVariant.map(PageFilterSpells.getClassFilterItem) : [];
		spell._fRaces = spell.races ? spell.races.map(PageFilterSpells.getRaceFilterItem) : [];
		spell._fBackgrounds = spell.backgrounds ? spell.backgrounds.map(bg => bg.name) : [];
		spell._fEldritchInvocations = spell.eldritchInvocations ? spell.eldritchInvocations.map(ei => ei.name) : [];
		spell._fTimeType = spell.time.map(t => t.unit);
		spell._fDurationType = PageFilterSpells.getFilterDuration(spell);
		spell._fRangeType = PageFilterSpells.getRangeType(spell.range);

		spell._fAreaTags = [...(spell.areaTags || [])];
		if (spell.range.type === "line" && !spell._fAreaTags.includes("L")) spell._fAreaTags.push("L");
	}

	addToFilters (spell, isExcluded) {
		if (isExcluded) return;

		if (spell.level > 9) this._levelFilter.addItem(spell.level);
		this._schoolFilter.addItem(spell.school);
		this._sourceFilter.addItem(spell._fSources);
		this._metaFilter.addItem(spell._fMeta);
		this._backgroundFilter.addItem(spell._fBackgrounds);
		this._eldritchInvocationFilter.addItem(spell._fEldritchInvocations);
		spell._fClasses.forEach(c => this._classFilter.addItem(c));
		spell._fSubclasses.forEach(sc => {
			this._subclassFilter.addNest(sc.nest, {isHidden: true, displayFn: Parser.translateMainClass});
			this._subclassFilter.addItem(sc);
		});
		spell._fRaces.forEach(r => {
			if (r.nest) this._raceFilter.addNest(r.nest, {isHidden: true, displayFn: Parser.translateMainRace});
			this._raceFilter.addItem(r);
		});
		spell._fVariantClasses.forEach(c => this._variantClassFilter.addItem(c));
		this._subSchoolFilter.addItem(spell.subschools);
	}

	async _pPopulateBoxOptions (opts) {
		await SourceUtil.pInitSubclassReprintLookup();

		opts.filters = [
			this._sourceFilter,
			this._levelFilter,
			this._classAndSubclassFilter,
			this._raceFilter,
			this._backgroundFilter,
			this._eldritchInvocationFilter,
			this._metaFilter,
			this._schoolFilter,
			this._subSchoolFilter,
			this._damageFilter,
			this._conditionFilter,
			this._spellAttackFilter,
			this._saveFilter,
			this._checkFilter,
			this._timeFilter,
			this._durationFilter,
			this._rangeFilter,
			this._areaTypeFilter
		];
	}

	toDisplay (values, s) {
		return this._filterBox.toDisplay(
			values,
			s._fSources,
			s.level,
			[s._fClasses, s._fSubclasses, s._fVariantClasses],
			s._fRaces,
			s._fBackgrounds,
			s._fEldritchInvocations,
			s._fMeta,
			s.school,
			s.subschools,
			s.damageInflict,
			s.conditionInflict,
			s.spellAttack,
			s.savingThrow,
			s.abilityCheck,
			s._fTimeType,
			s._fDurationType,
			s._fRangeType,
			s._fAreaTags
		)
	}
}
// toss these into the "Tags" section to save screen space
PageFilterSpells._META_ADD_CONC = "Concentration";
PageFilterSpells._META_ADD_V = "Verbal";
PageFilterSpells._META_ADD_S = "Somatic";
PageFilterSpells._META_ADD_M = "Material";
PageFilterSpells._META_ADD_R = "Royalty";
PageFilterSpells._META_ADD_M_COST = "Material with Cost";
PageFilterSpells._META_ADD_M_CONSUMED = "Material is Consumed";

PageFilterSpells.F_RNG_POINT = "Point";
PageFilterSpells.F_RNG_SELF_AREA = "Self (Area)";
PageFilterSpells.F_RNG_SELF = "Self";
PageFilterSpells.F_RNG_TOUCH = "Touch";
PageFilterSpells.F_RNG_SPECIAL = "Special";

PageFilterSpells._META_FILTER_BASE_ITEMS = [PageFilterSpells._META_ADD_CONC, PageFilterSpells._META_ADD_V, PageFilterSpells._META_ADD_S, PageFilterSpells._META_ADD_M, PageFilterSpells._META_ADD_R, PageFilterSpells._META_ADD_M_COST, PageFilterSpells._META_ADD_M_CONSUMED, ...Object.values(Parser.SP_MISC_TAG_TO_FULL)];

PageFilterSpells.INCHES_PER_FOOT = 12;
PageFilterSpells.FEET_PER_MILE = 5280;

PageFilterSpells.COMPONENT_TO_TRANS = {
	"concentration": "專注", "verbal": "聲音", "somatic": "姿勢", "material": "材料", "royalty": "專利稅",
	"material with cost": "價值材料", "material is consumed": "消耗材料",
	"healing": "治療", "grants temporary hit points": "賦予臨時生命值", "requires sight": "要求視野可見", "permanent effects": "永久效果",
	"scaling effects": "升級效果", "summons creature": "召喚生物",
	"ritual": "儀式", "technomagic": "科技魔法"
};
PageFilterSpells.RANGE_TO_TRANS = {
	"self": "自身", "touch": "觸碰", "point": "點", "self (area)": "自身（區域）", "special": "特殊"
};
PageFilterSpells.SP_BACKGROUND_TO_TRANS = {
	"dimir operative": "底密爾特務",
	"simic scientist": "析米克科學家",
	"boros legionnaire": "波洛斯軍團兵",
	"selesnya initiate": "瑟雷尼亞祀徒",
	"golgari agent": "葛加理密探",
	"izzet engineer": "伊捷工程師",
	"azorius functionary": "俄佐立官員",
	"gruul anarch": "古魯反抗者",
	"orzhov representative": "歐佐夫議員",
	"rakdos cultist": "拉鐸司邪教徒",
}

class ModalFilterSpells extends ModalFilter {
	constructor (namespace) {
		super({
			modalTitle: "Spells",
			pageFilter: new PageFilterSpells(),
			fnSort: PageFilterSpells.sortSpells,
			namespace: namespace
		});
	}

	_$getColumnHeaders () {
		const btnMeta = [
			{sort: "name", text: "Name", width: "3"},
			{sort: "level", text: "Level", width: "1-5"},
			{sort: "time", text: "Time", width: "2"},
			{sort: "school", text: "School", width: "1"},
			{sort: "concentration", text: "C.", title: "Concentration", width: "0-5"},
			{sort: "range", text: "Range", width: "2"},
			{sort: "source", text: "Source", width: "1"}
		];
		return ModalFilter._$getFilterColumnHeaders(btnMeta);
	}

	async _pInit () {
		Renderer.spell.populateHomebrewClassLookup(BrewUtil.homebrew);
	}

	async _pLoadAllData () {
		const brew = await BrewUtil.pAddBrewData();
		const fromData = await DataUtil.spell.pLoadAll();
		const fromBrew = brew.spell || [];
		return [...fromData, ...fromBrew];
	}

	_getListItem (pageFilter, spell, spI) {
		const eleLi = document.createElement("li");
		eleLi.className = "row";

		const hash = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_SPELLS](spell);
		const source = Parser.sourceJsonToAbv(spell.source);
		const levelText = `${Parser.spLevelToFull(spell.level)}${spell.meta && spell.meta.ritual ? " (rit.)" : ""}${spell.meta && spell.meta.technomagic ? " (tec.)" : ""}`;
		const time = PageFilterSpells.getTblTimeStr(spell.time[0]);
		const school = Parser.spSchoolAndSubschoolsAbvsShort(spell.school, spell.subschools);
		const concentration = spell._isConc ? "×" : "";
		const range = Parser.spRangeToFull(spell.range);

		eleLi.innerHTML = `<label class="lst--border no-select">
			<div class="lst__wrp-cells">
				<div class="col-1 pl-0 flex-vh-center"><input type="checkbox" class="no-events"></div>
				<div class="bold col-3">${spell.name}</div>
				<div class="col-1-5 text-center">${levelText}</div>
				<div class="col-2 text-center">${time}</div>
				<div class="col-1 school_${spell.school} text-center" title="${Parser.spSchoolAndSubschoolsAbvsToFull(spell.school, spell.subschools)}" ${Parser.spSchoolAbvToStyle(spell.school)}>${school}</div>
				<div class="col-0-5 text-center" title="Concentration">${concentration}</div>
				<div class="col-2 text-right">${range}</div>
				<div class="col-1 pr-0 text-center ${Parser.sourceJsonToColor(spell.source)}" title="${Parser.sourceJsonToFull(spell.source)}" ${BrewUtil.sourceJsonToStyle(spell.source)}>${source}</div>
			</div>
		</label>`;

		return new ListItem(
			spI,
			eleLi,
			spell.name,
			{
				hash,
				source,
				sourceJson: spell.source,
				level: spell.level,
				time,
				school: Parser.spSchoolAbvToFull(spell.school),
				classes: Parser.spClassesToFull(spell, true),
				concentration,
				normalisedTime: spell._normalisedTime,
				normalisedRange: spell._normalisedRange
			},
			{
				cbSel: eleLi.firstElementChild.firstElementChild.firstElementChild.firstElementChild
			}
		);
	}
}

if (typeof module !== "undefined") {
	module.exports = PageFilterSpells;
}
