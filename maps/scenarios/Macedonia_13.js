warn("loading the triggers file");

///////////////////////
// Trigger listeners //
///////////////////////

/*
 * Notes:
 * 4 minutes in -- have dock, made contact, built ship and garrisoned it
 * 5 minutes in -- could start sending small attacks from greeks/persians
 * 16 minutes - AI attacks, 20-30 with 2 bolt shooter (medium balanced)
 * 
 * 
 * 
 */
var triggerPointPersianSpawn = "A";
var triggerPointCavalrySpawn = "B";
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
	"structures/" + civ + "_corral",
	"structures/" + civ + "_farmstead",
	"structures/" + civ + "_field",
	"structures/" + civ + "_storehouse",
	"structures/" + civ + "_rotarymill",
	"structures/" + civ + "_market",
	
	// Expansions
	"structures/" + civ + "_civil_centre",
	"structures/" + civ + "_military_colony",

	// Walls
	"structures/" + civ + "_wallset_stone",
	"structures/rome_wallset_siege",
	"other/wallset_palisade",

	// Shoreline
	"structures/" + civ + "_dock",
	"structures/brit/crannog",
	"structures/cart_super_dock",
	"structures/ptol_lighthouse"
];



Trigger.prototype.WalkAndFightClosestTarget = function(attacker,target_player,target_class)
{
	let target = this.FindClosestTarget(attacker,target_player,target_class);
	
	if (target)
	{
		// get target position
		var cmpTargetPosition = Engine.QueryInterface(target, IID_Position).GetPosition2D();
		
		
		let cmpUnitAI = Engine.QueryInterface(attacker, IID_UnitAI);
		cmpUnitAI.SwitchToStance("violent");
		cmpUnitAI.WalkAndFight(cmpTargetPosition.x,cmpTargetPosition.y,null);
	}
	else 
	{
		warn("[ERROR] Could not find closest target to fight: "+attacker+" and "+target_player+" and "+target_class);
	}
	
}

Trigger.prototype.GetEntititesForClasses = function(owner,classes)
{
	let results = [];
	for (let c of classes)
	{
		results = results.concat(TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(owner), c).filter(TriggerHelper.IsInWorld));
	}
	return results;
}


Trigger.prototype.FindClosestAmongSet = function(attacker,targets)
{
	
	//let targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(target_player), unitTargetClass);
	
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

Trigger.prototype.FindClosestTarget = function(attacker,target_player,target_class)
{
	
	//let targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(target_player), unitTargetClass);
	
	let targets = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(target_player), target_class).filter(TriggerHelper.IsInWorld);
	
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
	
	let id = Engine.QueryInterface(data.entity, IID_Identity);
	//warn(uneval(id));
	
	if (data.from == 0 && data.to == 1)
	{
		if (id.classesList.indexOf("Dock") >= 0)
		{
			this.num_docks_captured += 1;
			warn("dock captured");
			
			TriggerHelper.SpawnUnits(data.entity,"units/mace/ship_fishing",3,1);
			
			this.DoAfterDelay(2 * 1000,"DockPersianAttack",null);
	
			
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
			this.DoAfterDelay(240 * 1000,"WorkshopShipAttack",null);
		}
	}
	/*else if (data.from == 2 && id.classesList.indexOf("Gates") >= 0)
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
	}*/
	
};

Trigger.prototype.PlayerCommandAction = function(data)
{
	//warn("The OnPlayerCommand event happened with the following data:");
	//warn(uneval(data));
};


