"use strict";

class NavBar {
	static init () {
		this._initInstallPrompt();
		// render the visible elements ASAP
		window.addEventListener(
			"DOMContentLoaded",
			function () {
				NavBar.initElements();
				NavBar.highlightCurrentPage();
			}
		);
		window.addEventListener("load", NavBar.initHandlers);
	}

	static _initInstallPrompt () {
		NavBar._cachedInstallEvent = null;
		window.addEventListener("beforeinstallprompt", e => NavBar._cachedInstallEvent = e);
	}

	static initElements () {
		const navBar = document.getElementById("navbar");

		// create mobile "Menu" button
		const btnShowHide = document.createElement("button");
		btnShowHide.className = "btn btn-default page__btn-toggle-nav";
		btnShowHide.innerHTML = "Menu";
		btnShowHide.onclick = () => {
			$(btnShowHide).toggleClass("active");
			$(`.page__nav-hidden-mobile`).toggleClass("block", $(btnShowHide).hasClass("active"));
		};
		document.getElementById("navigation").prepend(btnShowHide);

		addLi(navBar, "5etools.html", "首頁", {isRoot: true});

		const ulRules = addDropdown(navBar, "規則");
		addLi(ulRules, "quickreference.html", "快速參照");
		addLi(ulRules, "variantrules.html", "變體/選用/擴展規則");
		addLi(ulRules, "tables.html", "表格");
		addDivider(ulRules);
		const ulBooks = addDropdown(ulRules, "出版書籍", true);
		addLi(ulBooks, "books.html", "查看全部/自製內容");
		addDivider(ulBooks);
		addLi(ulBooks, "book.html", "玩家手冊", {aHash: "PHB", date: "2014"});
		addLi(ulBooks, "book.html", "怪物圖鑑", {aHash: "MM", date: null});
		addLi(ulBooks, "book.html", "地下城主指南", {aHash: "DMG", date: null});
		addDivider(ulBooks);
		addLi(ulBooks, "book.html", "劍灣冒險指南", {aHash: "SCAG", date: "2015"});
		addLi(ulBooks, "book.html", "瓦羅的怪物指南", {aHash: "VGM", date: "2016"});
		addLi(ulBooks, "book.html", "姍納薩的萬事指南", {aHash: "XGE", date: "2017"});
		addLi(ulBooks, "book.html", "魔鄧肯的眾敵卷冊", {aHash: "MTF", date: "2018"});
		addLi(ulBooks, "book.html", "拉尼卡的公會長指南", {aHash: "GGR", date: null});
		addLi(ulBooks, "book.html", "艾奎茲玄股份有限公司", {aHash: "AI", date: "2019"});
		addLi(ulBooks, "book.html", "艾伯倫：從終末戰爭復甦", {aHash: "ERLW", date: null});
		addLi(ulBooks, "book.html", "龍與地下城 vs. 瑞克和莫蒂：基本規則", {aHash: "RMR", date: null});
		addLi(ulBooks, "book.html", "荒洲探索指南", {aHash: "EGW", date: "2020"});
		addLi(ulBooks, "book.html", "塞洛斯的神話奧德賽", {aHash: "MOT", date: null});
		addDivider(ulBooks);
		addLi(ulBooks, "book.html", "冒險者聯盟", {aHash: "AL", date: "2016"});
		addLi(ulBooks, "book.html", "智者建言彙編", {aHash: "SAC", date: "2019"});

		const ulPlayers = addDropdown(navBar, "玩家選項");
		addLi(ulPlayers, "races.html", "種族");
		addLi(ulPlayers, "classes.html", "職業");
		addLi(ulPlayers, "backgrounds.html", "背景");
		addLi(ulPlayers, "feats.html", "專長");
		addDivider(ulPlayers);
		addLi(ulPlayers, "statgen.html", "屬性產生器");
		addDivider(ulPlayers);
		addLi(ulPlayers, "lifegen.html", "這是你的人生");
		addLi(ulPlayers, "names.html", "姓名產生器");

		const ulDms = addDropdown(navBar, "DM工具");
		addLi(ulDms, "dmscreen.html", "DM屏幕");
		addDivider(ulDms);
		const ulAdventures = addDropdown(ulDms, "冒險模組", true);
		addLi(ulAdventures, "adventures.html", "查看全部/自製內容");
		addDivider(ulAdventures);
		addLi(ulAdventures, "adventure.html", "Lost Mines of Phandelver", {isSide: true, aHash: "LMoP", date: "2014"});
		addLi(ulAdventures, "adventure.html", "Hoard of the Dragon Queen", {isSide: true, aHash: "HotDQ", date: null});
		addLi(ulAdventures, "adventure.html", "Rise of Tiamat", {isSide: true, aHash: "RoT", date: null});
		addLi(ulAdventures, "adventure.html", "Princes of the Apocalypse", {isSide: true, aHash: "PotA", date: "2015"});
		addLi(ulAdventures, "adventure.html", "Out of the Abyss", {isSide: true, aHash: "OotA", date: null});
		addLi(ulAdventures, "adventure.html", "Curse of Strahd", {isSide: true, aHash: "CoS", date: "2016"});
		addLi(ulAdventures, "adventure.html", "Storm King's Thunder", {isSide: true, aHash: "SKT", date: null});
		addLi(ulAdventures, "adventure.html", "Tales from the Yawning Portal: The Sunless Citadel", {isSide: true, aHash: "TftYP-TSC", date: "2017"});
		addLi(ulAdventures, "adventure.html", "Tales from the Yawning Portal: The Forge of Fury", {isSide: true, aHash: "TftYP-TFoF", date: null});
		addLi(ulAdventures, "adventure.html", "Tales from the Yawning Portal: The Hidden Shrine of Tamoachan", {isSide: true, aHash: "TftYP-THSoT", date: null});
		addLi(ulAdventures, "adventure.html", "Tales from the Yawning Portal: White Plume Mountain", {isSide: true, aHash: "TftYP-WPM", date: null});
		addLi(ulAdventures, "adventure.html", "Tales from the Yawning Portal: Dead in Thay", {isSide: true, aHash: "TftYP-DiT", date: null});
		addLi(ulAdventures, "adventure.html", "Tales from the Yawning Portal: Against the Giants", {isSide: true, aHash: "TftYP-AtG", date: null});
		addLi(ulAdventures, "adventure.html", "Tales from the Yawning Portal: Tomb of Horrors", {isSide: true, aHash: "TftYP-ToH", date: null});
		addLi(ulAdventures, "adventure.html", "Tomb of Annihilation", {isSide: true, aHash: "ToA", date: null});
		addLi(ulAdventures, "adventure.html", "The Tortle Package", {isSide: true, aHash: "TTP", date: null});
		addLi(ulAdventures, "adventure.html", "Waterdeep: Dragon Heist", {isSide: true, aHash: "WDH", date: "2018"});
		addLi(ulAdventures, "adventure.html", "Lost Laboratory of Kwalish", {isSide: true, aHash: "LLK", date: null});
		addLi(ulAdventures, "adventure.html", "Waterdeep: Dungeon of the Mad Mage", {isSide: true, aHash: "WDMM", date: null});
		addLi(ulAdventures, "adventure.html", "Krenko's Way", {isSide: true, aHash: "KKW", date: null});
		addLi(ulAdventures, "adventure.html", "Ghosts of Saltmarsh", {isSide: true, aHash: "GoS", date: "2019"});
		addLi(ulAdventures, "adventure.html", "Hunt for the Thessalhydra", {isSide: true, aHash: "HftT", date: null});
		addLi(ulAdventures, "adventure.html", "The Orrery of the Wanderer", {isSide: true, aHash: "OoW", date: null});
		addLi(ulAdventures, "adventure.html", "Essentials Kit: Dragon of Icespire Peak", {isSide: true, aHash: "DIP", date: null});
		addLi(ulAdventures, "adventure.html", "Essentials Kit: Storm Lord's Wrath", {isSide: true, aHash: "SLW", date: null});
		addLi(ulAdventures, "adventure.html", "Essentials Kit: Sleeping Dragon's Wake", {isSide: true, aHash: "SDW", date: null});
		addLi(ulAdventures, "adventure.html", "Essentials Kit: Divine Contention", {isSide: true, aHash: "DC", date: null});
		addLi(ulAdventures, "adventure.html", "Baldur's Gate: Descent Into Avernus", {isSide: true, aHash: "BGDIA", date: null});
		addLi(ulAdventures, "adventure.html", "Locathah Rising", {isSide: true, aHash: "LR", date: null});
		addLi(ulAdventures, "adventure.html", "Eberron: Forgotten Relics", {isSide: true, aHash: "EFR", date: null});
		addLi(ulAdventures, "adventure.html", "Rick and Morty: Big Rick Energy", {isSide: true, aHash: "RMBRE", date: null});
		addLi(ulAdventures, "adventure.html", "Infernal Machine Rebuild", {isSide: true, aHash: "IMR", date: null});
		addLi(ulAdventures, "adventure.html", "Wildemount: Tide of Retribution", {isSide: true, aHash: "ToR", date: "2020"});
		addLi(ulAdventures, "adventure.html", "Wildemount: Dangerous Designs", {isSide: true, aHash: "DD", date: null});
		addLi(ulAdventures, "adventure.html", "Wildemount: Frozen Sick", {isSide: true, aHash: "FS", date: null});
		addLi(ulAdventures, "adventure.html", "Wildemount: Unwelcome Spirits", {isSide: true, aHash: "US", date: null});
		addLi(ulDms, "cultsboons.html", "Cults & Supernatural Boons");
		addLi(ulDms, "objects.html", "Objects");
		addLi(ulDms, "trapshazards.html", "Traps & Hazards");
		addDivider(ulDms);
		addLi(ulDms, "crcalculator.html", "CR Calculator");
		addLi(ulDms, "encountergen.html", "Encounter Generator");
		addLi(ulDms, "lootgen.html", "Loot Generator");

		const ulReferences = addDropdown(navBar, "參照資料");
		addLi(ulReferences, "actions.html", "動作");
		addLi(ulReferences, "bestiary.html", "生物百科");
		addLi(ulReferences, "conditionsdiseases.html", "狀態＆疾病");
		addLi(ulReferences, "deities.html", "神祇");
		addLi(ulReferences, "items.html", "物品");
		addLi(ulReferences, "languages.html", "語言");
		addLi(ulReferences, "optionalfeatures.html", "可選職業能力和選項");
		addLi(ulReferences, "rewards.html", "超自然賜福 & 獎勵");
		addLi(ulReferences, "psionics.html", "靈能");
		addLi(ulReferences, "spells.html", "法術");
		addLi(ulReferences, "vehicles.html", "載具");

		const ulUtils = addDropdown(navBar, "其他功能");
		addLi(ulUtils, "search.html", "Search");
		addDivider(ulUtils);
		addLi(ulUtils, "blacklist.html", "Content Blacklist");
		addLi(ulUtils, "makebrew.html", "Homebrew Builder");
		addLi(ulUtils, "managebrew.html", "Homebrew Manager");
		addDivider(ulUtils);
		addLi(ulUtils, "inittrackerplayerview.html", "Initiative Tracker Player View");
		addDivider(ulUtils);
		addLi(ulUtils, "renderdemo.html", "Renderer Demo");
		addLi(ulUtils, "makecards.html", "RPG Cards JSON Builder");
		addLi(ulUtils, "converter.html", "Text Converter");
		addDivider(ulUtils);
		addLi(ulUtils, "plutonium.html", "Plutonium (Foundry Module) Features");
		addDivider(ulUtils);
		addLi(ulUtils, "roll20.html", "Roll20 Script Help");
		addDivider(ulUtils);
		addLi(ulUtils, "changelog.html", "Changelog");
		addLi(ulUtils, `https://wiki.5e.tools/index.php/Page:_${NavBar.getCurrentPage().replace(/.html$/i, "")}`, "Help", {isExternal: true});
		addDivider(ulUtils);
		addLi(ulUtils, "privacy-policy.html", "Privacy Policy");

		const ulSettings = addDropdown(navBar, "設置");
		addButton(
			ulSettings,
			{
				html: styleSwitcher.getActiveDayNight() === StyleSwitcher.STYLE_NIGHT ? "白晝模式" : "夜晚模式",
				click: (evt) => {
					evt.preventDefault();
					styleSwitcher.toggleDayNight();
				},
				className: "nightModeToggle"
			}
		);
		addButton(
			ulSettings,
			{
				html: styleSwitcher.getActiveWide() === true ? "關閉寬版模式" : "啟用寬版模式(測試中)",
				click: (evt) => {
					evt.preventDefault();
					styleSwitcher.toggleWide();
				},
				className: "wideModeToggle",
				title: "This feature is unsupported. Expect bugs."
			}
		);
		addDivider(ulSettings);
		addButton(
			ulSettings,
			{
				html: "Save State to File",
				click: async (evt) => {
					evt.preventDefault();
					const sync = StorageUtil.syncGetDump();
					const async = await StorageUtil.pGetDump();
					const dump = {sync, async};
					DataUtil.userDownload("5etools", dump);
				},
				title: "Save any locally-stored data (loaded homebrew, active blacklists, DM Screen configuration,...) to a file."
			}
		);
		addButton(
			ulSettings,
			{
				html: "Load State from File",
				click: async (evt) => {
					evt.preventDefault();
					const dump = await DataUtil.pUserUpload();

					StorageUtil.syncSetFromDump(dump.sync);
					await StorageUtil.pSetFromDump(dump.async);
					location.reload();
				},
				title: "Load previously-saved data (loaded homebrew, active blacklists, DM Screen configuration,...) from a file."
			}
		);
		addDivider(ulSettings);
		addButton(
			ulSettings,
			{
				html: "Add as App",
				click: async (evt) => {
					evt.preventDefault();
					try {
						NavBar._cachedInstallEvent.prompt();
					} catch (e) {
						// Ignore errors
					}
				},
				title: "Add the site to your home screen. When used in conjunction with the Preload Offline Data option, this can create a functional offline copy of the site."
			}
		);
		addButton(
			ulSettings,
			{
				html: "Preload Offline Data",
				click: async (evt) => {
					evt.preventDefault();

					if (!navigator.serviceWorker || !navigator.serviceWorker.controller) {
						JqueryUtil.doToast(`The loader was not yet available! Reload the page and try again. If this problem persists, your browser may not support preloading.`);
						return;
					}

					// a pipe with has "port1" and "port2" props; we'll send "port2" to the service worker so it can
					//   send messages back down the pipe to us
					const messageChannel = new MessageChannel();
					let hasSentPort = false;
					const sendMessage = (data) => {
						try {
							// Only send the MessageChannel port once, as the first send will transfer ownership of the
							//   port over to the service worker (and we can no longer access it to even send it)
							if (!hasSentPort) {
								hasSentPort = true;
								navigator.serviceWorker.controller.postMessage(data, [messageChannel.port2]);
							} else {
								navigator.serviceWorker.controller.postMessage(data);
							}
						} catch (e) {
							// Ignore errors
							setTimeout(() => { throw e; })
						}
					};

					if (NavBar._downloadBarMeta) {
						if (NavBar._downloadBarMeta) {
							NavBar._downloadBarMeta.$wrpOuter.remove();
							NavBar._downloadBarMeta = null;
						}
						sendMessage({"type": "cache-cancel"});
					}

					const $dispProgress = $(`<div class="page__disp-download-progress-bar"/>`);
					const $dispPct = $(`<div class="page__disp-download-progress-text flex-vh-center bold">0%</div>`);

					const $btnCancel = $(`<button class="btn btn-default"><span class="glyphicon glyphicon-remove"></span></button>`)
						.click(() => {
							if (NavBar._downloadBarMeta) {
								NavBar._downloadBarMeta.$wrpOuter.remove();
								NavBar._downloadBarMeta = null;
							}
							sendMessage({"type": "cache-cancel"});
						});

					const $wrpBar = $$`<div class="page__wrp-download-bar w-100 relative mr-2">${$dispProgress}${$dispPct}</div>`;
					const $wrpOuter = $$`<div class="page__wrp-download">
						${$wrpBar}
						${$btnCancel}
					</div>`.appendTo($("body"));

					NavBar._downloadBarMeta = {$wrpOuter, $wrpBar, $dispProgress, $dispPct};

					// Trigger the service worker to cache everything
					messageChannel.port1.onmessage = e => {
						const msg = e.data;
						switch (msg.type) {
							case "download-progress": {
								if (NavBar._downloadBarMeta) {
									NavBar._downloadBarMeta.$dispProgress.css("width", msg.data.pct);
									NavBar._downloadBarMeta.$dispPct.text(msg.data.pct);
								}
								break;
							}
							case "download-cancelled": {
								if (NavBar._downloadBarMeta) {
									NavBar._downloadBarMeta.$wrpOuter.remove();
									NavBar._downloadBarMeta = null;
								}
								break;
							}
							case "download-error": {
								if (NavBar._downloadBarMeta) {
									NavBar._downloadBarMeta.$wrpBar.addClass("page__wrp-download-bar--error");
									NavBar._downloadBarMeta.$dispProgress.addClass("page__disp-download-progress-bar--error");
									NavBar._downloadBarMeta.$dispPct.text("Error!");

									JqueryUtil.doToast(`An error occurred. ${VeCt.STR_SEE_CONSOLE}`);
								}
								setTimeout(() => { throw new Error(msg.message); })
								break;
							}
						}
					};

					sendMessage({"type": "cache-start"});
				},
				title: "Preload the site data for offline use. Warning: slow. If it appears to freeze, cancel it and try again; progress will be saved."
			}
		);

		/**
		 * Adds a new item to the navigation bar. Can be used either in root, or in a different UL.
		 * @param appendTo - Element to append this link to.
		 * @param aHref - Where does this link to.
		 * @param aText - What text does this link have.
		 * @param [opts] - Options object.
		 * @param [opts.isSide] - True if this item is part of a side menu.
		 * @param [opts.aHash] - Optional hash to be appended to the base href
		 * @param [opts.isRoot] - If the item is a root navbar element.
		 * @param [opts.isExternal] - If the item is an external link.
		 * @param [opts.date] - A date to prefix the list item with.
		 */
		function addLi (appendTo, aHref, aText, opts) {
			opts = opts || {};
			const hashPart = opts.aHash ? `#${opts.aHash}`.toLowerCase() : "";

			const li = document.createElement("li");
			li.setAttribute("role", "presentation");
			li.setAttribute("data-page", `${aHref}${hashPart}`);
			if (opts.isRoot) {
				li.classList.add("page__nav-hidden-mobile");
				li.classList.add("page__btn-nav-root");
			}
			if (opts.isSide) {
				li.onmouseenter = function () { NavBar.handleSideItemMouseEnter(this) }
			} else {
				li.onmouseenter = function () { NavBar.handleItemMouseEnter(this) };
				li.onclick = function () { NavBar._dropdowns.forEach(ele => ele.classList.remove("open")) }
			}

			const a = document.createElement("a");
			a.href = `${aHref}${hashPart}`;
			a.innerHTML = `${opts.date !== undefined ? `<span class="ve-muted ve-small mr-2 page__nav-date inline-block text-right">${opts.date || ""}</span>` : ""}${aText}`;
			a.classList.add("nav__link");

			if (opts.isExternal) {
				a.setAttribute("target", "_blank");
				a.classList.add("inline-split-v-center");
				a.classList.add("w-100");
				a.innerHTML = `<span>${aText}</span><span class="glyphicon glyphicon-new-window"/>`
			}

			li.appendChild(a);
			appendTo.appendChild(li);
		}

		function addDivider (appendTo) {
			const li = document.createElement("li");
			li.setAttribute("role", "presentation");
			li.className = "divider";

			appendTo.appendChild(li);
		}

		/**
		 * Adds a new dropdown starting list to the navigation bar
		 * @param {String} appendTo - Element to append this link to.
		 * @param {String} text - Dropdown text.
		 * @param {boolean} [isSide=false] - If this is a sideways dropdown.
		 */
		function addDropdown (appendTo, text, isSide = false) {
			const li = document.createElement("li");
			li.setAttribute("role", "presentation");
			li.className = `dropdown dropdown--navbar page__nav-hidden-mobile ${isSide ? "" : "page__btn-nav-root"}`;
			if (isSide) {
				li.onmouseenter = function () { NavBar.handleSideItemMouseEnter(this); };
			} else {
				li.onmouseenter = function () { NavBar.handleItemMouseEnter(this); };
			}

			const a = document.createElement("a");
			a.className = "dropdown-toggle";
			a.href = "#";
			a.setAttribute("role", "button");
			a.onclick = function (event) { NavBar.handleDropdownClick(this, event, isSide); };
			if (isSide) {
				a.onmouseenter = function () { NavBar.handleSideDropdownMouseEnter(this); };
				a.onmouseleave = function () { NavBar.handleSideDropdownMouseLeave(this); };
			}
			a.innerHTML = `${text} <span class="caret ${isSide ? "caret--right" : ""}"></span>`;

			const ul = document.createElement("li");
			ul.className = `dropdown-menu ${isSide ? "dropdown-menu--side" : "dropdown-menu--top"}`;
			ul.onclick = function (event) { event.stopPropagation(); };

			li.appendChild(a);
			li.appendChild(ul);
			appendTo.appendChild(li);
			return ul;
		}

		/**
		 * Special LI for buttong
		 * @param appendTo The element to append to.
		 * @param options Options.
		 * @param options.html Button text.
		 * @param options.click Button click handler.
		 * @param options.title Button title.
		 * @param options.className Additional button classes.
		 */
		function addButton (appendTo, options) {
			const li = document.createElement("li");
			li.setAttribute("role", "presentation");

			const a = document.createElement("a");
			a.href = "#";
			if (options.className) a.className = options.className;
			a.onclick = options.click;
			a.innerHTML = options.html;

			if (options.title) li.setAttribute("title", options.title);

			li.appendChild(a);
			appendTo.appendChild(li);
		}
	}

