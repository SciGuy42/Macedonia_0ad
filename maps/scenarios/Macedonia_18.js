warn("loading the triggers file");

// /////////////////////
// Trigger listeners //
// /////////////////////


var unitTargetClass = "Unit+!Ship";
var siegeTargetClass = "Structure";


var triggerPointShipInvasion = "B";
var triggerPointShipSpawn = "A";
var triggerPointCavalryAttack = "K";



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

	// military
	"structures/" + civ + "/barracks",
	"structures/" + civ + "/apartment",
	"structures/" + civ + "/defense_tower",
	"structures/" + civ + "/tower_bolt",
	"structures/" + civ + "/tower_artilery",
	"structures/" + civ + "/elephant_stable",
	"structures/" + civ + "/forge",
	"structures/" + civ + "/arsenal",
	"structures/" + civ + "/fortress",
	"structures/" + civ + "/range",
	"structures/" + civ + "/stable",
	"structures/" + civ + "/temple",
	"structures/" + civ + "/outpost",

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
	"units/" + civ + "/support_female_citizen",

	// embasies
	"structures/cart/embassy_celtic",
	"structures/cart/embassy_italic",
	"structures/cart/embassy_iberian"
];


var textSiegeChoice1 = "Three ships with siege equipment are about to sail from Tyre. Choose the cargo of the first ship!";
var textSiegeChoice2 = "Three ships with siege equipment are about to sail from Tyre. Choose the cargo of the second ship!";
var textSiegeChoice3 = "Three ships with siege equipment are about to sail from Tyre. Choose the cargo of the third ship!";

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

Trigger.prototype.Dialog1 = function(data)
{
	this.ShowText(textSiegeChoice1, "4 Ballistas", "2 Siege Towers");
};


Trigger.prototype.Dialog2 = function(data)
{
	this.ShowText(textSiegeChoice2, "3 Rams", "3 Catapults");
};


Trigger.prototype.Dialog3 = function(data)
{
	this.ShowText(textSiegeChoice3, "2 Catapults", "4 Ballistas");
};


Trigger.prototype.SpawnSiegeEquipment = function(data)
{
	// spawn next to allied dock
	const docks = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(3), "Dock").filter(TriggerHelper.IsInWorld);

	if (docks.length == 0)
		return;

	const site = docks[0];

	const units = [];

	if (this.dialogAnswers[0] == 1)
	{
		units.push("units/athen/siege_oxybeles_packed");
		units.push("units/athen/siege_oxybeles_packed");
		units.push("units/athen/siege_oxybeles_packed");
		units.push("units/athen/siege_oxybeles_packed");
	}
	else
	{
		units.push("units/mace/siege_tower");
		units.push("units/mace/siege_tower");
	}

	if (this.dialogAnswers[1] == 1)
	{
		units.push("units/mace/siege_ram");
		units.push("units/mace/siege_ram");
		units.push("units/mace/siege_ram");
	}
	else
	{
		units.push("units/mace/siege_lithobolos_packed");
		units.push("units/mace/siege_lithobolos_packed");
		units.push("units/mace/siege_lithobolos_packed");
	}

	if (this.dialogAnswers[2] == 1)
	{
		units.push("units/mace/siege_lithobolos_packed");
		units.push("units/mace/siege_lithobolos_packed");
	}
	else
	{
		units.push("units/athen/siege_oxybeles_packed");
		units.push("units/athen/siege_oxybeles_packed");
		units.push("units/athen/siege_oxybeles_packed");
		units.push("units/athen/siege_oxybeles_packed");
	}

	for (const u of units)
	{
		const unit_i = TriggerHelper.SpawnUnits(site, u, 1, 1);
	}

	this.ShowText("Our siege equipment has arrived!", "Great!", "Awesome!");


	const cmpPlayer = QueryPlayerIDInterface(1);
	const cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
	cmpTechnologyManager.ResearchTechnology("silvershields");
	cmpTechnologyManager.ResearchTechnology("archery_tradition");
	cmpPlayer.SetPopulationBonuses(360);

	this.siegeDeliverd = true;
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


