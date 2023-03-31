warn("loading the triggers file");

// /////////////////////
// Trigger listeners //
// /////////////////////


var unitTargetClass = "Unit+!Ship";
var siegeTargetClass = "Structure";


var triggerPointNorth = "B";
var triggerPointSouth = "A";
var triggerPointArc = "K";
var triggerPointAch = "J";



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
	warn("The OnStructureBuilt event happened with the following data:");
	warn(uneval(data));
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


Trigger.prototype.SpecialAchaeanAssault = function(data)
{
	const owner = 5;
	const target_player = 1;

	// south side -- some infantry
	const num_infantry = 40;

	for (let i = 0; i < num_infantry; i++)
	{
		// spawn unit
		const triggerPoint = pickRandom(this.GetTriggerPoints(triggerPointAch));

		const units_i = TriggerHelper.SpawnUnits(triggerPoint, pickRandom(this.achaeanAttackTemplates), 1, owner);

		// make it fight
		this.WalkAndFightClosestTarget(units_i[0], target_player, "Unit");
	}
};

Trigger.prototype.SpecialArcadianAssault = function(data)
{
	const owner = 6;
	const target_player = 1;

	// south side -- some infantry
	const num_infantry = 30;

	for (let i = 0; i < num_infantry; i++)
	{
		// spawn unit
		const triggerPoint = pickRandom(this.GetTriggerPoints(triggerPointArc));

		const units_i = TriggerHelper.SpawnUnits(triggerPoint, pickRandom(this.arcadiaAttackTemplates), 1, owner);

		// make it fight
		this.WalkAndFightClosestTarget(units_i[0], target_player, "Unit");
	}
};