Trigger.prototype.IntervalActionAlliedAttack = function(data)
{
	
	//warn("The OnInterval event happened:");
	//warn(uneval(data));
	this.numberOfTimerTrigger++;
	if (this.numberOfTimerTrigger >= this.maxNumberOfTimerTrigger)
		this.DisableTrigger("OnInterval", "IntervalAction");
	
	
	var enemy_players = [2];
	
	for (let p = 0; p < enemy_players.length; ++p)
	{
	
	
		var enemy_units = TriggerHelper.GetEntitiesByPlayer(enemy_players[p]);
		var human_units = TriggerHelper.GetEntitiesByPlayer(1);
		
		var d = 0
		var best_distance = 100000
		var best_index = -1
		
		if (human_units.length > 0)
		{
			for (let i = 0; i < enemy_units.length; ++i)
			{
				let cmpUnitAI = Engine.QueryInterface(enemy_units[i], IID_UnitAI);
				
				//check if the unit is idle and if it can attack
				if (cmpUnitAI){
					let pos_i = Engine.QueryInterface(enemy_units[i], IID_Position).GetPosition2D();
					
					if (cmpUnitAI.IsIdle() && Engine.QueryInterface(enemy_units[i], IID_Attack))
					{
					
						for (let j = 0; j < human_units.length; j++)
						{
							let pos_j = Engine.QueryInterface(human_units[j], IID_Position).GetPosition2D();
					
							d =  Math.sqrt( (pos_i.x-pos_j.x)*(pos_i.x-pos_j.x) + (pos_i.y-pos_j.y)*(pos_i.y-pos_j.y) );
							
							if (d < best_distance)
							{
								best_distance = d
								best_index = j
							}
						}
						
						cmpUnitAI.SwitchToStance("violent");
						cmpUnitAI.Attack(human_units[best_index])
					}
				}
				
				best_distance = 100000
				best_index = -1
			}
		}
	}
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
	else if (patrol_entities.length <= k){
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
			"queued": true,
			"allowCapture": false
		});
	}
}

Trigger.prototype.IntervalActionSpawnPatrol = function(data)
{
	
	//for which player
	let owner = 5;
	
	let currentPop = QueryPlayerIDInterface(owner).GetPopulationCount();
	if (currentPop > this.greekPopLimit)
		return;
	
	//make list of fortress
	let forts = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(owner), "Fortress").filter(TriggerHelper.IsInWorld);
	if (forts.length < 1)
		return;
		
	//make list of possible targets
	let patrol_classes = ["Fortress","GarrisonTower","CivilCentre","Gates"];
	let patrol_entities = this.GetEntititesForClasses(4,patrol_classes);
	warn("Found "+patrol_entities.length+" patrol targets.");
	//patrol_entities = patrol_entities.concat(this.GetEntititesForClasses(4,patrol_classes));
	
	let num_patrol = this.greekPatrolSize;
	let spawn_site = pickRandom(forts);
	
	//calculate bonus, based on how many merchant ships are around
	let traders = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(owner), "Trader+Ship").filter(TriggerHelper.IsInWorld);
	let docks = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(owner), "Dock").filter(TriggerHelper.IsInWorld);
	
	if (docks.length > 0)
		num_patrol += traders.length;
	
	let squad = [];
	for (let i = 0; i < num_patrol; ++i)
	{
		let units_i = TriggerHelper.SpawnUnits(spawn_site,pickRandom(this.greek_inf_templates),1,owner);
		squad.push(units_i[0]);
	}
	
	//set formation
	TriggerHelper.SetUnitFormation(owner, squad, pickRandom(unitFormations));

	let patrol_k = 5;
	this.PatrolOrder(squad,patrol_entities,patrol_k,owner);
}

Trigger.prototype.IntervalActionPlayerFour = function(data)
{
	
	let units_pl4 = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(4), "Human").filter(TriggerHelper.IsInWorld);
	
	for (let u of units_pl4)
	{
		let target_u = this.FindClosestTarget(u,2,unitTargetClass);
		
		ProcessCommand(4, {
			"type": "attack",
			"entities": [u],
			"target": target_u,
			"queued": false,
			"allowCapture": false
		});
	}
}




