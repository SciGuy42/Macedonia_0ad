warn("loading the triggers file");

///////////////////////
// Trigger listeners //
///////////////////////

var triggerPointShipUnload = "B";


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

Trigger.prototype.CheckVictoryCondition = function(data)
{
	//warn("The OnResearchQueued event happened with the following data:");
	//warn(uneval(data));
	let greek_docks = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(4), "Dock").filter(TriggerHelper.IsInWorld);
	let greek_ccs = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(4), "CivilCentre").filter(TriggerHelper.IsInWorld);;
			
	if (greek_docks.length == 0 && greek_ccs.length == 0)
	{
		let cmpEndGameManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_EndGameManager);
				
		let cmpPlayer = QueryPlayerIDInterface(1);
				
		cmpEndGameManager.MarkPlayerAndAlliesAsWon(cmpPlayer.GetPlayerID(),n => markForPluralTranslation(
					"%(lastPlayer)s has won (mission victory).",
					"%(players)s and %(lastPlayer)s have won (mission victory).",
					n),
				n => markForPluralTranslation(
					"%(lastPlayer)s has been defeated (mission victory).",
					"%(players)s and %(lastPlayer)s have been defeated (mission victory).",
					n));
	}
};

//check victory
			

Trigger.prototype.OwnershipChangedAction = function(data)
{
	//warn("The OnOwnershipChanged event happened with the following data:");
	//warn(uneval(data));
	
	if (data.from == 0 && data.to == 1)  //we captured something
	{
		if (this.gaia_houses.indexOf(data.entity) >= 0 && this.captured_houses.indexOf(data.entity) < 0)
		{
			//we captured a house
			let cmpPlayer = QueryPlayerIDInterface(1);
			cmpPlayer.AddPopulationBonuses(5);
			warn("captured house");
			
			this.captured_houses.push(data.entity);
		}
		else if (this.gaia_docks.indexOf(data.entity) >= 0)
		{
			this.captured_dock = true;
			//this.spawnShipAttack();
			
			//turn on ship spawn attacks
			this.DoAfterDelay(60 * 1000,"spawnShipAttack",null);
			
			//spawn some support units
			TriggerHelper.SpawnUnits(data.entity,"units/mace/ship_fishing",2,1);
			TriggerHelper.SpawnUnits(data.entity,"units/mace/ship_merchant",2,1);	
			
			this.escortShipGarrison += 1;
		}
		else if (data.entity == 12058) //temple
		{
			if (this.captured_temple == false)
			{
				//we get some tech -- improved line of sight, regeneration when idle
				let cmpPlayer = QueryPlayerIDInterface(1);
				let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
				cmpTechnologyManager.ResearchTechnology("carthaginians/special_exploration");
				cmpTechnologyManager.ResearchTechnology("romans/vision_sibylline");
				cmpTechnologyManager.ResearchTechnology("health_regen_units");
				warn("captured temple");
				
				this.captured_temple = true;
				
				//add additional troops to garrison
				this.attackShipGarrison += 1;
			}
		}
		else if (data.entity == 12464) //gaia blacksmith
		{
			if (this.captured_smith == false)
			{
				//we get some blacksmith tech
				let cmpPlayer = QueryPlayerIDInterface(1);
				let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
				
				cmpTechnologyManager.ResearchTechnology("attack_infantry_ranged_01");
				cmpTechnologyManager.ResearchTechnology("attack_infantry_ranged_02");
				cmpTechnologyManager.ResearchTechnology("attack_soldiers_will");
				cmpTechnologyManager.ResearchTechnology("armor_ship_reinforcedhull");
				cmpTechnologyManager.ResearchTechnology("armor_ship_hypozomata");
				//cmpTechnologyManager.ResearchTechnology("romans/vision_sibylline");
				//cmpTechnologyManager.ResearchTechnology("health_regen_units");
				warn("captured smith");
				this.captured_smith = true;
				
				//add additional troops to garrison
				this.attackShipGarrison += 1;
				this.escortShipGarrison += 1;
			}
		}
		else if (data.entity == 12602) //gaia workshop
		{
			if (this.captured_shop == false)
			{
				//spawn some siege catapults
				TriggerHelper.SpawnUnits(12602,"units/mace/siege_lithobolos_packed",3,1);
				
				//we get some siege tech
				let cmpPlayer = QueryPlayerIDInterface(1);
				let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
				
				cmpTechnologyManager.ResearchTechnology("siege_armor");
				cmpTechnologyManager.ResearchTechnology("siege_attack");
				cmpTechnologyManager.ResearchTechnology("siege_packing");
				
				warn("captured siege");
				
				this.captured_shop = true;
				
				//add additional troops to garrison
				this.attackShipGarrison += 1;
				this.escortShipGarrison += 2;
			}
		}
		//cmpTechnologyManager.ResearchTechnology("attack_infantry_ranged_02");
			
		
	}
	else if (data.from == 4)
	{
		if (this.greek_docks.indexOf(data.entity) >= 0)
		{
			//get list of remaining docks
			//Greek rebel docks
			let docks = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(4), "Dock").filter(TriggerHelper.IsInWorld);
	
			if (docks.length > 0)
			{
				//spawn attack from random dock
				//this.specialShipAttack();
				
				//spawn invasion attack
				this.DoAfterDelay(10 * 1000,"spawnInvasionAttack",null);
	
				this.DoAfterDelay(20 * 1000,"specialShipAttack",null);
	
			}
			else 
			{
				this.CheckVictoryCondition();
			}
			
		}
		else if (this.greek_ccs.indexOf(data.entity) >= 0)
		{
			this.CheckVictoryCondition();
		}
		
		//check victory condition
		
		
	}
};