Trigger.prototype.VictoryTextFn = function(n)
{
	return markForPluralTranslation(
		"%(lastPlayer)s has won (game mode).",
		"%(players)s and %(lastPlayer)s have won (game mode).",
		n);
};

Trigger.prototype.OwnershipChangedAction = function(data)
{
	// warn("The OnOwnershipChanged event happened with the following data:");
	// warn(uneval(data));

	if (data.entity == 4984)
	{
		if (data.from == 2 && (data.to == -1 || data.to == 1))
		{
			// victory
			TriggerHelper.SetPlayerWon(1, this.VictoryTextFn, this.VictoryTextFn);

		}
	}
};

Trigger.prototype.PlayerCommandAction = function(data)
{


	if (data.cmd.type == "dialog-answer" && this.currentDialog < 3)
	{
		warn("The OnPlayerCommand event happened with the following data:");
		warn(uneval(data));

		if (data.cmd.answer == "button1")
			this.dialogAnswers[this.currentDialog] = 1;
		else
			this.dialogAnswers[this.currentDialog] = 2;

		this.currentDialog++;
		warn(uneval(this.dialogAnswers));
	}
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
				warn("Unloading");
				cmpGarrisonHolder.UnloadAll();
			}
			else if (humans.length == 0 && siegeEngines == 0)
			{
				warn("Done unloading");

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

				warn("Next invasion in " + uneval(this.carthageInvasionAttackInterval));
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
			this.invasion_under_way == false;
		}
	}
};

// garison AI entities with archers
Trigger.prototype.GarrisonEntities = function(data)
{

	for (const p of [1, 2, 4, 5])
	{

		// defense towers
		const towers_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "StoneTower").filter(TriggerHelper.IsInWorld);

		for (const e of towers_p)
		{
			// spawn the garrison inside the tower
			const archers_e = TriggerHelper.SpawnUnits(e, "units/pers/champion_infantry", 5, p);

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
			const archers_e = TriggerHelper.SpawnUnits(e, "units/pers/champion_infantry", 3, p);

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

			const archers_e = TriggerHelper.SpawnUnits(e, "units/pers/champion_infantry", fort_size, p);

			for (const a of archers_e)
			{
				const cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(e, true);
			}
		}

		// wall towers
		if (p == 2)
		{
			const towers_w = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "WallTower").filter(TriggerHelper.IsInWorld);
			for (const e of towers_w)
			{
				// spawn the garrison inside the tower
				const archers_e = TriggerHelper.SpawnUnits(e, "units/pers/champion_infantry", 4, p);

				for (const a of archers_e)
				{
					const cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
					cmpUnitAI.Garrison(e, true);
				}
			}
		}

		if (p == 1 || p == 5)
		{
			const camps_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "MercenaryCamp").filter(TriggerHelper.IsInWorld);

			for (const c of camps_p)
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
	}
};


