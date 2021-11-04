warn("loading the triggers file");

///////////////////////
// Trigger listeners //
///////////////////////

var unitTargetClass = "Unit+!Ship";


var triggerPointShipUnload = "C";
var triggerPointShipInvasionSpawn = "A";
var triggerPointGreekSpecialAttack = "B";


var unitFormations = [
	"special/formations/box",
	"special/formations/battle_line",
	"special/formations/line_closed",
	"special/formations/column_closed"
];

Trigger.prototype.findClosestTarget = function(attacker,target_player,target_class)
{
	
	let targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(target_player), unitTargetClass);
	let closestTarget;
	let minDistance = Infinity;
	
	for (let target of targets)
	{
		if (!TriggerHelper.IsInWorld(target))
			continue;

		let targetDistance = DistanceBetweenEntities(attacker, target);
		if (targetDistance < minDistance)
		{
			closestTarget = target;
			minDistance = targetDistance;
		}
	}
	
	return closestTarget;
}

// every function just logs when it gets fired, and shows the data
Trigger.prototype.StructureBuiltAction = function(data)
{
	//warn("The OnStructureBuilt event happened with the following data:");
	//warn(uneval(data));
	

};

Trigger.prototype.ConstructionStartedAction = function(data)
{
	//warn("The OnConstructionStarted event happened with the following data:");
	//warn(uneval(data));
};

Trigger.prototype.TrainingFinishedAction = function(data)
{
	//warn("The OnTrainingFinished event happened with the following data:");
	//warn(uneval(data));
};

Trigger.prototype.TrainingQueuedAction = function(data)
{
	//warn("The OnTrainingQueued event happened with the following data:");
	//warn(uneval(data));
};

Trigger.prototype.ResearchFinishedAction = function(data)
{
	//warn("The OnResearchFinished event happened with the following data:");
	//warn(uneval(data));
};

Trigger.prototype.ResearchQueuedAction = function(data)
{
	//warn("The OnResearchQueued event happened with the following data:");
	//warn(uneval(data));
};


Trigger.prototype.OwnershipChangedAction = function(data)
{
	//warn("The OnOwnershipChanged event happened with the following data:");
	//warn(uneval(data));
	
	if (this.enemies.indexOf(data.from) >= 0)
	{
		let id = Engine.QueryInterface(data.entity, IID_Identity);
		
		if (id)
		{
			if (data.from == 6)
			{
				
				if (id.classesList.indexOf("GarrisonTower") >= 0 && this.tower_destroyed_event_happened == false)
				{
					warn("tower destroyed");
					this.tower_destroyed_event_happened = true;
					//this.DoAfterDelay(5 * 1000, "spawnInvasionAttack",null);
					
					//bump up points of capadocia for attack
					this.points_player4 += 2000;
					this.CapadociaAttack();
					this.points_player4 -= 1500;
				}
				else if (id.visibleClassesList.indexOf("CivilCentre") >= 0)
				{
					warn("special greek attack");
					this.DoAfterDelay(5 * 1000, "SpecialGreekAttack",null);

				}
			}
			else if (data.from == 4)
			{
				if (id.classesList.indexOf("MercenaryCamp") >= 0)
				{
					warn("special greek attack");
					this.DoAfterDelay(5 * 1000, "SpecialGreekAttack",null);
					
					//do another just for fun
					this.DoAfterDelay(60 * 1000, "SpecialGreekAttack",null);
				}
			}
			else if (this.invasion_under_way == false) //triggers for ship invasion attacks
			{
				if (id.visibleClassesList.indexOf("CivilCentre") >= 0 && this.cc_destroyed_event_happened == false)
				{
					this.cc_destroyed_event_happened = true;
					this.DoAfterDelay(5 * 1000, "spawnInvasionAttack",null);
				}
				else if (id.visibleClassesList.indexOf("Fortress") >= 0 && this.fortress_destroyed_event_happened == false)
				{
					this.fortress_destroyed_event_happened = true;
					this.DoAfterDelay(5 * 1000, "spawnInvasionAttack",null);
				}
				else if (id.classesList.indexOf("Dock") >= 0 && this.dock_destroyed_event_happened == false)
				{
					this.dock_destroyed_event_happened = true;
					this.DoAfterDelay(5 * 1000, "spawnInvasionAttack",null);
				}
			}
		}
	}
};

Trigger.prototype.PlayerCommandAction = function(data)
{
	//warn("The OnPlayerCommand event happened with the following data:");
	//warn(uneval(data));
};




