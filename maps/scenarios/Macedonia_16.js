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
	"structures/" + civ + "/house",

	// military
	"structures/" + civ + "/barracks",
	"structures/" + civ + "/apartment",
	"structures/" + civ + "/defense_tower",
	"structures/" + civ + "/tower_bolt",
	"structures/" + civ + "/tower_artilery",
	"structures/" + civ + "/elephant_stable",
	"structures/" + civ + "/forge",
	"structures/" + civ + "/arsenal",
	"structures/" + civ + "/fortress",
	"structures/" + civ + "/range",
	"structures/" + civ + "/stable",
	"structures/" + civ + "/temple",
	"structures/" + civ + "/outpost",

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
	"units/" + civ + "/support_female_citizen",

	// embasies
	"structures/cart/embassy_celtic",
	"structures/cart/embassy_italic",
	"structures/cart/embassy_iberian"
];


Trigger.prototype.WalkAndFightClosestTarget = function(attacker, target_player, target_class)
{
	let target = this.FindClosestTarget(attacker, target_player, target_class);
	if (!target)
	{
		target = this.FindClosestTarget(attacker, target_player, siegeTargetClass);
	}


	if (target)
	{
		// get target position
		var cmpTargetPosition = Engine.QueryInterface(target, IID_Position).GetPosition2D();


		const cmpUnitAI = Engine.QueryInterface(attacker, IID_UnitAI);
		cmpUnitAI.SwitchToStance("violent");
		cmpUnitAI.WalkAndFight(cmpTargetPosition.x, cmpTargetPosition.y, null);
	}
	else // find a structure
	{


		warn("[ERROR] Could not find closest target to fight: " + attacker + " and " + target_player + " and " + target_class);
	}

};


Trigger.prototype.WalkAndFightRandomtTarget = function(attacker, target_player, target_class)
{
	let target = this.FindRandomTarget(attacker, target_player, target_class);
	if (!target)
	{
		target = this.FindRandomTarget(attacker, target_player, siegeTargetClass);
	}


	if (target)
	{
		// get target position
		var cmpTargetPosition = Engine.QueryInterface(target, IID_Position).GetPosition2D();


		const cmpUnitAI = Engine.QueryInterface(attacker, IID_UnitAI);
		cmpUnitAI.SwitchToStance("violent");
		cmpUnitAI.WalkAndFight(cmpTargetPosition.x, cmpTargetPosition.y, null);
	}
	else // find a structure
	{


		warn("[ERROR] Could not find closest target to fight: " + attacker + " and " + target_player + " and " + target_class);
	}

};


Trigger.prototype.FindRandomTarget = function(attacker, target_player, target_class)
{
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

	return pickRandom(targets);
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

	if (data.player == 1)
	{
		if (data.tech != "phase_town_generic" && data.tech != "phase_city_generic")
		{
			const cmpPlayer = QueryPlayerIDInterface(3);
			const cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
			cmpTechnologyManager.ResearchTechnology(data.tech);

			// warn("Researching tech for ally");
		}

	}
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

	// check if ballista was destroyed
	if (data.from == 0 && data.to == -1)
	{

		if (data.entity == 1170 || data.entity == 1171)
		{
			// spawn ballista
			TriggerHelper.SpawnUnits(data.entity, "units/athen/siege_oxybeles_unpacked", 1, 1);
		}
		else if (data.entity == 1222)
		{
			// spawn siege tower
			TriggerHelper.SpawnUnits(data.entity, "units/mace/siege_tower", 1, 1);
		}
	}

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
	else if (data.from == 2 && id.classesList.indexOf("Gate") >= 0)
	{
		warn("gate destroyed");
		this.GateDestroyedAttack();
	}
	else if (data.from == 2 && id.classesList.indexOf("CivilCentre") >= 0)
	{
		warn("cc destroyed");
		// TO DO: win
	}
	else if (data.from == 3 && id.classesList.includes("Defensive") && id.classesList.includes("Tower"))
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





// garison AI entities with archers
Trigger.prototype.GarrisonEntities = function(data)
{

	for (const p of [2, 3, 4])
	{
		const towers_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "StoneTower").filter(TriggerHelper.IsInWorld);


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

		// FORTRESS
		const forts_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Fortress").filter(TriggerHelper.IsInWorld);
		const fort_size = 20;

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

		const camps_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "MercenaryCamp").filter(TriggerHelper.IsInWorld);

		for (const c of camps_p)
		{
			// spawn the garrison inside the tower
			const archers_e = TriggerHelper.SpawnUnits(c, "units/athen/champion_ranged", 10, p);

			for (const a of archers_e)
			{
				const cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(c, true);
			}
		}
	}
};




