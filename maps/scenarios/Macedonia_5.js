warn("loading the triggers file");

// /////////////////////
// Trigger listeners //
// /////////////////////

/**
 * Which entities units should focus when attacking and patrolling.
 */
var unitTargetClass = "Unit+!Ship";

var unitFormations = [
	"special/formations/box",
	"special/formations/battle_line",
	"special/formations/line_closed",
	"special/formations/column_closed"
];

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
};

Trigger.prototype.PlayerCommandAction = function(data)
{
	// warn("The OnPlayerCommand event happened with the following data:");
	// warn(uneval(data));
};

// garison AI entities with archers
Trigger.prototype.GarrisonEntities = function(data)
{
	// garrrison towers with miltia folks
	for (const p of [1])
	{
		const owner = 5;

		// big towers
		const towers = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "StoneTower").filter(TriggerHelper.IsInWorld);

		for (const c of towers)
		{
			// spawn the garrison inside the tower
			const archers_e = TriggerHelper.SpawnUnits(c, "units/athen/infantry_slinger_e", 5, owner);

			for (const a of archers_e)
			{
				const cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(c, true);
			}
		}

		// wall towers
		const wall_towers = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "WallTower").filter(TriggerHelper.IsInWorld);
		// warn("found "+wall_towers.length+" wall towers.");
		for (const c of wall_towers)
		{
			// spawn the garrison inside the tower
			const archers_e = TriggerHelper.SpawnUnits(c, "units/athen/infantry_slinger_e", 4, owner);

			for (const a of archers_e)
			{
				const cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(c, true);
			}
		}
	}
};

Trigger.prototype.PersianAttackCav = function(data)
{
	// warn("The PersianAttackCav event happened");

	// we must have too much pop, delay
	if (this.temp_site == -1)
	{
		this.DoAfterDelay(this.persAttackInterval, "PersianAttackCav", null);
		return;
	}

	let temp_name = "";

	const num_attackers = Math.floor(this.cavRatio * this.prog_seq[this.numberOfTimerTriggerCav]) + 1;

	// spawn cavalry -- done later so cavalry catches up with infantry
	if (this.numberOfTimerTriggerCav == 3)
	{
		this.persianCavTypes.push("units/pers/cavalry_archer_b");
	}
	else if (this.numberOfTimerTriggerCav == 5)
	{
		this.persianCavTypes.push("units/pers/cavalry_archer_e");
	}
	else if (this.numberOfTimerTriggerCav == 7)
	{
		this.persianCavTypes.push("units/pers/champion_cavalry_archer");
	}

	const attackers = [];
	const spawn_site = pickRandom(this.persianSpawnSites);

	for (let i = 0; i < num_attackers; ++i)
	{
		temp_name = this.persianCavTypes[Math.floor(Math.random() * Math.floor(this.persianCavTypes.length))];

		// warn(uneval(spawn_site));
		// warn(uneval(temp_name));

		const units_i = TriggerHelper.SpawnUnits(spawn_site, temp_name, 1, 3);
		attackers.push(units_i[0]);
	}

	// spawn a few infantry to catch up with siege -- 1 per siege unit
	const num_siege_guard = Math.floor(this.prog_seq[this.numberOfTimerTriggerCav] * this.siegeRatio) + 1;
	for (let i = 0; i < num_attackers; ++i)
	{
		temp_name = this.persianInfTypes[Math.floor(Math.random() * Math.floor(this.persianInfTypes.length))];
		const units_i = TriggerHelper.SpawnUnits(spawn_site, temp_name, 1, 3);

		attackers.push(units_i[0]);
	}

	// set formation
	TriggerHelper.SetUnitFormation(3, attackers, pickRandom(unitFormations));

	const targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), unitTargetClass);
	let closestTarget;
	let minDistance = Infinity;

	for (const target of targets)
	{
		if (!TriggerHelper.IsInWorld(target))
			continue;

		const targetDistance = PositionHelper.DistanceBetweenEntities(attackers[0], target);
		if (targetDistance < minDistance)
		{
			closestTarget = target;
			minDistance = targetDistance;
		}
	}

	ProcessCommand(3, {
		"type": "attack",
		"entities": attackers,
		"target": closestTarget,
		"queued": true,
		"allowCapture": false
	});

	this.numberOfTimerTriggerCav++;
	this.DoAfterDelay(this.persAttackInterval, "PersianAttackCav", null);

};