Trigger.prototype.PlayerCommandAction = function(data)
{
	//warn("The OnPlayerCommand event happened with the following data:");
	//warn(uneval(data));
};


Trigger.prototype.IntervalActionCavAttack = function(data)
{
	
};

Trigger.prototype.IntervalAction = function(data)
{
	
};



Trigger.prototype.InvasionRangeAction = function(data)
{
	//warn("The Invasion OnRange event happened with the following data:");
	//warn(uneval(data));
	
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
				this.invasion_under_way = false;
			}
		}
	}
}


Trigger.prototype.RangeAction = function(data)
{
	warn("The OnRange event happened with the following data:");
	warn(uneval(data));
	
	if (this.spawnedBigShip == false)
	{
		this.spawnedBigShip = true;
		
		let big_ships = TriggerHelper.SpawnUnits(12170, "units/ptol/ship_quinquereme", 1, 1);
		TriggerHelper.SpawnUnits(12170,"units/mace/siege_lithobolos_packed",2,1);
		
		this.big_ship = big_ships[0];
		this.DoAfterDelay(this.catapultShipAttackInterval,"spawnCatapultShipAttack",null);
	}
};

var disabledTemplates = (civ) => [
	// Economic structures
	/*"structures/" + civ + "/corral",
	"structures/" + civ + "/farmstead",
	"structures/" + civ + "/field",
	"structures/" + civ + "/storehouse",
	"structures/" + civ + "/rotarymill",
	"structures/" + civ + "/market",*/
	
	// Expansions
	"structures/" + civ + "/civil_centre",
	"structures/" + civ + "/military_colony",

	// Walls
	"structures/" + civ + "/wallset_stone",
	"structures/rome/wallset_siege",
	"structures/wallset_palisade",

	// Shoreline
	/*"structures/" + civ + "/dock",
	"structures/brit/crannog",
	"structures/cart/super_dock",
	"structures/ptol/lighthouse"*/
];

/*let ents_5 = TriggerHelper.GetEntitiesByPlayer(4);
	for (let e of ents_5)
	{
		let cmpBuildingAI = Engine.QueryInterface(e, IID_Identity);
		if (cmpBuildingAI)
		{
			warn(uneval(cmpBuildingAI));
		}
		
	}
	*/
	