//garison AI entities with archers
Trigger.prototype.GarrisonEntities = function(data)
{
	
	for (let p of [0,2,3,4,5])
	{
		let towers_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "GarrisonTower").filter(TriggerHelper.IsInWorld);
		

		for (let e of towers_p)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(e, "units/athen/champion_ranged",5,p);
			
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(e,true);
			}
		}
		
		//fortresses
		let forts_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Fortress").filter(TriggerHelper.IsInWorld);
		let fort_size = 10;
		//if (p == 0)
		//	fort_size = 20;
		
		for (let e of forts_p)
		{
			//spawn the garrison inside the tower
			
			let archers_e = TriggerHelper.SpawnUnits(e, "units/athen/champion_ranged",fort_size,p);
			
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(e,true);
			}
		}
		
		//wall towers
		let towers_w = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Defensive+Tower+!Outpost+!GarrisonTower").filter(TriggerHelper.IsInWorld);
		for (let e of towers_w)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(e, "units/athen/champion_ranged",2,p);
				
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(e,true);
			}
		}
		
		
		
		/*if (p == 1)
		{
			let ships_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Warship").filter(TriggerHelper.IsInWorld);
		
			for (let ship of ships_p)
			{
				//spawn the garrison inside the ship
				TriggerHelper.SpawnGarrisonedUnits(ship, "units/mace/infantry_archer_e",5,p);
				
				//spawn the garrison inside the ship
				TriggerHelper.SpawnGarrisonedUnits(ship, "units/mace/champion_infantry_spearman",5,p);
			}
		}*/
		
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
		
		warn("Traders from player " + this.enemies[e]);
		warn(uneval(traders_e));
		
		//make list of own markets
		let markets_e = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(this.enemies[e]), "Market").filter(TriggerHelper.IsInWorld);
		warn("Markets from player " + this.enemies[e]);
		warn(uneval(markets_e));
		
		//make list of possible other markets
		let markets_others = [];
		for (let p = 0; p < this.enemies.length; ++p)
		{
			if (this.enemies[e] != this.enemies[p])
			{
				let markets_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(this.enemies[p]), "Market").filter(TriggerHelper.IsInWorld);
		
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


//spawn enemny trade ships once in a while
Trigger.prototype.IntervalSpawnTradeShips = function(data)
{
	let trader_ais = [2,4,5];
	for (let e = 0; e < trader_ais.length; ++e)
	{
		//get list of docks
		let docks_e = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(trader_ais[e]), "Dock").filter(TriggerHelper.IsInWorld);
		
		if (docks_e.length > 0)
		{
			//get list of trade ships
			let traders_e = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(trader_ais[e]), "Trader+Ship").filter(TriggerHelper.IsInWorld);
			
			if (traders_e.length < 6)
			{
				//make list of others' docks
				let docks_others = [];
				for (let p of this.enemies)
				{
					if (p != trader_ais[e]){
						let docks_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Dock").filter(TriggerHelper.IsInWorld);
					
						docks_others = docks_others.concat(docks_p);
					}
				}
				
				if (docks_others.length > 0)
				{
					let spawn_dock = pickRandom(docks_e)
					let trader = TriggerHelper.SpawnUnits(spawn_dock, "units/pers_ship_merchant",1,trader_ais[e]);
					
					warn("spawned trade ship");
					
					let cmpUnitAI = Engine.QueryInterface(trader[0], IID_UnitAI);
				
					cmpUnitAI.UpdateWorkOrders("Trade");
					cmpUnitAI.SetupTradeRoute(pickRandom(docks_others),spawn_dock,null,true);
					
					
				}
			}
		}
	}
}



Trigger.prototype.GreekAttack = function(data)
{
	let towers = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(3),"GarrisonTower").filter(TriggerHelper.IsInWorld);
	
	let human_camps = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(1),"MercenaryCamp").filter(TriggerHelper.IsInWorld);
	
	if (human_camps.length == 0 || towers.length == 0)
		return;
	
	let num_attackers = this.greekAttackSize;
	warn("Num attackers = "+num_attackers);
	let attackers = [];
	
	//find any idle soldiers
	let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(3),"Infantry").filter(TriggerHelper.IsInWorld);

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
		let spawn_site = pickRandom(towers);
		let units_i = TriggerHelper.SpawnUnits(spawn_site,pickRandom(this.greek_inf_templates),1,3);
		attackers.push(units_i[0]);
	}
	
	//spawn siege
	let num_siege = Math.floor(num_attackers/12);
	let siege_attackers = [];
	for (let i = 0; i < num_siege; ++i)
	{
		let spawn_site = pickRandom(towers);
		let units_i = TriggerHelper.SpawnUnits(spawn_site,pickRandom(this.greek_siege_templates),1,3);
		siege_attackers.push(units_i[0]);
	}
	
	
	
	//set formation
	//TriggerHelper.SetUnitFormation(3, attackers, pickRandom(unitFormations));

	//find target
	let target = pickRandom(this.human_start_structures);
	
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
}



Trigger.prototype.IntervalUnitCheck = function(data)
{
	
}