Trigger.prototype.PersianAttack = function(data)
{
	// warn("Persian attack:");
	// warn(uneval(this.numberOfTimerTrigger));

	var all_units = TriggerHelper.GetEntitiesByPlayer(2).filter(TriggerHelper.IsInWorld);
	// warn("found "+all_units.length+" entities");
	var pop_limit = 200;// 30+10*this.numberOfTimerTrigger;

	const cmpPlayer = QueryPlayerIDInterface(2);
	const popUsed = cmpPlayer.GetPopulationCount();
	// warn("found "+popUsed+" pop");

	if (popUsed > pop_limit)
	{
		this.temp_site = -1;
		this.DoAfterDelay(this.persAttackInterval, "PersianAttack", null);
		return;
	}

	// pick spawn site
	const site = Math.floor(Math.random() * Math.floor(this.persianSpawnSites.length));
	// site = 2;
	this.temp_site = site;

	let temp_name = "";

	// spawn infantry
	const attackers = [];
	for (let i = 0; i < this.prog_seq[this.numberOfTimerTrigger]; ++i)
	{
		temp_name = this.persianInfTypes[Math.floor(Math.random() * Math.floor(this.persianInfTypes.length))];
		const units_i = TriggerHelper.SpawnUnits(this.persianSpawnSites[site], temp_name, 1, 2);
		attackers.push(units_i[0]);
	}

	// TriggerHelper.SetUnitFormation(2, infantry, "special/formations/box");

	// spawn siege
	if (this.numberOfTimerTrigger == 4)
	{
		// add elephant
		this.persianSiegeTypes.push("units/pers/champion_elephant");
	}
	else if (this.numberOfTimerTrigger == 7)
	{
		// add ram
		this.persianSiegeTypes.push("units/pers/siege_ram");
	}

	const num_siege = Math.floor(this.siegeRatio * this.prog_seq[this.numberOfTimerTrigger]);
	for (let i = 0; i < num_siege; ++i)
	{
		temp_name = this.persianSiegeTypes[Math.floor(Math.random() * Math.floor(this.persianSiegeTypes.length))];
		const units_i = TriggerHelper.SpawnUnits(this.persianSpawnSites[site], temp_name, 1, 2);
		attackers.push(units_i[0]);
	}

	// set formation
	TriggerHelper.SetUnitFormation(2, attackers, pickRandom(unitFormations));

	let targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), unitTargetClass);
	let closestTarget;
	let minDistance = Infinity;

	for (const target of targets)
	{
		if (!TriggerHelper.IsInWorld(target))
			continue;

		const targetDistance = PositionHelper.DistanceBetweenEntities(attackers[0], target);
		if (targetDistance < minDistance)
		{
			closestTarget = target;
			minDistance = targetDistance;
		}
	}

	ProcessCommand(2, {
		"type": "attack",
		"entities": attackers,
		"target": closestTarget,
		"queued": true,
		"allowCapture": false
	});

	// spawn some distractors
	const num_distractors = Math.floor(this.prog_seq[this.numberOfTimerTrigger] / 3);
	for (let i = 0; i < this.persianSpawnSites.length; i++)
	{
		if (site != this.persianSpawnSites[i])
		{
			temp_name = this.persianInfTypes[Math.floor(Math.random() * Math.floor(this.persianInfTypes.length))];
			TriggerHelper.SpawnUnits(this.persianSpawnSites[i], temp_name, num_distractors, 2);
		}
	}

	// after a certain level, spawn a secondary attack
	if (this.numberOfTimerTrigger > 7)
	{
		// warn("spawning secondary attack");

		let second_site = site + 1;
		if (second_site >= this.persianSpawnSites.length)
		{
			second_site = 0;
		}

		// spawn infantry
		const sec_attackers = [];

		for (let i = 0; i < this.prog_seq[this.numberOfTimerTrigger - 7]; ++i)
		{
			temp_name = this.persianInfTypes[Math.floor(Math.random() * Math.floor(this.persianInfTypes.length))];
			const units_i = TriggerHelper.SpawnUnits(this.persianSpawnSites[second_site], temp_name, 1, 2);

			sec_attackers.push(units_i[0]);
		}

		for (let i = 0; i < num_siege; ++i)
		{
			temp_name = this.persianSiegeTypes[Math.floor(Math.random() * Math.floor(this.persianSiegeTypes.length))];
			const units_i = TriggerHelper.SpawnUnits(this.persianSpawnSites[second_site], temp_name, 1, 2);

			sec_attackers.push(units_i[0]);
		}

		// set formation
		TriggerHelper.SetUnitFormation(2, sec_attackers, pickRandom(unitFormations));

		targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), unitTargetClass);
		closestTarget = undefined;
		minDistance = Infinity;

		for (const target of targets)
		{
			if (!TriggerHelper.IsInWorld(target))
				continue;

			const targetDistance = PositionHelper.DistanceBetweenEntities(sec_attackers[0], target);
			if (targetDistance < minDistance)
			{
				closestTarget = target;
				minDistance = targetDistance;
			}
		}

		ProcessCommand(2, {
			"type": "attack",
			"entities": sec_attackers,
			"target": closestTarget,
			"queued": true,
			"allowCapture": false
		});
	}

	this.numberOfTimerTrigger++;

	this.persAttackInterval *= this.persGamma;
	// warn(uneval(this.persAttackInterval));
	this.DoAfterDelay(this.persAttackInterval, "PersianAttack", null);

};

