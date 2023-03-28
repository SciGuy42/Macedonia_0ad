warn("loading the triggers file");

// /////////////////////
// Trigger listeners //
// /////////////////////

var triggerPointShipSpawn = "A";
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
	"structures/ptol/lighthouse"
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
		warn("[ERROR] Could not find closest target to fight: "+attacker+" and "+target_player+" and "+target_class);
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

		const targetDistance = DistanceBetweenEntities(attacker, target);
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
	warn(uneval(data));

	const id = Engine.QueryInterface(data.entity, IID_Identity);
	warn(uneval(id));

	if (data.from == 0 && data.to == 1)
	{
		if (id.classesList.indexOf("Dock") >= 0)
		{
			this.num_docks_captured += 1;
			warn("dock captured");

			TriggerHelper.SpawnUnits(data.entity, "units/mace/ship_merchant", 2, 1);
		}
		else if (id.classesList.indexOf("Blacksmith") >= 0)
		{
			warn("smith captured");
			this.num_smith_captured += 1;
			if (this.num_smith_captured == 1)
				this.BlacksmithShipAttackRepeats();
		}
		else if (id.classesList.indexOf("Workshop") >= 0)
		{
			warn("shop captured");
			this.DoAfterDelay(240 * 1000, "WorkshopShipAttack", null);
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
	}

};

Trigger.prototype.PlayerCommandAction = function(data)
{
	// warn("The OnPlayerCommand event happened with the following data:");
	// warn(uneval(data));
};


Trigger.prototype.IntervalActionAlliedAttack = function(data)
{

	// warn("The OnInterval event happened:");
	// warn(uneval(data));
	this.numberOfTimerTrigger++;
	if (this.numberOfTimerTrigger >= this.maxNumberOfTimerTrigger)
		this.DisableTrigger("OnInterval", "IntervalAction");


	var enemy_players = [2];

	for (let p = 0; p < enemy_players.length; ++p)
	{


		var enemy_units = TriggerHelper.GetEntitiesByPlayer(enemy_players[p]);
		var human_units = TriggerHelper.GetEntitiesByPlayer(1);

		var d = 0;
		var best_distance = 100000;
		var best_index = -1;

		if (human_units.length > 0)
		{
			for (let i = 0; i < enemy_units.length; ++i)
			{
				const cmpUnitAI = Engine.QueryInterface(enemy_units[i], IID_UnitAI);

				// check if the unit is idle and if it can attack
				if (cmpUnitAI)
				{
					const pos_i = Engine.QueryInterface(enemy_units[i], IID_Position).GetPosition2D();

					if (cmpUnitAI.IsIdle() && Engine.QueryInterface(enemy_units[i], IID_Attack))
					{

						for (let j = 0; j < human_units.length; j++)
						{
							const pos_j = Engine.QueryInterface(human_units[j], IID_Position).GetPosition2D();

							d = Math.sqrt((pos_i.x-pos_j.x)*(pos_i.x-pos_j.x) + (pos_i.y-pos_j.y)*(pos_i.y-pos_j.y));

							if (d < best_distance)
							{
								best_distance = d;
								best_index = j;
							}
						}

						cmpUnitAI.SwitchToStance("violent");
						cmpUnitAI.Attack(human_units[best_index]);
					}
				}

				best_distance = 100000;
				best_index = -1;
			}
		}
	}
};


Trigger.prototype.IntervalActionPlayerFour = function(data)
{

	const units_pl4 = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(4), "Human").filter(TriggerHelper.IsInWorld);

	for (const u of units_pl4)
	{
		warn(uneval(["u, 2, unitTargetClass", u, 2, unitTargetClass]));
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
Trigger.prototype.IntervalLockGates = function(data)
{
	// lock gates
	const gates_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(2), "Gate").filter(TriggerHelper.IsInWorld);

	for (const g of gates_p)
	{
		const gateAI = Engine.QueryInterface(g, IID_Gate);

		gateAI.LockGate();
	}

};


