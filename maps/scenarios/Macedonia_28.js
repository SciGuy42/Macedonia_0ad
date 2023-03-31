warn("loading the triggers file");

// /////////////////////
// Trigger listeners //
// /////////////////////


var unitTargetClass = "Unit+!Ship";
var siegeTargetClass = "Structure";


var triggerPointPatrolA = "A";
var triggerPointPatrolB = "B";
var triggerPointPatrolMountainWest = "K";
var triggerPointPatrolMountainMiddle = "J";
var triggerPointPatrolMountainEast = "I";
var triggerPointRaid = "G";



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
	if (data.from == 2 && data.to == -1)
	{
		// with smalll chance, some of the mountains patrols engage
		const id = Engine.QueryInterface(data.entity, IID_Identity);
		if (id != null && id.classesList.includes("Structure") && !id.classesList.includes("Foundation"))
		{
			// warn("Player 2 lost a structure!");

			// with small probability, send archers from players 4 and 5 on the attack
			if (Math.random() < 1.0)
			{
				// archer attack
				for (const p of [4, 5])
				{
					const archers_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Archer").filter(TriggerHelper.IsInWorld);
					//	warn("Found "+archers_p.length+" archers of player "+p);

					const attack_size = Math.round(archers_p.length / 3);
					const archers_response_squad = [];

					if (attack_size <= archers_p.length)
					{
						for (let i = 0; i < attack_size; i++)
							archers_response_squad.push(archers_p[i]);

						// warn("attacking archers = "+uneval(archers_response_squad));

						for (const u of archers_response_squad)
						{
							var cmpTargetPosition = Engine.QueryInterface(data.entity, IID_Position).GetPosition2D();
							const cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
							cmpUnitAI.SwitchToStance("violent");
							cmpUnitAI.WalkAndFight(cmpTargetPosition.x, cmpTargetPosition.y, null);

						}
					}
				}
			}
		}
	}

	// check if apa or ma camps
	if ((data.from == 5 || data.from == 4) && (data.to == -1 || data.to == 1))
	{
		const id = Engine.QueryInterface(data.entity, IID_Identity);
		if (id != null && id.classesList.includes("MercenaryCamp"))
		{
			// warn("Camp destroyed!");
			const num_attack_squads = 2;

			for (let i = 0; i < num_attack_squads; i++)
			{

				this.DoAfterDelay(((i * 20) + 1) * 1000, "SpawnSiegeAttackSquad", null);
			}
		}
	}

	// if structure captured, it gets destroyed
	if ((data.from == 2 || data.from == 5 || data.from == 4) && data.to == 1)
	{
		const health_u = Engine.QueryInterface(data.entity, IID_Health);

		if (health_u)
			health_u.Kill();
		else
		{
			Engine.DestroyEntity(data.entity);
		}

	}
};

Trigger.prototype.PlayerCommandAction = function(data)
{
	// warn("The OnPlayerCommand event happened with the following data:");
	// warn(uneval(data));
};