//spawn random attack
Trigger.prototype.DockPersianAttackRepeats = function(data)
{
	let owner = 2;
	
	let forts = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(owner),"Fortress").filter(TriggerHelper.IsInWorld);
	
	let dock_targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1),"Dock").filter(TriggerHelper.IsInWorld);
	
	if (forts.length < 1 || dock_targets.length < 1)
		return;
		
	let spawn_site = forts[0];
	
	let num_attackers = this.persDockAttackCounter + 4;
	warn("Num attackers = "+num_attackers);
	let attackers = [];
	
	//spawn attackers
	for (let i = 0; i < num_attackers; ++i)
	{
		let units_i = TriggerHelper.SpawnUnits(spawn_site,pickRandom(this.pers_inf_templates),1,owner);
		attackers.push(units_i[0]);
	}
	
	//set formation
	TriggerHelper.SetUnitFormation(owner, attackers, pickRandom(unitFormations));

	//find target
	let target = pickRandom(dock_targets);
	
	var cmpTargetPosition = Engine.QueryInterface(target, IID_Position).GetPosition2D();
	
	//GetFormationUnitAIs(attackers, owner).forEach(cmpUnitAI => {
	//	cmpUnitAI.WalkAndFight(target.x, target.y, unitTargetClass, true, false);
	//});
	
	ProcessCommand(owner, {
		"type": "attack-walk",
		"entities": attackers,
		"x": cmpTargetPosition.x,
		"y": cmpTargetPosition.y,
		"queued": true,
		"allowCapture": false
	});
	
	this.persDockAttackCounter ++;
	
	let interval = (180+Math.floor(Math.random()*60)) * 1000 ;
	this.DoAfterDelay(interval,"DockPersianAttackRepeats",null);
	
}


Trigger.prototype.CavalryTraderAttackRepeats = function(data)
{
	let owner = 2;
	
	//check if we have spawn point
	let camps = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(owner),"Fortress").filter(TriggerHelper.IsInWorld);
	
	if (camps.length < 1)
		return;
		
	//check if we have targets
	let traders = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(1),"Trader+!Ship").filter(TriggerHelper.IsInWorld);
	traders = traders.concat(TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(3),"Trader+!Ship").filter(TriggerHelper.IsInWorld));
	
	if (traders.length < 1)
	{
		let interval = (this.persAttackInterval+Math.floor(Math.random()*60)) * 1000 ;
		this.DoAfterDelay(interval,"CavalryTraderAttackRepeats",null);
		
		return;
	}
			
			
	let spawn_site = pickRandom(this.GetTriggerPoints(triggerPointCavalrySpawn));
	
	//decide on size of attack
	let currentPop = QueryPlayerIDInterface(1).GetPopulationCount();
	let num_attackers = 3 + Math.floor(currentPop/20);
	warn("Num attackers = "+num_attackers);
	let attackers = [];
	
	//find any idle cavalry
	let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(owner),"Cavalry").filter(TriggerHelper.IsInWorld);
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
		let units_i = TriggerHelper.SpawnUnits(spawn_site,pickRandom(this.pers_cav_templates),1,owner);
		attackers.push(units_i[0]);
	}
	
	let target = this.FindClosestAmongSet(attackers[0],traders);
	
	ProcessCommand(owner, {
		"type": "attack",
		"entities": attackers,
		"target": target,
		"queued": true,
		"allowCapture": false
	});
	
	let interval = (this.persAttackInterval+Math.floor(Math.random()*60)) * 1000 ;
	this.DoAfterDelay(interval,"CavalryTraderAttackRepeats",null);
}

Trigger.prototype.PersianAttackRepeats = function(data)
{
	let owner = 2;
	
	//check if we have fortress point
	let camps = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(owner),"Fortress").filter(TriggerHelper.IsInWorld);
	
	if (camps.length < 1)
		return;
		
	//check for target building
	let human_camps = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(1),"MercenaryCamp").filter(TriggerHelper.IsInWorld);
	let human_forts = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(1),"Fortress").filter(TriggerHelper.IsInWorld);
	let targets = human_camps.concat(human_forts);
	
	if (targets.length < 1)
		return;
	
	let spawn_site = pickRandom(this.GetTriggerPoints(triggerPointPersianSpawn));
	//let spawn_site = camps[0];
	
	let num_attackers = this.persAttackSize;
	warn("Num attackers = "+num_attackers);
	let attackers = [];
	
	//find any idle soldiers
	let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(owner),"Infantry").filter(TriggerHelper.IsInWorld);
	units = units.concat(TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(owner),"Siege").filter(TriggerHelper.IsInWorld));
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
		let units_i = TriggerHelper.SpawnUnits(spawn_site,pickRandom(this.pers_inf_templates),1,owner);
		attackers.push(units_i[0]);
	}
	
	//spawn siege
	let num_siege = Math.floor(num_attackers/9);
	for (let i = 0; i < num_siege; ++i)
	{
		let units_i = TriggerHelper.SpawnUnits(spawn_site,pickRandom(this.pers_siege_templates),1,owner);
		attackers.push(units_i[0]);
	}
	
	//set formation
	TriggerHelper.SetUnitFormation(owner, attackers, pickRandom(unitFormations));

	//find target
	let target = pickRandom(targets);
	var cmpTargetPosition = Engine.QueryInterface(target, IID_Position).GetPosition2D();
	
	ProcessCommand(owner, {
		"type": "attack-walk",
		"entities": attackers,
		"x": cmpTargetPosition.x,
		"y": cmpTargetPosition.y,
		"queued": true,
		"allowCapture": false
	});


	
	this.persAttackSize += 1;
	
	let interval = (this.persAttackInterval+Math.floor(Math.random()*60)) * 1000 ;
	this.DoAfterDelay(interval,"PersianAttackRepeats",null);
	
	

}