Trigger.prototype.IdleUnitCheck = function(data)
{
	for (const p of [4, 5])
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




Trigger.prototype.PatrolOrder = function(units, p, site_a, site_b)
{

	if (units.length <= 0)
		return;


	// list of patrol targets
	const patrolTargets = [site_a, site_b];

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
Trigger.prototype.SpawnIntervalPatrol = function(data)
{
	// which player
	const p = 2;

	// see if we can add more patrols
	const units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Unit").filter(TriggerHelper.IsInWorld);
	warn("found " + units.length + " units.");

	if (units.length < this.maxPatrolSize)
	{

		// targets A
		const ccs = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "CivilCentre").filter(TriggerHelper.IsInWorld);

		const forts = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(4), "Fortress").filter(TriggerHelper.IsInWorld);

		const market = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Market").filter(TriggerHelper.IsInWorld);

		const village = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Village").filter(TriggerHelper.IsInWorld);

		const gates = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Gate").filter(TriggerHelper.IsInWorld);


		const targets_A = ccs.concat(forts).concat(market).concat(village).concat(gates);

		// targets B
		const targets_B = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "StoneTower").filter(TriggerHelper.IsInWorld);

		if (targets_A.length == 0 || targets_B.length == 0)
			return;

		// calculate size of spawn units
		const num_patrols = 1;
		const patrol_size = 1;

		const inf_templates = ["units/pers/champion_infantry", "units/pers/champion_infantry", "units/pers/champion_infantry", "units/pers/champion_infantry", "units/pers/infantry_archer_e", "units/pers/infantry_javelineer_e", "units/pers/infantry_javelineer_e", "units/pers/infantry_spearman_e", "units/pers/infantry_spearman_e", "units/pers/champion_elephant"];

		// spawn infantry
		for (let j = 0; j < num_patrols; j++)
		{
			const units = [];
			const site_j = pickRandom(targets_B);

			// melee
			for (let i = 0; i < patrol_size; i++)
			{
				const unit_i = TriggerHelper.SpawnUnits(site_j, pickRandom(inf_templates), 1, p);
				units.push(unit_i[0]);
			}

			// set formation
			TriggerHelper.SetUnitFormation(p, units, pickRandom(unitFormations));


			// send to patrol
			this.PatrolOrder(units, p, pickRandom(targets_A), site_j);

			warn("spawning additional patrol");
		}
	}

	this.DoAfterDelay(20 * 1000, "SpawnIntervalPatrol", null);

};

// garison AI entities with archers
Trigger.prototype.SpawnFanaticSquad = function(data)
{
	// which player
	const p = 4;

	// structures
	const spwan_sites = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(4), "Fortress").filter(TriggerHelper.IsInWorld);

	if (spwan_sites.length == 0)
		return;

	const inf_templates = ["units/pers/champion_infantry", "units/pers/infantry_spearman_a", "units/pers/infantry_spearman_b", "units/pers/infantry_spearman_e", "units/pers/infantry_archer_a", "units/pers/infantry_javelineer_a"];

	const units = [];
	const site_j = pickRandom(spwan_sites);

	const squad_size = Math.floor(Math.random() * (this.fanaticSquadSizeMax - this.fanaticSquadSizeMin)) + this.fanaticSquadSizeMin;
	warn("Squad size = " + uneval(squad_size));
	// let squad_size = 5;

	// melee
	for (let i = 0; i < squad_size; i++)
	{
		const unit_i = TriggerHelper.SpawnUnits(site_j, pickRandom(inf_templates), 1, p);
		units.push(unit_i[0]);
	}

	// set formation
	TriggerHelper.SetUnitFormation(p, units, pickRandom(unitFormations));

	// find target
	const target_player = 1;
	const targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(target_player), "Soldier").filter(TriggerHelper.IsInWorld);

	const target = pickRandom(targets);

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

	// possibly increase min and max
	if (Math.random() < 0.05 && this.fanaticSquadSizeMin < this.fanaticSquadSizeMax - 2)
		this.fanaticSquadSizeMin++;

	if (Math.random() < 0.085)
		this.fanaticSquadSizeMax++;

	warn("new min and max: " + this.fanaticSquadSizeMin + " " + this.fanaticSquadSizeMax);

	this.DoAfterDelay(this.fanaticAttackInterval * 1000, "SpawnFanaticSquad", null);
};