// garison AI entities with archers
Trigger.prototype.GarrisonEntities = function(data)
{

	for (const p of [0, 1, 2, 3, 5])
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

		// fortresses
		const forts_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Fortress").filter(TriggerHelper.IsInWorld);
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

		// wall towers
		const towers_w = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Defensive+Tower+!Outpost+!GarrisonTower").filter(TriggerHelper.IsInWorld);
		for (const e of towers_w)
		{
			// spawn the garrison inside the tower
			const archers_e = TriggerHelper.SpawnUnits(e, "units/athen/champion_ranged", 2, p);

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

		// lock gates
		const gates_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Gate").filter(TriggerHelper.IsInWorld);

		for (const g of gates_p)
		{
			const gateAI = Engine.QueryInterface(g, IID_Gate);

			gateAI.LockGate();
		}

		if (p == 1)
		{
			const ships_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Warship").filter(TriggerHelper.IsInWorld);

			for (const ship of ships_p)
			{
				// spawn the garrison inside the ship
				TriggerHelper.SpawnGarrisonedUnits(ship, "units/mace/infantry_archer_e", 5, p);

				// spawn the garrison inside the ship
				TriggerHelper.SpawnGarrisonedUnits(ship, "units/mace/champion_infantry_spearman", 5, p);
			}
		}

	}

};


Trigger.prototype.IntervalActionTraders = function(data)
{
	warn("interval traders");

	for (let e = 0; e < this.enemies.length; ++e)
	{
		// make list of land traders
		const traders_e = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(this.enemies[e]), "Trader+!Ship").filter(TriggerHelper.IsInWorld);
		// traders_e = TriggerHelper.MatchEntitiesByClass(traders_e, "Human");

		warn("Traders from player " + this.enemies[e]);
		warn(uneval(traders_e));

		// make list of own markets
		const markets_e = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(this.enemies[e]), "Market").filter(TriggerHelper.IsInWorld);
		warn("Markets from player " + this.enemies[e]);
		warn(uneval(markets_e));

		// make list of possible other markets
		let markets_others = [];
		for (let p = 0; p < this.enemies.length; ++p)
		{
			if (this.enemies[e] != this.enemies[p])
			{
				const markets_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(this.enemies[p]), "Market").filter(TriggerHelper.IsInWorld);

				markets_others = markets_others.concat(markets_p);
			}
		}

		// randomly assign each trader to a market of another player
		for (const trader of traders_e)
		{
			const cmpUnitAI = Engine.QueryInterface(trader, IID_UnitAI);
			if (markets_others?.length && cmpUnitAI.IsIdle())
			{
				// warn("updating trade orders");
				cmpUnitAI.UpdateWorkOrders("Trade");
				cmpUnitAI.SetupTradeRoute(pickRandom(markets_others), markets_e[0], null, true);
			}

		}

		// make list of sea traders
		const traders_s = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(this.enemies[e]), "Trader+Ship").filter(TriggerHelper.IsInWorld);
		// warn("Found "+traders_s.length+" ships for player "+this.enemies[e]);
		// warn(uneval(traders_s));
		// make list of own docks
		const docks_e = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(this.enemies[e]), "Dock").filter(TriggerHelper.IsInWorld);
		// warn("Found "+docks_e.length+" docks of our own");
		// warn(uneval(docks_e));

		// make list of possible other docks
		let docks_others = [];
		for (let p = 0; p < this.enemies.length; ++p)
		{
			if (this.enemies[e] != this.enemies[p])
			{
				const markets_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(this.enemies[p]), "Dock").filter(TriggerHelper.IsInWorld);

				docks_others = docks_others.concat(markets_p);
			}
		}
		// warn("Found "+docks_others.length+" docks of others");
		// warn(uneval(docks_others));


		// randomly assign each ship to a dock of another player
		for (const trader of traders_s)
		{
			const cmpUnitAI = Engine.QueryInterface(trader, IID_UnitAI);
			if (cmpUnitAI)
			{
				if (cmpUnitAI.IsIdle())
				{
					// warn("updating ship orders");
					cmpUnitAI.UpdateWorkOrders("Trade");
					cmpUnitAI.SetupTradeRoute(pickRandom(docks_others), docks_e[0], null, true);
				}
			}

		}

	}
};


