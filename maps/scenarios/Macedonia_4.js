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
	// warn(uneval(data));
	this.numberOfTimerTrigger++;
	if (this.numberOfTimerTrigger >= this.maxNumberOfTimerTrigger)
		this.DisableTrigger("OnInterval", "IntervalAction");

};

Trigger.prototype.IntervalAction = function(data)
{

	// warn("The OnInterval event happened:");
	// warn(uneval(data));
	this.numberOfTimerTrigger++;
	if (this.numberOfTimerTrigger >= this.maxNumberOfTimerTrigger)
		this.DisableTrigger("OnInterval", "IntervalAction");

	var enemy_players = [2, 3];

	for (const enemy_player of enemy_players)
	{

		var enemy_units = TriggerHelper.GetEntitiesByPlayer(enemy_player);
		var human_units = TriggerHelper.GetEntitiesByPlayer(1);

		var d = 0;
		var best_distance = 100000;
		var best_index = -1;

		if (human_units.length > 0)
		{
			for (const enemy_unit of enemy_units)
			{
				const cmpUnitAI = Engine.QueryInterface(enemy_unit, IID_UnitAI);

				// check if the unit is idle and if it can attack
				if (cmpUnitAI)
				{
					const pos_i = Engine.QueryInterface(enemy_unit, IID_Position).GetPosition2D();

					if (cmpUnitAI.IsIdle() && Engine.QueryInterface(enemy_unit, IID_Attack))
					{

						for (const [j, human_unit] of human_units.entries())
						{
							const pos_j = Engine.QueryInterface(human_unit, IID_Position).GetPosition2D();

							d = Math.sqrt((pos_i.x - pos_j.x) * (pos_i.x - pos_j.x) + (pos_i.y - pos_j.y) * (pos_i.y - pos_j.y));

							if (d < best_distance)
							{
								best_distance = d;
								best_index = j;
							}
						}

						cmpUnitAI.SwitchToStance("violent");
						cmpUnitAI.Attack(human_units[best_index]);
					}
				}

				best_distance = 100000;
				best_index = -1;
			}
		}
	}
};

Trigger.prototype.SetDifficultyLevel = function(data)
{
	// Very Hard: 1.56; Hard: 1.25; Medium 1
	const difficulty = "easy";

	for (const player of [2, 3])
	{
		const cmpPlayer = QueryPlayerIDInterface(player);
		const cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);

		// process difficulty levels
		if (difficulty == "medium")
		{
			// add some tech
			cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_01");
			cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_01");
		}
		else if (difficulty == "hard")
		{
			// add some tech
			cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_01");
			cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_02");
			cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_01");
			cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_02");
		}
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
	cmpTrigger.maxNumberOfTimerTrigger = 100; // execute it that many times

	cmpTrigger.DoAfterDelay(5 * 1000, "SetDifficultyLevel", null);

	cmpTrigger.RegisterTrigger("OnInterval", "IntervalAction", {
		"enabled": true,
		"delay": 20 * 1000,
		"interval": 5 * 1000
	});

	// make traders trade
	// var all_ents = TriggerHelper.GetEntitiesByPlayer(2);

}
