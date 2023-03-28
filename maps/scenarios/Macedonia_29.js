warn("loading the triggers file");

// /////////////////////
// Trigger listeners //
// /////////////////////


var unitTargetClass = "Unit+!Ship";
var siegeTargetClass = "Structure";

var triggerPointBeach = "A";
var triggerPointArcherRetreat = "B";
var triggerPointCatapultSpawn = "C";
var triggerPointCavalryAttack = "K";

/* var triggerPointPatrolA = "A";
var triggerPointPatrolB = "B";
var triggerPointPatrolMountainWest = "K";
var triggerPointPatrolMountainMiddle = "J";
var triggerPointPatrolMountainEast = "I";
var triggerPointRaid = "G";*/



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




Trigger.prototype.WalkAndGatherClosestTarget = function(attacker, target_player, target_class)
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
		cmpUnitAI.PerformGather(target, true, true);
	}
	else // find a structure
	{


		warn("[ERROR] Could not find closest target to fight: " + attacker + " and " + target_player + " and " + target_class);
	}

};


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


Trigger.prototype.FindClosestTriggerPoint = function(attacker, triggerPoint)
{
	const targets = this.GetTriggerPoints(triggerPoint);


	let closestTarget;
	let minDistance = Infinity;

	for (const target of targets)
	{

		const targetDistance = PositionHelper.DistanceBetweenEntities(attacker, target);
		if (targetDistance < minDistance)
		{
			closestTarget = target;
			minDistance = targetDistance;
		}
	}

	return closestTarget;
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
	this.lastFoundation = data.foundation;
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
	// warn(uneval(data));

	// check of enemy archer killed before river crossed
	if (this.riverCrossed == false && this.archersRetreated == false)
	{
		if (data.from == 2 && data.to == -1)
		{
			// count how many troops have been killed
			this.archersKilled += 1;

			warn("archers killed = " + this.archersKilled);

			if (this.archersKilled > this.archersRetreatThreshold)
			{

				this.DoAfterDelay(5 * 1000, "ArchersRetreatCommand", null);
				this.DoAfterDelay(10 * 1000, "ArchersRetreatCommand", null);
				this.DoAfterDelay(15 * 1000, "ArchersRetreatCommand", null);

				// warn("Archers have retreated");
				this.archersRetreated = true;

				this.ShowText("The archers are retreating! Now we can cross the river in safety!", "Great", "ok");
			}
			else if (this.archersKilled == 1)
			{
				this.ShowText("Excellent! That archer did not see this coming! Let's keep firing until they realize they need to retreat!", "Great", "ok");
			}
		}
	}

	// check if the archers are nearly done
	if (this.cavalryAttacksTriggered == false)
	{
		// check population of player 2
		const cmpPlayer = QueryPlayerIDInterface(2);
		const pop = cmpPlayer.GetPopulationCount();

		if (pop <= 2)
		{
			this.cavalryAttacksTriggered = true;

			// warn("starting cavalry raids");
			this.DoAfterDelay(30 * 1000, "SpawnCavalryAttack", null);
			this.DoAfterDelay(10 * 1000, "SpawnCatapults", null);

			this.ShowText("Now that the archers are nearly dead, we expect a heavy cavalry assault. Fortunately, we've been able to unload some bolt shooters to help us against the horsemen.", "Great", "ok");
		}
	}



	// check if the outpost is destroyed as an order
	if (this.boatCommandTriggered == false)
	{
		// warn(uneval(data));
		if (data.from == 1 && data.to == -1)
		{
			const id = Engine.QueryInterface(data.entity, IID_Identity);
			// warn(uneval(id));
			if (id && id.classesList.indexOf("Outpost") >= 0)
			{
				// warn("command");
				this.boatCommandTriggered = true;
				this.FleetMovementCommand();
			}

		}
	}


	/* if (this.specialAttackTriggered == false)
	{
		if ((data.from == 5 || data.from == 6) && data.to == -1)
		{
			//check if structure
			let id = Engine.QueryInterface(data.entity, IID_Identity);
			//warn(uneval(id));
			if (id != null && id.classesList.indexOf("Structure") >= 0)
			{
				if (data.from == 5)
				{
					//spawn attack from player 6
					this.DoAfterDelay(5 * 1000,"SpecialArcadianAssault",null);
					this.specialAttackTriggered = true;

				}
				else if (data.from == 6)
				{
					//spawn attack from player 5
					this.DoAfterDelay(5 * 1000,"SpecialAchaeanAssault",null);
					this.specialAttackTriggered = true;
				}
			}
		}
	}
	*/

	/* warn("The OnOwnershipChanged event happened with the following data:");
	warn(uneval(data));

	if (data.from == 5 && data.to == -1)
	{
		let id = Engine.QueryInterface(data.entity, IID_Identity);
		if (id.classesList.indexOf("Fortress") >= 0)
		{
			warn("Fortress destroyed!");
			this.CavalryAttack();
		}
	}*/

	// let id = Engine.QueryInterface(data.entity, IID_Identity);
	// warn(uneval(id));

	/* if (data.from == 0 && data.to == 1)
	{
		let id = Engine.QueryInterface(data.entity, IID_Identity);
		warn(uneval(id));

		if (id.classesList.indexOf("Embassy") >= 0)
		{
			//captured camp, spawn some balistas
			TriggerHelper.SpawnUnits(data.entity,"units/mace/siege_oxybeles_packed",8,1);

			//spawn the princess
			TriggerHelper.SpawnUnits(data.entity,"units/kush/hero_amanirenas",1,1);
		}
		else if (id.classesList.indexOf("Pyramid") >= 0)
		{
			let cmpPlayer = QueryPlayerIDInterface(1);
			let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);

			cmpTechnologyManager.ResearchTechnology("tower_health");
			cmpTechnologyManager.ResearchTechnology("tower_range");
			cmpTechnologyManager.ResearchTechnology("tower_watch");
			cmpTechnologyManager.ResearchTechnology("tower_murderholes");
			cmpTechnologyManager.ResearchTechnology("tower_crenellations");
			cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_01");
			cmpTechnologyManager.ResearchTechnology("soldier_resistance_pierce_01");
			cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_01");

		}
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

	for (const p of [1, 5])
	{
		const towers_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "GarrisonTower").filter(TriggerHelper.IsInWorld);

		const owner = p;

		for (const e of towers_p)
		{
			// spawn the garrison inside the tower
			const archers_e = TriggerHelper.SpawnUnits(e, "units/athen/champion_infantry", 5, owner);

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

			const archers_e = TriggerHelper.SpawnUnits(e, "units/athen/champion_ranged", fort_size, owner);

			for (const a of archers_e)
			{
				const cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(e, true);
			}
		}

		// wall towers
		const towers_w = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Defensive+Tower+!Outpost+!GarrisonTower").filter(TriggerHelper.IsInWorld);

		for (const e of towers_w)
		{
			// spawn the garrison inside the tower
			const archers_e = TriggerHelper.SpawnUnits(e, "units/athen/champion_ranged", 2, owner);

			for (const a of archers_e)
			{
				const cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(e, true);
			}
		}

		// camps
		const camps_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "MercenaryCamp").filter(TriggerHelper.IsInWorld);

		for (const c of camps_p)
		{
			// spawn the garrison inside the tower
			const archers_e = TriggerHelper.SpawnUnits(c, "units/athen/champion_ranged", 1, p);

			for (const a of archers_e)
			{
				const cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(c, true);
			}
		}

		const outposts_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Outpost").filter(TriggerHelper.IsInWorld);
		for (const c of outposts_p)
		{
			// spawn the garrison inside the tower
			const archers_e = TriggerHelper.SpawnUnits(c, "units/athen/champion_ranged", 1, p);

			for (const a of archers_e)
			{
				const cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(c, true);
			}
		}
	}
};




Trigger.prototype.HorseCheck = function(data)
{
	for (const p of [0])
	{
		const animals = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Animal").filter(TriggerHelper.IsInWorld);

		const horses = [];

		for (const a of animals)
		{
			const id = Engine.QueryInterface(a, IID_Identity);
			if (id.template.SpecificName == "Horse")
			{
				// warn("Found horse");
				horses.push(a);
			}
		}

		// warn("Found "+horses.length+" horses");

		if (horses.length < 300)
		{
			// with small probability reproduce
			const rate = 0.05;

			const new_horses = Math.round((horses.length * rate) + 1);

			// warn("Adding "+new_horses);
			for (let i = 0; i < new_horses; i++)
			{
				TriggerHelper.SpawnUnits(pickRandom(horses), "gaia/fauna_horse", 1, 0);
			}
		}
	}
};

Trigger.prototype.StructureDecayCheck = function(data)
{
	for (const p of [3, 4, 5])
	{
		const structs = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Structure").filter(TriggerHelper.IsInWorld);
		// warn("checking decay");


		for (const s of structs)
		{
			var cmpCapt = Engine.QueryInterface(s, IID_Capturable);
			if (cmpCapt)
			{
				const c_points = cmpCapt.GetCapturePoints();

				// warn("capture points: "+uneval(cmpCapt.GetCapturePoints()));
				// warn("max: "+uneval(cmpCapt.GetMaxCapturePoints()));

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



Trigger.prototype.FinalAtttackB = function(data)
{
	for (const p of [3])
	{
		const units_cav = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Cavalry").filter(TriggerHelper.IsInWorld);

		for (const u of units_cav)
		{
			const cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI)
			{
				if (cmpUnitAI.IsIdle())
				{
					// warn("Found idle soldier");
					this.WalkAndFightClosestTarget(u, 1, unitTargetClass);
				}
			}
		}
	}

};

Trigger.prototype.FinalAtttackA = function(data)
{
	for (const p of [4])
	{
		const units_cav = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Cavalry").filter(TriggerHelper.IsInWorld);

		for (const u of units_cav)
		{
			const cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI)
			{
				if (cmpUnitAI.IsIdle())
				{
					// warn("Found idle soldier");
					this.WalkAndFightClosestTarget(u, 1, unitTargetClass);
				}
			}
		}
	}

};

Trigger.prototype.IdleUnitCheck = function(data)
{

	for (const p of [5])
	{
		const units_cav = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Cavalry").filter(TriggerHelper.IsInWorld);

		for (const u of units_cav)
		{
			const cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI)
			{
				if (cmpUnitAI.IsIdle())
				{
					// warn("Found idle soldier");
					this.WalkAndFightClosestTarget(u, 1, unitTargetClass);
				}
			}
		}
	}



};




Trigger.prototype.PatrolOrderList = function(units, p, patrolTargets)
{

	if (units.length <= 0)
		return;

	// warn("targets: "+uneval(patrolTargets));

	for (const patrolTarget of patrolTargets)
	{
		const targetPos = TriggerHelper.GetEntityPosition2D(patrolTarget);
		ProcessCommand(p, {
			"type": "patrol",
			"entities": units,
			"x": targetPos.x,
			"z": targetPos.y,
			"targetClasses": {
				"attack": unitTargetClass
			},
			"queued": true,
			"allowCapture": false
		});
	}
};

Trigger.prototype.PatrolOrder = function(units, p, A, B)
{

	if (units.length <= 0)
		return;


	// list of patrol targets
	const patrolTargets = [A, B];

	for (const patrolTarget of patrolTargets)
	{
		const targetPos = TriggerHelper.GetEntityPosition2D(patrolTarget);
		ProcessCommand(p, {
			"type": "patrol",
			"entities": units,
			"x": targetPos.x,
			"z": targetPos.y,
			"targetClasses": {
				"attack": unitTargetClass
			},
			"queued": true,
			"allowCapture": false
		});
	}
};


Trigger.prototype.SpawnEastMountainPatrol = function(data)
{
	const p = 5;

	// find site
	const structures = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "MercenaryCamp").filter(TriggerHelper.IsInWorld);
	// warn(structures.length);
	if (structures.length == 0)
	{
		warn("Did not find structures for player " + p);
		return; // no more structures, must be defeated
	}

	// choose spawn site
	const site = pickRandom(structures);

	// templates, mostly archers
	const templates = ["units/pers/infantry_archer_e", "units/pers/infantry_archer_a"];

	// spawn a single template
	const inf_units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Infantry").filter(TriggerHelper.IsInWorld);


	if (inf_units.length < this.maxSacaInf)
	{

		// spawn unit
		const unit = TriggerHelper.SpawnUnits(site, pickRandom(templates), 1, p);

		// pick points to patrol
		const patrol_points = this.pickRandomK(this.GetTriggerPoints(triggerPointPatrolMountainEast), 5);

		this.PatrolOrderList(unit, p, patrol_points);
	}

	// schedule next spawn
	const next_spawn_seconds = Math.round(Math.sqrt(2 * inf_units.length)) + 1;
	// warn("next spawn in "+next_spawn_seconds+" seconds");
	this.DoAfterDelay(next_spawn_seconds * 1000, "SpawnEastMountainPatrol", null);

};

Trigger.prototype.SpawnMiddleMountainPatrol = function(data)
{
	const p = 5;

	// find site
	const structures = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "MercenaryCamp").filter(TriggerHelper.IsInWorld);
	// warn(structures.length);
	if (structures.length == 0)
	{
		warn("Did not find structures for player " + p);
		return; // no more structures, must be defeated
	}

	// choose spawn site
	const site = pickRandom(structures);

	// templates, mostly archers
	const templates = ["units/pers/infantry_archer_e", "units/pers/infantry_archer_a"];

	// spawn a single template
	const inf_units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Infantry").filter(TriggerHelper.IsInWorld);


	if (inf_units.length < this.maxSacaInf)
	{

		// spawn unit
		const unit = TriggerHelper.SpawnUnits(site, pickRandom(templates), 1, p);

		// pick points to patrol
		const patrol_points = this.pickRandomK(this.GetTriggerPoints(triggerPointPatrolMountainMiddle), 5);

		this.PatrolOrderList(unit, p, patrol_points);
	}

	// schedule next spawn
	const next_spawn_seconds = Math.round(Math.sqrt(2 * inf_units.length)) + 1;
	// warn("next spawn in "+next_spawn_seconds+" seconds");
	this.DoAfterDelay(next_spawn_seconds * 1000, "SpawnMiddleMountainPatrol", null);

};

Trigger.prototype.SpawnWestMountainPatrol = function(data)
{
	const p = 4;

	// find site
	const structures = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "MercenaryCamp").filter(TriggerHelper.IsInWorld);
	// warn(structures.length);
	if (structures.length == 0)
	{
		warn("Did not find structures for player " + p);
		return; // no more structures, must be defeated
	}

	// choose spawn site
	const site = pickRandom(structures);

	// templates, mostly archers
	const templates = ["units/pers/infantry_archer_e", "units/pers/infantry_archer_a"];

	// spawn a single template
	const inf_units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Infantry").filter(TriggerHelper.IsInWorld);


	if (inf_units.length < this.maxSacaInf)
	{

		// spawn unit
		const unit = TriggerHelper.SpawnUnits(site, pickRandom(templates), 1, p);

		// pick points to patrol
		const patrol_points = this.pickRandomK(this.GetTriggerPoints(triggerPointPatrolMountainWest), 5);

		this.PatrolOrderList(unit, p, patrol_points);
	}

	// schedule next spawn
	const next_spawn_seconds = Math.round(Math.sqrt(2 * inf_units.length)) + 1;
	// warn("next spawn in "+next_spawn_seconds+" seconds");
	this.DoAfterDelay(next_spawn_seconds * 1000, "SpawnWestMountainPatrol", null);

};


Trigger.prototype.pickRandomK = function(inputs, K)
{
	const subset = [];

	while (subset.length < K)
	{
		const next = pickRandom(inputs);

		if (subset.indexOf(next) < 0)
		{
			subset.push(next);
		}
	}

	return subset;

};

Trigger.prototype.SpawnMaPatrol = function(data)
{
	const p = 4;

	// find site
	const structures = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Structure+!MercenaryCamp").filter(TriggerHelper.IsInWorld);
	// warn(structures.length);
	if (structures.length == 0)
	{
		return; // no more structures, must be defeated
	}

	// choose spawn site
	const site = pickRandom(structures);

	// templates, mostly archers
	const cav_templates = ["units/pers/champion_cavalry", "units/pers/champion_cavalry_archer", "units/pers/champion_cavalry_archer"];

	// see if we have room to spawn more
	const cmpPlayer = QueryPlayerIDInterface(p);
	const pop = cmpPlayer.GetPopulationCount();
	// warn(pop);

	const cav_units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Cavalry").filter(TriggerHelper.IsInWorld);

	if (cav_units.length < this.maxSacaCav)
	{
		const patrol_size = 5;
		const units = [];
		for (let i = 0; i < patrol_size; i++)
		{
			const unit_i = TriggerHelper.SpawnUnits(site, pickRandom(cav_templates), 1, p);
			units.push(unit_i[0]);
		}

		// warn(uneval(units));

		// send to patrol
		// set formation
		// TriggerHelper.SetUnitFormation(p, units, pickRandom(unitFormations));

		this.PatrolOrderList(units, p, this.GetTriggerPoints(triggerPointPatrolA));
	}

	this.DoAfterDelay(45 * 1000, "SpawnMaPatrol", null);

};


Trigger.prototype.SpawnApaPatrol = function(data)
{
	const p = 5;

	// find site
	const structures = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Structure+!MercenaryCamp").filter(TriggerHelper.IsInWorld);
	// warn(structures.length);
	if (structures.length == 0)
	{
		return; // no more structures, must be defeated
	}

	// choose spawn site
	const site = pickRandom(structures);

	// templates, mostly archers
	const cav_templates = ["units/pers/champion_cavalry", "units/pers/champion_cavalry_archer", "units/pers/champion_cavalry_archer"];

	// see if we have room to spawn more
	const cmpPlayer = QueryPlayerIDInterface(p);

	const cav_units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Cavalry").filter(TriggerHelper.IsInWorld);

	if (cav_units.length < this.maxSacaCav)
	{
		const patrol_size = 5;
		const units = [];
		for (let i = 0; i < patrol_size; i++)
		{
			const unit_i = TriggerHelper.SpawnUnits(site, pickRandom(cav_templates), 1, p);
			units.push(unit_i[0]);
		}

		// warn(uneval(units));

		// send to patrol
		// set formation
		// TriggerHelper.SetUnitFormation(p, units, pickRandom(unitFormations));

		this.PatrolOrderList(units, p, this.GetTriggerPoints(triggerPointPatrolB));
	}

	this.DoAfterDelay(45 * 1000, "SpawnApaPatrol", null);

};


Trigger.prototype.SpawnCavalryRaid = function(data)
{
	// size of raid is determined by number of structures owned by 4 and 5
	const structures_p4 = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(4), "Structure").filter(TriggerHelper.IsInWorld);
	const structures_p5 = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(5), "Structure").filter(TriggerHelper.IsInWorld);

	const num_squads = Math.round((structures_p4.length + structures_p5.length) / 2);

	for (let i = 0; i < num_squads; i++)
	{
		this.DoAfterDelay((i * 5) * 1000, "SpawnCavalryRaidSquad", null);
	}

	// repeat after 6 minutes
	this.DoAfterDelay(360 * 1000, "SpawnCavalryRaid", null);

};

Trigger.prototype.SpawnCavalryRaidSquad = function(data)
{
	const p = 6;
	const structures = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Structure").filter(TriggerHelper.IsInWorld);

	if (structures.length == 0)
		return;

	// pick spawn site
	const spawn_site = pickRandom(this.GetTriggerPoints(triggerPointRaid));

	// templates
	const cav_templates = ["units/pers/champion_cavalry", "units/pers/champion_cavalry_archer", "units/pers/champion_cavalry_archer", "units/pers/cavalry_javelinist_e", "units/pers/cavalry_swordsman_e"];

	const num_attackers = 8;
	const attackers = [];

	// spawn attackers
	for (let i = 0; i < num_attackers; ++i)
	{
		const units_i = TriggerHelper.SpawnUnits(spawn_site, pickRandom(cav_templates), 1, p);
		attackers.push(units_i[0]);
	}

	// send to attack
	// set formation
	TriggerHelper.SetUnitFormation(p, attackers, pickRandom(unitFormations));

	// find target
	const target = this.FindClosestTarget(attackers[0], 1, siegeTargetClass);
	const target_pos = TriggerHelper.GetEntityPosition2D(target);

	ProcessCommand(p, {
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
};


Trigger.prototype.SpawnCatapults = function(data)
{
	const p = 1;
	const spawn_site = pickRandom(this.GetTriggerPoints(triggerPointCatapultSpawn));

	const units_i = TriggerHelper.SpawnUnits(spawn_site, "units/mace/siege_oxybeles_packed", 4, p);

};

Trigger.prototype.SpawnCavalryAttack = function(data)
{
	warn("cavalry attack counter = " + this.cavalryAttackCounter);

	// check if we have structures left, if not, end
	const p = 5;
	const structures = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Structure").filter(TriggerHelper.IsInWorld);

	if (structures.length == 0)
		return;



	// how big should the attack be
	let num_attackers = 18 + Math.round(this.cavalryAttackCounter / 3);
	while (true)
	{
		if (Math.random() < (this.dirichletParam + 0.05))
		{
			break;
		}
		else
		{
			num_attackers += 1;
		}
	}

	// final attacks
	if (this.cavalryAttackCounter >= 37)
	{
		num_attackers += Math.round(this.cavalryAttackCounter / 1.5);
	}

	// update dirichlet param
	this.dirichletParam *= this.dirichletParamDecay;
	if (this.dirichletParam < this.dirichletParamMin)
		this.dirichletParam = this.dirichletParamMin;

	// warn("new dirichlet param = "+this.dirichletParam);
	warn("spawning num attackers = " + num_attackers);

	// types
	const cav_templates = ["units/pers/champion_cavalry", "units/pers/champion_cavalry_archer", "units/pers/cavalry_javelineer_e", "units/pers/cavalry_javelineer_a", "units/pers/cavalry_axeman_e", "units/pers/cavalry_axeman_a", "units/pers/cavalry_spearman_e", "units/pers/cavalry_spearman_a", "units/pers/cavalry_spearman_b"];

	const attackers = [];

	// spawn attackers
	for (let i = 0; i < num_attackers; ++i)
	{
		// pick spawn site
		const spawn_site = pickRandom(this.GetTriggerPoints(triggerPointCavalryAttack));

		const units_i = TriggerHelper.SpawnUnits(spawn_site, pickRandom(cav_templates), 1, p);
		attackers.push(units_i[0]);
	}

	// attack
	// set formation
	// TriggerHelper.SetUnitFormation(p, attackers, pickRandom(unitFormations));

	// find target
	// let target = this.FindClosestTarget(attackers[0],1,siegeTargetClass);
	const target = this.FindClosestTriggerPoint(attackers[0], triggerPointBeach);
	const target_pos = TriggerHelper.GetEntityPosition2D(target);

	ProcessCommand(p, {
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

	// schedule next attack
	const interval = Math.round(this.cavalryAttackInterval);

	this.cavalryAttackInterval *= this.cavalryAttackIntervalDecay;
	if (this.cavalryAttackInterval < 5.0)
		this.cavalryAttackInterval = 5.0;

	warn("next attack in = " + this.cavalryAttackInterval);

	this.cavalryAttackCounter += 1;

	// see whether to add tech
	const cmpPlayer = QueryPlayerIDInterface(p);
	const cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
	if (this.cavalryAttackCounter == 10)
	{
		cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_01");
		cmpTechnologyManager.ResearchTechnology("soldier_resistance_pierce_01");
	}
	else if (this.cavalryAttackCounter == 15)
	{
		cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_02");
		cmpTechnologyManager.ResearchTechnology("soldier_resistance_pierce_02");
	}
	else if (this.cavalryAttackCounter == 20)
	{
		cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_01");
		cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_01");
	}
	else if (this.cavalryAttackCounter == 25)
	{
		cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_02");
		cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_02");
	}
	else if (this.cavalryAttackCounter == 30)
	{
		cmpTechnologyManager.ResearchTechnology("nisean_horses");
	}
	else if (this.cavalryAttackCounter == 35)
	{
		cmpTechnologyManager.ResearchTechnology("attack_soldiers_will");
		cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_03");
		cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_03");
	}
	else if (this.cavalryAttackCounter == 37)
	{
		// send in one army
		cmpTechnologyManager.ResearchTechnology("cavalry_health");
		cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_03");
		cmpTechnologyManager.ResearchTechnology("soldier_resistance_pierce_03");
		this.DoAfterDelay(5 * 1000, "FinalAtttackA", null);

	}
	else if (this.cavalryAttackCounter == 40)
	{
		// send in the second army
		this.DoAfterDelay(15 * 1000, "FinalAtttackB", null);
	}

	if (this.cavalryAttackCounter <= 40)
		this.DoAfterDelay(interval * 1000, "SpawnCavalryAttack", null);

};



Trigger.prototype.ShowText = function(text, option_a, option_b)
{
	var cmpGUIInterface = Engine.QueryInterface(SYSTEM_ENTITY, IID_GuiInterface);
	cmpGUIInterface.PushNotification({
		"type": "dialog",
		"players": [1, 2, 3, 4, 5, 6, 7, 8],
		"dialogName": "yes-no",
		"data": {
			"text": {
				"caption": {
					"message": markForTranslation(text),
					"translateMessage": true,
				},
			},
			"button1": {
				"caption": {
					"message": markForTranslation(option_a),
					"translateMessage": true,
				},
				"tooltip": {
					"message": markForTranslation(option_a),
					"translateMessage": true,
				},
			},
			"button2": {
				"caption": {
					"message": markForTranslation(option_b),
					"translateMessage": true,
				},
				"tooltip": {
					"message": markForTranslation(option_b),
					"translateMessage": true,
				},
			},
		},
	});

};




Trigger.prototype.ResearchTechs = function(data)
{
	for (const p of [1, 2])
	{

		const cmpPlayer = QueryPlayerIDInterface(p);
		const cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);


		if (p == 1)
		{

			// boost catapults
			cmpTechnologyManager.ResearchTechnology("siege_bolt_accuracy");
			cmpTechnologyManager.ResearchTechnology("siege_attack");

			// faster training for champs
			cmpTechnologyManager.ResearchTechnology("parade_of_daphne");

			// better horses
			cmpTechnologyManager.ResearchTechnology("nisean_horses");
			cmpTechnologyManager.ResearchTechnology("cavalry_movement_speed");
			cmpTechnologyManager.ResearchTechnology("cavalry_health");

			// faster training for infantry
			cmpTechnologyManager.ResearchTechnology("hoplite_tradition");

			// better infantry
			cmpTechnologyManager.ResearchTechnology("agoge");

			// boost troops attack and resistance
			cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_01");
			cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_02");
			cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_03");
			cmpTechnologyManager.ResearchTechnology("soldier_resistance_pierce_01");
			cmpTechnologyManager.ResearchTechnology("soldier_resistance_pierce_02");
			cmpTechnologyManager.ResearchTechnology("soldier_resistance_pierce_03");

			cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_01");
			cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_02");
			cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_03");
			cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_01");
			cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_02");
			cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_02");



			// better attack overall
			cmpTechnologyManager.ResearchTechnology("attack_soldiers_will");

			// healers
			cmpTechnologyManager.ResearchTechnology("heal_rate");
			cmpTechnologyManager.ResearchTechnology("heal_rate_2");
			cmpTechnologyManager.ResearchTechnology("heal_range");
			cmpTechnologyManager.ResearchTechnology("heal_range_2");

			cmpTechnologyManager.ResearchTechnology("unlock_champion_infantry");
			cmpTechnologyManager.ResearchTechnology("unlock_champion_cavalry");
		}


	}

};



Trigger.prototype.RangeActionRiverCrossing = function(data)
{
	if (this.riverCrossed == false)
	{
		// warn(uneval(data));

		// check if any added unit is something other than a ship
		for (const e of data.added)
		{
			const id = Engine.QueryInterface(e, IID_Identity);
			if (id && (id.classesList.indexOf("Cavalry") >= 0 || id.classesList.indexOf("Infantry") >= 0))
			{
				// we have unloaded some troops, river is now considered crossed
				this.riverCrossed = true;
				// warn("River crossed!");

				// archers advance in a bit
				this.DoAfterDelay(10 * 1000, "ArchersAdvanceCommand", null);

				return;
			}
		}
	}

};


Trigger.prototype.ArchersRetreatCommand = function(data)
{
	// find all archers by player 2
	const units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(2), "Archer").filter(TriggerHelper.IsInWorld);

	for (const u of units)
	{
		const cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
		if (cmpUnitAI)
		{
			const target = this.FindClosestTriggerPoint(u, triggerPointArcherRetreat);
			const target_pos = TriggerHelper.GetEntityPosition2D(target);

			ProcessCommand(2, {
				"type": "walk",
				"entities": [u],
				"x": target_pos.x,
				"z": target_pos.y,
				"queued": false,
				"targetClasses": {
					"attack": unitTargetClass
				},
				"allowCapture": false
			});
		}

	}
};


Trigger.prototype.ArchersAdvanceCommand = function(data)
{
	// find all archers by player 2
	const units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(2), "Archer").filter(TriggerHelper.IsInWorld);

	for (const u of units)
	{
		const cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
		if (cmpUnitAI)
		{
			this.WalkAndFightClosestTarget(u, 1, unitTargetClass);
		}

	}
};


Trigger.prototype.StructureDecayCheck = function(data)
{
	// warn("structure decay check");
	for (const p of [1, 2, 3, 4, 5])
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


Trigger.prototype.GarrisonShips = function(data)
{
	const trade_ships = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "Ship+Trader").filter(TriggerHelper.IsInWorld);

	for (const u of trade_ships)
	{
		// 3 cavalry
		TriggerHelper.SpawnGarrisonedUnits(u, "units/mace/champion_cavalry", 3, 1);

		// 2 javelin cavalry
		TriggerHelper.SpawnGarrisonedUnits(u, "units/mace/cavalry_javelineer_e", 2, 1);
	}

	const fish_ships = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "Ship+!Trader").filter(TriggerHelper.IsInWorld);

	for (const u of fish_ships)
	{
		// 1 infantry
		TriggerHelper.SpawnGarrisonedUnits(u, "units/mace/champion_infantry_spearman", 3, 1);
	}

};

Trigger.prototype.FleetMovementCommand = function(data)
{
	// find all ships by player 1
	const ships = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "Ship").filter(TriggerHelper.IsInWorld);

	// warn("Found "+ships.length+" ships");

	// for each, find closest trigger point and head there
	for (const u of ships)
	{
		const cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
		if (cmpUnitAI)
		{
			const target = this.FindClosestTriggerPoint(u, triggerPointBeach);
			// warn("sending to "+uneval(target));
			// cmpUnitAI.WalkToTarget(target,false);

			const target_pos = TriggerHelper.GetEntityPosition2D(target);

			ProcessCommand(1, {
				"type": "walk",
				"entities": [u],
				"x": target_pos.x,
				"z": target_pos.y,
				"queued": true,
				"targetClasses": {
					"attack": unitTargetClass
				},
				"allowCapture": false
			});
		}

	}
};

{
	const cmpTrigger = Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger);

	// state variables
	cmpTrigger.riverCrossed = false; // flips to true once you unload units on the other side
	cmpTrigger.archersKilled = 0;
	cmpTrigger.archersRetreatThreshold = 100;
	cmpTrigger.archersRetreated = false;
	cmpTrigger.boatCommandTriggered = false;
	cmpTrigger.cavalryAttacksTriggered = false;
	cmpTrigger.dirichletParam = 0.175;
	cmpTrigger.dirichletParamDecay = 0.985;
	cmpTrigger.dirichletParamMin = 0.025;
	cmpTrigger.cavalryAttackInterval = 15;
	cmpTrigger.cavalryAttackIntervalDecay = 0.985;
	cmpTrigger.cavalryAttackCounter = 0;


	// start techs
	cmpTrigger.DoAfterDelay(1 * 1000, "ResearchTechs", null);

	// garrison entities
	// cmpTrigger.DoAfterDelay(5 * 1000,"GarrisonEntities",null);

	// debug
	// cmpTrigger.DoAfterDelay(5 * 1000,"FleetMovementCommand",null);
	// cmpTrigger.DoAfterDelay(5 * 1000,"ArchersRetreatCommand",null);
	// cmpTrigger.DoAfterDelay(5 * 1000,"SpawnCavalryAttack",null);
	// cmpTrigger.DoAfterDelay(5 * 1000,"SpawnCatapults",null);
	cmpTrigger.DoAfterDelay(1 * 1000, "GarrisonShips", null);

	const cmpModifiersManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_ModifiersManager);

	for (const p of [1, 2])
	{
		const cmpPlayer = QueryPlayerIDInterface(p);

		// for players 3,4,5,6 disable templates

		if (true) // disable civil centres
		{

			const disTemplates = ["structures/" + QueryPlayerIDInterface(p, IID_Identity).GetCiv() + "/civil_centre", "structures/" + QueryPlayerIDInterface(p, IID_Identity).GetCiv() + "/dock"];

			cmpPlayer.SetDisabledTemplates(disTemplates);
		}

		const cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);

		cmpTechnologyManager.ResearchTechnology("phase_town_generic");
		cmpTechnologyManager.ResearchTechnology("phase_city_generic");



		if (p == 1)
		{
			cmpTechnologyManager.ResearchTechnology("unlock_shared_los");
			cmpPlayer.SetPopulationBonuses(400);

			// improve healing
			cmpModifiersManager.AddModifiers("Healer Rate Bonus", {
				"Heal/Interval": [{ "affects": ["Healer"], "multiply": 0.5 }],
			}, cmpPlayer.entity);

			cmpModifiersManager.AddModifiers("Healer Range Bonus", {
				"Heal/Range": [{ "affects": ["Healer"], "multiply": 1.5 }],
			}, cmpPlayer.entity);

			cmpModifiersManager.AddModifiers("Healer Vision Bonus", {
				"Vision/Range": [{ "affects": ["Healer"], "multiply": 1.5 }],
			}, cmpPlayer.entity);

			// siege attack interval
			cmpModifiersManager.AddModifiers("Siege Rate Bonus", {
				"Attack/Ranged/RepeatTime": [{ "affects": ["Siege"], "multiply": 0.5 }],
			}, cmpPlayer.entity);
			cmpModifiersManager.AddModifiers("Siege Prepare Bonus", {
				"Attack/Ranged/PrepareTime": [{ "affects": ["Siege"], "multiply": 0.5 }],
			}, cmpPlayer.entity);

			cmpModifiersManager.AddModifiers("Fish Garrison Bonus", {
				"GarrisonHolder/Max": [{ "affects": ["Ship+!Trader"], "add": 2 }],
			}, cmpPlayer.entity);

			cmpModifiersManager.AddModifiers("Pop", {
				"Player/MaxPopulation": [{ "add": 100 }],
			}, cmpPlayer.entity);


		}
		else if (p == 2)
		{
			cmpPlayer.SetPopulationBonuses(300);
		}
	}

	cmpTrigger.RegisterTrigger("OnInterval", "IdleUnitCheck", {
		"enabled": true,
		"delay": 60 * 1000,
		"interval": 60 * 1000,
	});

	cmpTrigger.RegisterTrigger("OnInterval", "StructureDecayCheck", {
		"enabled": true,
		"delay": 10 * 1000,
		"interval": 10 * 1000,
	});

	// Activate all possible triggers
	const data = { "enabled": true };

	cmpTrigger.RegisterTrigger("OnRange", "RangeActionRiverCrossing", {
		"entities": cmpTrigger.GetTriggerPoints("A"), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 25,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});

	// cmpTrigger.RegisterTrigger("OnStructureBuilt", "StructureBuiltAction", data);
	cmpTrigger.RegisterTrigger("OnOwnershipChanged", "OwnershipChangedAction", data);

	/* cmpTrigger.DoAfterDelay(300 * 1000,"SpawnAlliedInvasionAttack",null);*/



}
