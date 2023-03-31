warn("loading the triggers file");

// /////////////////////
// Trigger listeners //
// /////////////////////

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


		warn("[ERROR] Could not find closest target to fight: " + attacker + " and " + target_player + " and " + target_class);
	}

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
	warn("The OnStructureBuilt event happened with the following data:");
	warn(uneval(data));
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

Trigger.prototype.OwnershipChangedAction = function(data)
{
	// warn("The OnOwnershipChanged event happened with the following data:");
	// warn(uneval(data));

	if (data.entity == this.pegasusId)
	{
		// warn("Pegasus ackquired!");
		this.hasPegasus = true;

		if (this.pegasusQuestGiven == true)
		{
			this.ShowText("We have found the pegasus statue that the old priests wanted us to seek out. Now let's bring it to him to get our reward!", "Sounds good", "That was easy!");
		}
		else
		{
			this.ShowText("Among the treasure we just found, there is an odd-looking pegasus statue -- we'll take it along, perhaps it could be reunited with its rightful owner?", "Sounds good", "That was easy!");
		}

		const cmpPlayer = QueryPlayerIDInterface(1);
		cmpPlayer.AddResource("metal", -1000);
	}
	else if (data.entity == this.banditTreasureId)
	{
		// we assume the bandits are defeated
		this.ShowText("The treasure captured from these bandits include various items of little values to us, but possibly belonging to someone in the area. Perhaps we should seek out their rightful owner?", "Sounds good", "That was easy!");

		this.banditsDefeated = true;
	}
	else if (data.entity == this.gaiaFortressId && data.to == 1)
	{
		this.ShowText("This captured fortress may come in handy should we need to deal with our enemies. We also found a stockpile inside which we can use to expand our force and improve our weapons. Unfortunaely, there are no materials here that we could use to build a siege tower, so we need to look for another fortress or workshop to fulfil that goal. ", "Sounds good", "That was easy!");

		// add some loot
		const cmpPlayer = QueryPlayerIDInterface(1);
		cmpPlayer.AddResource("wood", 1500);
		cmpPlayer.AddResource("metal", 500);

		const cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);

		cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_02");
		cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_03");


		this.gaiaFortressCaptured = true;
	}
	else if (data.entity == 1925 && this.gaiaCampCaptured == false) // gaia camp
	{
		const cmpPlayer = QueryPlayerIDInterface(1);
		cmpPlayer.SetPopulationBonuses(250);

		// spawn healers
		const units_i = TriggerHelper.SpawnUnits(data.entity, "units/mace/support_healer_e", 5, 1);

		this.gaiaCampCaptured = true;
	}
	else if (data.entity == 1589 && data.to == 1)
	{
		// warn("captured catafalque");

		// captured catafalque - alexander gets better resistance
		const cmpPlayer = QueryPlayerIDInterface(1);
		const cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);

		cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_02");
		cmpTechnologyManager.ResearchTechnology("soldier_resistance_pierce_02");
	}


	// check if gaia soldier, if so, make his buddies attack
	if (data.from == 0 && data.to == -1)
	{
		// check if soldier
		const id = Engine.QueryInterface(data.entity, IID_Identity);
		if (id && id.classesList.includes("Soldier"))
		{
			// find out which cluster
			let target_cluster = -1;

			for (let i = 0; i < this.gaiaClusters.length; i++)
			{
				if (this.gaiaClusters[i].includes(data.entity))
				{
					target_cluster = i;
					break;
				}
			}

			// warn("target cluster = "+target_cluster);

			if (target_cluster != -1)
			{
				// go through every unit in cluster and if idle, order to attack
				for (const u of this.gaiaClusters[target_cluster])
				{
					const cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
					if (cmpUnitAI)
					{
						if (cmpUnitAI.IsIdle())
						{
							this.WalkAndFightClosestTarget(u, 1, "Unit");
						}
					}
				}
			}
		}


		if (data.entity == 1718 || data.entity == 1719 || data.entity == 1720)
		{
			// spawn siege
			const units_i = TriggerHelper.SpawnUnits(data.entity, "units/mace/siege_oxybeles_unpacked", 1, 1);

		}
	}
};

Trigger.prototype.PlayerCommandAction = function(data)
{
	// warn("The OnPlayerCommand event happened with the following data:");
	// warn(uneval(data));
};



Trigger.prototype.InvasionRangeAction = function(data)
{
	// warn("The Invasion OnRange event happened with the following data:");
	// warn(uneval(data));

	if (this.invasion_under_way == true)
	{
		const cmpGarrisonHolder = Engine.QueryInterface(this.invasion_ship, IID_GarrisonHolder);

		if (cmpGarrisonHolder)
		{
			const humans = TriggerHelper.MatchEntitiesByClass(cmpGarrisonHolder.GetEntities(), "Human");
			const siegeEngines = TriggerHelper.MatchEntitiesByClass(cmpGarrisonHolder.GetEntities(), "Siege");
			if (humans.length > 0 || siegeEngines.length > 0)
			{
				// warn("Unloading");
				cmpGarrisonHolder.UnloadAll();
			}
			else if (humans.length == 0 && siegeEngines == 0)
			{
				// warn("Done unloading");

				// send units to attack -- idle unit check will take care of this

				// send ship to attack
				// get possible list of dock targets
				const dock_targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "Dock").filter(TriggerHelper.IsInWorld);
				const ship_targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "Ship").filter(TriggerHelper.IsInWorld);

				const targets = dock_targets.concat(ship_targets);

				// order attack
				if (targets.length > 0)
				{
					const p = 6;
					ProcessCommand(p, {
						"type": "attack",
						"entities": [this.invasion_ship],
						"target": pickRandom(targets),
						"queued": false,
						"allowCapture": false
					});
				}

				// clear variables and schedule next attack
				this.invasion_under_way = false;
				this.ship_invasion_garrison = undefined;
				this.invasion_ship = undefined;

				// schedule next attack
				this.carthageInvasionAttackInterval = Math.floor(0.975 * this.carthageInvasionAttackInterval);
				if (this.carthageInvasionShipGarrisonSize < 49)
					this.carthageInvasionShipGarrisonSize += 2;

				// warn("Next invasion in "+uneval(this.carthageInvasionAttackInterval));
				this.DoAfterDelay(this.carthageInvasionAttackInterval * 1000, "SpawnNavalInvasionAttack", null);


			}
		}
	}
};

