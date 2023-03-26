warn("loading the triggers file");

///////////////////////
// Trigger listeners //
///////////////////////


var unitTargetClass = "Unit+!Ship";
var siegeTargetClass = "Structure";


var triggerPointNorth = "B";
var triggerPointSouth = "A";
var triggerPointScythianCavalry = "K";
var triggerPointScythianCavalryDock = "J";
var triggerPointAch = "J";



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



Trigger.prototype.WalkAndFightRandomTarget = function(attacker,target_player,target_class, backup_class)
{
	let targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(target_player), target_class).filter(TriggerHelper.IsInWorld);
	
	if (targets.length == 0)
	{
		targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(target_player), backup_class).filter(TriggerHelper.IsInWorld);
	}
	
	
	if (targets.length == 0)
	{
		return;
	}
	
	let target = pickRandom(targets);
	
	
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
		warn("[ERROR] Could not find random target to fight: "+attacker+" and "+target_player+" and "+target_class);
	}
	
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


Trigger.prototype.ResearchQueuedAction = function(data)
{
	//warn("The OnResearchQueued event happened with the following data:");
	//warn(uneval(data));
};



Trigger.prototype.MessageScythianAttack = function(data)
{
	this.ShowText("The Scythians have arrived! Your orders are to secure our camp outside the city walls. Do not let the camp be destroyed! We have sent a dispatch to our main fleet of ships to provide evacuation, we just need to hold out until they arrive!","I am ready!","Oh boy..");
}

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
	
		
	
	
	if (data.from == 0 && data.to == 1) //captured gaia object
	{
		//if temple
		let id = Engine.QueryInterface(data.entity, IID_Identity);
		if (id)
		{
			if (id.classesList.indexOf("Temple") >= 0)
			{
				if (this.templeCaptured == false)
				{
					
					let cmpModifiersManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_ModifiersManager);

					
					this.templeCaptured = true;
					
					//increase healer probability
					this.healerProb = this.healerProb * 3;
					
					//add heal tech to p1 and p3
					for (let p of [1,3])
					{
						let cmpPlayer = QueryPlayerIDInterface(p);
						let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
						
						cmpTechnologyManager.ResearchTechnology("heal_rate");
						cmpTechnologyManager.ResearchTechnology("heal_rate_2");
						cmpTechnologyManager.ResearchTechnology("heal_range");
						cmpTechnologyManager.ResearchTechnology("heal_range_2");
						
						cmpModifiersManager.AddModifiers("Healer Rate Bonus", {
							"Heal/Interval": [{ "affects": ["Healer"], "multiply": 0.6}],
						}, cmpPlayer.entity);
						
						cmpModifiersManager.AddModifiers("Healer Range Bonus", {
							"Heal/Range": [{ "affects": ["Healer"], "multiply": 1.5}],
						}, cmpPlayer.entity);
						
						cmpModifiersManager.AddModifiers("Healer Vision Bonus", {
							"Vision/Range": [{ "affects": ["Healer"], "multiply": 1.5}],
						}, cmpPlayer.entity);
					}
					
					this.ShowText("Great job! We have secured medical supplies from this temple, our healers will now be more efficient!","Glad to help!","Oh boy..");
					
				}
			}
			else if (id.classesList.indexOf("Trade") >= 0 && id.classesList.indexOf("Dock") < 0)
			{ 
				if (this.marketCaptured == false)
				{
					this.marketCaptured = true;
					
					//spawn some traders
					let p = 1;
										
					let cmpPlayer = QueryPlayerIDInterface(p);
					let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
					
					if (p == 1)
					{
						let cmpModifiersManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_ModifiersManager);
					
						
						cmpModifiersManager.AddModifiers("New Route Bonus", {
							"Trader/GainMultiplier": [{ "affects": ["Trader"], "multiply": 1.5}],
						}, cmpPlayer.entity);
						
						this.ShowText("Excellent find! The market contained information about unknown trade routes, we will now be able to generate more supplies for the army!","Glad to help!","Oh boy..");
					
					}
				}
			}
			else if (id.classesList.indexOf("Dock") >= 0)
			{ 
				this.numDocksCaptured ++;
				
				if (this.numDocksCaptured == 1)
				{
					//we get some fishing ships
					TriggerHelper.SpawnUnits(data.entity,"units/mace/ship_fishing",5,1);
					
					//we ge some traders
					
					let trader = TriggerHelper.SpawnUnits(data.entity,"units/athen/support_trader",5,1);
					
					this.ShowText("Nice find! We can now generate more income by using this dock as a trading base! We also found some caravans...now only if we can locate a market for them to trade with!","Glad to help!","Oh boy..");
				
				}
				else if (this.numDocksCaptured == 2)
				{
					//we get some trade ships
					TriggerHelper.SpawnUnits(data.entity,"units/mace/ship_merchant",3,1);
					
					this.ShowText("Nice find! We can now generate more income by using this dock as a trading base! We also found a few trade ships!","Glad to help!","Oh boy..");
				}
				
				/*if (this.marketCaptured == false)
				{
					this.marketCaptured = true;
					
					//spawn some traders
					let p = 1;
					let trader = TriggerHelper.SpawnUnits(data.entity,"units/athen_support_trader",4,p);
				}*/
			}
			else if (id.classesList.indexOf("DefenseTower") >= 0 || id.classesList.indexOf("Fortress") >= 0 )
			{ 
				
				
				//warn("Tower captured and destroyed");
			}
			else if (id.classesList.indexOf("Arsenal") >= 0)
			{ 
				//spawn siege equipment
				let p = 1;
				let siege = TriggerHelper.SpawnUnits(data.entity,"units/mace/siege_lithobolos_packed",4,p);
				
				this.ShowText("This abandoned workshop was beyond repair -- but we did find a few catapults that the barbarians must have captured some time ago.","Glad to help!","Oh boy..");
				
				//warn("Workshop captured and destroyed");
			}
			
			if (id.classesList.indexOf("Dock") < 0)
			{ 
				//destroy the structure				
				let health_s = Engine.QueryInterface(data.entity, IID_Health);
				health_s.Kill();
			}
		}
		
	}
	else if (data.from == 4 && (data.to == 1 || data.to == -1)) //captured camp or destroyed
	{
		
		//warn("Scythians lost sommething");
		
		//if temple
		let id = Engine.QueryInterface(data.entity, IID_Identity);
		if (id)
		{
			if (id.classesList.indexOf("MercenaryCamp") >= 0)
			{
				if (this.campCaptured == false)
				{
					//our default gains improve
					let increment_factor = 1.25;
					let bonus = 200;

					this.pointFood += bonus;
					this.pointFoodIncrement *= increment_factor;
					this.pointWood += bonus;
					this.pointWoodIncrement *= increment_factor;
					this.pointStone += bonus;
					this.pointStoneIncrement *= increment_factor;
					this.pointMetal += bonus;
					this.pointMetalIncrement *= increment_factor;
					
					//give small bonus to enemy
					this.maxPatrolNumber += 100;
					this.patrolSizeDefault += 6;
					
					//warn("Camp captured! increments: "+uneval(this.pointFoodIncrement));
					
					this.ShowText("Excellent work! The camp conttained maps of the area that will enable our army to gather more resources!","Glad to help!","Oh boy..");
					
					this.campCaptured = true;
				}
			}
		}
	}
	else if (this.scythianAttackTriggered == false)
	{
		if (data.from == 2 && (data.to == 1 || data.to == -1 || data.to == 3))
		{
			let id = Engine.QueryInterface(data.entity, IID_Identity);
			if (id)
			{
				if (id.classesList.indexOf("Structure") >= 0)
				{
					this.numBuildingsDestroyed ++;
					
					//warn("Num buildings destroyed = "+uneval(this.numBuildingsDestroyed));
					
					if (this.numBuildingsDestroyed >= this.buildingsDestroyedThreshold )
					{
						this.scythianAttackTriggered = true;
						
						//increase max repairmen and max cavalry for pl 2
						this.maxRepairmen = this.maxRepairmen * 2;
						this.cavLimit = this.cavLimit * 2;
						
						//patrols spawn faster now and with more people
						this.patrolSpawnTime = 4;
						this.patrolSizeDefault += 8;
						
						//give some tech to players 2 and 6, the olbians
						for (let p of [2,6])
						{
						
							let cmpPlayer = QueryPlayerIDInterface(p);
							let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
							
							/*cmpTechnologyManager.ResearchTechnology("attack_soldiers_will");
							cmpTechnologyManager.ResearchTechnology("attack_infantry_ranged_01");
							cmpTechnologyManager.ResearchTechnology("attack_infantry_ranged_02");
							cmpTechnologyManager.ResearchTechnology("armor_infantry_01");
							cmpTechnologyManager.ResearchTechnology("armor_infantry_02");
							cmpTechnologyManager.ResearchTechnology("attack_infantry_melee_01");
							cmpTechnologyManager.ResearchTechnology("attack_infantry_melee_02");*/
						}
						
						//start slave army -- the Olbians free the slaves
						warn("slave attack!");
						this.DoAfterDelay(5 * 1000,"SpawnSlaveAttack",null);
	
						//make sure gate opens
						let slave_pl = QueryPlayerIDInterface(6);
						slave_pl.SetAlly(2);
	
	
						//start scythian waves
						//warn("Starting cavalry waves in 2 minutes");
						this.DoAfterDelay(120 * 1000,"SpawnCavalryWave",null);
						this.DoAfterDelay(110 * 1000,"MessageScythianAttack",null);
					
					
						//start scythian attack on our extra docks
						this.DoAfterDelay(180 * 1000,"SpawnCavalryDockAttack",null);
					
						this.ShowText("Word has arrived that the Olbians have freed and armed their slaves! They must be desperate! Fight on!\n\nHowever, we also have bad news: the Scythian cavalry is getting closer and closer -- we must secure the city before they arrive!","Glad to help!","Oh boy..");
					
						//schedule victory message -- need to survive 13 minutes of cavalry attacks
						this.DoAfterDelay(780 * 1000,"VictoryAchieved",null);
						
						//this.DoAfterDelay(10 * 1000,"VictoryAchieved",null);
					}
				}
			}
		}
	}
	else if (this.scythianAttackTriggered == true)
	{
		if (data.from == 2 && (data.to == 1 || data.to == -1 || data.to == 3))
		{
			let id = Engine.QueryInterface(data.entity, IID_Identity);
			if (id)
			{
				if (id.classesList.indexOf("Structure") >= 0)
				{
					this.numBuildingsDestroyed ++;
					this.patrolSizeDefault += 2;
					//warn("default patrol size is now "+this.patrolSizeDefault);
				}
				
			}
			
		}
	}
	
	
	//olbian slaves cannot capture buildings or siege
	if ((data.to == 6 || data.to == 4) && data.from == 3)
	{
		//destroy the structure				
		let health_s = Engine.QueryInterface(data.entity, IID_Health);
		health_s.Kill();
	}
	
};

