warn("loading the triggers file");

///////////////////////
// Trigger listeners //
///////////////////////

/**
 * Which entities units should focus when attacking and patrolling.
 */
var unitTargetClass = "Unit+!Ship";

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


Trigger.prototype.CavalryAttack = function(data)
{
	//check if player 3 is around
	var all_ents = TriggerHelper.GetEntitiesByPlayer(3);	
	if (all_ents.length == 0)
	{
		return;
	}


	// get target position
	var cmpTargetPosition = Engine.QueryInterface(2747, IID_Position).GetPosition2D();
	
	//check if any idle soldiers are around and ask them to attack
	for (let i = 0; i < all_ents.length; ++i)
	{
		let cmpUnitAI = Engine.QueryInterface(all_ents[i], IID_UnitAI);
		if (cmpUnitAI)
		{
			if (cmpUnitAI.IsIdle() && Engine.QueryInterface(all_ents[i], IID_Attack))
			{
				//warn("found idle soldier")
				cmpUnitAI.WalkAndFight(cmpTargetPosition.x,cmpTargetPosition.y,null);
			}
		}
	}


	//spawn attacking party
	var ents1 = TriggerHelper.SpawnUnits(2911,"units/mace/cavalry_spearman_a",this.spawnCavCount,3);
	var ents2 = TriggerHelper.SpawnUnits(2911,"units/mace/cavalry_javelineer_a",this.spawnCavCount,3);
	var full_list = ents1.concat(ents2);

	//warn(uneval(full_list));
	//warn(uneval(cmpTargetPosition.GetPosition2D()));	

	//set formation
	TriggerHelper.SetUnitFormation(3, full_list, "special/formations/column_closed");

	let targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), unitTargetClass);
	let closestTarget;
	let minDistance = Infinity;
	
	for (let target of targets)
	{
		if (!TriggerHelper.IsInWorld(target))
			continue;

		let targetDistance = PositionHelper.DistanceBetweenEntities(full_list[0], target);
		if (targetDistance < minDistance)
		{
			closestTarget = target;
			minDistance = targetDistance;
		}
	}

	ProcessCommand(3, {
		"type": "attack",
		"entities": full_list,
		"target": closestTarget,
		"queued": true,
		"allowCapture": false
	});

	/*for (let i = 0; i < full_list.length; ++i)
	{
		let cmpUnitAI = Engine.QueryInterface(full_list[i], IID_UnitAI);
		if (cmpUnitAI)
		{
			//var targets_i = cmpUnitAI.FindWalkAndFightTargets(full_list[i]);			
			cmpUnitAI.SwitchToStance("violent");
			//cmpUnitAI.Attack(2747);
			cmpUnitAI.WalkAndFight(cmpTargetPosition.x,cmpTargetPosition.y,null);
			//warn(uneval(targets_i));
		}
	}*/
	

	// try out the dialog
	/*var cmpGUIInterface = Engine.QueryInterface(SYSTEM_ENTITY, IID_GuiInterface);
	cmpGUIInterface.PushNotification({
		"type": "dialog",
		"players": [1,2,3,4,5,6,7,8],
		"dialogName": "yes-no",
		"data": {
			"text": {
				"caption": {
					"message": markForTranslation("Testing the yes-no dialog. Do you want to say sure or rather not?"),
					"translateMessage": true,
				},
			},
			"button1": {
				"caption": {
					"message": markForTranslation("Sure"),
					"translateMessage": true,
				},
				"tooltip": {
					"message": markForTranslation("Say sure"),
					"translateMessage": true,
				},
			},
			"button2": {
				"caption": {
					"message": markForTranslation("Rather not"),
					"translateMessage": true,
				},
				"tooltip": {
					"message": markForTranslation("Say rather not"),
					"translateMessage": true,
				},
			},

		},
	});*/
};