Trigger.prototype.checkInvasionAttack = function(data)
{
	if (this.invasion_under_way == true)
	{
		const cmpUnitAI = Engine.QueryInterface(this.invasion_ship, IID_UnitAI);
		if (cmpUnitAI)
		{
			warn(uneval(cmpUnitAI.order));
			if (!cmpUnitAI.order)
			{
				warn("assigning order to ship");
				// send ship
				cmpUnitAI.Walk(this.ungarrisonPos.x, this.ungarrisonPos.y, true);
			}
			else if (cmpUnitAI.order.type != "Walk")
			{
				warn("assigning order to ship");
				// send ship
				cmpUnitAI.Walk(this.ungarrisonPos.x, this.ungarrisonPos.y, true);

			}
		}
		else
		{
			// ship must have been destroyed
			this.invasion_under_way = false;
		}
	}
};


// garison AI entities with archers
Trigger.prototype.GarrisonEntities = function(data)
{

	for (const p of [0, 2, 3, 4, 5, 6, 7])
	{
		// outposts
		const posts_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Outpost").filter(TriggerHelper.IsInWorld);

		for (const e of posts_p)
		{
			// spawn the garrison inside the tower
			const size = 1;


			const archers_e = TriggerHelper.SpawnUnits(e, "units/pers/infantry_archer_e", size, p);

			for (const a of archers_e)
			{
				const cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.OccupyTurret(e, true, true);
			}
		}


		// towers
		const towers_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "StoneTower").filter(TriggerHelper.IsInWorld);

		for (const e of towers_p)
		{
			// spawn the garrison inside the tower
			let size = 5;
			if (p == 0)
				size = 2;


			const archers_e = TriggerHelper.SpawnUnits(e, "units/pers/infantry_archer_e", size, p);

			for (const a of archers_e)
			{
				const cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(e, true);
			}
		}

		// sentry tower
		const towers_s = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "SentryTower").filter(TriggerHelper.IsInWorld);

		for (const e of towers_s)
		{
			// spawn the garrison inside the tower
			const archers_e = TriggerHelper.SpawnUnits(e, "units/pers/infantry_archer_e", 3, p);

			for (const a of archers_e)
			{
				const cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(e, true);
			}
		}

		// FORTRESS
		const forts_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Fortress").filter(TriggerHelper.IsInWorld);


		for (const e of forts_p)
		{
			// spawn the garrison inside the tower
			let fort_size = 20;
			if (p == 0)
				fort_size = 5;


			const archers_e = TriggerHelper.SpawnUnits(e, "units/pers/infantry_archer_e", fort_size, p);

			for (const a of archers_e)
			{
				const cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(e, true);
			}
		}

		// wall towers
		/* if (p == 2)
		{
			let towers_w = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "WallTower").filter(TriggerHelper.IsInWorld);
			for (let e of towers_w)
			{
				//spawn the garrison inside the tower
				let archers_e = TriggerHelper.SpawnUnits(e, "units/pers/infantry_archer_e",2,p);

				for (let a of archers_e)
				{
					let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
					cmpUnitAI.Garrison(e,true);
				}
			}
		}*/

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

		const temples_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Temple").filter(TriggerHelper.IsInWorld);

		for (const c of temples_p)
		{
			// spawn the garrison inside the tower
			const archers_e = TriggerHelper.SpawnUnits(c, "units/pers/infantry_archer_e", 5, p);

			for (const a of archers_e)
			{
				const cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(c, true);
			}
		}
	}
};


Trigger.prototype.IdleUnitCheck = function(data)
{
	for (const p of [7])
	{
		const target_p = 1;

		// find any idle soldiers
		const units_inf = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Infantry").filter(TriggerHelper.IsInWorld);
		const units_cav = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Cavalry").filter(TriggerHelper.IsInWorld);
		const units_siege = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Siege").filter(TriggerHelper.IsInWorld);
		const units_ele = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Elephant").filter(TriggerHelper.IsInWorld);

		const units_all = units_inf.concat(units_cav, units_siege, units_ele);

		for (const u of units_all)
		{
			const cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI)
			{
				if (cmpUnitAI.IsIdle())
				{
					// warn("Found idle soldier");
					this.WalkAndFightClosestTarget(u, target_p, unitTargetClass);
				}
			}
		}
	}
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

