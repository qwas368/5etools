"use strict";

const fs = require("fs");
const ut = require("./util");
require("../js/utils");


function replaceJson (object, replaceArray) {
	if (object != undefined || object != null)
	{
		Object.keys(object).forEach(k => {
			if (typeof object[k] === "string")
			{
				replaceArray
					.forEach(r => {
						object[k] = object[k].replace(new RegExp(r.search, "ig"), r.replacement);
					});
			}
			else
			{
				replaceJson (object[k], replaceArray)
			}
		});
	}
};

function replaceFolder (folder, replaceArray) {
	console.log(`Cleaning directory ${folder}...`);
	const files = ut.listFiles({dir: folder});
	files
		.filter(file => file.endsWith(".json"))
		.forEach(file => {
			console.log(`\tCleaning ${file}...`);
			var json = ut.readJson(file);
			replaceJson(json, replaceArray);
			fs.writeFileSync(file, CleanUtil.getCleanJson(json), "utf-8");
		})
}



// replace spell
console.log("Start replace.");
ut.listFiles({ dir: './data/spells' })
	.filter(file => file.replace(/^.*[\\\/]/, '').startsWith("spells-"))
	.forEach(file => {
		console.log(file)
		var spells = ut.readJson(file);
		var replaceArray = spells.spell.filter(s => s.ENG_name != undefined).map(s => ({search: `{@spell ${s.ENG_name}}`, replacement: `{@spell ${s.name}}`}));
		replaceFolder(`./data`, replaceArray);
	})

console.log("Replaceing complete.");
