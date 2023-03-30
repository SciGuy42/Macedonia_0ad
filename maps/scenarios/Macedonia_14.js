warn("loading the triggers file");

// /////////////////////
// Trigger listeners //
// /////////////////////

var triggerPointsMace = "A";
var triggerPointsPers = "B";
var unitTargetClass = "Unit+!Ship";
var siegeTargetClass = "Structure";

var unitFormations = [
	"special/formations/box",
	"special/formations/battle_line",
	"special/formations/line_closed",
	"special/formations/column_closed"
];

var disabledTemplates = (civ) => [
	// Economic structures
	"structures/" + civ + "/corral",
	"structures/" + civ + "/farmstead",
	"structures/" + civ + "/field",
	"structures/" + civ + "/storehouse",
	"structures/" + civ + "/rotarymill",
	"structures/" + civ + "/market",

	// Expansions
	"structures/" + civ + "/civil_centre",
	"structures/" + civ + "/military_colony",

	// Walls
	"structures/" + civ + "/wallset_stone",
	"structures/rome/wallset_siege",
	"structures/wallset_palisade",

	// Shoreline
	"structures/" + civ + "/dock",
	"structures/brit/crannog",
	"structures/cart/super_dock",
	"structures/ptol/lighthouse",

	// villagers
	"units/" + civ + "/support_female_citizen"
];



Trigger.prototype.WalkAndFightClosestTarget = function(attacker, target_player, target_class)
{
	const target = this.FindClosestTarget(attacker, target_player, target_class);

	if (target)
	{
		// get target position
		var cmpTargetPosition = Engine.QueryInterface(target, IID_Position).GetPosition2D();


		const cmpUnitAI = Engine.QueryInterface(attacker, IID_UnitAI);
		cmpUnitAI.SwitchToStance("violent");
		cmpUnitAI.WalkAndFight(cmpTargetPosition.x, cmpTargetPosition.y, null);
	}
	else
	{
		warn("[ERROR] Could not find closest target to fight: " + attacker + " and " + target_player + " and " + target_class);
	}

};

Trigger.prototype.FindClosestTarget = function(attacker, target_player, target_class)
{

	// let targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(target_player), unitTargetClass);

	const targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(target_player), target_class).filter(TriggerHelper.IsInWorld);

	let closestTarget;
	let minDistance = Infinity;

	for (const target of targets)
	{
		if (!TriggerHelper.IsInWorld(target))
			continue;

		const targetDistance = PositionHelper.DistanceBetweenEntities(attacker, target);
		if (targetDistance < minDistance)
		{
			closestTarget = target;
			minDistance = targetDistance;
		}
	}

	return closestTarget;
};

// every function just logs when it gets fired, and shows the data
Trigger.prototype.StructureBuiltAction = function(data)
{
	// warn("The OnStructureBuilt event happened with the following data:");
	// warn(uneval(data));
};

Trigger.prototype.ConstructionStartedAction = function(data)
{
	// warn("The OnConstructionStarted event happened with the following data:");
	// warn(uneval(data));
};

Trigger.prototype.TrainingFinishedAction = function(data)
{
	// warn("The OnTrainingFinished event happened with the following data:");
	// warn(uneval(data));
};

Trigger.prototype.TrainingQueuedAction = function(data)
{
	// warn("The OnTrainingQueued event happened with the following data:");
	// warn(uneval(data));
};

Trigger.prototype.ResearchFinishedAction = function(data)
{
	// warn("The OnResearchFinished event happened with the following data:");
	// warn(uneval(data));
};

Trigger.prototype.ResearchQueuedAction = function(data)
{
	// warn("The OnResearchQueued event happened with the following data:");
	// warn(uneval(data));
};