// garison AI entities with archers
Trigger.prototype.GarrisonEntities = function(data)
{

	for (const p of [4, 5, 6])
	{
		const towers_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "StoneTower").filter(TriggerHelper.IsInWorld);

		const owner = 7;

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

		// camps
		const camps_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "MercenaryCamp").filter(TriggerHelper.IsInWorld);

		for (const c of camps_p)
		{
			// spawn the garrison inside the tower
			const archers_e = TriggerHelper.SpawnUnits(c, "units/pers/kardakes_hoplite", 10, p);

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
		// warn(uneval(animals));
		const horses = [];

		for (const a of animals)
		{
			const id = Engine.QueryInterface(a, IID_Identity);
			// warn(uneval(id));
			// warn(uneval(id.template));
			if (id.template.SpecificName == "Equus ferus caballus")
			{
				// warn("Found horse");
				horses.push(a);
			}
		}
		// warn(uneval(horses));

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



Trigger.prototype.IdleUnitCheck = function(data)
{
	this.idleCheckCounter += 1;

	// check if we need to register trigger
	// warn("checking trigger...");

	if (this.ownTriggerStarted == null)
	{
		this.ownTriggerStarted = true;
		const data = { "enabled": true };
		this.RegisterTrigger("OnOwnershipChanged", "OwnershipChangedAction", data);
		// warn("started ownership changed trigger");
	}


	// find idle hunters
	for (const p of [4, 5])
	{
		const units_cav = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Javelin").filter(TriggerHelper.IsInWorld);

		// warn("Found "+units_cav.length+" javelins");

		// hunters
		for (const u of units_cav)
		{
			const cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI)
			{
				if (cmpUnitAI.IsIdle())
				{
					// warn("Found idle soldier");
					this.WalkAndGatherClosestTarget(u, 0, "Animal");
				}
			}
		}

		// check other cavalry
		const units_cav_soldiers = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Cavalry+!Javelin").filter(TriggerHelper.IsInWorld);

		for (const u of units_cav_soldiers)
		{
			const cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI)
			{
				if (cmpUnitAI.IsIdle())
				{
					// send to patrol
					if (p == 4)
					{
						this.PatrolOrderList([u], p, this.GetTriggerPoints(triggerPointPatrolA));
					}
					else if (p == 5)
					{
						this.PatrolOrderList([u], p, this.GetTriggerPoints(triggerPointPatrolB));
					}
				}
			}
		}

		// check infantry
		const units_inf = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Infantry").filter(TriggerHelper.IsInWorld);

		for (const u of units_inf)
		{
			const cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI)
			{
				if (cmpUnitAI.IsIdle())
				{
					if (p == 4)
					{
						// pick points to patrol
						const patrol_points = this.pickRandomK(this.GetTriggerPoints(triggerPointPatrolMountainWest), 5);

						this.PatrolOrderList([u], p, patrol_points);

					}
					else if (p == 5)
					{
						let patrol_points = [];
						if (Math.random() < 0.5)
							patrol_points = this.pickRandomK(this.GetTriggerPoints(triggerPointPatrolMountainMiddle), 5);
						else
							patrol_points = this.pickRandomK(this.GetTriggerPoints(triggerPointPatrolMountainEast), 5);

						this.PatrolOrderList([u], p, patrol_points);

					}
				}
			}
		}


		/* let units_siege = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Siege").filter(TriggerHelper.IsInWorld);
		let units_ele = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Elephant").filter(TriggerHelper.IsInWorld);

		let units_all = units_inf.concat(units_cav,units_siege,units_ele);

		for (let u of units_all)
		{
			let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI)
			{
				if (cmpUnitAI.IsIdle()){
					//warn("Found idle soldier");
					this.WalkAndFightClosestTarget(u,target_p,unitTargetClass);
				}
			}
		}*/
	}

	for (const p of [6])
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

		if (!subset.includes(next))
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
	// warn("Ma # structures: "+structures.length);

	if (structures.length == 0)
	{
		return; // no more structures, must be defeated
	}

	// choose spawn site
	const site = pickRandom(structures);

	// templates, mostly archers
	// let cav_templates = ["units/pers/cavalry_axeman_e","units/pers/cavalry_spearman_e","units/pers/cavalry_javelineer_e","units/pers/cavalry_archer_e","units/pers/champion_cavalry"];
	const cav_templates = ["units/pers/cavalry_axeman_e", "units/pers/cavalry_spearman_e", "units/pers/cavalry_javelineer_e", "units/pers/cavalry_archer_e", "units/pers/champion_cavalry"];

	// see if we have room to spawn more
	const cmpPlayer = QueryPlayerIDInterface(p);
	const pop = cmpPlayer.GetPopulationCount();
	// warn(pop);

	const cav_units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Cavalry").filter(TriggerHelper.IsInWorld);

	if (cav_units.length < this.maxSacaCav)
	{
		const patrol_size = 5 + Math.round(structures.length / 2);
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
	// warn("Apa # structures: "+structures.length);
	if (structures.length == 0)
	{
		return; // no more structures, must be defeated
	}

	// choose spawn site
	const site = pickRandom(structures);

	// templates, mostly archers
	const cav_templates = ["units/pers/cavalry_axeman_e", "units/pers/cavalry_spearman_e", "units/pers/cavalry_javelineer_e", "units/pers/cavalry_archer_e", "units/pers/champion_cavalry"];

	// see if we have room to spawn more
	const cmpPlayer = QueryPlayerIDInterface(p);

	const cav_units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Cavalry").filter(TriggerHelper.IsInWorld);

	if (cav_units.length < this.maxSacaCav)
	{
		const patrol_size = 5 + Math.round(structures.length / 2);
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

	const num_squads = 2 + Math.round((structures_p4.length + structures_p5.length) / 2);
	// warn("spawning "+num_squads+" attack squads");

	for (let i = 0; i < num_squads; i++)
	{
		this.DoAfterDelay((i * 5) * 1000, "SpawnCavalryRaidSquad", null);
	}

	// repeat after 6 minutes
	this.DoAfterDelay(360 * 1000, "SpawnCavalryRaid", null);

};


Trigger.prototype.SpawnSiegeAttackSquad = function(data)
{
	const p = 6;

	// warn("spawning siege attack squad");

	// check if spawn site exists
	const structures = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(2), "CivilCentre").filter(TriggerHelper.IsInWorld);

	if (structures.length == 0)
		return;

	// pick spawn site
	const spawn_site = pickRandom(structures);

	// templates
	const cav_templates = ["units/pers/cavalry_axeman_e", "units/pers/cavalry_spearman_e", "units/pers/cavalry_javelineer_e", "units/pers/cavalry_archer_e", "units/pers/champion_cavalry", "units/pers/champion_chariot"];
	const infantry_templates = ["units/pers/arstibara", "units/pers/champion_infantry", "units/pers/kardakes_hoplite", "units/pers/kardakes_skirmisher", "units/pers/infantry_archer_e"];
	const siege_templates = ["units/pers/siege_ram"];

	const num_cav = 8 + Math.round(Math.random() * 4);
	const num_inf = 20 + Math.round(Math.random() * 6);
	const num_siege = 4;
	const attackers = [];

	// spawn attackers
	for (let i = 0; i < num_cav; ++i)
	{
		const units_i = TriggerHelper.SpawnUnits(spawn_site, pickRandom(cav_templates), 1, p);
		attackers.push(units_i[0]);
	}
	for (let i = 0; i < num_inf; ++i)
	{
		const units_i = TriggerHelper.SpawnUnits(spawn_site, pickRandom(infantry_templates), 1, p);
		attackers.push(units_i[0]);
	}
	for (let i = 0; i < num_siege; ++i)
	{
		const units_i = TriggerHelper.SpawnUnits(spawn_site, pickRandom(siege_templates), 1, p);
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

Trigger.prototype.SpawnCavalryRaidSquad = function(data)
{
	const p = 6;
	const structures = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Structure").filter(TriggerHelper.IsInWorld);

	if (structures.length == 0)
		return;

	// pick spawn site
	const spawn_site = pickRandom(this.GetTriggerPoints(triggerPointRaid));

	// templates
	const cav_templates = ["units/pers/cavalry_axeman_e", "units/pers/cavalry_spearman_e", "units/pers/cavalry_javelineer_e", "units/pers/cavalry_archer_e", "units/pers/champion_cavalry", "units/pers/champion_chariot"];

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

Trigger.prototype.CavalryAttack = function(data)
{
	// check if we have structures left, if not, end
	const p = 5;
	const structures = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Structure").filter(TriggerHelper.IsInWorld);

	if (structures.length == 0)
		return;

	// pick spawn site
	const spawn_site = pickRandom(this.GetTriggerPoints(triggerPointCavalryAttack));

	// how big should the attack be
	const min_size = 20;
	const units_1 = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "Unit").filter(TriggerHelper.IsInWorld);

	let num_attackers = Math.floor(units_1.length / 7.0);
	if (num_attackers < min_size)
		num_attackers = min_size;

	// types
	const cav_templates = TriggerHelper.GetTemplateNamesByClasses("Cavalry", "kush", undefined, undefined, true);
	const attackers = [];

	// spawn attackers
	for (let i = 0; i < num_attackers; ++i)
	{
		const units_i = TriggerHelper.SpawnUnits(spawn_site, pickRandom(cav_templates), 1, p);
		attackers.push(units_i[0]);
	}

	// attack
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


Trigger.prototype.DiplomacyStatusCheck = function(data)
{
	if (this.warStarted == false)
	{
		const forts = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "Fortress+!Foundation").filter(TriggerHelper.IsInWorld);
		const towers = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "StoneTower+!Foundation").filter(TriggerHelper.IsInWorld);

		if (forts.length >= 3 && towers.length >= 6)
		{
			this.warStarted = true;

			for (const p of [2, 4, 5])
			{
				const cmpPlayer = QueryPlayerIDInterface(p);
				cmpPlayer.SetEnemy(1);
			}

			const cmpPlayer = QueryPlayerIDInterface(1);
			cmpPlayer.SetEnemy(2);
			cmpPlayer.SetEnemy(4);
			cmpPlayer.SetEnemy(5);

			this.DoAfterDelay(5 * 1000, "SpawnWestMountainPatrol", null);
			this.DoAfterDelay(6 * 1000, "SpawnMiddleMountainPatrol", null);
			this.DoAfterDelay(7 * 1000, "SpawnEastMountainPatrol", null);


			// warn("WAR STARTED");
			this.ShowText("Our scouts have some disturbing news to report! The Sogdians and the Sacae are now in open rebellion against us! We must destroy the Sogdian settlement and all posts and tents set up by the Ma and Apa Saka!", "I knew it!", "OK");

			// repeat after 6 minutes
			this.DoAfterDelay(360 * 1000, "SpawnCavalryRaid", null);

		}
		else
		{
			this.DoAfterDelay(3 * 1000, "DiplomacyStatusCheck", null);
		}

	}

};


Trigger.prototype.ResearchTechs = function(data)
{
	for (const p of [1, 2, 4, 5, 6])
	{

		const cmpPlayer = QueryPlayerIDInterface(p);
		const cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);

		if (p == 2)
		{
			// give some trade gains
			cmpTechnologyManager.ResearchTechnology("trade_gain_01");
			cmpTechnologyManager.ResearchTechnology("trade_gain_01");
			cmpTechnologyManager.ResearchTechnology("trade_gain_01");
		}
		else if (p == 4 || p == 5 || p == 6)
		{
			// infantry archer and cav tech
			cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_01");
			cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_01");
			cmpTechnologyManager.ResearchTechnology("soldier_resistance_pierce_01");
			cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_01");


		}

	}
	// cmpTechnologyManager.ResearchTechnology("trade_gain_02");
	// cmpTechnologyManager.ResearchTechnology("trade_gain_02");
	// cmpTechnologyManager.ResearchTechnology("trade_gain_02");

};


