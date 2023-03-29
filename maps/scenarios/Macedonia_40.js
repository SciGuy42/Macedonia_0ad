warn("loading the triggers file");

// /////////////////////
// Trigger listeners //
// /////////////////////


var unitTargetClass = "Unit+!Ship";
var siegeTargetClass = "Structure";

var triggerPointsStructureResponseAttack = "B";
var triggerPointsGiftUnit = "J";
var triggerPointsPatrol = "K";

// var triggerPointsAdvanceAttack = "A";
// var triggerPointsMainAttack = "B";
// var triggerPointsMace = "C";
// var triggerPointsColonyAmbush = "G";
// var triggerPointsTemple = "H";
// var triggerPointsCavalryAttack = "A";
/* var triggerPointAmbush = "B";
var triggerPointTradeOutpost = "K";
var triggerPointStables = "C";
var triggerPointTraders = "D";
var triggerPointTraderAmbush = "E";
var triggerPointMountainAttack = "F";
var triggerPointMountainAttackSpawn = "G";
var triggerPointTempleQuest = "H";
var triggerPointKidnapperGuardPatrol = "J";
var triggerPointStartAssault = "I";*/



var unitFormations = [
	"special/formations/box",
	"special/formations/battle_line",
	"special/formations/line_closed",
	"special/formations/column_closed"
];


var disabledTemplatesCCs = (civ) => [


	// Expansions
	"structures/" + civ + "/civil_centre",
	"structures/" + civ + "/military_colony",

	// Shoreline
	"structures/brit/crannog"
];

var disabledTemplatesDocksCCs = (civ) => [


	// Expansions
	"structures/" + civ + "/civil_centre",
	"structures/" + civ + "/military_colony",

	// Shoreline
	"structures/" + civ + "/dock",
	"structures/brit/crannog",
	"structures/cart/super_dock",
	"structures/ptol/lighthouse"
];


var disabledTemplates = (civ) => [
	// Economic structures
	"structures/" + civ + "/corral",
	"structures/" + civ + "/farmstead",
	"structures/" + civ + "/field",
	"structures/" + civ + "/storehouse",
	"structures/" + civ + "/rotarymill",
	"structures/" + civ + "/market",

	// military
	"structures/" + civ + "/barracks",
	"structures/" + civ + "/stable",
	"structures/" + civ + "/forge",
	"structures/" + civ + "/arsenal",
	"structures/" + civ + "/range",

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


		warn("[ERROR] Could not find closest target to fight: " + attacker + " and " + target_player + " and " + target_class);
	}

};


Trigger.prototype.FindRandomTarget = function(attacker, target_player, target_class)
{
	let targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(target_player), target_class).filter(TriggerHelper.IsInWorld);

	if (targets.length < 1)
	{
		// no targets, check if any unit is there
		targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(target_player), "Unit").filter(TriggerHelper.IsInWorld);

	}

	// if still no targets return null
	if (targets.length < 1)
	{
		warn("[ERROR] Could not find target!");
		return null;
	}

	return pickRandom(targets);
};


Trigger.prototype.FindClosestTarget = function(attacker, target_player, target_class)
{

	// let targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(target_player), unitTargetClass);

	let targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(target_player), target_class).filter(TriggerHelper.IsInWorld);

	if (targets.length < 1)
	{
		// no targets, check if any unit is there
		targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(target_player), "Unit").filter(TriggerHelper.IsInWorld);

	}

	// if still no targets return null
	if (targets.length < 1)
	{
		warn("[ERROR] Could not find target!");
		return null;
	}

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