// garison AI entities with archers
Trigger.prototype.SpawnFortressPatrol = function(data)
{
	// which player
	const p = 5;

	// spawn random infantry next to a cc
	const ccs = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Fortress").filter(TriggerHelper.IsInWorld);

	if (ccs.length == 0)
		return;

	// calculate size of spawn units
	const num_patrols = 10;
	const patrol_size = 5;

	const inf_templates = ["units/kush/champion_infantry_amun", "units/kush/champion_infantry_archer", "units/kush/champion_infantry_apedemak"];

	// spawn infantry
	for (let j = 0; j < num_patrols; j++)
	{
		const units = [];
		const site_j = pickRandom(ccs);

		// melee
		for (let i = 0; i < patrol_size; i++)
		{
			const unit_i = TriggerHelper.SpawnUnits(site_j, pickRandom(inf_templates), 1, p);
			units.push(unit_i[0]);
		}

		// set formation
		TriggerHelper.SetUnitFormation(p, units, pickRandom(unitFormations));


		// send to patrol
		this.PatrolOrder(units, p);

	}

};



Trigger.prototype.FlipAlliedAssets = function(data)
{
	// get all structures except docks
	const structures_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(3), "Structure+!Dock").filter(TriggerHelper.IsInWorld);

	for (const u of structures_p)
	{
		var cmpOwnership = Engine.QueryInterface(u, IID_Ownership);
		cmpOwnership.SetOwner(1);
	}

	// get all units
	const units_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(3), "Unit");

	for (const u of units_p)
	{
		var cmpOwnership = Engine.QueryInterface(u, IID_Ownership);
		cmpOwnership.SetOwner(1);
	}
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

Trigger.prototype.CheckAssault = function(data)
{
	const units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(7), "Unit").filter(TriggerHelper.IsInWorld);

	// warn("Found "+uneval(units.length) +" units");

	if (units.length == 0)
	{
		// flip assets
		this.DoAfterDelay(10 * 1000, "FlipMegolopolisAssets", null);
		this.ShowText("We have defeated the assault on Megalopolis! The city is now under your command!", "Great!", "OK");
		// warn("Assault over!");
	}
	else
	{
		this.DoAfterDelay(15 * 1000, "CheckAssault", null);

	}
};

Trigger.prototype.SpawnAssault = function(data)
{
	const owner = 7;
	const target_player = 3;

	// north side -- some rams, cavalry, and ballistas
	const num_rams = 5;
	const num_cav = 20;
	const num_ballistas = 3;

	for (let i = 0; i < num_rams; i++)
	{
		// spawn unit
		const triggerPoint = pickRandom(this.GetTriggerPoints(triggerPointNorth));

		const units_i = TriggerHelper.SpawnUnits(triggerPoint, "units/spart/siege_ram", 1, owner);

		// make it fight
		this.WalkAndFightClosestTarget(units_i[0], target_player, "CivilCentre");
	}

	for (let i = 0; i < num_cav; i++)
	{
		// spawn unit
		const triggerPoint = pickRandom(this.GetTriggerPoints(triggerPointNorth));

		const units_i = TriggerHelper.SpawnUnits(triggerPoint, "units/spart/cavalry_spearman_a", 1, owner);

		// make it fight
		this.WalkAndFightClosestTarget(units_i[0], target_player, "CivilCentre");
	}

	for (let i = 0; i < num_ballistas; i++)
	{
		// spawn unit
		const triggerPoint = pickRandom(this.GetTriggerPoints(triggerPointNorth));

		const units_i = TriggerHelper.SpawnUnits(triggerPoint, "units/athen/siege_oxybeles_packed", 1, owner);

		// make it fight
		this.WalkAndFightClosestTarget(units_i[0], target_player, "CivilCentre");
	}

	// south side -- some infantry
	const num_infantry = 30;

	const inf_templates = ["units/spart/champion_infantry_pike", "units/spart/champion_infantry_swordsman", "units/spart/champion_infantry_spear", "units/spart/infantry_javelineer_a"];

	for (let i = 0; i < num_infantry; i++)
	{
		// spawn unit
		const triggerPoint = pickRandom(this.GetTriggerPoints(triggerPointSouth));

		const units_i = TriggerHelper.SpawnUnits(triggerPoint, pickRandom(inf_templates), 1, owner);

		// make it fight
		this.WalkAndFightClosestTarget(units_i[0], target_player, "CivilCentre");
	}

	this.DoAfterDelay(15 * 1000, "CheckAssault", null);

};

