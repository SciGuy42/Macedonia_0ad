warn("loading the triggers file");

///////////////////////
// Trigger listeners //
///////////////////////


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
	"structures/brit_crannog",
	"structures/cart_super_dock",
	"structures/ptol_lighthouse",
	
	//villagers
	"units/" + civ + "_support_female_citizen"
];



Trigger.prototype.WalkAndFightClosestTarget = function(attacker,target_player,target_class)
{
	let target = this.FindClosestTarget(attacker,target_player,target_class);
	if (!target)
	{
		target = this.FindClosestTarget(attacker,target_player,siegeTargetClass);
	}
	
	
	if (target)
	{
		// get target position
		var cmpTargetPosition = Engine.QueryInterface(target, IID_Position).GetPosition2D();
		
		
		let cmpUnitAI = Engine.QueryInterface(attacker, IID_UnitAI);
		cmpUnitAI.SwitchToStance("violent");
		cmpUnitAI.WalkAndFight(cmpTargetPosition.x,cmpTargetPosition.y,null);
	}
	else //find a structure
	{
		
		
		warn("[ERROR] Could not find closest target to fight: "+attacker+" and "+target_player+" and "+target_class);
	}
	
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
	warn("The OnStructureBuilt event happened with the following data:");
	warn(uneval(data));
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


Trigger.prototype.SpecialAchaeanAssault = function(data)
{
	let owner = 5;
	let target_player = 1;
	
	//south side -- some infantry
	let num_infantry = 40;
	
	for (let i = 0; i < num_infantry; i ++)
	{
		//spawn unit
		let triggerPoint = pickRandom(this.GetTriggerPoints(triggerPointAch));
		
		let units_i = TriggerHelper.SpawnUnits(triggerPoint,pickRandom(this.achaeanAttackTemplates), 1, owner);
		
		//make it fight
		this.WalkAndFightClosestTarget(units_i[0],target_player,"Unit");
	}
}

Trigger.prototype.SpecialArcadianAssault = function(data)
{
	let owner = 6;
	let target_player = 1;
	
	//south side -- some infantry
	let num_infantry = 30;
	
	for (let i = 0; i < num_infantry; i ++)
	{
		//spawn unit
		let triggerPoint = pickRandom(this.GetTriggerPoints(triggerPointArc));
		
		let units_i = TriggerHelper.SpawnUnits(triggerPoint,pickRandom(this.arcadiaAttackTemplates), 1, owner);
		
		//make it fight
		this.WalkAndFightClosestTarget(units_i[0],target_player,"Unit");
	}
}

Trigger.prototype.OwnershipChangedAction = function(data)
{
	if (this.specialAttackTriggered == false)
	{
		if ((data.from == 5 || data.from == 6) && data.to == -1)
		{
			//check if strucutre
			let id = Engine.QueryInterface(data.entity, IID_Identity);
			//warn(uneval(id));
			if (id != null && id.classesList.indexOf("Structure") >= 0)
			{
				if (data.from == 5)
				{
					//spawn attack from player 6
					this.DoAfterDelay(5 * 1000,"SpecialArcadianAssault",null);
					this.specialAttackTriggered = true;
					
				}
				else if (data.from == 6)
				{
					//spawn attack from player 5
					this.DoAfterDelay(5 * 1000,"SpecialAchaeanAssault",null);
					this.specialAttackTriggered = true;
				}
			}
		}
	}
	
	
	/*warn("The OnOwnershipChanged event happened with the following data:");
	warn(uneval(data));
	
	if (data.from == 5 && data.to == -1)
	{
		let id = Engine.QueryInterface(data.entity, IID_Identity);
		if (id.classesList.indexOf("Fortress") >= 0)
		{
			warn("Fortress destroyed!");
			this.CavalryAttack();
		}
	}*/
	
	//let id = Engine.QueryInterface(data.entity, IID_Identity);
	//warn(uneval(id));
	
	/*if (data.from == 0 && data.to == 1)
	{
		let id = Engine.QueryInterface(data.entity, IID_Identity);
		warn(uneval(id));
		
		if (id.classesList.indexOf("Embassy") >= 0)
		{
			//captured camp, spawn some balistas
			TriggerHelper.SpawnUnits(data.entity,"units/mace_mechanical_siege_oxybeles_packed",8,1);
			
			//spawn the princess
			TriggerHelper.SpawnUnits(data.entity,"units/kush_hero_amanirenas",1,1);
		}
		else if (id.classesList.indexOf("Pyramid") >= 0)
		{
			let cmpPlayer = QueryPlayerIDInterface(1);
			let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
			
			cmpTechnologyManager.ResearchTechnology("tower_armour");
			cmpTechnologyManager.ResearchTechnology("tower_range");
			cmpTechnologyManager.ResearchTechnology("tower_watch");
			cmpTechnologyManager.ResearchTechnology("tower_murderholes");
			cmpTechnologyManager.ResearchTechnology("tower_crenellations");
			cmpTechnologyManager.ResearchTechnology("armor_infantry_01");
			cmpTechnologyManager.ResearchTechnology("armor_cav_01");
			cmpTechnologyManager.ResearchTechnology("attack_infantry_ranged_01");
				
		}
	}*/
	
	
	

	
};

Trigger.prototype.PlayerCommandAction = function(data)
{
	//warn("The OnPlayerCommand event happened with the following data:");
	//warn(uneval(data));
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
				
				//send units to attack -- idle unit check will take care of this
				
				//send ship to attack
				//get possible list of dock targets
				let dock_targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "Dock").filter(TriggerHelper.IsInWorld);
				let ship_targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "Ship").filter(TriggerHelper.IsInWorld);
			
				let targets = dock_targets.concat(ship_targets);

				//order attack
				if (targets.length > 0)
				{				
					let p = 6;
					ProcessCommand(p, {
						"type": "attack",
						"entities": [this.invasion_ship],
						"target": pickRandom(targets),
						"queued": false,
						"allowCapture": false
					});
				}
				
				//clear variables and schedule next attack
				this.invasion_under_way = false;			
				this.ship_invasion_garrison = undefined;
				this.invasion_ship = undefined;
				
				//schedule next attack
				this.carthageInvasionAttackInterval = Math.floor(0.975 * this.carthageInvasionAttackInterval);
				if (this.carthageInvasionShipGarrisonSize < 49)
					this.carthageInvasionShipGarrisonSize = this.carthageInvasionShipGarrisonSize + 2;
				
				warn("Next invasion in "+uneval(this.carthageInvasionAttackInterval));
				this.DoAfterDelay(this.carthageInvasionAttackInterval * 1000,"SpawnNavalInvasionAttack",null);

				
			}
		}
	}
}

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