Trigger.prototype.SpawnAttackSquad = function(p, site, templates, size, target_class, target_player)
{

	// spawn the units
	const attackers = [];
	for (let i = 0; i < size; i++)
	{
		const unit_i = TriggerHelper.SpawnUnits(site, pickRandom(templates), 1, p);
		attackers.push(unit_i[0]);
	}

	// set formation
	TriggerHelper.SetUnitFormation(p, attackers, pickRandom(unitFormations));

	// make them attack
	const target = this.FindClosestTarget(attackers[0], target_player, target_class);
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


// scenario indendent functions
Trigger.prototype.PatrolOrderList = function(units, p, patrolTargets)
{

	if (units.length <= 0)
		return;

	// warn("targets: "+uneval(patrolTargets));

	for (const patrolTarget of patrolTargets)
	{
		const targetPos = TriggerHelper.GetEntityPosition2D(patrolTarget);
		ProcessCommand(p, {
			"type": "patrol",
			"entities": units,
			"x": targetPos.x - 10.0 + (Math.random() * 20),
			"z": targetPos.y - 10.0 + (Math.random() * 20),
			"targetClasses": {
				"attack": unitTargetClass
			},
			"queued": true,
			"allowCapture": false
		});
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

Trigger.prototype.StructureDecayCheck = function(data)
{
	for (const p of [1, 2, 4, 5])
	{
		const structs = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Structure").filter(TriggerHelper.IsInWorld);
		// warn("checking decay");


		for (const s of structs)
		{
			var cmpCapt = Engine.QueryInterface(s, IID_Capturable);
			if (cmpCapt)
			{
				const c_points = cmpCapt.GetCapturePoints();

				// warn("capture points: "+uneval(cmpCapt.GetCapturePoints()));
				// warn("max: "+uneval(cmpCapt.GetMaxCapturePoints()));

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




Trigger.prototype.IdleUnitCheck = function(data)
{

	this.idleUnitCounter += 1;
	warn("idle unit check" + this.idleUnitCounter);


	// colony militia
	for (const p of [5])
	{
		const spawn_sites = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Structure").filter(TriggerHelper.IsInWorld);


		const inf_units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Unit").filter(TriggerHelper.IsInWorld);

		for (const u of inf_units)
		{
			const cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI)
			{
				if (cmpUnitAI.IsIdle())
				{

					// pick patrol sites
					const sites = [pickRandom(spawn_sites), pickRandom(spawn_sites), pickRandom(spawn_sites), pickRandom(spawn_sites)];

					this.PatrolOrderList([u], p, sites);
				}
			}
		}
	}

	// assault forces
	for (const p of [2])
	{
		const units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Unit").filter(TriggerHelper.IsInWorld);

		const patrol_sites = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(3), "Structure").filter(TriggerHelper.IsInWorld);


		for (const u of units)
		{
			const cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI)
			{
				if (cmpUnitAI.IsIdle())
				{


					const sites = [pickRandom(patrol_sites), pickRandom(patrol_sites), pickRandom(patrol_sites), pickRandom(patrol_sites)];

					this.PatrolOrderList([u], p, sites);
				}
			}
		}

	}
};


// garison AI entities with archers
Trigger.prototype.GarrisonEntities = function(data)
{


	for (const p of [2])
	{
		const towers = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "StoneTower").filter(TriggerHelper.IsInWorld);

		for (const c of towers)
		{
			// spawn the garrison inside the tower
			const archers_e = TriggerHelper.SpawnUnits(c, "units/maur/champion_infantry_maceman", 5, p);

			for (const a of archers_e)
			{
				const cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(c, true);
			}
		}

		const forts = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Fortress").filter(TriggerHelper.IsInWorld);

		for (const c of forts)
		{
			// spawn the garrison inside the tower
			const archers_e = TriggerHelper.SpawnUnits(c, "units/maur/champion_infantry_maceman", 20, p);

			for (const a of archers_e)
			{
				const cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(c, true);
			}
		}
	}
};



Trigger.prototype.VictoryCheck = function(data)
{


	// check how many structures player 2 has
	const structs = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(2), "Structure").filter(TriggerHelper.IsInWorld);

	// warn("found "+uneval(structs.length) + " structs");

	if (structs.length == 0)
	{
		TriggerHelper.SetPlayerWon(1, this.VictoryTextFn, this.VictoryTextFn);

	}
	else
	{
		this.DoAfterDelay(15 * 1000, "VictoryCheck", null);
	}

};





Trigger.prototype.OwnershipChangedAction = function(data)
{
	if (data.from == 5 && data.to == -1)
	{
		this.numBanditsKilled += 1;
		warn("bandit killed");

		const id = Engine.QueryInterface(data.entity, IID_Identity);

		warn(uneval(id));
		warn(uneval(id.template));

		if (this.numBanditsKilled == 5)
		{
			// spawn cavalry attack
			const size = 45;
			const templates = ["units/pers/cavalry_axeman_e", "units/pers/cavalry_spearman_e", "units/pers/cavalry_javelineer_e"];

			warn("spawning cavalry attack");

			const spawn_sites = this.GetTriggerPoints("J");

			for (let i = 0; i < size; i++)
			{
				const unit_i = TriggerHelper.SpawnUnits(pickRandom(spawn_sites), pickRandom(templates), 1, 5);

				const cmpUnitAI = Engine.QueryInterface(unit_i[0], IID_UnitAI);
				if (cmpUnitAI)
				{
					cmpUnitAI.SwitchToStance("violent");

					// find target
					const target = this.FindClosestTarget(unit_i[0], 1, "Unit");
					var cmpTargetPosition = Engine.QueryInterface(target, IID_Position).GetPosition2D();

					cmpUnitAI.WalkAndFight(cmpTargetPosition.x, cmpTargetPosition.y, null);
				}

			}

		}
	}

	// check if workshop
	if (data.entity == 7261)
	{
		// spawn some siege
		const unit_i = TriggerHelper.SpawnUnits(data.entity, "units/maur/siege_ram", 4, 1);

	}

	// if we killed gaia infrantry
	if (data.from == 0 && data.to == -1)
	{
		const id = Engine.QueryInterface(data.entity, IID_Identity);
		// warn(uneval(id));
		if (id != null && id.classesList.indexOf("Infantry") >= 0)
		{
			// warn("gaia attacks");

			// get all gaia units and make them attack
			const units_infantry = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(0), "Infantry").filter(TriggerHelper.IsInWorld);

			for (const u of units_infantry)
			{
				const cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
				if (cmpUnitAI)
				{
					if (cmpUnitAI.IsIdle())
					{
						this.WalkAndFightClosestTarget(u, 1, unitTargetClass);
					}
				}
			}
		}
		else if (id != null && id.classesList.indexOf("Siege") >= 0)
		{
			// fake capture of siege
			const unit_i = TriggerHelper.SpawnUnits(data.entity, "units/ptol/siege_polybolos_packed", 1, 1);

		}

	}


	// check if temple is captured before quest completed
	if (data.from == 0 && data.to == 1)
	{
		const id = Engine.QueryInterface(data.entity, IID_Identity);
		// warn(uneval(id));
		if (id != null && id.classesList.indexOf("Temple") >= 0 && this.questTempleComplete == false)
		{
			const health_s = Engine.QueryInterface(data.entity, IID_Health);
			health_s.Kill();
		}

	}

	/* if (data.entity == 5896) //brit tower, used as debug trigger
	{
		this.LevelAdvance();
	}*/


	// warn(uneval(data));
	// check if we killed gaia infantry
	/* if (data.from == 0 && data.to == -1)
	{
		let id = Engine.QueryInterface(data.entity, IID_Identity);
		//warn(uneval(id));
		if (id != null && id.classesList.indexOf("Infantry") >= 0)
		{
			warn("gaia attacks");

			//get all gaia units and make them attack
			let units_infantry = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(0),"Infantry").filter(TriggerHelper.IsInWorld);

			for (let u of units_infantry)
			{
				this.WalkAndFightClosestTarget(u,1,unitTargetClass);
			}
		}

	}*/
};




Trigger.prototype.ResearchTechs = function(data)
{
	// for playere 1
	for (const p of [1])
	{

		const cmpPlayer = QueryPlayerIDInterface(p);
		const cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);

		// just to make cavalry faster
		cmpTechnologyManager.ResearchTechnology("cavalry_movement_speed");

		// healer techs
		cmpTechnologyManager.ResearchTechnology("heal_rate");
		cmpTechnologyManager.ResearchTechnology("heal_range");

		// skirmishers especially powerful
		cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_01");
		cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_02");
		cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_03");

		// better horses in general
		cmpTechnologyManager.ResearchTechnology("nisean_horses");

		// trader techs
		cmpTechnologyManager.ResearchTechnology("trade_gain_01");

	}

	for (const p of [2])
	{
		const cmpPlayer = QueryPlayerIDInterface(p);
		const cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);

		// visibility bonus
		cmpTechnologyManager.ResearchTechnology("tower_range");
		cmpTechnologyManager.ResearchTechnology("tower_watch");
		cmpTechnologyManager.ResearchTechnology("tower_murderholes");

		cmpTechnologyManager.ResearchTechnology("heal_rate");
		cmpTechnologyManager.ResearchTechnology("heal_range");

	}
};