Trigger.prototype.PatrolOrder = function(units,patrol_entities,k,player_number)
{
	if (units.length <= 0)
		return;
	
	//make them patrol
	let patrolTargets = [];
	
	if (k == 2 && patrol_entities.length == 2)
	{
		patrolTargets = patrolTargets.concat(patrol_entities);
	}
	else 
	{
		//randomly pick k
		while (patrolTargets.length < k)
		{
			let ent_k = Math.floor(Math.random() * patrol_entities.length);
			if (patrolTargets.indexOf(patrol_entities[ent_k]) < 0) 
				patrolTargets.push(patrol_entities[ent_k]);
		}
	}
	
	warn("Patrol targets: " + uneval(patrolTargets));
	
	for (let patrolTarget of patrolTargets)
	{
		let targetPos = TriggerHelper.GetEntityPosition2D(patrolTarget);
		ProcessCommand(player_number, {
			"type": "patrol",
			"entities": units,
			"x": targetPos.x,
			"z": targetPos.y,
			"targetClasses": {
				"attack": unitTargetClass
			},
			"queued": false,
			"allowCapture": false
		});
	}
}


Trigger.prototype.IntervalActionSpawnPatrol = function(data)
{
	//make list of ccs
	let cc = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(6), "CivilCentre").filter(TriggerHelper.IsInWorld);
	if (cc.length < 1)
		return;
		
	//make list of others' ccs
	let other_ccs = [];
	for (let e of this.enemies)
	{
		if (e != 6)
		{
			let ccs_e = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(e), "CivilCentre").filter(TriggerHelper.IsInWorld);
			
			other_ccs = other_ccs.concat(ccs_e);
		}
	}
	
	warn("our ccs: "+uneval(cc));
	warn("other ccs: "+uneval(other_ccs));
		
	let markets = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(6), "GarrisonTower").filter(TriggerHelper.IsInWorld);
	
	let patrol_points = [cc[0],pickRandom(other_ccs)];
		
	let currentPop = QueryPlayerIDInterface(6).GetPopulationCount();
	if (currentPop > this.greekPopLimit)
		return;
		
	let num_patrol = this.greekPatrolSize;
	let spawn_site = cc[0];
	let squad = [];
	for (let i = 0; i < num_patrol; ++i)
	{
		let units_i = TriggerHelper.SpawnUnits(spawn_site,pickRandom(this.greekInfTypes),1,6);
		squad.push(units_i[0]);
	}
	
	//set formation
	TriggerHelper.SetUnitFormation(6, squad, pickRandom(unitFormations));

	//with small probability, just attack
	if (Math.random() < 0.25) 
	{
		warn("Patrol attacking");
		let target = this.findClosestTarget(squad[0],1,unitTargetClass);
		
		ProcessCommand(6, {
			"type": "attack",
			"entities": squad,
			"target": target,
			"queued": false,
			"allowCapture": false
		});
	}
	else {
		this.PatrolOrder(squad,patrol_points,2,6);
	}
}


Trigger.prototype.InvasionRangeAction = function(data)
{
	warn("The Invasion OnRange event happened with the following data:");
	warn(uneval(data));
	
	if (this.invasion_under_way == true)
	{
		let cmpGarrisonHolder = Engine.QueryInterface(this.invasion_ship, IID_GarrisonHolder);
		
		if (cmpGarrisonHolder)
		{
			let humans = TriggerHelper.MatchEntitiesByClass(cmpGarrisonHolder.GetEntities(), "Human");
			let siegeEngines = TriggerHelper.MatchEntitiesByClass(cmpGarrisonHolder.GetEntities(), "Siege");
			if (humans.length > 0 || siegeEngines.length > 0)
			{
				warn("Unloading");
				cmpGarrisonHolder.UnloadAll();
			}
			else if (humans.length == 0 && siegeEngines == 0)
			{
				warn("Done unloading");
				
				//send units to attack
				
				this.invasion_under_way = false;
				
				//send troops to attack
				//set formation
				//TriggerHelper.SetUnitFormation(6,  this.ship_invasion_garrison, pickRandom(unitFormations));

				let targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), unitTargetClass).filter(TriggerHelper.IsInWorld);
				let closestTarget;
				let minDistance = Infinity;
				
				for (let target of targets)
				{
					if (!TriggerHelper.IsInWorld(target))
						continue;

					let targetDistance = DistanceBetweenEntities(this.invasion_ship, target);
					if (targetDistance < minDistance)
					{
						closestTarget = target;
						minDistance = targetDistance;
					}
				}
				
				ProcessCommand(6, {
					"type": "attack",
					"entities": this.ship_invasion_garrison,
					"target": closestTarget,
					"queued": true,
					"allowCapture": false
				});
				
				this.ship_invasion_garrison = undefined;
				this.invasion_ship = undefined;
			}
		}
	}
}