//spawn ship guarding a trade vessel
Trigger.prototype.spawnShipEscort = function(data)
{
	//pick random enemy player and get ship types
	let random_enemy = pickRandom(this.enemy_players);
	let cmpPlayer = QueryPlayerIDInterface(random_enemy);
	let shipTypes = TriggerHelper.GetTemplateNamesByClasses("Warship", QueryPlayerIDInterface(random_enemy, IID_Identity).GetCiv(), undefined, undefined, true); 
	
	//check to see that player has ship traders and docks
	let traders_e = TriggerHelper.MatchEntitiesByClass(TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(random_enemy), "Trader").filter(TriggerHelper.IsInWorld),"Ship");
	
	//pick dock
	let docks = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(random_enemy), "Dock").filter(TriggerHelper.IsInWorld);
	
	let warships = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(random_enemy), "Warship").filter(TriggerHelper.IsInWorld);
	
	
	if (traders_e.length > 0 && docks.length > 0 && warships.length < this.maxNumEscorts)
	{
		let spawn_site = pickRandom(docks);
		
		let ship_spawned = TriggerHelper.SpawnUnits(spawn_site,pickRandom(shipTypes),1,random_enemy);
		
		//spawn the garrison inside the ship
		TriggerHelper.SpawnGarrisonedUnits(ship_spawned[0], "units/athen/champion_ranged",this.escortShipGarrison,random_enemy);
		
		let cmpUnitAI = Engine.QueryInterface(ship_spawned[0], IID_UnitAI);
		cmpUnitAI.orderQueue = [];
		cmpUnitAI.order = undefined;
		cmpUnitAI.isIdle = true;
		
		cmpUnitAI.Guard(pickRandom(traders_e),true);
		warn("spawned escort ship");
	}
	
	this.DoAfterDelay(this.shipEscortInterval,"spawnShipEscort",null);
	
}
	
//spawn attack on catapult ship
Trigger.prototype.spawnCatapultShipAttack = function(data)
{
	//pick random enemy player
	let random_enemy = pickRandom([2,4]);
	
	let cmpPlayer = QueryPlayerIDInterface(random_enemy);
	let shipTypes = TriggerHelper.GetTemplateNamesByClasses("Warship", QueryPlayerIDInterface(random_enemy, IID_Identity).GetCiv(), undefined, undefined, true);
	
	//pick dock
	let docks = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(random_enemy), "Dock").filter(TriggerHelper.IsInWorld);
	
	if (docks.length > 0)
	{
		let spawn_site = pickRandom(docks);
		let num_ships = Math.floor(Math.random() * 3)+1;
		let garrisonCount = Math.floor(Math.random() * 10)+5;
		
		for (let k = 0; k < num_ships; k ++)
		{
			let ship_spawned = TriggerHelper.SpawnUnits(spawn_site, "units/pers/ship_bireme", 1, random_enemy);
			
			//spawn the garrison inside the ship
			TriggerHelper.SpawnGarrisonedUnits(ship_spawned[0], "units/athen/champion_ranged",garrisonCount,random_enemy);
			
			//make sure the unit has no orders, for some reason after garissoning, the order queue is full of pick up orders
			let cmpUnitAI = Engine.QueryInterface(ship_spawned[0], IID_UnitAI);
			cmpUnitAI.orderQueue = [];
			cmpUnitAI.order = undefined;
			cmpUnitAI.isIdle = true;
			
			cmpUnitAI.Attack(this.big_ship);
		}
	}
	
	this.catapultShipAttackInterval = 0.99 * this.catapultShipAttackInterval;
	this.DoAfterDelay(this.catapultShipAttackInterval,"spawnCatapultShipAttack",null);
	
}

	
	

	
//spawn random attack
Trigger.prototype.spawnInvasionAttack = function(data)
{
	//pick random enemy player
	let random_enemy = 4;
	
	let cmpPlayer = QueryPlayerIDInterface(random_enemy);
	let shipTypes = TriggerHelper.GetTemplateNamesByClasses("Warship", QueryPlayerIDInterface(random_enemy, IID_Identity).GetCiv(), undefined, undefined, true); 
	let shipType = shipTypes[shipTypes.length-1];
	
	//pick dock
	let docks = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(random_enemy), "Dock").filter(TriggerHelper.IsInWorld);
	
	let spawn_site = docks[0];//pickRandom(docks);
	
	let ship_spawned = TriggerHelper.SpawnUnits(spawn_site,shipType,1,random_enemy);
	
	warn("spawned invasion ship");
	
	//spawn the garrison inside the ship
	TriggerHelper.SpawnGarrisonedUnits(ship_spawned[0], "units/athen/champion_ranged",10,random_enemy);
	TriggerHelper.SpawnGarrisonedUnits(ship_spawned[0], "units/theb_sacred_band",10,random_enemy);
			
	
	//make sure the unit has no orders, for some reason after garissoning, the order queue is full of pick up orders
	let cmpUnitAI = Engine.QueryInterface(ship_spawned[0], IID_UnitAI);
	cmpUnitAI.orderQueue = [];
	cmpUnitAI.order = undefined;
	cmpUnitAI.isIdle = true;
	
	this.invasion_under_way = true;
	this.invasion_ship = ship_spawned[0];
	
	//let ungarrison_point = this.GetTriggerPoints(pickRandom(triggerPointShipUnload));
	let ungarrison_point = pickRandom(this.GetTriggerPoints(triggerPointShipUnload));
	let ungarrisonPos = TriggerHelper.GetEntityPosition2D(ungarrison_point);
	warn(uneval(ungarrisonPos));
	
	//send ship
	cmpUnitAI.Walk(ungarrisonPos.x, ungarrisonPos.y, false);
	
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