Trigger.prototype.RangeActionArrival = function(data)
{
	if (this.has_camp == false)
	{
		warn("arrived!");
		
		//get all camps by player 3
		let camps_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(3),"MercenaryCamp").filter(TriggerHelper.IsInWorld);
		let markets_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(3),"Market").filter(TriggerHelper.IsInWorld);
		let forts_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(3),"Fortress").filter(TriggerHelper.IsInWorld);
		let workshops_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(3),"Workshop").filter(TriggerHelper.IsInWorld);
		
		// Make it owned by the current player
		var cmpOwnership = Engine.QueryInterface(camps_p[0], IID_Ownership);
		cmpOwnership.SetOwner(1);
		cmpOwnership = Engine.QueryInterface(markets_p[0], IID_Ownership);
		cmpOwnership.SetOwner(1);
		cmpOwnership = Engine.QueryInterface(forts_p[0], IID_Ownership);
		cmpOwnership.SetOwner(1);
		cmpOwnership = Engine.QueryInterface(workshops_p[0], IID_Ownership);
		cmpOwnership.SetOwner(1);
		
		//spawn some units
		TriggerHelper.SpawnUnits(camps_p[0],"units/mace/champion_infantry_spearman_02",10,1);
		TriggerHelper.SpawnUnits(camps_p[0],"units/athen/champion_ranged",10,1);
		TriggerHelper.SpawnUnits(forts_p[0],"units/athen/champion_ranged",10,1);
		TriggerHelper.SpawnUnits(markets_p[0],"units/mace/support_trader",5,1);
		TriggerHelper.SpawnUnits(markets_p[1],"units/mace/support_trader",5,3);
		
		//start persian attacks
		this.DoAfterDelay(4 * 60 * 1000,"DockPersianAttackRepeats",null);
		this.DoAfterDelay(3 * 60 * 1000,"PersianAttackRepeats",null);
		this.DoAfterDelay(4 * 60 * 1000,"CavalryTraderAttackRepeats",null);
		
		
		
		this.has_camp = true;
	}
	
}