Trigger.prototype.OwnershipChangedAction = function(data)
{
	if (this.specialAttackTriggered == false)
	{
		if ((data.from == 5 || data.from == 6) && data.to == -1)
		{
			// check if structure
			const id = Engine.QueryInterface(data.entity, IID_Identity);
			// warn(uneval(id));
			if (id != null && id.classesList.includes("Structure"))
			{
				if (data.from == 5)
				{
					// spawn attack from player 6
					this.DoAfterDelay(5 * 1000, "SpecialArcadianAssault", null);
					this.specialAttackTriggered = true;

				}
				else if (data.from == 6)
				{
					// spawn attack from player 5
					this.DoAfterDelay(5 * 1000, "SpecialAchaeanAssault", null);
					this.specialAttackTriggered = true;
				}
			}
		}
	}


	/* warn("The OnOwnershipChanged event happened with the following data:");
	warn(uneval(data));

	if (data.from == 5 && data.to == -1)
	{
		const id = Engine.QueryInterface(data.entity, IID_Identity);
		if (id.classesList.includes("Fortress"))
		{
			warn("Fortress destroyed!");
			this.CavalryAttack();
		}
	}*/

	// let id = Engine.QueryInterface(data.entity, IID_Identity);
	// warn(uneval(id));

	/* if (data.from == 0 && data.to == 1)
	{
		const id = Engine.QueryInterface(data.entity, IID_Identity);
		warn(uneval(id));

		if (id.classesList.includes("Embassy"))
		{
			// captured camp, spawn some balistas
			TriggerHelper.SpawnUnits(data.entity, "units/mace/siege_oxybeles_packed", 8, 1);

			// spawn the princess
			TriggerHelper.SpawnUnits(data.entity, "units/kush/hero_amanirenas", 1, 1);
		}
		else if (id.classesList.includes("Pyramid"))
		{
			const cmpPlayer = QueryPlayerIDInterface(1);
			const cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);

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



Trigger.prototype.InvasionRangeAction = function(data)
{
	// warn("The Invasion OnRange event happened with the following data:");
	// warn(uneval(data));

	if (this.invasion_under_way == true)
	{
		const cmpGarrisonHolder = Engine.QueryInterface(this.invasion_ship, IID_GarrisonHolder);

		if (cmpGarrisonHolder)
		{
			const humans = TriggerHelper.MatchEntitiesByClass(cmpGarrisonHolder.GetEntities(), "Human");
			const siegeEngines = TriggerHelper.MatchEntitiesByClass(cmpGarrisonHolder.GetEntities(), "Siege");
			if (humans.length > 0 || siegeEngines.length > 0)
			{
				warn("Unloading");
				cmpGarrisonHolder.UnloadAll();
			}
			else if (humans.length == 0 && siegeEngines == 0)
			{
				warn("Done unloading");

				// send units to attack -- idle unit check will take care of this

				// send ship to attack
				// get possible list of dock targets
				const dock_targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "Dock").filter(TriggerHelper.IsInWorld);
				const ship_targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "Ship").filter(TriggerHelper.IsInWorld);

				const targets = dock_targets.concat(ship_targets);

				// order attack
				if (targets.length > 0)
				{
					const p = 6;
					ProcessCommand(p, {
						"type": "attack",
						"entities": [this.invasion_ship],
						"target": pickRandom(targets),
						"queued": false,
						"allowCapture": false
					});
				}

				// clear variables and schedule next attack
				this.invasion_under_way = false;
				this.ship_invasion_garrison = undefined;
				this.invasion_ship = undefined;

				// schedule next attack
				this.carthageInvasionAttackInterval = Math.floor(0.975 * this.carthageInvasionAttackInterval);
				if (this.carthageInvasionShipGarrisonSize < 49)
					this.carthageInvasionShipGarrisonSize += 2;

				warn("Next invasion in " + uneval(this.carthageInvasionAttackInterval));
				this.DoAfterDelay(this.carthageInvasionAttackInterval * 1000, "SpawnNavalInvasionAttack", null);


			}
		}
	}
};

Trigger.prototype.checkInvasionAttack = function(data)
{
	if (this.invasion_under_way == true)
	{
		const cmpUnitAI = Engine.QueryInterface(this.invasion_ship, IID_UnitAI);
		if (cmpUnitAI)
		{
			warn(uneval(cmpUnitAI.order));
			if (!cmpUnitAI.order)
			{
				warn("assigning order to ship");
				// send ship
				cmpUnitAI.Walk(this.ungarrisonPos.x, this.ungarrisonPos.y, true);
			}
			else if (cmpUnitAI.order.type != "Walk")
			{
				warn("assigning order to ship");
				// send ship
				cmpUnitAI.Walk(this.ungarrisonPos.x, this.ungarrisonPos.y, true);

			}
		}
		else
		{
			// ship must have been destroyed
			this.invasion_under_way = false;
		}
	}
};

// spawn naval attack
Trigger.prototype.SpawnNavalInvasionAttack = function(data)
{
	if (this.invasion_under_way == true)
	{
		warn("invasion attack ordered when already one is going on");
		this.DoAfterDelay(300 * 1000, "SpawnAlliedInvasionAttack", null);
		return;
	}


	// check if carthage has docks
	const have_docks = false;
	const spawn_docks = [];
	const docks_e = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(6), "Dock").filter(TriggerHelper.IsInWorld);

	if (docks_e.length < 1)
		return;


	// decide how many ships to spawn and where
	const spawn_site = pickRandom(docks_e);
	const owner = 6;
	const attacker_ships = [];

	// let ship_spawned = TriggerHelper.SpawnUnits(spawn_site,this.spawn_ship_templates[1],1,owner);
	const ship_spawned = TriggerHelper.SpawnUnits(spawn_site, "units/cart/ship_quinquereme", 1, owner);
	const ship_invasion_garrison = [];

	// spawn the invasion force inside the ship
	for (let j = 0; j < this.carthageInvasionShipGarrisonSize; ++j)
	{
		const u_j = TriggerHelper.SpawnGarrisonedUnits(ship_spawned[0], pickRandom(this.cartAttackerTypes), 1, owner);
		ship_invasion_garrison.push(u_j);
	}

	// make sure the unit has no orders, for some reason after garissoning, the order queue is full of pick up orders
	const cmpUnitAI = Engine.QueryInterface(ship_spawned[0], IID_UnitAI);
	cmpUnitAI.orderQueue = [];
	cmpUnitAI.order = undefined;
	cmpUnitAI.isIdle = true;

	attacker_ships.push(ship_spawned[0]);

	const ungarrison_point = pickRandom(this.GetTriggerPoints(triggerPointShipInvasion));
	const ungarrisonPos = TriggerHelper.GetEntityPosition2D(ungarrison_point);
	warn(uneval(ungarrisonPos));

	this.invasion_under_way = true;
	this.invasion_ship = ship_spawned[0];
	this.ship_invasion_garrison = ship_invasion_garrison;
	this.ungarrisonPos = ungarrisonPos;

	// send ship
	cmpUnitAI.Walk(ungarrisonPos.x, ungarrisonPos.y, true);


	// this.DoAfterDelay(300 * 1000,"SpawnAlliedInvasionAttack",null);

};


// garison AI entities with archers
Trigger.prototype.GarrisonEntities = function(data)
{

	for (const p of [4, 5, 6, 7])
	{
		const towers_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "StoneTower").filter(TriggerHelper.IsInWorld);

		for (const e of towers_p)
		{
			// spawn the garrison inside the tower
			const archers_e = TriggerHelper.SpawnUnits(e, "units/athen/champion_infantry", 5, p);

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
			const archers_e = TriggerHelper.SpawnUnits(c, "units/athen/champion_ranged", 5, p);

			for (const a of archers_e)
			{
				const cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(c, true);
			}
		}
	}
};


Trigger.prototype.IdleUnitCheck = function(data)
{
	for (const p of [6])
	{
		const target_p = 1;

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

// garison AI entities with archers
Trigger.prototype.SpawnFortressPatrol = function(data)
{
	// which player
	const p = 5;

	// spawn random infantry next to a cc
	const ccs = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Fortress").filter(TriggerHelper.IsInWorld);

	if (ccs.length == 0)
		return;

	// calculate size of spawn units
	const num_patrols = 10;
	const patrol_size = 5;

	const inf_templates = ["units/kush/champion_infantry_amun", "units/kush/champion_infantry_archer", "units/kush/champion_infantry_apedemak"];

	// spawn infantry
	for (let j = 0; j < num_patrols; j++)
	{
		const units = [];
		const site_j = pickRandom(ccs);

		// melee
		for (let i = 0; i < patrol_size; i++)
		{
			const unit_i = TriggerHelper.SpawnUnits(site_j, pickRandom(inf_templates), 1, p);
			units.push(unit_i[0]);
		}

		// set formation
		TriggerHelper.SetUnitFormation(p, units, pickRandom(unitFormations));


		// send to patrol
		this.PatrolOrder(units, p);

	}

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

Trigger.prototype.ArcadianAttack = function(data)
{
	// check if we have camps
	const p = 6;
	const structures = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "MercenaryCamp").filter(TriggerHelper.IsInWorld);

	if (structures.length == 0)
		return;

	const spawn_site = pickRandom(structures);

	const num_attackers = this.arcadiaAttackLevel;
	const attackers = [];

	// spawn attackers
	for (let i = 0; i < num_attackers; ++i)
	{

		if (Math.random() < 1.0 - this.arcadiaSiegeProb)
		{
			const units_i = TriggerHelper.SpawnUnits(spawn_site, pickRandom(this.arcadiaAttackTemplates), 1, p);
			attackers.push(units_i[0]);
		}
		else
		{
			// siege
			const units_i = TriggerHelper.SpawnUnits(spawn_site, "units/mace/siege_lithobolos_packed", 1, p);
			attackers.push(units_i[0]);
		}
	}


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

	const next_attack_interval_sec = this.arcadiaAttackInterval + Math.floor(Math.random() * 120);
	// warn("Next attack = " + uneval(next_attack_interval_sec));
	this.arcadiaAttackLevel += 4;

	this.DoAfterDelay(next_attack_interval_sec * 1000, "ArcadianAttack", null);
};


Trigger.prototype.AchaeanAttack = function(data)
{
	// check if we have camps
	const p = 5;
	const structures = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Fortress").filter(TriggerHelper.IsInWorld);

	if (structures.length == 0)
		return;

	const spawn_site = pickRandom(structures);

	const num_attackers = this.achaeanAttackLevel;
	const attackers = [];

	// spawn attackers
	for (let i = 0; i < num_attackers; ++i)
	{

		if (Math.random() < 1.0 - this.achaeanSiegeProb)
		{
			const units_i = TriggerHelper.SpawnUnits(spawn_site, pickRandom(this.achaeanAttackTemplates), 1, p);
			attackers.push(units_i[0]);
		}
		else
		{
			// siege
			const units_i = TriggerHelper.SpawnUnits(spawn_site, "units/athen/siege_oxybeles_packed", 1, p);
			attackers.push(units_i[0]);
		}
	}


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

	const next_attack_interval_sec = this.achaeanAttackInterval + Math.floor(Math.random() * 120);
	// warn("Next attack = " + uneval(next_attack_interval_sec));
	this.arcadiaAttackLevel += 5;

	this.DoAfterDelay(next_attack_interval_sec * 1000, "AchaeanAttack", null);
};


Trigger.prototype.SpawnAchaeanPatrol = function(data)
{
	const p = 5; // arcdians

	// see how many units we have
	const units_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Soldier").filter(TriggerHelper.IsInWorld);

	// check for idles
	warn("Checking for idle units");
	const idle_units = [];
	let num_patroling = 0;
	const idle_unit_task = 0;
	for (const u of units_p)
	{
		const cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
		if (cmpUnitAI)
		{
			if (cmpUnitAI.IsIdle())
			{
				idle_units.push(u);
			}
			else
			{
				// check if patroling
				const orders = cmpUnitAI.GetOrders();
				// warn(uneval(orders));
				if (orders.length > 0)
				{
					if (orders[0].type == "Patrol")
					{
						num_patroling += 1;
					}

				}
			}
		}
		// warn("Found "+idle_units.length + " idles and "+num_patroling+ " patrolling");

	}



	if (units_p.length < 80)
	{

		// targets A
		let targets_A = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "CivilCentre").filter(TriggerHelper.IsInWorld);
		targets_A = targets_A.concat(TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Trade").filter(TriggerHelper.IsInWorld));
		targets_A = targets_A.concat(TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "MercenaryCamp").filter(TriggerHelper.IsInWorld));
		targets_A = targets_A.concat(TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Fortress").filter(TriggerHelper.IsInWorld));

		let targets_B = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "StoneTower").filter(TriggerHelper.IsInWorld);
		targets_B = targets_B.concat(TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Gate").filter(TriggerHelper.IsInWorld));


		if (targets_A.length == 0 || targets_B.length == 0)
			return;

		const site_j = pickRandom(targets_B);
		const patrol_units = TriggerHelper.SpawnUnits(site_j, pickRandom(this.patrolTemplates), 1, p);

		// send to patrol
		this.PatrolOrder(patrol_units, p, pickRandom(targets_A), site_j);

		// send idles to patrol
		for (const u of idle_units)
		{
			this.PatrolOrder([u], p, pickRandom(targets_A), pickRandom(targets_B));
		}
	}

	this.DoAfterDelay(20 * 1000, "SpawnAchaeanPatrol", null);

};

Trigger.prototype.SpawnArcadianPatrol = function(data)
{
	const p = 6; // arcdians
	const max_patrol_size = 80;

	// see how many units we have
	const units_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Soldier").filter(TriggerHelper.IsInWorld);

	// first, take care of any idle units
	// warn("Checking for idle units");
	const idle_units = [];
	let num_patroling = 0;
	const idle_unit_task = 0;
	for (const u of units_p)
	{
		const cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
		if (cmpUnitAI)
		{
			if (cmpUnitAI.IsIdle())
			{
				idle_units.push(u);
			}
			else
			{
				// check if patroling
				const orders = cmpUnitAI.GetOrders();
				// warn(uneval(orders));
				if (orders.length > 0)
				{
					if (orders[0].type == "Patrol")
					{
						num_patroling += 1;
					}

				}
			}
		}
		// warn("Found "+idle_units.length + " idles and "+num_patroling+ " patrolling");

	}

	if (units_p.length < max_patrol_size)
	{

		// targets A
		let targets_A = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "CivilCentre").filter(TriggerHelper.IsInWorld);
		targets_A = targets_A.concat(TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Trade").filter(TriggerHelper.IsInWorld));
		targets_A = targets_A.concat(TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "MercenaryCamp").filter(TriggerHelper.IsInWorld));

		const targets_B = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "StoneTower").filter(TriggerHelper.IsInWorld);

		if (targets_A.length == 0 || targets_B.length == 0)
			return;

		const site_j = pickRandom(targets_B);
		const patrol_units = TriggerHelper.SpawnUnits(site_j, pickRandom(this.patrolTemplates), 1, p);

		// send to patrol
		this.PatrolOrder(patrol_units, p, pickRandom(targets_A), site_j);

		for (const u of idle_units)
		{
			// warn("sending idle unit to patrol");
			this.PatrolOrder([u], p, pickRandom(targets_A), pickRandom(targets_B));

		}
	}

	this.DoAfterDelay(20 * 1000, "SpawnArcadianPatrol", null);

};

Trigger.prototype.SpawnArcadianTraders = function(data)
{
	const e = 6; // arcdians

	// make list of own docks
	const docks = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(e), "Trade").filter(TriggerHelper.IsInWorld);

	if (docks.length > 0)
	{

		// make list of traders
		const traders_e = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(e), "Trader+!Ship").filter(TriggerHelper.IsInWorld);


		if (traders_e.length < this.maxNumArcadianTraders)
		{
			// make list of others markets
			// make list of others' docks
			let markets_others = [];
			const trading_partners = [2, 5, 4];
			for (const p of trading_partners)
			{

				const markets_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Trade").filter(TriggerHelper.IsInWorld);

				markets_others = markets_others.concat(markets_p);
			}


			if (markets_others.length > 0)
			{


				const site = pickRandom(docks);

				// warn("Spawning trader for crete");
				const trader = TriggerHelper.SpawnUnits(site, "units/athen/support_trader", 1, e);

				let cmpUnitAI = Engine.QueryInterface(trader[0], IID_UnitAI);

				cmpUnitAI.UpdateWorkOrders("Trade");
				cmpUnitAI.SetupTradeRoute(pickRandom(markets_others), site, null, true);

				// with some probability, spawn escort
				if (Math.random() < this.escortProb)
				{
					for (let i = 0; i < this.tradeEscortSize; i++)
					{
						const escort_i = TriggerHelper.SpawnUnits(site, pickRandom(this.patrolTemplates), 1, e);


						cmpUnitAI = Engine.QueryInterface(escort_i[0], IID_UnitAI);
						cmpUnitAI.orderQueue = [];
						cmpUnitAI.order = undefined;
						cmpUnitAI.isIdle = true;

						cmpUnitAI.Guard(trader[0], true);
					}
				}

			}
		}
	}

	// check for idle traders
	const traders = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(e), "Trader").filter(TriggerHelper.IsInWorld);

	for (const u of traders)
	{
		const cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
		if (cmpUnitAI)
		{
			if (cmpUnitAI.IsIdle())
			{
				// warn("Found idle trader");

				// make list of others' docks
				let markets_others = [];
				const trading_partners = [2, 5, 4];
				for (const p of trading_partners)
				{
					const markets_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Trade").filter(TriggerHelper.IsInWorld);
					markets_others = markets_others.concat(markets_p);
				}

				if (markets_others.length > 0)
				{
					cmpUnitAI.UpdateWorkOrders("Trade");
					cmpUnitAI.SetupTradeRoute(pickRandom(markets_others), pickRandom(docks), null, true);
					// warn("making idle trader trade");
				}
			}
		}
	}

	this.DoAfterDelay(60 * 1000, "SpawnArcadianTraders", null);
};


Trigger.prototype.SpawnCretanTraders = function(data)
{
	const e = 4; // cretans

	// make list of own docks
	const docks = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(e), "Dock").filter(TriggerHelper.IsInWorld);



	if (docks.length > 0)
	{

		// make list of traders
		const traders_e = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(e), "Trader+!Ship").filter(TriggerHelper.IsInWorld);


		if (traders_e.length < this.maxNumCretanTraders)
		{
			// make list of others markets
			// make list of others' docks
			let markets_others = [];
			const trading_partners = [2, 6];
			for (const p of trading_partners)
			{

				const markets_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Trade+!Dock").filter(TriggerHelper.IsInWorld);

				markets_others = markets_others.concat(markets_p);
			}


			if (markets_others.length > 0)
			{


				const site = pickRandom(docks);

				// warn("Spawning trader for crete");
				const trader = TriggerHelper.SpawnUnits(site, "units/athen/support_trader", 1, e);

				let cmpUnitAI = Engine.QueryInterface(trader[0], IID_UnitAI);

				cmpUnitAI.UpdateWorkOrders("Trade");
				cmpUnitAI.SetupTradeRoute(pickRandom(markets_others), site, null, true);

				// with some probability, spawn escort
				if (Math.random() < this.escortProb)
				{
					for (let i = 0; i < this.tradeEscortSize; i++)
					{
						const escort_i = TriggerHelper.SpawnUnits(site, "units/athen/cavalry_swordsman_a", 1, e);


						cmpUnitAI = Engine.QueryInterface(escort_i[0], IID_UnitAI);
						cmpUnitAI.orderQueue = [];
						cmpUnitAI.order = undefined;
						cmpUnitAI.isIdle = true;

						cmpUnitAI.Guard(trader[0], true);
					}
				}

			}

		}
	}

	// check for idle traders
	const traders = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(e), "Trader").filter(TriggerHelper.IsInWorld);

	for (const u of traders)
	{
		const cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
		if (cmpUnitAI)
		{
			if (cmpUnitAI.IsIdle())
			{
				// warn("Found idle trader");

				// make list of others' docks
				let markets_others = [];
				const trading_partners = [2, 5, 6];
				for (const p of trading_partners)
				{
					const markets_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Trade").filter(TriggerHelper.IsInWorld);
					markets_others = markets_others.concat(markets_p);
				}

				if (markets_others.length > 0)
				{
					cmpUnitAI.UpdateWorkOrders("Trade");
					cmpUnitAI.SetupTradeRoute(pickRandom(markets_others), pickRandom(docks), null, true);
					// warn("making idle trader trade");
				}
			}
		}
	}

	this.DoAfterDelay(45 * 1000, "SpawnCretanTraders", null);
};


Trigger.prototype.FlipMegolopolisAssets = function(data)
{
	// get all structures except docks
	const structures_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(3), "Structure+!Dock").filter(TriggerHelper.IsInWorld);

	for (const u of structures_p)
	{
		var cmpOwnership = Engine.QueryInterface(u, IID_Ownership);
		cmpOwnership.SetOwner(1);
	}

	// get all units
	const units_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(3), "Unit");

	for (const u of units_p)
	{
		var cmpOwnership = Engine.QueryInterface(u, IID_Ownership);
		cmpOwnership.SetOwner(1);
	}

	// start attacks

	this.DoAfterDelay(360 * 1000, "AchaeanAttack", null);
	this.DoAfterDelay(600 * 1000, "ArcadianAttack", null);


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

Trigger.prototype.CheckAssault = function(data)
{
	const units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(7), "Unit").filter(TriggerHelper.IsInWorld);

	// warn("Found "+uneval(units.length) +" units");

	if (units.length == 0)
	{
		// flip assets
		this.DoAfterDelay(10 * 1000, "FlipMegolopolisAssets", null);
		this.ShowText("We have defeated the assault on Megalopolis! The city is now under your command!", "Great!", "OK");
		// warn("Assault over!");
	}
	else
	{
		this.DoAfterDelay(15 * 1000, "CheckAssault", null);

	}
};

Trigger.prototype.SpawnAssault = function(data)
{
	const owner = 7;
	const target_player = 3;

	// north side -- some rams, cavalry, and ballistas
	const num_rams = 5;
	const num_cav = 20;
	const num_ballistas = 3;

	for (let i = 0; i < num_rams; i++)
	{
		// spawn unit
		const triggerPoint = pickRandom(this.GetTriggerPoints(triggerPointNorth));

		const units_i = TriggerHelper.SpawnUnits(triggerPoint, "units/spart/siege_ram", 1, owner);

		// make it fight
		this.WalkAndFightClosestTarget(units_i[0], target_player, "CivilCentre");
	}

	for (let i = 0; i < num_cav; i++)
	{
		// spawn unit
		const triggerPoint = pickRandom(this.GetTriggerPoints(triggerPointNorth));

		const units_i = TriggerHelper.SpawnUnits(triggerPoint, "units/spart/cavalry_spearman_a", 1, owner);

		// make it fight
		this.WalkAndFightClosestTarget(units_i[0], target_player, "CivilCentre");
	}

	for (let i = 0; i < num_ballistas; i++)
	{
		// spawn unit
		const triggerPoint = pickRandom(this.GetTriggerPoints(triggerPointNorth));

		const units_i = TriggerHelper.SpawnUnits(triggerPoint, "units/athen/siege_oxybeles_packed", 1, owner);

		// make it fight
		this.WalkAndFightClosestTarget(units_i[0], target_player, "CivilCentre");
	}

	// south side -- some infantry
	const num_infantry = 30;

	const inf_templates = ["units/spart/champion_infantry_pike", "units/spart/champion_infantry_swordsman", "units/spart/champion_infantry_spear", "units/spart/infantry_javelineer_a"];

	for (let i = 0; i < num_infantry; i++)
	{
		// spawn unit
		const triggerPoint = pickRandom(this.GetTriggerPoints(triggerPointSouth));

		const units_i = TriggerHelper.SpawnUnits(triggerPoint, pickRandom(inf_templates), 1, owner);

		// make it fight
		this.WalkAndFightClosestTarget(units_i[0], target_player, "CivilCentre");
	}

	this.DoAfterDelay(15 * 1000, "CheckAssault", null);

};

{
	const cmpTrigger = Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger);

	// Activate all possible triggers
	/* let data = { "enabled": true };
	cmpTrigger.RegisterTrigger("OnStructureBuilt", "StructureBuiltAction", data);*/
	/* cmpTrigger.RegisterTrigger("OnConstructionStarted", "ConstructionStartedAction", data);
	cmpTrigger.RegisterTrigger("OnTrainingFinished", "TrainingFinishedAction", data);
	cmpTrigger.RegisterTrigger("OnTrainingQueued", "TrainingQueuedAction", data);
	cmpTrigger.RegisterTrigger("OnResearchFinished", "ResearchFinishedAction", data);
	cmpTrigger.RegisterTrigger("OnResearchQueued", "ResearchQueuedAction", data);

	cmpTrigger.RegisterTrigger("OnPlayerCommand", "PlayerCommandAction", data);*/

	/*
	 * some notes: 6:30 in, spart starts first attack, 2 dozen troops + 2 rams (moderate + balanced)
	 *
	 *
	 */

	// some constants
	cmpTrigger.maxNumCretanTraders = 10;
	cmpTrigger.tradeEscortSize = 3;
	cmpTrigger.escortProb = 0.3;
	cmpTrigger.maxNumArcadianTraders = 6;

	cmpTrigger.patrolTemplates = ["units/athen/champion_ranged", "units/athen/champion_marine", "units/athen/champion_infantry"];

	// some variables that change over time
	cmpTrigger.arcadiaAttackLevel = 18;// 20;
	cmpTrigger.arcadiaAttackInterval = 420;
	cmpTrigger.arcadiaSiegeProb = 0.045;
	cmpTrigger.arcadiaAttackTemplates = ["units/athen/champion_ranged", "units/athen/champion_marine", "units/athen/champion_infantry", "units/athen/infantry_javelineer_a", "units/athen/infantry_slinger_a", "units/athen/infantry_spearman_a", "units/athen/infantry_spearman_a"];

	// some variables that change over time
	cmpTrigger.achaeanAttackLevel = 26;// 30;
	cmpTrigger.achaeanAttackInterval = 620;
	cmpTrigger.achaeanSiegeProb = 0.045;
	cmpTrigger.achaeanAttackTemplates = ["units/athen/cavalry_swordsman_a", "units/athen/cavalry_javelineer_a", "units/athen/infantry_javelineer_a", "units/athen/infantry_slinger_a", "units/athen/infantry_spearman_a", "units/athen/infantry_spearman_a"];

	// whether the special attack has happened
	cmpTrigger.specialAttackTriggered = false;


	// garrison towers
	warn("Garrisoning entities");
	cmpTrigger.DoAfterDelay(5 * 1000, "GarrisonEntities", null);

	// start spawning traders
	cmpTrigger.DoAfterDelay(5 * 1000, "SpawnCretanTraders", null);
	cmpTrigger.DoAfterDelay(5 * 1000, "SpawnArcadianTraders", null);

	// start spawning patrols
	cmpTrigger.DoAfterDelay(10 * 1000, "SpawnArcadianPatrol", null);
	cmpTrigger.DoAfterDelay(10 * 1000, "SpawnAchaeanPatrol", null);

	// schedule assault
	cmpTrigger.DoAfterDelay(15 * 1000, "SpawnAssault", null);


	// debug
	// cmpTrigger.DoAfterDelay(10 * 1000,"FlipMegolopolisAssets",null);
	// cmpTrigger.DoAfterDelay(12 * 1000,"AchaeanAttack",null);
	// cmpTrigger.DoAfterDelay(15 * 1000,"ArcadianAttack",null);


	// spawn patrols of forts
	// cmpTrigger.DoAfterDelay(10 * 1000,"SpawnFortressPatrol",null);

	// invasion sea attack
	// cmpTrigger.DoAfterDelay(10 * 1000,"SpawnNavalInvasionAttack",null);




	for (const p of [1, 2, 3, 4, 5, 6])
	{
		const cmpPlayer = QueryPlayerIDInterface(p);

		// for players 3,4,5,6 disable templates

		if (p == 3 || p == 4 || p == 5 || p == 6)
		{
			// disable buildings production
			let disTemplates = disabledTemplates(QueryPlayerIDInterface(p, IID_Identity).GetCiv());

			// disable units as well
			const unit_templaes = TriggerHelper.GetTemplateNamesByClasses("Unit", QueryPlayerIDInterface(p, IID_Identity).GetCiv(), undefined, undefined, true);

			disTemplates = disTemplates.concat(unit_templaes);

			cmpPlayer.SetDisabledTemplates(disTemplates);
			warn("Disabling templates for player " + uneval(p));
		}

		const cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);

		cmpTechnologyManager.ResearchTechnology("phase_town_generic");
		cmpTechnologyManager.ResearchTechnology("phase_city_generic");

		if (p == 4 || p == 6)
		{
			cmpTechnologyManager.ResearchTechnology("trade_commercial_treaty");
			cmpTechnologyManager.ResearchTechnology("trade_gain_01");
			cmpTechnologyManager.ResearchTechnology("trade_gain_02");
		}

		if (p == 1)
		{
			cmpTechnologyManager.ResearchTechnology("unlock_shared_los");
			cmpPlayer.SetPopulationBonuses(100);
		}
	}


	/* cmpTrigger.RegisterTrigger("OnInterval", "IdleUnitCheck", {
		"enabled": true,
		"delay": 15 * 1000,
		"interval": 15 * 1000,
	});*/

	// Activate all possible triggers
	const data = { "enabled": true };
	cmpTrigger.RegisterTrigger("OnOwnershipChanged", "OwnershipChangedAction", data);

	/* cmpTrigger.DoAfterDelay(300 * 1000,"SpawnAlliedInvasionAttack",null);*/



}