Trigger.prototype.GreekAttack = function(data)
{
	// warn("Greek attack:");
	// warn(uneval(this.greekAttackCounter));

	var all_units = TriggerHelper.GetEntitiesByPlayer(4);
	var pop_limit = 30 + 8 * this.greekAttackCounter;
	if (all_units.length > pop_limit)
	{
		// warn("greeks have too much pop, no spawn");
		return;
	}

	let temp_name = "";

	// spawn infantry
	for (let i = 0; i < Math.floor(this.greekRatio * this.prog_seq[this.greekAttackCounter]); ++i)
	{
		// pick spawn site
		const site = Math.floor(Math.random() * Math.floor(this.greekSpawnSites.length));

		temp_name = this.greekInfTypes[Math.floor(Math.random() * Math.floor(this.greekInfTypes.length))];
		TriggerHelper.SpawnUnits(this.greekSpawnSites[site], temp_name, 1, 4);
	}

	// spawn siege
	const num_siege = Math.floor(this.greekRatio * this.siegeRatio * this.prog_seq[this.greekAttackCounter]);
	for (let i = 0; i < num_siege; ++i)
	{
		// pick spawn site
		const site = Math.floor(Math.random() * Math.floor(this.greekSpawnSites.length));

		temp_name = this.greekSiegeTypes[Math.floor(Math.random() * Math.floor(this.greekSiegeTypes.length))];
		TriggerHelper.SpawnUnits(this.greekSpawnSites[site], temp_name, 1, 4);
	}

	this.greekAttackCounter++;
	/* if (this.greekAttackCounter >= this.maxNumberOfTimerTrigger)
		this.DisableTrigger("OnInterval", "GreekAttack");*/

	this.greekAttackInterval *= this.greekGamma;
	// warn("greek interval = ");
	// warn(uneval(this.greekAttackInterval));

	// schedule the next attack
	this.DoAfterDelay(this.greekAttackInterval, "GreekAttack", null);

};