//spawn naval attack
Trigger.prototype.SpawnNavalInvasionAttack = function(data)
{
	if (this.invasion_under_way == true)
	{
		warn("invasion attack ordered when already one is going on");
		this.DoAfterDelay(300 * 1000,"SpawnAlliedInvasionAttack",null);
		return;
	}
	
	
	//check if carthage has docks
	let have_docks = false;
	let spawn_docks = [];
	let docks_e = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(6), "Dock").filter(TriggerHelper.IsInWorld);
	
	if (docks_e.length < 1)
		return;
	
	
	//decide how many ships to spawn and where
	let spawn_site = pickRandom(docks_e);
	let owner = 6;
	let attacker_ships = [];
	
	//let ship_spawned = TriggerHelper.SpawnUnits(spawn_site,this.spawn_ship_templates[1],1,owner);
	let ship_spawned = TriggerHelper.SpawnUnits(spawn_site, "units/cart_ship_quinquereme", 1, owner);
	let ship_invasion_garrison = [];
		
	//spawn the invasion force inside the ship
	for (let j = 0; j < this.carthageInvasionShipGarrisonSize; ++j)
	{
		let u_j = TriggerHelper.SpawnGarrisonedUnits(ship_spawned[0],pickRandom(this.cartAttackerTypes),1,owner);
		ship_invasion_garrison.push(u_j);
	}
			
	//make sure the unit has no orders, for some reason after garissoning, the order queue is full of pick up orders
	let cmpUnitAI = Engine.QueryInterface(ship_spawned[0], IID_UnitAI);
	cmpUnitAI.orderQueue = [];
	cmpUnitAI.order = undefined;
	cmpUnitAI.isIdle = true;
			
	attacker_ships.push(ship_spawned[0]);
	
	let ungarrison_point = pickRandom(this.GetTriggerPoints(triggerPointShipInvasion));
	let ungarrisonPos = TriggerHelper.GetEntityPosition2D(ungarrison_point);
	warn(uneval(ungarrisonPos));
	
	this.invasion_under_way = true;
	this.invasion_ship = ship_spawned[0];
	this.ship_invasion_garrison = ship_invasion_garrison;
	this.ungarrisonPos = ungarrisonPos;
	
	//send ship
	cmpUnitAI.Walk(ungarrisonPos.x, ungarrisonPos.y, true);
	
	
	//this.DoAfterDelay(300 * 1000,"SpawnAlliedInvasionAttack",null);
	
}


