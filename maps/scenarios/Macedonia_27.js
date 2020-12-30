warn("loading the triggers file");

///////////////////////
// Trigger listeners //
///////////////////////


var unitTargetClass = "Unit+!Ship";
var siegeTargetClass = "Structure";


var triggerPointNorth = "B";
var triggerPointPatrolA = "A";
var triggerPointPatrolB = "B";
var triggerPointSupplyConvoy = "K";
var triggerPointSupplyConvoyDestination = "J";



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
	//warn("The OnStructureBuilt event happened with the following data:");
	//warn(uneval(data));
	this.lastFoundation = data.foundation;
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


Trigger.prototype.SpawnStructureResponseAttack = function(data)
{
	//find out how many units we have already
	let cmpPlayer = QueryPlayerIDInterface(3);
	let pop = cmpPlayer.GetPopulationCount();
	//warn("pop = "+pop);
	
	if (pop < 1.25*this.maxWatchPop && pop > 0)
	{
		let attack_size = data.attack_size;
		let ele_prob = data.ele_prob;
		let target_location = data.location;
		
		//site : civil centre
		let ccs = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(2),"CivilCentre").filter(TriggerHelper.IsInWorld);
		if (ccs.length < 1)
			return;
		
		let site = ccs[0];
		
		//warn("spawning strucure response squad");
		
		let attackers = [];
		let p = 3;
		for (let i = 0; i < attack_size; i ++)
		{
			//spawn unit
			let units_i = TriggerHelper.SpawnUnits(site,pickRandom(this.patrolTemplates),1,p);
			attackers.push(units_i[0]);
		}
		
		//see if we add elephant
		if (Math.random() < ele_prob)
		{
			let units_i = TriggerHelper.SpawnUnits(site,"units/pers_champion_elephant",1,p);
			attackers.push(units_i[0]);
		}
		
		//set formation
		//TriggerHelper.SetUnitFormation(p, attackers, pickRandom(unitFormations));

		//send to attack
		ProcessCommand(p, {
			"type": "attack-walk",
			"entities": attackers,
			"x": target_location.x,
			"z": target_location.y,
			"queued": true,
			"targetClasses": {
				"attack": unitTargetClass
			},
			"allowCapture": false
		});
	}
}


Trigger.prototype.ResearchTechs = function(data)
{
	for (let p of [1])
	{
	
		let cmpPlayer = QueryPlayerIDInterface(p);
		let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
		
		if (p == 1)
		{
			cmpTechnologyManager.ResearchTechnology("romans/vision_sibylline");
			
			cmpTechnologyManager.ResearchTechnology("speed_cavalry_01");
			cmpTechnologyManager.ResearchTechnology("speed_cavalry_02");
			cmpTechnologyManager.ResearchTechnology("successors/special_war_horses");
			cmpTechnologyManager.ResearchTechnology("armor_hero_01");
			cmpTechnologyManager.ResearchTechnology("armor_hero_01");
			
			cmpTechnologyManager.ResearchTechnology("heal_rate_2");
			cmpTechnologyManager.ResearchTechnology("heal_rate_2");
			cmpTechnologyManager.ResearchTechnology("heal_range_2");
			cmpTechnologyManager.ResearchTechnology("heal_range_2");
			
			cmpTechnologyManager.ResearchTechnology("trade_gain_02");
			cmpTechnologyManager.ResearchTechnology("trade_gain_02");
			cmpTechnologyManager.ResearchTechnology("trade_gain_02");
			cmpTechnologyManager.ResearchTechnology("trade_gain_02");
			cmpTechnologyManager.ResearchTechnology("trade_gain_02");
			
		}
		
	}
	//cmpTechnologyManager.ResearchTechnology("trade_gain_02");
	//cmpTechnologyManager.ResearchTechnology("trade_gain_02");
	//cmpTechnologyManager.ResearchTechnology("trade_gain_02");
	
}