Trigger.prototype.IntervalAction = function(data)
{

	// warn("The OnInterval event happened:");
	// warn(uneval(data));
	/* this.numberOfTimerTrigger++;
	if (this.numberOfTimerTrigger >= this.maxNumberOfTimerTrigger)
		this.DisableTrigger("OnInterval", "IntervalAction");*/

	var enemy_players = [2, 4];

	/* for (let p = 0; p < enemy_players.length; ++p)
	{

		var enemy_units = TriggerHelper.GetEntitiesByPlayer(enemy_players[p]);
		var human_units = TriggerHelper.GetEntitiesByPlayer(1);

		if (human_units.length > 0){
			var d = 0
			var best_distance = 100000
			var best_index = -1

			for (let i = 0; i < enemy_units.length; ++i)
			{
				let cmpUnitAI = Engine.QueryInterface(enemy_units[i], IID_UnitAI);

				//check if the unit is idle and if it can attack
				if (cmpUnitAI){
					let cmpPosAI = Engine.QueryInterface(enemy_units[i], IID_Position);
					let pos_i = 0;
					if (cmpPosAI.IsInWorld())
					{
						//warn("calling get pos");
						pos_i = cmpPosAI.GetPosition2D();
					}

					if (cmpUnitAI.IsIdle() && Engine.QueryInterface(enemy_units[i], IID_Attack))
					{

						for (let j = 0; j < human_units.length; j++)
						{
							let cmpPosHuman = Engine.QueryInterface(human_units[j], IID_Position);
							let pos_j = 0;
							if (cmpPosHuman.IsInWorld())
							{
								//warn("calling get pos");
								pos_j = cmpPosHuman.GetPosition2D();

								d =  Math.sqrt( (pos_i.x-pos_j.x)*(pos_i.x-pos_j.x) + (pos_i.y-pos_j.y)*(pos_i.y-pos_j.y) );

								if (d < best_distance)
								{
									best_distance = d
									best_index = j
								}
							}

						}

						cmpUnitAI.SwitchToStance("violent");

						//option 1: attack the entity
						//cmpUnitAI.Attack(human_units[best_index])

						//option 2: walk and fight to the location
						let cmpPosition = Engine.QueryInterface(human_units[best_index], IID_Position);
						if (cmpPosition)
						{
							let pos_target = cmpPosition.GetPosition2D();
							cmpUnitAI.WalkAndFight(pos_target.x,pos_target.y,null);
						}
					}
				}

				best_distance = 100000
				best_index = -1
			}
		}
	}*/
};

Trigger.prototype.TestAction = function(data)
{
	// warn("test action")
};

Trigger.prototype.SetDifficultyLevel = function(data)
{
	// Very Hard: 1.56; Hard: 1.25; Medium 1
	const difficulty = "easy";

	for (const player of [2, 4])
	{
		const cmpPlayer = QueryPlayerIDInterface(player);
		const cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);

		// process difficulty levels
		if (difficulty == "medium")
		{
			// add some tech
			cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_01");
			cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_01");
			cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_01");

			for (let k = 0; k < this.prog_seq.length; ++k)
			{
				this.prog_seq[k] += 2;
			}
		}
		else if (difficulty == "hard")
		{
			// add some tech
			cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_01");
			cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_02");
			cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_01");
			cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_02");
			cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_01");
			cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_02");

			cmpTechnologyManager.ResearchTechnology("soldier_resistance_pierce_01");
			cmpTechnologyManager.ResearchTechnology("soldier_resistance_pierce_02");

			for (let k = 0; k < this.prog_seq.length; ++k)
			{
				this.prog_seq[k] += 4;
			}
		}
	}
};

Trigger.prototype.StructureDecayCheck = function(data)
{
	for (const p of [2, 3, 4, 5])
	{
		const structs = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Structure").filter(TriggerHelper.IsInWorld);

		for (const s of structs)
		{
			var cmpCapt = Engine.QueryInterface(s, IID_Capturable);
			if (cmpCapt)
			{
				const c_points = cmpCapt.GetCapturePoints();

				if (c_points[0] > 0)
				{
					c_points[p] += c_points[0];
					c_points[0] = 0;
					cmpCapt.SetCapturePoints(c_points);
				}
			}
		}
	}
};