//garison AI entities with archers
Trigger.prototype.GarrisonEntities = function(data)
{
	
	for (let p of [4,5,6,7])
	{
		let towers_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "GarrisonTower").filter(TriggerHelper.IsInWorld);
		
		for (let e of towers_p)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(e, "units/athen_champion_infantry",5,p);
			
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(e,true);
			}
		}
		
		//FORTRESS
		let forts_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Fortress").filter(TriggerHelper.IsInWorld);
		let fort_size = 20;
	
		for (let e of forts_p)
		{
			//spawn the garrison inside the tower
			
			let archers_e = TriggerHelper.SpawnUnits(e, "units/athen_champion_ranged",fort_size,p);
			
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(e,true);
			}
		}
		
		//wall towers
		if (p == 5)
		{
			let towers_w = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Defensive+Tower+!Outpost+!GarrisonTower").filter(TriggerHelper.IsInWorld);
			for (let e of towers_w)
			{
				//spawn the garrison inside the tower
				let archers_e = TriggerHelper.SpawnUnits(e, "units/athen_champion_ranged",2,p);
					
				for (let a of archers_e)
				{
					let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
					cmpUnitAI.Garrison(e,true);
				}
			}
		}
		
		let camps_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p),"MercenaryCamp").filter(TriggerHelper.IsInWorld);
			
		for (let c of camps_p)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(c, "units/athen_champion_ranged",5,p);
			
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(c,true);
			}
		}
	}
}	


Trigger.prototype.IdleUnitCheck = function(data)
{
	for (let p of [6])
	{
		let target_p = 1;
			
		//find any idle soldiers
		let units_inf = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Infantry").filter(TriggerHelper.IsInWorld);
		let units_cav = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Cavalry").filter(TriggerHelper.IsInWorld);
		let units_siege = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Siege").filter(TriggerHelper.IsInWorld);
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
		}
	}
}






Trigger.prototype.PatrolOrder = function(units,p,A,B)
{
	
	if (units.length <= 0)
		return;
	
	
	//list of patrol targets
	let patrolTargets = [A,B];

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

//garison AI entities with archers
Trigger.prototype.SpawnFortressPatrol = function(data)
{
	//which player
	let p = 5; 
	
	//spawn random infantry next to a cc
	let ccs = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Fortress").filter(TriggerHelper.IsInWorld);
	
	if (ccs.length == 0)
		return;
		
	//calculate size of spawn units
	let num_patrols = 10;
	let patrol_size = 5;
	
	let inf_templates = ["units/kush_champion_infantry_amun","units/kush_champion_infantry","units/kush_champion_infantry_apedemak"];
	
	//spawn infantry
	for (let j = 0; j < num_patrols; j++)
	{
		let units = [];
		let site_j = pickRandom(ccs);
		
		//melee
		for (let i = 0; i < patrol_size; i++)
		{
			let unit_i = TriggerHelper.SpawnUnits(site_j,pickRandom(inf_templates),1,p);
			units.push(unit_i[0]);
		}
		
		//set formation
		TriggerHelper.SetUnitFormation(p, units, pickRandom(unitFormations));

		
		//send to patrol
		this.PatrolOrder(units,p);
		
	}
	
}


Trigger.prototype.CavalryAttack = function(data)
{
	//check if we have structures left, if not, end
	let p = 5;
	let structures = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Structure").filter(TriggerHelper.IsInWorld);
	
	if (structures.length == 0)
		return;
	
	//pick spawn site
	let spawn_site = pickRandom(this.GetTriggerPoints(triggerPointCavalryAttack));
	
	//how big should the attack be
	let min_size = 20;
	let units_1 = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "Unit").filter(TriggerHelper.IsInWorld);
	
	let num_attackers = Math.floor(units_1.length / 7.0);
	if (num_attackers < min_size)
		num_attackers = min_size;
	
	//types
	let cav_templates = TriggerHelper.GetTemplateNamesByClasses("Cavalry", "kush", undefined, undefined, true);
	let attackers = [];
	
	//spawn attackers
	for (let i = 0; i < num_attackers; ++i)
	{
		let units_i = TriggerHelper.SpawnUnits(spawn_site,pickRandom(cav_templates),1,p);
		attackers.push(units_i[0]);
	}
	
	//attack
	//set formation
	TriggerHelper.SetUnitFormation(p, attackers, pickRandom(unitFormations));

	//find target
	let target = this.FindClosestTarget(attackers[0],1,siegeTargetClass);
	let target_pos = TriggerHelper.GetEntityPosition2D(target);
	
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
}