//spawn random attack
Trigger.prototype.specialShipAttack = function(data)
{
	//pick random enemy player
	let random_enemy = pickRandom(this.enemy_players);
	
	let cmpPlayer = QueryPlayerIDInterface(random_enemy);
	let shipTypes = TriggerHelper.GetTemplateNamesByClasses("Warship", QueryPlayerIDInterface(random_enemy, IID_Identity).GetCiv(), undefined, undefined, true); 
	
	//pick dock
	let docks = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(random_enemy), "Dock").filter(TriggerHelper.IsInWorld);
	
	if (docks.length > 0)
	{
		let spawn_site = pickRandom(docks);
		
		//decide how many ships to spawn
		let units_pl1 = TriggerHelper.GetEntitiesByPlayer(1);
		let warships_pl1 = TriggerHelper.MatchEntitiesByClass(units_pl1, "Warship").filter(TriggerHelper.IsInWorld);
		let shipSpawnCount = Math.floor(warships_pl1.length/4.0 + 2);
		
		
		//spawn the ships 
		let attacker_ships = [];
		for (let i = 0; i < shipSpawnCount; ++i)
		{
			let ship_spawned = TriggerHelper.SpawnUnits(spawn_site,pickRandom(shipTypes),1,random_enemy);

			//spawn the garrison inside the ship
			TriggerHelper.SpawnGarrisonedUnits(ship_spawned[0], "units/athen/champion_ranged",10,random_enemy);
			
			//make sure the unit has no orders, for some reason after garissoning, the order queue is full of pick up orders
			let cmpUnitAI = Engine.QueryInterface(ship_spawned[0], IID_UnitAI);
			cmpUnitAI.orderQueue = [];
			cmpUnitAI.order = undefined;
			cmpUnitAI.isIdle = true;
			
			attacker_ships.push(ship_spawned[0]);
		}
		warn("spawned ships");
		
		//pick target
		let dock_targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "Dock").filter(TriggerHelper.IsInWorld);
	
		let ship_targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "Dock").filter(TriggerHelper.IsInWorld);
	
	
		let target = undefined;
		
		if (ship_targets.length == 0)
			target = pickRandom(dock_targets);
		else if (dock_targets.length == 0)
			target = pickRandom(ship_targets);
		else
		{
			let new_list = [pickRandom(ship_targets),pickRandom(dock_targets)];
			target = pickRandom(new_list);
		}
	
		for (let attacker of attacker_ships)
		{
			let cmpUnitAI = Engine.QueryInterface(attacker, IID_UnitAI);
			cmpUnitAI.Attack(target);
		}
	}	
}
	
