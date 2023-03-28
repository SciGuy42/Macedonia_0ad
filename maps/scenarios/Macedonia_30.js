warn("loading the triggers file");

///////////////////////
// Trigger listeners //
///////////////////////


var unitTargetClass = "Unit+!Ship";
var siegeTargetClass = "Structure";


/*var triggerPointPatrolA = "A";
var triggerPointPatrolB = "B";
var triggerPointPatrolMountainWest = "K";
var triggerPointPatrolMountainMiddle = "J";
var triggerPointPatrolMountainEast = "I";
var triggerPointRaid = "G";*/

var triggerPointWorkshop = "K";
var triggerPointDock = "D";



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
	"structures/rome/wallset_siege",
	"structures/wallset_palisade",

	// Shoreline
	"structures/" + civ + "/dock",
	"structures/brit/crannog",
	"structures/cart/super_dock",
	"structures/ptol/lighthouse",
	
	//villagers
	"units/" + civ + "/support_female_citizen"
];




Trigger.prototype.WalkAndGatherClosestTarget = function(attacker,target_player,target_class)
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
		cmpUnitAI.PerformGather(target,true,true);
	}
	else //find a structure
	{
		
		
		warn("[ERROR] Could not find closest target to fight: "+attacker+" and "+target_player+" and "+target_class);
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



Trigger.prototype.OwnershipChangedAction = function(data)
{

};



Trigger.prototype.PlayerCommandAction = function(data)
{
	if (data.cmd.type == "dialog-answer" && this.dockDialogActive == true)
	{
		//warn("The OnPlayerCommand event happened with the following data:");
		//warn(uneval(data));
		
		if (data.cmd.answer == "button1")
		{
			//if we picked yes
			let cmpPlayer = QueryPlayerIDInterface(1);
	
			//pay
			cmpPlayer.AddResource("stone",-1*this.dockCostStone);
			
			//receive
			cmpPlayer.AddResource("food",this.dockOfferFood);

			//increment base cost
		    this.stoneToFoodFactor = this.stoneToFoodFactor * 0.975;
		}
		
		this.dockDialogActive = false;
	}
	else if (data.cmd.type == "dialog-answer" && this.workshopDialogActive == true)
	{
		//warn("The OnPlayerCommand event happened with the following data:");
		//warn(uneval(data));
		
		if (data.cmd.answer == "button1")
		{
			//if we picked yes
			let cmpPlayer = QueryPlayerIDInterface(1);
	
			//pay
			cmpPlayer.AddResource("food",-1*this.workshopOfferFoodCost);
			cmpPlayer.AddResource("metal",-1*this.workshopOfferMetalCost);
			
			//spawn 
			let site = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(6), "Arsenal").filter(TriggerHelper.IsInWorld)[0];
			
			TriggerHelper.SpawnUnits(site,this.workshopOfferPiece,1,1);
			
			//increment base cost
			this.workshopBaseCost = this.workshopBaseCost * this.workshopCostFactor;
		}
		else 
		{
			
				
		}
			
		this.workshopDialogActive = false;
	}
};



//garison AI entities with archers
Trigger.prototype.GarrisonEntities = function(data)
{
	
	for (let p of [4,5,6])
	{
		let towers_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "StoneTower").filter(TriggerHelper.IsInWorld);
		
		let owner = 7;
		
		for (let e of towers_p)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(e, "units/pers/infantry_archer_e",5,owner);
			
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
			
			let archers_e = TriggerHelper.SpawnUnits(e, "units/pers/infantry_archer_e",fort_size,owner);
			
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
			let archers_e = TriggerHelper.SpawnUnits(c, "units/pers/kardakes_hoplite",10,p);
			
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(c,true);
			}
		}
	}
}	




Trigger.prototype.HorseCheck = function(data)
{
	for (let p of [0])
	{
		let animals = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Animal").filter(TriggerHelper.IsInWorld);
		
		let horses = [];
		
		for (let a of animals)
		{
			let id = Engine.QueryInterface(a, IID_Identity);
			if (id.template.SpecificName == "Equus ferus caballus")
			{
				//warn("Found horse");
				horses.push(a);
			}
		}
		
		//warn("Found "+horses.length+" horses");
		
		if (horses.length < 300 && horses.length > 0)
		{
			//with small probability reproduce
			let rate = 0.05;
			
			let new_horses = Math.round((horses.length*rate)+1);
			
			//warn("Adding "+new_horses);
			for (let i = 0; i < new_horses; i ++)
			{
				TriggerHelper.SpawnUnits(pickRandom(horses),"gaia/fauna_horse",1,0);	
			}
		}
	}
}