Trigger.prototype.SetDifficultyLevel = function(data)
{
	//Very Hard: 1.56; Hard: 1.25; Medium 1
	
	for (let player of [2])
	{
		let cmpPlayer = QueryPlayerIDInterface(player);
		let ai_mult = cmpPlayer.GetGatherRateMultiplier();
		let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
		
		//process difficulty levels
		if (ai_mult == 1.25)
		{
			//add some tech
			cmpTechnologyManager.ResearchTechnology("attack_infantry_ranged_01");
			cmpTechnologyManager.ResearchTechnology("attack_infantry_melee_01");
		}
		else if (ai_mult >= 1.5)
		{
			//add some tech
			cmpTechnologyManager.ResearchTechnology("attack_infantry_ranged_01");
			cmpTechnologyManager.ResearchTechnology("attack_infantry_ranged_02");
			cmpTechnologyManager.ResearchTechnology("attack_infantry_melee_01");
			cmpTechnologyManager.ResearchTechnology("attack_infantry_melee_02");
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

	
	cmpTrigger.enemies = [2,4,5];
	
	cmpTrigger.pers_inf_templates = TriggerHelper.GetTemplateNamesByClasses("Infantry+!Hero", "pers", undefined, undefined, true);
	//cmpTrigger.pers_cav_templates = TriggerHelper.GetTemplateNamesByClasses("Cavalry+!Hero", "pers", undefined, undefined, true);
	cmpTrigger.pers_cav_templates = ["units/pers_cavalry_spearman_b","units/pers_cavalry_javelinist_b","units/pers_champion_cavalry_archer","units/pers_cavalry_archer_a","units/sele_champion_cavalry"];
	
	cmpTrigger.pers_siege_templates = TriggerHelper.GetTemplateNamesByClasses("Siege", "pers", undefined, undefined, true);
	
	cmpTrigger.spawn_ship_templates = TriggerHelper.GetTemplateNamesByClasses("Warship", "pers", undefined, undefined, true);
	
	cmpTrigger.greek_inf_templates = TriggerHelper.GetTemplateNamesByClasses("Infantry+!Hero", "athen", undefined, undefined, true);
	cmpTrigger.greek_siege_templates = TriggerHelper.GetTemplateNamesByClasses("Siege", "athen", undefined, undefined, true);

	//base constants
	cmpTrigger.ship_garrison_size = 5;
	cmpTrigger.greekPatrolSize = 2;
	cmpTrigger.greekPopLimit = 200;
	cmpTrigger.persAttackInterval = 180 * 1000;

	//state variables
	cmpTrigger.num_docks_captured = 0;
	cmpTrigger.persAttackSize = 7;
	cmpTrigger.greekAttackSize = 6;
	cmpTrigger.has_camp = false;
	cmpTrigger.persDockAttackCounter = 0;
	
	//cmpTrigger.DoAfterDelay(5 * 1000,"SetDifficultyLevel",null);
	cmpTrigger.DoAfterDelay(2 * 1000,"GarrisonEntities",null);
	
	//add some techs 
	for (let p of [1,3])
	{
		let cmpPlayer = QueryPlayerIDInterface(p);
		cmpPlayer.SetDisabledTemplates(disabledTemplates(cmpPlayer.GetCiv()));
	
		let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
		
		cmpPlayer.SetPopulationBonuses(300);
		
		cmpTechnologyManager.ResearchTechnology("unlock_shared_los");
		
		if (p == 1)
		{
			cmpPlayer.AddStartingTechnology("phase_town_generic");
			cmpPlayer.AddStartingTechnology("phase_city_generic");
		}
		else 
		{
			cmpPlayer.AddStartingTechnology("phase_town_athen");
			cmpPlayer.AddStartingTechnology("phase_city_athen");
		}
	}
	
	//tech for enemies
	for (let p of [2,4,5])
	{
		let cmpPlayer = QueryPlayerIDInterface(p);
		
		let d_templates = disabledTemplates(cmpPlayer.GetCiv());
		//d_templates.push("units/athen_ship_bireme");
		//d_templates.push("units/athen_ship_trireme");
		//d_templates.push("units/athen_ship_merchant");
		
		cmpPlayer.SetDisabledTemplates(d_templates);
	
		if (p == 4)
			cmpPlayer.SetPopulationBonuses(300);
	}

	//patrol
	cmpTrigger.RegisterTrigger("OnInterval", "IntervalActionSpawnPatrol", {
		"enabled": true,
		"delay": 10 * 1000,
		"interval": 90 * 1000,
	});

	//traders
	cmpTrigger.RegisterTrigger("OnInterval", "IntervalActionTraders", {
		"enabled": true,
		"delay": 10 * 1000,
		"interval": 60 * 1000,
	});
	
	cmpTrigger.RegisterTrigger("OnInterval", "IntervalSpawnTradeShips", {
		"enabled": true,
		"delay": 30 * 1000,
		"interval": 60 * 1000,
	});
	
	// register arrival trigger
	cmpTrigger.RegisterTrigger("OnRange", "RangeActionArrival", {
		"entities": cmpTrigger.GetTriggerPoints("K"), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 20,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});
	
	/*cmpTrigger.RegisterTrigger("OnInterval", "IntervalUnitCheck", {
		"enabled": true,
		"delay": 120 * 1000,
		"interval": 90 * 1000,
	});*/
	
	
	

	/*cmpTrigger.RegisterTrigger("OnInterval", "PersianAttack", {
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
	});*/
	
	
	

	//make traders trade
	//var all_ents = TriggerHelper.GetEntitiesByPlayer(2);
	
	

		

	
};