	static getCurrentPage () {
		let currentPage = window.location.pathname;
		currentPage = currentPage.substr(currentPage.lastIndexOf("/") + 1);

		if (!currentPage) currentPage = "5etools.html";
		return currentPage.trim();
	}

	static highlightCurrentPage () {
		let currentPage = NavBar.getCurrentPage();

		let isSecondLevel = false;
		if (currentPage.toLowerCase() === "book.html" || currentPage.toLowerCase() === "adventure.html") {
			const hashPart = window.location.hash.split(",")[0];
			if (currentPage.toLowerCase() === "adventure.html") isSecondLevel = true;
			currentPage += hashPart.toLowerCase();
		}
		if (currentPage.toLowerCase() === "adventures.html") isSecondLevel = true;

		if (typeof _SEO_PAGE !== "undefined") currentPage = `${_SEO_PAGE}.html`;

		try {
			let current = document.querySelector(`li[data-page="${currentPage}"]`);
			if (current == null) {
				currentPage = currentPage.split("#")[0];
				if (NavBar.ALT_CHILD_PAGES[currentPage]) currentPage = NavBar.ALT_CHILD_PAGES[currentPage];
				current = document.querySelector(`li[data-page="${currentPage}"]`);
			}
			current.parentNode.childNodes.forEach(n => n.classList && n.classList.remove("active"));
			current.classList.add("active");

			let closestLi = current.parentNode;
			const setNearestParentActive = () => {
				while (closestLi !== null && (closestLi.nodeName !== "LI" || !closestLi.classList.contains("dropdown"))) closestLi = closestLi.parentNode;
				closestLi && closestLi.classList.add("active");
			};
			setNearestParentActive();
			if (isSecondLevel) {
				closestLi = closestLi.parentNode;
				setNearestParentActive();
			}
		} catch (ignored) { setTimeout(() => { throw ignored }); }
	}