//spawn random attack
Trigger.prototype.checkInvasionAttack = function(data)
{
	if (this.invasion_under_way == true)
	{
		let cmpUnitAI = Engine.QueryInterface(this.invasion_ship, IID_UnitAI);
		if (cmpUnitAI)
		{
			warn(uneval(cmpUnitAI.order));
			if (!cmpUnitAI.order)
			{
				warn("assigning order to ship");
				//send ship
				cmpUnitAI.Walk(this.ungarrisonPos.x, this.ungarrisonPos.y, true);
			}
			else if (cmpUnitAI.order.type != "Walk")
			{
				warn("assigning order to ship");
				//send ship
				cmpUnitAI.Walk(this.ungarrisonPos.x, this.ungarrisonPos.y, true);
			
			}
		}
		else 
		{
			//ship must have been destroyed
			this.invasion_under_way == false;
		}
	}
}
	
//spawn random attack
Trigger.prototype.spawnInvasionAttack = function(data)
{
	if (this.invasion_under_way == true)
	{
		warn("invasion attack ordered when already one is going on");
		return;
	}
	
	//check if enemies have docks
	let have_docks = false;
	let spawn_docks = [];
	for (let e = 0; e < this.enemies.length; ++e)
	{
		let docks_e = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(this.enemies[e]), "Dock").filter(TriggerHelper.IsInWorld);
		spawn_docks = spawn_docks.concat(docks_e);
		
		if (docks_e.length > 0)
		{
			have_docks = true;
		}
	}
	
	if (!have_docks)
	{
		warn("no docks found");
		return;
	}
	
	//decide how many ships to spawn and where
	let spawn_site = pickRandom(spawn_docks);
	let owner = 6;//TriggerHelper.GetOwner(spawn_site);
	let attacker_ships = [];
	
	
	let cmpTrigger = Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger);
	let triggerPoint = pickRandom(this.GetTriggerPoints(triggerPointShipInvasionSpawn));

	
	//let ship_spawned = TriggerHelper.SpawnUnits(spawn_site,this.spawn_ship_templates[1],1,owner);
	let ship_spawned = TriggerHelper.SpawnUnits(triggerPoint, this.spawn_ship_templates[1], 1, owner);
	let ship_invasion_garrison = [];
		
	//spawn the invasion force inside the ship
	for (let j = 0; j < 25; ++j)
	{
		let u_j = TriggerHelper.SpawnGarrisonedUnits(ship_spawned[0],pickRandom(this.greekInfTypes),1,owner);
		ship_invasion_garrison.push(u_j);
	}
		
	//spawn some siege
	for (let j = 0; j < 2; ++j)
	{
		let u_j = TriggerHelper.SpawnGarrisonedUnits(ship_spawned[0],pickRandom(this.greekSiegeTypes),1,owner);
		ship_invasion_garrison.push(u_j);

	}
		
		
	//make sure the unit has no orders, for some reason after garissoning, the order queue is full of pick up orders
	let cmpUnitAI = Engine.QueryInterface(ship_spawned[0], IID_UnitAI);
	cmpUnitAI.orderQueue = [];
	cmpUnitAI.order = undefined;
	cmpUnitAI.isIdle = true;
			
	attacker_ships.push(ship_spawned[0]);
	
	
	this.invasion_under_way = true;
	this.invasion_ship = ship_spawned[0];
	this.ship_invasion_garrison = ship_invasion_garrison;
	
	let ungarrison_point = pickRandom(this.GetTriggerPoints(triggerPointShipUnload));
	let ungarrisonPos = TriggerHelper.GetEntityPosition2D(ungarrison_point);
	warn(uneval(ungarrisonPos));
	
	this.invasion_under_way = true;
	this.invasion_ship = ship_spawned[0];
	this.ship_invasion_garrison = ship_invasion_garrison;
	this.ungarrisonPos = ungarrisonPos;
	
	//send ship
	cmpUnitAI.Walk(ungarrisonPos.x, ungarrisonPos.y, true);
	
	//cmpUnitAI.WalkToTarget(12101,true);
	//cmpUnitAI.WalkAndFight(target_position.x,target_position.y,null);
	
	
	/*let gholder = Engine.QueryInterface(ship_spawned[0], IID_GarrisonHolder);
	for (let unit of garrison_units)
	{
		//let uAI = Engine.QueryInterface(unit, IID_UnitAI);
		//uAI.AddOrder("Ungarrison", null, true);
		gholder.Unload(unit,false);
	}*/
	
	//cmpUnitAI.AddOrder("Walk", { "x": target_position.x, "y": target_position.y, "force": true }, true);
	//cmpUnitAI.AddOrder("Ungarrison", null, true);
	
	/*for (let unit of garrison_units)
	{
		let uAI = Engine.QueryInterface(unit, IID_UnitAI);
		uAI.AddOrder("Ungarrison", null, true);
	}*/
			
}


