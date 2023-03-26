warn("loading the triggers file");

///////////////////////
// Trigger listeners //
///////////////////////

/*
 * treasures:
 * 	stones or stone: 300
 *  wood planks: 300
 * 	food_persian_big: 600 
 *  metal_persian_big: 500
 */

var unitTargetClass = "Unit+!Ship";
var siegeTargetClass = "Structure";


var triggerPointNorth = "B";
var triggerPointSouth = "A";
var triggerPointArchers = "K";
var triggerPointGate = "J";



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
	"structures/" + civ + "/house",
	
	// Expansions
	"structures/" + civ + "/civil_centre",
	"structures/" + civ + "/military_colony",

	// Walls
	"structures/" + civ + "/wallset_stone",
	"structures/rome_wallset_siege",
	"other/wallset_palisade",

	// Shoreline
	"structures/" + civ + "/dock",
	"structures/brit/crannog",
	"structures/cart/super_dock",
	"structures/ptol/lighthouse",
	
	//villagers
	"units/" + civ + "/support_female_citizen"
];


Trigger.prototype.ClusterUnits = function(units,num_clusters)
{
	let dataset = [];
	
	for (let u of units)
	{
		// get target position
		var cmpTargetPosition = Engine.QueryInterface(u, IID_Position).GetPosition2D();
		
		dataset.push([cmpTargetPosition.x,cmpTargetPosition.y]);
	}
	
	//how many clusters
	let kmeans = new KMeans({
	  canvas: null,
	  data: dataset,
	  k: num_clusters
	});
	
	let num_iterations = 40;
	
	for (let i = 0; i < num_iterations; i ++)
	{
		kmeans.run();
		
	}
	
	let clustering = kmeans.assignments;
	
	//warn(uneval(clustering));
	
	let clusters = [];
	for (let k = 0; k < num_clusters; k ++){
		let cluter_k = [];
		
		for (let i = 0; i < units.length; i ++){
			
			if (clustering[i] == k)
			{
				cluter_k.push(units[i]);
			}
		}
		
		clusters.push(cluter_k);
	}
	
	return clusters;
}

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

		let targetDistance = PositionHelper.DistanceBetweenEntities(attacker, target);
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
	//warn("The OnOwnershipChanged event happened with the following data:");
	//warn(uneval(data));
	
	if (data.entity == this.pegasusId)
	{
		//warn("Pegasus ackquired!");
		this.hasPegasus = true;
		
		if (this.pegasusQuestGiven == true)
		{
			this.ShowText("We have found the pegasus statue that the old priests wanted us to seek out. Now let's bring it to him to get our reward!","Sounds good","That was easy!"); 
		}
		else 
		{
			this.ShowText("Among the treasure we just found, there is an odd-looking pegasus statue -- we'll take it along, perhaps it could be reunited with its rightful owner?","Sounds good","That was easy!"); 
		}
		
		let cmpPlayer = QueryPlayerIDInterface(1);
		cmpPlayer.AddResource("metal",-1000);
	}
	else if (data.entity == this.banditTreasureId)
	{
		//we assume the bandits are defeated
		this.ShowText("The treasure captured from these bandits include various items of little values to us, but possibly belonging to someone in the area. Perhaps we should seek out their rightful owner?","Sounds good","That was easy!"); 
		
		this.banditsDefeated = true;
	}
	else if (data.entity == this.gaiaFortressId && data.to == 1)
	{
		this.ShowText("This captured fortress may come in handy should we need to deal with our enemies. We also found a stockpile inside which we can use to expand our force and improve our weapons. Unfortunaely, there are no materials here that we could use to build a siege tower, so we need to look for another fortress or workshop to fulfil that goal. ","Sounds good","That was easy!"); 
		
		//add some loot
		let cmpPlayer = QueryPlayerIDInterface(1);
		cmpPlayer.AddResource("wood",1500);
		cmpPlayer.AddResource("metal",500);
		
		let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
		
		cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_02");
		cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_03");
		
		
		this.gaiaFortressCaptured = true;
	}
	else if (data.entity == 1925 && this.gaiaCampCaptured == false) //gaia camp
	{
		let cmpPlayer = QueryPlayerIDInterface(1);
		cmpPlayer.SetPopulationBonuses(250);
		
		//spawn healers
		let units_i = TriggerHelper.SpawnUnits(data.entity,"units/mace/support_healer_e",5, 1);
		
		this.gaiaCampCaptured = true;
	}
	else if (data.entity == 1589 && data.to == 1)
	{
		//warn("captured catafalque");
		
		//captured catafalque - alexander gets better armor
		let cmpPlayer = QueryPlayerIDInterface(1);
		let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
		
		cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_02");
		cmpTechnologyManager.ResearchTechnology("soldier_resistance_pierce_02");
	}
	
	
	//check if gaia soldier, if so, make his buddies attack
	if (data.from == 0 && data.to == -1)
	{
		//check if soldier
		let id = Engine.QueryInterface(data.entity, IID_Identity);
		if (id && id.classesList.indexOf("Soldier") >= 0)
		{
			//find out which cluster
			let target_cluster = -1;
			
			for (let i = 0; i < this.gaiaClusters.length; i ++)
			{
				if (this.gaiaClusters[i].includes(data.entity))
				{
					target_cluster = i; 
					break;
				}
			}
			
			//warn("target cluster = "+target_cluster);
			
			if (target_cluster != -1)
			{
				//go through every unit in cluster and if idle, order to attack
				for (let u of  this.gaiaClusters[target_cluster])
				{
					let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
					if (cmpUnitAI)
					{
						if (cmpUnitAI.IsIdle()){
							this.WalkAndFightClosestTarget(u,1,"Unit");
						}
					}
				}
			}
		}
	
	
		if (data.entity == 1718 || data.entity == 1719 || data.entity == 1720)
		{
			//spawn siege
			let units_i = TriggerHelper.SpawnUnits(data.entity,"units/mace/siege_oxybeles_unpacked",1, 1);
			
		}
	}
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
				//warn("Unloading");
				cmpGarrisonHolder.UnloadAll();
			}
			else if (humans.length == 0 && siegeEngines == 0)
			{
				//warn("Done unloading");
				
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
				
				//warn("Next invasion in "+uneval(this.carthageInvasionAttackInterval));
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


//garison AI entities with archers
Trigger.prototype.GarrisonEntities = function(data)
{
	
	for (let p of [0,2,3,4,5,6,7])
	{
		//outposts
		let posts_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Outpost").filter(TriggerHelper.IsInWorld);
		
		for (let e of posts_p)
		{
			//spawn the garrison inside the tower
			let size = 1;
			
			
			let archers_e = TriggerHelper.SpawnUnits(e, "units/pers/infantry_archer_e",size,p);
			
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.OccupyTurret(e,true,true);
			}
		}
		
		
		//towers
		let towers_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "StoneTower").filter(TriggerHelper.IsInWorld);
		
		for (let e of towers_p)
		{
			//spawn the garrison inside the tower
			let size = 5;
			if (p == 0)
				size = 2;
			
			
			let archers_e = TriggerHelper.SpawnUnits(e, "units/pers/infantry_archer_e",size,p);
			
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(e,true);
			}
		}
		
		//sentry tower
		let towers_s = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "SentryTower").filter(TriggerHelper.IsInWorld);
		
		for (let e of towers_s)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(e, "units/pers/infantry_archer_e",3,p);
			
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(e,true);
			}
		}
		
		//FORTRESS
		let forts_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Fortress").filter(TriggerHelper.IsInWorld);
		
	
		for (let e of forts_p)
		{
			//spawn the garrison inside the tower
			let fort_size = 20;
			if (p == 0)
				fort_size = 5;
			
			
			let archers_e = TriggerHelper.SpawnUnits(e, "units/pers/infantry_archer_e",fort_size,p);
			
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(e,true);
			}
		}
		
		//wall towers
		/*if (p == 2)
		{
			let towers_w = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Defensive+Tower+!Outpost+!GarrisonTower").filter(TriggerHelper.IsInWorld);
			for (let e of towers_w)
			{
				//spawn the garrison inside the tower
				let archers_e = TriggerHelper.SpawnUnits(e, "units/pers_infantry_archer_e",2,p);
					
				for (let a of archers_e)
				{
					let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
					cmpUnitAI.Garrison(e,true);
				}
			}
		}*/
		
		let camps_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p),"MercenaryCamp").filter(TriggerHelper.IsInWorld);
			
		for (let c of camps_p)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(c, "units/athen/champion_ranged",5,p);
			
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(c,true);
			}
		}
		
		let temples_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p),"Temple").filter(TriggerHelper.IsInWorld);
			
		for (let c of temples_p)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(c, "units/pers/infantry_archer_e",5,p);
			
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
	for (let p of [7])
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