Trigger.prototype.SpawnInitialPatrol = function(data)
{
	// which player
	const p = 2;


	// targets A
	const ccs = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "CivilCentre").filter(TriggerHelper.IsInWorld);

	const forts = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(4), "Fortress").filter(TriggerHelper.IsInWorld);

	const market = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Market").filter(TriggerHelper.IsInWorld);

	const village = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Village").filter(TriggerHelper.IsInWorld);

	const gates = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Gate").filter(TriggerHelper.IsInWorld);


	const targets_A = ccs.concat(forts).concat(market).concat(village).concat(gates);

	// targets B
	const targets_B = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "StoneTower").filter(TriggerHelper.IsInWorld);

	if (targets_A.length == 0 || targets_B.length == 0)
		return;

	// calculate size of spawn units
	const num_patrols = 115;
	const patrol_size = 1;

	const inf_templates = ["units/pers/champion_infantry", "units/pers/infantry_spearman_a", "units/pers/infantry_spearman_b", "units/pers/infantry_spearman_e", "units/pers/infantry_archer_a", "units/pers/infantry_javelineer_a"];

	// spawn infantry
	for (let j = 0; j < num_patrols; j++)
	{
		const units = [];
		const site_j = pickRandom(targets_B);

		// melee
		for (let i = 0; i < patrol_size; i++)
		{
			const unit_i = TriggerHelper.SpawnUnits(site_j, pickRandom(inf_templates), 1, p);
			units.push(unit_i[0]);
		}

		// set formation
		TriggerHelper.SetUnitFormation(p, units, pickRandom(unitFormations));


		// send to patrol
		this.PatrolOrder(units, p, pickRandom(targets_A), site_j);

	}

};

Trigger.prototype.CarthageShipAttack = function(data)
{
	// check if we have docks
	const p = 6;
	const docks = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(6), "Dock").filter(TriggerHelper.IsInWorld);

	if (docks.length == 0)
		return; // attacks end

	// pick spawn site
	const triggerPoint = pickRandom(this.GetTriggerPoints(triggerPointShipSpawn));

	// spawn ship
	const templates = ["units/cart/ship_trireme", "units/cart/ship_bireme"];
	const ship_spawned = TriggerHelper.SpawnUnits(triggerPoint, pickRandom(templates), 1, p);

	// spawn garrison
	for (let j = 0; j < this.cartShipGarrisonSize; ++j)
	{
		const u_j = TriggerHelper.SpawnGarrisonedUnits(ship_spawned[0], "units/cart/champion_infantry", 1, p);
	}

	// get possible targets
	// get possible list of dock targets
	const dock_targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "Dock").filter(TriggerHelper.IsInWorld);

	// get possible trade ship targets -- TODO


	// full list of targets
	const targets = dock_targets;

	// TODO: add any idle ships to attackers


	// order attack
	if (targets.length > 0)
	{
		ProcessCommand(p, {
			"type": "attack",
			"entities": ship_spawned,
			"target": pickRandom(targets),
			"queued": false,
			"allowCapture": false
		});
	}

	this.DoAfterDelay(this.cartShipAttackInterval * 1000, "CarthageShipAttack", null);
};


Trigger.prototype.ToggleTowerOwnershipA = function(data)
{
	// defense towers
	const towers_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(2), "StoneTower").filter(TriggerHelper.IsInWorld);

	// switch ownership
	for (const t of towers_p)
	{
		// change ownership back
		var cmpOwnership = Engine.QueryInterface(t, IID_Ownership);
		cmpOwnership.SetOwner(1);

	}
};

Trigger.prototype.ToggleTowerOwnershipB = function(data)
{
	// defense towers
	const towers_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "StoneTower").filter(TriggerHelper.IsInWorld);

	// switch ownership
	for (const t of towers_p)
	{
		// change ownership back
		var cmpOwnership = Engine.QueryInterface(t, IID_Ownership);
		cmpOwnership.SetOwner(2);

	}
};

Trigger.prototype.SpawnCavalryAttack = function(data)
{
	// check if allied dock exists
	// find target -- allied dock
	const docks = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(3), "Dock").filter(TriggerHelper.IsInWorld);
	if (docks.length == 0)
		return;

	let target = docks[0];

	// if siege is delivered, then alexander becomes the target
	if (this.siegeDeliverd == true)
	{
		const heroes = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "Hero").filter(TriggerHelper.IsInWorld);
		target = heroes[0];
	}

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
	const cav_templates = ["units/pers/cavalry_archer_a", "units/pers/cavalry_javelineer_a", "units/pers/cavalry_spearman_a", "units/pers/cavalry_axeman_a", "units/pers/champion_cavalry", "units/pers/champion_cavalry_archer"];
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

	this.DoAfterDelay(this.cavalryAttackInerval * 1000, "SpawnCavalryAttack", null);

};