Trigger.prototype.IntervalActionShipAttack = function(data)
{
	//check if enemies have docks
	let have_docks = false;
	let spawn_docks = [];
	for (let e of [0,4,6])
	{
		let docks_e = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(e), "Dock").filter(TriggerHelper.IsInWorld);
		spawn_docks = spawn_docks.concat(docks_e);
		
		if (docks_e.length > 0)
		{
			have_docks = true;
		}
	}
	
	if (!have_docks)
	{
		warn("no docks found");
		return;
	}
		
	//check if human player has ships
	let human_warships = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(1), "Warship").filter(TriggerHelper.IsInWorld);
	
	//too easy
	//if (human_warships.length == 0)
	//	return;
	
	//decide how many ships to spawn and where
	let spawn_site = pickRandom(spawn_docks);
	let owner = 0;//TriggerHelper.GetOwner(spawn_site);
	let attack_size = Math.floor(Math.pow(human_warships.length,0.5)) + 1;
	let attacker_ships = [];
	
	warn("ship attack size = "+attack_size);
	
	for (let i = 0; i < attack_size; i ++)
	{
		let ship_spawned = TriggerHelper.SpawnUnits(spawn_site,pickRandom(this.spawn_ship_templates),1,owner);
		
		//spawn the garrison inside the ship
		TriggerHelper.SpawnGarrisonedUnits(ship_spawned[0],pickRandom(this.spawn_garrison_templates),this.garrisonCount,owner);
			
		//make sure the unit has no orders, for some reason after garissoning, the order queue is full of pick up orders
		let cmpUnitAI = Engine.QueryInterface(ship_spawned[0], IID_UnitAI);
		cmpUnitAI.orderQueue = [];
		cmpUnitAI.order = undefined;
		cmpUnitAI.isIdle = true;
			
		attacker_ships.push(ship_spawned[0]);
	}
	
	//check for idle ships
	/*let current_warships = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(owner), "Warship").filter(TriggerHelper.IsInWorld);
	
	for (let ship of current_warships)
	{
		let cmpUnitAI = Engine.QueryInterface(ship, IID_UnitAI);
		if (cmpUnitAI.IsIdle())
			attacker_ships.push(ship);
	}*/
	
	
	//pick target
	let dock_targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "Dock").filter(TriggerHelper.IsInWorld);
	
	let ship_targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "Ship").filter(TriggerHelper.IsInWorld);
	
	let target = undefined;
	if (dock_targets.length == 0)
		target = pickRandom(ship_targets);
	else if (ship_targets.length == 0)
		target = pickRandom(dock_targets);
	else if (Math.random() < 0.4)
		target = pickRandom(dock_targets);
	else 
		target = pickRandom(ship_targets);
	
	for (let attacker of attacker_ships)
	{
		let cmpUnitAI = Engine.QueryInterface(attacker, IID_UnitAI);
		cmpUnitAI.Attack(target);
	}	
}

Trigger.prototype.IntervalActionTraders = function(data)
{
	warn("interval traders");

	for (let e = 0; e < this.enemies.length; ++e)
	{
		//make list of land traders
		let traders_e = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(this.enemies[e]), "Trader+!Ship").filter(TriggerHelper.IsInWorld);
		//traders_e = TriggerHelper.MatchEntitiesByClass(traders_e, "Human");
		
		//warn("Traders from player " + this.enemies[e]);
		//warn(uneval(traders_e));
		
		//make list of own markets
		let markets_e = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(this.enemies[e]), "Market").filter(TriggerHelper.IsInWorld);
		
		if (markets_e.length > 0)
		{
			
			//warn("Markets from player " + this.enemies[e]);
			//warn(uneval(markets_e));
			
			//make list of possible other markets
			let markets_others = [];
			for (let p = 0; p < this.enemies.length; ++p)
			{
				if (this.enemies[e] != this.enemies[p])
				{
					let markets_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(this.enemies[p]), "Market+!Dock").filter(TriggerHelper.IsInWorld);
			
					markets_others = markets_others.concat(markets_p);
				}
			}
			
			//randomly assign each trader to a market of another player
			for (let trader of traders_e)
			{
				let cmpUnitAI = Engine.QueryInterface(trader, IID_UnitAI);
				if (cmpUnitAI) {
					if (cmpUnitAI.IsIdle())
					{
						//warn("updating trade orders");
						cmpUnitAI.UpdateWorkOrders("Trade");
						cmpUnitAI.SetupTradeRoute(pickRandom(markets_others),markets_e[0],null,true);
					}
				}
				
			}
			
			//make list of sea traders
			let traders_s = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(this.enemies[e]), "Trader+Ship").filter(TriggerHelper.IsInWorld);
			//warn("Found "+traders_s.length+" ships for player "+this.enemies[e]);
			//warn(uneval(traders_s));
			//make list of own docks
			let docks_e = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(this.enemies[e]), "Dock").filter(TriggerHelper.IsInWorld);
			//warn("Found "+docks_e.length+" docks of our own");
			//warn(uneval(docks_e));
			
			//make list of possible other docks
			let docks_others = [];
			for (let p = 0; p < this.enemies.length; ++p)
			{
				if (this.enemies[e] != this.enemies[p])
				{
					let markets_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(this.enemies[p]), "Dock").filter(TriggerHelper.IsInWorld);
			
					docks_others = docks_others.concat(markets_p);
				}
			}
			//warn("Found "+docks_others.length+" docks of others");
			//warn(uneval(docks_others));
			
			
			//randomly assign each ship to a dock of another player
			for (let trader of traders_s)
			{
				let cmpUnitAI = Engine.QueryInterface(trader, IID_UnitAI);
				if (cmpUnitAI) {
					if (cmpUnitAI.IsIdle())
					{
						//warn("updating ship orders");
						cmpUnitAI.UpdateWorkOrders("Trade");
						cmpUnitAI.SetupTradeRoute(pickRandom(docks_others),docks_e[0],null,true);
					}
				}
				
			}
		}
		
	}
}