Trigger.prototype.OwnershipChangedAction = function(data)
{
	
	//possibly trader
	if (data.from == 6 && data.to == -1)
	{
		//check if trader
		let id = Engine.QueryInterface(data.entity, IID_Identity);
		if (id != null && id.classesList.indexOf("Trader") >= 0)
		{
			//warn("trader dies");
			let cmpTrader = Engine.QueryInterface(data.entity, IID_Trader);
			//warn("goods = "+cmpTrader.goods_hidden);
			
			if (cmpTrader.goods_hidden > 0)
			{
				let type = pickRandom(["food","wood","stone","metal"]);
				let cmpPlayer = QueryPlayerIDInterface(1);
				cmpPlayer.AddResource(type,cmpTrader.goods_hidden);
				
				//see whether to capture it
				let traders = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(1),"Trader").filter(TriggerHelper.IsInWorld);
				
				if (traders.length < 10)
				{
					TriggerHelper.SpawnUnits(data.entity,"units/mace_support_trader",1,1);
				}
			}
		}
	}
	
	//check structures
	if (data.from == 2 && data.to == -1)
	{
		let id = Engine.QueryInterface(data.entity, IID_Identity);
		if (id)
		{
			//check if structure
			if (id.classesList.indexOf("Structure") >= 0)
			{
				//possibly send an attack from watch
				if (Math.random() < this.responseSquadProb)
				{
					let data_attack = {};
					//warn(uneval(id.classesList));
					
					//handle defense tower
					if (id.classesList.indexOf("DefenseTower") >= 0)
					{
						data_attack.attack_size = 8;
						data_attack.ele_prob = 0.4;
						
					}
					else if (id.classesList.indexOf("Fortress") >= 0) // fortress
					{
						data_attack.attack_size = 20;
						data_attack.ele_prob = 0.9;
						
					}
					else //all other structures
					{
						data_attack.attack_size = 4;
						data_attack.ele_prob = 0.2;
					}
					
					//bonus troops added based on running average of points
					data_attack.attack_size += Math.round(this.pointsRunningAvg/30);
					
					//get location of building
					var cmpTargetPosition = Engine.QueryInterface(data.entity, IID_Position).GetPosition2D();
					
					data_attack.location = cmpTargetPosition;
					this.SpawnStructureResponseAttack(data_attack);
					
					this.responseSquadProb = this.responseSquadProb * this.decayFactor;
				}
				//warn(this.responseSquadProb);
				
				//possibly send an attack from player 2
				if (Math.random() < 0.2)
					this.SpawnCavalryAttack();
				
				//give bonus loot to player 1 and lower pop limit for watch
				let cmpPlayer = QueryPlayerIDInterface(1);
				
				if (id.classesList.indexOf("Field") >= 0)
				{
					cmpPlayer.AddResource("food",500);
					this.maxWatchPop = Math.floor(this.maxWatchPop * 0.974);
				}
				else if (id.classesList.indexOf("Fortress") >= 0)
				{
					cmpPlayer.AddResource("stone",500);
					cmpPlayer.AddResource("metal",250);
					this.maxWatchPop = Math.floor(this.maxWatchPop * 0.975);
				}
				else if (id.classesList.indexOf("Economic") >= 0)
				{
					cmpPlayer.AddResource("wood",500);
					cmpPlayer.AddResource("metal",250);
					this.maxWatchPop = Math.floor(this.maxWatchPop * 0.975);
				}
				else if (id.classesList.indexOf("House") >= 0)
				{
					cmpPlayer.AddResource("food",100);
					cmpPlayer.AddResource("wood",50);
					cmpPlayer.AddResource("metal",25);
					this.maxWatchPop = Math.floor(this.maxWatchPop * 0.985);
				}
				else if (id.classesList.indexOf("DefenseTower") >= 0)
				{
					cmpPlayer.AddResource("stone",50);
					cmpPlayer.AddResource("metal",25);
					this.maxWatchPop = Math.floor(this.maxWatchPop * 0.99);
				}
				else 
				{
					cmpPlayer.AddResource("wood",75);
					cmpPlayer.AddResource("stone",25);
					this.maxWatchPop = Math.floor(this.maxWatchPop * 0.995);
				}
				
				//warn("max watch pop = "+this.maxWatchPop);
			}
		}
		
		
	}
	
	
	//check if darius is dead
	/*if (data.from == 3 && data.to == -1)
	{
		this.dariusDead = true;
	}
	
	//check if player 2 or 6 has lost a structure
	if ((data.from == 2 || data.from == 6) && data.to == -1 && data.entity != this.lastFoundation)
	{
		let id = Engine.QueryInterface(data.entity, IID_Identity);
	//	warn(uneval(data));
	//	warn(uneval(id));
		if (id != null && id.classesList.indexOf("Structure") >= 0)
		{
			
			//with small probability spawn mercenary squad
			if (Math.random() < this.mercSpawnProb)
			{
				this.DoAfterDelay(5 * 1000,"SpawnMercenarySquad",null);
				//warn("spawning mercs");
				
				//decay
				this.mercSpawnProb = this.mercSpawnProb * this.mercSpawnProbDecay;
				
				if (this.mercSpawnProb < 0.2)
				{
					this.mercSpawnProb = 0.2;
				}
				
				//warn("new prob = "+uneval(this.mercSpawnProb));
			}
		}
	}
	
	//check if player 5 has lost all units
	if (data.from == 5 && data.to == -1)
	{
		let cmpPlayer = QueryPlayerIDInterface(5);
		let pop = cmpPlayer.GetPopulationCount();

		if (pop == 0)
		{
			this.ShowText("The assasins are dead. Darius is severely wounded and as he lay dying, he utters his final words: 'Avenge me! The empire is yours, but you must defeat Bessus. My loyal followers will help you setup camp. You must destroy the traitor!","Sounds good","OK");
			
			//spawn servants
			let dariusID = 3328;
			let alexanderID = 3287;
			
			TriggerHelper.SpawnUnits(alexanderID,"units/pers_infantry_archer_b",10,1);
			TriggerHelper.SpawnUnits(alexanderID,"units/pers_infantry_spearman_b",10,1);
			TriggerHelper.SpawnUnits(alexanderID,"units/pers_infantry_javelinist_a",5,1);
			TriggerHelper.SpawnUnits(alexanderID,"units/pers_support_healer_e",3,1);
			
			if (this.dariusDead == false)
			{
				//kill darius if alive
				let health_u = Engine.QueryInterface(dariusID, IID_Health);
				health_u.Kill();
			
				this.dariusDead = true;
			}
			
		}
	}*/
	
	/*if (this.specialAttackTriggered == false)
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
	*/
	
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