// spawn enemny trade ships once in a while
Trigger.prototype.IntervalSpawnTradeShips = function(data)
{
	const trader_ais = [3];
	for (let e = 0; e < trader_ais.length; ++e)
	{
		// get list of docks
		const docks_e = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(trader_ais[e]), "Dock").filter(TriggerHelper.IsInWorld);

		if (docks_e.length > 0)
		{
			// get list of trade ships
			const traders_e = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(trader_ais[e]), "Trader+Ship").filter(TriggerHelper.IsInWorld);

			if (traders_e.length < 6)
			{
				// make list of others' docks
				let docks_others = [];
				for (const p of this.enemies)
				{
					if (p != trader_ais[e])
					{
						const docks_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Dock").filter(TriggerHelper.IsInWorld);

						docks_others = docks_others.concat(docks_p);
					}
				}

				if (docks_others.length > 0)
				{
					const spawn_dock = pickRandom(docks_e);
					const trader = TriggerHelper.SpawnUnits(spawn_dock, "units/pers/ship_merchant", 1, trader_ais[e]);

					warn("spawned trade ship");

					const cmpUnitAI = Engine.QueryInterface(trader[0], IID_UnitAI);

					cmpUnitAI.UpdateWorkOrders("Trade");
					cmpUnitAI.SetupTradeRoute(pickRandom(docks_others), spawn_dock, null, true);


				}
			}
		}
	}
};



Trigger.prototype.TowerDestroyedAttack = function(data)
{
	warn("Tower revenge attack");

	const camps = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(5), "MercenaryCamp").filter(TriggerHelper.IsInWorld);

	const human_camps = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "MercenaryCamp").filter(TriggerHelper.IsInWorld);

	if (human_camps.length == 0 || camps.length == 0)
	{
		return;
	}

	const num_attackers = this.tower_destroyed_attack_size;
	warn("Num attackers = "+num_attackers);
	const attackers = [];

	// spawn attackers
	for (let i = 0; i < num_attackers; ++i)
	{
		const spawn_site = pickRandom(camps);
		const units_i = TriggerHelper.SpawnUnits(spawn_site, pickRandom(this.pers_inf_templates), 1, 5);
		attackers.push(units_i[0]);
	}

	for (const a of attackers)
	{
		this.WalkAndFightClosestTarget(a, 1, "Hero");
	}

	this.tower_destroyed_attack_size += 2;
};

Trigger.prototype.GateDestroyedAttack = function(data)
{
	warn("Gate revenge attack");

	const towers = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(3), "GarrisonTower").filter(TriggerHelper.IsInWorld);

	const human_camps = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "MercenaryCamp").filter(TriggerHelper.IsInWorld);

	if (human_camps.length == 0 || towers.length == 0)
	{
		return;
	}

	const num_attackers = 40;
	warn("Num attackers = "+num_attackers);
	const attackers = [];

	// spawn attackers
	for (let i = 0; i < num_attackers; ++i)
	{
		const spawn_site = pickRandom(towers);
		const units_i = TriggerHelper.SpawnUnits(spawn_site, pickRandom(this.greek_inf_templates), 1, 3);
		attackers.push(units_i[0]);
	}

	for (const a of attackers)
	{
		this.WalkAndFightClosestTarget(a, 1, "Hero");
	}
};



Trigger.prototype.GreekAttack = function(data)
{
	const towers = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(3), "GarrisonTower").filter(TriggerHelper.IsInWorld);

	const human_camps = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "MercenaryCamp").filter(TriggerHelper.IsInWorld);

	if (human_camps.length == 0 || towers.length == 0)
		return;

	const num_attackers = this.greekAttackSize;
	warn("Num attackers = "+num_attackers);
	const attackers = [];

	// find any idle soldiers
	const units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(3), "Infantry").filter(TriggerHelper.IsInWorld);

	for (const u of units)
	{
		const cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
		if (cmpUnitAI)
		{
			if (cmpUnitAI.IsIdle())
			{
				attackers.push(u);
			}
		}
	}

	// spawn attackers
	for (let i = 0; i < num_attackers; ++i)
	{
		const spawn_site = pickRandom(towers);
		const units_i = TriggerHelper.SpawnUnits(spawn_site, pickRandom(this.greek_inf_templates), 1, 3);
		attackers.push(units_i[0]);
	}

	// spawn siege
	const num_siege = Math.floor(num_attackers/12);
	const siege_attackers = [];
	for (let i = 0; i < num_siege; ++i)
	{
		const spawn_site = pickRandom(towers);
		const units_i = TriggerHelper.SpawnUnits(spawn_site, pickRandom(this.greek_siege_templates), 1, 3);
		siege_attackers.push(units_i[0]);
	}



	// set formation
	// TriggerHelper.SetUnitFormation(3, attackers, pickRandom(unitFormations));

	// find target
	const target = pickRandom(this.human_start_structures);

	ProcessCommand(3, {
		"type": "attack",
		"entities": attackers,
		"target": target,
		"queued": true,
		"allowCapture": false
	});

	ProcessCommand(3, {
		"type": "attack",
		"entities": siege_attackers,
		"target": target,
		"queued": true,
		"allowCapture": false
	});

	this.greekAttackSize += 1;
};