Trigger.prototype.VictoryTextFn = function(n)
{
	return markForPluralTranslation(
		"%(lastPlayer)s has won (game mode).",
		"%(players)s and %(lastPlayer)s have won (game mode).",
		n);
};


Trigger.prototype.IntervalSpawnGoats = function(data)
{
	const p = 3;

	const cmpPlayer = QueryPlayerIDInterface(p);
	if (cmpPlayer.GetState != "active")
	{
		return;
	}

	const animals = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Animal").filter(TriggerHelper.IsInWorld);

	// warn("Found animals: "+animals.length);

	if (animals.length < 50)
	{
		const num_to_spawn = 50 - animals.length;

		// spawn sites
		const sites = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Corral").filter(TriggerHelper.IsInWorld);

		const unit_i = TriggerHelper.SpawnUnits(pickRandom(sites), "gaia/fauna_goat_trainable", num_to_spawn, p);

	}
};

Trigger.prototype.IntervalSpawnGuards = function(data)
{
	const p = 2;

	const cmpPlayer = QueryPlayerIDInterface(p);
	if (cmpPlayer.GetState() != "active")
	{
		return;
	}


	// compute population limit based on what structures we have
	const barracks = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Barracks").filter(TriggerHelper.IsInWorld);

	const ele_stables = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "ElephantStable").filter(TriggerHelper.IsInWorld);

	const temples = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Temple").filter(TriggerHelper.IsInWorld);

	const towers = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "StoneTower").filter(TriggerHelper.IsInWorld);

	const forts = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Fortress").filter(TriggerHelper.IsInWorld);

	const traders = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Trader").filter(TriggerHelper.IsInWorld);

	warn(uneval(barracks.length) + "\t" + uneval(temples.length) + "\t" + uneval(ele_stables.length) + "\t" + uneval(towers.length) + "\t" + uneval(forts.length));

	const pop_limit = 75 + barracks.length * 20 + ele_stables.length * 25 + towers.length * 3 + forts.length * 20 + traders.length * 5;

	warn("pop limit = " + pop_limit);

	// first check our current population

	const units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Unit").filter(TriggerHelper.IsInWorld);
	warn("current pop = " + units.length);
	if (units.length < pop_limit)
	{
		const spawn_sites = towers.concat(forts);

		// generate list of patrol sites
		const patrol_sites = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(3), "Structure").filter(TriggerHelper.IsInWorld);

		if (spawn_sites.length < 0)
		{
			warn("no spawn sites, must be dead");
			return;
		}

		// how many infantry to spawn
		const spawn_size = 10 + barracks.length + ele_stables.length * 3 + Math.round(traders.length / 2);

		// warn("inf spawn size = "+spawn_size);

		const inf_templates = ["units/maur/champion_infantry_maceman", "units/maur/infantry_spearman_e", "units/maur/infantry_swordsman_e", "units/maur/champion_maiden", "units/maur/infantry_archer_e", "units/maur/champion_maiden", "units/maur/champion_maiden_archer"];
		for (let i = 0; i < spawn_size; i++)
		{

			// pick patrol sites
			const sites = [pickRandom(patrol_sites), pickRandom(patrol_sites), pickRandom(patrol_sites), pickRandom(spawn_sites)];

			// spawn the unit
			const unit_i = TriggerHelper.SpawnUnits(pickRandom(spawn_sites), pickRandom(inf_templates), 1, p);

			this.PatrolOrderList(unit_i, p, sites);
		}

		// spawn healers
		const num_healers = temples.length * 3;
		for (let i = 0; i < num_healers; i++)
		{

			// pick patrol sites
			const sites = [pickRandom(patrol_sites), pickRandom(patrol_sites), pickRandom(patrol_sites), pickRandom(spawn_sites)];

			// spawn the unit
			const unit_i = TriggerHelper.SpawnUnits(pickRandom(spawn_sites), "units/maur/support_healer_e", 1, p);

			this.PatrolOrderList(unit_i, p, sites);
		}

		// spawn elephants
		const num_elephants = ele_stables.length * 3;
		const ele_templates = ["units/maur/champion_elephant", "units/maur/elephant_archer_e"];
		for (let i = 0; i < num_elephants; i++)
		{

			// pick patrol sites
			const sites = [pickRandom(patrol_sites), pickRandom(patrol_sites), pickRandom(patrol_sites), pickRandom(spawn_sites)];

			// spawn the unit
			const unit_i = TriggerHelper.SpawnUnits(pickRandom(spawn_sites), pickRandom(ele_templates), 1, p);

			this.PatrolOrderList(unit_i, p, sites);
		}


	}


	this.DoAfterDelay(20 * 1000, "IntervalSpawnGuards", null);

	warn("end spawn guards");

};



