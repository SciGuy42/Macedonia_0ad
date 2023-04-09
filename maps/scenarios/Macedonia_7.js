warn("loading the triggers file");

// /////////////////////
// Trigger listeners //
// /////////////////////

var unitTargetClass = "Unit+!Ship";

var triggerPointShipUnload = "C";

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

	const building = data.building;

	const owner = TriggerHelper.GetOwner(building);
	// warn("owner = "+uneval(owner));

	if (owner == 1) // we built a structure
	{
		// trigger cavalry attacks
		if (this.gaul_cavalary_started == false)
		{
			// warn("player 1 built first structure");

			this.StartRepeatAttacks();

			this.gaul_cavalary_started = true;

		}

	}
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

Trigger.prototype.StartRepeatAttacks = function()
{
	warn("starting attacks");

	this.gaul_cavalary_started = true;

	// schedule next attack
	this.DoAfterDelay((120 * 1000) + this.gaul_cavalry_interval, "SpawnAndStartCavalryAttack", null);

	// also start ship attacks
	this.DoAfterDelay((120 * 1000) + this.shipAttackDelay, "SpawnShip", null);

	// disabled for now, not implemented well
	// this.DoAfterDelay(this.invasionAttackDelay,"SpawnInvasionShip",null);

};

Trigger.prototype.OwnershipChangedAction = function(data)
{
	// warn("The OnOwnershipChanged event happened with the following data:");
	// warn(uneval(data));

	if (data.entity == 7889 && data.from == 0 && data.to == 1) // captured fishing village
	{
		// spawn some support units
		TriggerHelper.SpawnUnits(7889, "units/gaul/ship_fishing", 3, 1);

		// spawn some villagers
		TriggerHelper.SpawnUnits(7889, "units/mace/support_female_citizen", 10, 1);

		// trigger cavalry attacks
		if (this.gaul_cavalary_started == false)
		{
			this.StartRepeatAttacks();
		}
	}
	else if (data.entity == 7890 && data.from == 0 && data.to == 1)
	{ // captured docks
		TriggerHelper.SpawnUnits(7890, "units/gaul/ship_fishing", 3, 1);
		TriggerHelper.SpawnUnits(7890, "units/gaul/ship_merchant", 1, 1);
	}
	else if (data.entity == 7903 && data.from == 0 && data.to == 1)
	{
		TriggerHelper.SpawnUnits(7903, "units/gaul/ship_fishing", 3, 1);
		TriggerHelper.SpawnUnits(7903, "units/gaul/ship_merchant", 1, 1);
	}
	else if (data.entity == 8013 && data.from == 0 && data.to == 1)
	{
		// warn("captured CC");
		// spawn some villagers
		TriggerHelper.SpawnUnits(8013, "units/mace/support_female_citizen", 10, 1);

		// trigger cavalry attacks
		if (this.gaul_cavalary_started == false)
		{

			this.StartRepeatAttacks();
		}
	}
	else if (data.entity == 8303 && data.from == 0)
	{
		// spawn siege
		TriggerHelper.SpawnUnits(8303, "units/mace/siege_ram", 1, 1);

	}
};

Trigger.prototype.PlayerCommandAction = function(data)
{
	// warn("The OnPlayerCommand event happened with the following data:");
	// warn(uneval(data));
};

Trigger.prototype.FlipOutpostOwnership = function(data)
{
	const outposts = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "Outpost").filter(TriggerHelper.IsInWorld);

	for (const u of outposts)
	{
		var cmpOwnership = Engine.QueryInterface(u, IID_Ownership);
		cmpOwnership.SetOwner(0);
	}
};