Trigger.prototype.PlayerCommandAction = function(data)
{
	//warn("The OnPlayerCommand event happened with the following data:");
	//warn(uneval(data));
	
	if (data.cmd.type == "tribute")
	{
		if (data.player ==1 && data.cmd.player == 3)
		{
			//warn(uneval(data.cmd.amounts));
			
			let resource = "";
			let amount = 0;
			if (data.cmd.amounts.food)
			{
				amount = data.cmd.amounts.food;
				resource = "food";
				this.pointFood += amount;
			}
			if (data.cmd.amounts.wood)
			{
				amount = data.cmd.amounts.wood;
				resource = "wood";
				this.pointWood += amount;
			}
			if (data.cmd.amounts.stone)
			{
				amount = data.cmd.amounts.stone;
				resource = "stone";
				this.pointStone += amount;
			}
			if (data.cmd.amounts.metal)
			{
				amount = data.cmd.amounts.metal;
				resource = "metal";
				this.pointMetal += amount;
			}
			
			//warn("tributing "+amount+" "+resource);
			
			let cmpPlayer = QueryPlayerIDInterface(3);
			cmpPlayer.AddResource(resource,-1*amount);
			
		}
		
		
	}
};




//garison AI entities with archers
Trigger.prototype.GarrisonEntities = function(data)
{
	
	for (let p of [0,2,3,4,5,6])
	{
		let towers_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "StoneTower").filter(TriggerHelper.IsInWorld);
		
		for (let e of towers_p)
		{
			let g_size = 5;
			if (p == 0)
				g_size = 2;
			
			
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(e, "units/athen/champion_ranged",g_size,p);
			
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
			let archers_e = TriggerHelper.SpawnUnits(e, "units/athen/champion_ranged",3,p);
			
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(e,true);
			}
		}
		
		//outpost tower
		let towers_o = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Outpost").filter(TriggerHelper.IsInWorld);
		
		for (let e of towers_o)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(e, "units/athen/champion_ranged",1,p);
			
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.OccupyTurret(e,true,true);
			}
		}
		
		//FORTRESS
		let forts_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Fortress").filter(TriggerHelper.IsInWorld);
		let fort_size = 20;
	
		for (let e of forts_p)
		{
			//spawn the garrison inside the tower
			
			if (p == 0)
			{
				let archers_e = TriggerHelper.SpawnUnits(e, "units/gaul/champion_fanatic",fort_size,p);
				
				for (let a of archers_e)
				{
					let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
					cmpUnitAI.Garrison(e,true);
				}
			}
			else {
				let archers_e = TriggerHelper.SpawnUnits(e, "units/athen/champion_ranged",fort_size,p);
				
				for (let a of archers_e)
				{
					let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
					cmpUnitAI.Garrison(e,true);
				}
			}
		}
		
		//wall towers
		/*if (p == 2)
		{
			let towers_w = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Defensive+Tower+!Outpost+!StoneTower").filter(TriggerHelper.IsInWorld);
			for (let e of towers_w)
			{
				//spawn the garrison inside the tower
				let archers_e = TriggerHelper.SpawnUnits(e, "units/athen/champion_ranged",2,p);
					
				for (let a of archers_e)
				{
					let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
					//cmpUnitAI.Garrison(e,true);
					cmpUnitAI.OccupyTurret(e,true,true);
				}
			}
		}*/
		
		let camps_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"MercenaryCamp").filter(TriggerHelper.IsInWorld);
			
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
	}
}	


