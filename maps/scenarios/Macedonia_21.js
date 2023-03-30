warn("loading the triggers file");

// /////////////////////
// Trigger listeners //
// /////////////////////


var unitTargetClass = "Unit+!Ship";
var siegeTargetClass = "Structure";


var triggerPointShipInvasion = "B";
var triggerPointShipSpawn = "A";
var triggerPointCavalryAttack = "K";



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

Trigger.prototype.OwnershipChangedAction = function(data)
{
	// warn("The OnOwnershipChanged event happened with the following data:");
	// warn(uneval(data));

	if (data.from == 5 && data.to == -1)
	{
		const id = Engine.QueryInterface(data.entity, IID_Identity);
		if (id.classesList.indexOf("Fortress") >= 0)
		{
			warn("Fortress destroyed!");
			this.CavalryAttack();
		}
	}

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
	warn("Carthage invasion ship attack!");

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

	for (const p of [3, 5, 6])
	{
		const towers_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "StoneTower").filter(TriggerHelper.IsInWorld);

		for (const e of towers_p)
		{
			// spawn the garrison inside the tower
			const archers_e = TriggerHelper.SpawnUnits(e, "units/kush/champion_infantry_amun", 5, p);

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

			const archers_e = TriggerHelper.SpawnUnits(e, "units/kush/champion_infantry_archer", fort_size, p);

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




Trigger.prototype.StartEpisode = function(data)
{
	const fort_A = 553;// TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(1), "MercenaryCamp").filter(TriggerHelper.IsInWorld)[0];
	const fort_B = 554;// TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(2), "MercenaryCamp").filter(TriggerHelper.IsInWorld)[0];


	// PLAYER 1
	var counts_A = [];
	for (const type of this.unitTypes)
	{
		const count_t = Math.floor(Math.random() * this.maxCountPerType);
		counts_A.push(count_t);
	}

	// spawn and attack
	const units_A = [];
	for (let t = 0; t < this.unitTypes.length; t++)
	{
		for (let i = 0; i < counts_A[t]; i++)
		{
			const units_i = TriggerHelper.SpawnUnits(fort_A, this.unitTypes[t], 1, 1);
			units_A.push(units_i[0]);
		}
	}

	// find target
	const target_A = this.FindClosestTarget(units_A[0], 2, unitTargetClass);
	const target_pos_A = TriggerHelper.GetEntityPosition2D(target_A);

	// set formation
	// TriggerHelper.SetUnitFormation(1, units_A, pickRandom(unitFormations));


	ProcessCommand(1, {
		"type": "attack-walk",
		"entities": units_A,
		"x": target_pos_A.x,
		"z": target_pos_A.y,
		"queued": true,
		"targetClasses": {
			"attack": unitTargetClass
		},
		"allowCapture": false
	});


	// PLAYER 2
	var counts_B = [];
	for (const type of this.unitTypes)
	{
		const count_t = Math.floor(Math.random() * this.maxCountPerType);
		counts_B.push(count_t);
	}

	// spawn and attack
	const units_B = [];
	for (let t = 0; t < this.unitTypes.length; t++)
	{
		for (let i = 0; i < counts_B[t]; i++)
		{
			const units_i = TriggerHelper.SpawnUnits(fort_B, this.unitTypes[t], 1, 2);
			units_B.push(units_i[0]);
		}
	}

	// find target
	const target_B = this.FindClosestTarget(units_B[0], 1, unitTargetClass);
	const target_pos_B = TriggerHelper.GetEntityPosition2D(target_B);

	// TriggerHelper.SetUnitFormation(2, units_B, pickRandom(unitFormations));


	ProcessCommand(2, {
		"type": "attack-walk",
		"entities": units_B,
		"x": target_pos_B.x,
		"z": target_pos_B.y,
		"queued": true,
		"targetClasses": {
			"attack": unitTargetClass
		},
		"allowCapture": false
	});
};


Trigger.prototype.GarrisonPlayerShips = function(data)
{
	const p = 1;
	// let ships_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p, "Warship").filter(TriggerHelper.IsInWorld));

	const units_pl1 = TriggerHelper.GetEntitiesByPlayer(1);
	const warships_pl1 = TriggerHelper.MatchEntitiesByClass(units_pl1, "Warship").filter(TriggerHelper.IsInWorld);


	warn("Found " + uneval(warships_pl1));
	for (const ship of warships_pl1)
	{
		// spawn the garrison inside the ship
		TriggerHelper.SpawnGarrisonedUnits(ship, "units/ptol/infantry_archer_e", 5, p);
		TriggerHelper.SpawnGarrisonedUnits(ship, "units/ptol/infantry_slinger_e", 5, p);
		TriggerHelper.SpawnGarrisonedUnits(ship, "units/ptol/infantry_pikeman_e", 5, p);
		TriggerHelper.SpawnGarrisonedUnits(ship, "units/ptol/cavalry_archer_b", 5, p);
	}
};


Trigger.prototype.PatrolOrder = function(units, p)
{

	if (units.length <= 0)
		return;


	// list of patrol targets
	const patrolTargets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Fortress").filter(TriggerHelper.IsInWorld);


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

Trigger.prototype.CarthageShipAttack = function(data)
{
	warn("Carthage ship attack!");



	// check if we have docks
	const p = 6;
	const docks = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(6), "Dock").filter(TriggerHelper.IsInWorld);

	if (docks.length == 0)
		return; // attacks end

	const dock_targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "Dock").filter(TriggerHelper.IsInWorld);

	if (docks.length > 0)
	{

		// pick spawn site
		const triggerPoint = pickRandom(this.GetTriggerPoints(triggerPointShipSpawn));

		// spawn ship
		const templates = ["units/cart/ship_trireme", "units/cart/ship_bireme"];
		const ship_spawned = TriggerHelper.SpawnUnits(triggerPoint, pickRandom(templates), 1, p);

		// spawn garrison
		for (let j = 0; j < this.cartShipGarrisonSize; ++j)
		{
			const u_j = TriggerHelper.SpawnGarrisonedUnits(ship_spawned[0], "units/cart/champion_infantry", 1, p);
		}

		// get possible targets
		// get possible list of dock targets


		// get possible trade ship targets -- TODO


		// full list of targets
		const targets = dock_targets;

		// TODO: add any idle ships to attackers


		// order attack
		if (targets.length > 0)
		{
			ProcessCommand(p, {
				"type": "attack",
				"entities": ship_spawned,
				"target": pickRandom(targets),
				"queued": false,
				"allowCapture": false
			});
		}
	}

	this.DoAfterDelay(this.cartShipAttackInterval * 1000, "CarthageShipAttack", null);
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

Trigger.prototype.CarthageAttack = function(data)
{
	warn("Carthage land attack!");

	// check if we have camps
	const p = 6;
	const structures = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(6), "Structure").filter(TriggerHelper.IsInWorld);

	if (structures.length == 0)
		return;

	const spawn_site = pickRandom(structures);

	const num_attackers = this.carthageAttackLevel;
	const attackers = [];

	// spawn attackers
	for (let i = 0; i < num_attackers; ++i)
	{

		if (Math.random() < 0.975)
		{
			const units_i = TriggerHelper.SpawnUnits(spawn_site, pickRandom(this.cartAttackerTypes), 1, p);
			attackers.push(units_i[0]);
		}
		else
		{
			// elephant
			const units_i = TriggerHelper.SpawnUnits(spawn_site, "units/cart/champion_elephant", 1, p);
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

	const next_attack_interval_sec = this.carthageAttackInterval + Math.floor(Math.random() * 120);
	warn("Next attack = " + uneval(next_attack_interval_sec));
	this.carthageAttackLevel += this.carthageAttackIncrement;

	this.DoAfterDelay(next_attack_interval_sec * 1000, "CarthageAttack", null);
};


Trigger.prototype.CheckForCC = function(data)
{
	// check if player 1 has built structure
	const structures = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "Structure").filter(TriggerHelper.IsInWorld);

	if (structures.length > 1) // start after at least 2 structures
	{
		// start attacks
		warn("Has structure!");
		this.DoAfterDelay(240 * 1000, "CarthageAttack", null);

		// start ship attacks
		this.DoAfterDelay(360 * 1000, "CarthageShipAttack", null);

		// start naval invasion attacks
		this.DoAfterDelay(500 * 1000, "SpawnNavalInvasionAttack", null);


	}
	else
	{
		this.DoAfterDelay(30 * 1000, "CheckForCC", null);
	}
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


	// carthage attacker types
	cmpTrigger.cartAttackerTypes = ["units/cart/champion_infantry", "units/cart/champion_pikeman", "units/cart/infantry_archer_a", "units/cart/champion_cavalry", "units/cart/infantry_slinger_iber_a"];

	// carthage attack level
	cmpTrigger.carthageAttackLevel = 15;
	cmpTrigger.carthageAttackIncrement = 2;
	cmpTrigger.carthageAttackInterval = 240;

	// ship attack variables
	cmpTrigger.cartShipGarrisonSize = 5;
	cmpTrigger.cartShipAttackInterval = 300;

	// invasion attack
	cmpTrigger.carthageInvasionAttackInterval = 360;
	cmpTrigger.carthageInvasionShipGarrisonSize = 30;

	cmpTrigger.invasion_under_way = false;

	// garrison towers
	cmpTrigger.DoAfterDelay(5 * 1000, "GarrisonEntities", null);

	// garrison player ships
	cmpTrigger.DoAfterDelay(2 * 1000, "GarrisonPlayerShips", null);

	// check for cc periodically to start attacks
	cmpTrigger.DoAfterDelay(30 * 1000, "CheckForCC", null);

	// spawn patrols of forts
	cmpTrigger.DoAfterDelay(10 * 1000, "SpawnFortressPatrol", null);

	// invasion sea attack -- debug
	// cmpTrigger.DoAfterDelay(10 * 1000,"SpawnNavalInvasionAttack",null);
	// cmpTrigger.DoAfterDelay(10 * 1000,"CarthageShipAttack",null);




	for (const p of [1, 2, 3, 4, 5, 6])
	{
		const cmpPlayer = QueryPlayerIDInterface(p);


		// disable troop production
		const disTemplates = disabledTemplates(QueryPlayerIDInterface(p, IID_Identity).GetCiv());

		if (p == 5 || p == 6)
			cmpPlayer.SetDisabledTemplates(disTemplates);

		const cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);

		cmpTechnologyManager.ResearchTechnology("phase_town_generic");
		cmpTechnologyManager.ResearchTechnology("phase_city_generic");

		if (p == 5) // boost nubian forts
		{
			cmpTechnologyManager.ResearchTechnology("tower_health");
			cmpTechnologyManager.ResearchTechnology("tower_range");
			cmpTechnologyManager.ResearchTechnology("tower_watch");
			cmpTechnologyManager.ResearchTechnology("tower_murderholes");
			cmpTechnologyManager.ResearchTechnology("tower_crenellations");
		}

		if (p == 1)
			cmpPlayer.SetPopulationBonuses(100);
	}

	// interval and triggers for naval invasion
	cmpTrigger.RegisterTrigger("OnInterval", "checkInvasionAttack", {
		"enabled": true,
		"delay": 5 * 1000,
		"interval": 15 * 1000,
	});

	// register invasion unload trigger
	cmpTrigger.RegisterTrigger("OnRange", "InvasionRangeAction", {
		"entities": cmpTrigger.GetTriggerPoints(triggerPointShipInvasion), // central points to calculate the range circles
		"players": [6], // only count entities of player 6
		"maxRange": 20,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});

	cmpTrigger.RegisterTrigger("OnInterval", "IdleUnitCheck", {
		"enabled": true,
		"delay": 15 * 1000,
		"interval": 15 * 1000,
	});

	// 17 minutes in, it starts
	// cmpTrigger.DoAfterDelay(1080 * 1000,"StartNextAttack",null);

	// triggers
	// Activate all possible triggers
	const data = { "enabled": true };
	cmpTrigger.RegisterTrigger("OnOwnershipChanged", "OwnershipChangedAction", data);

	/* cmpTrigger.DoAfterDelay(300 * 1000,"SpawnAlliedInvasionAttack",null);


	cmpTrigger.RegisterTrigger("OnInterval", "SpawnPatrolPeriodic", {
		"enabled": true,
		"delay": 120 * 1000,
		"interval": 60 * 1000,
	});


	cmpTrigger.RegisterTrigger("OnInterval", "checkInvasionAttack", {
		"enabled": true,
		"delay": 5 * 1000,
		"interval": 15 * 1000,
	});

	// register invasion unload trigger
	cmpTrigger.RegisterTrigger("OnRange", "InvasionRangeAction1", {
		"entities": cmpTrigger.GetTriggerPoints(triggerPointShipUnload1), // central points to calculate the range circles
		"players": [3], // only count entities of player 6
		"maxRange": 20,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});

	// register invasion unload trigger
	cmpTrigger.RegisterTrigger("OnRange", "InvasionRangeAction2", {
		"entities": cmpTrigger.GetTriggerPoints(triggerPointShipUnload2), // central points to calculate the range circles
		"players": [3], // only count entities of player 6
		"maxRange": 20,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});

	cmpTrigger.RegisterTrigger("OnPlayerCommand", "PlayerCommandAction", data);
	*/

	/* cmpTrigger.RegisterTrigger("OnInterval", "IntervalUnitSpawn", {
		"enabled": true,
		"delay": 15 * 1000,
		"interval": 15 * 1000,
	});*/



	/* cmpTrigger.RegisterTrigger("OnInterval", "LevelUpPers", {
		"enabled": true,
		"delay": 1 * 1000,
		"interval": 300 * 1000,
	});



	// register winning trigger
	cmpTrigger.RegisterTrigger("OnRange", "RangeActionTriggerK", {
		"entities": cmpTrigger.GetTriggerPoints("K"), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 30,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});*/


}