Trigger.prototype.FlipAlliedAssets = function(data)
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
		
		let units_i = TriggerHelper.SpawnUnits(triggerPoint, "units/spart/cavalry_spearman_a", 1, owner);
		
		//make it fight
		this.WalkAndFightClosestTarget(units_i[0],target_player,"CivilCentre");
	}
	
	for (let i = 0; i < num_ballistas; i ++)
	{
		//spawn unit
		let triggerPoint = pickRandom(this.GetTriggerPoints(triggerPointNorth));
		
		let units_i = TriggerHelper.SpawnUnits(triggerPoint, "units/athen/siege_oxybeles_packed", 1, owner);
		
		//make it fight
		this.WalkAndFightClosestTarget(units_i[0],target_player,"CivilCentre");
	}
	
	//south side -- some infantry
	let num_infantry = 30;
	
	let inf_templates = ["units/spart/champion_infantry_pike","units/spart/champion_infantry_swordsman", "units/spart/champion_infantry_spear","units/spart/infantry_javelineer_a"];
	
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

Trigger.prototype.SpawnFortressAttackSquad = function(data)
{
	let attackers = [];
	let p = 5;
	
	//warn(uneval(data));
	
	for (let i = 0; i < data.squad_size; i ++)
	{
		let units_i = TriggerHelper.SpawnUnits(data.site,pickRandom(data.templates),1,p);
		attackers.push(units_i[0]);
	}
	
	//set formation
	TriggerHelper.SetUnitFormation(p, attackers, pickRandom(unitFormations));

	//attack nearest structure
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


Trigger.prototype.SpawnRearPassAttackSquad = function(data)
{
	let attackers = [];
	let p = 7;
	
	for (let i = 0; i < data.squad_size; i ++)
	{
		let units_i = TriggerHelper.SpawnUnits(data.site,pickRandom(data.templates),1,p);
		attackers.push(units_i[0]);
	}
	
	//attack towards alexnader
	let target = this.alexanderId;
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

Trigger.prototype.SpawnPassAttackSquad = function(data)
{
	let attackers = [];
	let p = 7;
	
	for (let i = 0; i < data.squad_size; i ++)
	{
		let units_i = TriggerHelper.SpawnUnits(data.site,pickRandom(data.templates),1,p);
		attackers.push(units_i[0]);
	}
	
	//set formation
	TriggerHelper.SetUnitFormation(p, attackers, pickRandom(unitFormations));

	//attack pass
	let target = this.GetTriggerPoints("F")[0];
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


//attack against captured gaia fortress
Trigger.prototype.SpawnFortressAttack = function(data)
{
	//determine size of attack
	let size = 45;
	
	let cmpPlayer = QueryPlayerIDInterface(1);
	let pop = cmpPlayer.GetPopulationCount();
	size += Math.round(pop*0.65); //pretty big attack
	
	//templatets
	let templates = ["units/pers/arstibara","units/pers/champion_infantry","units/pers/kardakes_hoplite", "units/pers/kardakes_skirmisher","units/pers/infantry_archer_b","units/pers/infantry_spearman_e","units/pers/infantry_spearman_a","units/pers/infantry_archer_a","units/pers/infantry_spearman_b"];
	
	let ele_templates = TriggerHelper.GetTemplateNamesByClasses("Champion+Elephant+!Hero", "pers", undefined, undefined, true);
	templates.push(ele_templates[0]);
	
	
	
	//size of each squad
	let squad_size = 8;
	let num_squads = Math.round(size / squad_size);
	//warn("spawning "+num_squads+" squads");
	
	//spawn sites -- towers
	let p = 4;
	let sites = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "StoneTower").filter(TriggerHelper.IsInWorld);
	
	for (let i = 0; i < num_squads; i ++)
	{
		let data = {};
		data.squad_size = squad_size;
		data.templates = templates;
		data.site = pickRandom(sites);
		
		this.DoAfterDelay(4*(i+1) * 1000,"SpawnFortressAttackSquad",data);
		
	}
}


Trigger.prototype.VictoryTextFn = function(n)
{
	return markForPluralTranslation(
          "%(lastPlayer)s has won (game mode).",
         "%(players)s and %(lastPlayer)s have won (game mode).",
          n);
}

//attack against captured gaia fortress
Trigger.prototype.VictoryCheck = function(data)
{
	let cmpPlayer = QueryPlayerIDInterface(7);
	
	//warn(uneval(cmpPlayer.GetPopulationCount()));
	
	if (cmpPlayer.GetPopulationCount() <= this.victoryPopLevel)
	{
		//warn("Victory!!!");
		TriggerHelper.SetPlayerWon(1,this.VictoryTextFn,this.VictoryTextFn);	
	}
	else
	{
		this.DoAfterDelay(20 * 1000,"VictoryCheck",data);
	}
}


//attack against captured gaia fortress
Trigger.prototype.SpawnPassAttack = function(data)
{
	//check population before pass attack
	let cmpPlayer = QueryPlayerIDInterface(7);
	this.victoryPopLevel = cmpPlayer.GetPopulationCount();
	//warn("victory pop level = "+this.victoryPopLevel);
	
	//determine size of attack
	let size = 120;
	
	let cmpPlayer1 = QueryPlayerIDInterface(1);
	let pop = cmpPlayer1.GetPopulationCount();
	size += Math.round(pop*0.8); //pretty big attack
	
	//templatets
	let templates = ["units/pers/arstibara","units/pers/arstibara","units/pers/champion_infantry","units/pers/champion_infantry","units/pers/kardakes_hoplite", "units/pers/kardakes_skirmisher","units/pers/infantry_archer_e","units/pers/infantry_spearman_e","units/pers/infantry_spearman_e","units/pers/infantry_archer_e","units/pers/infantry_archer_a","units/pers/infantry_archer_b","units/pers/infantry_spearman_e","units/pers/champion_cavalry","units/pers/champion_cavalry_archer","units/pers/cavalry_axeman_e","units/pers/cavalry_spearman_e"];
	
	let ele_templates = TriggerHelper.GetTemplateNamesByClasses("Champion+Elephant+!Hero", "pers", undefined, undefined, true);
	templates.push(ele_templates[0]);
	
	//templates for rear attack
	let cav_templates = ["units/pers/cavalry_axeman_e","units/pers/cavalry_axeman_a","units/pers/cavalry_spearman_e","units/pers/cavalry_spearman_a","units/pers/cavalry_spearman_b","units/pers/cavalry_javelineer_e"];
	
	//size of each squad
	let squad_size = 13;
	let num_squads = Math.round(size / squad_size);
	//warn("spawning "+num_squads+" squads");
	
	//spawn sites -- towers
	let p = 4;
	let sites = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Outpost").filter(TriggerHelper.IsInWorld);
	
	for (let i = 0; i < num_squads; i ++)
	{
		let data = {};
		data.squad_size = squad_size+Math.round(i*1.55);
		data.templates = templates;
		data.site = pickRandom(sites);
		
		this.DoAfterDelay(12*(i+1) * 1000,"SpawnPassAttackSquad",data);
		
		//spawn rear attacks at the end
		if (num_squads - i < 4 || (i+1) % 4 == 0 )
		{
			let data_rear = {};
			data_rear.site = this.GetTriggerPoints("E")[1];
			data_rear.templates = cav_templates;
			data_rear.squad_size = 10;
			
			this.DoAfterDelay(12*(i+1) * 1000,"SpawnRearPassAttackSquad",data_rear);
		}
		
		//last batch, somewhat stronger
		if (i == num_squads - 1)
		{
			let data_rear = {};
			data_rear.site = this.GetTriggerPoints("E")[1];
			data_rear.templates = cav_templates;
			data_rear.squad_size = 10;
			
			this.DoAfterDelay((12*(i+2)) * 1000,"SpawnRearPassAttackSquad",data_rear);
			this.DoAfterDelay((12*(i+3)) * 1000,"SpawnRearPassAttackSquad",data_rear);
			
			this.DoAfterDelay(12*(i+2) * 1000,"SpawnPassAttackSquad",data);
		
		}
	}
	
	this.DoAfterDelay(60 * 1000,"VictoryCheck",data);
	
	
	this.passAttackTriggered = true;
}

Trigger.prototype.SpawnAlexnaderAmbush = function(data)
{
	
	//site
	let spearmen_site = this.alexanderId; //they spawn around alexnader and also by the trigger point
	
	let num_spearmen = 10;
	let num_ranged = 10;
	
	//spawn spearmen
	let p = 5;
	let units_s = TriggerHelper.SpawnUnits(spearmen_site,"units/pers/kardakes_hoplite",num_spearmen,p);
	
	//spawn some ranged units
	let ranged_site = this.GetTriggerPoints("I")[0];
	
	let units_r = TriggerHelper.SpawnUnits(ranged_site,"units/pers/kardakes_skirmisher",num_ranged,p);
	
	//spawn some additional attackers based on number of units	
		
	let cmpPlayer = QueryPlayerIDInterface(1);
	let pop = cmpPlayer.GetPopulationCount();
	let size = Math.round(pop*this.ambushAssassinsRatio);
	warn("Spawning additional "+size+" attackers");
	let units = [];
	let templates = ["units/pers/infantry_spearman_e","units/pers/infantry_spearman_a","units/pers/kardakes_skirmisher"];
	for (let i = 0; i < size; i ++)
	{
		let units_i = TriggerHelper.SpawnUnits(ranged_site,pickRandom(templates),1,p);
		units.push(units_i[0]);
	}
			
	//make them attack towards alexnader
	units = units.concat(units_r,units_s);
	
	let target = this.FindClosestTarget(units[0],1,"Hero");
	
	let target_pos = TriggerHelper.GetEntityPosition2D(target);

	ProcessCommand(p, {
		"type": "attack-walk",
		"entities": units,
		"x": target_pos.x,
		"z": target_pos.y,
		"queued": true,
		"targetClasses": {
			"attack": unitTargetClass
		},
		"allowCapture": false
	});
}


Trigger.prototype.SpawnTraderAttack = function(data)
{
	//warn("trader attack");
	
	//get sites
	let site = this.GetTriggerPoints("C")[0];
	let p = 0;
	
	let attack_size = 25;
	let templates = ["units/pers_cavalry_spearman_a","units/pers_cavalry_swordsman_a","units/pers_cavalry_javelinist_a","units/pers/champion_cavalry_archer","units/pers/champion_cavalry"];
	
	let attackers = [];
	
	for (let i = 0; i < attack_size; i ++)
	{
		//spawn archer
		let units_i = TriggerHelper.SpawnUnits(site,pickRandom(templates),1,p);
		
		attackers.push(units_i[0]);
	}
	
	//attack nearest trader
	let target_player = 6;
	let target = this.FindClosestTarget(attackers[0],target_player,"Trader");
	
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

Trigger.prototype.SpawnAmbush = function(data)
{
	//warn("Archer ambush");
	
	//get sites
	let spawn_sites = this.GetTriggerPoints(triggerPointArchers);
	
	//spawn archers at each
	let p = 5;
	
	for (let site of spawn_sites)
	{
		//spawn archer
		let units_i = TriggerHelper.SpawnUnits(site,"units/pers/infantry_archer_e",1,p);
	}
	
	this.ambushTriggered = true;
	
	//flip assets shortly
	this.DoAfterDelay(1 * 1000,"FlipAlliedAssets",null);
	
}


Trigger.prototype.DropSiteWarning = function(data)
{
	
	this.ShowText("The fishermen urge you to return all your good to the dock now -- they'll need to resume operations very soon","OK","Will do");
}


Trigger.prototype.DropSiteEnd = function(data)
{
	
	this.ShowText("The fishermen have now resumed operations at their dock -- they thank you for your help and hope you gathered enough resources.","OK","Will do");


	//set team to allies so we can use their dock
	let cmpPlayer = QueryPlayerIDInterface(1);
	cmpPlayer.SetNeutral(6);
			
	cmpPlayer = QueryPlayerIDInterface(6);
	cmpPlayer.SetNeutral(1);
	
}




Trigger.prototype.RangeActionBanditAttack = function(data)
{
	//send all cavalry to attack
	if (this.banditAtttackTriggered == false)
	{
		let p = 0;
		let attackers = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Cavalry").filter(TriggerHelper.IsInWorld);
		
		//spawn some additional attackers based on number of units
		let templates = ["units/pers/cavalry_spearman_b","units/pers/cavalry_spearman_a","units/pers/cavalry_axeman_a","units/pers/cavalry_javelineer_b","units/pers/champion_cavalry_archer","units/pers/champion_cavalry"];
	
		let cmpPlayer = QueryPlayerIDInterface(1);
		let pop = cmpPlayer.GetPopulationCount();
		let size = Math.round(pop*this.banditRatio)-5;
		//warn("Spawning additional "+size+" attackers");
		let site = 1791; //falled doric column
		for (let i = 0; i < size; i ++)
		{
			let units_i = TriggerHelper.SpawnUnits(site,pickRandom(templates),1,p);
			attackers.push(units_i[0]);
		}
		
		for (let u of attackers)
		{
			this.WalkAndFightClosestTarget(u,1,"Hero");
		}
		
		this.banditAtttackTriggered = true;
	}
}


Trigger.prototype.RewardTraders = function(data)
{
	//get some tech
	let cmpPlayer = QueryPlayerIDInterface(1);
	let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
	cmpTechnologyManager.ResearchTechnology("armor_infantry_02");
	cmpTechnologyManager.ResearchTechnology("armor_infantry_02");
	cmpTechnologyManager.ResearchTechnology("armor_cav_02");
	cmpTechnologyManager.ResearchTechnology("attack_infantry_ranged_02");
	cmpTechnologyManager.ResearchTechnology("attack_infantry_ranged_02");
	cmpTechnologyManager.ResearchTechnology("attack_cavalry_melee_02");
	cmpTechnologyManager.ResearchTechnology("attack_cavalry_melee_02");
	cmpTechnologyManager.ResearchTechnology("attack_infantry_melee_02");
	cmpTechnologyManager.ResearchTechnology("attack_infantry_melee_02");
}

Trigger.prototype.RangeActionTradersDestination = function(data)
{
	if (this.traderEscortQuestGiven == true && this.traderEscortReward == false)
	{
		let give_reward = false;
		
		for (let e of data.currentCollection)
		{
			let id = Engine.QueryInterface(e, IID_Identity);
			if (id.classesList.indexOf("Trader") >= 0)
			{
				give_reward = true;
			}
		}
		
		if (give_reward == true)
		{
			this.traderEscortReward = true;
			
			this.ShowText("The caravan is grateful for your help. They do not have much to offer but among them is a skilled blacksmith who sharpens your weapons and polishes your armor.","Thank you","That will do");
			
			this.RewardTraders();
			
			
			//warn("give reward for escort service");
		}
	}
	
}



Trigger.prototype.SendTradersToTarget = function(data)
{
	//see if there is a gaia market
	let markets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(0), "Market").filter(TriggerHelper.IsInWorld);
		
	//make them move to target market
	for (let u of this.traders)
	{
		let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
		let target_pos = TriggerHelper.GetEntityPosition2D(markets[0]);
					
		cmpUnitAI.SwitchToStance("passive");
		cmpUnitAI.WalkToTarget(markets[0], false);
	}
	
}

Trigger.prototype.RangeActionTraders = function(data)
{
	if (this.traderEscortQuestGiven == false && this.gaiaFortressCaptured == true)
	{
	
		//see if there is a gaia market
		let markets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(0), "Market").filter(TriggerHelper.IsInWorld);
		
		if (markets.length > 0)
		{
		
			this.ShowText("You encounter a trade caravan in desperate need of help. They are headed to the nearest supply stop -- a neutral market past your camps. If you escort them, they promise a large reward for your service.\n\nThe traders will need a few seconds to regroup. Go ahead and march in the direction of your camps to clear the way of any possible problems.","Fine, we'll do it", "Good luck, man");
		
			//spawn some traders and ask for escort
			let spawn_site = this.GetTriggerPoints("B")[0];
			let p = 6;
			
			//spawn traders
			let units_i = TriggerHelper.SpawnUnits(spawn_site,"units/pers_support_trader",3,p);

			this.traders = units_i;

			this.DoAfterDelay(25 * 1000,"SendTradersToTarget",null);
		

			//make them move to target market
			/*for (let u of units_i)
			{
				let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
				let target_pos = TriggerHelper.GetEntityPosition2D(markets[0]);
					
				cmpUnitAI.SwitchToStance("passive");
				cmpUnitAI.WalkToTarget(markets[0], false);
			}*/
		}
		
		//set quest as given
		this.traderEscortQuestGiven = true;
		
		//schedule an attack about a minute and 20 seconds from now
		this.DoAfterDelay(135 * 1000,"SpawnTraderAttack",null);
		
	}
}

Trigger.prototype.RangeActionDock = function(data)
{
	if (data.added.indexOf(this.alexanderId) >= 0)
	{
		if (this.banditHorseQuestGiven == false)
		{
			this.ShowText("A band of local fisherman seem to be using this dock. They greet you and share a tale of horse bandis who have pillaged their fishing supplies. Should you encounter and defeat them, they ask that you bring their supplies back. In exchange, they inform you that a heard of escaped elephants is grazing nearby and they will let you hunt them and use their dock to process the meat.","We're on it!","Tasty!");
			
			this.banditHorseQuestGiven = true;
		}
		else if (this.banditHorseQuestGiven == true && this.banditsDefeated == true && this.banditsRewardGiven == false)
		{
			this.ShowText("The fishermen are happy to be reunited with their fishing nets. You can now use their dock to drop off any meat you gather from the elephant herd. The fisherman need to get back to work in a short while so please hurry!","We're on it!","Tasty!");
			
			//set team to allies so we can use their dock
			let cmpPlayer = QueryPlayerIDInterface(1);
			cmpPlayer.SetAlly(6);
			
			cmpPlayer = QueryPlayerIDInterface(6);
			cmpPlayer.SetAlly(1);
			
			this.banditsRewardGiven = true;
			
			this.DoAfterDelay(180 * 1000,"DropSiteWarning",null);
			
			this.DoAfterDelay(210 * 1000,"DropSiteEnd",null);
	
		}
		
	}
	
	
	
	
}


Trigger.prototype.RangeActionTemple = function(data)
{
	//warn(uneval(data));
	
	if (data.added.indexOf(this.alexanderId) >= 0)
	{
		if (this.pegasusQuestGiven == false)
		{
			//give quest
			this.ShowText("As we get close to the temple, an old priests walks out. He welcomes you as a guest and shares the story of a ritual pegasus statue that was once looted from the temple by bandits. Should you find that statue, the priest implores you to return it -- get is willing to offer you a small reward that the temple could afford","Great, we'll look for it","Nah, we got more important things to do");
					
			this.pegasusQuestGiven = true;
			
		}
		else if (this.pegasusQuestGiven == true && this.hasPegasus == true)
		{
			//give quest
			this.ShowText("The priest is happy to see you again. He looks at the statue you have brought and says, 'Yes, this is it! Now about the reward....'. He looks nervously around him and all of a sudden shouts, 'NOW!!!'....","Now what?","This doesn't look good...");
			
			this.assassinationTriggered =  true;
			this.DoAfterDelay(1 * 1000,"SpawnAlexnaderAmbush",null);
	
			//spawn ambush
			this.hasPegasus = false;
			
		}
		else if (this.assassinationTriggered && this.templeRewardGiven == false)
		{
			//give quest
			this.ShowText("The temple's priests gather humbly in front of you and turn in the traitor -- a priest who revealed your locatiion to the assassins and signaled them into action. To make up for what they have done, the temple turns over some healing supplies. Your troops will now be healed faster when garrisoned or idle. ","Great","Too little, too late!");
			
			this.templeRewardGiven = true;
			
			this.RewardTemple();
		}
	}
}

Trigger.prototype.RewardTemple = function(data)
{	
	let p = 1;
	let cmpPlayer = QueryPlayerIDInterface(p);
	let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
	
	/*cmpTechnologyManager.ResearchTechnology("heal_barracks");
	cmpTechnologyManager.ResearchTechnology("heal_barracks");
	cmpTechnologyManager.ResearchTechnology("heal_barracks");
	cmpTechnologyManager.ResearchTechnology("heal_barracks");
	cmpTechnologyManager.ResearchTechnology("heal_barracks");*/
	
	cmpTechnologyManager.ResearchTechnology("health_regen_units");
	cmpTechnologyManager.ResearchTechnology("health_regen_units");
	
	this.heal_rate_g = this.heal_rate_g * 2;	
}



Trigger.prototype.RangeActionPassAttack = function(data)
{
	if (this.passAttackTriggered == false)
	{
		//warn(uneval(data));
		if (data.currentCollection.length > 5)
		{
			//trigger attack
			//warn("pass attack");
			this.DoAfterDelay(30 * 1000,"SpawnPassAttack",null);
	
			this.passAttackTriggered = true;
			
			this.ShowText("Finally, we have found a way! In the distance, you see a Persian fortress and an army assembling nearby, getting ready to march towards us. We must meet them in battle. If we win, this is it for the Persian Empire!","We will meet the enemy in the field!","We will defend ourselves from the higher ground!");
		}
		
	}
}



Trigger.prototype.RangeActionFortressAttack = function(data)
{
	if (this.fortressAttackTriggered == false && this.gaiaFortressCaptured == true)
	{
		//warn(uneval(data));
		if (data.currentCollection.length > 5)
		{
			//trigger attack
			//warn("fortress attack");
			this.DoAfterDelay(10 * 1000,"SpawnFortressAttack",null);
	
			this.fortressAttackTriggered = true;
			
			this.ShowText("This path looks promising....but further in the distance your scouts notice enemy forces marching towards us. Prepare for battle!","Yes, sir!","Oh no!");
		}
		
	}
}


Trigger.prototype.RangeActionAmbush = function(data)
{
	if (this.ambushTriggered == false)
	{
		//spawn ambush
		this.SpawnAmbush();
		
		this.ShowText("The pass is blocked and we have been ambushed! Retreat! We must get back to our camp and find an alternate route!","Yikes!","OK");
	}
}

Trigger.prototype.StartMarch = function(data)
{
	let p = 3;
	
	//get all units
	let attackers = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Unit").filter(TriggerHelper.IsInWorld);
	
	//put them in formation
	//set formation
	TriggerHelper.SetUnitFormation(p, attackers, pickRandom(unitFormations));

	//find target

	let target = pickRandom(this.GetTriggerPoints(triggerPointGate));
		
	
	let target_pos = TriggerHelper.GetEntityPosition2D(target);
	
	ProcessCommand(p, {
		"type": "walk",
		"entities": attackers,
		"x": target_pos.x,
		"z": target_pos.y,
		"queued": true
	});
	
}


Trigger.prototype.StructureDecayCheck = function(data)
{
	for (let p of [4])
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

Trigger.prototype.HealthCheck = function(data)
{
	//find all garissoned units
	let p = 1;
	let units_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(1), "Unit");
	
	for (let u of units_p)
	{
		let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
		if (cmpUnitAI.isGarrisoned)
		{
			//warn("Found unit to heal!");
			
			//check health
			let health_u = Engine.QueryInterface(u, IID_Health);
			
			let health_needed = health_u.GetMaxHitpoints() - health_u.GetHitpoints();
			
			/*let heal_amount = this.heal_rate_g;
			if (heal_amount > health_needed)
				heal_amount = health_needed;*/
				
			health_u.Increase(this.heal_rate_g);
		}
	}
	
}

Trigger.prototype.ResearchStartingTech = function(data)
{
	
	let cmpModifiersManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_ModifiersManager);

	
	for (let p of [1,2,4,5])
	{
	
		let cmpPlayer = QueryPlayerIDInterface(p);
		let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
		
		if (p == 1)
		{
			//armor
			cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_01");
			cmpTechnologyManager.ResearchTechnology("soldier_resistance_pierce_01");
			
			//attack
			cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_01");
			cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_01");
			cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_02");
			
			//better cavalry
			cmpTechnologyManager.ResearchTechnology("cavalry_health");
			cmpTechnologyManager.ResearchTechnology("cavalry_movement_speed");
			cmpTechnologyManager.ResearchTechnology("nisean_horses");
			
			//shared drop sites
			cmpTechnologyManager.ResearchTechnology("unlock_shared_dropsites");
			
			//hero
			cmpModifiersManager.AddModifiers("Hero Piercing Armor Bonus", {
							"Resistance/Entity/Damage/Pierce": [{ "affects": ["Hero"], "add": 4}],
						}, cmpPlayer.entity);
			cmpModifiersManager.AddModifiers("Hero Hack Armor Bonus", {
							"Resistance/Entity/Damage/Hack": [{ "affects": ["Hero"], "add": 4}],
						}, cmpPlayer.entity);
				cmpModifiersManager.AddModifiers("Hero Crush Armor Bonus", {
							"Resistance/Entity/Damage/Crush": [{ "affects": ["Hero"], "add": 10}],
						}, cmpPlayer.entity);
			
			
		}
	}
}