Trigger.prototype.SpawnTraders = function(data)
{
	const e = 2;

	const cmpPlayer = QueryPlayerIDInterface(e);
	if (cmpPlayer.GetState() != "active")
	{
		return;
	}

	// make list of own markets
	const markets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(3), "Trade").filter(TriggerHelper.IsInWorld);
	const docks = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(3), "Dock").filter(TriggerHelper.IsInWorld);



	for (let i = 0; i < 20; i++)
	{
		const spawn_market = pickRandom(markets);
		let target_market = pickRandom(docks);
		while (target_market == spawn_market)
		{
			target_market = pickRandom(markets);
		}

		const trader = TriggerHelper.SpawnUnits(spawn_market, "units/maur/support_trader", 1, e);
		const cmpUnitAI = Engine.QueryInterface(trader[0], IID_UnitAI);

		cmpUnitAI.UpdateWorkOrders("Trade");
		cmpUnitAI.SetupTradeRoute(target_market, spawn_market, null, true);




	}
};


Trigger.prototype.SpawnDesertRaiders = function(data)
{

	const p = 5;

	// check if we have structure
	const spawn_sites = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Structure").filter(TriggerHelper.IsInWorld);


	for (let i = 0; i < 90; i++)
	{
		const templates = ["units/pers/champion_infantry", "units/pers/infantry_archer_e", "units/pers/infantry_javelineer_e", "units/pers/kardakes_hoplite"];

		// pick patrol sites
		const sites = [pickRandom(spawn_sites), pickRandom(spawn_sites), pickRandom(spawn_sites), pickRandom(spawn_sites)];

		// spawn the unit
		const unit_i = TriggerHelper.SpawnUnits(pickRandom(spawn_sites), pickRandom(templates), 1, p);

		this.PatrolOrderList(unit_i, p, sites);
	}

};