Trigger.prototype.SetDifficultyLevel = function(data)
{
	//Very Hard: 1.56; Hard: 1.25; Medium 1
	
	let difficulty = 0;
	
	for (let player of this.enemies)
	{
		let cmpPlayer = QueryPlayerIDInterface(player);
		let ai_mult = cmpPlayer.GetGatherRateMultiplier();
		let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
		
		if (ai_mult == 1.25)
		{
			difficulty = 1;
			
			if (player == 6)
			{
				this.greekPopLimit = 120;
				this.greekPatrolSize += 1;
				this.greekDiv = 95.0;
				this.greekSpecialSize += 5;
				this.garrisonCount += 2;
				
			}
			else {
				this.garrisonCount += 2;
			}
			
			this.points_trickle = 150;
		}
		else if (ai_mult >= 1.5)
		{
			warn(player);
			difficulty = 2;
			
			if (player == 6)
			{
				this.greekPopLimit = 180;
				this.greekPatrolSize += 3;
				this.greekDiv = 75.0;
				this.greekSpecialSize += 12;
				this.garrisonCount += 4;
			}
			else {
				this.garrisonCount += 4;
			}
			
			this.points_trickle = 200;
		}
	}
	/*
	if (difficulty == 1)
	{
		this.spawn_ship_bonus = 0;
		this.spawn_cav_bonus = 4;
		this.ship_garrison_size = 6;
		this.shipAttackInterval = this.shipAttackInterval*0.95;
		
	}
	else if (difficulty == 2)
	{
		this.spawn_ship_bonus = 1;
		this.spawn_cav_bonus = 8;
		this.ship_garrison_size = 10;	
		this.shipAttackInterval = this.shipAttackInterval*0.9;
	}*/
}



Trigger.prototype.SpawnLandTraders = function(data)
{
	for (let e = 0; e < this.enemies.length; ++e)
	{
		//make list of own markets
		let markets_e = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(this.enemies[e]), "Market+!Dock").filter(TriggerHelper.IsInWorld);
		
		if (this.enemies[e] == 4) //look for docks
			 markets_e = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(this.enemies[e]), "Market").filter(TriggerHelper.IsInWorld);
			 
		if (markets_e.length > 0)
		{
		
			//make list of traders
			let traders_e = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(this.enemies[e]), "Trader+!Ship").filter(TriggerHelper.IsInWorld);
			
			if (traders_e.length < 6)
			{
				//make list of others markets
				//make list of others' docks
				let markets_others = [];
				for (let p of this.enemies)
				{
					if (p != this.enemies[e]){
						let markets_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Market+!Dock").filter(TriggerHelper.IsInWorld);
					
						markets_others = markets_others.concat(markets_p);
					}
				}
				
				if (markets_others.length > 0){
				

					let site = pickRandom(markets_e);
					
					warn("Spawning trader for player "+this.enemies[e]+" at site = " + site);
					let trader = TriggerHelper.SpawnUnits(site,"units/athen_support_trader",1,this.enemies[e]);
					
					let cmpUnitAI = Engine.QueryInterface(trader[0], IID_UnitAI);
				
					cmpUnitAI.UpdateWorkOrders("Trade");
					cmpUnitAI.SetupTradeRoute(pickRandom(markets_others),site,null,true);
					//warn("Spawning trader for player "+this.enemies[e]);
				}
			}
		}
	}
	
	this.DoAfterDelay(90 * 1000, "SpawnLandTraders",null);
}

