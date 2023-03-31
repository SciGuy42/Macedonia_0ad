warn("loading the triggers file");

// /////////////////////
// Trigger listeners //
// /////////////////////

var unitTargetClass = "Unit+!Ship";
var siegeTargetClass = "Structure";

var unitFormations = [
	"special/formations/box",
	"special/formations/battle_line",
	"special/formations/line_closed",
	"special/formations/column_closed"
];

// scenario indendent functions
Trigger.prototype.PatrolOrderList = function(units, p, patrolTargets)
{

	if (units.length <= 0)
		return;

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

/*
 * TODO: add some spawn attacks the first time a gate or wall is destroyed
 *
 */
Trigger.prototype.OwnershipChangedAction = function(data)
{
	// warn("The OnOwnershipChanged event happened with the following data:");
	// warn(uneval(data));
	if ((data.from == 4 || data.from == 2) && (data.to == -1 || data.to == 1))
	{
		const id = Engine.QueryInterface(data.entity, IID_Identity);
		if (id)
		{
			/* warn(uneval(id));
			warn(typeof id.visibleClassesList);
			warn(uneval(id.visibleClassesList));*/

			if (id.visibleClassesList.includes("Trader"))
			{
				// make it trade
				const markets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "Trade").filter(TriggerHelper.IsInWorld);

				const traders = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "Trader").filter(TriggerHelper.IsInWorld);

				if (markets.length >= 2 && traders.length < 15)
				{

					// give reward to human player for killing trader
					const ccs = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "CivilCentre").filter(TriggerHelper.IsInWorld);

					const trader = TriggerHelper.SpawnUnits(pickRandom(ccs), "units/mace/support_trader", 1, 1);

					const m1 = markets[0];
					const m2 = markets[markets.length - 1];

					const cmpUnitAI = Engine.QueryInterface(trader[0], IID_UnitAI);

					cmpUnitAI.UpdateWorkOrders("Trade");
					cmpUnitAI.SetupTradeRoute(m1, m2, null, true);

				}
			}
			else if (this.crannog_ids.includes(data.entity) /* || data.entity == 7176 || data.entity == 7177*/) // if pl2 or pl4 lose a civic center
			{
				// stage attack from player 3 in response to a civil centre lost by player 4
				//	warn("crannog destroyed or captured");
				// this.SpawnAndStartCavalryAttack();

				this.DoAfterDelay(5 * 1000, "SpawnAndStartCavalryAttack", null);
				this.DoAfterDelay(15 * 1000, "SpawnAndStartCavalryAttack", null);
				this.DoAfterDelay(25 * 1000, "SpawnAndStartCavalryAttack", null);
			}
		}
	}

};

Trigger.prototype.PlayerCommandAction = function(data)
{
	// warn("The OnPlayerCommand event happened with the following data:");
	// warn(uneval(data));
};

Trigger.prototype.IntervalSpawnGuards = function(data)
{
	for (const p of [3])
	{
		const cmpPlayer = QueryPlayerIDInterface(p);
		if (cmpPlayer.GetState() != "active")
		{
			return;
		}

		// get patrol sites
		const patrol_sites = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(2), "Structure").filter(TriggerHelper.IsInWorld);

		const soldiers = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Unit").filter(TriggerHelper.IsInWorld);

		// check for idle troops
		for (const u of soldiers)
		{
			const cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI)
			{
				if (cmpUnitAI.IsIdle())
				{
					if (patrol_sites.length > 5)
					{
						const sites = [pickRandom(patrol_sites), pickRandom(patrol_sites), pickRandom(patrol_sites)];
						this.PatrolOrderList([u], p, sites);
					}
				}
			}
		}

		// warn("found "+ soldiers.length + " soldiers");

		let pop_limit = 100;

		// if player 4 has cc's, then pop limit goes up
		const ccs_p3 = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(4), "CivilCentre").filter(TriggerHelper.IsInWorld);

		pop_limit += ccs_p3.length * 50;

		// warn("pop limit = "+pop_limit);

		if (soldiers.length < pop_limit)
		{
			const size = 2 + 2 * ccs_p3.length;

			if (patrol_sites.length >= 3)
			{

				const inf_templates = ["units/athen/champion_ranged", "units/athen/champion_marine", "units/theb_sacred_band", "units/merc_black_cloak"];

				// pick patrol sites
				const sites = [pickRandom(patrol_sites), pickRandom(patrol_sites), pickRandom(patrol_sites)];

				let units = [];

				// regulaar
				// warn("spawning soldiers");
				for (let i = 0; i < size; i++)
				{
					// spawn the unit
					const unit_i = TriggerHelper.SpawnUnits(sites[0], pickRandom(inf_templates), 1, p);
					units = units.concat(unit_i);
				}

				this.PatrolOrderList(units, p, sites);
			}
		}
	}

	this.DoAfterDelay(30 * 1000, "IntervalSpawnGuards", null);
};

