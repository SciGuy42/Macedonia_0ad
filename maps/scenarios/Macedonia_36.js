warn("loading the triggers file");

// /////////////////////
// Trigger listeners //
// /////////////////////


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
	"structures/rome/wallset_siege",
	"structures/wallset_palisade",

	// Shoreline
	"structures/" + civ + "/dock",
	"structures/brit/crannog",
	"structures/cart/super_dock",
	"structures/ptol/lighthouse",

	// villagers
	"units/" + civ + "/support_female_citizen"
];




Trigger.prototype.WalkAndFightClosestTarget = function(attacker, target_player, target_class)
{
	let target = this.FindClosestTarget(attacker, target_player, target_class);
	if (!target)
	{
		target = this.FindClosestTarget(attacker, target_player, siegeTargetClass);
	}


	if (target)
	{
		// get target position
		var cmpTargetPosition = Engine.QueryInterface(target, IID_Position).GetPosition2D();


		const cmpUnitAI = Engine.QueryInterface(attacker, IID_UnitAI);
		cmpUnitAI.SwitchToStance("violent");
		cmpUnitAI.WalkAndFight(cmpTargetPosition.x, cmpTargetPosition.y, null);
	}
	else // find a structure
	{


		warn("[ERROR] Could not find closest target to fight: "+attacker+" and "+target_player+" and "+target_class);
	}

};


Trigger.prototype.FindRandomTarget = function(attacker, target_player, target_class)
{

	// let targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(target_player), unitTargetClass);

	const targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(target_player), target_class).filter(TriggerHelper.IsInWorld);

	return pickRandom(targets);
};


Trigger.prototype.FindClosestTarget = function(attacker, target_player, target_class)
{

	// let targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(target_player), unitTargetClass);

	const targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(target_player), target_class).filter(TriggerHelper.IsInWorld);

	let closestTarget;
	let minDistance = Infinity;

	for (const target of targets)
	{
		if (!TriggerHelper.IsInWorld(target))
			continue;

		const targetDistance = PositionHelper.DistanceBetweenEntities(attacker, target);
		if (targetDistance < minDistance)
		{
			closestTarget = target;
			minDistance = targetDistance;
		}
	}

	return closestTarget;
};

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


Trigger.prototype.SpecialAchaeanAssault = function(data)
{
	const owner = 5;
	const target_player = 1;

	// south side -- some infantry
	const num_infantry = 40;

	for (let i = 0; i < num_infantry; i++)
	{
		// spawn unit
		const triggerPoint = pickRandom(this.GetTriggerPoints(triggerPointAch));

		const units_i = TriggerHelper.SpawnUnits(triggerPoint, pickRandom(this.achaeanAttackTemplates), 1, owner);

		// make it fight
		this.WalkAndFightClosestTarget(units_i[0], target_player, "Unit");
	}
};

Trigger.prototype.SpecialArcadianAssault = function(data)
{
	const owner = 6;
	const target_player = 1;

	// south side -- some infantry
	const num_infantry = 30;

	for (let i = 0; i < num_infantry; i++)
	{
		// spawn unit
		const triggerPoint = pickRandom(this.GetTriggerPoints(triggerPointArc));

		const units_i = TriggerHelper.SpawnUnits(triggerPoint, pickRandom(this.arcadiaAttackTemplates), 1, owner);

		// make it fight
		this.WalkAndFightClosestTarget(units_i[0], target_player, "Unit");
	}
};


Trigger.prototype.ReserveInfantryAttack = function(data)
{
	// get all cavalry by reserve forces
	const p = 4;
	const all_infantry = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Infantry").filter(TriggerHelper.IsInWorld);

	// see if we need to split them in two

	// get target
	const target = 1839; // alexander
	const target_pos = TriggerHelper.GetEntityPosition2D(target);

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

	// TO DO: from now on, do idle check on cavalry


};

Trigger.prototype.ReserveCavalryAttack = function(data)
{
	// get all cavalry by reserve forces
	const p = 4;
	const attackers = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Cavalry").filter(TriggerHelper.IsInWorld);

	// get target
	const target = 1839; // alexander
	const target_pos = TriggerHelper.GetEntityPosition2D(target);

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

	// TO DO: from now on, do idle check on cavalry


};