//spawn enemny trade ships once in a while
Trigger.prototype.spawnTradeShips = function(data)
{
	for (let e = 0; e < this.enemies.length; ++e)
	{
		//get list of docks
		let docks_e = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(this.enemies[e]), "Dock").filter(TriggerHelper.IsInWorld);
		
		if (docks_e.length > 0)
		{
			//get list of trade ships
			let traders_e = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(this.enemies[e]), "Trader+Ship").filter(TriggerHelper.IsInWorld);
			
			if (traders_e.length < 5)
			{
				//make list of others' docks
				let docks_others = [];
				for (let p of this.enemies)
				{
					if (p != this.enemies[e]){
						let docks_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Dock").filter(TriggerHelper.IsInWorld);
					
						docks_others = docks_others.concat(docks_p);
					}
				}
				
				if (docks_others.length > 0)
				{
					let spawn_dock = pickRandom(docks_e)
					let trader = TriggerHelper.SpawnUnits(spawn_dock, "units/pers_ship_merchant",1,this.enemies[e]);
					
					warn("spawned trade ship");
					
					let cmpUnitAI = Engine.QueryInterface(trader[0], IID_UnitAI);
				
					cmpUnitAI.UpdateWorkOrders("Trade");
					cmpUnitAI.SetupTradeRoute(pickRandom(docks_others),spawn_dock,null,true);
					
					
				}
			}
		}
	}
	
	this.DoAfterDelay(90 * 1000, "spawnTradeShips",null);
}

//garison AI entities with archers
Trigger.prototype.GarrisonEntities = function(data)
{
	
	for (let p of [0,4,6])
	{
		let towers_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "GarrisonTower").filter(TriggerHelper.IsInWorld);
		
		let size = 5;

		
		for (let e of towers_p)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(e, "units/athen/champion_ranged",size,p);
			
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(e,true);
			}
		}
		
		//fortresses
		let forts_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Fortress").filter(TriggerHelper.IsInWorld);
		
		for (let e of forts_p)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(e, "units/athen/champion_ranged",20,p);
			
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(e,true);
			}
		}
		
		if (p == 4)
		{
			let camps_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p),"MercenaryCamp").filter(TriggerHelper.IsInWorld);
			
			for (let c of camps_p)
			{
				//spawn the garrison inside the tower
				let archers_e = TriggerHelper.SpawnUnits(c, "units/athen/champion_ranged",10,p);
				
				for (let a of archers_e)
				{
					let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
					cmpUnitAI.Garrison(c,true);
				}
			}
		}
	}
	
}	


Trigger.prototype.GreekAttack = function(data)
{
	let camps = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(6),"CivilCentre").filter(TriggerHelper.IsInWorld);
	
	if (camps.length == 0){
		warn("No camps found");
		return;
	}
	
	let spawn_site = camps[0];
	
	let num_attackers = Math.floor(this.points_player6 / this.greekDiv)+4;
	warn("Num attackers = "+num_attackers);
	let attackers = [];
	
	//find any idle soldiers
	let units = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(6),"Infantry").filter(TriggerHelper.IsInWorld);
	for (let u of units)
	{
		let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
		if (cmpUnitAI)
		{
			if (cmpUnitAI.IsIdle()){
				attackers.push(u);
			}
		}
	}
	
	
	for (let i = 0; i < num_attackers; ++i)
	{
		let units_i = TriggerHelper.SpawnUnits(spawn_site,pickRandom(this.greekInfTypes),1,6);
		attackers.push(units_i[0]);
	}
	
	let num_siege = Math.floor(this.points_player6 / (5*75.0))+1;
	for (let i = 0; i < num_siege; ++i)
	{
		let units_i = TriggerHelper.SpawnUnits(spawn_site,pickRandom(this.greekSiegeTypes),1,6);
		attackers.push(units_i[0]);
	}
	
	
	//set formation
	TriggerHelper.SetUnitFormation(6, attackers, pickRandom(unitFormations));

	//find target
	let target_player = 1;
	if (Math.random() < 0.25)
		target_player = 7;
	let target = this.findClosestTarget(attackers[0],target_player,unitTargetClass);
	
	ProcessCommand(6, {
		"type": "attack",
		"entities": attackers,
		"target": target,
		"queued": true,
		"allowCapture": false
	});
}

Trigger.prototype.SpecialGreekAttack = function(data)
{
	let cmpTrigger = Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger);
	let triggerPoint = pickRandom(cmpTrigger.GetTriggerPoints(triggerPointGreekSpecialAttack));
	
	
	let num_attackers = 36;
	let attackers = [];
	
	for (let i = 0; i < num_attackers; ++i)
	{
		let units_i = TriggerHelper.SpawnUnits(triggerPoint,pickRandom(this.greekInfTypes),1,6);
		attackers.push(units_i[0]);
	}
	
	let num_siege = Math.floor(num_attackers/6.0)+1;
	for (let i = 0; i < num_siege; ++i)
	{
		let units_i = TriggerHelper.SpawnUnits(triggerPoint,"units/athen/siege_oxybeles_packed",1,6);
		attackers.push(units_i[0]);
	}
	
	
	//set formation
	TriggerHelper.SetUnitFormation(6, attackers, pickRandom(unitFormations));

	//find target
	let target_player = 1;
	let target = this.findClosestTarget(attackers[0],target_player,unitTargetClass);
	
	ProcessCommand(6, {
		"type": "attack",
		"entities": attackers,
		"target": target,
		"queued": false,
		"allowCapture": false
	});
}