Trigger.prototype.QuestTempleComplete = function(data)
{
	this.questTempleComplete = true;

	const temples = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(0), "Temple").filter(TriggerHelper.IsInWorld);

	// change ownership
	var cmpOwnership = Engine.QueryInterface(temples[0], IID_Ownership);
	cmpOwnership.SetOwner(1);

	// show text
	this.ShowText("The monks thank you for your help. Their monastery is at your service.", "Thanks!", "OK");



};

Trigger.prototype.RangeActionTemple = function(data)
{
	if (this.questTempleGiven == false && this.questTempleComplete == false)
	{
		// check if player 5 has units left
		const units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(5), "Unit").filter(TriggerHelper.IsInWorld);

		if (units.length == 0)
		{
			// complete quest
			this.QuestTempleComplete();

		}
		else
		{
			// give quest
			this.questTempleGiven = true;

			this.ShowText("You encounter a small monastery. The monks welcome you and promise to help you if you defeat the dessert raiders who have been harassing them for weeks now.\n\nNote: you only need to kill all units (not structures) to consider this task complete. Come back here once the task is done.", "We'll see what we can.", "OK");
		}
	}
	else if (this.questTempleComplete == false)
	{
		const units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(5), "Unit").filter(TriggerHelper.IsInWorld);

		if (units.length == 0)
		{
			// complete quest
			this.QuestTempleComplete();

		}

	}


};

