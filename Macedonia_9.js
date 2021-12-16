warn("loading the triggers file");

///////////////////////
// Trigger listeners //
///////////////////////

var triggerPointShipUnload = "B";


//var unitTargetClass = "Unit+!Ship";
var unitTargetClass = "Unit";
var siegeTargetClass = "Structure";

//scenario indendent functions
Trigger.prototype.PatrolOrderList = function(units,p,patrolTargets)
{
	
	if (units.length <= 0)
		return;
		

	for (let patrolTarget of patrolTargets)
	{
		let targetPos = TriggerHelper.GetEntityPosition2D(patrolTarget);
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



Trigger.prototype.StatusCheck = function(data)
{
	this.statusCheckCounter += 1;
	//warn("status check counter = "+this.statusCheckCounter);
	
}

Trigger.prototype.StructureDecayCheck = function(data)
{
	for (let p of [1,5])
	{
		let structs = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Structure").filter(TriggerHelper.IsInWorld);

		for (let s of structs)
		{
			var cmpCapt = Engine.QueryInterface(s, IID_Capturable);
			if (cmpCapt)
			{
				let c_points = cmpCapt.GetCapturePoints();
				
				
				if (c_points[0] > 0)
				{
					c_points[p] += c_points[0];
					c_points[0] = 0;
					cmpCapt.SetCapturePoints(c_points);
				}
			}
		}
	}
}

Trigger.prototype.VictoryTextFnEnemy = function(n)
{
	return markForPluralTranslation(
          "You have lost too many troops! %(lastPlayer)s has won (game mode).",
         "%(players)s and %(lastPlayer)s have won (game mode).",
          n);
}

Trigger.prototype.VictoryTextFn = function(n)
{
	return markForPluralTranslation(
          "%(lastPlayer)s has won (game mode).",
         "%(players)s and %(lastPlayer)s have won (game mode).",
          n);
}
			

Trigger.prototype.OwnershipChangedAction = function(data)
{
	//warn("The OnOwnershipChanged event happened with the following data:");
	//warn(uneval(data));
	
	if (data.from == 0 && data.to == 1)  //we captured something from gaia
	{
		if (this.gaia_houses.indexOf(data.entity) >= 0 && this.captured_houses.indexOf(data.entity) < 0)
		{
			//we captured a house
			let cmpPlayer = QueryPlayerIDInterface(1);
			cmpPlayer.AddPopulationBonuses(5);
			//warn("captured house");
			
			this.captured_houses.push(data.entity);
		}
		else if (this.gaia_docks.indexOf(data.entity) >= 0)
		{
			if (this.captured_dock == false)
			{
			
				this.captured_dock = true;
				//warn("captured first dock");
							
				//turn on ship spawn attacks
				this.DoAfterDelay(60 * 1000,"spawnShipAttack",null);
				
				//spawn some support units
				TriggerHelper.SpawnUnits(data.entity,"units/mace/ship_fishing",2,1);
				TriggerHelper.SpawnUnits(data.entity,"units/mace/ship_merchant",2,1);	
				
				this.escortShipGarrison += 1;
			}
		}
		else if (data.entity == 12058) //temple
		{
			if (this.captured_temple == false)
			{
				//we get some tech -- improved line of sight, regeneration when idle
				let cmpPlayer = QueryPlayerIDInterface(1);
				let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
				cmpTechnologyManager.ResearchTechnology("health_regen_units");
				cmpTechnologyManager.ResearchTechnology("health_regen_units");
				//warn("captured temple");
				
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
			
				cmpTechnologyManager.ResearchTechnology("attack_soldiers_will");
			
				//warn("captured smith");
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
				
				cmpTechnologyManager.ResearchTechnology("siege_health");
				cmpTechnologyManager.ResearchTechnology("siege_attack");
				cmpTechnologyManager.ResearchTechnology("siege_pack_unpack");
				
				//warn("captured siege");
				
				this.captured_shop = true;
				
				//add additional troops to garrison
				this.attackShipGarrison += 1;
				this.escortShipGarrison += 2;
			}
		}
	}
	else if (data.from == 0 && data.to == -1)
	{
		let id = Engine.QueryInterface(data.entity, IID_Identity);
		if (id && id.visibleClassesList.indexOf("StoneThrower") >= 0)
		{
			//TO DO: find closest soldier and check which player controls it
			
			//spawn one for us
			let siege = TriggerHelper.SpawnUnits(data.entity, "units/athen/siege_lithobolos_packed",1,1);
		}
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
		
		//check if cc 
		if (data.entity == this.ccJ)
		{
			this.ccJDestroyed = true;
			
			if (this.ccKDestroyed == true)
			{
				//win game
				TriggerHelper.SetPlayerWon(1,this.VictoryTextFn,this.VictoryTextFn);	
			}
		}
		else if (data.entity == this.ccK)
		{
			this.ccKDestroyed = true;
			
			if (this.ccJDestroyed == true)
			{
				//win game
				TriggerHelper.SetPlayerWon(1,this.VictoryTextFn,this.VictoryTextFn);	
			}
		}
	}
	
	//if we captured something from anyone but player 0, the nit is destroyed
	if ( (data.from != 0 && data.from != -1) && data.to == 1)
	{
		let health_s = Engine.QueryInterface(data.entity, IID_Health);
		health_s.Kill();
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
	//warn("The OnRange event happened with the following data:");
	//warn(uneval(data));
	
	if (this.spawnedBigShip == false)
	{
		this.spawnedBigShip = true;
		
		let big_ships = TriggerHelper.SpawnUnits(12170,"units/ptol/ship_quinquereme",1,1);
		TriggerHelper.SpawnUnits(12170,"units/mace/siege_lithobolos_packed",2,1);
		
		this.big_ship = big_ships[0];
		//this.DoAfterDelay(this.catapultShipAttackInterval,"spawnCatapultShipAttack",null);
	}
};

var disabledTemplates = (civ) => [
	// Economic structures
	/*"structures/" + civ + "_corral",
	"structures/" + civ + "_farmstead",
	"structures/" + civ + "_field",
	"structures/" + civ + "_storehouse",
	"structures/" + civ + "_rotarymill",
	"structures/" + civ + "_market",*/
	
	// Expansions
	"structures/" + civ + "/civil_centre",
	"structures/" + civ + "/military_colony",

	// Walls
	"structures/" + civ + "/wallset_stone",
	"structures/rome_wallset_siege",
	"other/wallset_palisade",

	// Shoreline
	/*"structures/" + civ + "_dock",
	"structures/brit/crannog",
	"structures/cart_super_dock",
	"structures/ptol_lighthouse"*/
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
	let shipTypes = TriggerHelper.GetTemplateNamesByClasses("Warship", cmpPlayer.GetCiv(), undefined, undefined, true); 
	
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
		//warn("spawned escort ship");
	}
	
	this.DoAfterDelay(this.shipEscortInterval,"spawnShipEscort",null);
	
}
	
//spawn attack on catapult ship
Trigger.prototype.spawnCatapultShipAttack = function(data)
{
	//pick random enemy player
	let random_enemy = pickRandom([2,4]);
	
	let cmpPlayer = QueryPlayerIDInterface(random_enemy);
	let shipTypes = TriggerHelper.GetTemplateNamesByClasses("Warship", cmpPlayer.GetCiv(), undefined, undefined, true);
	
	//pick dock
	let docks = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(random_enemy), "Dock").filter(TriggerHelper.IsInWorld);
	
	if (docks.length > 0)
	{
		let spawn_site = pickRandom(docks);
		let num_ships = Math.floor(Math.random() * 3)+1;
		let garrisonCount = Math.floor(Math.random() * 10)+5;
		
		for (let k = 0; k < num_ships; k ++)
		{
			let ship_spawned = TriggerHelper.SpawnUnits(spawn_site,"units/pers_ship_bireme",1,random_enemy);
			
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
	let shipTypes = TriggerHelper.GetTemplateNamesByClasses("Warship", cmpPlayer.GetCiv(), undefined, undefined, true); 
	let shipType = shipTypes[shipTypes.length-1];
	
	//pick dock
	let docks = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(random_enemy), "Dock").filter(TriggerHelper.IsInWorld);
	
	let spawn_site = docks[0];//pickRandom(docks);
	
	let ship_spawned = TriggerHelper.SpawnUnits(spawn_site,shipType,1,random_enemy);
	
	//warn("spawned invasion ship");
	
	//spawn the garrison inside the ship
	TriggerHelper.SpawnGarrisonedUnits(ship_spawned[0], "units/athen/champion_ranged",10,random_enemy);
	TriggerHelper.SpawnGarrisonedUnits(ship_spawned[0], "units/thebes_sacred_band_hoplitai",10,random_enemy);
			
	
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
	//warn(uneval(ungarrisonPos));
	
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
	let shipTypes = TriggerHelper.GetTemplateNamesByClasses("Warship", cmpPlayer.GetCiv(), undefined, undefined, true); 
	
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
		for (let i = 0; i < shipSpawnCount; ++i){
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
		//warn("spawned ships");
		
		//pick target
		let dock_targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "Dock").filter(TriggerHelper.IsInWorld);
	
		let ship_targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "Warship").filter(TriggerHelper.IsInWorld);
	
	
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
		
		//warn("target = "+target);
	
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
	let shipTypes = TriggerHelper.GetTemplateNamesByClasses("Warship", cmpPlayer.GetCiv(), undefined, undefined, true); 
	
	//warn(uneval(shipTypes));
	
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
		for (let i = 0; i < shipSpawnCount; ++i){
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
		//warn("spawned ships");
		
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
				if (p != this.enemy_players[e]){
					let docks_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Dock").filter(TriggerHelper.IsInWorld);
				
					docks_others = docks_others.concat(docks_p);
				}
			}
			
			if (docks_e.length > 0 && docks_others.length > 0)
			{
				let spawn_dock = pickRandom(docks_e)
				let trader = TriggerHelper.SpawnUnits(spawn_dock, "units/pers/ship_merchant",1,this.enemy_players[e]);
				
				//warn("spawned trade ship");
				
				let cmpUnitAI = Engine.QueryInterface(trader[0], IID_UnitAI);
			
				cmpUnitAI.UpdateWorkOrders("Trade");
				cmpUnitAI.SetupTradeRoute(pickRandom(docks_others),spawn_dock,null,true);
				
				
			}
		}
	}
	
	this.DoAfterDelay(60 * 1000, "spawnTradeShips",null);
}