Trigger.prototype.IntervalUnitCheck = function(data)
{
	// find any idle soldiers
	const units_inf = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(2), "Infantry").filter(TriggerHelper.IsInWorld);
	const units_cav = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(2), "Cavalry").filter(TriggerHelper.IsInWorld);
	const units_siege = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(2), "Siege").filter(TriggerHelper.IsInWorld);



	const soldiers = units_inf.concat(units_cav, units_siege);

	const attackers = [];

	for (const u of soldiers)
	{
		const cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
		if (cmpUnitAI)
		{
			if (cmpUnitAI.IsIdle())
			{
				if (Math.random() < 0.5)
					attackers.push(u);
			}
		}
	}

	warn("Selected "+attackers.length +" idle soldiers");

	if (attackers.length > 15)
	{
		// set formation
		TriggerHelper.SetUnitFormation(2, attackers, pickRandom(unitFormations));

		// find target
		const target = pickRandom(this.human_start_structures);
		// let target = this.human_start_structures[0];

		ProcessCommand(2, {
			"type": "attack",
			"entities": attackers,
			"target": target,
			"queued": true,
			"allowCapture": false
		});
	}

};


// spawn random attack
Trigger.prototype.WorkshopShipAttack = function(data)
{


	// pick dock
	const smiths = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "Workshop").filter(TriggerHelper.IsInWorld);

	if (smiths.length == 0)
	{
		return;
	}

	const target = pickRandom(smiths);


	const owner = 5;

	// pick spawn point
	const triggerPoint = this.GetTriggerPoints(triggerPointShipSpawn)[0];

	const num_ships = 4;
	const attackers = [];

	for (let i = 0; i < num_ships; i++)
	{
		const ship_spawned = TriggerHelper.SpawnUnits(triggerPoint, this.spawn_ship_templates[0], 1, owner);

		// spawn the force inside the ship
		TriggerHelper.SpawnGarrisonedUnits(ship_spawned[0], pickRandom(this.pers_inf_templates), 8, owner);

		// make sure the unit has no orders, for some reason after garissoning, the order queue is full of pick up orders
		const cmpUnitAI = Engine.QueryInterface(ship_spawned[0], IID_UnitAI);
		cmpUnitAI.orderQueue = [];
		cmpUnitAI.order = undefined;
		cmpUnitAI.isIdle = true;

		attackers.push(ship_spawned[0]);
	}



	for (const attacker of attackers)
	{
		const cmpUnitAI = Engine.QueryInterface(attacker, IID_UnitAI);
		cmpUnitAI.Attack(target);
	}

	// this.DoAfterDelay(360 * 1000,"BlacksmithShipAttackRepeats",null);
};


// spawn random attack
Trigger.prototype.BlacksmithShipAttackRepeats = function(data)
{


	// pick dock
	const smiths = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "Blacksmith").filter(TriggerHelper.IsInWorld);

	if (smiths.length == 0)
	{
		this.DoAfterDelay(360 * 1000, "BlacksmithShipAttackRepeats", null);
		return;
	}

	const target = pickRandom(smiths);


	const owner = 5;

	// pick spawn point
	const triggerPoint = this.GetTriggerPoints(triggerPointShipSpawn)[0];

	const num_ships = 3;
	const attackers = [];

	for (let i = 0; i < num_ships; i++)
	{
		const ship_spawned = TriggerHelper.SpawnUnits(triggerPoint, this.spawn_ship_templates[0], 1, owner);

		// spawn the force inside the ship
		TriggerHelper.SpawnGarrisonedUnits(ship_spawned[0], pickRandom(this.pers_inf_templates), 8, owner);

		// make sure the unit has no orders, for some reason after garissoning, the order queue is full of pick up orders
		const cmpUnitAI = Engine.QueryInterface(ship_spawned[0], IID_UnitAI);
		cmpUnitAI.orderQueue = [];
		cmpUnitAI.order = undefined;
		cmpUnitAI.isIdle = true;

		attackers.push(ship_spawned[0]);
	}



	for (const attacker of attackers)
	{
		const cmpUnitAI = Engine.QueryInterface(attacker, IID_UnitAI);
		cmpUnitAI.Attack(target);
	}

	this.DoAfterDelay(360 * 1000, "BlacksmithShipAttackRepeats", null);
};