Trigger.prototype.SpawnFortressAttackSquad = function(data)
{
	const attackers = [];
	const p = 5;

	// warn(uneval(data));

	for (let i = 0; i < data.squad_size; i++)
	{
		const units_i = TriggerHelper.SpawnUnits(data.site, pickRandom(data.templates), 1, p);
		attackers.push(units_i[0]);
	}

	// set formation
	TriggerHelper.SetUnitFormation(p, attackers, pickRandom(unitFormations));

	// attack nearest structure
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


Trigger.prototype.SpawnRearPassAttackSquad = function(data)
{
	const attackers = [];
	const p = 7;

	for (let i = 0; i < data.squad_size; i++)
	{
		const units_i = TriggerHelper.SpawnUnits(data.site, pickRandom(data.templates), 1, p);
		attackers.push(units_i[0]);
	}

	// attack towards alexnader
	const target = this.alexanderId;
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

Trigger.prototype.SpawnPassAttackSquad = function(data)
{
	const attackers = [];
	const p = 7;

	for (let i = 0; i < data.squad_size; i++)
	{
		const units_i = TriggerHelper.SpawnUnits(data.site, pickRandom(data.templates), 1, p);
		attackers.push(units_i[0]);
	}

	// set formation
	TriggerHelper.SetUnitFormation(p, attackers, pickRandom(unitFormations));

	// attack pass
	const target = this.GetTriggerPoints("F")[0];
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


// attack against captured gaia fortress
Trigger.prototype.SpawnFortressAttack = function(data)
{
	// determine size of attack
	let size = 45;

	const cmpPlayer = QueryPlayerIDInterface(1);
	const pop = cmpPlayer.GetPopulationCount();
	size += Math.round(pop * 0.65); // pretty big attack

	// templatets
	const templates = ["units/pers/arstibara", "units/pers/champion_infantry", "units/pers/kardakes_hoplite", "units/pers/kardakes_skirmisher", "units/pers/infantry_archer_b", "units/pers/infantry_spearman_e", "units/pers/infantry_spearman_a", "units/pers/infantry_archer_a", "units/pers/infantry_spearman_b"];

	const ele_templates = TriggerHelper.GetTemplateNamesByClasses("Champion+Elephant+!Hero", "pers", undefined, undefined, true);
	templates.push(ele_templates[0]);



	// size of each squad
	const squad_size = 8;
	const num_squads = Math.round(size / squad_size);
	// warn("spawning "+num_squads+" squads");

	// spawn sites -- towers
	const p = 4;
	const sites = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "StoneTower").filter(TriggerHelper.IsInWorld);

	for (let i = 0; i < num_squads; i++)
	{
		const data = {};
		data.squad_size = squad_size;
		data.templates = templates;
		data.site = pickRandom(sites);

		this.DoAfterDelay(4 * (i + 1) * 1000, "SpawnFortressAttackSquad", data);

	}
};


Trigger.prototype.VictoryTextFn = function(n)
{
	return markForPluralTranslation(
		"%(lastPlayer)s has won (game mode).",
		"%(players)s and %(lastPlayer)s have won (game mode).",
		n);
};

// attack against captured gaia fortress
Trigger.prototype.VictoryCheck = function(data)
{
	const cmpPlayer = QueryPlayerIDInterface(7);

	// warn(uneval(cmpPlayer.GetPopulationCount()));

	if (cmpPlayer.GetPopulationCount() <= this.victoryPopLevel)
	{
		// warn("Victory!!!");
		TriggerHelper.SetPlayerWon(1, this.VictoryTextFn, this.VictoryTextFn);
	}
	else
	{
		this.DoAfterDelay(20 * 1000, "VictoryCheck", data);
	}
};


// attack against captured gaia fortress
Trigger.prototype.SpawnPassAttack = function(data)
{
	// check population before pass attack
	const cmpPlayer = QueryPlayerIDInterface(7);
	this.victoryPopLevel = cmpPlayer.GetPopulationCount();
	// warn("victory pop level = "+this.victoryPopLevel);

	// determine size of attack
	let size = 120;

	const cmpPlayer1 = QueryPlayerIDInterface(1);
	const pop = cmpPlayer1.GetPopulationCount();
	size += Math.round(pop * 0.8); // pretty big attack

	// templatets
	const templates = ["units/pers/arstibara", "units/pers/arstibara", "units/pers/champion_infantry", "units/pers/champion_infantry", "units/pers/kardakes_hoplite", "units/pers/kardakes_skirmisher", "units/pers/infantry_archer_e", "units/pers/infantry_spearman_e", "units/pers/infantry_spearman_e", "units/pers/infantry_archer_e", "units/pers/infantry_archer_a", "units/pers/infantry_archer_b", "units/pers/infantry_spearman_e", "units/pers/champion_cavalry", "units/pers/champion_cavalry_archer", "units/pers/cavalry_axeman_e", "units/pers/cavalry_spearman_e"];

	const ele_templates = TriggerHelper.GetTemplateNamesByClasses("Champion+Elephant+!Hero", "pers", undefined, undefined, true);
	templates.push(ele_templates[0]);

	// templates for rear attack
	const cav_templates = ["units/pers/cavalry_axeman_e", "units/pers/cavalry_axeman_a", "units/pers/cavalry_spearman_e", "units/pers/cavalry_spearman_a", "units/pers/cavalry_spearman_b", "units/pers/cavalry_javelineer_e"];

	// size of each squad
	const squad_size = 13;
	const num_squads = Math.round(size / squad_size);
	// warn("spawning "+num_squads+" squads");

	// spawn sites -- towers
	const p = 4;
	const sites = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Outpost").filter(TriggerHelper.IsInWorld);

	for (let i = 0; i < num_squads; i++)
	{
		const data = {};
		data.squad_size = squad_size + Math.round(i * 1.55);
		data.templates = templates;
		data.site = pickRandom(sites);

		this.DoAfterDelay(12 * (i + 1) * 1000, "SpawnPassAttackSquad", data);

		// spawn rear attacks at the end
		if (num_squads - i < 4 || (i + 1) % 4 == 0)
		{
			const data_rear = {};
			data_rear.site = this.GetTriggerPoints("E")[1];
			data_rear.templates = cav_templates;
			data_rear.squad_size = 10;

			this.DoAfterDelay(12 * (i + 1) * 1000, "SpawnRearPassAttackSquad", data_rear);
		}

		// last batch, somewhat stronger
		if (i == num_squads - 1)
		{
			const data_rear = {};
			data_rear.site = this.GetTriggerPoints("E")[1];
			data_rear.templates = cav_templates;
			data_rear.squad_size = 10;

			this.DoAfterDelay((12 * (i + 2)) * 1000, "SpawnRearPassAttackSquad", data_rear);
			this.DoAfterDelay((12 * (i + 3)) * 1000, "SpawnRearPassAttackSquad", data_rear);

			this.DoAfterDelay(12 * (i + 2) * 1000, "SpawnPassAttackSquad", data);

		}
	}

	this.DoAfterDelay(60 * 1000, "VictoryCheck", data);


	this.passAttackTriggered = true;
};

Trigger.prototype.SpawnAlexnaderAmbush = function(data)
{

	// site
	const spearmen_site = this.alexanderId; // they spawn around alexnader and also by the trigger point

	const num_spearmen = 10;
	const num_ranged = 10;

	// spawn spearmen
	const p = 5;
	const units_s = TriggerHelper.SpawnUnits(spearmen_site, "units/pers/kardakes_hoplite", num_spearmen, p);

	// spawn some ranged units
	const ranged_site = this.GetTriggerPoints("I")[0];

	const units_r = TriggerHelper.SpawnUnits(ranged_site, "units/pers/kardakes_skirmisher", num_ranged, p);

	// spawn some additional attackers based on number of units

	const cmpPlayer = QueryPlayerIDInterface(1);
	const pop = cmpPlayer.GetPopulationCount();
	const size = Math.round(pop * this.ambushAssassinsRatio);
	warn("Spawning additional " + size + " attackers");
	let units = [];
	const templates = ["units/pers/infantry_spearman_e", "units/pers/infantry_spearman_a", "units/pers/kardakes_skirmisher"];
	for (let i = 0; i < size; i++)
	{
		const units_i = TriggerHelper.SpawnUnits(ranged_site, pickRandom(templates), 1, p);
		units.push(units_i[0]);
	}

	// make them attack towards alexnader
	units = units.concat(units_r, units_s);

	const target = this.FindClosestTarget(units[0], 1, "Hero");

	const target_pos = TriggerHelper.GetEntityPosition2D(target);

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
};


Trigger.prototype.SpawnTraderAttack = function(data)
{
	// warn("trader attack");

	// get sites
	const site = this.GetTriggerPoints("C")[0];
	const p = 0;

	const attack_size = 25;
	const templates = ["units/pers/cavalry_spearman_a", "units/pers/cavalry_axeman_a", "units/pers/cavalry_javelineer_a", "units/pers/champion_cavalry_archer", "units/pers/champion_cavalry"];

	const attackers = [];

	for (let i = 0; i < attack_size; i++)
	{
		// spawn archer
		const units_i = TriggerHelper.SpawnUnits(site, pickRandom(templates), 1, p);

		attackers.push(units_i[0]);
	}

	// attack nearest trader
	const target_player = 6;
	const target = this.FindClosestTarget(attackers[0], target_player, "Trader");

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

Trigger.prototype.SpawnAmbush = function(data)
{
	// warn("Archer ambush");

	// get sites
	const spawn_sites = this.GetTriggerPoints(triggerPointArchers);

	// spawn archers at each
	const p = 5;

	for (const site of spawn_sites)
	{
		// spawn archer
		const units_i = TriggerHelper.SpawnUnits(site, "units/pers/infantry_archer_e", 1, p);
	}

	this.ambushTriggered = true;

	// flip assets shortly
	this.DoAfterDelay(1 * 1000, "FlipAlliedAssets", null);

};


Trigger.prototype.DropSiteWarning = function(data)
{

	this.ShowText("The fishermen urge you to return all your good to the dock now -- they'll need to resume operations very soon", "OK", "Will do");
};


Trigger.prototype.DropSiteEnd = function(data)
{

	this.ShowText("The fishermen have now resumed operations at their dock -- they thank you for your help and hope you gathered enough resources.", "OK", "Will do");


	// set team to allies so we can use their dock
	let cmpPlayer = QueryPlayerIDInterface(1);
	cmpPlayer.SetNeutral(6);

	cmpPlayer = QueryPlayerIDInterface(6);
	cmpPlayer.SetNeutral(1);

};




Trigger.prototype.RangeActionBanditAttack = function(data)
{
	// send all cavalry to attack
	if (this.banditAtttackTriggered == false)
	{
		const p = 0;
		const attackers = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Cavalry").filter(TriggerHelper.IsInWorld);

		// spawn some additional attackers based on number of units
		const templates = ["units/pers/cavalry_spearman_b", "units/pers/cavalry_spearman_a", "units/pers/cavalry_axeman_a", "units/pers/cavalry_javelineer_b", "units/pers/champion_cavalry_archer", "units/pers/champion_cavalry"];

		const cmpPlayer = QueryPlayerIDInterface(1);
		const pop = cmpPlayer.GetPopulationCount();
		const size = Math.round(pop * this.banditRatio) - 5;
		// warn("Spawning additional "+size+" attackers");
		const site = 1791; // falled doric column
		for (let i = 0; i < size; i++)
		{
			const units_i = TriggerHelper.SpawnUnits(site, pickRandom(templates), 1, p);
			attackers.push(units_i[0]);
		}

		for (const u of attackers)
		{
			this.WalkAndFightClosestTarget(u, 1, "Hero");
		}

		this.banditAtttackTriggered = true;
	}
};


Trigger.prototype.RewardTraders = function(data)
{
	// get some tech
	const cmpPlayer = QueryPlayerIDInterface(1);
	const cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
	cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_02");
	cmpTechnologyManager.ResearchTechnology("soldier_resistance_pierce_02");
	cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_02");
	cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_02");
};

Trigger.prototype.RangeActionTradersDestination = function(data)
{
	if (this.traderEscortQuestGiven == true && this.traderEscortReward == false)
	{
		let give_reward = false;

		for (const e of data.currentCollection)
		{
			const id = Engine.QueryInterface(e, IID_Identity);
			if (id.classesList.includes("Trader"))
			{
				give_reward = true;
			}
		}

		if (give_reward == true)
		{
			this.traderEscortReward = true;

			this.ShowText("The caravan is grateful for your help. They do not have much to offer but among them is a skilled blacksmith who sharpens your weapons and polishes your armor.", "Thank you", "That will do");

			this.RewardTraders();


			// warn("give reward for escort service");
		}
	}

};



Trigger.prototype.SendTradersToTarget = function(data)
{
	// see if there is a gaia market
	const markets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(0), "Market").filter(TriggerHelper.IsInWorld);

	// make them move to target market
	for (const u of this.traders)
	{
		const cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
		const target_pos = TriggerHelper.GetEntityPosition2D(markets[0]);

		cmpUnitAI.SwitchToStance("passive");
		cmpUnitAI.WalkToTarget(markets[0], false);
	}

};

Trigger.prototype.RangeActionTraders = function(data)
{
	if (this.traderEscortQuestGiven == false && this.gaiaFortressCaptured == true)
	{

		// see if there is a gaia market
		const markets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(0), "Market").filter(TriggerHelper.IsInWorld);

		if (markets.length > 0)
		{

			this.ShowText("You encounter a trade caravan in desperate need of help. They are headed to the nearest supply stop -- a neutral market past your camps. If you escort them, they promise a large reward for your service.\n\nThe traders will need a few seconds to regroup. Go ahead and march in the direction of your camps to clear the way of any possible problems.", "Fine, we'll do it", "Good luck, man");

			// spawn some traders and ask for escort
			const spawn_site = this.GetTriggerPoints("B")[0];
			const p = 6;

			// spawn traders
			const units_i = TriggerHelper.SpawnUnits(spawn_site, "units/pers/support_trader", 3, p);

			this.traders = units_i;

			this.DoAfterDelay(25 * 1000, "SendTradersToTarget", null);


			// make them move to target market
			/* for (let u of units_i)
			{
				let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
				let target_pos = TriggerHelper.GetEntityPosition2D(markets[0]);

				cmpUnitAI.SwitchToStance("passive");
				cmpUnitAI.WalkToTarget(markets[0], false);
			}*/
		}

		// set quest as given
		this.traderEscortQuestGiven = true;

		// schedule an attack about a minute and 20 seconds from now
		this.DoAfterDelay(135 * 1000, "SpawnTraderAttack", null);

	}
};

Trigger.prototype.RangeActionDock = function(data)
{
	if (data.added.includes(this.alexanderId))
	{
		if (this.banditHorseQuestGiven == false)
		{
			this.ShowText("A band of local fisherman seem to be using this dock. They greet you and share a tale of horse bandis who have pillaged their fishing supplies. Should you encounter and defeat them, they ask that you bring their supplies back. In exchange, they inform you that a heard of escaped elephants is grazing nearby and they will let you hunt them and use their dock to process the meat.", "We're on it!", "Tasty!");

			this.banditHorseQuestGiven = true;
		}
		else if (this.banditHorseQuestGiven == true && this.banditsDefeated == true && this.banditsRewardGiven == false)
		{
			this.ShowText("The fishermen are happy to be reunited with their fishing nets. You can now use their dock to drop off any meat you gather from the elephant herd. The fisherman need to get back to work in a short while so please hurry!", "We're on it!", "Tasty!");

			// set team to allies so we can use their dock
			let cmpPlayer = QueryPlayerIDInterface(1);
			cmpPlayer.SetAlly(6);

			cmpPlayer = QueryPlayerIDInterface(6);
			cmpPlayer.SetAlly(1);

			this.banditsRewardGiven = true;

			this.DoAfterDelay(180 * 1000, "DropSiteWarning", null);

			this.DoAfterDelay(210 * 1000, "DropSiteEnd", null);

		}

	}




};


Trigger.prototype.RangeActionTemple = function(data)
{
	// warn(uneval(data));

	if (data.added.includes(this.alexanderId))
	{
		if (this.pegasusQuestGiven == false)
		{
			// give quest
			this.ShowText("As we get close to the temple, an old priests walks out. He welcomes you as a guest and shares the story of a ritual pegasus statue that was once looted from the temple by bandits. Should you find that statue, the priest implores you to return it -- get is willing to offer you a small reward that the temple could afford", "Great, we'll look for it", "Nah, we got more important things to do");

			this.pegasusQuestGiven = true;

		}
		else if (this.pegasusQuestGiven == true && this.hasPegasus == true)
		{
			// give quest
			this.ShowText("The priest is happy to see you again. He looks at the statue you have brought and says, 'Yes, this is it! Now about the reward....'. He looks nervously around him and all of a sudden shouts, 'NOW!!!'....", "Now what?", "This doesn't look good...");

			this.assassinationTriggered = true;
			this.DoAfterDelay(1 * 1000, "SpawnAlexnaderAmbush", null);

			// spawn ambush
			this.hasPegasus = false;

		}
		else if (this.assassinationTriggered && this.templeRewardGiven == false)
		{
			// give quest
			this.ShowText("The temple's priests gather humbly in front of you and turn in the traitor -- a priest who revealed your locatiion to the assassins and signaled them into action. To make up for what they have done, the temple turns over some healing supplies. Your troops will now be healed faster when garrisoned or idle. ", "Great", "Too little, too late!");

			this.templeRewardGiven = true;

			this.RewardTemple();
		}
	}
};

Trigger.prototype.RewardTemple = function(data)
{
	const p = 1;
	const cmpPlayer = QueryPlayerIDInterface(p);
	const cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);

	cmpTechnologyManager.ResearchTechnology("garrison_heal");
	cmpTechnologyManager.ResearchTechnology("health_regen_units");

	this.heal_rate_g *= 2;
};