Trigger.prototype.LevelUpPers = function(data)
{
	this.persLevel += 1;
	// warn("pers level up");
};

Trigger.prototype.IdleUnitCheck = function(data)
{
	for (const p of [3, 4])
	{
		let target_p = 4;
		if (p == 4)
			target_p = 3;

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


Trigger.prototype.StructureDecayCheck = function(data)
{
	// warn("structure decay check");
	for (const p of [1])
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


Trigger.prototype.RandomTemplatePers = function(data)
{
	const r = Math.random();

	if (r < 0.925)
		return pickRandom(this.pers_inf_templates);
	else if (r < 0.975)
		return pickRandom(this.pers_cav_templates);
	return pickRandom(this.pers_ele_templates);
};


Trigger.prototype.RandomTemplateMace = function(data)
{
	const r = Math.random();

	if (r < 0.9)
		return pickRandom(this.mace_inf_templates);
	else if (r <= 1.0)
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
	// warn(target);
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
	// warn(uneval(attackers_per));
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
		// warn(uneval(attackers_mace));
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




Trigger.prototype.RepeatUnitSpawnGreek = function(data)
{
	const owner = 3;

	// find site
	const forts_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(owner), "StoneTower").filter(TriggerHelper.IsInWorld);
	const spawn_site = pickRandom(forts_p);

	// spawn
	const spawn_size = pickRandom([6, 8, 10]);
	const attackers = [];
	for (let i = 0; i < spawn_size; i++)
	{
		// decide what to spawn
		const unit_type = this.RandomTemplateMace();

		const spawned_units = TriggerHelper.SpawnUnits(spawn_site, unit_type, 1, owner);

		// issue orders
		for (const u of spawned_units)
		{
			this.WalkAndFightRandomtTarget(u, 4, unitTargetClass);
		}
	}

	this.DoAfterDelay(this.greekSpawnInterval, "RepeatUnitSpawnGreek", null);

};

Trigger.prototype.RepeatUnitSpawnPers = function(data)
{
	const owner = 4;

	// find site
	const forts_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(owner), "Fortress").filter(TriggerHelper.IsInWorld);
	const spawn_site = pickRandom(forts_p);

	// spawn
	const spawn_size = pickRandom([4, 5, 6]) + this.persLevel;
	const attackers = [];
	for (let i = 0; i < spawn_size; i++)
	{
		// decide what to spawn
		const unit_type = this.RandomTemplatePers();
		const spawned_units = TriggerHelper.SpawnUnits(spawn_site, unit_type, 1, owner);
		attackers.push(spawned_units[0]);
		// issue orders
		/* for (let u of spawned_units)
		{
			this.WalkAndFightClosestTarget(u,1,unitTargetClass);
		}*/
	}

	// pick formation
	const formation = pickRandom(unitFormations);
	// warn(formation);
	TriggerHelper.SetUnitFormation(owner, attackers, formation);

	// make them attack
	const target = this.FindClosestTarget(attackers[0], 1, unitTargetClass);
	const target_pos = TriggerHelper.GetEntityPosition2D(target);

	ProcessCommand(owner, {
		"type": "attack-walk",
		"entities": attackers,
		"x": target_pos.x,
		"z": target_pos.y,
		"queued": true,
		"targetClasses": {
			"attack": unitTargetClass
		},
		"allowCapture": false
	});

	this.DoAfterDelay(this.persSpawnInterval, "RepeatUnitSpawnPers", null);

};



Trigger.prototype.RangeActionTriggerK = function(data)
{
	// warn(uneval(data));

	// check to make sure player 1 hasn't just sent a cavalry unit, must have over 60 units to claim victory
	// find any idle soldiers
	const p = 1;
	const units_inf = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Infantry").filter(TriggerHelper.IsInWorld);
	const units_cav = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Cavalry").filter(TriggerHelper.IsInWorld);
	const units_siege = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Siege").filter(TriggerHelper.IsInWorld);
	const units_ele = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Elephant").filter(TriggerHelper.IsInWorld);

	const units_all = units_inf.concat(units_cav, units_siege, units_ele);

	if (data.currentCollection.length > 10)
	{
		TriggerHelper.SetPlayerWon(1, this.VictoryTextFn, this.VictoryTextFn);


		/* warn("Win!");
		// try out the dialog
		var cmpGUIInterface = Engine.QueryInterface(SYSTEM_ENTITY, IID_GuiInterface);
		cmpGUIInterface.PushNotification({
			"type": "dialog",
			"players": [1],
			"dialogName": "yes-no",
			"data": {
				"text": {
					"caption": {
						"message": markForTranslation("Congratulations, you have won! Alas, Alexadner's attempt to conquer Tyre via the bridge ultimately failed. Let's see what he comes up with next ..."),
						"translateMessage": true,
					},
				},
				"button1": {
					"caption": {
						"message": markForTranslation("Sure"),
						"translateMessage": true,
					},
					"tooltip": {
						"message": markForTranslation("Say sure"),
						"translateMessage": true,
					},
				},
			},
		});

		this.persLevel = this.persLevel + 1;*/

		/* let cmpEndGameManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_EndGameManager);
		cmpEndGameManager.MarkPlayerAndAlliesAsWon(1, markForTranslation("You have won!"), markForTranslation("You have lost!"));*/
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

	cmpTrigger.enemies = [2, 4];


	// persian soldier types
	cmpTrigger.pers_inf_templates = ["units/pers/arstibara", "units/pers/champion_infantry", "units/pers/champion_infantry", "units/pers/infantry_archer_a", "units/pers/infantry_javelineer_a", "units/pers/infantry_spearman_b", "units/pers/infantry_spearman_a", "units/pers/infantry_spearman_e", "units/pers/kardakes_hoplite", "units/pers/kardakes_hoplite", "units/pers/kardakes_skirmisher"];
	cmpTrigger.pers_cav_templates = ["units/pers/cavalry_javelineer_a", "units/pers/cavalry_spearman_a", "units/pers/cavalry_axeman_a", "units/pers/champion_cavalry", "units/pers/champion_cavalry_archer"];
	cmpTrigger.pers_ele_templates = TriggerHelper.GetTemplateNamesByClasses("Champion+Elephant+!Hero", "pers", undefined, undefined, true);
	cmpTrigger.pers_elite_templates = ["units/pers/arstibara", "units/pers/champion_infantry", "units/pers/kardakes_hoplite", "units/pers/kardakes_skirmisher", "units/pers/infantry_archer_e", "units/pers/cavalry_archer_e", "units/pers/champion_cavalry_archer", "units/pers/champion_cavalry", "units/pers/cavalry_axeman_e"];

	// macedonian
	cmpTrigger.mace_inf_templates = ["units/mace/champion_infantry_spearman", "units/mace/champion_infantry_spearman", "units/mace/champion_infantry_spearman_02", "units/mace/infantry_archer_b", "units/mace/infantry_javelineer_b", "units/mace/infantry_pikeman_a", "units/mace/infantry_slinger_b", "units/merc_thorakites", "units/merc_thureophoros", "units/athen/champion_ranged", "units/athen/champion_marine", "units/athen/champion_marine"];
	cmpTrigger.mace_cav_templates = ["units/mace/champion_cavalry", "units/mace/cavalry_spearman_a", "units/mace/cavalry_javelineer_a"];
	cmpTrigger.mace_siege_templates = ["units/mace/siege_oxybeles_packed"];

	// some constants
	cmpTrigger.persSpawnInterval = 5 * 1000;
	cmpTrigger.greekSpawnInterval = 7.5 * 1000;

	// some state variables
	cmpTrigger.persLevel = 2;


	/* warn(uneval(cmpTrigger.greek_inf_templates));
	warn(uneval(cmpTrigger.mace_inf_templates));
	warn(uneval(cmpTrigger.mace_cav_templates));
	warn(uneval(cmpTrigger.mace_siege_templates));	*/

	// garrison towers
	cmpTrigger.DoAfterDelay(5 * 1000, "GarrisonEntities", null);


	// spawn persian units
	cmpTrigger.DoAfterDelay(cmpTrigger.persSpawnInterval, "RepeatUnitSpawnPers", null);

	// spawn greek units
	cmpTrigger.DoAfterDelay(9 * 1000 + cmpTrigger.greekSpawnInterval, "RepeatUnitSpawnGreek", null);

	// debug or old
	// cmpTrigger.DoAfterDelay(5 * 1000,"EliteWaveUnitSpawn",null);
	// cmpTrigger.DoAfterDelay(5 * 1000,"CavalryWaveUnitSpawn",null);
	// cmpTrigger.DoAfterDelay(5 * 1000,"ElephantWaveUnitSpawn",null);

	for (const p of [1, 2, 3, 4, 5])
	{
		const cmpPlayer = QueryPlayerIDInterface(p);

		cmpPlayer.SetPopulationBonuses(300);

		// disable troop production
		let disTemplates = disabledTemplates(QueryPlayerIDInterface(p, IID_Identity).GetCiv());

		if (p == 2)
		{
			const unit_templates = TriggerHelper.GetTemplateNamesByClasses("Unit", QueryPlayerIDInterface(p, IID_Identity).GetCiv(), undefined, undefined, true);
			disTemplates = disTemplates.concat(unit_templates);
		}

		cmpPlayer.SetDisabledTemplates(disTemplates);

		const cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);


		cmpTechnologyManager.ResearchTechnology("phase_town_generic");
		cmpTechnologyManager.ResearchTechnology("phase_city_generic");

		if (p == 1)
		{
			cmpTechnologyManager.ResearchTechnology("unlock_shared_los");
			cmpTechnologyManager.ResearchTechnology("unlock_champion_infantry");
		}
	}


	/* cmpTrigger.RegisterTrigger("OnInterval", "IntervalUnitSpawn", {
		"enabled": true,
		"delay": 15 * 1000,
		"interval": 15 * 1000,
	});*/



	cmpTrigger.RegisterTrigger("OnInterval", "LevelUpPers", {
		"enabled": true,
		"delay": 1 * 1000,
		"interval": 240 * 1000,
	});

	cmpTrigger.RegisterTrigger("OnInterval", "IdleUnitCheck", {
		"enabled": true,
		"delay": 15 * 1000,
		"interval": 15 * 1000,
	});

	cmpTrigger.RegisterTrigger("OnInterval", "StructureDecayCheck", {
		"enabled": true,
		"delay": 10 * 1000,
		"interval": 10 * 1000,
	});

	// register winning trigger
	cmpTrigger.RegisterTrigger("OnRange", "RangeActionTriggerK", {
		"entities": cmpTrigger.GetTriggerPoints("K"), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 35,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});


}