Trigger.prototype.SpawnUnit = function(data)
{
	const site = data.site;
	const template = data.template;
	const owner = data.owner;
	const num = data.size;

	// warn("spawning unit: "+uneval(data));

	const unit_i = TriggerHelper.SpawnUnits(site, template, num, owner);

};

Trigger.prototype.RangeActionTeleportA = function(data)
{

	for (const u of data.added)
	{
		// find template
		const id = Engine.QueryInterface(u, IID_Identity);

		// warn(uneval(id.classesList));
		// warn(uneval(id.classesList.indexOf("Cavalry")));
		if (id != null && id.classesList.indexOf("Cavalry") < 0)
		{

			// warn(uneval(id));
			// warn(uneval(id.template));
			const template = id.template.SelectionGroupName;

			// warn(uneval());
			let new_template = null;
			if (template)
			{
				new_template = template;
			}
			else if (id.template.GenericName)
			{
				if (id.template.GenericName == "Bactrian Heavy Cavalry Archer")
				{
					new_template = "units/pers/champion_cavalry_archer";

				}
				else if (id.template.GenericName == "Thracian Black Cloak")
				{
					new_template = "units/mace/champion_infantry_swordsman";

				}
				else if (id.template.GenericName == "Bolt Shooter")
				{
					new_template = "units/ptol/siege_polybolos_packed";
				}
				else if (id.template.GenericName == "Iphicrates")
				{
					new_template = "units/athen/hero_iphicrates";
				}




			}



			if (new_template)
			{
				// check a few specific bugs
				if (new_template == "template_unit_support_healer")
				{
					new_template = "units/mace/support_healer_e";

				}


				// warn("new templatte = "+new_template);


				Engine.DestroyEntity(u);

				const data = {};
				data.site = this.tunnelOutlets[0];
				data.owner = 1;
				data.template = new_template;
				data.size = 1;

				this.DoAfterDelay(10 * 1000, "SpawnUnit", data);
			}
		}
	}
};


Trigger.prototype.RangeActionTeleportB = function(data)
{

	for (const u of data.added)
	{
		// find template
		const id = Engine.QueryInterface(u, IID_Identity);

		// warn(uneval(id.classesList));
		// warn(uneval(id.classesList.indexOf("Cavalry")));
		if (id != null && id.classesList.indexOf("Cavalry") < 0)
		{

			// warn(uneval(id));
			// warn(uneval(id.template));
			const template = id.template.SelectionGroupName;

			// warn(uneval());
			let new_template = null;
			if (template)
			{
				new_template = template;
			}
			else if (id.template.GenericName)
			{
				if (id.template.GenericName == "Bactrian Heavy Cavalry Archer")
				{
					new_template = "units/pers/champion_cavalry_archer";

				}
				else if (id.template.GenericName == "Thracian Black Cloak")
				{
					new_template = "units/mace/champion_infantry_swordsman";
				}
				else if (id.template.GenericName == "Bolt Shooter")
				{
					new_template = "units/ptol/siege_polybolos_packed";
				}
				else if (id.template.GenericName == "Iphicrates")
				{
					new_template = "units/athen/hero_iphicrates";
				}

			}



			if (new_template)
			{
				// check a few specific bugs
				if (new_template == "template_unit_support_healer")
				{
					new_template = "units/mace/support_healer_e";

				}


				// warn("new templatte = "+new_template);


				Engine.DestroyEntity(u);

				const data = {};
				data.site = this.tunnelOutlets[1];
				data.owner = 1;
				data.template = new_template;
				data.size = 1;

				this.DoAfterDelay(10 * 1000, "SpawnUnit", data);
			}
		}
	}
};