Trigger.prototype.RangeActionPassAttack = function(data)
{
	if (this.passAttackTriggered == false)
	{
		// warn(uneval(data));
		if (data.currentCollection.length > 5)
		{
			// trigger attack
			// warn("pass attack");
			this.DoAfterDelay(30 * 1000, "SpawnPassAttack", null);

			this.passAttackTriggered = true;

			this.ShowText("Finally, we have found a way! In the distance, you see a Persian fortress and an army assembling nearby, getting ready to march towards us. We must meet them in battle. If we win, this is it for the Persian Empire!", "We will meet the enemy in the field!", "We will defend ourselves from the higher ground!");
		}

	}
};



Trigger.prototype.RangeActionFortressAttack = function(data)
{
	if (this.fortressAttackTriggered == false && this.gaiaFortressCaptured == true)
	{
		// warn(uneval(data));
		if (data.currentCollection.length > 5)
		{
			// trigger attack
			// warn("fortress attack");
			this.DoAfterDelay(10 * 1000, "SpawnFortressAttack", null);

			this.fortressAttackTriggered = true;

			this.ShowText("This path looks promising....but further in the distance your scouts notice enemy forces marching towards us. Prepare for battle!", "Yes, sir!", "Oh no!");
		}

	}
};


Trigger.prototype.RangeActionAmbush = function(data)
{
	if (this.ambushTriggered == false)
	{
		// spawn ambush
		this.SpawnAmbush();

		this.ShowText("The pass is blocked and we have been ambushed! Retreat! We must get back to our camp and find an alternate route!", "Yikes!", "OK");
	}
};