//spawn random attack
Trigger.prototype.spawnShipAttack = function(data)
{
	//pick random enemy player
	let random_enemy = pickRandom(this.enemy_players);
	
	let cmpPlayer = QueryPlayerIDInterface(random_enemy);
	let shipTypes = TriggerHelper.GetTemplateNamesByClasses("Warship", QueryPlayerIDInterface(random_enemy, IID_Identity).GetCiv(), undefined, undefined, true); 
	
	warn(uneval(shipTypes));
	
	//pick dock
	let docks = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(random_enemy), "Dock").filter(TriggerHelper.IsInWorld);
	
	if (docks.length > 0)
	{
		let spawn_site = pickRandom(docks);
		
		//decide how many ships to spawn
		let units_pl1 = TriggerHelper.GetEntitiesByPlayer(1);
		let warships_pl1 = TriggerHelper.MatchEntitiesByClass(units_pl1, "Warship").filter(TriggerHelper.IsInWorld);
		let shipSpawnCount = Math.floor(warships_pl1.length/4.0 + 1);
		
		let garrisonCount = this.attackShipGarrison;
		
		//spawn the ships 
		let attacker_ships = [];
		for (let i = 0; i < shipSpawnCount; ++i)
		{
			let ship_spawned = TriggerHelper.SpawnUnits(spawn_site,pickRandom(shipTypes),1,random_enemy);

			//spawn the garrison inside the ship
			TriggerHelper.SpawnGarrisonedUnits(ship_spawned[0], "units/athen/champion_ranged",garrisonCount,random_enemy);
			
			//make sure the unit has no orders, for some reason after garissoning, the order queue is full of pick up orders
			let cmpUnitAI = Engine.QueryInterface(ship_spawned[0], IID_UnitAI);
			cmpUnitAI.orderQueue = [];
			cmpUnitAI.order = undefined;
			cmpUnitAI.isIdle = true;
			
			attacker_ships.push(ship_spawned[0]);
		}
		warn("spawned ships");
		
		//pick target
		let dock_targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "Dock").filter(TriggerHelper.IsInWorld);
	
		let ship_targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "Dock").filter(TriggerHelper.IsInWorld);
	
	
		let target = undefined;
		
		if (ship_targets.length == 0)
			target = pickRandom(dock_targets);
		else if (dock_targets.length == 0)
			target = pickRandom(ship_targets);
		else
		{
			let new_list = [pickRandom(ship_targets),pickRandom(dock_targets)];
			target = pickRandom(new_list);
		}
	
		for (let attacker of attacker_ships)
		{
			let cmpUnitAI = Engine.QueryInterface(attacker, IID_UnitAI);
			cmpUnitAI.Attack(target);
		}
	}	
	
	this.shipAttackInterval = 0.995 * this.shipAttackInterval;
	this.DoAfterDelay(this.shipAttackInterval,"spawnShipAttack",null);
	
}

//spawn enemny trade ships once in a while
Trigger.prototype.spawnTradeShips = function(data)
{
	for (let e = 0; e < this.enemy_players.length; ++e)
	{
		//get list of trade ships
		let traders_e = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(this.enemy_players[e]), "Trader").filter(TriggerHelper.IsInWorld);
		traders_e = TriggerHelper.MatchEntitiesByClass(traders_e, "Ship");
		
		if (traders_e.length < 6)
		{
			//pick spawn site
			let docks_e = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(this.enemy_players[e]), "Dock").filter(TriggerHelper.IsInWorld);
			
			//make list of others' docks
			let docks_others = [];
			for (let p of this.enemy_players)
			{
				if (p != this.enemy_players[e])
				{
					let docks_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Dock").filter(TriggerHelper.IsInWorld);
				
					docks_others = docks_others.concat(docks_p);
				}
			}
			
			if (docks_e.length > 0 && docks_others.length > 0)
			{
				let spawn_dock = pickRandom(docks_e)
				let trader = TriggerHelper.SpawnUnits(spawn_dock, "units/pers/ship_merchant", 1, this.enemy_players[e]);
				
				warn("spawned trade ship");
				
				let cmpUnitAI = Engine.QueryInterface(trader[0], IID_UnitAI);
			
				cmpUnitAI.UpdateWorkOrders("Trade");
				cmpUnitAI.SetupTradeRoute(pickRandom(docks_others),spawn_dock,null,true);
				
				
			}
		}
	}
	
	this.DoAfterDelay(60 * 1000, "spawnTradeShips",null);
}