Trigger.prototype.OwnershipChangedAction = function(data)
{
	// warn("The OnOwnershipChanged event happened with the following data:");
	// warn(uneval(data));

	const id = Engine.QueryInterface(data.entity, IID_Identity);
	// warn(uneval(id));

	/* if (data.from == 0 && data.to == 1)
	{
		if (id.classesList.indexOf("Dock") >= 0)
		{
			this.num_docks_captured += 1;
			warn("dock captured");

			TriggerHelper.SpawnUnits(data.entity,"units/mace/ship_merchant",2,1);
		}
		else if (id.classesList.indexOf("Forge") >= 0)
		{
			warn("smith captured");
			this.num_smith_captured += 1;
			if (this.num_smith_captured == 1)
				this.ForgeShipAttackRepeats();
		}
		else if (id.classesList.indexOf("Arsenal") >= 0)
		{
			warn("shop captured");
			this.DoAfterDelay(240 * 1000,"WorkshopShipAttack",null);
		}
	}
	else if (data.from == 2 && id.classesList.indexOf("Gates") >= 0)
	{
		warn("gate destroyed");
		this.GateDestroyedAttack();
	}
	else if (data.from == 2 && id.classesList.indexOf("CivilCentre") >= 0)
	{
		warn("cc destroyed");
		// TO DO: win
	}
	else if (data.from == 3 && id.classesList.indexOf("GarrisonTower") >= 0)
	{
		warn("tower destroyed");
		this.TowerDestroyedAttack();
	}*/

};

Trigger.prototype.PlayerCommandAction = function(data)
{
	// warn("The OnPlayerCommand event happened with the following data:");
	// warn(uneval(data));
};



Trigger.prototype.IntervalActionPlayerFour = function(data)
{

	const units_pl4 = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(4), "Human").filter(TriggerHelper.IsInWorld);

	for (const u of units_pl4)
	{
		const target_u = this.FindClosestTarget(u, 2, unitTargetClass);

		ProcessCommand(4, {
			"type": "attack",
			"entities": [u],
			"target": target_u,
			"queued": false,
			"allowCapture": false
		});
	}
};



// garison AI entities with archers
Trigger.prototype.GarrisonEntities = function(data)
{

	for (const p of [1, 2, 3])
	{
		const towers_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "GarrisonTower").filter(TriggerHelper.IsInWorld);


		for (const e of towers_p)
		{
			// spawn the garrison inside the tower
			const archers_e = TriggerHelper.SpawnUnits(e, "units/athen/champion_ranged", 5, p);

			for (const a of archers_e)
			{
				const cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(e, true);
			}
		}

		// temples
		const forts_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Temple").filter(TriggerHelper.IsInWorld);
		const fort_size = 10;
		// if (p == 0)
		//	fort_size = 20;

		for (const e of forts_p)
		{
			// spawn the garrison inside the tower

			const archers_e = TriggerHelper.SpawnUnits(e, "units/athen/champion_ranged", fort_size, p);

			for (const a of archers_e)
			{
				const cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(e, true);
			}
		}
	}
};


Trigger.prototype.IntervalUnitCheck = function(data)
{
	for (const p of [2])
	{
		let target_p = 2;
		if (p == 2)
			target_p = 1;

		// find any idle soldiers
		const units_inf = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Infantry").filter(TriggerHelper.IsInWorld);
		const units_cav = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Cavalry").filter(TriggerHelper.IsInWorld);
		const units_siege = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Siege").filter(TriggerHelper.IsInWorld);
		const units_ele = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Elephant").filter(TriggerHelper.IsInWorld);

		const units_all = units_inf.concat(units_cav, units_siege, units_ele);

		for (const u of units_all)
		{
			const cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI)
			{
				if (cmpUnitAI.IsIdle())
				{
					// warn("Found idle soldier");
					this.WalkAndFightClosestTarget(u, target_p, unitTargetClass);
				}
			}
		}
	}
};


Trigger.prototype.RandomTemplatePers = function(data)
{
	const r = Math.random();

	if (r < 0.75)
		return pickRandom(this.pers_inf_templates);
	else if (r < 0.975)
		return pickRandom(this.pers_cav_templates);
	return pickRandom(this.pers_ele_templates);
};


Trigger.prototype.RandomTemplateMace = function(data)
{
	const r = Math.random();

	if (r < 0.7)
		return pickRandom(this.mace_inf_templates);
	else if (r < 0.975)
		return pickRandom(this.mace_cav_templates);
	return pickRandom(this.mace_siege_templates);
};