Trigger.prototype.IdleUnitCheck = function(data)
{
	//warn("Idle unit check");
	
	for (let p of [2,4,6])
	{
		let target_p = 3;
			
		//find any idle soldiers
		let units_inf = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Infantry").filter(TriggerHelper.IsInWorld);
		let units_cav = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Cavalry").filter(TriggerHelper.IsInWorld);
		let units_siege = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Siege").filter(TriggerHelper.IsInWorld);
		
		let units_all = units_inf.concat(units_cav,units_siege);
		
		if (units_all.length > 0)
		{
			//warn("Found idle units.");
			
			let targets_A = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "CivilCentre").filter(TriggerHelper.IsInWorld);
			
			let targets_B = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "SentryTower").filter(TriggerHelper.IsInWorld);
			
			if (this.scythianAttackTriggered == true || targets_A.length == 0 || targets_B.length == 0 || p == 4 || p == 6)
			{
				//warn("Sending all units to attack");

				//attack
				for (let u of units_all)
				{
					//make it patrol
					
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
			else {
				//warn("Sending all units to patrol");
				//patrol
				for (let u of units_all)
				{
					let units_i = [u];
					this.PatrolOrder(units_i,p,pickRandom(targets_A),pickRandom(targets_B));
				}
			}
		}
	}
	
	for (let p of [3])
	{
		let target_p = 2;
			
		//find any idle soldiers
		let units_inf = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Infantry").filter(TriggerHelper.IsInWorld);
		let units_cav = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Cavalry").filter(TriggerHelper.IsInWorld);
		let units_siege = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Siege").filter(TriggerHelper.IsInWorld);
		
		let units_all = units_inf.concat(units_cav,units_siege);
		
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
Trigger.prototype.SpawnPatrolInterval = function(data)
{
	//warn("Repeat patrol call.");

	let interval_secs = this.patrolSpawnTime;

	//check if we need to spawn
	let units = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(2), "Unit").filter(TriggerHelper.IsInWorld);
	
	//warn("PL 2 has "+uneval(units.length) +" units.");
	
	
	
	if (units.length < this.maxPatrolNumber)
	{
		//decide if we want to spend points -- 100 points per extra soldier
		let unit_point_cost = 100;
		let num_extra = 1+Math.round(8.0*(Math.random()));
		
		if (this.enemyPoints > num_extra * unit_point_cost)
		{
			this.enemyPoints = this.enemyPoints - num_extra * unit_point_cost;
			
			
			this.patrolSize = this.patrolSizeDefault + num_extra + (this.numDocksCaptured*2);
			//warn("Adding "+uneval(this.patrolSize)+" soldiers to patrol to current force of "+units.length);
		}
		else
		{
			this.patrolSize = this.patrolSizeDefault;
		}
		
		
		this.SpawnPatrol();
	}
	
	
	
	this.DoAfterDelay(interval_secs * 1000,"SpawnPatrolInterval",null);
	
}


//garison AI entities with archers
Trigger.prototype.SpawnRepairCrew = function(data)
{
	let p = 2;
	
	//check if any building has low health
	let damaged_buildings = [];
	
	let structs = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Structure").filter(TriggerHelper.IsInWorld);
	
	for (let s of structs)
	{
		let health_s = Engine.QueryInterface(s, IID_Health);
		
		if (health_s.GetMaxHitpoints() - health_s.GetHitpoints() > 5)
		{
			damaged_buildings.push(s);
		}
	}
	
	if (damaged_buildings.length > 0)
	{
		//to do: check how many repairmen we already have
		let current_citizens = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Citizen").filter(TriggerHelper.IsInWorld);
		
		//warn("Found "+uneval(current_citizens.length)+" citizens");
		
		if (current_citizens.length < this.maxRepairmen)
		{
			let sites = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "CivilCentre").filter(TriggerHelper.IsInWorld);
		
			let site_j = pickRandom(sites);
			
			if (site_j){	
				let repair_crew = TriggerHelper.SpawnUnits(site_j,pickRandom(this.repairTemplates),5,p);
				
				//warn("Sending repair men");
				
				for (let b of damaged_buildings)
				{
					ProcessCommand(p, {
						"type": "repair",
						"entities": repair_crew,
						"target": b,
						"queued": true,
						"allowCapture": false
					});
				}
			}
		}
	}
	
	this.DoAfterDelay(90 * 1000,"SpawnRepairCrew",null);

}


Trigger.prototype.SpawnCavalryDockAttack = function(data)
{
	let p = 4; //scythians
	let target_player = 1; 
	
	let docks = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(target_player), "Dock").filter(TriggerHelper.IsInWorld);
	
	if (docks.length > 2)
	{
		let site = pickRandom(this.GetTriggerPoints(triggerPointScythianCavalryDock));

		let wave_size = 20;
		let attackers = [];
		
		for (let i = 0; i < wave_size; i++)
		{
			
			let unit_i = TriggerHelper.SpawnUnits(site,pickRandom(this.scythianCavTemplates),1,p);
			attackers.push(unit_i[0]);
			
			}
		
		//send attacking
		//set formation
		TriggerHelper.SetUnitFormation(p, attackers, pickRandom(unitFormations));

		//find target
		let target = this.FindClosestTarget(attackers[0],target_player,"Dock");
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
	
	this.DoAfterDelay(this.scythianWaveInterval * 1000,"SpawnCavalryDockAttack",null);
}