Trigger.prototype.VictoryTextFn = function(n)
{
	return markForPluralTranslation(
		"%(lastPlayer)s has won (game mode).",
		"%(players)s and %(lastPlayer)s have won (game mode).",
		n);
};


Trigger.prototype.LoseGame = function(data)
{


	TriggerHelper.SetPlayerWon(2, this.VictoryTextFn, this.VictoryTextFn);


};


Trigger.prototype.OwnershipChangedAction = function(data)
{
	// warn("The OnOwnershipChanged event happened with the following data:");
	// warn(uneval(data));

	if ((data.entity == this.heroID1 || data.entity == this.heroID2) && data.to == -1)
	{
		// lose game
		this.ShowText("We have lost a hero. We must retreat.", "Darn", "WTF?");

		this.DoAfterDelay(5 * 1000, "LoseGame", null);

	}

	// macedonians lost unit
	if (data.from == 3 && data.to == -1)
	{
		this.maceKilled += 1;

		if (this.maceKilled > this.maceKilledThreshold && this.gameLost == false)
		{
			this.ShowText("We have lost too many. We must retreat.", "Darn", "WTF?");

			this.DoAfterDelay(5 * 1000, "LoseGame", null);

			this.gameLost = true;
		}

	}




};




// garison AI entities with archers
Trigger.prototype.GarrisonEntities = function(data)
{

	for (const p of [1, 4])
	{
		const towers_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "GarrisonTower").filter(TriggerHelper.IsInWorld);

		for (const e of towers_p)
		{
			// spawn the garrison inside the tower
			const archers_e = TriggerHelper.SpawnUnits(e, "units/athen/champion_infantry", 5, p);

			for (const a of archers_e)
			{
				const cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(e, true);
			}
		}

		// FORTRESS
		const forts_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Fortress").filter(TriggerHelper.IsInWorld);
		const fort_size = 20;

		for (const e of forts_p)
		{
			// spawn the garrison inside the tower

			const archers_e = TriggerHelper.SpawnUnits(e, "units/athen/champion_ranged", fort_size, p);

			for (const a of archers_e)
			{
				const cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(e, true);
			}
		}

		// wall towers
		if (p == 5)
		{
			const towers_w = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Defensive+Tower+!Outpost+!GarrisonTower").filter(TriggerHelper.IsInWorld);
			for (const e of towers_w)
			{
				// spawn the garrison inside the tower
				const archers_e = TriggerHelper.SpawnUnits(e, "units/athen/champion_ranged", 2, p);

				for (const a of archers_e)
				{
					const cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
					cmpUnitAI.Garrison(e, true);
				}
			}
		}

		const camps_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "MercenaryCamp").filter(TriggerHelper.IsInWorld);

		for (const c of camps_p)
		{
			// spawn the garrison inside the tower
			const archers_e = TriggerHelper.SpawnUnits(c, "units/athen/champion_ranged", 5, p);

			for (const a of archers_e)
			{
				const cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(c, true);
			}
		}

		// outpost
		const outposts_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Outpost").filter(TriggerHelper.IsInWorld);

		for (const c of outposts_p)
		{
			// spawn the garrison inside the tower
			const archers_e = TriggerHelper.SpawnUnits(c, "units/athen/champion_ranged", 1, p);

			for (const a of archers_e)
			{
				const cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(c, true);
			}
		}
	}
};


// healers
Trigger.prototype.HealersAdvanceDebug = function(data)
{
	const p = 1;

	const healers = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Healer").filter(TriggerHelper.IsInWorld);

	for (const u of healers)
	{
		const cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
		if (cmpUnitAI)
		{
			if (cmpUnitAI.IsIdle())
			{
				// warn("Found idle persia inf or cav");
				this.WalkAndFightClosestTarget(u, 2, unitTargetClass);
			}
		}
	}
};