Trigger.prototype.ArcadianAttack = function(data)
{
	//check if we have camps
	let p = 6;
	let structures = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "MercenaryCamp").filter(TriggerHelper.IsInWorld);
	
	if (structures.length == 0)
		return;
		
	let spawn_site = pickRandom(structures);
	
	let num_attackers = this.arcadiaAttackLevel;
	let attackers = [];
	
	//spawn attackers
	for (let i = 0; i < num_attackers; ++i)
	{
		
		if (Math.random() < 1.0 - this.arcadiaSiegeProb)
		{
			let units_i = TriggerHelper.SpawnUnits(spawn_site,pickRandom(this.arcadiaAttackTemplates),1,p);
			attackers.push(units_i[0]);
		}
		else 
		{
			//siege
			let units_i = TriggerHelper.SpawnUnits(spawn_site,"units/mace_mechanical_siege_lithobolos_packed",1,p);
			attackers.push(units_i[0]);
		}
	}
	
	
	//set formation
	TriggerHelper.SetUnitFormation(p, attackers, pickRandom(unitFormations));

	//find target
	let target = this.FindClosestTarget(attackers[0],1,siegeTargetClass);
	let target_pos = TriggerHelper.GetEntityPosition2D(target);
	
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
	
	let next_attack_interval_sec = this.arcadiaAttackInterval + Math.floor(Math.random() * 120);
	//warn("Next attack = " + uneval(next_attack_interval_sec));
	this.arcadiaAttackLevel += 2;
	
	this.DoAfterDelay(next_attack_interval_sec * 1000,"ArcadianAttack",null);
}


Trigger.prototype.AchaeanAttack = function(data)
{
	//check if we have camps
	let p = 5;
	let structures = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Fortress").filter(TriggerHelper.IsInWorld);
	
	if (structures.length == 0)
		return;
		
	let spawn_site = pickRandom(structures);
	
	let num_attackers = this.achaeanAttackLevel;
	let attackers = [];
	
	//spawn attackers
	for (let i = 0; i < num_attackers; ++i)
	{
		
		if (Math.random() < 1.0 - this.achaeanSiegeProb)
		{
			let units_i = TriggerHelper.SpawnUnits(spawn_site,pickRandom(this.achaeanAttackTemplates),1,p);
			attackers.push(units_i[0]);
		}
		else 
		{
			//siege
			let units_i = TriggerHelper.SpawnUnits(spawn_site,"units/athen_mechanical_siege_oxybeles_packed",1,p);
			attackers.push(units_i[0]);
		}
	}
	
	
	//set formation
	TriggerHelper.SetUnitFormation(p, attackers, pickRandom(unitFormations));

	//find target
	let target = this.FindClosestTarget(attackers[0],1,siegeTargetClass);
	let target_pos = TriggerHelper.GetEntityPosition2D(target);
	
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
	
	let next_attack_interval_sec = this.achaeanAttackInterval + Math.floor(Math.random() * 120);
	//warn("Next attack = " + uneval(next_attack_interval_sec));
	this.arcadiaAttackLevel += 4;
	
	this.DoAfterDelay(next_attack_interval_sec * 1000,"AchaeanAttack",null);
}