//check for idle ships and make them trade
Trigger.prototype.makeShipsTrade = function(data)
{
	for (let e = 0; e < this.enemy_players.length; ++e)
	{
		warn("setting up trades for player " + this.enemy_players[e]);
		
		//get list of trade ships
		let traders_e = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(this.enemy_players[e]), "Trader").filter(TriggerHelper.IsInWorld);
		traders_e = TriggerHelper.MatchEntitiesByClass(traders_e, "Ship");
		
		let idle_traders_e = [];
		for (let trader of traders_e)
		{
			let cmpUnitAI = Engine.QueryInterface(trader, IID_UnitAI);
			if (cmpUnitAI)
			{
				if (cmpUnitAI.IsIdle())
				{
					idle_traders_e.push(trader);
				}
			}
		}
		
		if (idle_traders_e.length >= 1)
		{
			
			//make list of own docks
			let docks_e = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(this.enemy_players[e]), "Dock").filter(TriggerHelper.IsInWorld);
			
			//make list of others' docks
			let docks_others = [];
			for (let p of this.enemy_players)
			{
				if (p != this.enemy_players[e])
				{
					let docks_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Dock").filter(TriggerHelper.IsInWorld);
			
					docks_others = docks_others.concat(docks_p);
				}
			}
			
			//randomly assign each trader to a market of another player
			for (let trader of idle_traders_e)
			{
				let cmpUnitAI = Engine.QueryInterface(trader, IID_UnitAI);
			
				//warn("updating trade orders");
				cmpUnitAI.UpdateWorkOrders("Trade");
				cmpUnitAI.SetupTradeRoute(pickRandom(docks_others),pickRandom(docks_e),null,true);
			}
		}
	}
}