Trigger.prototype.StructureDecayCheck = function(data)
{
	for (let p of [6])
	{
		let structs = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Structure").filter(TriggerHelper.IsInWorld);
		//warn("checking decay");
		
		
		for (let s of structs)
		{
			var cmpCapt = Engine.QueryInterface(s, IID_Capturable);
			if (cmpCapt)
			{
				let c_points = cmpCapt.GetCapturePoints();
				
				//warn("capture points: "+uneval(cmpCapt.GetCapturePoints()));
				//warn("max: "+uneval(cmpCapt.GetMaxCapturePoints()));
				
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



Trigger.prototype.VictoryTextFn = function(n)
{
	return markForPluralTranslation(
          "%(lastPlayer)s has won (game mode).",
         "%(players)s and %(lastPlayer)s have won (game mode).",
          n);
}

Trigger.prototype.IdleUnitCheck = function(data)
{
	this.idleCheckCounter += 1;
	
	//check if there are enemy civil centres
	let found_ccs = false;
	for (let p of [2,4,5])
	{
		let ccs = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "CivilCentre").filter(TriggerHelper.IsInWorld);
	//	warn(uneval(ccs.length));
						
		if (ccs.length > 0)
			found_ccs = true;
	}
	
	if (!found_ccs)
	{
		TriggerHelper.SetPlayerWon(1,this.VictoryTextFn,this.VictoryTextFn);	
	}
	
}




Trigger.prototype.PatrolOrderList = function(units,p,patrolTargets)
{
	
	if (units.length <= 0)
		return;
		
	//warn("targets: "+uneval(patrolTargets));

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


Trigger.prototype.pickRandomK = function(inputs,K)
{
	let subset = [];
	
	while (subset.length < K)
	{
		let next = pickRandom(inputs);
		
		if (subset.indexOf(next) < 0)
		{
			subset.push(next);
		}
	}
	
	return subset;
	
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


Trigger.prototype.SpawnTraders = function(data)
{
	//we spawn traders for players 2,4, and 5
	for (let p of [2,4,5])
	{
		//make list of own markets
		let markets_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Trade").filter(TriggerHelper.IsInWorld);
	
		if (markets_p.length > 0)
		{
			//make list of traders
			let traders_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Trader+!Ship").filter(TriggerHelper.IsInWorld);
			
			if (traders_p.length < 12)
			{
				//make list of others markets
				let markets_others = [];
				let trading_partners = [2,4,5,6];
				for (let p2 of trading_partners)
				{
					if (p2 != p)
					{
						let markets_p2 = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p2), "Trade+!Dock").filter(TriggerHelper.IsInWorld);
							
						markets_others = markets_others.concat(markets_p2);
					}
				}
				
				if (markets_others.length > 0)
				{
				
					let site = pickRandom(markets_p);
						
					//warn("Spawning trader for crete");
					let trader = TriggerHelper.SpawnUnits(site,"units/pers/support_trader",1,p);
						
					let cmpUnitAI = Engine.QueryInterface(trader[0], IID_UnitAI);
					
					cmpUnitAI.UpdateWorkOrders("Trade");
					cmpUnitAI.SetupTradeRoute(pickRandom(markets_others),site,null,true);
					
				}
			}
		}
		
	}
	
	this.DoAfterDelay(45 * 1000, "SpawnTraders",null);
}




Trigger.prototype.RangeActionDock = function(data)
{
	if (this.dockOffer == true)
	{
		let cost = Math.round(this.dockBaseCost + this.dockBaseCost * Math.floor(Math.random()*5));
		
		//warn("cost = "+cost);
		//check if player has enouggh food and metal
		let cmpPlayer = QueryPlayerIDInterface(1);
		let resources = cmpPlayer.GetResourceCounts();
		if (resources.stone > cost)
		{
			let offer_food = Math.round(cost * this.stoneToFoodFactor);
			
			let text = "Greetings, Macedonians. We're always happy to trade. We're willing to exchange "+offer_food+ " for "+cost +" stone, should you have it. Let us know and either way, come back again soon!";
			
			//store offer information
			this.dockOfferFood = offer_food;
			this.dockCostStone = cost;
			this.dockDialogActive = true;
			
			//make offer go false
			this.dockOffer = false;
			this.DoAfterDelay(45 * 1000, "StartOffer",null);
			
			this.ShowText(text,"Yes, I agree.","Not this time");
		}
	}
	
}


Trigger.prototype.RangeActionWorkshop = function(data)
{
	if (this.workshopOffer == true)
	{
		//find out what the cost factor shouold be -- the more siege player 1 has, the more expensive to buy new one
		let siege = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1),"Siege").filter(TriggerHelper.IsInWorld);
		
		let cost = this.workshopBaseCost * Math.pow(this.workshopSizeFactor,siege.length);
		
		//warn("cost = "+cost);
		
		//check if player has enouggh food and metal
		let cmpPlayer = QueryPlayerIDInterface(1);
		let resources = cmpPlayer.GetResourceCounts();
		if (resources.food > cost && resources.metal > Math.round(cost*0.5))
		{
			//select random template
			let templates = ["units/mace/siege_ram","units/mace/siege_lithobolos_packed","units/mace/siege_oxybeles_packed"];
			let names = ["Siege Ram","Catapult","Bolt Shooter"];
			let piece = pickRandom(templates);
			let name =  names[templates.indexOf(piece)];
			
			let text = "The craftsmen at the shop have an offer for you -- they will produce a "+name+" in exchange for "+cost+" food and "+Math.round(cost*0.5)+" metal. Let us know if you agree with the exhcnage. Either way, come by again soon, we may have another offer for you.";
			
			//store offer information
			this.workshopOfferPiece = piece;
			this.workshopOfferFoodCost = cost;
			this.workshopOfferMetalCost = Math.round(cost*0.5);
			this.workshopDialogActive = true;
			
			//make offer go false
			this.workshopOffer = false;
			this.DoAfterDelay(45 * 1000, "StartOffer",null);
			
			this.ShowText(text,"Yes, I agree.","Not this time");
		}
		
	}
	
	
}


Trigger.prototype.StartOffer = function(data)
{
	this.workshopOffer = true;
	this.dockOffer = true;
}

Trigger.prototype.ResearchTechs = function(data)
{
	for (let p of [1])
	{
	
		let cmpPlayer = QueryPlayerIDInterface(p);
		let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
		
		if (p == 1)
		{
			cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_01");
			cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_02");
			cmpTechnologyManager.ResearchTechnology("soldier_resistance_pierce_01");
			cmpTechnologyManager.ResearchTechnology("soldier_resistance_pierce_02");
			
			cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_01");
			cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_02");
			cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_01");
			cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_02");

			cmpTechnologyManager.ResearchTechnology("nisean_horses");
			cmpTechnologyManager.ResearchTechnology("cavalry_movement_speed");
			cmpTechnologyManager.ResearchTechnology("cavalry_health");
			
			cmpTechnologyManager.ResearchTechnology("siege_attack");
	
		}
		else if (p == 2)
		{
			//give some trade gains
			cmpTechnologyManager.ResearchTechnology("trade_gain_01");
			cmpTechnologyManager.ResearchTechnology("trade_gain_02");
		}
		else if (p == 4 || p ==5 || p == 6)
		{
			cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_01");
			cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_02");
			cmpTechnologyManager.ResearchTechnology("soldier_resistance_pierce_01");
			cmpTechnologyManager.ResearchTechnology("soldier_resistance_pierce_02");
			
			cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_01");
			cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_02");
			cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_01");
			cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_02");
		}
		
	}

}


Trigger.prototype.SpawnInfiltrators = function(data)
{
	//send all idle units to attack
	let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(7),"Infantry").filter(TriggerHelper.IsInWorld);
		
	for (let u of units)
	{
		let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
		if (cmpUnitAI)
		{
			if (cmpUnitAI.IsIdle())
			{
				//warn("Found idle soldier");
				this.WalkAndFightClosestTarget(u,3,unitTargetClass);
			}
		}
	}
	
	//spawn sites
	let houses = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(3), "House").filter(TriggerHelper.IsInWorld);
	
	//rebel templates
	let templates = ["units/pers/infantry_archer_e","units/pers/infantry_spearman_e","units/pers/infantry_javelineer_e","units/pers/infantry_spearman_a","units/pers/kardakes_hoplite"]
	
	let num_rebels = 45;
	
	for (let i = 0; i < num_rebels; i ++)
	{
		TriggerHelper.SpawnUnits(pickRandom(houses),pickRandom(templates),1,7);
	}
	
	
}

