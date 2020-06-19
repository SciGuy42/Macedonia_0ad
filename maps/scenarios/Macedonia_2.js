warn("loading the triggers file");

///////////////////////
// Trigger listeners //
///////////////////////

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
};

Trigger.prototype.PlayerCommandAction = function(data)
{
	//warn("The OnPlayerCommand event happened with the following data:");
	//warn(uneval(data));
};


Trigger.prototype.IntervalActionCavAttack = function(data)
{

	//warn("The OnInterval event happened with the following data:");
	warn(uneval(data));
	this.numberOfTimerTrigger++;
	if (this.numberOfTimerTrigger >= this.maxNumberOfTimerTrigger)
		this.DisableTrigger("OnInterval", "IntervalAction");

};

Trigger.prototype.IntervalAction = function(data)
{
	
	//warn("The OnInterval event happened with the following data:");
	//warn(uneval(data));
	this.numberOfTimerTrigger++;
	if (this.numberOfTimerTrigger >= this.maxNumberOfTimerTrigger)
		this.DisableTrigger("OnInterval", "IntervalAction");
	
	//var cmpTrader = Engine.QueryInterface(8050, IID_Trader);
	//cmpTrader.SetTargetMarket(8052,7770);
	
	//start land traders
	var traders = [8050,8051];
	
	for (let i = 0; i < traders.length; ++i)
	{
		let cmpUnitAI = Engine.QueryInterface(traders[i], IID_UnitAI);
		if (cmpUnitAI) {
			//warn("updating worker orders");
			cmpUnitAI.UpdateWorkOrders("Trade");
			cmpUnitAI.SetupTradeRoute(8052,7770,null,true);
		}
	}
	
	//start ship traders
	var ships_g = [7759,7760];
	for (let i = 0; i < ships_g.length; ++i)
	{
		let cmpUnitAI = Engine.QueryInterface(ships_g[i], IID_UnitAI);
		if (cmpUnitAI) {
			//warn("updating ship orders");
			cmpUnitAI.UpdateWorkOrders("Trade");
			cmpUnitAI.SetupTradeRoute(7732,7731,null,true);
		}
	}
	
	//start ship traders group 2
	var ships_g2 = [8072,8071,7864,7865];
	for (let i = 0; i < ships_g2.length; ++i)
	{
		let cmpUnitAI = Engine.QueryInterface(ships_g2[i], IID_UnitAI);
		if (cmpUnitAI) {
			//warn("updating ship orders");
			cmpUnitAI.UpdateWorkOrders("Trade");
			cmpUnitAI.SetupTradeRoute(7731,7732,null,true);
		}
	}
};

Trigger.prototype.RangeAction = function(data)
{
	//warn("The OnRange event happened with the following data:");
	//warn(uneval(data));
	
	if (this.spawnedTraders == false)
	{
		this.spawnedTraders = true;
		
		TriggerHelper.SpawnUnits(8153,"units/mace_support_trader",5,1);
	}
};


Trigger.prototype.SetDifficultyLevel = function(data)
{
	//player 4
	let cmpPlayer = QueryPlayerIDInterface(4);
	let ai_mult = cmpPlayer.GetGatherRateMultiplier();
	let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
	
	let ship_garrison_count = 3;

	//process difficulty levels
	if (ai_mult == 1.25)
	{
		ship_garrison_count = 6;
		
		//add some tech
		cmpTechnologyManager.ResearchTechnology("armor_ship_reinforcedhull");
	
	}
	else if (ai_mult >= 1.5)
	{
		ship_garrison_count = 10;
		
		//add some tech
		cmpTechnologyManager.ResearchTechnology("armor_ship_reinforcedhull");
		cmpTechnologyManager.ResearchTechnology("armor_ship_hypozomata");
	
	}
	
	//garrison ships
	let ships = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(4), "Warship").filter(TriggerHelper.IsInWorld);
	for (let e of ships)
	{
		//spawn the garrison inside the ship
		TriggerHelper.SpawnGarrisonedUnits(e, "units/athen_champion_ranged",ship_garrison_count,4);	
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

	cmpTrigger.numberOfTimerTrigger = 0;
	cmpTrigger.maxNumberOfTimerTrigger = 1; // execute it that many times


	cmpTrigger.spawnedTraders = false;

	cmpTrigger.DoAfterDelay(5 * 1000,"SetDifficultyLevel",null);
	

	/*cmpTrigger.RegisterTrigger("OnInterval", "IntervalActionCavAttack", {
		"enabled": true,
		"delay": 45 * 1000,
		"interval": 90 * 1000,
	});*/
	
	let cmpPlayer = QueryPlayerIDInterface(1);
	cmpPlayer.AddStartingTechnology("unlock_shared_los");
	


	cmpTrigger.RegisterTrigger("OnInterval", "IntervalAction", {
		"enabled": true,
		"delay": 1 * 1000,
		"interval": 60 * 1000,
	});

	//make traders trade
	//var all_ents = TriggerHelper.GetEntitiesByPlayer(2);
	
	

	/*for (let i = 0; i < all_ents.length; i++)
	{
		let cmpUnitAI = Engine.QueryInterface(all_ents[i], IID_UnitAI);
		if (cmpUnitAI)
		{
			if (cmpUnitAI
		}
	}	*/

	cmpTrigger.RegisterTrigger("OnRange", "RangeAction", {
		"entities": cmpTrigger.GetTriggerPoints("A"), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 40,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});
};