// spawn random attack
Trigger.prototype.DockShipAttack = function(data)
{
	const owner = 5;

	if (this.num_docks_captured >= 2)
	{
		// pick spawn point
		const triggerPoint = pickRandom(this.GetTriggerPoints(triggerPointShipSpawn));

		const num_ships = 1;


		const attackers = [];

		for (let i = 0; i < num_ships; i++)
		{
			const ship_spawned = TriggerHelper.SpawnUnits(triggerPoint, this.spawn_ship_templates[0], 1, owner);

			// spawn the invasion force inside the ship
			TriggerHelper.SpawnGarrisonedUnits(ship_spawned[0], pickRandom(this.pers_inf_templates), this.ship_garrison_size, owner);

			// make sure the unit has no orders, for some reason after garissoning, the order queue is full of pick up orders
			const cmpUnitAI = Engine.QueryInterface(ship_spawned[0], IID_UnitAI);
			cmpUnitAI.orderQueue = [];
			cmpUnitAI.order = undefined;
			cmpUnitAI.isIdle = true;

			attackers.push(ship_spawned[0]);
		}

		// pick dock
		const docks = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "Dock").filter(TriggerHelper.IsInWorld);
		const target = pickRandom(docks);

		for (const attacker of attackers)
		{
			const cmpUnitAI = Engine.QueryInterface(attacker, IID_UnitAI);
			cmpUnitAI.Attack(target);
		}
	}
};