Trigger.prototype.RangeActionTeleportC = function(data)
{

	for (const u of data.added)
	{
		// find template
		const id = Engine.QueryInterface(u, IID_Identity);

		// warn(uneval(id.classesList));
		// warn(uneval(id.classesList.indexOf("Cavalry")));
		if (id != null && id.classesList.indexOf("Cavalry") < 0)
		{

			// warn(uneval(id));
			// warn(uneval(id.template));
			const template = id.template.SelectionGroupName;

			// warn(uneval());
			let new_template = null;
			if (template)
			{
				new_template = template;
			}
			else if (id.template.GenericName)
			{
				if (id.template.GenericName == "Bactrian Heavy Cavalry Archer")
				{
					new_template = "units/pers/champion_cavalry_archer";

				}
				else if (id.template.GenericName == "Thracian Black Cloak")
				{
					new_template = "units/mace/champion_infantry_swordsman";
				}
				else if (id.template.GenericName == "Bolt Shooter")
				{
					new_template = "units/ptol/siege_polybolos_packed";
				}
				else if (id.template.GenericName == "Iphicrates")
				{
					new_template = "units/athen/hero_iphicrates";
				}
			}



			if (new_template)
			{
				// check a few specific bugs
				if (new_template == "template_unit_support_healer")
				{
					new_template = "units/mace/support_healer_e";

				}


				warn("new templatte = " + new_template);


				Engine.DestroyEntity(u);

				const data = {};
				data.site = this.tunnelOutlets[2];
				data.owner = 1;
				data.template = new_template;
				data.size = 1;

				this.DoAfterDelay(10 * 1000, "SpawnUnit", data);
			}
		}
	}
};

Trigger.prototype.RangeActionTeleportD = function(data)
{

	for (const u of data.added)
	{
		// find template
		const id = Engine.QueryInterface(u, IID_Identity);

		// warn(uneval(id.classesList));
		// warn(uneval(id.classesList.indexOf("Cavalry")));
		if (id != null && id.classesList.indexOf("Cavalry") < 0)
		{

			// warn(uneval(id));
			// warn(uneval(id.template));
			const template = id.template.SelectionGroupName;

			// warn(uneval());
			let new_template = null;
			if (template)
			{
				new_template = template;
			}
			else if (id.template.GenericName)
			{
				if (id.template.GenericName == "Bactrian Heavy Cavalry Archer")
				{
					new_template = "units/pers/champion_cavalry_archer";

				}
				else if (id.template.GenericName == "Thracian Black Cloak")
				{
					new_template = "units/mace/champion_infantry_swordsman";

				}
				else if (id.template.GenericName == "Bolt Shooter")
				{
					new_template = "units/ptol/siege_polybolos_packed";
				}
				else if (id.template.GenericName == "Iphicrates")
				{
					new_template = "units/athen/hero_iphicrates";
				}
			}



			if (new_template)
			{
				// check a few specific bugs
				if (new_template == "template_unit_support_healer")
				{
					new_template = "units/mace/support_healer_e";

				}


				warn("new templatte = " + new_template);


				Engine.DestroyEntity(u);

				const data = {};
				data.site = this.tunnelOutlets[3];
				data.owner = 1;
				data.template = new_template;
				data.size = 1;

				this.DoAfterDelay(10 * 1000, "SpawnUnit", data);
			}
		}
	}

};


/* Random maps:
 * 	India - lake in middle, mostly dry empty
 *  Kerala - sea on one side, green
 *  Ratumacos - windy river
 *  Field of Meroe -- one straight river on the side, need to get rid of african animalsn
 *  Belgian Uplands -- need to add india trees, has 2 tiny lakes
 *
 * Skirmish:
 *  Deccan Plateau (2)
 *  Gambia River (3) rivers and desert
 *  Golden Island (2) -- island surround by river
 *  Two Seas (6) big but symmetrical
 *  Punjab (2)
 *
 */