Trigger.prototype.FindClosestTarget = function(attacker, target_player, target_class)
{

	// let targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(target_player), unitTargetClass);

	let targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(target_player), target_class).filter(TriggerHelper.IsInWorld);

	if (targets.length < 1)
	{
		// no targets, check if any unit is there
		targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(target_player), "Unit").filter(TriggerHelper.IsInWorld);

	}

	// if still no targets return null
	if (targets.length < 1)
	{
		warn("[ERROR] Could not find target!");
		return null;
	}

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

Trigger.prototype.WalkAndFightClosestTarget = function(attacker, target_player, target_class)
{
	let target = this.FindClosestTarget(attacker, target_player, target_class);
	if (!target)
	{
		target = this.FindClosestTarget(attacker, target_player, "Unit");
	}

	if (target)
	{
		// get target position
		var cmpTargetPosition = Engine.QueryInterface(target, IID_Position).GetPosition2D();

		// warn("sending troop to attack");
		const cmpUnitAI = Engine.QueryInterface(attacker, IID_UnitAI);
		cmpUnitAI.SwitchToStance("violent");
		cmpUnitAI.WalkAndFight(cmpTargetPosition.x, cmpTargetPosition.y, null);
	}
	else // find a structure
	{
		warn("[ERROR] Could not find closest target to fight: " + attacker + " and " + target_player + " and " + target_class);
	}

};

Trigger.prototype.IdleUnitCheck = function(data)
{
	for (const p of [2, 3, 4])
	{
		// warn("idle unit check for player = "+p);

		// find all idle units
		const units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Unit").filter(TriggerHelper.IsInWorld);

		for (const u of units)
		{
			const cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI)
			{
				if (cmpUnitAI.IsIdle())
				{
					// warn("Found idle unit.");

					const id = Engine.QueryInterface(u, IID_Identity);
					// warn(uneval(id));
					this.WalkAndFightClosestTarget(u, 1, "Structure");
				}
			}
		}
	}
};

Trigger.prototype.VictoryTextFnEnemy = function(n)
{
	return markForPluralTranslation(
		"You have lost too many troops! %(lastPlayer)s has won (game mode).",
		"%(players)s and %(lastPlayer)s have won (game mode).",
		n);
};

Trigger.prototype.VictoryTextFn = function(n)
{
	return markForPluralTranslation(
		"%(lastPlayer)s has won (game mode).",
		"%(players)s and %(lastPlayer)s have won (game mode).",
		n);
};