Trigger.prototype.StartMarch = function(data)
{
	const p = 3;

	// get all units
	const attackers = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Unit").filter(TriggerHelper.IsInWorld);

	// put them in formation
	// set formation
	TriggerHelper.SetUnitFormation(p, attackers, pickRandom(unitFormations));

	// find target

	const target = pickRandom(this.GetTriggerPoints(triggerPointGate));


	const target_pos = TriggerHelper.GetEntityPosition2D(target);

	ProcessCommand(p, {
		"type": "walk",
		"entities": attackers,
		"x": target_pos.x,
		"z": target_pos.y,
		"queued": true
	});

};


Trigger.prototype.StructureDecayCheck = function(data)
{
	for (const p of [4])
	{
		const structs = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Structure").filter(TriggerHelper.IsInWorld);

		for (const s of structs)
		{
			var cmpCapt = Engine.QueryInterface(s, IID_Capturable);
			if (cmpCapt)
			{
				const c_points = cmpCapt.GetCapturePoints();


				if (c_points[0] > 0)
				{
					c_points[p] += c_points[0];
					c_points[0] = 0;
					cmpCapt.SetCapturePoints(c_points);

				}

			}
		}
	}
};

Trigger.prototype.HealthCheck = function(data)
{
	// find all garissoned units
	const p = 1;
	const units_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "Unit");

	for (const u of units_p)
	{
		const cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
		if (cmpUnitAI.isGarrisoned)
		{
			// warn("Found unit to heal!");

			// check health
			const health_u = Engine.QueryInterface(u, IID_Health);

			const health_needed = health_u.GetMaxHitpoints() - health_u.GetHitpoints();

			/* let heal_amount = this.heal_rate_g;
			if (heal_amount > health_needed)
				heal_amount = health_needed;*/

			health_u.Increase(this.heal_rate_g);
		}
	}

};