Trigger.prototype.SpawnCavalryWave = function(data)
{
	let p = 4; //scythians
	
	//check how many units -- this excludes garrisoned units
	let units = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Unit").filter(TriggerHelper.IsInWorld);
	
	
	
	if (units.length < this.scythianPopCap)
	{
		//get site
		let site_i = pickRandom(this.GetTriggerPoints(triggerPointScythianCavalry));

		let wave_size = this.scythianWaveSize;
		let attackers = [];
		
		for (let i = 0; i < wave_size; i++)
		{
			
			let unit_i = TriggerHelper.SpawnUnits(site_i,pickRandom(this.scythianCavTemplates),1,p);
			attackers.push(unit_i[0]);
			
			//this.WalkAndFightClosestTarget(unit_i[0],3,unitTargetClass);
		}
		
		//send attacking
		//set formation
		TriggerHelper.SetUnitFormation(p, attackers, pickRandom(unitFormations));

		//find target
		let target = this.FindClosestTarget(attackers[0],3,unitTargetClass);
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
	
	this.DoAfterDelay(this.scythianWaveInterval * 1000,"SpawnCavalryWave",null);
	
}

//garison AI entities with archers
Trigger.prototype.SpawnPatrol = function(data)
{
	//which player
	let p = 2; 
	
	//check how many units -- this excludes garrisoned units
	let units = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Unit").filter(TriggerHelper.IsInWorld);
	
	//warn("PL 2 has "+uneval(units.length) +" units.");
	
	if (units.length < this.maxPatrolNumber)
	{
		//targets A
		let targets_A = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "CivilCentre").filter(TriggerHelper.IsInWorld);
		targets_A = targets_A.concat(TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Temple").filter(TriggerHelper.IsInWorld));
		
		let targets_B = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "DefenseTower").filter(TriggerHelper.IsInWorld);
		targets_B = targets_B.concat(TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Gate").filter(TriggerHelper.IsInWorld));
		targets_B = targets_B.concat(TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Fortress").filter(TriggerHelper.IsInWorld));
		targets_B = targets_B.concat(TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Outpost").filter(TriggerHelper.IsInWorld));
		targets_B = targets_B.concat(TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Farmstead").filter(TriggerHelper.IsInWorld));
		
		if (targets_A.length == 0 || targets_B.length == 0)
			return;
			
		let site_j = pickRandom(targets_B);	
		let patrol_j = [];
		
		//melee
		for (let i = 0; i < this.patrolSize; i++)
		{
			let unit_i = TriggerHelper.SpawnUnits(site_j,pickRandom(this.patrolTemplates),1,p);
			patrol_j.push(unit_i[0]);
		}
		
		//set formation
		//TriggerHelper.SetUnitFormation(p, patrol_j, pickRandom(unitFormations));

		//send to patrol or attack
		if (this.scythianAttackTriggered == false)
		{
			this.PatrolOrder(patrol_j,p,pickRandom(targets_A),site_j);
		}
		else {
			//attack
			let target = this.FindClosestTarget(patrol_j[0],3,unitTargetClass);
			let target_pos = TriggerHelper.GetEntityPosition2D(target);
			
			ProcessCommand(p, {
				"type": "attack-walk",
				"entities": patrol_j,
				"x": target_pos.x,
				"z": target_pos.y,
				"queued": true,
				"targetClasses": {
					"attack": unitTargetClass
				},
				"allowCapture": false
			});
		}
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
			let units_i = TriggerHelper.SpawnUnits(spawn_site,"units/mace/siege_lithobolos_packed",1,p);
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
			let units_i = TriggerHelper.SpawnUnits(spawn_site,"units/athen/siege_oxybeles_packed",1,p);
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




Trigger.prototype.SpawnOlbianTrader = function(data)
{
	let e = 2;
	
	//make list of own markets
	let docks = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(e), "Trade+!Dock").filter(TriggerHelper.IsInWorld);
		
	if (docks.length > 0)
	{
		
		//make list of traders
		let traders_e = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(e), "Trader+!Ship").filter(TriggerHelper.IsInWorld);
		
		
		if (traders_e.length < this.maxTraders)
		{
			//make list of others markets
			//make list of others' docks
			let markets_others = [];
			let trading_partners = [5];
			for (let p of trading_partners)
			{
				
				let markets_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Trade+!Dock").filter(TriggerHelper.IsInWorld);
					
				markets_others = markets_others.concat(markets_p);
			}
		
				
			if (markets_others.length > 0){
				

				let site = pickRandom(docks);
					
			//	warn("Spawning trader for olbia");
				let trader = TriggerHelper.SpawnUnits(site,"units/athen/support_trader",1,e);
					
				let cmpUnitAI = Engine.QueryInterface(trader[0], IID_UnitAI);
				
				cmpUnitAI.UpdateWorkOrders("Trade");
				cmpUnitAI.SetupTradeRoute(pickRandom(markets_others),site,null,true);
				
			}
			
		}
	}
	
	this.DoAfterDelay(45 * 1000, "SpawnOlbianTrader",null);
}

Trigger.prototype.SpawnNeutralTrader = function(data)
{
	let e = 5;
	
	//make list of own docks
	let docks = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(e), "Trade").filter(TriggerHelper.IsInWorld);
		
	
		
	if (docks.length > 0)
	{
		
		//make list of traders
		/*let traders_e = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(e), "Trader+!Ship").filter(TriggerHelper.IsInWorld);*/
		
		
		if (true)
		{
			//make list of others markets
			//make list of others' docks
			let markets_others = [];
			let trading_partners = [2];
			for (let p of trading_partners)
			{
				
				let markets_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Market+!Dock").filter(TriggerHelper.IsInWorld);
					
				markets_others = markets_others.concat(markets_p);
			}
		
				
			if (markets_others.length > 0){
				

				let site = pickRandom(docks);
					
				//warn("Spawning trader for crete");
				let trader = TriggerHelper.SpawnUnits(site,"units/athen/support_trader",1,e);
					
				let cmpUnitAI = Engine.QueryInterface(trader[0], IID_UnitAI);
				
				cmpUnitAI.UpdateWorkOrders("Trade");
				cmpUnitAI.SetupTradeRoute(pickRandom(markets_others),site,null,true);
				
			}
			
		}
	}
	
	//this.DoAfterDelay(45 * 1000, "SpawnCretanTraders",null);
}



Trigger.prototype.SpawnTradeShip = function(data)
{
	let e = 1; //cretans
	
	//make list of own docks
	let docks = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(e), "Dock").filter(TriggerHelper.IsInWorld);
		
	
		
	if (docks.length > 0)
	{
		
		//make list of traders
		/*let traders_e = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(e), "Trader+!Ship").filter(TriggerHelper.IsInWorld);*/
		
		
		if (true)
		{
			
			let site = pickRandom(docks);
					
			//warn("Spawning trader for crete");
			let trader = TriggerHelper.SpawnUnits(site,"units/mace/ship_merchant",1,e);
			
		}
	}
	
	//this.DoAfterDelay(45 * 1000, "SpawnCretanTraders",null);
}

Trigger.prototype.SpawnScyhianTrader = function(data)
{
	let e = 4; //cretans
	
	//make list of own docks
	let docks = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(e), "Dock").filter(TriggerHelper.IsInWorld);
		
	
		
	if (docks.length > 0)
	{
		
		//make list of traders
		/*let traders_e = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(e), "Trader+!Ship").filter(TriggerHelper.IsInWorld);*/
		
		
		if (true)
		{
			//make list of others markets
			//make list of others' docks
			let markets_others = [];
			let trading_partners = [2];
			for (let p of trading_partners)
			{
				
				let markets_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Dock").filter(TriggerHelper.IsInWorld);
					
				markets_others = markets_others.concat(markets_p);
			}
		
				
			if (markets_others.length > 0){
				

				let site = pickRandom(docks);
					
				//warn("Spawning trader for crete");
				let trader = TriggerHelper.SpawnUnits(site,"units/gaul/ship_merchant",1,e);
					
				let cmpUnitAI = Engine.QueryInterface(trader[0], IID_UnitAI);
				
				cmpUnitAI.UpdateWorkOrders("Trade");
				cmpUnitAI.SetupTradeRoute(pickRandom(markets_others),site,null,true);
				
			}
			
		}
	}
	
	//this.DoAfterDelay(45 * 1000, "SpawnCretanTraders",null);
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


Trigger.prototype.VictoryTextFn = function(n)
{
	return markForPluralTranslation(
          "%(lastPlayer)s has won (game mode).",
         "%(players)s and %(lastPlayer)s have won (game mode).",
          n);
}

Trigger.prototype.VictoryAchieved = function(data)
{
	//check to make sure player 3 has at least 1 structure left
	let structures = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(3), "Structure").filter(TriggerHelper.IsInWorld);
		
	if (structures.length > 0)
	{
		this.ShowText("Our evacuation team is here! We're safe! You have been victorious! Unfortunately, Zopyrion did not make it -- he was cut to pieces as he was fleeing the Scythians.","Great! Get me out of here!","I will just hang out here for a bit more...");

		TriggerHelper.SetPlayerWon(1,this.VictoryTextFn,this.VictoryTextFn);	
	}
	else {
		TriggerHelper.SetPlayerWon(2,this.VictoryTextFn,this.VictoryTextFn);
	}
}

Trigger.prototype.ResearchStartingTradeTech = function(data)
{
	
	
	let cmpModifiersManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_ModifiersManager);

	for (let p of [1,2,4,5])
	{
	
		let cmpPlayer = QueryPlayerIDInterface(p);
		let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
		
		if (p == 1)
		{
			//improve trade
			cmpTechnologyManager.ResearchTechnology("trade_gain_01");
			cmpTechnologyManager.ResearchTechnology("trade_gain_02");
			cmpTechnologyManager.ResearchTechnology("trader_health");
			cmpTechnologyManager.ResearchTechnology("trade_commercial_treaty");
			cmpTechnologyManager.ResearchTechnology("ship_movement_speed");
			
			cmpTechnologyManager.ResearchTechnology("infantry_cost_time");
			
			//trireme can train units
			cmpTechnologyManager.ResearchTechnology("iphicratean_reforms");
			
			//champions train faster
			cmpTechnologyManager.ResearchTechnology("parade_of_daphne");
			
			//siege bonus
			cmpTechnologyManager.ResearchTechnology("siege_attack");
			cmpTechnologyManager.ResearchTechnology("siege_health");
			cmpTechnologyManager.ResearchTechnology("siege_pack_unpack");
			
			//cmpTechnologyManager.ResearchTechnology("romans/vision_sibylline");
			
			cmpModifiersManager.AddModifiers("Trade Bonus", {
				"Trader/GainMultiplier": [{ "affects": ["Trader"], "multiply": 2.0}],
			}, cmpPlayer.entity);
			
			
		}
		else if (p == 2)
		{
			/*cmpTechnologyManager.ResearchTechnology("trade_gain_01");
			cmpTechnologyManager.ResearchTechnology("trade_gain_02");
			cmpTechnologyManager.ResearchTechnology("trade_gain_01");
			cmpTechnologyManager.ResearchTechnology("trade_gain_01");
			cmpTechnologyManager.ResearchTechnology("trade_gain_01");
			cmpTechnologyManager.ResearchTechnology("trade_gain_01");*/
			
			cmpModifiersManager.AddModifiers("AI Bonus", {
				"Trader/GainMultiplier": [{ "affects": ["Trader"], "multiply": 2.4}],
			}, cmpPlayer.entity);
			
			
			cmpTechnologyManager.ResearchTechnology("hellenistic_metropolis");
		}
		else if (p == 4)
		{
			/*cmpTechnologyManager.ResearchTechnology("trade_gain_01");
			cmpTechnologyManager.ResearchTechnology("trade_gain_01");
			cmpTechnologyManager.ResearchTechnology("trade_gain_01");*/
			//warn("!");
			cmpModifiersManager.AddModifiers("Scythian Trade Bonus Bonus", {
				"Trader/GainMultiplier": [{ "affects": ["Trader"], "multiply": 4.0}],
			}, cmpPlayer.entity);
			
			//get cavalry tech too
			cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_01");
			cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_02");
			cmpTechnologyManager.ResearchTechnology("soldier_resistance_pierce_01");
			cmpTechnologyManager.ResearchTechnology("soldier_resistance_pierce_02");
			
			cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_01");
			cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_02");
			cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_01");
			cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_02");
			
			cmpTechnologyManager.ResearchTechnology("cavalry_movement_speed");
			cmpTechnologyManager.ResearchTechnology("cavalry_health");
			
			
			cmpTechnologyManager.ResearchTechnology("attack_soldiers_will");

			//cmpTechnologyManager.ResearchTechnology("armor_cav_02");
			//cmpTechnologyManager.ResearchTechnology("armor_cav_02");
			/*cmpTechnologyManager.ResearchTechnology("attack_cavalry_melee_01");
			cmpTechnologyManager.ResearchTechnology("attack_cavalry_melee_02");
			cmpTechnologyManager.ResearchTechnology("attack_cavalry_melee_02");
			cmpTechnologyManager.ResearchTechnology("attack_cavalry_ranged_01");
			cmpTechnologyManager.ResearchTechnology("attack_cavalry_ranged_02");
			cmpTechnologyManager.ResearchTechnology("attack_cavalry_ranged_02");*/
		//	cmpTechnologyManager.ResearchTechnology("speed_cavalry_01");
		//	cmpTechnologyManager.ResearchTechnology("speed_cavalry_02");
		//	cmpTechnologyManager.ResearchTechnology("successors/special_war_horses");
			
			
		

			
		}
		else if (p == 5)
		{
			cmpTechnologyManager.ResearchTechnology("trade_gain_01");
			cmpTechnologyManager.ResearchTechnology("trade_gain_02");
		}
			
	
	}
	//cmpTechnologyManager.ResearchTechnology("trade_gain_02");
	//cmpTechnologyManager.ResearchTechnology("trade_gain_02");
	//cmpTechnologyManager.ResearchTechnology("trade_gain_02");
	
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

Trigger.prototype.SpawnCavalrySiegeAttack = function(data)
{
	//see how many siege units player 3 has
	let siege_units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(3), "Siege").filter(TriggerHelper.IsInWorld);
	
	let p = 2;
	let target_player = 3;
	
	if (siege_units.length >= 4)
	{
		let cav_units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(2), "Cavalry").filter(TriggerHelper.IsInWorld);
	
		if (cav_units.length < this.cavLimit)
		{
			
			//site
			let site_j = pickRandom(this.GetTriggerPoints("A"));
			
			//spawn and give orders
			for (let i = 0; i < this.cavSquadSize; i++)
			{
				let units_i = TriggerHelper.SpawnUnits(site_j,pickRandom(this.cavTemplates),1,p);
				
				//make it fight
				this.WalkAndFightClosestTarget(units_i[0],target_player,"Siege");
			}
		}
	}
	
	this.DoAfterDelay(this.cavAttackInterval * 1000,"CavalrySiegeAttack",null);
	
}