//garison AI entities with archers
Trigger.prototype.GarrisonEntities = function(data)
{
	for (let p of [1])
	{
		//camps
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
		
		//FORTRESS
		let forts_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Fortress").filter(TriggerHelper.IsInWorld);
		let fort_size = 10;
	
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
	}
	
	for (let p of [2,4])
	{
		let towers_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "StoneTower").filter(TriggerHelper.IsInWorld);
		
		let owner = 6; //city watch controls the soldiers
		if (p == 4)
			owner = 4;
		
		for (let e of towers_p)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(e, "units/pers_champion_infantry",5,owner);
			
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
			let archers_e = TriggerHelper.SpawnUnits(e, "units/pers_champion_infantry",3,owner);
			
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
			
			let archers_e = TriggerHelper.SpawnUnits(e, "units/pers_champion_infantry",fort_size,owner);
			
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
			let archers_e = TriggerHelper.SpawnUnits(e, "units/pers_champion_infantry",2,owner);
					
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(e,true);
			}
		}
		
		//camps
		let camps_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p),"MercenaryCamp").filter(TriggerHelper.IsInWorld);
			
		for (let c of camps_p)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(c, "units/pers_champion_infantry",5,p);
			
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(c,true);
			}
		}
	}
}	


Trigger.prototype.SpawnPatrolReinforcements = function(data)
{
	//find out how many units we have already
	let cmpPlayer = QueryPlayerIDInterface(3);
	let pop = cmpPlayer.GetPopulationCount();
	//warn("pop = "+pop);
	
	//compute points
	//first collect points
		
	//traders arrived
	//warn("Traders = "+this.numTradersArrived);
	
	//fields
	let p = 2;
	let fields = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Field").filter(TriggerHelper.IsInWorld);
	//warn("Fields = "+fields.length);
		
	//fields
	let houses = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "House").filter(TriggerHelper.IsInWorld);
	//warn("Houses = "+houses.length);
		
	//economic
	let economic = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Economic").filter(TriggerHelper.IsInWorld);
	//warn("Economic = "+economic.length);
		
	//military 
	let military = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Military").filter(TriggerHelper.IsInWorld);
	//warn("Military = "+military.length);
		
	//towers
	let towers = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "DefenseTower").filter(TriggerHelper.IsInWorld);
	//warn("DefenseTower = "+towers.length);
			
	//spawn units based on points
	let points = 2*houses.length + 8*fields.length + 10*economic.length + 5*military.length + 1*towers.length + 20*this.numTradersArrived;
		
	//warn("points = "+points);
		
	this.pointsRunningAvg = 0.9 * this.pointsRunningAvg + 0.1 * points;
	//warn("running avg. = "+this.pointsRunningAvg);
		
	//clear trade counter
	this.numTradersArrived = 0;
	
	if (pop < this.maxWatchPop && pop > 0)
	{
		
		//spawn
		let num_troops = Math.round(points/10);
		//warn("num troops = "+num_troops);
		p = 3;
		for (let i = 0; i < num_troops; i ++)
		{
			//spawn site
			let site = pickRandom(this.GetTriggerPoints(triggerPointPatrolA));
			
			//spawn unit
			let units_i = TriggerHelper.SpawnUnits(site,pickRandom(this.patrolTemplates),1,p);
			
			//give orders
			let cmpUnitAI = Engine.QueryInterface(units_i[0], IID_UnitAI);
			if (cmpUnitAI)
			{
				if (cmpUnitAI.IsIdle())
				{
			
					//targets A
					let targets_A = this.GetTriggerPoints(triggerPointPatrolA);
					
					//targets B
					let targets_B = this.GetTriggerPoints(triggerPointPatrolB);
					
					if (targets_A.length > 0 && targets_B.length > 0)
					{
						this.PatrolOrder(units_i,p,pickRandom(targets_A),pickRandom(targets_B));
					}
					else 
					{
						return;//no point, we've lost
					}
				}
			}
		}
		
	}
	
	//repeat
	this.DoAfterDelay(30 * 1000,"SpawnPatrolReinforcements",null);
}