Trigger.prototype.SetDiplomacy = function(data)
{
	//everyone is neutral towards 6
	
	for (let p of [1,2,3,4,5,7])
	{
		let cmpPlayer = QueryPlayerIDInterface(p);
		cmpPlayer.SetNeutral(6);
	}
	
	let cmpPlayer = QueryPlayerIDInterface(6);
	for (let p of [1,2,3,4,5,7])
	{
		cmpPlayer.SetNeutral(p);
	}
	
	//persian defenders is neutral towards other persians so they don't try to retreat to their castles
	cmpPlayer = QueryPlayerIDInterface(5);
	for (let p of [2,4])
	{
		cmpPlayer.SetNeutral(p);
	}
	
	cmpPlayer = QueryPlayerIDInterface(7);
	for (let p of [2,4])
	{
		cmpPlayer.SetNeutral(p);
	}
}


Trigger.prototype.InitGaiaClusters = function(data)
{
	//get all gaia soldiers
	let soldiers = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(0), "Soldier+!Elephant+!Siege").filter(TriggerHelper.IsInWorld);
	
	//warn("Found "+soldiers.length+" gaia soldiers.");
	
	//cluster them
	let num_clusters = 6;
	
	
	let clusters = this.ClusterUnits(soldiers,num_clusters);
	//warn(uneval(clusters));
	
	//store so we can check when a unit is killed, who its buddies are
	this.gaiaClusters = clusters;
	
}