Trigger.prototype.CapadociaAttack = function(data)
{
	let camps = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(4),"MercenaryCamp").filter(TriggerHelper.IsInWorld);
	
	if (camps.length == 0)
		return;
	
	let spawn_site = camps[0];
	
	let num_attackers = Math.floor(this.points_player4 / this.capaDiv)+4;
	warn("Num attackers = "+num_attackers);
	let attackers = [];
	
	//find any idle soldiers
	let units = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(4),"Cavalry").filter(TriggerHelper.IsInWorld);
	for (let u of units)
	{
		let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
		if (cmpUnitAI)
		{
			if (cmpUnitAI.IsIdle()){
				attackers.push(u);
			}
		}
	}
	
	//spawn attackers
	for (let i = 0; i < num_attackers; ++i)
	{
		let units_i = TriggerHelper.SpawnUnits(spawn_site,pickRandom(this.persianCavTypes),1,4);
		attackers.push(units_i[0]);
	}
	
	
	
	
	//set formation
	TriggerHelper.SetUnitFormation(4, attackers, pickRandom(unitFormations));

	//find target
	let target = this.findClosestTarget(attackers[0],1,unitTargetClass);
	
	ProcessCommand(4, {
		"type": "attack",
		"entities": attackers,
		"target": target,
		"queued": true,
		"allowCapture": false
	});
}

Trigger.prototype.UpdatePoints = function(data)
{
	//automatic trickle
	warn("trickle = "+this.points_trickle);
	this.points_player4 += this.points_trickle;
	this.points_player6 += this.points_trickle;
	


	//player 4
	let cmpPlayer = QueryPlayerIDInterface(4);
	let resources = cmpPlayer.GetResourceCounts();
	let current_points = 0;
	current_points += resources.food;
	current_points += resources.wood;
	current_points += resources.stone;
	current_points += resources.metal;
	warn("pl4 Current resources = "+uneval(resources));
	
	if (this.resources_last_player4 == undefined)
	{
		this.resources_last_player4 = current_points;
	}
	else
	{
		let gain = current_points - this.resources_last_player4;
		warn("pl4 gain is: "+gain);
		this.resources_last_player4 = current_points;
		
		if (gain > 0)
			this.points_player4 += gain;
		warn("pl4 points are: "+this.points_player4);
	}
	
	//player 6
	cmpPlayer = QueryPlayerIDInterface(6);
	resources = cmpPlayer.GetResourceCounts();
	current_points = 0;
	current_points += resources.food;
	current_points += resources.wood;
	current_points += resources.stone;
	current_points += resources.metal;
	warn("pl6 Current resources = "+uneval(resources));
	
	if (this.resources_last_player6 == undefined)
	{
		this.resources_last_player6 = current_points;
	}
	else
	{
		let gain = current_points - this.resources_last_player6;
		warn("pl6 gain is: "+gain);
		this.resources_last_player6 = current_points;
		
		if (gain > 0)
			this.points_player6 += gain;
	}
	
	//decide whether to spend points
	if (this.points_player4 >= 1000) //check if over threshold
	{
		if (Math.random() < 0.35) // with small probability, we launch attack
		{
			warn("Attack!");
			this.CapadociaAttack();
			
			this.points_player4 = 0;
		}
		else {
			//save points for later
		}
		
	}
	
	if (this.points_player6 >= 1000) //check if over threshold
	{
		if (Math.random() < 0.35) // with small probability, we launch attack
		{
			warn("Attack!");
			this.GreekAttack();
			
			this.points_player6 = 0;
		}
		else {
			//save points for later
		}
		
	}
}