Trigger.prototype.RangeActionAllies = function(data)
{
	if (this.alliesEvent == false)
	{
		this.alliesEvent = true;
		
		//TO DO: show some text
		this.ShowText("You have encountered a local nomadic tribe who are happy to trade with us. They are no fans of Aria and have pledged somem warriors to help you take the city.","Great","OK");
		
		
		//get allies
		let site = pickRandom(this.GetTriggerPoints("C"));
			
		//spawn some allies
		let units_javelin = TriggerHelper.SpawnUnits(site,"units/pers_kardakes_skirmisher",15,1);
	}
	
}

Trigger.prototype.RangeActionTradersDestination = function(data)
{
	
	let traders_arrived = [];
	for (let e of data.currentCollection)
	{
		let id = Engine.QueryInterface(e, IID_Identity);
		if (id.classesList.indexOf("Trader") >= 0)
		{
			traders_arrived.push(e);
			
			//clear goods
			let cmpTrader = Engine.QueryInterface(e, IID_Trader);
			cmpTrader.goods_hidden = 0;
			
			//kill trader
			let health_u = Engine.QueryInterface(e, IID_Health);
			health_u.Kill();
			
			//advance counter
			this.numTradersArrived = this.numTradersArrived + 1;
		}
	}
		
	if (traders_arrived.length > 0)
	{
		//warn("num traders arrived = "+traders_arrived.length);
		

	}	
	
}


Trigger.prototype.HasUnits = function(player)
{
	let cmpPlayer = QueryPlayerIDInterface(player);
	let pop = cmpPlayer.GetPopulationCount();
	if (pop > 0)
	{
		return  true;
	}
	else 
	{
		return false;
	}
}