Trigger.prototype.VictoryTextFn = function(n)
{
	return markForPluralTranslation(
		"%(lastPlayer)s has won (game mode).",
		"%(players)s and %(lastPlayer)s have won (game mode).",
		n);
};


// attack against captured gaia fortress
Trigger.prototype.VictoryCheck = function(data)
{
	// check for camps and civil centres
	const ccs = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(2), "CivilCentre").filter(TriggerHelper.IsInWorld);

	const camps_ma = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(4), "MercenaryCamp").filter(TriggerHelper.IsInWorld);

	const camps_apa = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(5), "MercenaryCamp").filter(TriggerHelper.IsInWorld);

	// warn(uneval(ccs));
	// warn(uneval(camps_ma));
	// warn(uneval(camps_apa));

	if (ccs.length == 0 && camps_ma.length == 0 && camps_apa.length == 0)
	{
		TriggerHelper.SetPlayerWon(1, this.VictoryTextFn, this.VictoryTextFn);
	}
};



{
	const cmpTrigger = Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger);


	// some templates

	// some variables
	cmpTrigger.maxSacaCav = 200;
	cmpTrigger.maxSacaInf = 150;

	// some state variables
	cmpTrigger.warStarted = false;

	// garrison towers
	cmpTrigger.DoAfterDelay(5 * 1000, "GarrisonEntities", null);

	// some patrols
	cmpTrigger.DoAfterDelay(5 * 1000, "SpawnMaPatrol", null);
	cmpTrigger.DoAfterDelay(5 * 1000, "SpawnApaPatrol", null);

	// start techs
	// cmpTrigger.DoAfterDelay(1 * 1000,"ResearchTechs",null);


	// debug - this only happens once they become hostile
	// cmpTrigger.DoAfterDelay(5 * 1000,"SpawnCavalryRaid",null);


	// check whether to start war
	cmpTrigger.DoAfterDelay(30 * 1000, "DiplomacyStatusCheck", null);


	// set diplomacy
	// everyone is neutral towards 3 and 1
	for (const p of [2, 4, 5])
	{
		const cmpPlayer = QueryPlayerIDInterface(p);
		cmpPlayer.SetNeutral(1);
		cmpPlayer.SetNeutral(3);
		cmpPlayer.SetNeutral(6);
	}

	// everyone else is neutral towards 2,4,5
	for (const p of [1, 3])
	{
		const cmpPlayer = QueryPlayerIDInterface(p);
		cmpPlayer.SetNeutral(2);
		cmpPlayer.SetNeutral(4);
		cmpPlayer.SetNeutral(5);
	}

	// 1 and 3 are neutral
	let cmpPlayer = QueryPlayerIDInterface(1);
	cmpPlayer.SetAlly(3);
	cmpPlayer = QueryPlayerIDInterface(3);
	cmpPlayer.SetAlly(1);

	// 6 is neutral towards everyone but player 1
	cmpPlayer = QueryPlayerIDInterface(6);
	for (const p of [2, 3, 4, 5])
	{
		cmpPlayer.SetNeutral(p);
	}

	const cmpModifiersManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_ModifiersManager);


	for (const p of [1, 2, 3, 4, 5])
	{
		cmpPlayer = QueryPlayerIDInterface(p);

		// for players 3,4,5,6 disable templates

		// disable civil centres

		// disable buildings production
		// let disTemplates = disabledTemplates(QueryPlayerIDInterface(p, IID_Identity).GetCiv());

		// disable units as well
		// let unit_templaes = TriggerHelper.GetTemplateNamesByClasses("Unit", QueryPlayerIDInterface(p, IID_Identity).GetCiv(), undefined, undefined, true);

		// disTemplates = disTemplates.concat(unit_templaes);

		const disTemplates = ["structures/" + QueryPlayerIDInterface(p, IID_Identity).GetCiv() + "/civil_centre", "structures/" + QueryPlayerIDInterface(p, IID_Identity).GetCiv() + "/dock"];

		cmpPlayer.SetDisabledTemplates(disTemplates);
		// warn("Disabling templates for player "+uneval(p));


		const cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);

		cmpTechnologyManager.ResearchTechnology("phase_town_generic");
		cmpTechnologyManager.ResearchTechnology("phase_city_generic");

		if (p != 1)
		{
			cmpTechnologyManager.ResearchTechnology("trade_commercial_treaty");
			cmpTechnologyManager.ResearchTechnology("trade_gain_01");
			cmpTechnologyManager.ResearchTechnology("trade_gain_02");
		}

		if (p == 1)
		{
			cmpTechnologyManager.ResearchTechnology("unlock_shared_los");
			cmpPlayer.SetPopulationBonuses(300);
		}
		else if (p == 6)
		{
			cmpPlayer.SetPopulationBonuses(300);
		}

		// trade bonus for player 2
		if (p == 2)
		{
			cmpModifiersManager.AddModifiers("AI Bonus", {
				"Trader/GainMultiplier": [{ "affects": ["Trader"], "multiply": 3.0 }],
			}, cmpPlayer.entity);
		}

		// give some resistance to some of the enemies
		if (p == 4 || p == 5 || p == 6)
		{
			cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_01");
			cmpTechnologyManager.ResearchTechnology("soldier_resistance_pierce_01");
		}
	}


	cmpTrigger.RegisterTrigger("OnInterval", "StructureDecayCheck", {
		"enabled": true,
		"delay": 5 * 1000,
		"interval": 5 * 1000,
	});

	cmpTrigger.RegisterTrigger("OnInterval", "HorseCheck", {
		"enabled": true,
		"delay": 1 * 1000,
		"interval": 60 * 1000,
	});

	cmpTrigger.idleCheckCounter = 0;
	cmpTrigger.RegisterTrigger("OnInterval", "IdleUnitCheck", {
		"enabled": true,
		"delay": 1 * 1000,
		"interval": 60 * 1000,
	});

	cmpTrigger.RegisterTrigger("OnInterval", "VictoryCheck", {
		"enabled": true,
		"delay": 5 * 1000,
		"interval": 15 * 1000,
	});



	// Activate all possible triggers
	const data = { "enabled": true };
	// cmpTrigger.RegisterTrigger("OnStructureBuilt", "StructureBuiltAction", data);
	// cmpTrigger.RegisterTrigger("OnOwnershipChanged", "OwnershipChangedAction", data);

	/* cmpTrigger.DoAfterDelay(300 * 1000,"SpawnAlliedInvasionAttack",null);*/



}