Trigger.prototype.SpawnAndStartCavalryAttack = function()
{
	// check if player 6 is alive
	const p = 6;
	const cmpPlayer_p = QueryPlayerIDInterface(p);
	// warn(uneval(cmpPlayer_p.GetState()));
	if (cmpPlayer_p.GetState() != "active")
	{
		return; // player 6 is dead
	}

	// check to see if we have targets
	const targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "Structure");

	if (targets.length > 0)
	{

		// get list of barracks barracks
		let sites = [];
		for (let e = 0; e < this.enemies.length; ++e)
		{
			const structs_e = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(this.enemies[e]), "Barracks").filter(TriggerHelper.IsInWorld);

			// warn("Fouond " + structs_e.length + " barracks of player " + this.enemies[e]);
			sites = sites.concat(structs_e);
		}

		if (sites.length == 0)
			return;

		const spawn_site = pickRandom(sites);

		// decide how many troops to send
		const units_pl1 = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "Human").filter(TriggerHelper.IsInWorld);
		// warn("Found " + units_pl1.length + " human units");

		const attack_size = Math.floor(units_pl1.length / 4.0) + 2 + this.spawn_cav_bonus;
		let attackers = [];
		for (let i = 0; i < attack_size; ++i)
		{
			const attacker_i = TriggerHelper.SpawnUnits(spawn_site, pickRandom(this.gaul_cavalry_types), 1, p);
			attackers = attackers.concat(attacker_i);
		}

		// warn("Attackers:");
		// warn(uneval(attackers));

		// set formation
		TriggerHelper.SetUnitFormation(p, attackers, pickRandom(unitFormations));

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

		ProcessCommand(6, {
			"type": "attack",
			"entities": attackers,
			"target": closestTarget,
			"queued": true,
			"allowCapture": false
		});
	}

	// schedule next attack
	const nextAttackDelay = Math.round(this.gaul_cavalry_interval + (Math.random() * 120 * 1000));
	// warn("next attack in "+nextAttackDelay);
	this.DoAfterDelay(nextAttackDelay, "SpawnAndStartCavalryAttack", null);
};

Trigger.prototype.InvasionRangeAction = function(data)
{
	// warn("The Invasion OnRange event happened with the following data:");
	// warn(uneval(data));

	if (this.invasion_under_way == true)
	{
		const cmpGarrisonHolder = Engine.QueryInterface(this.invasion_ship, IID_GarrisonHolder);

		const cmpUnitAI = Engine.QueryInterface(this.invasion_ship, IID_UnitAI);

		if (cmpGarrisonHolder && cmpUnitAI)
		{
			// warn(uneval(cmpUnitAI.orderQueue));
			// warn(uneval(cmpUnitAI.order));

			if (cmpUnitAI.order && cmpUnitAI.order.type == "Walk")
				return;

			const humans = TriggerHelper.MatchEntitiesByClass(cmpGarrisonHolder.GetEntities(), "Human");
			const siegeEngines = TriggerHelper.MatchEntitiesByClass(cmpGarrisonHolder.GetEntities(), "Siege");
			if (humans.length > 0 || siegeEngines.length > 0)
			{
				warn("Unloading");
				cmpGarrisonHolder.UnloadAll();
			}
			else if (humans.length == 0 && siegeEngines.length == 0)
			{
				warn("Done unloading");
				this.invasion_under_way = false;

				// send troops to attack
				// set formation
				TriggerHelper.SetUnitFormation(7, this.invasion_troops, pickRandom(unitFormations));

				const targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), unitTargetClass);
				let closestTarget;
				let minDistance = Infinity;

				for (const target of targets)
				{
					if (!TriggerHelper.IsInWorld(target))
						continue;

					const targetDistance = PositionHelper.DistanceBetweenEntities(this.invasion_troops[0], target);
					if (targetDistance < minDistance)
					{
						closestTarget = target;
						minDistance = targetDistance;
					}
				}

				ProcessCommand(7, {
					"type": "attack",
					"entities": this.invasion_troops,
					"target": closestTarget,
					"queued": true,
					"allowCapture": false
				});

				// send ship to attack
			}
		}
	}
};