Trigger.prototype.SpawnSupplyConvoy = function(data)
{
	if (this.HasUnits(6) == false)
	{
		warn("[WARN] Trying to spawn units for player who may be dead, abort.");
		return;
	}
	
	
	let p = 6;
	let site = pickRandom(this.GetTriggerPoints(triggerPointSupplyConvoy));
	
	let num_traders = 1 + Math.round(Math.random()*4);
	
	let units_i = TriggerHelper.SpawnUnits(site,"units/pers_support_trader",num_traders,p);
	
	//give order to march
	for (let u of units_i)
	{
		let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
		//let target_pos = TriggerHelper.GetEntityPosition2D(pickRandom(this.GetTriggerPoints(triggerPointSupplyConvoyDestination)));
					
		cmpUnitAI.SwitchToStance("passive");
		cmpUnitAI.WalkToTarget(pickRandom(this.GetTriggerPoints(triggerPointSupplyConvoyDestination)), false);
		
		//SET GOODS
		let cmpTrader = Engine.QueryInterface(u, IID_Trader);
		
		let goods = {
			"type": "food",
			"amount": 200,
			"origin": 0
		};
		
		let types = ["food","wood","metal","stone"];
		cmpTrader.goods_type = pickRandom(types);
		cmpTrader.goods_hidden = 100;
		//cmoTrader.index = 0;
		//cmoTrader.markets = [2584,2595];
	}
	
	this.DoAfterDelay(30 * 1000,"SpawnSupplyConvoy",null);

}

Trigger.prototype.IdleUnitCheck = function(data)
{
	//check cavalry
	for (let p of [6])
	{
		let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Cavalry").filter(TriggerHelper.IsInWorld);
		
		//warn("Found cavalry = "+units.length);
		
		//get alexander position
		let heros = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1),"Hero").filter(TriggerHelper.IsInWorld);
		
		if (heros.length > 0)
		{
			
			//warn("Found hero");
			
			for (let u of units)
			{
				let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
				if (cmpUnitAI)
				{
					if (cmpUnitAI.IsIdle())
					{
						this.WalkAndFightClosestTarget(u,1,"Hero");
					}
				}
			}
		}
	}
	
	//city watch
	for (let p of [3])
	{
		//all champions or archers should patrol
		let units_patrol = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Champion").filter(TriggerHelper.IsInWorld);
		
		units_patrol = units_patrol.concat(TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Archer").filter(TriggerHelper.IsInWorld));
		
		for (let u of units_patrol)
		{
			let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI)
			{
				if (cmpUnitAI.IsIdle())
				{
			
					//targets A
					let targets_A = this.GetTriggerPoints(triggerPointPatrolA);
					
					//targets B
					let targets_B = this.GetTriggerPoints(triggerPointPatrolB);
					
					if (targets_A.length > 0 && targets_B.length > 0)
					{
						this.PatrolOrder([u],p,pickRandom(targets_A),pickRandom(targets_B));
					}
					else 
					{
						return;//no point, we've lost
					}
				}
			}
		}
		
		//find any idle soldiers
		/*let units_inf = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Infantry").filter(TriggerHelper.IsInWorld);
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
		}*/
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



Trigger.prototype.SpawnCavalryAttack = function(data)
{
	if (this.HasUnits(6) == false)
	{
		warn("[WARN] Trying to spawn units for player who may be dead, abort.");
		return;
	}
	
	//check if we have structures left, if not, end
	let p = 6;
	let structures = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(2), "CivilCentre").filter(TriggerHelper.IsInWorld);
	
	if (structures.length == 0)
		return;
	
	//pick spawn site
	let spawn_site = pickRandom(structures);
	
	//how big should the attack be
	/*let min_size = 20;
	let units_1 = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "Unit").filter(TriggerHelper.IsInWorld);
	
	let num_attackers = Math.floor(units_1.length / 7.0);
	if (num_attackers < min_size)
		num_attackers = min_size;*/
		
	
	let num_attackers = 10 + this.pointsRunningAvg / 20;
	
	//types
	let cav_templates = ["units/pers_cavalry_swordsman_e","units/pers_cavalry_spearman_e","units/pers_cavalry_javelinist_e"];
	let attackers = [];
	
	//spawn attackers
	for (let i = 0; i < num_attackers; ++i)
	{
		let units_i = TriggerHelper.SpawnUnits(spawn_site,pickRandom(cav_templates),1,p);
		attackers.push(units_i[0]);
	}
	
	//attack
	//set formation
	//TriggerHelper.SetUnitFormation(p, attackers, pickRandom(unitFormations));
	
	//target is alexander
	let heros = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "Hero").filter(TriggerHelper.IsInWorld);
	
	let target = null;
	
	if (heros.length > 0)
		target = heros[0];
	else 
		target = this.FindClosestTarget(attackers[0],1,siegeTargetClass);
	
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