Trigger.prototype.ResearchStartingTech = function(data)
{

	const cmpModifiersManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_ModifiersManager);


	for (const p of [1, 2, 4, 5])
	{

		const cmpPlayer = QueryPlayerIDInterface(p);
		const cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);

		if (p == 1)
		{
			// resistance
			cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_01");
			cmpTechnologyManager.ResearchTechnology("soldier_resistance_pierce_01");

			// attack
			cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_01");
			cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_01");
			cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_02");

			// better cavalry
			cmpTechnologyManager.ResearchTechnology("cavalry_health");
			cmpTechnologyManager.ResearchTechnology("cavalry_movement_speed");
			cmpTechnologyManager.ResearchTechnology("nisean_horses");

			// shared drop sites
			cmpTechnologyManager.ResearchTechnology("unlock_shared_dropsites");

			// hero
			cmpModifiersManager.AddModifiers("Hero Piercing Resistance Bonus", {
				"Resistance/Entity/Damage/Pierce": [{ "affects": ["Hero"], "add": 4 }],
			}, cmpPlayer.entity);
			cmpModifiersManager.AddModifiers("Hero Hack Resistance Bonus", {
				"Resistance/Entity/Damage/Hack": [{ "affects": ["Hero"], "add": 4 }],
			}, cmpPlayer.entity);
			cmpModifiersManager.AddModifiers("Hero Crush Resistance Bonus", {
				"Resistance/Entity/Damage/Crush": [{ "affects": ["Hero"], "add": 10 }],
			}, cmpPlayer.entity);


		}
	}
};