Trigger.prototype.SpawnInvasionShip = function()
{

	const p = 6;
	const cmpPlayer = QueryPlayerIDInterface(p);
	if (cmpPlayer.GetState() != "active")
	{
		return; // player 6 is dead
	}

	const shipTypes = TriggerHelper.GetTemplateNamesByClasses("Warship", QueryPlayerIDInterface(p, IID_Identity).GetCiv(), undefined, undefined, true);
	const shipType = pickRandom(shipTypes);

	let docks = [];
	for (const e of this.enemies)
	{
		// pick dock
		const docks_e = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(e), "Dock").filter(TriggerHelper.IsInWorld);
		docks = docks.concat(docks_e);
	}

	if (docks.length < 1)
		return;

	const spawn_site = pickRandom(docks);

	const ship_spawned = TriggerHelper.SpawnUnits(spawn_site, shipType, 1, p);
	let ship_garrison = [];

	// spawn the garrison inside the ship
	ship_garrison = ship_garrison.concat(TriggerHelper.SpawnGarrisonedUnits(ship_spawned[0], "units/gaul/champion_fanatic", 12, p));

	// ship_garrison = ship_garrison.concat(TriggerHelper.SpawnGarrisonedUnits(ship_spawned[0], "units/theb_sacred_band",6,7));

	// make sure the unit has no orders, for some reason after garissoning, the order queue is full of pick up orders
	const cmpUnitAI = Engine.QueryInterface(ship_spawned[0], IID_UnitAI);
	cmpUnitAI.orderQueue = [];
	cmpUnitAI.order = undefined;
	cmpUnitAI.isIdle = true;

	this.invasion_under_way = true;
	this.invasion_ship = ship_spawned[0];
	this.invasion_troops = ship_garrison;

	// let ungarrison_point = this.GetTriggerPoints(pickRandom(triggerPointShipUnload));
	const ungarrison_point = pickRandom(this.GetTriggerPoints(triggerPointShipUnload));
	const ungarrisonPos = TriggerHelper.GetEntityPosition2D(ungarrison_point);
	// warn(uneval(ungarrisonPos));

	// send ship
	cmpUnitAI.Walk(ungarrisonPos.x, ungarrisonPos.y, false);

	// schedule next
	this.DoAfterDelay(this.invasionAttackInterval, "SpawnInvasionShip", null);

};

Trigger.prototype.SpawnShip = function()
{
	// let time = TriggerHelper.GetMinutes();
	// warn(uneval(time));

	const p = 6;
	const cmpPlayer_p = QueryPlayerIDInterface(p);
	// warn(uneval(cmpPlayer_p.GetState()));
	if (cmpPlayer_p.GetState() != "active")
	{
		return; // player 6 is dead
	}

	// decide spawn sites
	// get list of all docks controlled by Getea
	let sites = [];
	for (let e = 0; e < this.enemies.length; ++e)
	{
		const structs_e = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(this.enemies[e]), "Dock").filter(TriggerHelper.IsInWorld);

		// warn("Fouond " + structs_e.length + " docks of player " + this.enemies[e]);

		sites = sites.concat(structs_e);
	}

	if (sites.length == 0)
		return;

	//	warn(uneval(sites));

	// decide how many ships to spawn
	const units_pl1 = TriggerHelper.GetEntitiesByPlayer(1);
	const warships_pl1 = TriggerHelper.MatchEntitiesByClass(units_pl1, "Warship").filter(TriggerHelper.IsInWorld);
	const shipSpawnCount = Math.floor(warships_pl1.length / 4.0 + 1) + this.spawn_ship_bonus;

	// warn("Spawning " + shipSpawnCount + " ships");

	// spawn the ships
	for (let i = 0; i < shipSpawnCount; ++i)
	{
		const ship_spawned = TriggerHelper.SpawnUnits(pickRandom(sites), pickRandom(this.gaul_ships), 1, 6);

		// spawn the garrison inside the ship
		TriggerHelper.SpawnGarrisonedUnits(ship_spawned[0], "units/gaul/champion_infantry_swordsman", this.ship_garrison_size, 6);

		// make sure the unit has no orders, for some reason after garissoning, the order queue is full of pick up orders
		const cmpUnitAI = Engine.QueryInterface(ship_spawned[0], IID_UnitAI);
		cmpUnitAI.orderQueue = [];
		cmpUnitAI.order = undefined;
		cmpUnitAI.isIdle = true;
	}

	// schedule next spawn -- add some randomnes
	this.DoAfterDelay(this.shipAttackInterval + Math.floor(Math.random() * 60 * 1000), "SpawnShip", null);

};