Trigger.prototype.VictoryCheck = function(data)
{

	// check to see that player 2 has no units
	const ccs_1 = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "CivilCentre").filter(TriggerHelper.IsInWorld);

	if (ccs_1.length >= 2)
	{
		TriggerHelper.SetPlayerWon(1, this.VictoryTextFn, this.VictoryTextFn);
	}
	else
	{
		TriggerHelper.SetPlayerWon(2, this.VictoryTextFn, this.VictoryTextFn);
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

	// generate sequence
	cmpTrigger.prog_seq = [];

	for (let i = 0; i < 100; ++i)
	{
		cmpTrigger.prog_seq.push(5 + Math.floor(Math.sqrt(2.25 * i)) + Math.floor(i / 2));
	}
	// warn(uneval(cmpTrigger.prog_seq));

	cmpTrigger.cavRatio = 0.55;
	cmpTrigger.siegeRatio = 0.1;

	// persion info
	// cmpTrigger.persianSpawnSites = [7647,7646,7645];
	cmpTrigger.persianSpawnSites = cmpTrigger.GetTriggerPoints("A");
	cmpTrigger.persianInfTypes = ["units/pers/champion_infantry", "units/pers/kardakes_hoplite", "units/pers/kardakes_skirmisher", "units/athen/champion_ranged", "units/pers/arstibara"];

	cmpTrigger.persianSiegeTypes = ["units/athen/siege_oxybeles_packed", "units/athen/siege_oxybeles_packed"];
	cmpTrigger.persianSiegeTypesAll = ["units/athen/siege_oxybeles_packed", "units/pers/champion_elephant", "units/pers/siege_ram"];

	cmpTrigger.persianCavTypes = ["units/pers/cavalry_spearman_b", "units/pers/cavalry_javelineer_b"];
	cmpTrigger.persianCavTypesAll = ["units/pers/cavalry_spearman_e", "units/pers/cavalry_javelineer_e", "units/pers/champion_cavalry_archer", "units/pers/cavalry_archer_e", "units/pers/cavalry_axeman_e"];

	cmpTrigger.numberOfTimerTrigger = 0;
	cmpTrigger.maxNumberOfTimerTrigger = 100; // execute it that many times
	cmpTrigger.numberOfTimerTriggerCav = 0;

	// greek info
	// cmpTrigger.greekSpawnSites = [7670,7671,7672,7680];
	cmpTrigger.greekSpawnSites = cmpTrigger.GetTriggerPoints("B");
	cmpTrigger.greekInfTypes = ["units/athen/cavalry_javelineer_a", "units/athen/cavalry_swordsman_a", "units/athen/cavalry_javelineer_b", "units/athen/cavalry_swordsman_b", "units/athen/champion_ranged", "units/athen/champion_marine", "units/athen/champion_infantry", "units/theb_sacred_band", "units/merc_black_cloak"];
	cmpTrigger.greekSiegeTypes = ["units/athen/siege_oxybeles_packed", "units/athen/siege_oxybeles_packed", "units/athen/siege_lithobolos_packed", "units/athen/siege_oxybeles_packed"];

	cmpTrigger.greekRatio = 0.85;
	cmpTrigger.greekAttackCounter = 0;

	/* cmpTrigger.RegisterTrigger("OnInterval", "PersianAttackCav", {
		"enabled": true,
		"delay": 45 * 1000,
		"interval":  95 * 1000,
	});

	cmpTrigger.RegisterTrigger("OnInterval", "PersianAttack", {
		"enabled": true,
		"delay": 30 * 1000,
		"interval": 95 * 1000,
	});*/

	/* cmpTrigger.RegisterTrigger("OnInterval", "GreekAttack", {
		"enabled": true,
		"delay": 55 * 1000,
		"interval": 75 * 1000,
	});*/

	cmpTrigger.RegisterTrigger("OnInterval", "IdleUnitCheck", {
		"enabled": true,
		"delay": 120 * 1000,
		"interval": 30 * 1000,
	});

	/* cmpTrigger.RegisterTrigger("OnInterval", "IntervalAction", {
		"enabled": true,
		"delay": 3 * 1000,
		"interval": 3 * 1000,
	});*/

	cmpTrigger.persAttackInterval = 95 * 1000;
	cmpTrigger.persAttackDelay = 95 * 1000;
	cmpTrigger.persAttackDelayCav = 90 * 1000;
	cmpTrigger.persGamma = 0.9825;
	cmpTrigger.DoAfterDelay(cmpTrigger.persAttackDelay, "PersianAttack", null);
	cmpTrigger.DoAfterDelay(cmpTrigger.persAttackDelayCav, "PersianAttackCav", null);

	cmpTrigger.greekAttackInterval = 75 * 1000;
	cmpTrigger.greekAttackDelay = 125 * 1000;
	cmpTrigger.greekGamma = 0.9825;
	cmpTrigger.DoAfterDelay(cmpTrigger.greekAttackDelay, "GreekAttack", null);

	cmpTrigger.DoAfterDelay(5 * 1000, "SetDifficultyLevel", null);
	cmpTrigger.DoAfterDelay(3 * 1000, "GarrisonEntities", null);

	// schedule victory check
	cmpTrigger.DoAfterDelay(45 * 60 * 1000, "VictoryCheck", null); // 45 minutes, check if we still have 2 ccs

	cmpTrigger.RegisterTrigger("OnInterval", "StructureDecayCheck", {
		"enabled": true,
		"delay": 10 * 1000,
		"interval": 10 * 1000,
	});

}