Trigger.prototype.SpawnAchaeanPatrol = function(data)
{
	let p = 5; //arcdians
	
	//see how many units we have
	let units_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Unit").filter(TriggerHelper.IsInWorld);
	
	//warn("player 6 has "+uneval(units_p.length) + " units");
	
	if (units_p.length < 40)
	{
	
		//targets A
		let targets_A = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "CivilCentre").filter(TriggerHelper.IsInWorld);
		targets_A = targets_A.concat(TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Market").filter(TriggerHelper.IsInWorld));
		targets_A = targets_A.concat(TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "MercenaryCamp").filter(TriggerHelper.IsInWorld));
		targets_A = targets_A.concat(TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Fortress").filter(TriggerHelper.IsInWorld));
		
		let targets_B = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "DefenseTower").filter(TriggerHelper.IsInWorld);
		targets_B = targets_B.concat(TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Gate").filter(TriggerHelper.IsInWorld));
		
		
		if (targets_A.length == 0 || targets_B.length == 0)
			return;
			
		let site_j = pickRandom(targets_B);	
		let patrol_units = TriggerHelper.SpawnUnits(site_j,pickRandom(this.patrolTemplates),1,p);	
		
		//send to patrol
		this.PatrolOrder(patrol_units,p,pickRandom(targets_A),site_j);
	}
	
	this.DoAfterDelay(30 * 1000,"SpawnAchaeanPatrol",null);

}

Trigger.prototype.SpawnArcadianPatrol = function(data)
{
	let p = 6; //arcdians
	
	//see how many units we have
	let units_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Unit").filter(TriggerHelper.IsInWorld);
	
	//warn("player 6 has "+uneval(units_p.length) + " units");
	
	if (units_p.length < 40)
	{
	
		//targets A
		let targets_A = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "CivilCentre").filter(TriggerHelper.IsInWorld);
		targets_A = targets_A.concat(TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Market").filter(TriggerHelper.IsInWorld));
		targets_A = targets_A.concat(TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "MercenaryCamp").filter(TriggerHelper.IsInWorld));
		
		let targets_B = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "DefenseTower").filter(TriggerHelper.IsInWorld);
		
		if (targets_A.length == 0 || targets_B.length == 0)
			return;
			
		let site_j = pickRandom(targets_B);	
		let patrol_units = TriggerHelper.SpawnUnits(site_j,pickRandom(this.patrolTemplates),1,p);	
		
		//send to patrol
		this.PatrolOrder(patrol_units,p,pickRandom(targets_A),site_j);
	}
	
	this.DoAfterDelay(30 * 1000,"SpawnArcadianPatrol",null);

}

Trigger.prototype.SpawnArcadianTraders = function(data)
{
	let e = 6; //arcdians
	
	//make list of own docks
	let docks = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(e), "Market").filter(TriggerHelper.IsInWorld);
		
	if (docks.length > 0)
	{
		
		//make list of traders
		let traders_e = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(e), "Trader+!Ship").filter(TriggerHelper.IsInWorld);
		
		
		if (traders_e.length < this.maxNumArcadianTraders)
		{
			//make list of others markets
			//make list of others' docks
			let markets_others = [];
			let trading_partners = [2,5,4];
			for (let p of trading_partners)
			{
				
				let markets_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Market").filter(TriggerHelper.IsInWorld);
					
				markets_others = markets_others.concat(markets_p);
			}
		
				
			if (markets_others.length > 0){
				

				let site = pickRandom(docks);
					
				//warn("Spawning trader for crete");
				let trader = TriggerHelper.SpawnUnits(site,"units/athen_support_trader",1,e);
					
				let cmpUnitAI = Engine.QueryInterface(trader[0], IID_UnitAI);
				
				cmpUnitAI.UpdateWorkOrders("Trade");
				cmpUnitAI.SetupTradeRoute(pickRandom(markets_others),site,null,true);
				
				//with some probability, spawn escort
				if (Math.random() < this.escortProb)
				{
					for (let i = 0; i < this.tradeEscortSize; i ++)
					{
						let escort_i = TriggerHelper.SpawnUnits(site,pickRandom(this.patrolTemplates),1,e);
					
					
						let cmpUnitAI = Engine.QueryInterface(escort_i[0], IID_UnitAI);
						cmpUnitAI.orderQueue = [];
						cmpUnitAI.order = undefined;
						cmpUnitAI.isIdle = true;
						
						cmpUnitAI.Guard(trader[0],true);
					}
				}
				
			}
		}
	}
	
	this.DoAfterDelay(60 * 1000, "SpawnArcadianTraders",null);
}