Trigger.prototype.SetDiplomacy = function(data)
{
	let cmpPlayer = QueryPlayerIDInterface(1);
	cmpPlayer.SetNeutral(5);
	
	cmpPlayer = QueryPlayerIDInterface(2);
	cmpPlayer.SetNeutral(5);

	cmpPlayer = QueryPlayerIDInterface(6);
	cmpPlayer.SetNeutral(5);
	cmpPlayer.SetNeutral(2);
	
	cmpPlayer = QueryPlayerIDInterface(3);
	cmpPlayer.SetNeutral(5);
	
	cmpPlayer = QueryPlayerIDInterface(4);
	cmpPlayer.SetAlly(5);
	cmpPlayer.SetAlly(2);
	
	cmpPlayer = QueryPlayerIDInterface(5);
	cmpPlayer.SetNeutral(1);
	cmpPlayer.SetAlly(2);
	cmpPlayer.SetNeutral(3);
	cmpPlayer.SetNeutral(4);
	cmpPlayer.SetNeutral(6);

}


Trigger.prototype.PointIncrementEnemy = function(data)
{
	for (let p of [2,4,5])
	{
		//check traders
		let traders = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Trader").filter(TriggerHelper.IsInWorld);
	
		//get their cargo
		let cargo_food = 0;
		let cargo_wood = 0;
		let cargo_stone = 0;
		let cargo_metal = 0;
		for (let t of traders)
		{
			// get target position
			var trader_i = Engine.QueryInterface(t, IID_Trader);
			
			//get goods
			var goods_i = trader_i.GetGoods();
			
			if (goods_i.amount)
			{
				if (goods_i.type == "food")
				{
					cargo_food = cargo_food + goods_i.amount.traderGain;
				}
				else if (goods_i.type == "wood")
				{
					cargo_wood = cargo_wood + goods_i.amount.traderGain;
				}
				else if (goods_i.type == "stone")
				{
					cargo_stone = cargo_stone + goods_i.amount.traderGain;
				}
				else if (goods_i.type == "metal")
				{
					cargo_metal = cargo_metal + goods_i.amount.traderGain;
				}
			}
		}
		
		this.enemyPoints = this.enemyPoints + cargo_food + cargo_wood + cargo_stone + cargo_metal;
		
		if (this.numDocksCaptured >= 2)
		{
			this.enemyPoints += 300;
		}
		
	}
	
	//warn("Enemy points: "+uneval(this.enemyPoints));
	
	this.DoAfterDelay(30 * 1000,"PointIncrementEnemy",null);
	
}