Trigger.prototype.IntervalActionTraders = function(data)
{

	for (const e of this.enemies)
	{
		// make list of traders
		const traders_e = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(e), "Trader+!Ship").filter(TriggerHelper.IsInWorld);

		// warn("found "+traders_e.length + " traders from player "+e);

		if (traders_e.length < 10)
		{
			// make list of own markets
			const markets_e = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(e), "Market").filter(TriggerHelper.IsInWorld);

			// make list of possible other markets
			let markets_others = [];
			for (const p of this.enemies)
			{
				if (p != e)
				{
					const markets_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Trade").filter(TriggerHelper.IsInWorld);

					markets_others = markets_others.concat(markets_p);
				}
			}
			// warn(uneval(markets_e));
			// warn(uneval(markets_others));

			if (markets_e.length > 0 && markets_others.length > 0)
			{
				// spawn trader at random market
				const spawn_market = pickRandom(markets_e);
				const target_market = pickRandom(markets_others);

				const trader = TriggerHelper.SpawnUnits(spawn_market, "units/brit/support_trader", 1, e);
				const cmpUnitAI = Engine.QueryInterface(trader[0], IID_UnitAI);

				cmpUnitAI.UpdateWorkOrders("Trade");
				cmpUnitAI.SetupTradeRoute(target_market, spawn_market, null, true);
			}
		}
	}
};

Trigger.prototype.IntervalAction = function(data)
{
	// warn("interval action ships");

	// check what idle ships by player 6
	const players = [6];

	for (const p of players)
	{

		const units_pl6 = TriggerHelper.GetEntitiesByPlayer(p);
		const warships = TriggerHelper.MatchEntitiesByClass(units_pl6, "Warship").filter(TriggerHelper.IsInWorld);

		if (warships.length == 0)
			return;

		// compute list of idle ships
		const idle_warships = [];
		for (const ship of warships)
		{
			const cmpUnitAI = Engine.QueryInterface(ship, IID_UnitAI);
			// warn(uneval(cmpUnitAI.order));
			if (cmpUnitAI.IsIdle() && !cmpUnitAI.order)
			{
				idle_warships.push(ship);
			}
		}

		//	warn("found "+idle_warships.length+" idle ships");

		if (idle_warships.length > 0)
		{

			// get possible list of ship targets
			const targets_pl1 = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "Ship");
			const targets_pl3 = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(3), "Ship");
			const targets = targets_pl1.concat(targets_pl3);

			// get possible list of dock targets
			const docks_pl1 = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "Dock").filter(TriggerHelper.IsInWorld);
			const docks_pl2 = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(3), "Dock").filter(TriggerHelper.IsInWorld);
			const targets_docks = docks_pl1.concat(docks_pl2);

			if (targets.length > 0 || targets_docks.length > 0)
			{

				for (let i = 0; i < idle_warships.length; i++)
				{
					const cmpUnitAI = Engine.QueryInterface(idle_warships[i], IID_UnitAI);

					if (cmpUnitAI.IsIdle())
					{
						// decide whether to target the closest ship or the closest dock
						let targets_i;
						if ((Math.random() < 0.75 && targets.length > 0) || targets_docks.length == 0) // target ships
							targets_i = targets;
						else
							targets_i = targets_docks;

						// find closest target
						let closestTarget;
						let minDistance = Infinity;

						for (const target of targets_i)
						{
							if (!TriggerHelper.IsInWorld(target))
								continue;

							const targetDistance = PositionHelper.DistanceBetweenEntities(idle_warships[i], target);
							if (targetDistance < minDistance)
							{
								closestTarget = target;
								minDistance = targetDistance;
							}
						}

						// warn("Sending ship attack order with target = "+closestTarget);
						cmpUnitAI.Attack(closestTarget);
					}
					else
					{
						warn(uneval(cmpUnitAI.order));
					}
				}
			}
		}
	}

};