{
	let cmpTrigger = Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger);

	//some constants
	cmpTrigger.pegasusId = 1575;
	cmpTrigger.alexanderId = 1472;
	cmpTrigger.banditTreasureId = 1665;
	cmpTrigger.gaiaFortressId = 1790;
	
	//some state variables
	cmpTrigger.ambushTriggered = false;
	cmpTrigger.hasPegasus = false;
	cmpTrigger.pegasusQuestGiven = false;
	cmpTrigger.currentDialog = "none";
	cmpTrigger.assassinationTriggered = false;
	cmpTrigger.templeRewardGiven = false;
	
	cmpTrigger.banditHorseQuestGiven = false;
	cmpTrigger.banditsDefeated = false;
	cmpTrigger.banditsRewardGiven = false;
	cmpTrigger.banditAtttackTriggered = false;
	
	cmpTrigger.traderEscortQuestGiven = false;
	cmpTrigger.traderEscortReward = false;
	cmpTrigger.traders = null;
	
	cmpTrigger.gaiaFortressCaptured = false;
	
	cmpTrigger.fortressAttackTriggered = false;
	
	cmpTrigger.passAttackTriggered = false;
	cmpTrigger.victoryPopLevel = null;
	
	cmpTrigger.gaiaCampCaptured = false;
	
	//healing rate for garrisoned units, every 15 seconds
	cmpTrigger.heal_rate_g = 40;
	
	//how many additional troops to spawn at various times as a function of current population
	cmpTrigger.ambushAssassinsRatio = 0.2;
	cmpTrigger.banditRatio = 0.2;
	
	
	//brit catafalque -- greater vision and movement for infantry, greater range for skirmishers
	//cart catagalque -- + 1 armoer and attack for melee cavalry
	//iber catafalque -- extra health for soldiers
	//mace -- extra loot + slow trickle of metal
	//rome -- + 1 armor for all units
	
	/*
	 * Notes from run 1:
	 * made it to trader quest without attack from cavalry
	 * 
	 * 3.1k food, 300 stone and 3000 metal 
	 * 
	 * 20 pikemen trained
	 * 16 archers, 11 skirm, 35 slingers
	 * 
	 * assisin attempt and bandit battle sizes should scale
	 * 
	 * after destroying ballistans, a random attack by fanatics
	 * 
	 * close fanatic archers up in the mountain
	 * 
	 * lost 4 units, killed 103
	 * 
	 * replace rome with brit catafalque
	 * 
	 */ 
	
	//garrison towers
	//warn("Garrisoning entities");
	cmpTrigger.DoAfterDelay(5 * 1000,"GarrisonEntities",null);
	
	//set diplomacy
	cmpTrigger.DoAfterDelay(2 * 1000,"SetDiplomacy",null);
	
	//starting tech
	cmpTrigger.DoAfterDelay(2 * 1000,"ResearchStartingTech",null);
	
	//start march
	cmpTrigger.DoAfterDelay(8 * 1000,"StartMarch",null);
	
	//init gaia clusters
	cmpTrigger.DoAfterDelay(1 * 1000,"InitGaiaClusters",null);

	
	//debug
	//cmpTrigger.DoAfterDelay(5 * 1000,"RewardTraders",null);
	//cmpTrigger.DoAfterDelay(10 * 1000,"SpawnFortressAttack",null);
	
	


	for (let p of [1,2,3,4,5])
	{
		let cmpPlayer = QueryPlayerIDInterface(p);
		
		//disable buildings production
		let disTemplates = disabledTemplates(cmpPlayer.GetCiv());
		
		//for players 3,4,5,6 disable templates
		if (p == 3 || p == 4 || p == 5)
		{
			
			//disable units as well
			let unit_templaes = TriggerHelper.GetTemplateNamesByClasses("Unit", cmpPlayer.GetCiv(), undefined, undefined, true);
			
			disTemplates = disTemplates.concat(unit_templaes);
		}
		
		cmpPlayer.SetDisabledTemplates(disTemplates);
		//warn("Disabling templates for player "+uneval(p));
		
		
		let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
		
		cmpTechnologyManager.ResearchTechnology("phase_town_generic");
		cmpTechnologyManager.ResearchTechnology("phase_city_generic");
		
		/*if (p == 4 || p == 6)
		{
			cmpPlayer.AddStartingTechnology("trade_commercial_treaty");
			cmpPlayer.AddStartingTechnology("trade_gain_01");
			cmpPlayer.AddStartingTechnology("trade_gain_02");
		}*/
		
		if (p == 1)
		{
			cmpTechnologyManager.ResearchTechnology("unlock_shared_los");
			cmpTechnologyManager.ResearchTechnology("heal_rate");
			cmpTechnologyManager.ResearchTechnology("heal_rate_2");
			cmpTechnologyManager.ResearchTechnology("heal_range");
			cmpTechnologyManager.ResearchTechnology("heal_range_2");
			cmpTechnologyManager.ResearchTechnology("unlock_champion_infantry");
			
			cmpPlayer.SetPopulationBonuses(200);
		}
		else if (p == 4 || p == 2)
		{
			cmpTechnologyManager.ResearchTechnology("tower_health");
			cmpTechnologyManager.ResearchTechnology("tower_range");
			cmpTechnologyManager.ResearchTechnology("tower_watch");
			cmpTechnologyManager.ResearchTechnology("tower_murderholes");
			cmpTechnologyManager.ResearchTechnology("tower_crenellations");
		}
	}
	
	cmpTrigger.RegisterTrigger("OnRange", "RangeActionAmbush", {
		"entities": cmpTrigger.GetTriggerPoints(triggerPointGate), // central points to calculate the range circles
		"players": [3], // only count entities of player 1
		"maxRange": 30,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});
	
	
	cmpTrigger.RegisterTrigger("OnRange", "RangeActionTemple", {
		"entities": cmpTrigger.GetTriggerPoints("I"), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 30,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});
	
	cmpTrigger.RegisterTrigger("OnRange", "RangeActionDock", {
		"entities": cmpTrigger.GetTriggerPoints("H"), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 30,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});
	
	cmpTrigger.RegisterTrigger("OnRange", "RangeActionBanditAttack", {
		"entities": cmpTrigger.GetTriggerPoints("A"), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 45,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});
	
	cmpTrigger.RegisterTrigger("OnRange", "RangeActionTraders", {
		"entities": cmpTrigger.GetTriggerPoints("B"), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 40,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});
	
	cmpTrigger.RegisterTrigger("OnRange", "RangeActionTradersDestination", {
		"entities": cmpTrigger.GetTriggerPoints("D"), // central points to calculate the range circles
		"players": [6], // only count entities of player 1
		"maxRange": 40,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});
	
	cmpTrigger.RegisterTrigger("OnRange", "RangeActionFortressAttack", {
		"entities": cmpTrigger.GetTriggerPoints("E"), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 30,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});
	
	cmpTrigger.RegisterTrigger("OnRange", "RangeActionPassAttack", {
		"entities": cmpTrigger.GetTriggerPoints("F"), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 30,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});
	
	cmpTrigger.RegisterTrigger("OnInterval", "HealthCheck", {
		"enabled": true,
		"delay": 15 * 1000,
		"interval": 15 * 1000,
	});
	
	cmpTrigger.RegisterTrigger("OnInterval", "IdleUnitCheck", {
		"enabled": true,
		"delay": 15 * 1000,
		"interval": 15 * 1000,
	});
	
	cmpTrigger.RegisterTrigger("OnInterval", "StructureDecayCheck", {
		"enabled": true,
		"delay": 15 * 1000,
		"interval": 15 * 1000,
	});
	
	// Activate all possible triggers
	let data = { "enabled": true };
	cmpTrigger.RegisterTrigger("OnOwnershipChanged", "OwnershipChangedAction", data);
	
	/*cmpTrigger.DoAfterDelay(300 * 1000,"SpawnAlliedInvasionAttack",null);*/
	
	
	
};