Trigger.prototype.IdleUnitCheck = function(data)
{
	if (this.infIdleCheck == true && this.cavIdleCheck == true)
	{
		const target_p = 4;
		const p = 7;
		// main persia infantry and cavalry
		const units_inf = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Infantry").filter(TriggerHelper.IsInWorld);
		const units_cav = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Cavalry").filter(TriggerHelper.IsInWorld);

		const units_all = units_inf.concat(units_cav);

		for (const u of units_all)
		{
			const cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI)
			{
				if (cmpUnitAI.IsIdle())
				{
					// warn("Found idle persia inf or cav");
					this.WalkAndFightClosestTarget(u, target_p, unitTargetClass);
				}
			}
		}
	}

	if (this.charIdleCheck == true) // chariots
	{
		const owner = 2;
		const target_player = 4;

		// find all infantry
		const units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(owner), "Chariot+!Hero").filter(TriggerHelper.IsInWorld);

		for (const u of units)
		{
			// check if idle
			const cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI)
			{
				if (cmpUnitAI.IsIdle())
				{

					// set to walk and attack
					this.WalkAndFightClosestTarget(u, target_player, siegeTargetClass);
				}
			}
		}

	}

	if (this.eleIdleCheck == true) // elephants
	{
		const owner = 6;
		const target_player = 4;

		const units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(owner), "Elephant").filter(TriggerHelper.IsInWorld);

		for (const u of units)
		{
			// check if idle
			const cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI)
			{
				if (cmpUnitAI.IsIdle())
				{

					// set to walk and attack
					this.WalkAndFightClosestTarget(u, target_player, siegeTargetClass);
				}
			}
		}

	}

	if (this.indianCavIdleCheck == true) // indian cavalry
	{
		const p = 6;
		const target_player = 1;

		// find all cavalry
		const units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Cavalry").filter(TriggerHelper.IsInWorld);

		for (const u of units)
		{
			// check if idle
			const cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI)
			{
				if (cmpUnitAI.IsIdle())
				{

					// set to walk and attack
					this.WalkAndFightClosestTarget(u, target_player, unitTargetClass);
				}
			}
		}
	}

	if (this.indianInfIdleCheck == true) // indian infantry
	{
		const p = 6;
		const target_player = 1;

		// find all cavalry
		const units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Infantry").filter(TriggerHelper.IsInWorld);

		for (const u of units)
		{
			// check if idle
			const cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI)
			{
				if (cmpUnitAI.IsIdle())
				{

					// set to walk and attack
					this.WalkAndFightClosestTarget(u, target_player, unitTargetClass);
				}
			}
		}

	}

	if (this.greekInfIdleCheck == true) // greek mercs
	{
		const p = 5;
		const target_player = 1;

		// find all cavalry
		const units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Infantry").filter(TriggerHelper.IsInWorld);

		for (const u of units)
		{
			// check if idle
			const cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI)
			{
				if (cmpUnitAI.IsIdle())
				{

					// set to walk and attack
					this.WalkAndFightClosestTarget(u, target_player, unitTargetClass);
				}
			}
		}

	}


	if (this.dariusdleCheck == true)
	{
		const owner = 2;
		const target_player = 1;

		// find all units
		const units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(owner), "Unit").filter(TriggerHelper.IsInWorld);

		for (const u of units)
		{
			// check if idle
			const cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI)
			{
				if (cmpUnitAI.IsIdle())
				{

					// set to walk and attack
					this.WalkAndFightClosestTarget(u, target_player, unitTargetClass);
				}
			}
		}
	}

	/* for (let p of [6])
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
	}*/
};


Trigger.prototype.ShowText = function(text, option_a, option_b)
{
	var cmpGUIInterface = Engine.QueryInterface(SYSTEM_ENTITY, IID_GuiInterface);
	cmpGUIInterface.PushNotification({
		"type": "dialog",
		"players": [1, 2, 3, 4, 5, 6, 7, 8],
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

};

Trigger.prototype.PlayerCommandAction = function(data)
{


	if (data.cmd.type == "dialog-answer")
	{
		// warn("The OnPlayerCommand event happened with the following data:");
		// warn(uneval(data));

		if (data.cmd.answer == "button1") // easy
		{


		}
		else // hard
		{
			// add some techs to enemy
			let cmpPlayer = QueryPlayerIDInterface(7);
			let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);

			cmpTechnologyManager.ResearchTechnology("soldier_resistance_pierce_02");
			cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_02");


			cmpPlayer = QueryPlayerIDInterface(6);
			cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);

			cmpTechnologyManager.ResearchTechnology("soldier_resistance_pierce_02");
			cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_02");

			cmpPlayer = QueryPlayerIDInterface(5);
			cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);

			cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_02");
			cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_02");
			cmpTechnologyManager.ResearchTechnology("attack_soldiers_will");

			cmpPlayer = QueryPlayerIDInterface(2);
			cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);

			cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_02");
			cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_02");
			cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_02");
			cmpTechnologyManager.ResearchTechnology("soldier_resistance_pierce_02");
			cmpTechnologyManager.ResearchTechnology("soldier_resistance_pierce_02");
			cmpTechnologyManager.ResearchTechnology("attack_soldiers_will");

			warn("Difficulty = hard");
		}

	}
};