Trigger.prototype.CarthageAttack = function(data)
{
	// check if we have camps
	const p = 6;
	const structures = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(6), "Structure").filter(TriggerHelper.IsInWorld);

	if (structures.length == 0)
		return;

	const spawn_site = pickRandom(structures);

	const num_attackers = this.carthageAttackLevel;
	const attackers = [];

	// spawn attackers
	for (let i = 0; i < num_attackers; ++i)
	{

		if (Math.random() < 0.975)
		{
			const units_i = TriggerHelper.SpawnUnits(spawn_site, pickRandom(this.cartAttackerTypes), 1, p);
			attackers.push(units_i[0]);
		}
		else
		{
			// elephant
			const units_i = TriggerHelper.SpawnUnits(spawn_site, "units/cart/champion_elephant", 1, p);
			attackers.push(units_i[0]);
		}
	}


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

	const next_attack_interval_sec = this.carthageAttackInterval + Math.floor(Math.random() * 120);
	warn("Next attack = " + uneval(next_attack_interval_sec));
	this.carthageAttackLevel += this.carthageAttackIncrement;

	this.DoAfterDelay(next_attack_interval_sec * 1000, "CarthageAttack", null);
};


Trigger.prototype.CheckForCC = function(data)
{
	// check if player 1 has built structure
	const structures = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "Structure").filter(TriggerHelper.IsInWorld);

	if (structures.length > 1) // start after at least 2 structures
	{
		// start attacks
		warn("Has structure!");
		this.DoAfterDelay(120 * 1000, "CarthageAttack", null);

		// start ship attacks
		this.DoAfterDelay(240 * 1000, "CarthageShipAttack", null);

		// start naval invasion attacks
		this.DoAfterDelay(360 * 1000, "SpawnNavalInvasionAttack", null);


	}
	else
	{
		this.DoAfterDelay(30 * 1000, "CheckForCC", null);
	}
};


