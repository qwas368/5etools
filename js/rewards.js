"use strict";

class RewardsPage extends ListPage {
	constructor () {
		const pageFilter = new PageFilterRewards();
		super({
			dataSource: "data/rewards.json",

			pageFilter,

			listClass: "rewards",

			sublistClass: "subrewards",

			dataProps: ["reward"]
		});
	}

	getListItem (reward, rwI, isExcluded) {
		this._pageFilter.mutateAndAddToFilters(reward, isExcluded);

		const eleLi = document.createElement("li");
		eleLi.className = `row ${isExcluded ? "row--blacklisted" : ""}`;

		const source = Parser.sourceJsonToAbv(reward.source);
		const hash = UrlUtil.autoEncodeHash(reward);

		eleLi.innerHTML = `<a href="#${hash}" class="lst--border">
			<span class="col-2 text-center pl-0">${reward.type}</span>
			<span class="bold col-8">${reward.name}</span>
			<span class="col-2 text-center ${Parser.sourceJsonToColor(reward.source)} pr-0" title="${Parser.sourceJsonToFull(reward.source)}" ${BrewUtil.sourceJsonToStyle(reward.source)}>${source}</span>
		</a>`;

		const listItem = new ListItem(
			rwI,
			eleLi,
			reward.name,
			{
				hash,
				source,
				type: reward.type
			},
			{
				uniqueId: reward.uniqueId ? reward.uniqueId : rwI,
				isExcluded
			}
		);

		eleLi.addEventListener("click", (evt) => this._list.doSelect(listItem, evt));
		eleLi.addEventListener("contextmenu", (evt) => ListUtil.openContextMenu(evt, this._list, listItem));

		return listItem;
	}

	handleFilterChange () {
		const f = this._filterBox.getValues();
		this._list.filter(item => this._pageFilter.toDisplay(f, this._dataList[item.ix]));
		FilterBox.selectFirstVisible(this._dataList);
	}

	getSublistItem (reward, pinId) {
		const hash = UrlUtil.autoEncodeHash(reward);

		const $ele = $(`<li class="row">
			<a href="#${hash}" class="lst--border">
				<span class="name col-2 pl-0 text-center">${reward.type}</span>
				<span class="name col-10 pr-0">${reward.name}</span>
			</a>
		</li>`)
			.contextmenu(evt => ListUtil.openSubContextMenu(evt, listItem));

		const listItem = new ListItem(
			pinId,
			$ele,
			reward.name,
			{
				hash,
				type: reward.type
			}
		);
		return listItem;
	}

	doLoadHash (id) {
		Renderer.get().setFirstSection(true);
		const reward = this._dataList[id];

		$("#pagecontent").empty().append(RenderRewards.$getRenderedReward(reward));

		ListUtil.updateSelected();
	}

	async pDoLoadSubHash (sub) {
		sub = this._filterBox.setFromSubHashes(sub);
		await ListUtil.pSetFromSubHashes(sub);
	}
}

const rewardsPage = new RewardsPage();
window.addEventListener("load", () => rewardsPage.pOnLoad());