	static initHandlers () {
		NavBar._dropdowns = [...document.getElementById("navbar").querySelectorAll(`li.dropdown--navbar`)];
		document.addEventListener("click", () => NavBar._dropdowns.forEach(ele => ele.classList.remove("open")));

		NavBar._clearAllTimers();
	}

	static handleDropdownClick (ele, event, isSide) {
		event.preventDefault();
		event.stopPropagation();
		if (isSide) return;
		const isOpen = ele.parentNode.classList.contains("open");
		if (isOpen) NavBar._dropdowns.forEach(ele => ele.classList.remove("open"));
		else NavBar._openDropdown(ele);
	}

	static _openDropdown (fromLink) {
		const noRemove = new Set();
		let parent = fromLink.parentNode;
		parent.classList.add("open");
		noRemove.add(parent);

		while (parent.nodeName !== "NAV") {
			parent = parent.parentNode;
			if (parent.nodeName === "LI") {
				parent.classList.add("open");
				noRemove.add(parent);
			}
		}

		NavBar._dropdowns.filter(ele => !noRemove.has(ele)).forEach(ele => ele.classList.remove("open"));
	}

	static handleItemMouseEnter (ele) {
		const $ele = $(ele);
		const timerIds = $ele.siblings("[data-timer-id]").map((i, e) => ({$ele: $(e), timerId: $(e).data("timer-id")})).get();
		timerIds.forEach(({$ele, timerId}) => {
			if (NavBar._timersOpen[timerId]) {
				clearTimeout(NavBar._timersOpen[timerId]);
				delete NavBar._timersOpen[timerId];
			}

			if (!NavBar._timersClose[timerId] && $ele.hasClass("open")) {
				const getTimeoutFn = () => {
					if (NavBar._timerMousePos[timerId]) {
						const [xStart, yStart] = NavBar._timerMousePos[timerId];
						// for generalised use, this should be made check against the bounding box for the side menu
						// and possibly also check Y pos; e.g.
						// || EventUtil._mouseY > yStart + NavBar.MIN_MOVE_PX
						if (EventUtil._mouseX > xStart + NavBar.MIN_MOVE_PX) {
							NavBar._timerMousePos[timerId] = [EventUtil._mouseX, EventUtil._mouseY];
							NavBar._timersClose[timerId] = setTimeout(() => getTimeoutFn(), NavBar.DROP_TIME / 2);
						} else {
							$ele.removeClass("open");
							delete NavBar._timersClose[timerId];
						}
					} else {
						$ele.removeClass("open");
						delete NavBar._timersClose[timerId];
					}
				};

				NavBar._timersClose[timerId] = setTimeout(() => getTimeoutFn(), NavBar.DROP_TIME);
			}
		});
	}