Trigger.prototype.DifficultyOption = function(data)
{
	this.ShowText("The final showdown is at hand. Choose your difficulty level.", "Easy", "Hard(er)");

};


Trigger.prototype.PatrolOrder = function(units, p, A, B)
{

	if (units.length <= 0)
		return;


	// list of patrol targets
	const patrolTargets = [A, B];

	for (const patrolTarget of patrolTargets)
	{
		const targetPos = TriggerHelper.GetEntityPosition2D(patrolTarget);
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
};



Trigger.prototype.CavalryAttack = function(data)
{
	// check if we have structures left, if not, end
	const p = 5;
	const structures = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Structure").filter(TriggerHelper.IsInWorld);

	if (structures.length == 0)
		return;

	// pick spawn site
	const spawn_site = pickRandom(this.GetTriggerPoints(triggerPointCavalryAttack));

	// how big should the attack be
	const min_size = 20;
	const units_1 = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "Unit").filter(TriggerHelper.IsInWorld);

	let num_attackers = Math.floor(units_1.length / 7.0);
	if (num_attackers < min_size)
		num_attackers = min_size;

	// types
	const cav_templates = TriggerHelper.GetTemplateNamesByClasses("Cavalry", "kush", undefined, undefined, true);
	const attackers = [];

	// spawn attackers
	for (let i = 0; i < num_attackers; ++i)
	{
		const units_i = TriggerHelper.SpawnUnits(spawn_site, pickRandom(cav_templates), 1, p);
		attackers.push(units_i[0]);
	}

	// attack
	// set formation
	TriggerHelper.SetUnitFormation(p, attackers, pickRandom(unitFormations));

	// find target
	const target = this.FindClosestTarget(attackers[0], 1, siegeTargetClass);
	const target_pos = TriggerHelper.GetEntityPosition2D(target);

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
};





