warn("loading the triggers file");

// /////////////////////
// Trigger listeners //
// /////////////////////

// every function just logs when it gets fired, and shows the data
Trigger.prototype.StructureBuiltAction = function(data)
{
	// warn("The OnStructureBuilt event happened with the following data:");
	// warn(uneval(data));
};

Trigger.prototype.ConstructionStartedAction = function(data)
{
	// warn("The OnConstructionStarted event happened with the following data:");
	// warn(uneval(data));
};

Trigger.prototype.TrainingFinishedAction = function(data)
{
	// warn("The OnTrainingFinished event happened with the following data:");
	// warn(uneval(data));
};

Trigger.prototype.TrainingQueuedAction = function(data)
{
	// warn("The OnTrainingQueued event happened with the following data:");
	// warn(uneval(data));
};

Trigger.prototype.ResearchFinishedAction = function(data)
{
	// warn("The OnResearchFinished event happened with the following data:");
	// warn(uneval(data));
};

Trigger.prototype.ResearchQueuedAction = function(data)
{
	// warn("The OnResearchQueued event happened with the following data:");
	// warn(uneval(data));
};

Trigger.prototype.OwnershipChangedAction = function(data)
{
	// warn("The OnOwnershipChanged event happened with the following data:");
	// warn(uneval(data));
};

Trigger.prototype.PlayerCommandAction = function(data)
{
	// warn("The OnPlayerCommand event happened with the following data:");
	// warn(uneval(data));
};

Trigger.prototype.IntervalActionCavAttack = function(data)
{

	// warn("The OnInterval event happened with the following data:");

};

Trigger.prototype.IntervalAction = function(data)
{
	warn("The OnInterval event happened with the following data:");
	warn(uneval(data));
};

Trigger.prototype.IntervalActionTraders = function(data)
{

	// warn("The OnInterval event happened with the following data:");
	// warn(uneval(data));
	this.numberOfTimerTrigger++;
	if (this.numberOfTimerTrigger >= this.maxNumberOfTimerTrigger)
		this.DisableTrigger("OnInterval", "IntervalAction");

	// var cmpTrader = Engine.QueryInterface(8050, IID_Trader);
	// cmpTrader.SetTargetMarket(8052,7770);

	// start land traders
	var traders = [8050, 8051];

	for (let i = 0; i < traders.length; ++i)
	{
		const cmpUnitAI = Engine.QueryInterface(traders[i], IID_UnitAI);
		if (cmpUnitAI)
		{
			// warn("updating worker orders");
			cmpUnitAI.UpdateWorkOrders("Trade");
			cmpUnitAI.SetupTradeRoute(8052, 7770, null, true);
		}
	}

	// start ship traders
	var ships_g = [7759, 7760];
	for (let i = 0; i < ships_g.length; ++i)
	{
		const cmpUnitAI = Engine.QueryInterface(ships_g[i], IID_UnitAI);
		if (cmpUnitAI)
		{
			// warn("updating ship orders");
			cmpUnitAI.UpdateWorkOrders("Trade");
			cmpUnitAI.SetupTradeRoute(7732, 7731, null, true);
		}
	}

	// start ship traders group 2
	var ships_g2 = [8072, 8071, 7864, 7865];
	for (let i = 0; i < ships_g2.length; ++i)
	{
		const cmpUnitAI = Engine.QueryInterface(ships_g2[i], IID_UnitAI);
		if (cmpUnitAI)
		{
			// warn("updating ship orders");
			cmpUnitAI.UpdateWorkOrders("Trade");
			cmpUnitAI.SetupTradeRoute(7731, 7732, null, true);
		}
	}
};

Trigger.prototype.RangeAction = function(data)
{
	warn("The OnRange event happened with the following data:");
	warn(uneval(data));

	if (this.spawnedTraders == false)
	{
		this.spawnedTraders = true;

		TriggerHelper.SpawnUnits(8153, "units/mace/support_trader", 5, 1);
	}
};

Trigger.prototype.GarrisonShips = function(data)
{

	// garrison ships
	const ships = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(4), "Warship").filter(TriggerHelper.IsInWorld);
	for (const e of ships)
	{
		// spawn the garrison inside the ship
		TriggerHelper.SpawnGarrisonedUnits(e, "units/athen/champion_ranged", 4, 4);
	}
};

{
	const cmpTrigger = Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger);

	// Activate all possible triggers
	const data = { "enabled": true };
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

	// garrison ships
	cmpTrigger.DoAfterDelay(5 * 1000, "GarrisonShips", null);

	const cmpPlayer = QueryPlayerIDInterface(1);
	const cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
	cmpTechnologyManager.ResearchTechnology("unlock_shared_los");

	// make traders trade
	// var all_ents = TriggerHelper.GetEntitiesByPlayer(2);

	/* for (let i = 0; i < all_ents.length; i++)
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

	/* cmpTrigger.RegisterTrigger("OnInterval", "IntervalAction", {
		"enabled": true,
		"delay": 10 * 1000,
		"interval": 5 * 1000,
	});*/

	/* cmpTrigger.RegisterTrigger("OnRange", "RangeAction", {
		"entities": cmpTrigger.GetTriggerPoints("A"), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 40,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});*/
}