Trigger.prototype.ResearchFinishedAction = function(data)
{
	//warn("The OnResearchFinished event happened with the following data:");
	//warn(uneval(data));
	
	if (data.player == 1)
	{
		if (data.tech != "phase_town_generic" && data.tech != "phase_city_generic")
		{
			let cmpPlayer = QueryPlayerIDInterface(3);
			let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
			cmpTechnologyManager.ResearchTechnology(data.tech);
			
			//warn("Researching tech for ally");
		}
		
	}
};


Trigger.prototype.SpawnSlaveAttack = function(data)
{
	let p = 6;
	
	let attack_size = 16+Math.round(12*Math.random());
	
	//site
	let sites = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(2), "CivilCentre").filter(TriggerHelper.IsInWorld);
	let site = pickRandom(sites);
	
	//units
	let attackers = [];
	
	for (let i = 0; i < attack_size; i ++)
	{
		let unit_i = TriggerHelper.SpawnUnits(site,pickRandom(this.slaveTemplates),1,p);
		attackers.push(unit_i[0]);
	}
	
	//attack nearest
	//set formation
	TriggerHelper.SetUnitFormation(p, attackers, pickRandom(unitFormations));

	//find target
	let target = this.FindClosestTarget(attackers[0],3,unitTargetClass);
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
	
	//repeat
	this.DoAfterDelay(10 * 1000,"SpawnSlaveAttack",null);
	
}