Trigger.prototype.SetDiplomacy = function(data)
{
	// everyone is neutral towards 6

	for (const p of [1, 2, 3, 4, 5, 7])
	{
		const cmpPlayer = QueryPlayerIDInterface(p);
		cmpPlayer.SetNeutral(6);
	}

	let cmpPlayer = QueryPlayerIDInterface(6);
	for (const p of [1, 2, 3, 4, 5, 7])
	{
		cmpPlayer.SetNeutral(p);
	}

	// persian defenders is neutral towards other persians so they don't try to retreat to their castles
	cmpPlayer = QueryPlayerIDInterface(5);
	for (const p of [2, 4])
	{
		cmpPlayer.SetNeutral(p);
	}

	cmpPlayer = QueryPlayerIDInterface(7);
	for (const p of [2, 4])
	{
		cmpPlayer.SetNeutral(p);
	}
};


Trigger.prototype.InitGaiaClusters = function(data)
{
	// get all gaia soldiers
	const soldiers = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(0), "Soldier+!Elephant+!Siege").filter(TriggerHelper.IsInWorld);

	// warn("Found "+soldiers.length+" gaia soldiers.");

	// cluster them
	const num_clusters = 6;


	const clusters = this.ClusterUnits(soldiers, num_clusters);
	// warn(uneval(clusters));

	// store so we can check when a unit is killed, who its buddies are
	this.gaiaClusters = clusters;

};


{
	const cmpTrigger = Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger);

	// some constants
	cmpTrigger.pegasusId = 1575;
	cmpTrigger.alexanderId = 1472;
	cmpTrigger.banditTreasureId = 1665;
	cmpTrigger.gaiaFortressId = 1790;

	// some state variables
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

	// healing rate for garrisoned units, every 15 seconds
	cmpTrigger.heal_rate_g = 40;

	// how many additional troops to spawn at various times as a function of current population
	cmpTrigger.ambushAssassinsRatio = 0.2;
	cmpTrigger.banditRatio = 0.2;


	// brit catafalque -- greater vision and movement for infantry, greater range for skirmishers
	// cart catagalque -- + 1 armoer and attack for melee cavalry
	// iber catafalque -- extra health for soldiers
	// mace -- extra loot + slow trickle of metal
	// rome -- + 1 resistance for all units

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

	// garrison towers
	// warn("Garrisoning entities");
	cmpTrigger.DoAfterDelay(5 * 1000, "GarrisonEntities", null);

	// set diplomacy
	cmpTrigger.DoAfterDelay(2 * 1000, "SetDiplomacy", null);

	// starting tech
	cmpTrigger.DoAfterDelay(2 * 1000, "ResearchStartingTech", null);

	// start march
	cmpTrigger.DoAfterDelay(8 * 1000, "StartMarch", null);

	// init gaia clusters
	cmpTrigger.DoAfterDelay(1 * 1000, "InitGaiaClusters", null);


	// debug
	// cmpTrigger.DoAfterDelay(5 * 1000,"RewardTraders",null);
	// cmpTrigger.DoAfterDelay(10 * 1000,"SpawnFortressAttack",null);




	for (const p of [1, 2, 3, 4, 5])
	{
		const cmpPlayer = QueryPlayerIDInterface(p);

		// disable buildings production
		let disTemplates = disabledTemplates(QueryPlayerIDInterface(p, IID_Identity).GetCiv());

		// for players 3,4,5,6 disable templates
		if (p == 3 || p == 4 || p == 5)
		{

			// disable units as well
			const unit_templaes = TriggerHelper.GetTemplateNamesByClasses("Unit", QueryPlayerIDInterface(p, IID_Identity).GetCiv(), undefined, undefined, true);

			disTemplates = disTemplates.concat(unit_templaes);
		}

		cmpPlayer.SetDisabledTemplates(disTemplates);
		// warn("Disabling templates for player "+uneval(p));


		const cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);

		cmpTechnologyManager.ResearchTechnology("phase_town_generic");
		cmpTechnologyManager.ResearchTechnology("phase_city_generic");

		/* if (p == 4 || p == 6)
		{
			cmpTechnologyManager.ResearchTechnology("trade_commercial_treaty");
			cmpTechnologyManager.ResearchTechnology("trade_gain_01");
			cmpTechnologyManager.ResearchTechnology("trade_gain_02");
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
	const data = { "enabled": true };
	cmpTrigger.RegisterTrigger("OnOwnershipChanged", "OwnershipChangedAction", data);

	/* cmpTrigger.DoAfterDelay(300 * 1000,"SpawnAlliedInvasionAttack",null);*/



}