Trigger.prototype.AttackCavalryWaveDebug = function(data)
{
	const p = 1;
	const target_player = 2;

	// find all infantry
	const attackers = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Cavalry").filter(TriggerHelper.IsInWorld);

	// cluster attackers
	// warn("Attackers = "+uneval(attackers));
	const clusters = this.ClusterUnits(attackers, 3);

	// warn(uneval(clusters.length));

	// for each cluster, send attack
	for (let k = 0; k < clusters.length; k++)
	{
		if (clusters[k].length > 0)
		{

			// find target
			const target = this.FindClosestTarget(clusters[k][0], target_player, unitTargetClass);


			const target_pos = TriggerHelper.GetEntityPosition2D(target);

			// warn(uneval(target_pos));

			// set formation
			TriggerHelper.SetUnitFormation(p, clusters[k], "special/formations/battle_line");

			// attack walk
			ProcessCommand(p, {
				"type": "attack-walk",
				"entities": clusters[k],
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


};

Trigger.prototype.AttackCavalryWave = function(data)
{
	const p = 3;
	const target_player = 2;

	// find all infantry
	const attackers = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Cavalry").filter(TriggerHelper.IsInWorld);

	// cluster attackers
	// warn("Attackers = "+uneval(attackers));
	const clusters = this.ClusterUnits(attackers, 3);

	// warn(uneval(clusters.length));

	// for each cluster, send attack
	for (let k = 0; k < clusters.length; k++)
	{
		if (clusters[k].length > 0)
		{

			// find target
			const target = this.FindClosestTarget(clusters[k][0], target_player, unitTargetClass);


			const target_pos = TriggerHelper.GetEntityPosition2D(target);

			// warn(uneval(target_pos));

			// set formation
			TriggerHelper.SetUnitFormation(p, clusters[k], "special/formations/battle_line");

			// attack walk
			ProcessCommand(p, {
				"type": "attack-walk",
				"entities": clusters[k],
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


};


Trigger.prototype.AttackTaxila = function(data)
{
	const p = 4;
	const target_player = 2;

	// find all infantry
	const attackers = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Infantry").filter(TriggerHelper.IsInWorld);

	// let attackers = [];

	const clusters = this.ClusterUnits(attackers, 7);

	// warn(uneval(clusters.length));

	// for each cluster, send attack
	for (let k = 0; k < clusters.length; k++)
	{
		if (clusters[k].length > 0)
		{

			// find target
			const target = this.FindClosestTarget(clusters[k][0], target_player, unitTargetClass);


			const target_pos = TriggerHelper.GetEntityPosition2D(target);

			// warn(uneval(target_pos));

			// set formation
			TriggerHelper.SetUnitFormation(p, clusters[k], "special/formations/battle_line");

			// attack walk
			ProcessCommand(p, {
				"type": "attack-walk",
				"entities": clusters[k],
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

};

Trigger.prototype.AttackInftanryWave = function(data)
{
	const p = 3;
	const target_player = 2;

	// find all infantry
	const attackers = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Infantry").filter(TriggerHelper.IsInWorld);

	// let attackers = [];

	const clusters = this.ClusterUnits(attackers, 8);

	// warn(uneval(clusters.length));

	// for each cluster, send attack
	for (let k = 0; k < clusters.length; k++)
	{
		if (clusters[k].length > 0)
		{

			// find target
			const target = this.FindClosestTarget(clusters[k][0], target_player, unitTargetClass);


			const target_pos = TriggerHelper.GetEntityPosition2D(target);

			// warn(uneval(target_pos));

			// set formation
			TriggerHelper.SetUnitFormation(p, clusters[k], "special/formations/battle_line");

			// attack walk
			ProcessCommand(p, {
				"type": "attack-walk",
				"entities": clusters[k],
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

};



Trigger.prototype.AttackIndianInfantry = function(data)
{
	const p = 6;
	const target_player = 4;

	// find all infantry
	const units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Infantry").filter(TriggerHelper.IsInWorld);

	const attackers = [];

	for (const u of units)
	{
		// check if idle
		const cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
		if (cmpUnitAI)
		{
			if (cmpUnitAI.IsIdle())
			{

				attackers.push(u);
				// set to walk and attack
				// this.WalkAndFightClosestTarget(u,target_player,siegeTargetClass);
			}
		}
	}

	// find target
	const target = this.FindRandomTarget(attackers[0], target_player, siegeTargetClass);


	const target_pos = TriggerHelper.GetEntityPosition2D(target);

	// warn(uneval(target_pos));

	// set formation
	TriggerHelper.SetUnitFormation(p, attackers, "special/formations/battle_line");

	// attack walk
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

	this.indianInfIdleCheck = true;
};

Trigger.prototype.AttackIndianCavalry = function(data)
{
	const p = 6;
	const target_player = 4;

	// find all cavalry
	const units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Cavalry").filter(TriggerHelper.IsInWorld);

	const attackers = [];

	for (const u of units)
	{
		// check if idle
		const cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
		if (cmpUnitAI)
		{
			if (cmpUnitAI.IsIdle())
			{

				attackers.push(u);

				// set to walk and attack
				// this.WalkAndFightClosestTarget(u,target_player,siegeTargetClass);
			}
		}
	}

	const clusters = this.ClusterUnits(attackers, 2);

	// warn(uneval(clusters.length));

	// for each cluster, send attack
	for (let k = 0; k < clusters.length; k++)
	{
		if (clusters[k].length > 0)
		{

			// find target
			const target = this.FindRandomTarget(clusters[k][0], target_player, siegeTargetClass);


			const target_pos = TriggerHelper.GetEntityPosition2D(target);

			// warn(uneval(target_pos));

			// set formation
			TriggerHelper.SetUnitFormation(p, clusters[k], "special/formations/battle_line");

			// attack walk
			ProcessCommand(p, {
				"type": "attack-walk",
				"entities": clusters[k],
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

	this.indianCavIdleCheck = true;
};


Trigger.prototype.ResearchTechs = function(data)
{
	for (const p of [1, 2, 3, 4])
	{

		const cmpPlayer = QueryPlayerIDInterface(p);
		const cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);

		// everyone gets some extra resistance the make battle last longer
		cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_01");
		cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_02");
		cmpTechnologyManager.ResearchTechnology("soldier_resistance_pierce_01");
		cmpTechnologyManager.ResearchTechnology("soldier_resistance_pierce_02");

		if (p == 1)
		{
			cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_03");
			cmpTechnologyManager.ResearchTechnology("soldier_resistance_pierce_03");

			cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_01");
			cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_02");
			cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_03");
			cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_01");
			cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_02");
			cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_03");

			cmpTechnologyManager.ResearchTechnology("cavalry_movement_speed");
			cmpTechnologyManager.ResearchTechnology("nisean_horses");


			cmpTechnologyManager.ResearchTechnology("attack_soldiers_will");
			cmpTechnologyManager.ResearchTechnology("archery_tradition");
			cmpTechnologyManager.ResearchTechnology("archer_attack_spread");

			// healer techs
			cmpTechnologyManager.ResearchTechnology("heal_rate");
			cmpTechnologyManager.ResearchTechnology("heal_rate_2");
			cmpTechnologyManager.ResearchTechnology("heal_range");
			cmpTechnologyManager.ResearchTechnology("heal_range_2");

		}
		else if (p == 3 || p == 4)
		{
			cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_01");
			cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_01");


		}
		else if (p == 2)
		{

			cmpTechnologyManager.ResearchTechnology("heal_rate");
			cmpTechnologyManager.ResearchTechnology("heal_rate_2");
		}
	}


};


Trigger.prototype.ClusterUnits = function(units, num_clusters)
{
	const dataset = [];

	for (const u of units)
	{
		// get target position
		var cmpTargetPosition = Engine.QueryInterface(u, IID_Position).GetPosition2D();

		dataset.push([cmpTargetPosition.x, cmpTargetPosition.y]);
	}

	// how many clusters
	const kmeans = new KMeans({
	  "canvas": null,
	  "data": dataset,
	  "k": num_clusters
	});

	const num_iterations = 40;

	for (let i = 0; i < num_iterations; i++)
	{
		kmeans.run();

	}

	const clustering = kmeans.assignments;

	// warn(uneval(clustering));

	const clusters = [];
	for (let k = 0; k < num_clusters; k++)
	{
		const cluter_k = [];

		for (let i = 0; i < units.length; i++)
		{

			if (clustering[i] == k)
			{
				cluter_k.push(units[i]);
			}
		}

		clusters.push(cluter_k);
	}

	return clusters;
};






Trigger.prototype.AlexanderHealthCheck = function(data)
{

	if (this.alexFlipped == false)
	{
		// find alexander
		const p = 3;
		const heroes = [4969]; // TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(owner), "Hero").filter(TriggerHelper.IsInWorld);

		if (heroes.length > 0)
		{
			// get health
			const health_u = Engine.QueryInterface(heroes[0], IID_Health);
			if (health_u)
			{

				const health_fraction = health_u.GetHitpoints()/health_u.GetMaxHitpoints();
				// warn("health ratio = "+uneval(health_fraction));

				if (health_fraction < 0.55)
				{
					this.ShowText("Alexnader is severely wounded! You must take him to safety!", "Oh my!", "OK");

					// change ownership
					var cmpOwnership = Engine.QueryInterface(heroes[0], IID_Ownership);
					cmpOwnership.SetOwner(1);

					this.alexFlipped = true;

					// find all ranged units within him
					const units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(2), "Ranged").filter(TriggerHelper.IsInWorld);

					for (const u of units)
					{
						const distance = PositionHelper.DistanceBetweenEntities(u, heroes[0]);

						if (distance < 120.0)
						{
							const cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
							if (cmpUnitAI)
							{
								// attack alexander
								cmpUnitAI.orders = [];
								cmpUnitAI.Attack(heroes[0], false, false);
							}
						}
					}
				}
			}
		}
	}

};


/*
 * notes: test 5/12, lost 200 and 5 of player 1, alex didn't get wounded; added 30 more units to porus as result
 *
 * test 5/13, team total 651/269, mace 237/231, allies 80/33
 * same test with AI: 475/480 and lost
 *
 * after adding healers to maur: 440/483
 *
 * with early attack: 662/362, won, mace lost 285 out of 338
 *
 * 663/306, mace 200/268
 *
 * //latest with fast ai:
 * 658/365, mace 276/275 out of 338
 * 660/374, mace 299/287
 * 659/408, mace 275/318
 * 660/372, mace 261/295 alex dead
 * 505/478 lost
 * 660/359 alex dead
 * 663/388, mace 257/313 alex dead
 *
 * human tests:
 * 665/279, mace lost 240
 * 664/263, mace lost 215
 *
 */

{
	const cmpTrigger = Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger);

	// Activate all possible triggers
	/* let data = { "enabled": true };
	cmpTrigger.RegisterTrigger("OnStructureBuilt", "StructureBuiltAction", data);*/
	/* cmpTrigger.RegisterTrigger("OnConstructionStarted", "ConstructionStartedAction", data);
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

	const units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(3), "Unit").filter(TriggerHelper.IsInWorld);
	warn("mace army size = "+uneval(units.length));

	cmpTrigger.heroID1 = 4839;
	cmpTrigger.heroID2 = 4969;

	// some constants and variables
	cmpTrigger.alexFlipped = false;

	cmpTrigger.maceKilled = 0;
	cmpTrigger.maceKilledThreshold = 280;
	cmpTrigger.gameLost = false;
	// give extra tech
	cmpTrigger.DoAfterDelay(5 * 1000, "ResearchTechs", null);

	// difficulty option
	// cmpTrigger.DoAfterDelay(2 * 1000,"DifficultyOption",null);

	// start attackers
	const delay = 30;
	cmpTrigger.DoAfterDelay((delay+15) * 1000, "AttackInftanryWave", null);
	cmpTrigger.DoAfterDelay((delay+25) * 1000, "AttackCavalryWave", null);
	// cmpTrigger.DoAfterDelay((delay+19) * 1000,"HealersAdvanceDebug",null);
	cmpTrigger.DoAfterDelay((delay+18) * 1000, "AttackTaxila", null);
	// cmpTrigger.DoAfterDelay((delay+28) * 1000,"AttackCavalryWaveDebug",null);

	/* cmpTrigger.DoAfterDelay((delay+15) * 1000,"AttackInftanryWave",null);
	cmpTrigger.DoAfterDelay((delay+25) * 1000,"AttackCavalryWave",null);
	cmpTrigger.DoAfterDelay((delay+18) * 1000,"HealersAdvanceDebug",null);
	cmpTrigger.DoAfterDelay((delay+17) * 1000,"AttackTaxila",null);
	cmpTrigger.DoAfterDelay((delay+27) * 1000,"AttackCavalryWaveDebug",null);*/



	// health check for alexander
	cmpTrigger.RegisterTrigger("OnInterval", "AlexanderHealthCheck", {
		"enabled": true,
		"delay": 10 * 1000,
		"interval": 5 * 1000,
	});

	// some additional modifiers
	const cmpModifiersManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_ModifiersManager);


	for (const p of [1, 2, 3, 4])
	{
		const cmpPlayer = QueryPlayerIDInterface(p);

		// disable buildings production
		const disTemplates = disabledTemplates(QueryPlayerIDInterface(p, IID_Identity).GetCiv());


		cmpPlayer.SetDisabledTemplates(disTemplates);
		warn("Disabling templates for player "+uneval(p));

		const cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);

		cmpTechnologyManager.ResearchTechnology("phase_town_generic");
		cmpTechnologyManager.ResearchTechnology("phase_city_generic");

		if (p == 1 || p == 3)
		{
			cmpModifiersManager.AddModifiers("Hero Resistance Pierce Bonus", {
				"Resistance/Entity/Damage/Pierce": [{ "affects": ["Hero"], "multiply": 2.0 }],
			}, cmpPlayer.entity);

			cmpModifiersManager.AddModifiers("Hero Resistance Hack Bonus", {
				"Resistance/Entity/Damage/Hack": [{ "affects": ["Hero"], "multiply": 2.0 }],
			}, cmpPlayer.entity);

		}

	}


	/* cmpTrigger.RegisterTrigger("OnInterval", "IdleUnitCheck", {
		"enabled": true,
		"delay": 30 * 1000,
		"interval": 20 * 1000,
	});*/

	// Activate all possible triggers
	const data = { "enabled": true };
	cmpTrigger.RegisterTrigger("OnOwnershipChanged", "OwnershipChangedAction", data);

	// cmpTrigger.RegisterTrigger("OnPlayerCommand", "PlayerCommandAction", data);

	/* cmpTrigger.DoAfterDelay(300 * 1000,"SpawnAlliedInvasionAttack",null);*/



}