Trigger.prototype.SpawnCretanTraders = function(data)
{
	let e = 4; //cretans
	
	//make list of own docks
	let docks = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(e), "Dock").filter(TriggerHelper.IsInWorld);
		
	
		
	if (docks.length > 0)
	{
		
		//make list of traders
		let traders_e = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(e), "Trader+!Ship").filter(TriggerHelper.IsInWorld);
		
		
		if (traders_e.length < this.maxNumCretanTraders)
		{
			//make list of others markets
			//make list of others' docks
			let markets_others = [];
			let trading_partners = [2,6];
			for (let p of trading_partners)
			{
				
				let markets_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Market+!Dock").filter(TriggerHelper.IsInWorld);
					
				markets_others = markets_others.concat(markets_p);
			}
		
				
			if (markets_others.length > 0){
				

				let site = pickRandom(docks);
					
				//warn("Spawning trader for crete");
				let trader = TriggerHelper.SpawnUnits(site,"units/athen_support_trader",1,e);
					
				let cmpUnitAI = Engine.QueryInterface(trader[0], IID_UnitAI);
				
				cmpUnitAI.UpdateWorkOrders("Trade");
				cmpUnitAI.SetupTradeRoute(pickRandom(markets_others),site,null,true);
				
				//with some probability, spawn escort
				if (Math.random() < this.escortProb)
				{
					for (let i = 0; i < this.tradeEscortSize; i ++)
					{
						let escort_i = TriggerHelper.SpawnUnits(site,"units/athen_cavalry_swordsman_a",1,e);
					
					
						let cmpUnitAI = Engine.QueryInterface(escort_i[0], IID_UnitAI);
						cmpUnitAI.orderQueue = [];
						cmpUnitAI.order = undefined;
						cmpUnitAI.isIdle = true;
						
						cmpUnitAI.Guard(trader[0],true);
					}
				}
				
			}
			
		}
	}
	
	this.DoAfterDelay(45 * 1000, "SpawnCretanTraders",null);
}


Trigger.prototype.FlipMegolopolisAssets = function(data)
{
	//get all structures except docks
	let structures_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(3), "Structure+!Dock").filter(TriggerHelper.IsInWorld);
	
	for (let u of structures_p)
	{
		var cmpOwnership = Engine.QueryInterface(u, IID_Ownership);
		cmpOwnership.SetOwner(1);
	}
	
	//get all units
	let units_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(3), "Unit");
	
	for (let u of units_p)
	{
		var cmpOwnership = Engine.QueryInterface(u, IID_Ownership);
		cmpOwnership.SetOwner(1);
	}
	
	//start attacks
	
	this.DoAfterDelay(360 * 1000,"AchaeanAttack",null);
	this.DoAfterDelay(600 * 1000,"ArcadianAttack",null);
	
	
}