//garison AI entities with archers
Trigger.prototype.GarrisonEntities = function(data)
{
	let players = [0,2,3,4];
	
	for (let p of players)
	{
		let towers_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "GarrisonTower").filter(TriggerHelper.IsInWorld);
		
		let size = 5;
		if (p == 0)
			size = 1;
		
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
	
	//store ship types
	/*cmpTrigger.ship_types_dict[2] = TriggerHelper.GetTemplateNamesByClasses("Warship", "pers", undefined, undefined, true);
	cmpTrigger.ship_types_dict[3] = TriggerHelper.GetTemplateNamesByClasses("Warship", "gaul", undefined, undefined, true);
	cmpTrigger.ship_types_dict[4] = TriggerHelper.GetTemplateNamesByClasses("Warship", "athen", undefined, undefined, true);
	*/
	
	//state variables
	cmpTrigger.captured_dock = false;
	cmpTrigger.random_attack_index = 0;
	cmpTrigger.spawnedBigShip = false;
	cmpTrigger.captured_temple = false;
	cmpTrigger.captured_smith = false;
	cmpTrigger.captured_shop = false;
	cmpTrigger.captured_houses = [];
	cmpTrigger.invasion_under_way = false;
	cmpTrigger.invasion_ship = undefined;
	cmpTrigger.invasion_units = [];
	
	//modify player 1 techs and pop bonus
	let cmpPlayer = QueryPlayerIDInterface(1);
	let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
	cmpPlayer.SetPopulationBonuses(100);
	cmpTechnologyManager.ResearchTechnology("phase_town");
	cmpTechnologyManager.ResearchTechnology("phase_city");
	cmpTechnologyManager.ResearchTechnology("iphicratean_reforms");
	cmpTechnologyManager.ResearchTechnology("unlock_shared_los");
	cmpPlayer.SetDisabledTemplates(disabledTemplates(QueryPlayerIDInterface(1, IID_Identity).GetCiv()));
	
	//set techs and restrictions on AI players
	for (let p = 2; p <= 4; ++p)
	{
		let cmpPlayer_p = QueryPlayerIDInterface(p);
		let cmpTechnologyManager_p = Engine.QueryInterface(cmpPlayer_p.entity, IID_TechnologyManager);
		cmpTechnologyManager_p.ResearchTechnology("phase_town");
		cmpTechnologyManager_p.ResearchTechnology("phase_city");
	//cmpPlayer_p.SetDisabledTemplates(disabledTemplates(QueryPlayerIDInterface(p, IID_Identity).GetCiv()));
	}
	
	//restrict units for one of the enemies
	cmpPlayer = QueryPlayerIDInterface(4);
	cmpPlayer.SetDisabledTemplates(["units/athen/support_female_citizen", "units/sele/support_female_citizen", "units/athen/infantry_javelinist_b", "units/athen/infantry_spearman_b", "units/athen/infantry_slinger_b", "units/athen/cavalry_javelineer_b"]);
	
	//restrict techs by ally
	cmpPlayer = QueryPlayerIDInterface(5);
	cmpPlayer.SetDisabledTemplates(["units/mace/support_female_citizen", "units/sele/support_female_citizen"]);
	
	//some constants
	cmpTrigger.enemy_players = [2,3,4];
	cmpTrigger.maxNumEscorts = 5; //how many escorts each AI player allowed
	cmpTrigger.attackShipGarrison = 5;
	cmpTrigger.escortShipGarrison = 4;
	
	//some intervals
	cmpTrigger.shipAttackInterval = 120 * 1000;
	cmpTrigger.shipEscortInterval = 110 * 1000;
	cmpTrigger.catapultShipAttackInterval = 135 * 1000;
	
	//store list of gaia houses and docks
	cmpTrigger.gaia_houses = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(0), "House").filter(TriggerHelper.IsInWorld);
	cmpTrigger.gaia_docks = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(0), "Dock").filter(TriggerHelper.IsInWorld);
	
	//Greek rebel docks
	cmpTrigger.greek_docks = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(4), "Dock").filter(TriggerHelper.IsInWorld);
	cmpTrigger.greek_ccs = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(4), "CivilCentre").filter(TriggerHelper.IsInWorld);;
	
	//put archers in towers
	cmpTrigger.DoAfterDelay(5 * 1000,"GarrisonEntities",null);
	
	//start trade ships
	cmpTrigger.makeShipsTrade();
	cmpTrigger.DoAfterDelay(10 * 1000, "spawnTradeShips",null);

	//start spawning escorts for trade ships
	cmpTrigger.DoAfterDelay(cmpTrigger.shipEscortInterval,"spawnShipEscort",null);
	
	
	
	/*let ents_4 = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(4), "CivilCentre");
	
	for (let e of ents_4)
	{
		let cmpID = Engine.QueryInterface(e, IID_Identity);
		if (cmpID)
		{
			warn(uneval(cmpID));
		}
	}*/
	
	// register range trigger
	cmpTrigger.RegisterTrigger("OnRange", "RangeAction", {
		"entities": cmpTrigger.GetTriggerPoints("A"), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 30,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});
	
	// register invasion unload trigger
	cmpTrigger.RegisterTrigger("OnRange", "InvasionRangeAction", {
		"entities": cmpTrigger.GetTriggerPoints("B"), // central points to calculate the range circles
		"players": [4], // only count entities of player 1
		"maxRange": 20,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});


	
	
	
	/*

	cmpTrigger.RegisterTrigger("OnInterval", "IntervalAction", {
		"enabled": true,
		"delay": 30 * 1000,
		"interval": 60 * 1000,
	});

	cmpTrigger.RegisterTrigger("OnRange", "RangeAction", {
		"entities": cmpTrigger.GetTriggerPoints("A"), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 40,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true,
	});*/
};