//check for idle ships and make them trade
Trigger.prototype.MakeShipsTrade = function(data)
{
	for (let e = 0; e < this.enemy_players.length; ++e)
	{
		//warn("setting up trades for player " + this.enemy_players[e]);
		
		//get list of trade ships
		let traders_e = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(this.enemy_players[e]), "Trader").filter(TriggerHelper.IsInWorld);
		traders_e = TriggerHelper.MatchEntitiesByClass(traders_e, "Ship");
		
		let idle_traders_e = [];
		for (let trader of traders_e)
		{
			let cmpUnitAI = Engine.QueryInterface(trader, IID_UnitAI);
			if (cmpUnitAI) {
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
				if (p != this.enemy_players[e]){
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
		let towers_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "StoneTower").filter(TriggerHelper.IsInWorld);
		
		let size = 5;
		if (p == 0)
			size = 1;
		
		for (let e of towers_p)
		{
			if (e != 12779 && e != 12780 && e != 12781)
			{
				//spawn the garrison inside the tower
				let archers_e = TriggerHelper.SpawnUnits(e, "units/athen/champion_ranged",size,p);
				
				for (let a of archers_e)
				{
					let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
					cmpUnitAI.Garrison(e,true);
				}
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


Trigger.prototype.IntervalSpawnGuards = function(data)
{
	for (let p of [4])
	{
		let cmpPlayer = QueryPlayerIDInterface(p);
		if (cmpPlayer.GetState() != "active")
		{
			return;
		}
		
		let soldiers = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Soldier").filter(TriggerHelper.IsInWorld);
		//warn("found "+ soldiers.length + " soldiers");
		if (soldiers.length < 150)
		{
			//decide which island to spawn the guard at
			let spawn_cc = -1;
			let patrolTriggerSite = "";
			
			if (this.ccJDestroyed == false && this.ccKDestroyed == false)
			{
				spawn_cc = pickRandom([this.ccJ, this.ccK]);
				
				if (spawn_cc == this.ccJ)
					patrolTriggerSite = "J";
				else 
					patrolTriggerSite = "K";
			}
			else if (this.ccJDestroyed == false && this.ccKDestroyed == true)
			{
				spawn_cc = this.ccJ;
				patrolTriggerSite = "J";
			}
			else if (this.ccJDestroyed == true && this.ccKDestroyed == false)
			{
				spawn_cc = this.ccK;
				patrolTriggerSite = "K";
			}
			else {
			//	warn("both ccs destroyed, no more spawn");
				return;
			}
			
			let inf_templates = ["units/athen/champion_ranged","units/athen/champion_ranged","units/thebes_sacred_band_hoplitai","units/merc_black_cloak","units/athen/champion_ranged","units/athen/champion_ranged"];
			
			
			let patrol_sites = this.GetTriggerPoints(patrolTriggerSite);
			
			//pick patrol sites
			let sites = [pickRandom(patrol_sites),pickRandom(patrol_sites),pickRandom(patrol_sites)];
							
			let units = [];
			for (let i = 0; i < 4; i ++)
			{
				//spawn the unit
				let unit_i = TriggerHelper.SpawnUnits(spawn_cc,pickRandom(inf_templates),1,p);
				units = units.concat(unit_i);
			}		
			
			this.PatrolOrderList(units,p,sites);
		}
		
	}

	this.DoAfterDelay(20 * 1000,"IntervalSpawnGuards",null);
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
	
	//some IDs
	cmpTrigger.ccJ = 12831;
	cmpTrigger.ccK = 12102;
	cmpTrigger.ccJDestroyed = false;
	cmpTrigger.ccKDestroyed = false;
	
	//state variables
	cmpTrigger.statusCheckCounter = 0;
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
	cmpPlayer.SetPopulationBonuses(100);
	cmpPlayer.SetDisabledTemplates(disabledTemplates(cmpPlayer.GetCiv()));
	
	let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
	cmpTechnologyManager.ResearchTechnology("phase_town");
	cmpTechnologyManager.ResearchTechnology("phase_city");
	cmpTechnologyManager.ResearchTechnology("iphicratean_reforms");
	cmpTechnologyManager.ResearchTechnology("unlock_shared_los");
	
	//set techs and restrictions on AI players
	for (let p of [2,3,4,5])
	{
		let cmpPlayer_p = QueryPlayerIDInterface(p);
		let cmpTechnologyManager_p = Engine.QueryInterface(cmpPlayer_p.entity, IID_TechnologyManager);
		cmpTechnologyManager_p.ResearchTechnology("phase_town");
		//cmpTechnologyManager_p.ResearchTechnology("phase_city");
		
		if (p == 4)
		{
			cmpPlayer_p.SetDisabledTemplates(["units/athen/support_female_citizen","units/sele/support_female_citizen","units/athen/infantry_javelinist_b","units/athen/nfantry_spearman_b","units/athen/infantry_slinger_b","units/athen/cavalry_javelineer_b"]);
		}
		else if (p == 5)
		{
			cmpPlayer_p.SetDisabledTemplates(["units/mace/support_female_citizen","units/sele/support_female_citizen"]);
		}
	}
	
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
	cmpTrigger.greek_ccs = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(4), "CivilCentre").filter(TriggerHelper.IsInWorld);
	
	//start guard spawn
	cmpTrigger.DoAfterDelay(10 * 1000,"IntervalSpawnGuards",null);

	
	//put archers in towers
	cmpTrigger.DoAfterDelay(5 * 1000,"GarrisonEntities",null);
	
	//start trade ships
	cmpTrigger.DoAfterDelay(5 * 1000, "MakeShipsTrade",null);
	cmpTrigger.DoAfterDelay(10 * 1000, "spawnTradeShips",null);

	//start spawning escorts for trade ships
	cmpTrigger.DoAfterDelay(cmpTrigger.shipEscortInterval,"spawnShipEscort",null);
	
	//debug
	//cmpTrigger.DoAfterDelay(15 * 1000,"specialShipAttack",null);
	
	
	
	cmpTrigger.RegisterTrigger("OnInterval", "StructureDecayCheck", {
		"enabled": true,
		"delay": 10 * 1000,
		"interval": 10 * 1000,
	});
	
	cmpTrigger.RegisterTrigger("OnInterval", "StatusCheck", {
		"enabled": true,
		"delay": 30 * 1000,
		"interval": 30 * 1000,
	});
	
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

};