Trigger.prototype.SetDifficultyLevel = function(data)
{
	// Very Hard: 1.56; Hard: 1.25; Medium 1

	let difficulty = 0;

	for (const player of this.enemies)
	{
		const cmpPlayer = QueryPlayerIDInterface(player);
		const ai_mult = cmpPlayer.GetGatherRateMultiplier();
		const cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);

		if (ai_mult == 1.25 && difficulty < 1)
		{
			difficulty = 1;
		}
		else if (ai_mult >= 1.5 && difficulty < 2)
		{
			difficulty = 2;
			break;
		}
	}

	if (difficulty == 1)
	{
		this.spawn_ship_bonus = 0;
		this.spawn_cav_bonus = 4;
		this.ship_garrison_size = 6;
		this.shipAttackInterval *= 0.95;

	}
	else if (difficulty == 2)
	{
		this.spawn_ship_bonus = 1;
		this.spawn_cav_bonus = 8;
		this.ship_garrison_size = 10;
		this.shipAttackInterval *= 0.9;
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

	// get list of possible gaul ships
	cmpTrigger.gaul_ships = TriggerHelper.GetTemplateNamesByClasses("Warship", "gaul", undefined, undefined, true);
	// warn(uneval(cmpTrigger.gaul_ships));

	// list of enemy players
	cmpTrigger.enemies = [2, 4, 5, 6];
	cmpTrigger.spawn_ship_bonus = 0;
	cmpTrigger.spawn_cav_bonus = 0;
	cmpTrigger.ship_garrison_size = 2;

	for (const p of [1, 2, 3, 4, 5, 6])
	{
		const cmpPlayer = QueryPlayerIDInterface(p);
		const cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);

		cmpTechnologyManager.ResearchTechnology("unlock_shared_los");

		if (p == 1)
			cmpTechnologyManager.ResearchTechnology("phase_town_generic");
	}

	// some variables related to ship respawning
	cmpTrigger.shipAttackDelay = 180 * 1000;
	cmpTrigger.invasionAttackDelay = 360 * 1000;
	cmpTrigger.shipAttackInterval = 180 * 1000;
	cmpTrigger.invasionAttackInterval = 240 * 1000;

	// cavalry attack variables
	cmpTrigger.gaul_cavalry_types = ["units/gaul/cavalry_swordsman_a", "units/gaul/cavalry_javelineer_a", "units/gaul/cavalry_swordsman_b", "units/gaul/cavalry_javelineer_b", "units/brit/champion_chariot"];
	cmpTrigger.gaul_cavalry_interval = 120 * 1000;
	cmpTrigger.gaul_cavalary_started = false;

	cmpTrigger.invasion_under_way = false;
	cmpTrigger.invasion_ship = undefined;
	cmpTrigger.invasion_troops = undefined;

	// lose towers
	cmpTrigger.DoAfterDelay(1, "FlipOutpostOwnership", null);

	// register invasion unload trigger
	cmpTrigger.RegisterTrigger("OnRange", "InvasionRangeAction", {
		"entities": cmpTrigger.GetTriggerPoints(triggerPointShipUnload), // central points to calculate the range circles
		"players": [7], // only count entities of player 7
		"maxRange": 30,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});

	cmpTrigger.RegisterTrigger("OnInterval", "IntervalAction", {
		"enabled": true,
		"delay": 6 * 1000,
		"interval": 40 * 1000
	});

	cmpTrigger.RegisterTrigger("OnInterval", "IntervalActionTraders", {
		"enabled": true,
		"delay": 3 * 1000,
		"interval": 45 * 1000
	});

	/* let ents_5 = TriggerHelper.GetEntitiesByPlayer(5);
	for (let e of ents_5)
	{
		let cmpBuildingAI = Engine.QueryInterface(e, IID_Identity);
		if (cmpBuildingAI)
		{
			warn(uneval(cmpBuildingAI));
		}

	}*/

	// make traders trade
	// start ship traders
	/* var traders_pl4 = [8114,8115,8116];
	for (let i = 0; i < traders_pl4.length; ++i)
	{
		let cmpUnitAI = Engine.QueryInterface(traders_pl4[i], IID_UnitAI);
		if (cmpUnitAI) {
			warn("updating ship orders");
			cmpUnitAI.UpdateWorkOrders("Trade");
			cmpUnitAI.SetupTradeRoute(8037,7930,null,true);
		}
	}*/

}