{
	let cmpTrigger = Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger);


	//some templates
	
	//some variables

	
	//some state variables
	cmpTrigger.workshopOffer = true;
	cmpTrigger.workshopBaseCost = 300;
	cmpTrigger.workshopCostFactor = 1.025;
	cmpTrigger.workshopSizeFactor = 1.03;
	cmpTrigger.workshopOfferFoodCost = 0;
	cmpTrigger.workshopOfferMetalCost = 0;
	cmpTrigger.workshopDialogActive = false;
	
	cmpTrigger.stoneToFoodFactor = 6.0;
	cmpTrigger.dockBaseCost = 100;
	cmpTrigger.dockOfferFood = 0;
	cmpTrigger.dockCostStone = 0;
	cmpTrigger.dockOffer = true;
	cmpTrigger.dockDialogActive = false;
	
	cmpTrigger.idleCheckCounter = 0;
	
	//garrison towers
	//warn("Garrisoning entities");
	cmpTrigger.DoAfterDelay(5 * 1000,"GarrisonEntities",null);
	
	//start spawning traders
	cmpTrigger.DoAfterDelay(5 * 1000, "SpawnTraders",null);
	
	//schedule infiltrators
	cmpTrigger.DoAfterDelay(5 * 1000, "SpawnInfiltrators",null);

	
	
	//start techs
	cmpTrigger.DoAfterDelay(1 * 1000,"ResearchTechs",null);
	
		
	
	//set diplomacy
	//everyone is neutral towards 6 except player 1
	for (let p of [1,2,3,4,5,7])
	{
		let cmpPlayer = QueryPlayerIDInterface(p);
		if (p != 1)
			cmpPlayer.SetNeutral(6);
		else
			cmpPlayer.SetAlly(6);

	}
	
	//6 is neutral towards all else
	for (let p of [6])
	{
		let cmpPlayer = QueryPlayerIDInterface(p);
		cmpPlayer.SetAlly(1);
		cmpPlayer.SetNeutral(2);
		cmpPlayer.SetNeutral(3);
		cmpPlayer.SetNeutral(4);
		cmpPlayer.SetNeutral(5);
		cmpPlayer.SetNeutral(7);
	}

	for (let p of [1,2,3,4,5,7])
	{
		let cmpPlayer = QueryPlayerIDInterface(p);
		
		//for players 3,4,5,6 disable templates
		
		//disable templates
		let disTemplates = ["structures/" + QueryPlayerIDInterface(p, IID_Identity).GetCiv() + "/civil_centre","structures/" + QueryPlayerIDInterface(p, IID_Identity).GetCiv() + "/dock"];
		
		let hero_templates = TriggerHelper.GetTemplateNamesByClasses("Hero", QueryPlayerIDInterface(p, IID_Identity).GetCiv(), undefined, undefined, true);
		disTemplates = disTemplates.concat(hero_templates);
		
		cmpPlayer.SetDisabledTemplates(disTemplates);
			
		//disable shared drop sites for player 1
		if (p == 1)
		{
			cmpPlayer.SetDisabledTechnologies(["unlock_shared_dropsites"]);
		}
		
	
		let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
		
		cmpTechnologyManager.ResearchTechnology("phase_town_generic");
		cmpTechnologyManager.ResearchTechnology("phase_city_generic");
		
		if (p != 1)
		{
			cmpTechnologyManager.ResearchTechnology("trade_commercial_treaty");
			cmpTechnologyManager.ResearchTechnology("trade_gain_01");
			cmpTechnologyManager.ResearchTechnology("trade_gain_02");
		}
		
		if (p == 1)
		{
			cmpTechnologyManager.ResearchTechnology("unlock_shared_los");
			cmpPlayer.SetPopulationBonuses(300);
		}
		else if (p == 6)
		{
			cmpPlayer.SetPopulationBonuses(300);
		}
	}
	
	
	cmpTrigger.RegisterTrigger("OnInterval", "StructureDecayCheck", {
		"enabled": true,
		"delay": 5 * 1000,
		"interval": 5 * 1000,
	});
	
	cmpTrigger.RegisterTrigger("OnInterval", "HorseCheck", {
		"enabled": true,
		"delay": 30 * 1000,
		"interval": 60 * 1000,
	});
	
	cmpTrigger.RegisterTrigger("OnInterval", "IdleUnitCheck", {
		"enabled": true,
		"delay": 1 * 1000,
		"interval": 15 * 1000,
	});
	
	cmpTrigger.RegisterTrigger("OnRange", "RangeActionWorkshop", {
		"entities": cmpTrigger.GetTriggerPoints(triggerPointWorkshop), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 25,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});
	
	cmpTrigger.RegisterTrigger("OnRange", "RangeActionDock", {
		"entities": cmpTrigger.GetTriggerPoints(triggerPointDock), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 25,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});
	
	
	// Activate all possible triggers
	let data = { "enabled": true };
	
	cmpTrigger.RegisterTrigger("OnPlayerCommand", "PlayerCommandAction", data);
	
	
	//cmpTrigger.RegisterTrigger("OnStructureBuilt", "StructureBuiltAction", data);
	cmpTrigger.RegisterTrigger("OnOwnershipChanged", "OwnershipChangedAction", data);
	
	/*cmpTrigger.DoAfterDelay(300 * 1000,"SpawnAlliedInvasionAttack",null);*/
	
	
	
};