Trigger.prototype.InfantryAttack = function(data)
{
	//check if player 3 is around
	var all_ents = TriggerHelper.GetEntitiesByPlayer(3);	
	if (all_ents.length == 0)
	{
		return;
	}
	
	// get target position
	var cmpTargetPosition = Engine.QueryInterface(2747, IID_Position).GetPosition2D();
	
	//check if any idle soldiers are around and ask them to attack
	for (let i = 0; i < all_ents.length; ++i)
	{
		let cmpUnitAI = Engine.QueryInterface(all_ents[i], IID_UnitAI);
		if (cmpUnitAI)
		{
			if (cmpUnitAI.IsIdle() && Engine.QueryInterface(all_ents[i], IID_Attack))
			{
				//warn("found idle soldier")
				cmpUnitAI.WalkAndFight(cmpTargetPosition.x,cmpTargetPosition.y,null);
			}
		}
	}


	//spawn attacking party
	var ents1 = TriggerHelper.SpawnUnits(2906,"units/mace/infantry_pikeman_b",this.spawnInfCount+3,3);
	var ents2 = TriggerHelper.SpawnUnits(2906,"units/mace/infantry_javelineer_b",this.spawnInfCount+3,3);
	var ents3 = TriggerHelper.SpawnUnits(2906,"units/mace/infantry_archer_b",this.spawnInfCount+3,3);
	var full_list = ents1.concat(ents2,ents3);

	//warn(uneval(full_list));
	//warn(uneval(cmpTargetPosition.GetPosition2D()));	

	//set formation
	TriggerHelper.SetUnitFormation(3, full_list, "special/formations/box");

	let targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), unitTargetClass);
	let closestTarget;
	let minDistance = Infinity;
	
	for (let target of targets)
	{
		if (!TriggerHelper.IsInWorld(target))
			continue;

		let targetDistance = PositionHelper.DistanceBetweenEntities(full_list[0], target);
		if (targetDistance < minDistance)
		{
			closestTarget = target;
			minDistance = targetDistance;
		}
	}

	ProcessCommand(3, {
		"type": "attack",
		"entities": full_list,
		"target": closestTarget,
		"queued": true,
		"allowCapture": false
	});


	/*for (let i = 0; i < full_list.length; ++i)
	{
		let cmpUnitAI = Engine.QueryInterface(full_list[i], IID_UnitAI);
		if (cmpUnitAI)
		{
			//var targets_i = cmpUnitAI.FindWalkAndFightTargets(full_list[i]);			
			cmpUnitAI.SwitchToStance("violent");
			//cmpUnitAI.Attack(2747);
			cmpUnitAI.WalkAndFight(cmpTargetPosition.x,cmpTargetPosition.y,null);
			//warn(uneval(targets_i));
		}
	}*/
	

	// try out the dialog
	/*var cmpGUIInterface = Engine.QueryInterface(SYSTEM_ENTITY, IID_GuiInterface);
	cmpGUIInterface.PushNotification({
		"type": "dialog",
		"players": [1,2,3,4,5,6,7,8],
		"dialogName": "yes-no",
		"data": {
			"text": {
				"caption": {
					"message": markForTranslation("Testing the yes-no dialog. Do you want to say sure or rather not?"),
					"translateMessage": true,
				},
			},
			"button1": {
				"caption": {
					"message": markForTranslation("Sure"),
					"translateMessage": true,
				},
				"tooltip": {
					"message": markForTranslation("Say sure"),
					"translateMessage": true,
				},
			},
			"button2": {
				"caption": {
					"message": markForTranslation("Rather not"),
					"translateMessage": true,
				},
				"tooltip": {
					"message": markForTranslation("Say rather not"),
					"translateMessage": true,
				},
			},

		},
	});*/
};