Trigger.prototype.SpawnAndStartCavalryAttack = function()
{
	const p = 3;

	const cmpPlayer = QueryPlayerIDInterface(p);
	if (cmpPlayer.GetState() != "active")
	{
		return;
	}

	this.gaul_cavalry_types = ["units/gaul/cavalry_swordsman_e", "units/gaul/cavalry_javelineer_e", "units/brit/war_dog", "units/gaul/champion_cavalry", "units/brit/champion_chariot"];

	// get list of barracks
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

	let attack_size = Math.floor(units_pl1.length / 8.0) + 2 + this.spawn_cav_bonus;
	if (attack_size > 40)
	{
		attack_size = 40;
	}

	// spawn
	let attackers = [];
	for (let i = 0; i < attack_size; ++i)
	{
		const attacker_i = TriggerHelper.SpawnUnits(spawn_site, pickRandom(this.gaul_cavalry_types), 1, p);
		attackers = attackers.concat(attacker_i);
	}

	// find target
	const closestTarget = this.FindClosestTarget(attackers[0], 1, "CivilCentre");
	if (closestTarget)
	{
		// set formation
		TriggerHelper.SetUnitFormation(p, attackers, pickRandom(unitFormations));

		ProcessCommand(p, {
			"type": "attack",
			"entities": attackers,
			"target": closestTarget,
			"queued": true,
			"allowCapture": false
		});
	}
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

};

Trigger.prototype.IntervalCrannogSpawnAction = function(data)
{
	// spawn random infantry next to each crannog
	const crannogs = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(4), "CivilCentre").filter(TriggerHelper.IsInWorld);

	for (let i = 0; i < crannogs.length; ++i)
	{
		TriggerHelper.SpawnUnits(crannogs[i], pickRandom(this.infantryTypesSpawn), 1 + this.spawn_crannog_bonus, 4);
		// warn("spawning crannog unit");
	}
};

// garison AI entities with archers
Trigger.prototype.GarrisonEntities = function(data)
{

	// fortress
	for (const p of [2])
	{
		const troop_owner = 3;

		// 5 person towers
		const towers = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "StoneTower").filter(TriggerHelper.IsInWorld);

		for (const c of towers)
		{
			// spawn the garrison inside the tower
			const archers_e = TriggerHelper.SpawnUnits(c, "units/athen/champion_ranged", 5, troop_owner);

			for (const a of archers_e)
			{
				const cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(c, true);
			}
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

	// starting tech
	for (const p of [1, 2, 3, 4])
	{
		const cmpPlayer = QueryPlayerIDInterface(p);
		const cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);

		cmpTechnologyManager.ResearchTechnology("unlock_shared_los");
		if (p == 1)
			cmpTechnologyManager.ResearchTechnology("phase_town_generic");
	}

	// list of enemy players
	cmpTrigger.enemies = [2, 3, 4];

	// list of crannogs of player 4
	// we randomly spawn units near them just to help the AI of player 4
	cmpTrigger.crannog_ids = [7366, 7371, 7382];
	cmpTrigger.infantryTypesSpawn = ["units/brit/infantry_javelineer_b", "units/brit/infantry_slinger_b", "units/brit/infantry_spearman_b"];

	cmpTrigger.spawn_cav_bonus = 0;
	cmpTrigger.spawn_crannog_bonus = 0;

	// repeat spawn of guards
	cmpTrigger.DoAfterDelay(5 * 1000, "IntervalSpawnGuards", null);

	// garrison towers
	cmpTrigger.DoAfterDelay(4 * 1000, "GarrisonEntities", null);

	cmpTrigger.RegisterTrigger("OnInterval", "IntervalCrannogSpawnAction", {
		"enabled": true,
		"delay": 6 * 1000,
		"interval": 90 * 1000,
	});

	cmpTrigger.RegisterTrigger("OnInterval", "IntervalAction", {
		"enabled": true,
		"delay": 6 * 1000,
		"interval": 20 * 1000,
	});

	// every so often, check for idle traders
	cmpTrigger.RegisterTrigger("OnInterval", "IntervalActionTraders", {
		"enabled": true,
		"delay": 10 * 1000,
		"interval": 60 * 1000,
	});
}