Trigger.prototype.EliteWaveUnitSpawn = function(data)
{
	// PERSIA
	const num_spawn = 3 * this.pers_spawn_size;
	const attackers_per = [];

	for (let i = 0; i < num_spawn; i++)
	{
		// pick spawn point
		const pers_site = pickRandom(this.GetTriggerPoints(triggerPointsPers));

		// pick soldier type
		const class_type = pickRandom(this.pers_elite_templates);

		const unit_i = TriggerHelper.SpawnUnits(pers_site, class_type, 1, 2);
		attackers_per.push(unit_i[0]);
	}

	// set formation
	TriggerHelper.SetUnitFormation(2, attackers_per, pickRandom(unitFormations));


	const target = this.FindClosestTarget(attackers_per[0], 1, unitTargetClass);
	warn(target);
	const target_pos_pers = TriggerHelper.GetEntityPosition2D(target);

	ProcessCommand(2, {
		"type": "attack",
		"entities": attackers_per,
		"target": target,
		"queued": false,
		"allowCapture": false
	});

	// pick target
	for (const u of attackers_per)
	{
		/* let target = this.FindClosestTarget(u,1,unitTargetClass);
		let target_pos_pers = TriggerHelper.GetEntityPosition2D(target);

		ProcessCommand(2, {
			"type": "attack",
			"entities": [u],
			"target": target,
			"queued": false,
			"allowCapture": false
		});*/

		/* ProcessCommand(2, {
			"type": "attack-walk",
			"entities": [u],
			"x": target_pos_pers.x,
			"z": target_pos_pers.y,
			"queued": true,
			"targetClasses": {
				"attack": unitTargetClass
			},
			"allowCapture": false
		});*/
	}
};

Trigger.prototype.ElephantWaveUnitSpawn = function(data)
{
	// PERSIA
	const num_spawn = this.pers_spawn_size;
	const attackers_per = [];

	for (let i = 0; i < num_spawn; i++)
	{
		// pick spawn point
		const pers_site = pickRandom(this.GetTriggerPoints(triggerPointsPers));

		// pick soldier type
		const class_type = pickRandom(this.pers_ele_templates);

		const unit_i = TriggerHelper.SpawnUnits(pers_site, class_type, 1, 2);
		attackers_per.push(unit_i[0]);
	}

	// pick target
	const target = this.FindClosestTarget(attackers_per[0], 1, unitTargetClass);
	const target_pos_pers = TriggerHelper.GetEntityPosition2D(target);

	ProcessCommand(2, {
		"type": "attack-walk",
		"entities": attackers_per,
		"x": target_pos_pers.x,
		"z": target_pos_pers.y,
		"queued": true,
		"targetClasses": {
			"attack": unitTargetClass
		},
		"allowCapture": false
	});
};

Trigger.prototype.CavalryWaveUnitSpawn = function(data)
{
	// PERSIA
	const num_spawn = 3 * this.pers_spawn_size;
	const attackers_per = [];


	for (let i = 0; i < num_spawn; i++)
	{
		// pick spawn point
		const pers_site = pickRandom(this.GetTriggerPoints(triggerPointsPers));

		// pick soldier type
		const class_type = pickRandom(this.pers_cav_templates);

		const unit_i = TriggerHelper.SpawnUnits(pers_site, class_type, 1, 2);
		attackers_per.push(unit_i[0]);
	}

	// pick target
	const target = this.FindClosestTarget(attackers_per[0], 1, unitTargetClass);
	const target_pos_pers = TriggerHelper.GetEntityPosition2D(target);

	ProcessCommand(2, {
		"type": "attack-walk",
		"entities": attackers_per,
		"x": target_pos_pers.x,
		"z": target_pos_pers.y,
		"queued": true,
		"targetClasses": {
			"attack": unitTargetClass
		},
		"allowCapture": false
	});
};