Trigger.prototype.SpawnBessusPatrol = function(data)
{
	let p = 7; //greek mercs
	
	//warn("checking to spawn patrol");
	
	//get state and see if player is alive
	let cmpPlayer = QueryPlayerIDInterface(p);
	if (cmpPlayer.GetState != "defeated")
	{	
		
		//see how many units we have
		let units_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "Unit").filter(TriggerHelper.IsInWorld);
		
		//warn("player 7 has "+uneval(units_p.length) + " units");
		
		if (units_p.length < 40)
		{
		
			//targets A
			let targets_A = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(2), "CivilCentre").filter(TriggerHelper.IsInWorld);
			targets_A = targets_A.concat(TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(2), "Market").filter(TriggerHelper.IsInWorld));
			
			
			let targets_B = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(2), "DefenseTower").filter(TriggerHelper.IsInWorld);
			targets_B = targets_B.concat(TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(2), "Fortress").filter(TriggerHelper.IsInWorld));
			
			if (targets_A.length == 0 || targets_B.length == 0)
				return;
				
			let site_j = pickRandom(targets_B);	
			
			let patrol_units = [];
			let patrol_size = 5;
			
			for (let i = 0; i < patrol_size; i ++)
			{
				let units_i = TriggerHelper.SpawnUnits(site_j,pickRandom(this.squadTemplates),1,p);
				patrol_units.push(units_i[0]);
			}

			//send to patrol
			this.PatrolOrder(patrol_units,p,pickRandom(targets_A),site_j);
		}
		
		this.DoAfterDelay(30 * 1000,"SpawnBessusPatrol",null);
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


Trigger.prototype.CheckForCC = function(data)
{
	//warn("checking for cc");
	
	//check if player 1 has built structure
	let structures = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "CivilCentre").filter(TriggerHelper.IsInWorld);
	
	if (structures.length > 0) //start after at least 2 structures
	{
		//disable new civil centres
		let cmpPlayer = QueryPlayerIDInterface(1);
		let disTemplates = ["structures/" + cmpPlayer.GetCiv() + "_civil_centre"];
		
		cmpPlayer.SetDisabledTemplates(disTemplates);
		
		//warn("disabling civil centres");
		//warn(uneval(cmpPlayer.GetDisabledTemplates()));
	}
	else 
	{
		this.DoAfterDelay(10 * 1000,"CheckForCC",null);
	}
}

Trigger.prototype.SpawnMercenarySquad = function(data)
{
	//check if camp is there
	let p = 7;
	
	let structures = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "MercenaryCamp").filter(TriggerHelper.IsInWorld);
	
	if (structures.length == 0)
		return;
		
	let spawn_site = pickRandom(structures);
	
	let num_attackers = 8;
	let attackers = [];
	
	//spawn attackers
	for (let i = 0; i < num_attackers; ++i)
	{
		let units_i = TriggerHelper.SpawnUnits(spawn_site,pickRandom(this.squadTemplates),1,p);
		attackers.push(units_i[0]);
	}
	
	//set formation
	TriggerHelper.SetUnitFormation(p, attackers, pickRandom(unitFormations));

	//find target
	let target = this.FindClosestTarget(attackers[0],1,unitTargetClass);
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


Trigger.prototype.SetDiplomacy = function(data)
{
	//everyone is neutral towards 4 and 5
	
	for (let p of [1,2,3])
	{
		let cmpPlayer = QueryPlayerIDInterface(p);
		cmpPlayer.SetNeutral(4);
		cmpPlayer.SetNeutral(5);
	}
	
	for (let p of [4,5])
	{
		let cmpPlayer = QueryPlayerIDInterface(p);
		for (let p2 of [1,2,3])
		{
			cmpPlayer.SetNeutral(p2);
		}
	}
	
}