Trigger.prototype.PersianAttack = function(data)
{
	const camps = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(5), "MercenaryCamp").filter(TriggerHelper.IsInWorld);

	const human_camps = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "MercenaryCamp").filter(TriggerHelper.IsInWorld);

	if (human_camps.length == 0 || camps.length == 0)
		return;

	const spawn_site = camps[0];

	const num_attackers = this.persAttackSize;
	warn("Num attackers = "+num_attackers);
	const attackers = [];

	// find any idle soldiers
	let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(5), "Infantry").filter(TriggerHelper.IsInWorld);
	units = units.concat(TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(5), "Siege").filter(TriggerHelper.IsInWorld));
	for (const u of units)
	{
		const cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
		if (cmpUnitAI)
		{
			if (cmpUnitAI.IsIdle())
			{
				attackers.push(u);
			}
		}
	}

	// spawn attackers
	for (let i = 0; i < num_attackers; ++i)
	{
		const units_i = TriggerHelper.SpawnUnits(spawn_site, pickRandom(this.pers_inf_templates), 1, 5);
		attackers.push(units_i[0]);
	}

	// spawn siege
	const num_siege = Math.floor(num_attackers/7);
	const siege_attackers = [];
	for (let i = 0; i < num_siege; ++i)
	{
		const units_i = TriggerHelper.SpawnUnits(spawn_site, pickRandom(this.pers_siege_templates), 1, 5);
		siege_attackers.push(units_i[0]);
	}



	// set formation
	TriggerHelper.SetUnitFormation(5, attackers, pickRandom(unitFormations));

	// find target
	const target = pickRandom(this.human_start_structures);

	ProcessCommand(5, {
		"type": "attack",
		"entities": attackers,
		"target": target,
		"queued": true,
		"allowCapture": false
	});

	ProcessCommand(5, {
		"type": "attack",
		"entities": siege_attackers,
		"target": target,
		"queued": true,
		"allowCapture": false
	});

	this.persAttackSize += 1;
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


	cmpTrigger.enemies = [2, 3, 5];

	cmpTrigger.pers_inf_templates = TriggerHelper.GetTemplateNamesByClasses("Infantry+!Hero", "pers", undefined, undefined, true);
	cmpTrigger.pers_siege_templates = TriggerHelper.GetTemplateNamesByClasses("Siege", "pers", undefined, undefined, true);

	cmpTrigger.spawn_ship_templates = TriggerHelper.GetTemplateNamesByClasses("Warship", "pers", undefined, undefined, true);

	cmpTrigger.greek_inf_templates = TriggerHelper.GetTemplateNamesByClasses("Infantry+!Hero", "athen", undefined, undefined, true);
	cmpTrigger.greek_siege_templates = TriggerHelper.GetTemplateNamesByClasses("Siege", "athen", undefined, undefined, true);

	cmpTrigger.ship_garrison_size = 5;


	// state variables
	cmpTrigger.num_docks_captured = 0;
	cmpTrigger.persAttackSize = 6;
	cmpTrigger.greekAttackSize = 6;
	cmpTrigger.tower_destroyed_attack_size = 10;

	cmpTrigger.human_start_structures = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "Structure").filter(TriggerHelper.IsInWorld);


	// cmpTrigger.DoAfterDelay(5 * 1000,"SetDifficultyLevel",null);
	cmpTrigger.DoAfterDelay(5 * 1000, "IntervalActionPlayerFour", null);
	cmpTrigger.DoAfterDelay(2 * 1000, "GarrisonEntities", null);




	// add some techs
	for (const p of [1, 4])
	{
		const cmpPlayer = QueryPlayerIDInterface(p);
		cmpPlayer.SetDisabledTemplates(disabledTemplates(QueryPlayerIDInterface(p, IID_Identity).GetCiv()));

		const cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);

		cmpTechnologyManager.ResearchTechnology("unlock_shared_los");
		cmpTechnologyManager.ResearchTechnology("iphicratean_reforms");
	}

	// tech for enemies
	for (const p of [2, 3, 5])
	{
		const cmpPlayer = QueryPlayerIDInterface(p);

		const d_templates = disabledTemplates(QueryPlayerIDInterface(p, IID_Identity).GetCiv());
		d_templates.push("units/athen/ship_bireme");
		d_templates.push("units/athen/ship_trireme");
		d_templates.push("units/athen/ship_merchant");

		cmpPlayer.SetDisabledTemplates(d_templates);

		const cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);

		cmpTechnologyManager.ResearchTechnology("tower_range");
		cmpTechnologyManager.ResearchTechnology("tower_watch");
		cmpTechnologyManager.ResearchTechnology("tower_crenellations");
		cmpTechnologyManager.ResearchTechnology("tower_murderholes");
		cmpTechnologyManager.ResearchTechnology("tower_health");
		cmpTechnologyManager.ResearchTechnology("trade_gain_01");
		for (let k = 0; k < 5; k++)
		{
			cmpTechnologyManager.ResearchTechnology("trade_gain_02");
		}

		cmpTechnologyManager.ResearchTechnology("trade_commercial_treaty");
	}

	// tech for all
	for (const p of [1, 2, 3, 5])
	{
		const cmpPlayer = QueryPlayerIDInterface(p);

		cmpPlayer.SetPopulationBonuses(300);

		const cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);

		if (p == 2 || p == 3)
		{
			cmpTechnologyManager.ResearchTechnology("phase_town_athen");
			// cmpTechnologyManager.ResearchTechnology("phase_city_athen");
		}
		else
		{
			cmpTechnologyManager.ResearchTechnology("phase_town_generic");
			cmpTechnologyManager.ResearchTechnology("phase_city_generic");
		}
	}


	cmpTrigger.RegisterTrigger("OnInterval", "IntervalLockGates", {
		"enabled": true,
		"delay": 2 * 1000,
		"interval": 5 * 1000,
	});

	cmpTrigger.RegisterTrigger("OnInterval", "IntervalActionTraders", {
		"enabled": true,
		"delay": 3 * 1000,
		"interval": 60 * 1000,
	});

	cmpTrigger.RegisterTrigger("OnInterval", "IntervalSpawnTradeShips", {
		"enabled": true,
		"delay": 6 * 1000,
		"interval": 60 * 1000,
	});

	cmpTrigger.RegisterTrigger("OnInterval", "IntervalUnitCheck", {
		"enabled": true,
		"delay": 120 * 1000,
		"interval": 90 * 1000,
	});




	cmpTrigger.RegisterTrigger("OnInterval", "PersianAttack", {
		"enabled": true,
		"delay": 210 * 1000,
		"interval": 130 * 1000,
	});

	cmpTrigger.RegisterTrigger("OnInterval", "GreekAttack", {
		"enabled": true,
		"delay": 120 * 1000,
		"interval": 110 * 1000,
	});

	cmpTrigger.RegisterTrigger("OnInterval", "DockShipAttack", {
		"enabled": true,
		"delay": 180 * 1000,
		"interval": 180 * 1000,
	});




	// make traders trade
	// var all_ents = TriggerHelper.GetEntitiesByPlayer(2);






}