Trigger.prototype.StructureDecayCheck = function(data)
{
	// warn("structure decay check");
	for (const p of [1])
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

{
	const cmpTrigger = Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger);

	// Activate all possible triggers
	/* cmpTrigger.RegisterTrigger("OnStructureBuilt", "StructureBuiltAction", data);
	cmpTrigger.RegisterTrigger("OnConstructionStarted", "ConstructionStartedAction", data);
	cmpTrigger.RegisterTrigger("OnTrainingFinished", "TrainingFinishedAction", data);
	cmpTrigger.RegisterTrigger("OnTrainingQueued", "TrainingQueuedAction", data);
	cmpTrigger.RegisterTrigger("OnResearchFinished", "ResearchFinishedAction", data);
	cmpTrigger.RegisterTrigger("OnResearchQueued", "ResearchQueuedAction", data);*/


	const data = { "enabled": true };
	cmpTrigger.RegisterTrigger("OnOwnershipChanged", "OwnershipChangedAction", data);

	cmpTrigger.RegisterTrigger("OnPlayerCommand", "PlayerCommandAction", data);


	// carthage attacker types
	cmpTrigger.cartAttackerTypes = ["units/cart/champion_infantry", "units/cart/champion_pikeman", "units/cart/infantry_archer_a", "units/cart/champion_cavalry", "units/cart/infantry_slinger_iber_a"];

	// some variables
	cmpTrigger.maxPatrolSize = 180;
	cmpTrigger.fanaticAttackInterval = 85;
	cmpTrigger.fanaticSquadSizeMin = 2;
	cmpTrigger.fanaticSquadSizeMax = 5;
	cmpTrigger.cavalryAttackInerval = 420;

	// answers to dialogue questions
	cmpTrigger.dialogAnswers = [0, 0, 0];
	cmpTrigger.currentDialog = 0;
	cmpTrigger.siegeDeliverd = false;
	cmpTrigger.siegeDeliveryTime = 15 * 60;
	// cmpTrigger.siegeDeliveryTime = 15;

	// garrison towers
	cmpTrigger.DoAfterDelay(5 * 1000, "GarrisonEntities", null);
	cmpTrigger.DoAfterDelay(1 * 1000, "ToggleTowerOwnershipA", null);
	cmpTrigger.DoAfterDelay(1 * 1050, "ToggleTowerOwnershipB", null);


	// spawn patrols of forts
	cmpTrigger.DoAfterDelay(7 * 1000, "SpawnInitialPatrol", null);
	cmpTrigger.DoAfterDelay(10 * 1000, "SpawnIntervalPatrol", null);


	// small persistent attacks
	cmpTrigger.DoAfterDelay(30 * 1000, "SpawnFanaticSquad", null);

	// dialog for siege equipment
	cmpTrigger.DoAfterDelay(2 * 1000, "Dialog1", null);
	cmpTrigger.DoAfterDelay(4 * 1000, "Dialog2", null);
	cmpTrigger.DoAfterDelay(6 * 1000, "Dialog3", null);
	cmpTrigger.DoAfterDelay(cmpTrigger.siegeDeliveryTime * 1000, "SpawnSiegeEquipment", null);

	// cavalry attack targeting dock/blacksmith
	cmpTrigger.DoAfterDelay(cmpTrigger.cavalryAttackInerval * 1000, "SpawnCavalryAttack", null);
	// cmpTrigger.DoAfterDelay(10 * 1000,"SpawnCavalryAttack",null);



	// invasion sea attack
	// cmpTrigger.DoAfterDelay(10 * 1000,"SpawnNavalInvasionAttack",null);

	for (const p of [1, 2, 3, 4])
	{
		const cmpPlayer = QueryPlayerIDInterface(p);


		// disable troop production
		let disTemplates = disabledTemplates(QueryPlayerIDInterface(p, IID_Identity).GetCiv());

		if (p != 1)
		{
			const unit_templates = TriggerHelper.GetTemplateNamesByClasses("Unit", QueryPlayerIDInterface(p, IID_Identity).GetCiv(), undefined, undefined, true);
			disTemplates = disTemplates.concat(unit_templates);
		}

		cmpPlayer.SetDisabledTemplates(disTemplates);

		const cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);

		cmpTechnologyManager.ResearchTechnology("phase_town_generic");
		cmpTechnologyManager.ResearchTechnology("phase_city_generic");

		if (p == 2) // boost forts
		{
			cmpTechnologyManager.ResearchTechnology("tower_health");
			cmpTechnologyManager.ResearchTechnology("tower_range");
			cmpTechnologyManager.ResearchTechnology("tower_watch");
			cmpTechnologyManager.ResearchTechnology("tower_murderholes");
			cmpTechnologyManager.ResearchTechnology("tower_crenellations");
		}

		if (p == 1)
		{
			cmpPlayer.SetPopulationBonuses(400);

			cmpTechnologyManager.ResearchTechnology("unlock_shared_los");
			cmpTechnologyManager.ResearchTechnology("siege_health");
			cmpTechnologyManager.ResearchTechnology("siege_attack");
			cmpTechnologyManager.ResearchTechnology("siege_bolt_accuracy");
			cmpTechnologyManager.ResearchTechnology("unlock_champion_infantry");
			cmpTechnologyManager.ResearchTechnology("unlock_champion_cavalry");
			cmpTechnologyManager.ResearchTechnology("unlock_spies");
			cmpTechnologyManager.ResearchTechnology("cavalry_movement_speed");

			// add some siege techs

		}
	}


	cmpTrigger.RegisterTrigger("OnInterval", "StructureDecayCheck", {
		"enabled": true,
		"delay": 15 * 1000,
		"interval": 15 * 1000,
	});


	cmpTrigger.RegisterTrigger("OnInterval", "IdleUnitCheck", {
		"enabled": true,
		"delay": 30 * 1000,
		"interval": 30 * 1000,
	});


}