{
	let cmpTrigger = Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger);


	//some templates
	cmpTrigger.patrolTemplates = ["units/pers_arstibara","units/pers_champion_infantry","units/pers_kardakes_hoplite", "units/pers_kardakes_skirmisher","units/pers_infantry_archer_e"];

	//some variables
	cmpTrigger.alliesEvent = false;
	
	cmpTrigger.maxWatchPop = 450;
	cmpTrigger.responseSquadProb = 0.999;
	cmpTrigger.decayFactor = 0.97;
	
	//some state variables
	cmpTrigger.numTradersArrived = 0;
	cmpTrigger.pointsRunningAvg = 300;
	
	//garrison towers
	warn("Garrisoning entities");
	cmpTrigger.DoAfterDelay(5 * 1000,"GarrisonEntities",null);
	
	//start techs
	cmpTrigger.DoAfterDelay(1 * 1000,"ResearchTechs",null);
	
	//set diplomancy
	cmpTrigger.DoAfterDelay(2 * 1000,"SetDiplomacy",null);
	
	//start supply convoys to enemy
	cmpTrigger.DoAfterDelay(10 * 1000,"SpawnSupplyConvoy",null);
	
	//repeat action to collect points and spawn reinforcements
	cmpTrigger.DoAfterDelay(30 * 1000,"SpawnPatrolReinforcements",null);

	for (let p of [1,2,3,4])
	{
		let cmpPlayer = QueryPlayerIDInterface(p);
		
		//disable buildings production
		let disTemplates = disabledTemplates(cmpPlayer.GetCiv());
		cmpPlayer.SetDisabledTemplates(disTemplates);
			
		let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
		
		cmpPlayer.AddStartingTechnology("phase_town_generic");
		cmpPlayer.AddStartingTechnology("phase_city_generic");
		
		if (p == 1)
		{
			cmpPlayer.AddStartingTechnology("trade_commercial_treaty");
			cmpPlayer.AddStartingTechnology("trade_gain_01");
			cmpPlayer.AddStartingTechnology("trade_gain_02");
			cmpPlayer.AddStartingTechnology("trade_convoys_speed");
			cmpPlayer.AddStartingTechnology("unlock_shared_los");
			
			//add some battle tech
			cmpPlayer.AddStartingTechnology("armor_cav_01");
			cmpPlayer.AddStartingTechnology("speed_cavalry_01");
			cmpPlayer.AddStartingTechnology("speed_cavalry_02");
			cmpPlayer.AddStartingTechnology("armor_infantry_01");
			cmpPlayer.AddStartingTechnology("armor_infantry_02");
			cmpPlayer.AddStartingTechnology("armor_hero_01");
			cmpPlayer.AddStartingTechnology("heal_rate");
			cmpPlayer.AddStartingTechnology("heal_rate_2");
			cmpPlayer.AddStartingTechnology("heal_range");
			cmpPlayer.AddStartingTechnology("heal_range_2");
			cmpPlayer.AddStartingTechnology("ranged_inf_skirmishers");
			cmpPlayer.AddStartingTechnology("attack_champions_elite");

			
			
			cmpPlayer.SetPopulationBonuses(300);
		}
		else if (p == 2)
		{
			//add tower tech
			cmpPlayer.AddStartingTechnology("tower_armour");
			cmpPlayer.AddStartingTechnology("tower_range");
			cmpPlayer.AddStartingTechnology("tower_watch");
			cmpPlayer.AddStartingTechnology("tower_murderholes");
			cmpPlayer.AddStartingTechnology("tower_crenellations");
		}
	}
	
	
	cmpTrigger.RegisterTrigger("OnInterval", "IdleUnitCheck", {
		"enabled": true,
		"delay": 10 * 1000,
		"interval": 30 * 1000,
	});
	
	
	cmpTrigger.RegisterTrigger("OnRange", "RangeActionTradersDestination", {
		"entities": cmpTrigger.GetTriggerPoints(triggerPointSupplyConvoyDestination), // central points to calculate the range circles
		"players": [6], // only count entities of player 1
		"maxRange": 50,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});
	
	cmpTrigger.RegisterTrigger("OnRange", "RangeActionAllies", {
		"entities": cmpTrigger.GetTriggerPoints("C"), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 50,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});
	
	// Activate all possible triggers
	let data = { "enabled": true };
	//cmpTrigger.RegisterTrigger("OnStructureBuilt", "StructureBuiltAction", data);
	cmpTrigger.RegisterTrigger("OnOwnershipChanged", "OwnershipChangedAction", data);
	
	/*cmpTrigger.DoAfterDelay(300 * 1000,"SpawnAlliedInvasionAttack",null);*/
	
	
	
};