	static handleSideItemMouseEnter (ele) {
		const timerId = $(ele).closest(`li.dropdown`).data("timer-id");
		if (NavBar._timersClose[timerId]) {
			clearTimeout(NavBar._timersClose[timerId]);
			delete NavBar._timersClose[timerId];
			delete NavBar._timerMousePos[timerId];
		}
	}

	static handleSideDropdownMouseEnter (ele) {
		const $ele = $(ele);
		const timerId = $ele.parent().data("timer-id") || NavBar._timerId++;
		$ele.parent().attr("data-timer-id", timerId);

		if (NavBar._timersClose[timerId]) {
			clearTimeout(NavBar._timersClose[timerId]);
			delete NavBar._timersClose[timerId];
		}

		if (!NavBar._timersOpen[timerId]) {
			NavBar._timersOpen[timerId] = setTimeout(() => {
				NavBar._openDropdown(ele);
				delete NavBar._timersOpen[timerId];
				NavBar._timerMousePos[timerId] = [EventUtil._mouseX, EventUtil._mouseY];
			}, NavBar.DROP_TIME);
		}
	}

	static handleSideDropdownMouseLeave (ele) {
		const $ele = $(ele);
		if (!$ele.parent().data("timer-id")) return;
		const timerId = $ele.parent().data("timer-id");
		clearTimeout(NavBar._timersOpen[timerId]);
		delete NavBar._timersOpen[timerId];
	}

	static _clearAllTimers () {
		Object.entries(NavBar._timersOpen).forEach(([k, v]) => {
			clearTimeout(v);
			delete NavBar._timersOpen[k];
		});
	}
}
NavBar.DROP_TIME = 250;
NavBar.MIN_MOVE_PX = 3;
NavBar.ALT_CHILD_PAGES = {
	"book.html": "books.html",
	"adventure.html": "adventures.html"
};
NavBar._timerId = 1;
NavBar._timersOpen = {};
NavBar._timersClose = {};
NavBar._timerMousePos = {};
NavBar._cachedInstallEvent = null;
NavBar._downloadBarMeta = null;
NavBar.init();