Trigger.prototype.SetDifficultyLevel = function(data)
{
	//Very Hard: 1.56; Hard: 1.25; Medium 1
	
	//player 2
	let cmpPlayer = QueryPlayerIDInterface(2);

	
	let tower_garrison_count = 0;
	let walltower_garrison_count = 0;
	
	/*let ai_mult = cmpPlayer.GetGatherRateMultiplier();
	
	let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
	
	//process difficulty levels
	if (ai_mult == 1.25)
	{
		tower_garrison_count = 2;
		
		//add some tech
		cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_01");
		cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_01");
	}
	else if (ai_mult >= 1.5)
	{
		tower_garrison_count = 4;
		walltower_garrison_count = 1
		
		//add some tech
		cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_01");
		cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_02");
		cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_01");
		cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_02");
	}
	
	//player 3
	cmpPlayer = QueryPlayerIDInterface(3);
	ai_mult = cmpPlayer.GetGatherRateMultiplier();
	cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
	
	//process difficulty levels
	if (ai_mult == 1.25)
	{
		this.spawnInfCount += 1;
		this.spawnCavCount += 1;
		
		//add some tech
		cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_01");
		cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_01");
	}
	else if (ai_mult >= 1.5)
	{
		this.spawnInfCount += 3;
		this.spawnCavCount += 4;
		
		//add some tech
		cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_01");
		cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_02");
		cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_01");
		cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_02");
	}*/
	
	//garrison towers
	let towers_p = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(2), "GarrisonTower").filter(TriggerHelper.IsInWorld);
	for (let e of towers_p)
	{
		let archers_e = TriggerHelper.SpawnUnits(e, "units/athen/champion_ranged",5,2);
			
		for (let a of archers_e)
		{
			let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
			cmpUnitAI.Garrison(e,true);
		}
	}
	
	let towers_w = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(2), "Defensive+Tower+!Outpost+!GarrisonTower").filter(TriggerHelper.IsInWorld);
	for (let e of towers_w)
	{
		//spawn the garrison inside the tower
		let archers_e = TriggerHelper.SpawnUnits(e, "units/athen/champion_ranged",2,2);
			
		for (let a of archers_e)
		{
			let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
			cmpUnitAI.Garrison(e,true);
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

Trigger.prototype.VictoryCheck = function(data)
{
	//check to make sure player 3 has at least 1 structure left
	let ccs = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(2), "CivilCentre").filter(TriggerHelper.IsInWorld);
	if (ccs.length <= 0)
	{
		TriggerHelper.SetPlayerWon(1,this.VictoryTextFn,this.VictoryTextFn);	
	}
	
}

Trigger.prototype.RangeAction = function(data)
{
	//warn("The OnRange event happened with the following data:");
	//warn(uneval(data));
};

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
	cmpTrigger.maxNumberOfTimerTrigger = 1000; // execute it that many times

	//some constants
	cmpTrigger.spawnInfCount = 5;
	cmpTrigger.spawnCavCount = 6;

	//warn(uneval(cmpTrigger.GetDifficulty()));

	cmpTrigger.DoAfterDelay(5 * 1000,"SetDifficultyLevel",null);
	
	//schedule first attack
	cmpTrigger.DoAfterDelay(30 * 1000,"InfantryAttack",null);
	
	//schedule cavalry attack
	cmpTrigger.DoAfterDelay(50 * 1000,"CavalryAttack",null);
	
	cmpTrigger.RegisterTrigger("OnInterval", "VictoryCheck", {
		"enabled": true,
		"delay": 15 * 1000,
		"interval": 15 * 1000,
	});
	
	//disable templates

	/*cmpTrigger.RegisterTrigger("OnInterval", "IntervalActionCavAttack", {
		"enabled": true,
		"delay": 45 * 1000,
		"interval": 90 * 1000,
	});*/


	/*cmpTrigger.RegisterTrigger("OnInterval", "IntervalAction", {
		"enabled": true,
		"delay": 30 * 1000,
		"interval": 60 * 1000,
	});*/

	/*cmpTrigger.RegisterTrigger("OnRange", "RangeAction", {
		"entities": cmpTrigger.GetTriggerPoints("A"), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 40,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true,
	});*/
};