{
	let cmpTrigger = Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger);

	// Activate all possible triggers
	let data = { "enabled": true };
	cmpTrigger.RegisterTrigger("OnStructureBuilt", "StructureBuiltAction", data);
	cmpTrigger.RegisterTrigger("OnConstructionStarted", "ConstructionStartedAction", data);
	cmpTrigger.RegisterTrigger("OnTrainingFinished", "TrainingFinishedAction", data);
	cmpTrigger.RegisterTrigger("OnTrainingQueued", "TrainingQueuedAction", data);
	cmpTrigger.RegisterTrigger("OnResearchFinished", "ResearchFinishedAction", data);
	cmpTrigger.RegisterTrigger("OnResearchQueued", "ResearchQueuedAction", data);
	cmpTrigger.RegisterTrigger("OnOwnershipChanged", "OwnershipChangedAction", data);
	cmpTrigger.RegisterTrigger("OnPlayerCommand", "PlayerCommandAction", data);

	//state variables
	cmpTrigger.resources_last_player4 = undefined;
	cmpTrigger.resources_last_player6 = undefined;
	cmpTrigger.points_player4 = 0;
	cmpTrigger.points_player6 = 0;
	
	
	cmpTrigger.invasion_under_way = false;
	cmpTrigger.invasion_ship = undefined;
	cmpTrigger.ship_invasion_garrison = undefined;
	cmpTrigger.tower_destroyed_event_happened = false;
	cmpTrigger.cc_destroyed_event_happened = false;
	cmpTrigger.fortress_destroyed_event_happened = false;
	cmpTrigger.dock_destroyed_event_happened = false;
	
	
	
	//some constants
	cmpTrigger.greekPopLimit = 90;
	cmpTrigger.greekPatrolSize = 5;
	cmpTrigger.greekDiv = 105.0;
	cmpTrigger.capaDiv = 105.0;
	cmpTrigger.greekSpecialSize = 26;
	cmpTrigger.garrisonCount = 5;
	cmpTrigger.points_trickle = 100;
	
	cmpTrigger.persianCavTypes = ["units/pers_cavalry_spearman_a","units/pers_cavalry_javelinist_a","units/pers/champion_cavalry_archer","units/pers_cavalry_archer_a","units/sele_champion_cavalry"];

	cmpTrigger.greekInfTypes = ["units/athen/champion_ranged","units/athen/champion_marine","units/athen/champion_infantry","units/athen_champion_ranged_gastraphetes","units/thebes_sacred_band_hoplitai"];
	cmpTrigger.greekSiegeTypes = ["units/athen/siege_oxybeles_packed","units/athen_mechanical_siege_oxybeles_packed","units/mace/siege_lithobolos_packed"];

	//list of enemy players and other constants
	cmpTrigger.enemies = [2,3,4,5,6];
	//get list of possible gaul ships
	cmpTrigger.spawn_ship_templates = TriggerHelper.GetTemplateNamesByClasses("Warship", "athen", undefined, undefined, true);
	cmpTrigger.spawn_garrison_templates = TriggerHelper.GetTemplateNamesByClasses("Infantry+Ranged", "athen", undefined, undefined, true);
	


	//set starting tech
	let cmpPlayer = QueryPlayerIDInterface(1);
	cmpPlayer.AddStartingTechnology("unlock_shared_los");
	
	for (let p of [1,2,3,4,5,6,7])
	{
		cmpPlayer = QueryPlayerIDInterface(p);
		if (p == 7 || p == 3)
			cmpPlayer.AddStartingTechnology("phase_town_athen");
		else
			cmpPlayer.AddStartingTechnology("phase_town_generic");
	}
	
	//set disables templates
	cmpPlayer = QueryPlayerIDInterface(6);
	cmpPlayer.SetDisabledTemplates(["units/spart_support_female_citizen","units/spart_support_female_citizen_house"]);
	
	
	//one time actions
	cmpTrigger.DoAfterDelay(4 * 1000,"SetDifficultyLevel",null);
	cmpTrigger.DoAfterDelay(2 * 1000,"GarrisonEntities",null);
	
	//repeated actions
	cmpTrigger.DoAfterDelay(90 * 1000, "spawnTradeShips",null);
	cmpTrigger.DoAfterDelay(90 * 1000, "SpawnLandTraders",null);
	
	
	
	//cmpTrigger.DoAfterDelay(10 * 1000, "spawnInvasionAttack",null);
	
	
	// register invasion unload trigger
	cmpTrigger.RegisterTrigger("OnRange", "InvasionRangeAction", {
		"entities": cmpTrigger.GetTriggerPoints(triggerPointShipUnload), // central points to calculate the range circles
		"players": [6], // only count entities of player 6
		"maxRange": 20,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});
	
	cmpTrigger.RegisterTrigger("OnInterval", "IntervalActionShipAttack", {
		"enabled": true,
		"delay": 210 * 1000,
		"interval": 180 * 1000,
	});
	
	cmpTrigger.RegisterTrigger("OnInterval", "IntervalActionTraders", {
		"enabled": true,
		"delay": 3 * 1000,
		"interval": 90 * 1000,
	});
	
	
	cmpTrigger.RegisterTrigger("OnInterval", "IntervalActionSpawnPatrol", {
		"enabled": true,
		"delay": 120 * 1000,
		"interval": 90 * 1000,
	});
	
	cmpTrigger.RegisterTrigger("OnInterval", "UpdatePoints", {
		"enabled": true,
		"delay": 5 * 1000,
		"interval": 60 * 1000,
	});
	
	cmpTrigger.RegisterTrigger("OnInterval", "checkInvasionAttack", {
		"enabled": true,
		"delay": 5 * 1000,
		"interval": 15 * 1000,
	});
	
	
	
};