Trigger.prototype.WaveUnitSpawn = function(data)
{
	// pick spawn point
	const pers_site = pickRandom(this.GetTriggerPoints(triggerPointsPers));

	// pick target point
	const mace_site = pickRandom(this.GetTriggerPoints(triggerPointsMace));
	const target_pos_pers = TriggerHelper.GetEntityPosition2D(mace_site);

	// PERSIA
	const num_spawn = this.pers_spawn_size;
	const attackers_per = [];


	for (let i = 0; i < num_spawn; i++)
	{

		// pick soldier type
		const class_type = this.RandomTemplatePers();

		const unit_i = TriggerHelper.SpawnUnits(pers_site, class_type, 1, 2);
		attackers_per.push(unit_i[0]);
	}

	// set formation
	TriggerHelper.SetUnitFormation(2, attackers_per, pickRandom(unitFormations));

	ProcessCommand(2, {
		"type": "attack-walk",
		"entities": attackers_per,
		"x": target_pos_pers.x,
		"z": target_pos_pers.y,
		"queued": true,
		"targetClasses": {
			"attack": unitTargetClass
		},
		"allowCapture": false
	});
};

Trigger.prototype.IntervalUnitSpawn = function(data)
{
	// pick spawn point
	const pers_site = pickRandom(this.GetTriggerPoints(triggerPointsPers));
	const mace_site = pickRandom(this.GetTriggerPoints(triggerPointsMace));

	// pick target point
	const target_pos_pers = TriggerHelper.GetEntityPosition2D(mace_site);
	const target_pos_mace = TriggerHelper.GetEntityPosition2D(pers_site);




	// PERSIA
	let num_spawn = this.pers_spawn_size;
	const attackers_per = [];


	for (let i = 0; i < num_spawn; i++)
	{

		// pick soldier type
		const class_type = this.RandomTemplatePers();

		const unit_i = TriggerHelper.SpawnUnits(pers_site, class_type, 1, 2);
		attackers_per.push(unit_i[0]);
		// let cmpUnitAI = Engine.QueryInterface(unit_i, IID_UnitAI);
		// cmpUnitAI.SwitchToStance("violent");
		// cmpUnitAI.WalkAndFight(cmpTargetPosition.x,cmpTargetPosition.y,null);

		/* ProcessCommand(2, {
			"type": "attack-walk",
			"entities": unit_i,
			"x": target_pos.x,
			"z": target_pos.y,
			"queued": true,
			"targetClasses": {
				"attack": unitTargetClass
			},
			"allowCapture": false
		});*/
	}

	// set formation
	warn(uneval(attackers_per));
	TriggerHelper.SetUnitFormation(2, attackers_per, pickRandom(unitFormations));

	ProcessCommand(2, {
		"type": "attack-walk",
		"entities": attackers_per,
		"x": target_pos_pers.x,
		"z": target_pos_pers.y,
		"queued": true,
		"targetClasses": {
			"attack": unitTargetClass
		},
		"allowCapture": false
	});


	// MACEDONIA
	const currentPop = QueryPlayerIDInterface(1).GetPopulationCount();

	if (currentPop < 300)
	{
		num_spawn = this.mace_spawn_size;
		const attackers_mace = [];
		for (let i = 0; i < num_spawn; i++)
		{
			// pick soldier type
			const class_type = this.RandomTemplateMace();

			const unit_i = TriggerHelper.SpawnUnits(mace_site, class_type, 1, 1);
			attackers_mace.push(unit_i[0]);
			/* ProcessCommand(1, {
				"type": "attack-walk",
				"entities": unit_i,
				"x": target_pos.x,
				"z": target_pos.y,
				"targetClasses": {
					"attack": unitTargetClass
				},
				"queued": true,
				"allowCapture": false
			});*/
		}

		// set formation
		warn(uneval(attackers_mace));
		TriggerHelper.SetUnitFormation(1, attackers_mace, pickRandom(unitFormations));

		ProcessCommand(1, {
			"type": "attack-walk",
			"entities": attackers_mace,
			"x": target_pos_mace.x,
			"z": target_pos_mace.y,
			"queued": true,
			"targetClasses": {
				"attack": unitTargetClass
			},
			"allowCapture": false
		});
	}
};