Trigger.prototype.PointIncrement = function(data)
{
	//check traders
	let traders = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "Trader").filter(TriggerHelper.IsInWorld);
	
	//warn("Found "+uneval(traders.length)+" traders");
	
	//get their cargo
	let cargo_food = 0;
	let cargo_wood = 0;
	let cargo_stone = 0;
	let cargo_metal = 0;
	for (let t of traders)
	{
		// get target position
		var trader_i = Engine.QueryInterface(t, IID_Trader);
		
		//get goods
		var goods_i = trader_i.GetGoods();
		
		if (goods_i.amount)
		{
			if (goods_i.type == "food")
			{
				cargo_food = cargo_food + goods_i.amount.traderGain;
			}
			else if (goods_i.type == "wood")
			{
				cargo_wood = cargo_wood + goods_i.amount.traderGain;
			}
			else if (goods_i.type == "stone")
			{
				cargo_stone = cargo_stone + goods_i.amount.traderGain;
			}
			else if (goods_i.type == "metal")
			{
				cargo_metal = cargo_metal + goods_i.amount.traderGain;
			}
		}
		
		//warn("Goods: "+uneval(goods_i));
	}
	
	//warn("Current goods in traders: " + uneval(cargo_food)+" "+ uneval(cargo_wood)+" "+ uneval(cargo_stone)+" "+ uneval(cargo_metal));

	cargo_food = Math.sqrt(cargo_food);
	cargo_wood = Math.sqrt(cargo_wood);
	cargo_stone = Math.sqrt(cargo_stone);
	cargo_metal = Math.sqrt(cargo_metal);
	
	//check resources
	let cmpPlayer = QueryPlayerIDInterface(3);
	let resources = cmpPlayer.GetResourceCounts();
	//warn(uneval(cmpPlayer));
	
	let gain_food = 0;
	let gain_wood = 0;
	let gain_stone = 0;
	let gain_metal = 0;
	
	if (this.currentFood < resources.food)
		gain_food = resources.food - this.currentFood;
		
	if (this.currentWood < resources.wood)
		gain_wood = resources.wood - this.currentWood;
		
	if (this.currentStone < resources.stone)
		gain_stone = resources.stone - this.currentStone;
		
	if (this.currentMetal < resources.metal)
		gain_metal = resources.metal - this.currentMetal;
	
	this.currentFood = resources.food;
	this.currentWood = resources.wood;
	this.currentStone = resources.stone;
	this.currentMetal = resources.metal;
	
	let res_factor = 0.05;
	
	//do default point increment + gain
	this.pointFood = this.pointFood + this.pointFoodIncrement + cargo_food + res_factor*gain_food;
	this.pointWood = this.pointWood + this.pointWoodIncrement + cargo_wood;
	this.pointStone = this.pointStone + this.pointStoneIncrement + cargo_stone;
	this.pointMetal = this.pointMetal + this.pointMetalIncrement + cargo_metal;
	
	//subtract resources used to gain points, namely food so that player 1 cannot just tribute it, get points for pl2 and then  have pl2 tribute the food back
	//cmpPlayer.AddResource("food",-1*gain_food);
	
	//warn("Current gain: " + uneval(gain_food)+" "+ uneval(gain_wood)+" "+ uneval(gain_stone)+" "+ uneval(gain_metal));

	//warn("Current points: " + uneval(this.pointFood)+" "+ uneval(this.pointWood)+" "+ uneval(this.pointStone)+" "+ uneval(this.pointMetal));
	
	//spend points
	let units_to_spawn = [];
	
	while (this.pointFood > this.foodUnitPrice)
	{
		this.pointFood = this.pointFood - this.foodUnitPrice;
		units_to_spawn.push(pickRandom(this.foodTemplates));
	}
	
	while (this.pointWood > this.woodUnitPrice)
	{
		this.pointWood = this.pointWood - this.woodUnitPrice;
		units_to_spawn.push(pickRandom(this.woodTemplates));
	}
	
	while (this.pointStone > this.stoneUnitPrice)
	{
		this.pointStone = this.pointStone - this.stoneUnitPrice;
		units_to_spawn.push(pickRandom(this.stoneTemplates));
	}
	
	while (this.pointMetal > this.metalUnitPrice)
	{
		this.pointMetal = this.pointMetal - this.metalUnitPrice;
		units_to_spawn.push(pickRandom(this.metalTemplates));
	}
	
	//make list of own sites
	let p = 3;
	let target_player = 2;
	let sites = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Structure").filter(TriggerHelper.IsInWorld);
	
	
	//with small probability, add header
	if (Math.random() < this.healerProb)
	{
		units_to_spawn.push("units/mace/support_healer_e");
		//warn("adding healer!");
	}
	
	//spawn and give units orders
	for (let u of units_to_spawn)
	{
		//pick random site
		let site_j = pickRandom(sites);
		
		//spawn unit
		let units_i = TriggerHelper.SpawnUnits(site_j, u, 1, p);
		
		//make it fight
		//this.WalkAndFightClosestTarget(units_i[0],target_player,"Gate");
		this.WalkAndFightRandomTarget(units_i[0],target_player,"DefenseTower","Structure");
	}
	
	
	
	this.DoAfterDelay(this.pointIncrementTime * 1000,"PointIncrement",null);
	
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
	 * some notes: 6:30 in, spart starts first attack, 2 dozen troops + 2 rams (moderate + balanced)
	 * 
	 * 
	 */
	
	//some constants
	cmpTrigger.maxNumCretanTraders = 10;
	cmpTrigger.tradeEscortSize = 3;
	cmpTrigger.escortProb = 0.3;
	cmpTrigger.maxNumArcadianTraders = 6;
	
	//patrol things
	cmpTrigger.patrolSize = 6;
	cmpTrigger.patrolSizeDefault = 6;
	cmpTrigger.maxPatrolNumber = 300;
	cmpTrigger.patrolSpawnTime = 15; //30 seconds
	cmpTrigger.patrolTemplates = ["units/athen/champion_ranged","units/merc_black_cloak","units/athen/champion_marine","units/athen/champion_infantry","units/merc_thureophoros"];
	
	cmpTrigger.repairTemplates = ["units/athen/infantry_spearman_a","units/athen/infantry_slinger_a","units/athen/infantry_javelineer_a"];
	cmpTrigger.slaveTemplates = ["units/gaul/infantry_spearman_a","units/gaul/infantry_spearman_e","units/gaul/infantry_slinger_a","units/gaul/infantry_javelineer_a","units/cart/infantry_swordsman_gaul_a","units/cart/infantry_swordsman_gaul_b","units/brit/war_dog"];
	cmpTrigger.slaveMaxPopulation = 300;
	cmpTrigger.slaveAssaultInterval = 15;
	
	//cavalry attack on siege if it exists
	cmpTrigger.cavTemplates = ["units/spart/cavalry_spearman_e","units/athen/cavalry_swordsman_e","units/pers/champion_cavalry"];
	cmpTrigger.cavLimit = 20;
	cmpTrigger.cavSquadSize = 6;
	cmpTrigger.cavAttackInterval = 30;
	
	//scythian cavalry attack at the end
	cmpTrigger.scythianCavTemplates = ["units/pers/cavalry_archer_a","units/pers/cavalry_archer_e","units/pers/cavalry_javelineer_e","units/pers/champion_cavalry","units/pers/champion_cavalry","units/pers/champion_cavalry_archer","units/pers/cavalry_spearman_a","units/pers/cavalry_spearman_e","units/pers/cavalry_axeman_a","units/pers/cavalry_axeman_e","units/pers/cavalry_axeman_e"];
	cmpTrigger.scythianWaveInterval = 15; //every 20 seconds
	cmpTrigger.scythianWaveSize = 35;
	cmpTrigger.scythianPopCap = 300;
	cmpTrigger.scythianAttackTriggered = false;
	cmpTrigger.buildingsDestroyedThreshold = 18;
	cmpTrigger.numBuildingsDestroyed = 0;
	
	//cmpTrigger.DoAfterDelay(cmpTrigger.scythianWaveInterval * 1000,"SpawnCavalryDockAttack",null);
	//cmpTrigger.DoAfterDelay(20 * 1000,"SpawnCavalryWave",null);
	
	//point system
	
	cmpTrigger.enemyPoints = 0; // about 6000 30 minutes in with scytians destroyed halfway
	
	cmpTrigger.pointIncrementTime = 20;
	cmpTrigger.pointFood = 0;
	cmpTrigger.pointFoodIncrement = 100;
	cmpTrigger.pointWood = 0;
	cmpTrigger.pointWoodIncrement = 50;
	cmpTrigger.pointStone = 0;
	cmpTrigger.pointStoneIncrement = 20;
	cmpTrigger.pointMetal = 0;
	cmpTrigger.pointMetalIncrement = 40;
	
	cmpTrigger.currentFood = 0;
	cmpTrigger.currentWood = 0;
	cmpTrigger.currentStone = 0;
	cmpTrigger.currentMetal = 0;
	
	cmpTrigger.foodTemplates = ["units/athen/infantry_spearman_b","units/mace/infantry_pikeman_a","units/mace/cavalry_spearman_a","units/mace/infantry_pikeman_a","units/athen/infantry_spearman_a"];
	cmpTrigger.foodUnitPrice = 18;
	cmpTrigger.woodTemplates = ["units/mace/infantry_javelineer_a","units/mace/cavalry_javelineer_a","units/mace/infantry_archer_b","units/mace/infantry_archer_a","units/mace/infantry_slinger_e","units/mace/infantry_slinger_a"];
	cmpTrigger.woodUnitPrice = 25;
	cmpTrigger.stoneTemplates = ["units/athen/siege_oxybeles_packed","units/mace/siege_lithobolos_packed","units/mace/siege_ram"];
	cmpTrigger.stoneUnitPrice = 170;
	cmpTrigger.metalTemplates = ["units/athen/champion_ranged","units/athen/champion_marine","units/mace/champion_infantry_spearman","units/mace/champion_infantry_swordsman","units/mace/champion_cavalry","units/merc_thorakites","units/merc_thureophoros"];
	cmpTrigger.metalUnitPrice = 40;
	
	//healer spawn probability
	cmpTrigger.healerProb = 0.07;
	
	cmpTrigger.DoAfterDelay((30+cmpTrigger.pointIncrementTime) * 1000,"PointIncrement",null);
	
	cmpTrigger.DoAfterDelay((30+cmpTrigger.pointIncrementTime) * 1000,"PointIncrementEnemy",null);
	
	
	//whether the special attack has happened
	cmpTrigger.templeCaptured = false;
	cmpTrigger.campCaptured = false;
	cmpTrigger.marketCaptured = false;
	cmpTrigger.numDocksCaptured = 0;
	cmpTrigger.specialAttackTriggered = false;
	
	//garrison towers
	warn("Garrisoning entities");
	cmpTrigger.DoAfterDelay(4 * 1000,"GarrisonEntities",null);
	
	//give extra trade tech
	cmpTrigger.DoAfterDelay(2 * 1000,"ResearchStartingTradeTech",null);
	
	//cavalry attacks against siege
	cmpTrigger.DoAfterDelay(cmpTrigger.cavAttackInterval * 1000,"CavalrySiegeAttack",null);
	
	//repair crews
	cmpTrigger.maxRepairmen = 20;
	cmpTrigger.DoAfterDelay(30 * 1000,"SpawnRepairCrew",null);
	
	//traders with neutral post
	cmpTrigger.maxTraders = 6;
	cmpTrigger.DoAfterDelay(45 * 1000, "SpawnOlbianTrader",null);
	
	//spawn patrol
	cmpTrigger.DoAfterDelay(6 * 1000,"SpawnPatrol",null);
	cmpTrigger.DoAfterDelay(10 * 1000,"SpawnPatrol",null);
	cmpTrigger.DoAfterDelay(15 * 1000,"SpawnPatrol",null);
	cmpTrigger.DoAfterDelay(20 * 1000,"SpawnPatrol",null);
	cmpTrigger.DoAfterDelay(25 * 1000,"SpawnPatrol",null);
	cmpTrigger.DoAfterDelay(30 * 1000,"SpawnPatrol",null);
	cmpTrigger.DoAfterDelay(35 * 1000,"SpawnPatrol",null);
	cmpTrigger.DoAfterDelay(40 * 1000,"SpawnPatrol",null);
	cmpTrigger.DoAfterDelay(45 * 1000,"SpawnPatrol",null);
	cmpTrigger.DoAfterDelay(50 * 1000,"SpawnPatrol",null);
	cmpTrigger.DoAfterDelay(55 * 1000,"SpawnPatrolInterval",null);

	//spawn scythian traders
	cmpTrigger.DoAfterDelay(3 * 1000,"SetDiplomacy",null);
	for (let i = 1; i <= 10; i ++)
	{
		cmpTrigger.DoAfterDelay((i*10+Math.round(Math.random()*15)) * 1000,"SpawnNeutralTrader",null);
	}
	
	for (let i = 1; i <= 8; i ++)
	{
		cmpTrigger.DoAfterDelay((i*10+Math.round(Math.random()*15)) * 1000,"SpawnScyhianTrader",null);
	}
	
	//schedule our own trade ships
	
	for (let i = 1; i <= 6; i ++)
	{
		cmpTrigger.DoAfterDelay((i*20+Math.round(Math.random()*15)) * 1000,"SpawnTradeShip",null);
	}
	
	/*cmpTrigger.DoAfterDelay(5 * 1000,"SpawnScyhianTrader",null);
	cmpTrigger.DoAfterDelay(10 * 1000,"SpawnScyhianTrader",null);
	cmpTrigger.DoAfterDelay(15 * 1000,"SpawnScyhianTrader",null);
	cmpTrigger.DoAfterDelay(20 * 1000,"SpawnScyhianTrader",null);
	cmpTrigger.DoAfterDelay(25 * 1000,"SpawnScyhianTrader",null);
	cmpTrigger.DoAfterDelay(30 * 1000,"SpawnScyhianTrader",null);*/

	
	//start spawning traders
	/*cmpTrigger.DoAfterDelay(5 * 1000, "SpawnCretanTraders",null);
	cmpTrigger.DoAfterDelay(5 * 1000, "SpawnArcadianTraders",null);
	
	//start spawning patrols
	cmpTrigger.DoAfterDelay(10 * 1000,"SpawnArcadianPatrol",null);
	cmpTrigger.DoAfterDelay(10 * 1000,"SpawnAchaeanPatrol",null);
	
	//schedule assault
	cmpTrigger.DoAfterDelay(15 * 1000,"SpawnAssault",null);*/
	
	
	//cmpTrigger.DoAfterDelay(10 * 1000,"FlipMegolopolisAssets",null);
	
	
	
	//spawn patrols of forts
	//cmpTrigger.DoAfterDelay(10 * 1000,"SpawnFortressPatrol",null);
	
	//invasion sea attack
	//cmpTrigger.DoAfterDelay(10 * 1000,"SpawnNavalInvasionAttack",null);




	for (let p of [1,2,3,4,5])
	{
		let cmpPlayer = QueryPlayerIDInterface(p);
		
		//for players 3,4,5,6 disable templates
		

		//disable buildings production
		let disTemplates = disabledTemplates(cmpPlayer.GetCiv());
		
		if (p != 1)
		{
			//disable units as well
			let unit_templaes = TriggerHelper.GetTemplateNamesByClasses("Unit", cmpPlayer.GetCiv(), undefined, undefined, true);	
			disTemplates = disTemplates.concat(unit_templaes);
		}
		else if (p == 1)
		{
			disTemplates.push("units/mace/ship_merchant");
		}
		
		cmpPlayer.SetDisabledTemplates(disTemplates);
		warn("Disabling templates for player "+uneval(p));
		
	
		let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
		
		cmpTechnologyManager.ResearchTechnology("phase_town_generic");
		cmpTechnologyManager.ResearchTechnology("phase_city_generic");
		
	
		if (p == 1)
		{
			cmpTechnologyManager.ResearchTechnology("unlock_shared_los");
			cmpTechnologyManager.ResearchTechnology("trade_gain_01");
			cmpTechnologyManager.ResearchTechnology("unlock_champion_infantry");
			cmpTechnologyManager.ResearchTechnology("unlock_champion_cavalry");
			cmpPlayer.SetPopulationBonuses(300);
		}
		else if (p == 2)
		{
			//add tower tech
			cmpTechnologyManager.ResearchTechnology("tower_health");
			cmpTechnologyManager.ResearchTechnology("tower_range");
			cmpTechnologyManager.ResearchTechnology("tower_watch");
			cmpTechnologyManager.ResearchTechnology("tower_murderholes");
			cmpTechnologyManager.ResearchTechnology("tower_crenellations");
			
		}
		else if (p == 3)
		{
			cmpPlayer.SetPopulationBonuses(300);
		}
		else if (p == 4 || p == 5)
		{
			cmpTechnologyManager.ResearchTechnology("trade_gain_01");
			cmpTechnologyManager.ResearchTechnology("trade_gain_02");
			cmpTechnologyManager.ResearchTechnology("trade_commercial_treaty");
		}
	}
	
	
	cmpTrigger.RegisterTrigger("OnInterval", "IdleUnitCheck", {
		"enabled": true,
		"delay": 60 * 1000,
		"interval": 30 * 1000,
	});
	
	// Activate all possible triggers
	let data = { "enabled": true };
	cmpTrigger.RegisterTrigger("OnOwnershipChanged", "OwnershipChangedAction", data);
	cmpTrigger.RegisterTrigger("OnResearchFinished", "ResearchFinishedAction", data);
	cmpTrigger.RegisterTrigger("OnPlayerCommand", "PlayerCommandAction", data);
	/*cmpTrigger.DoAfterDelay(300 * 1000,"SpawnAlliedInvasionAttack",null);*/
	
	
	
};
