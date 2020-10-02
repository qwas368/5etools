class RenderRaces {
	static $getRenderedRace (race) {
		const renderer = Renderer.get().setFirstSection(true);

		const $ptHeightWeight = RenderRaces._$getHeightAndWeightPart(race);

		return $$`
		${Renderer.utils.getBorderTr()}
		${Renderer.utils.getExcludedTr(race, "race")}
		${Renderer.utils.getNameTr(race, {controlRhs: race.soundClip ? RenderRaces._getPronunciationButton(race) : "", page: UrlUtil.PG_RACES})}
		<tr><td colspan="6"><b>屬性值：</b> ${(race.ability ? Renderer.getAbilityData(race.ability) : {asText: "無"}).asText}</td></tr>
		<tr><td colspan="6"><b>體型：</b> ${Parser.sizeAbvToFull(race.size || SZ_VARIES)}</td></tr>
		<tr><td colspan="6"><b>速度：</b> ${Parser.getSpeedString(race)}</td></tr>
		<tr><td class="divider" colspan="6"><div></div></td></tr>
		${race._isBaseRace ? `<tr class="text"><td colspan="6">${renderer.render({type: "entries", entries: race._baseRaceEntries}, 1)}</td></tr>` : `<tr class="text"><td colspan="6">${renderer.render({type: "entries", entries: race.entries}, 1)}</td></tr>`}

		${race.traitTags && race.traitTags.includes("NPC Race") ? `<tr class="text"><td colspan="6"><section class="text-muted">
			${renderer.render(`{@i 註記： 這個種族被記載於《地下城主指南》以做為創造非玩家角色的選項。它並非被設計做為玩家可用的種族。}`, 2)}
		 </section></td></tr>` : ""}

		${$ptHeightWeight ? $$`<tr class="text"><td colspan="6"><hr class="rd__hr">${$ptHeightWeight}</td></tr>` : ""}

		${Renderer.utils.getPageTr(race)}
		${Renderer.utils.getBorderTr()}`;
	}

	static _getPronunciationButton (race) {
		return `<button class="btn btn-xs btn-default btn-name-pronounce ml-2">
			<span class="glyphicon glyphicon-volume-up name-pronounce-icon"></span>
			<audio class="name-pronounce">
			   <source src="${Renderer.utils.getMediaUrl(race, "soundClip", "audio")}" type="audio/mpeg">
			</audio>
		</button>`;
	}

	static _$getHeightAndWeightPart (race) {
		if (!race.heightAndWeight) return null;
		if (race._isBaseRace) return null;

		const getRenderedHeight = (height) => {
			const heightFeet = Math.floor(height / 12);
			const heightInches = height % 12;
			return `${heightFeet ? `${heightFeet}呎` : ""}${heightInches ? `${heightInches}吋` : ""}`;
		};

		const entries = [
			"你可以使用隨機身高體重表來擲骰決定你角色的身高和體重。擲骰決定你的身高調整值並將其數值（單位為吋）加到角色的基礎身高中。至於體重的部分，把你身高調整值的擲骰結果乘上你體重調整值骰出的數值，並將其結果（單位為磅）加到基礎體重中。",
			{
				type: "table",
				caption: "隨機身高和體重",
				colLabels: ["基礎身高", "基礎體重", "身高調整值", "體重調整值", ""],
				colStyles: ["col-2-3 text-center", "col-2-3 text-center", "col-2-3 text-center", "col-2 text-center", "col-3-1 text-center"],
				rows: [
					[
						getRenderedHeight(race.heightAndWeight.baseHeight),
						`${race.heightAndWeight.baseWeight} 磅`,
						`+<span data-race-heightmod="true"></span>`,
						`× <span data-race-weightmod="true"></span> 磅`,
						`<div class="flex-vh-center">
							<div class="ve-hidden race__disp-result-height-weight flex-v-baseline">
								<div class="mr-1">=</div>
								<div class="race__disp-result-height"></div>
								<div class="mr-1">; </div>
								<div class="race__disp-result-weight mr-1"></div>
								<div class="small">磅</div>
							</div>
							<button class="btn btn-default btn-xs my-1 race__btn-roll-height-weight">擲骰</button>
						</div>`
					]
				]
			}
		];

		const $render = $$`${Renderer.get().render({entries})}`;

		// {@dice ${race.heightAndWeight.heightMod}||Height Modifier}
		// ${ptWeightMod}

		const $dispResult = $render.find(`.race__disp-result-height-weight`);
		const $dispHeight = $render.find(`.race__disp-result-height`);
		const $dispWeight = $render.find(`.race__disp-result-weight`);

		const lock = new VeLock();
		let hasRolled = false;
		let resultHeight;
		let resultWeightMod;

		const $btnRollHeight = $render
			.find(`[data-race-heightmod="true"]`)
			.html(race.heightAndWeight.heightMod)
			.addClass("roller")
			.mousedown(evt => evt.preventDefault())
			.click(async () => {
				try {
					await lock.pLock();

					if (!hasRolled) return pDoFullRoll(true);
					await pRollHeight();
					updateDisplay();
				} finally {
					lock.unlock();
				}
			});

		const isWeightRoller = race.heightAndWeight.weightMod && isNaN(race.heightAndWeight.weightMod);
		const $btnRollWeight = $render
			.find(`[data-race-weightmod="true"]`)
			.html(isWeightRoller ? `(<span class="roller">${race.heightAndWeight.weightMod}</span>)` : race.heightAndWeight.weightMod || "1")
			.click(async () => {
				try {
					await lock.pLock();

					if (!hasRolled) return pDoFullRoll(true);
					await pRollWeight();
					updateDisplay();
				} finally {
					lock.unlock();
				}
			});
		if (isWeightRoller) $btnRollWeight.mousedown(evt => evt.preventDefault());

		const $btnRoll = $render
			.find(`button.race__btn-roll-height-weight`)
			.click(async () => pDoFullRoll());

		const pRollHeight = async () => {
			const mResultHeight = await Renderer.dice.pRoll2(race.heightAndWeight.heightMod, {
				isUser: false,
				label: "身高調整值",
				name: race.translate_name || race.name
			});
			if (mResultHeight == null) return;
			resultHeight = mResultHeight;
		};

		const pRollWeight = async () => {
			const weightModRaw = race.heightAndWeight.weightMod || "1";
			const mResultWeightMod = isNaN(weightModRaw) ? await Renderer.dice.pRoll2(weightModRaw, {
				isUser: false,
				label: "體重調整值",
				name: race.translate_name || race.name
			}) : Number(weightModRaw);
			if (mResultWeightMod == null) return;
			resultWeightMod = mResultWeightMod;
		};

		const updateDisplay = () => {
			const renderedHeight = getRenderedHeight(race.heightAndWeight.baseHeight + resultHeight);
			const totalWeight = race.heightAndWeight.baseWeight + (resultWeightMod * resultHeight);
			$dispHeight.text(renderedHeight);
			$dispWeight.text(totalWeight);
		};

		const pDoFullRoll = async isPreLocked => {
			try {
				if (!isPreLocked) await lock.pLock();

				$btnRoll.parent().removeClass(`flex-vh-center`).addClass(`split-v-center`);
				await pRollHeight();
				await pRollWeight();
				$dispResult.removeClass(`ve-hidden`);
				updateDisplay();

				hasRolled = true;
			} finally {
				if (!isPreLocked) lock.unlock();
			}
		};

		return $render;
	}
}