Trigger.prototype.RangeActionWaveC = function(data)
{
	if (this.wave_C == false)
	{
		warn("Wave C");

		this.DoAfterDelay(5 * 1000, "EliteWaveUnitSpawn", null);
		this.DoAfterDelay(15 * 1000, "CavalryWaveUnitSpawn", null);
		this.DoAfterDelay(30 * 1000, "WaveUnitSpawn", null);

		this.wave_C = true;
		this.pers_spawn_size += 2;
	}

};

Trigger.prototype.RangeActionWaveD = function(data)
{
	if (this.wave_D == false)
	{
		warn("Wave D");

		this.DoAfterDelay(5 * 1000, "ElephantWaveUnitSpawn", null);
		this.DoAfterDelay(15 * 1000, "CavalryWaveUnitSpawn", null);
		this.DoAfterDelay(25 * 1000, "EliteWaveUnitSpawn", null);
		this.DoAfterDelay(30 * 1000, "WaveUnitSpawn", null);
		this.DoAfterDelay(40 * 1000, "EliteWaveUnitSpawn", null);
		this.DoAfterDelay(50 * 1000, "WaveUnitSpawn", null);

		this.wave_D = true;
		this.pers_spawn_size += 2;
	}

};

Trigger.prototype.RangeActionWaveE = function(data)
{
	if (this.wave_E == false)
	{
		warn("Wave E");

		this.DoAfterDelay(5 * 1000, "ElephantWaveUnitSpawn", null);
		this.DoAfterDelay(10 * 1000, "WaveUnitSpawn", null);
		this.DoAfterDelay(15 * 1000, "EliteWaveUnitSpawn", null);
		this.DoAfterDelay(20 * 1000, "WaveUnitSpawn", null);
		this.DoAfterDelay(25 * 1000, "ElephantWaveUnitSpawn", null);
		this.DoAfterDelay(30 * 1000, "EliteWaveUnitSpawn", null);
		this.DoAfterDelay(35 * 1000, "WaveUnitSpawn", null);
		this.DoAfterDelay(40 * 1000, "WaveUnitSpawn", null);

		this.wave_E = true;
		this.pers_spawn_size += 3;
	}

};

Trigger.prototype.SetDifficultyLevel = function(data)
{
	// Very Hard: 1.56; Hard: 1.25; Medium 1

	for (const player of [2])
	{
		const cmpPlayer = QueryPlayerIDInterface(player);
		const ai_mult = cmpPlayer.GetGatherRateMultiplier();
		const cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);

		// process difficulty levels
		if (ai_mult == 1.25)
		{
			// add some tech
			cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_01");
			cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_01");
		}
		else if (ai_mult >= 1.5)
		{
			// add some tech
			cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_01");
			cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_02");
			cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_01");
			cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_02");
		}
	}
};