{


	const cmpTrigger = Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger);

	// some constants (that may change)


	// state variables
	cmpTrigger.questTempleGiven = false;
	cmpTrigger.questTempleComplete = false;
	cmpTrigger.numBanditsKilled = 0;

	cmpTrigger.idleUnitCounter = 0;

	// decide on tunnel outlets
	const houses = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(3), "House").filter(TriggerHelper.IsInWorld);

	cmpTrigger.tunnelOutlets = [];
	for (let i = 0; i < 4; i++)
	{
		cmpTrigger.tunnelOutlets.push(pickRandom(houses));
	}

	// warn("outlets: "+uneval(cmpTrigger.tunnelOutlets));


	// start techs
	cmpTrigger.DoAfterDelay(1 * 1000, "ResearchTechs", null);

	// garrison entities
	cmpTrigger.DoAfterDelay(3 * 1000, "GarrisonEntities", null);


	// start patrol spawns
	cmpTrigger.DoAfterDelay(3 * 1000, "SpawnDesertRaiders", null);

	cmpTrigger.DoAfterDelay(2 * 1000, "IntervalSpawnGuards", null);



	// debug
	// cmpTrigger.DoAfterDelay(20 * 1000,"QuestTempleComplete",null);

	// start traders
	cmpTrigger.DoAfterDelay(5 * 1000, "SpawnTraders", null);

	// victory check
	cmpTrigger.DoAfterDelay(6 * 1000, "VictoryCheck", null);

	// disable templates

	// disable templates
	for (const p of [1, 2, 3, 4, 5])
	{
		const cmpPlayer = QueryPlayerIDInterface(p);

		// disable templates -- nobody can build docks or civil centre


		let disTemplates = disabledTemplates(QueryPlayerIDInterface(p, IID_Identity).GetCiv());
		// warn("disabled template = "+uneval(disTemplates));

		if (p == 1)
		{
			// disTemplates = disTemplates.concat(["units/mace/hero_alexander_iii","units/mace/hero_craterus","units/mace/hero_philip_ii","units/mace/hero_demetrius_i","units/mace/hero_pyrrhus_i"]);
			disTemplates = disTemplates.concat(["units/mace/ship_bireme", "units/mace/ship_trireme"]);
		}

		cmpPlayer.SetDisabledTemplates(disTemplates);

		// add some tech
		const cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);

		cmpTechnologyManager.ResearchTechnology("phase_town_generic");
		cmpTechnologyManager.ResearchTechnology("phase_city_generic");

		// no pop limit
		if (p == 1)
		{
			cmpTechnologyManager.ResearchTechnology("unlock_shared_los");
			cmpPlayer.SetPopulationBonuses(300);
		}
	}

	// diplomacy
	for (const p of [1])
	{
		const cmpPlayer = QueryPlayerIDInterface(p);

		// neutral towards player 3 and 4
		for (const p_other of [3, 4])
		{
			cmpPlayer.SetNeutral(p_other);

			const cmpPlayer_other = QueryPlayerIDInterface(p_other);
			cmpPlayer_other.SetNeutral(p);
		}
	}

	// triggers
	const data = { "enabled": true };

	cmpTrigger.RegisterTrigger("OnRange", "RangeActionTemple", {
		"entities": cmpTrigger.GetTriggerPoints("K"), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 15,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});

	cmpTrigger.RegisterTrigger("OnRange", "RangeActionTeleportA", {
		"entities": cmpTrigger.GetTriggerPoints("A"), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 10,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});

	cmpTrigger.RegisterTrigger("OnRange", "RangeActionTeleportB", {
		"entities": cmpTrigger.GetTriggerPoints("B"), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 10,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});

	cmpTrigger.RegisterTrigger("OnRange", "RangeActionTeleportC", {
		"entities": cmpTrigger.GetTriggerPoints("C"), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 10,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});

	cmpTrigger.RegisterTrigger("OnRange", "RangeActionTeleportD", {
		"entities": cmpTrigger.GetTriggerPoints("D"), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 10,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});

	// cmpTrigger.RegisterTrigger("OnResearchFinished", "ResearchFinishedAction", data);

	cmpTrigger.RegisterTrigger("OnOwnershipChanged", "OwnershipChangedAction", data);
	// cmpTrigger.RegisterTrigger("OnStructureBuilt", "StructureBuiltAction", data);

	// cmpTrigger.RegisterTrigger("OnPlayerCommand", "PlayerCommandAction", data);


	cmpTrigger.RegisterTrigger("OnInterval", "IntervalSpawnGoats", {
		"enabled": true,
		"delay": 10 * 1000,
		"interval": 45 * 1000,
	});

	cmpTrigger.RegisterTrigger("OnInterval", "IdleUnitCheck", {
		"enabled": true,
		"delay": 5 * 1000,
		"interval": 30 * 1000,
	});

	cmpTrigger.RegisterTrigger("OnInterval", "StructureDecayCheck", {
		"enabled": true,
		"delay": 10 * 1000,
		"interval": 10 * 1000,
	});
}