Trigger.prototype.ShowText = function(text,option_a,option_b)
{
	var cmpGUIInterface = Engine.QueryInterface(SYSTEM_ENTITY, IID_GuiInterface);
	cmpGUIInterface.PushNotification({
		"type": "dialog",
		"players": [1,2,3,4,5,6,7,8],
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
	
}

Trigger.prototype.CheckAssault = function(data)
{
	let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(7), "Unit").filter(TriggerHelper.IsInWorld);
	
	//warn("Found "+uneval(units.length) +" units");
	
	if (units.length == 0)
	{
		//flip assets
		this.DoAfterDelay(10 * 1000,"FlipMegolopolisAssets",null);
		this.ShowText("We have defeated the assault on Megalopolis! The city is now under your command!","Great!","OK");
		//warn("Assault over!");
	}
	else {
		this.DoAfterDelay(15 * 1000,"CheckAssault",null);
	
	}
}

Trigger.prototype.SpawnAssault = function(data)
{
	let owner = 7;
	let target_player = 3;
	
	//north side -- some rams, cavalry, and ballistas
	let num_rams = 5;
	let num_cav = 20;
	let num_ballistas = 3;
	
	for (let i = 0; i < num_rams; i ++)
	{
		//spawn unit
		let triggerPoint = pickRandom(this.GetTriggerPoints(triggerPointNorth));
		
		let units_i = TriggerHelper.SpawnUnits(triggerPoint, "units/spart_mechanical_siege_ram", 1, owner);
		
		//make it fight
		this.WalkAndFightClosestTarget(units_i[0],target_player,"CivilCentre");
	}
	
	for (let i = 0; i < num_cav; i ++)
	{
		//spawn unit
		let triggerPoint = pickRandom(this.GetTriggerPoints(triggerPointNorth));
		
		let units_i = TriggerHelper.SpawnUnits(triggerPoint, "units/spart_cavalry_spearman_a", 1, owner);
		
		//make it fight
		this.WalkAndFightClosestTarget(units_i[0],target_player,"CivilCentre");
	}
	
	for (let i = 0; i < num_ballistas; i ++)
	{
		//spawn unit
		let triggerPoint = pickRandom(this.GetTriggerPoints(triggerPointNorth));
		
		let units_i = TriggerHelper.SpawnUnits(triggerPoint, "units/athen_mechanical_siege_oxybeles_packed", 1, owner);
		
		//make it fight
		this.WalkAndFightClosestTarget(units_i[0],target_player,"CivilCentre");
	}
	
	//south side -- some infantry
	let num_infantry = 30;
	
	let inf_templates = ["units/spart_champion_infantry_pike","units/spart_champion_infantry_sword", "units/spart_champion_infantry_spear","units/spart_infantry_javelinist_a"];
	
	for (let i = 0; i < num_infantry; i ++)
	{
		//spawn unit
		let triggerPoint = pickRandom(this.GetTriggerPoints(triggerPointSouth));
		
		let units_i = TriggerHelper.SpawnUnits(triggerPoint,pickRandom(inf_templates), 1, owner);
		
		//make it fight
		this.WalkAndFightClosestTarget(units_i[0],target_player,"CivilCentre");
	}
	
	this.DoAfterDelay(15 * 1000,"CheckAssault",null);
	
}

{
	let cmpTrigger = Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger);

	// Activate all possible triggers
	/*let data = { "enabled": true };
	cmpTrigger.RegisterTrigger("OnStructureBuilt", "StructureBuiltAction", data);*/
	/*cmpTrigger.RegisterTrigger("OnConstructionStarted", "ConstructionStartedAction", data);
	cmpTrigger.RegisterTrigger("OnTrainingFinished", "TrainingFinishedAction", data);
	cmpTrigger.RegisterTrigger("OnTrainingQueued", "TrainingQueuedAction", data);
	cmpTrigger.RegisterTrigger("OnResearchFinished", "ResearchFinishedAction", data);
	cmpTrigger.RegisterTrigger("OnResearchQueued", "ResearchQueuedAction", data);
	
	cmpTrigger.RegisterTrigger("OnPlayerCommand", "PlayerCommandAction", data);*/
	
	/*
	 * some notes: 6:30 in, spart starts firt attack, 2 dozen troops + 2 rams (moderate + balanced)
	 * 
	 * 
	 */
	
	//some constants
	cmpTrigger.maxNumCretanTraders = 10;
	cmpTrigger.tradeEscortSize = 3;
	cmpTrigger.escortProb = 0.3;
	cmpTrigger.maxNumArcadianTraders = 6;
	
	cmpTrigger.patrolTemplates = ["units/athen_champion_ranged","units/athen_champion_marine","units/athen_champion_infantry","units/athen_champion_ranged_gastraphetes"];
	
	//some variables that change over time
	cmpTrigger.arcadiaAttackLevel = 20;
	cmpTrigger.arcadiaAttackInterval = 540; 
	cmpTrigger.arcadiaSiegeProb = 0.05;
	cmpTrigger.arcadiaAttackTemplates = ["units/athen_champion_ranged","units/athen_champion_marine","units/athen_champion_infantry","units/athen_champion_ranged_gastraphetes","units/athen_infantry_javelinist_a","units/athen_infantry_slinger_a","units/athen_infantry_spearman_a","units/athen_infantry_spearman_a"];
	
	//some variables that change over time
	cmpTrigger.achaeanAttackLevel = 30;
	cmpTrigger.achaeanAttackInterval = 720; 
	cmpTrigger.achaeanSiegeProb = 0.05;
	cmpTrigger.achaeanAttackTemplates = ["units/athen_cavalry_swordsman_a","units/athen_cavalry_javelinist_a","units/athen_infantry_javelinist_a","units/athen_infantry_slinger_a","units/athen_infantry_spearman_a","units/athen_infantry_spearman_a"];
	
	//whether the special attack has happened
	cmpTrigger.specialAttackTriggered = false;
	
	
	//garrison towers
	warn("Garrisoning entities");
	cmpTrigger.DoAfterDelay(5 * 1000,"GarrisonEntities",null);
	
	//start spawning traders
	cmpTrigger.DoAfterDelay(5 * 1000, "SpawnCretanTraders",null);
	cmpTrigger.DoAfterDelay(5 * 1000, "SpawnArcadianTraders",null);
	
	//start spawning patrols
	cmpTrigger.DoAfterDelay(10 * 1000,"SpawnArcadianPatrol",null);
	cmpTrigger.DoAfterDelay(10 * 1000,"SpawnAchaeanPatrol",null);
	
	//schedule assault
	cmpTrigger.DoAfterDelay(15 * 1000,"SpawnAssault",null);
	
	
	//cmpTrigger.DoAfterDelay(10 * 1000,"FlipMegolopolisAssets",null);
	
	
	
	//spawn patrols of forts
	//cmpTrigger.DoAfterDelay(10 * 1000,"SpawnFortressPatrol",null);
	
	//invasion sea attack
	//cmpTrigger.DoAfterDelay(10 * 1000,"SpawnNavalInvasionAttack",null);




	for (let p of [1,2,3,4,5,6])
	{
		let cmpPlayer = QueryPlayerIDInterface(p);
		
		//for players 3,4,5,6 disable templates
		
		if (p == 3 || p == 4 || p == 5 || p == 6)
		{
			//disable buildings production
			let disTemplates = disabledTemplates(cmpPlayer.GetCiv());
		
			//disable units as well
			let unit_templaes = TriggerHelper.GetTemplateNamesByClasses("Unit", cmpPlayer.GetCiv(), undefined, undefined, true);
			
			disTemplates = disTemplates.concat(unit_templaes);
		
			cmpPlayer.SetDisabledTemplates(disTemplates);
			warn("Disabling templates for player "+uneval(p));
		}
	
		let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
		
		cmpPlayer.AddStartingTechnology("phase_town_generic");
		cmpPlayer.AddStartingTechnology("phase_city_generic");
		
		if (p == 4 || p == 6)
		{
			cmpPlayer.AddStartingTechnology("trade_commercial_treaty");
			cmpPlayer.AddStartingTechnology("trade_gain_01");
			cmpPlayer.AddStartingTechnology("trade_gain_02");
		}
		
		if (p == 1)
		{
			cmpPlayer.AddStartingTechnology("unlock_shared_los");
			cmpPlayer.SetPopulationBonuses(100);
		}
	}
	
	
	/*cmpTrigger.RegisterTrigger("OnInterval", "IdleUnitCheck", {
		"enabled": true,
		"delay": 15 * 1000,
		"interval": 15 * 1000,
	});*/
	
	// Activate all possible triggers
	let data = { "enabled": true };
	cmpTrigger.RegisterTrigger("OnOwnershipChanged", "OwnershipChangedAction", data);
	
	/*cmpTrigger.DoAfterDelay(300 * 1000,"SpawnAlliedInvasionAttack",null);*/
	
	
	
};