{
	const cmpTrigger = Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger);

	// Activate all possible triggers
	const data = { "enabled": true };
	cmpTrigger.RegisterTrigger("OnStructureBuilt", "StructureBuiltAction", data);
	cmpTrigger.RegisterTrigger("OnConstructionStarted", "ConstructionStartedAction", data);
	cmpTrigger.RegisterTrigger("OnTrainingFinished", "TrainingFinishedAction", data);
	cmpTrigger.RegisterTrigger("OnTrainingQueued", "TrainingQueuedAction", data);
	cmpTrigger.RegisterTrigger("OnResearchFinished", "ResearchFinishedAction", data);
	cmpTrigger.RegisterTrigger("OnResearchQueued", "ResearchQueuedAction", data);
	cmpTrigger.RegisterTrigger("OnOwnershipChanged", "OwnershipChangedAction", data);
	cmpTrigger.RegisterTrigger("OnPlayerCommand", "PlayerCommandAction", data);


	cmpTrigger.enemies = [2];

	cmpTrigger.mace_spawn_size = 9;
	cmpTrigger.pers_spawn_size = 13;
	cmpTrigger.wave_C = false;
	cmpTrigger.wave_D = false;
	cmpTrigger.wave_E = false;


	// persian soldier types
	cmpTrigger.pers_inf_templates = ["units/pers/arstibara", "units/pers/champion_infantry", "units/pers/infantry_archer_a", "units/pers/infantry_javelineer_a", "units/pers/infantry_spearman_b", "units/pers/infantry_spearman_a", "units/pers/infantry_spearman_e", "units/pers/kardakes_hoplite", "units/pers/kardakes_skirmisher"];
	cmpTrigger.pers_cav_templates = ["units/pers/cavalry_archer_a", "units/pers/cavalry_archer_b", "units/pers/cavalry_javelineer_a", "units/pers/cavalry_spearman_a", "units/pers/cavalry_axeman_a", "units/pers/champion_cavalry", "units/pers/champion_cavalry_archer"];
	cmpTrigger.pers_ele_templates = TriggerHelper.GetTemplateNamesByClasses("Champion+Elephant+!Hero", "pers", undefined, undefined, true);
	cmpTrigger.pers_elite_templates = ["units/pers/arstibara", "units/pers/champion_infantry", "units/pers/kardakes_hoplite", "units/pers/kardakes_skirmisher", "units/pers/infantry_archer_e", "units/pers/cavalry_archer_e", "units/pers/champion_cavalry_archer", "units/pers/champion_cavalry", "units/pers/cavalry_axeman_e"];

	// macedonian
	cmpTrigger.mace_inf_templates = ["units/mace/champion_infantry_spearman", "units/mace/champion_infantry_crossbowman", "units/mace/champion_infantry_spearman_02", "units/mace/infantry_archer_b", "units/mace/infantry_javelineer_b", "units/mace/infantry_pikeman_a", "units/mace/infantry_pikeman_b", "units/mace/infantry_slinger_b", "units/merc_thorakites", "units/merc_thureophoros", "units/athen/champion_ranged", "units/athen/champion_marine", "units/athen/champion_infantry"];
	cmpTrigger.mace_cav_templates = ["units/mace/champion_cavalry", "units/mace/cavalry_spearman_a", "units/mace/cavalry_javelineer_a"];
	cmpTrigger.mace_siege_templates = ["units/mace/siege_oxybeles_packed"];


	/* warn(uneval(cmpTrigger.greek_inf_templates));
	warn(uneval(cmpTrigger.mace_inf_templates));
	warn(uneval(cmpTrigger.mace_cav_templates));
	warn(uneval(cmpTrigger.mace_siege_templates));	*/

	cmpTrigger.DoAfterDelay(2 * 1000, "GarrisonEntities", null);

	// cmpTrigger.DoAfterDelay(5 * 1000,"EliteWaveUnitSpawn",null);
	// cmpTrigger.DoAfterDelay(5 * 1000,"CavalryWaveUnitSpawn",null);
	// cmpTrigger.DoAfterDelay(5 * 1000,"ElephantWaveUnitSpawn",null);

	// tech for all
	for (const p of [1, 2, 3])
	{
		const cmpPlayer = QueryPlayerIDInterface(p);

		cmpPlayer.SetPopulationBonuses(300);
		cmpPlayer.SetDisabledTemplates(disabledTemplates(QueryPlayerIDInterface(p, IID_Identity).GetCiv()));

		const cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);


		cmpTechnologyManager.ResearchTechnology("phase_town_generic");
		cmpTechnologyManager.ResearchTechnology("phase_city_generic");

	}


	cmpTrigger.RegisterTrigger("OnInterval", "IntervalUnitSpawn", {
		"enabled": true,
		"delay": 15 * 1000,
		"interval": 15 * 1000,
	});

	cmpTrigger.RegisterTrigger("OnInterval", "IntervalUnitCheck", {
		"enabled": true,
		"delay": 5 * 1000,
		"interval": 15 * 1000,
	});

	// register wave triggers

	cmpTrigger.RegisterTrigger("OnRange", "RangeActionWaveC", {
		"entities": cmpTrigger.GetTriggerPoints("C"), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 25,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});

	cmpTrigger.RegisterTrigger("OnRange", "RangeActionWaveD", {
		"entities": cmpTrigger.GetTriggerPoints("D"), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 25,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});

	cmpTrigger.RegisterTrigger("OnRange", "RangeActionWaveE", {
		"entities": cmpTrigger.GetTriggerPoints("E"), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 25,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});
}
