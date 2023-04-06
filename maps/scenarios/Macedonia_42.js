warn("loading the triggers file");

// /////////////////////
// Trigger listeners //
// /////////////////////

var unitTargetClass = "Unit+!Ship";
var siegeTargetClass = "Structure";

var triggerPointsStructureResponseAttack = "B";
var triggerPointsGiftUnit = "J";
var triggerPointsShipPatrol = "K";

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

Trigger.prototype.WalkAndFightRandomtTarget = function(attacker, target_player, target_class)
{
	let target = this.FindRandomTarget(attacker, target_player, target_class);
	if (!target)
	{
		target = this.FindRandomTarget(attacker, target_player, siegeTargetClass);
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

Trigger.prototype.SpawnAttackSquad = function(data)
{

	const p = data.p;
	const site = data.site;
	const templates = data.templates;
	const size = data.size;
	const target_class = data.target_class;
	const target_player = data.target_player;
	let target_pos = data.target_pos;

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

	if (target_pos == undefined)
		target_pos = TriggerHelper.GetEntityPosition2D(target);

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
	for (const p of [1, 2, 3, 4, 5, 6])
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
	// warn("idle unit check");

	for (const p of [2])
	{

		const units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Unit").filter(TriggerHelper.IsInWorld);

		// find patrol targets
		const structs = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Structure").filter(TriggerHelper.IsInWorld);

		if (structs.length > 5)
		{

			for (const u of units)
			{
				const cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
				if (cmpUnitAI)
				{
					if (cmpUnitAI.IsIdle())
					{
						// pick patrol sites
						const sites = [pickRandom(structs), pickRandom(structs), pickRandom(structs), pickRandom(structs), pickRandom(structs)];

						this.PatrolOrderList([u], p, sites);

					}
				}
			}
		}

	}

	for (const p of [3])
	{
		const units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Unit").filter(TriggerHelper.IsInWorld);

		for (const u of units)
		{
			const cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI)
			{
				if (cmpUnitAI.IsIdle())
				{
					this.WalkAndFightClosestTarget(u, 1, "Structure");
				}
			}
		}

	}
};

// garison AI entities with archers
Trigger.prototype.GarrisonEntities = function(data)
{
	for (const p of [2, 3, 4, 5])
	{
		const towers = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "SentryTower").filter(TriggerHelper.IsInWorld);

		for (const c of towers)
		{
			// spawn the garrison inside the tower
			const archers_e = TriggerHelper.SpawnUnits(c, "units/brit/champion_infantry_swordsman", 3, p);

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
			const archers_e = TriggerHelper.SpawnUnits(c, "units/brit/champion_infantry_swordsman", 20, p);

			for (const a of archers_e)
			{
				const cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(c, true);
			}
		}

		// this doesn't work in a25
		/* let outposts = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p),"Outpost").filter(TriggerHelper.IsInWorld);

		for (let c of outposts)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(c, "units/brit/champion_infantry_swordsman",1,p);

			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(c,true);
			}
		}*/
	}
};

Trigger.prototype.VictoryCheck = function(data)
{

	const fortresses = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(2), "Fortress").filter(TriggerHelper.IsInWorld);

	if (fortresses.length == 0)
	{
		TriggerHelper.SetPlayerWon(1, this.VictoryTextFn, this.VictoryTextFn);
	}
	else
	{
		this.DoAfterDelay(30 * 1000, "VictoryCheck", null);
	}
};

Trigger.prototype.OwnershipChangedAction = function(data)
{
	// check if arsenal
	if (data.entity == 2711)
	{
		// spawn some siege
		const unit_i = TriggerHelper.SpawnUnits(data.entity, "units/brit/siege_ram", 3, 1);
	}

	// check if player 2 lost building
	if (data.from == 2 && (data.to == 1 || data.to == -1))
	{
		const id = Engine.QueryInterface(data.entity, IID_Identity);
		// warn(uneval(id));
		if (id != null && id.classesList.includes("Structure"))
		{
			if (Math.random() < 0.2)
			{
				warn("spawning revenge attack!");

				const target_pos = TriggerHelper.GetEntityPosition2D(data.entity);

				this.SpawnStructureDestroyedResponseAttack(target_pos);
			}
		}

		// check if dead units are detected as dead
		const cmpUnitAI = Engine.QueryInterface(data.entity, IID_UnitAI);
		const health_s = Engine.QueryInterface(data.entity, IID_Health);
		/* warn(uneval(data));
		warn(uneval(id));
		warn(uneval(cmpUnitAI));
		warn(uneval(health_s));*/

	}
	else if (data.from == 1 && data.to == -1)
	{
		const id = Engine.QueryInterface(data.entity, IID_Identity);
		const cmpUnitAI = Engine.QueryInterface(data.entity, IID_UnitAI);
		const health_s = Engine.QueryInterface(data.entity, IID_Health);

		/* warn(uneval(data));
		warn(uneval(id));
		warn(uneval(cmpUnitAI));
		warn(uneval(health_s));*/
		if (id != null && id.classesList.includes("Champion") && health_s.hitpoints == 0)
		{
			this.numLost += 1;
			warn("num champs lost = " + this.numLost);
			if (this.numLost >= 15)
			{
				TriggerHelper.SetPlayerWon(2, this.VictoryTextFnEnemy, this.VictoryTextFnEnemy);

			}
		}
	}
	else if (data.from == 4 && (data.to == 1 || data.to == -1)) // check if dock from player 4
	{
		const id = Engine.QueryInterface(data.entity, IID_Identity);

		// warn(uneval(id));
		if (id != null && id.classesList.includes("Dock"))
		{
			// if captured, we get some ships from it
			if (data.to == 1)
			{
				const bonus_ships = TriggerHelper.SpawnUnits(data.entity, "units/brit/ship_merchant", 4, 1);
			}

			this.SpawnDockDestroyedResponseAttack();

		}
		else if (id != null && id.classesList.includes("SentryTower"))
		{
			warn("Tower destroyed!");
			this.SpawnDockDestroyedResponseAttack();

		}

	}
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
		cmpTechnologyManager.ResearchTechnology("heal_rate_2");
		cmpTechnologyManager.ResearchTechnology("heal_range");
		cmpTechnologyManager.ResearchTechnology("heal_range_2");

		// better horses in general
		cmpTechnologyManager.ResearchTechnology("nisean_horses");

		// trader techs
		cmpTechnologyManager.ResearchTechnology("trade_gain_01");
		cmpTechnologyManager.ResearchTechnology("trade_gain_02");
		cmpTechnologyManager.ResearchTechnology("trade_commercial_treaty");
	}

	for (const p of [2, 3, 4, 5])
	{
		const cmpPlayer = QueryPlayerIDInterface(p);
		const cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);

		cmpTechnologyManager.ResearchTechnology("tower_range");
		cmpTechnologyManager.ResearchTechnology("tower_watch");
		cmpTechnologyManager.ResearchTechnology("tower_murderholes");
	}

	for (const p of [6])
	{
		const cmpPlayer = QueryPlayerIDInterface(p);
		const cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);

		cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_01");
		cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_02");
		cmpTechnologyManager.ResearchTechnology("soldier_resistance_pierce_01");
		cmpTechnologyManager.ResearchTechnology("soldier_resistance_pierce_02");
		cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_01");
		cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_01");

	}
};

Trigger.prototype.VictoryTextFnEnemy = function(n)
{
	return markForPluralTranslation(
		"You have lost too many troops! %(lastPlayer)s has won (game mode).",
		"%(players)s and %(lastPlayer)s have won (game mode).",
		n);
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
	if (cmpPlayer.GetState() != "active")
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

Trigger.prototype.CheckForCC = function(data)
{
	// check if player 1 has built structure
	const structures = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "Structure").filter(TriggerHelper.IsInWorld);

	// warn("Found "+structures.length+" structures");

	if (structures.length > 3) // start after at least 2 structures
	{
		// warn("starting attacks");

		// start ship attacks
		this.DoAfterDelay(360 * 1000, "IntervalSpawnAttackShip", null);

		// start ground attacks
		this.DoAfterDelay(600 * 1000, "IntervalSpawnGroundAttack", null);

	}
	else
	{
		this.DoAfterDelay(30 * 1000, "CheckForCC", null);
	}
};

Trigger.prototype.SpawnPatrolShips = function(data)
{
	const p = 5;// red village east of our camp

	const cmpPlayer = QueryPlayerIDInterface(p);
	if (cmpPlayer.GetState() != "active")
	{
		return;
	}

	// spawn point is dock of traders
	const docks = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(3), "Dock").filter(TriggerHelper.IsInWorld);

	warn("spawn ships");

	if (docks.length < 1)
		return;

	const ship_template = "units/maur/ship_trireme";
	const garrison_size = 10;

	const ship_spawned = TriggerHelper.SpawnUnits(pickRandom(docks), ship_template, 1, p);

	TriggerHelper.SpawnGarrisonedUnits(ship_spawned[0], "units/maur/champion_infantry_maceman", garrison_size, p);

	const trigger_sites = this.GetTriggerPoints("A");

	const cmpUnitAI = Engine.QueryInterface(ship_spawned[0], IID_UnitAI);
	if (cmpUnitAI)
	{

		cmpUnitAI.orderQueue = [];
		cmpUnitAI.order = undefined;
		cmpUnitAI.isIdle = true;

		const patrol_sites = [trigger_sites[0], trigger_sites[1]];

		this.PatrolOrderList(ship_spawned, p, patrol_sites);

	}

};

Trigger.prototype.SpawnDockDestroyedResponseAttack = function(data)
{
	const p = 6;

	const cmpPlayer = QueryPlayerIDInterface(p);
	if (cmpPlayer.GetState() != "active")
	{
		return;
	}

	// check if we have fortresses
	const camps = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(2), "Fortress").filter(TriggerHelper.IsInWorld);

	if (camps.length == 0)
	{
		return;
	}

	// check if targets exist
	const target_player = 1;
	const targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(target_player), "Fortress").filter(TriggerHelper.IsInWorld);

	if (targets.length < 1)
	{
		return;
	}

	const target_pos = TriggerHelper.GetEntityPosition2D(targets[0]);

	if (targets.length > 0)
	{
		warn("starting attack in reesponse to structure destroyed");

		const num_waves = 5;

		for (let i = 0; i < num_waves; i++)
		{

			const templates = ["units/brit/champion_infantry_swordsman", "units/gaul/champion_fanatic", "units/brit/infantry_javelineer_e", "units/brit/infantry_slinger_e", "units/brit/war_dog", "units/brit/infantry_spearman_e"];

			const base_size = 4;
			const size_increase = 2;

			// decide how many
			const size = base_size + i * size_increase;

			data = {};

			data.p = p;
			data.templates = templates;
			data.size = size;
			data.target_class = "Unit";
			data.target_player = 1;
			data.site = pickRandom(camps);
			data.target_pos = target_pos;

			this.DoAfterDelay((i + 1) * 10 * 1000, "SpawnAttackSquad", data);
		}
	}
};

Trigger.prototype.SpawnStructureDestroyedResponseAttack = function(target_pos)
{
	const p = 6;

	const cmpPlayer = QueryPlayerIDInterface(p);
	if (cmpPlayer.GetState() != "active")
	{
		return;
	}

	// check if we have fortresses
	const camps = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(2), "Fortress").filter(TriggerHelper.IsInWorld);

	if (camps.length == 0)
	{
		return;
	}

	// check if targets exist
	const target_player = 1;
	const targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(target_player), "Unit").filter(TriggerHelper.IsInWorld);

	if (targets.length > 0)
	{
		warn("starting attack in reesponse to structure destroyed");

		const num_waves = 3;

		for (let i = 0; i < num_waves; i++)
		{

			const templates = ["units/brit/champion_infantry_swordsman", "units/gaul/champion_fanatic", "units/brit/infantry_javelineer_e", "units/brit/infantry_slinger_e", "units/brit/war_dog", "units/brit/infantry_spearman_e"];

			const base_size = 10;
			const size_increase = 2;

			// decide how many
			const size = base_size + i * size_increase;

			const data = {};

			data.p = p;
			data.templates = templates;
			data.size = size;
			data.target_class = "Unit";
			data.target_player = 1;
			data.site = pickRandom(camps);
			data.target_pos = target_pos;

			this.DoAfterDelay((i + 1) * 20 * 1000, "SpawnAttackSquad", data);
		}
	}
};

Trigger.prototype.IntervalSpawnGroundAttack = function(data)
{
	const p = 5;

	const cmpPlayer = QueryPlayerIDInterface(p);
	if (cmpPlayer.GetState() != "active")
	{
		return;
	}

	// check if we have merc camps
	const camps = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "MercenaryCamp").filter(TriggerHelper.IsInWorld);

	if (camps.length == 0)
	{
		return;
	}

	// check if targets exist
	const target_player = 1;
	const targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(target_player), "Structure").filter(TriggerHelper.IsInWorld);

	if (targets.length > 0)
	{
		// warn("starting ground attack");

		const num_waves = 3;

		for (let i = 0; i < num_waves; i++)
		{

			let templates;
			let siege_templates = [];

			const base_size = 14 + this.groundAttackCounter;
			const size_increase = 2 * this.groundAttackCounter;

			if (i == 0)
			{
				templates = ["units/pers/infantry_spearman_a", "units/pers/infantry_spearman_a", "units/pers/infantry_javelineer_a", "units/pers/infantry_archer_a", "units/pers/cavalry_spearman_a", "units/pers/cavalry_axeman_a", "units/pers/cavalry_javelineer_a"];
			}
			else if (i == 1)
			{
				templates = ["units/pers/infantry_spearman_e", "units/pers/infantry_javelineer_e", "units/pers/infantry_archer_e", "units/pers/cavalry_spearman_e", "units/pers/cavalry_axeman_e", "units/pers/cavalry_javelineer_e", "units/pers/champion_infantry", "units/pers/champion_infantry", "units/pers/cavalry_archer_a"];

				siege_templates = ["units/pers/champion_elephant"];

			}
			else if (i == 2)
			{
				templates = ["units/pers/kardakes_hoplite", "units/pers/kardakes_skirmisher", "units/pers/infantry_archer_e", "units/pers/champion_cavalry", "units/pers/cavalry_axeman_e", "units/pers/cavalry_javelineer_e", "units/pers/champion_infantry", "units/pers/cavalry_archer_e"];

				siege_templates = ["units/pers/champion_elephant", "units/pers/siege_ram"];
			}

			templates = templates.concat(siege_templates);

			// decide how many
			const size = base_size + i * size_increase;

			data = {};

			/* let p = data.p;
			let site = data.site;
			let templates = data.templates;
			let size = data.size;
			let target_class = data.target_class;
			let target_player = data.target_player;*/

			data.p = p;
			data.templates = templates;
			data.size = size;
			data.target_class = "Structure";
			data.target_player = 1;
			// data.site = pickRandom(camps);
			data.site = camps[0];

			this.DoAfterDelay((i + 1) * 20 * 1000, "SpawnAttackSquad", data);
		}
	}

	// give some tech
	const cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);

	if (this.groundAttackCounter == 0)
	{
		cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_01");
	}
	else if (this.groundAttackCounter == 1)
	{
		cmpTechnologyManager.ResearchTechnology("soldier_resistance_pierce_01");
		cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_01");
	}
	else if (this.groundAttackCounter == 2)
	{
		cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_01");
		cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_01");
	}
	else if (this.groundAttackCounter == 3)
	{
		cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_02");
		cmpTechnologyManager.ResearchTechnology("soldier_resistance_pierce_02");
	}
	else if (this.groundAttackCounter == 4)
	{
		cmpTechnologyManager.ResearchTechnology("soldier_resistance_pierce_02");
		cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_02");
	}
	else if (this.groundAttackCounter == 5)
	{
		cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_02");
	}
	else if (this.groundAttackCounter == 6)
	{
		cmpTechnologyManager.ResearchTechnology("attack_soldiers_will");
	}

	const next_time = 420 + Math.floor(Math.random(180));
	// warn("spawning next attack in "+next_time+" seconds");
	this.DoAfterDelay(next_time * 1000, "IntervalSpawnGroundAttack", null);

	// increment counter
	this.groundAttackCounter += 1;
};

Trigger.prototype.IntervalSpawnAttackShip = function(data)
{
	// warn("spawning attack ship");

	const p = 5;

	const cmpPlayer = QueryPlayerIDInterface(p);
	if (cmpPlayer.GetState() != "active")
	{
		return;
	}

	const docks = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Dock").filter(TriggerHelper.IsInWorld);

	if (docks.length == 0)
		return;

	const ships = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Ship").filter(TriggerHelper.IsInWorld);

	const ships_pl1 = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "Warship").filter(TriggerHelper.IsInWorld);

	const docks_pl1 = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "Dock").filter(TriggerHelper.IsInWorld);

	if (ships_pl1.length > 0 || docks_pl1.length > 0)
	{
		let ship_template = "units/maur/ship_bireme";
		let garrison_size = 8;

		if (Math.random() < 0.33)
		{
			ship_template = "units/maur/ship_trireme";
			garrison_size = 10;
		}

		const ship_spawned = TriggerHelper.SpawnUnits(pickRandom(docks), ship_template, 1, p);

		TriggerHelper.SpawnGarrisonedUnits(ship_spawned[0], "units/maur/champion_infantry_maceman", garrison_size, p);

		const cmpUnitAI = Engine.QueryInterface(ship_spawned[0], IID_UnitAI);
		if (cmpUnitAI)
		{

			cmpUnitAI.orderQueue = [];
			cmpUnitAI.order = undefined;
			cmpUnitAI.isIdle = true;

			// find target
			let target;

			if (ships_pl1.length > 0)
			{
				target = pickRandom(ships_pl1);
			}
			else
			{
				target = pickRandom(docks_pl1);
			}

			cmpUnitAI.Attack(target);

		}

	}

	const next_attack_delay_secs = 180 + Math.floor(Math.random() * 30);

	this.DoAfterDelay(next_attack_delay_secs * 1000, "IntervalSpawnAttackShip", null);
};

Trigger.prototype.IntervalSpawnPatrolShip = function(data)
{
	const p = 5;

	const cmpPlayer = QueryPlayerIDInterface(p);
	if (cmpPlayer.GetState() != "active")
	{
		return;
	}

	const docks = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Dock").filter(TriggerHelper.IsInWorld);

	if (docks.length <= 1)
		return;

	const ships = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Ship").filter(TriggerHelper.IsInWorld);

	if (ships.length < 5)
	{
		let ship_template = "units/maur/ship_bireme";
		let garrison_size = 8;

		if (Math.random() < 0.25)
		{
			ship_template = "units/maur/ship_trireme";
			garrison_size = 10;
		}

		const ship_spawned = TriggerHelper.SpawnUnits(pickRandom(docks), ship_template, 1, p);

		TriggerHelper.SpawnGarrisonedUnits(ship_spawned[0], "units/maur/champion_infantry_maceman", garrison_size, p);

		const trigger_sites = this.GetTriggerPoints(triggerPointsShipPatrol);

		// this.PatrolOrderList(ship_spawned,p,docks);

		const cmpUnitAI = Engine.QueryInterface(ship_spawned[0], IID_UnitAI);
		if (cmpUnitAI)
		{

			cmpUnitAI.orderQueue = [];
			cmpUnitAI.order = undefined;
			cmpUnitAI.isIdle = true;

			let patrol_sites = null;

			if (docks.length >= 2)
			{
				patrol_sites = docks;
			}
			else if (docks.length == 1)
			{
				patrol_sites = [docks[0], trigger_sites[0], trigger_sites[1]];
			}

			this.PatrolOrderList(ship_spawned, p, patrol_sites);

		}

	}

	this.DoAfterDelay(105 * 1000, "IntervalSpawnPatrolShip", null);
};

Trigger.prototype.IntervalSpawnFanatics = function(data)
{
	warn("fanatics attack!");

	const p = 6;

	const cmpPlayer = QueryPlayerIDInterface(p);
	if (cmpPlayer.GetState() != "active")
	{
		return;
	}

	const camps = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "MercenaryCamp").filter(TriggerHelper.IsInWorld);

	if (camps.length == 0)
	{
		return;
	}

	const templates = ["units/brit/champion_infantry_swordsman", "units/gaul/champion_fanatic", "units/brit/infantry_javelineer_e", "units/brit/infantry_slinger_e", "units/brit/war_dog", "units/brit/infantry_spearman_e"];

	let wave_size = 1;
	const r = Math.random();
	if (r < 0.05)
	{
		wave_size = 7;
	}
	else if (r < 0.1)
	{
		wave_size = 4;
	}

	// spawn unit at each camp
	for (let i = 0; i < wave_size; i++)
	{
		for (const c of camps)
		{
			const unit_i = TriggerHelper.SpawnUnits(c, pickRandom(templates), 1, p);

			this.WalkAndFightRandomtTarget(unit_i[0], 1, "Structure");
		}
	}

	this.DoAfterDelay(15 * 1000, "IntervalSpawnFanatics", null);

};

Trigger.prototype.IntervalSpawnGuards = function(data)
{
	const p = 2;

	const cmpPlayer = QueryPlayerIDInterface(p);
	if (cmpPlayer.GetState() != "active")
	{
		return;
	}

	// compute population limit
	const houses = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "House").filter(TriggerHelper.IsInWorld);
	const barracks = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Barracks").filter(TriggerHelper.IsInWorld);
	const forts = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Fortress").filter(TriggerHelper.IsInWorld);
	const docks = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(4), "Dock").filter(TriggerHelper.IsInWorld);
	const ships = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(4), "Ship").filter(TriggerHelper.IsInWorld);
	const corals = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(5), "Corral").filter(TriggerHelper.IsInWorld);

	// warn(uneval(houses.length)+", "+uneval(barracks.length)+", "+uneval(forts.length)+", "+docks.length+", "+corals.length);

	const pop_limit = 100 + houses.length * 2 + barracks.length * 6 + forts.length * 10 + docks.length * 50 + corals.length * 5 + ships.length * 3;

	const units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Unit").filter(TriggerHelper.IsInWorld);

	warn("current pop = " + units.length + "; pop limit = " + pop_limit);
	if (units.length < pop_limit)
	{
		// decide how many to spawn
		const size = 5 + Math.floor(houses.length / 8) + Math.floor(barracks.length) + docks.length * 5 + corals.length;
		warn("spawning size = " + size);

		// find patrol/spawn sites
		const patrol_sites = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Structure").filter(TriggerHelper.IsInWorld);

		for (let i = 0; i < size; i++)
		{
			if (patrol_sites.length > 5)
			{

				const inf_templates = ["units/brit/champion_infantry_swordsman", "units/gaul/champion_fanatic", "units/brit/infantry_javelineer_e", "units/brit/infantry_slinger_e", "units/brit/war_dog", "units/brit/infantry_spearman_e"];

				// pick patrol sites
				const sites = [pickRandom(patrol_sites), pickRandom(patrol_sites), pickRandom(patrol_sites), pickRandom(patrol_sites), pickRandom(patrol_sites)];

				// spawn the unit
				const unit_i = TriggerHelper.SpawnUnits(pickRandom(sites), pickRandom(inf_templates), 1, p);

				this.PatrolOrderList(unit_i, p, sites);
			}
		}

	}

	this.DoAfterDelay(15 * 1000, "IntervalSpawnGuards", null);

};

Trigger.prototype.SpawnInitialGuards = function(data)
{
	for (const p of [2, 4, 5])
	{
		let size = 200;
		if (p == 4)
			size = 60;
		else if (p == 5)
			size = 90;

		// decide whether player 2 or player 3
		for (let i = 0; i < size; i++)
		{

			// find patrol/spawn sites
			const patrol_sites = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Structure").filter(TriggerHelper.IsInWorld);

			if (patrol_sites.length > 4)
			{

				const inf_templates = ["units/brit/champion_infantry_swordsman", "units/gaul/champion_fanatic", "units/brit/infantry_javelineer_e", "units/brit/infantry_slinger_e", "units/brit/war_dog", "units/brit/infantry_spearman_e"];

				// pick patrol sites
				const sites = [pickRandom(patrol_sites), pickRandom(patrol_sites), pickRandom(patrol_sites), pickRandom(patrol_sites), pickRandom(patrol_sites)];

				// spawn the unit
				const unit_i = TriggerHelper.SpawnUnits(pickRandom(sites), pickRandom(inf_templates), 1, p);

				this.PatrolOrderList(unit_i, p, sites);
			}
		}
	}
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
	const markets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(3), "Market").filter(TriggerHelper.IsInWorld);

	for (let i = 0; i < 20; i++)
	{
		const spawn_market = pickRandom(markets);
		let target_market = spawn_market;
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

Trigger.prototype.PlayerCommandAction = function(data)
{

	// warn(uneval(data));
	if (data.cmd.type == "dialog-answer")
	{
		// warn("The OnPlayerCommand event happened with the following data:");
		// warn(uneval(data));

		if (data.cmd.answer == "button1")
		{
			// subtract resources
			const cmpPlayer = QueryPlayerIDInterface(1);
			// warn(uneval(this.mercOffer));
			cmpPlayer.AddResource("food", -1 * this.mercOffer.total_cost_food);
			cmpPlayer.AddResource("stone", -1 * this.mercOffer.total_cost_stone);
			cmpPlayer.AddResource("metal", -1 * this.mercOffer.total_cost_metal);

			// spawm mercs

			const sites = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(4), "Barracks").filter(TriggerHelper.IsInWorld);

			if (sites.length == 0)
			{
				return;
			}

			const spawn_site = sites[0];

			const units = TriggerHelper.SpawnUnits(spawn_site, this.mercOffer.template, this.mercOffer.size, 1);

			// warn("spawned mercs");
		}

	}
};

Trigger.prototype.ToggleMercs = function(data)
{
	if (this.mercsAvailable == true)
	{
		this.mercsAvailable = false;
	}
	else
	{
		this.mercsAvailable = true;
	}

};

Trigger.prototype.RangeActionMercs = function(data)
{
	// warn("range action triggered");
	// warn(uneval(data));

	if (this.mercsAvailable == true && data.added.length > 0)
	{
		const sizes = [5, 10];
		const templates = ["units/pers/champion_cavalry_archer", "units/pers/cavalry_archer_e", "units/maur/champion_chariot"];

		const costs_stone = [50, 75, 100];
		const costs_food = [25, 50, 75];
		const costs_metal = [10, 20, 30];

		// decide on offer
		const offer_size = pickRandom(sizes);
		const offer_cost_stone = pickRandom(costs_stone);
		const offer_cost_food = pickRandom(costs_food);
		const offer_cost_metal = pickRandom(costs_metal);
		const template = pickRandom(templates);

		const total_cost_stone = offer_size * offer_cost_stone;
		const total_cost_food = offer_size * offer_cost_food;
		const total_cost_metal = offer_size * offer_cost_metal;

		// check if the player has enough
		const cmpPlayer = QueryPlayerIDInterface(1);
		const resources = cmpPlayer.GetResourceCounts();

		if (resources.food > total_cost_food && resources.stone > total_cost_stone && resources.metal > total_cost_metal)
		{

			// save offer information
			this.mercOffer.size = offer_size;
			this.mercOffer.total_cost_stone = total_cost_stone;
			this.mercOffer.total_cost_food = total_cost_food;
			this.mercOffer.total_cost_metal = total_cost_metal;
			this.mercOffer.template = template;

			const offer_text = "You encounter a small camp used by local mercenaries. There are currently " + (offer_size) + " mounted archers available for a total price of " + (total_cost_food) + " food, " + (total_cost_stone) + " stone, and " + (total_cost_metal) + " metal. Would you be willing to hire them?";

			this.ShowText(offer_text, "Yes, we need you", "Perhaps later");

		}

		// set the flag to false
		this.mercsAvailable = false;

		// schedule next available trade
		this.DoAfterDelay(45 * 1000, "ToggleMercs", null);

	}

};

Trigger.prototype.RangeActionTeleportA = function(data)
{

	for (const u of data.added)
	{
		// find template
		const id = Engine.QueryInterface(u, IID_Identity);

		// warn(uneval(id));
		// warn(uneval(id.template));
		let template = id.template.SelectionGroupName;

		// make all citizen soldier templates elite
		if (template == undefined)
		{
			if (id.template.GenericName == "Bactrian Heavy Cavalry Archer")
			{
				template = "units/pers/champion_cavalry_archer";
			}
			else if (id.template.GenericName == "Armored Swordsman")
			{
				template = "units/merc_thorakites";
			}
			else if (id.template.GenericName == "Heavy Skirmisher")
			{
				template = "units/merc_thureophoros";
			}

		}
		else if (template == "units/mace/cavalry_javelineer_b" || template == "units/mace/cavalry_javelineer_a")
		{
			template = "units/mace/cavalry_javelineer_e";
		}
		else if (template == "units/mace/cavalry_spearman_b" || template == "units/mace/cavalry_spearman_a")
		{
			template = "units/mace/cavalry_spearman_e";
		}
		else if (template == "units/mace/infantry_archer_b" || template == "units/mace/infantry_archer_a")
		{
			template = "units/mace/infantry_archer_e";
		}
		else if (template == "units/mace/infantry_javelineer_b" || template == "units/mace/infantry_javelineer_a")
		{
			template = "units/mace/infantry_javelineer_e";
		}
		else if (template == "units/mace/infantry_pikeman_b" || template == "units/mace/infantry_pikeman_a")
		{
			template = "units/mace/infantry_pikeman_e";
		}
		else if (template == "units/mace/infantry_slinger_b" || template == "units/mace/infantry_slinger_a")
		{
			template = "units/mace/infantry_slinger_e";
		}
		else if (template == "units/mace/champion_infantry_spearman")
		{
			template = "units/mace/champion_infantry_spearman_02";
		}

		// ok templates : healer

		// not ok templates GenericName:"Heavy Skirmisher" -> merc skirmisher
		//  GenericName:"Armored Swordsman" -> merc swordsman
		// GenericName:"Bactrian Heavy Cavalry Archer" -> horese archer

		// need to check Rank, can be "Elite", "Advanced"

		/* if (template == undefined)
		{
			warn("overriding template");
			template = "units/pers/champion_cavalry_archer";
		}*/

		// warn(template);

		// kill this unit
		// let health_s = Engine.QueryInterface(u, IID_Health);
		// health_s.Kill();
		Engine.DestroyEntity(u);

		data = {};
		data.site = this.tunnelOutlets[0];
		data.owner = 1;
		data.template = template;
		data.size = 1;

		this.DoAfterDelay(10 * 1000, "SpawnUnit", data);

		// spawn the same template somewhere else
		// let unit_i = TriggerHelper.SpawnUnits(this.tunnelOutlets[0],template,1,1);

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

	// some state variables
	cmpTrigger.groundAttackCounter = 0;
	cmpTrigger.mercsAvailable = true;
	cmpTrigger.mercOffer = {};
	cmpTrigger.numLost = 0;

	// start techs
	cmpTrigger.DoAfterDelay(2 * 1000, "ResearchTechs", null);

	// enemy ships

	cmpTrigger.DoAfterDelay(7 * 1000, "SpawnPatrolShips", null);

	// garrison entities
	cmpTrigger.DoAfterDelay(3 * 1000, "GarrisonEntities", null);

	// spawn initial patrols
	cmpTrigger.DoAfterDelay(5 * 1000, "SpawnInitialGuards", null);

	// start patrol spawns
	cmpTrigger.DoAfterDelay(10 * 1000, "IntervalSpawnGuards", null);

	// repeat attacks
	cmpTrigger.DoAfterDelay(45 * 1000, "IntervalSpawnFanatics", null);

	// victory check
	cmpTrigger.DoAfterDelay(10 * 1000, "VictoryCheck", null);

	// disable templates

	// disable templates
	for (const p of [1, 2, 3, 4, 5])
	{
		const cmpPlayer = QueryPlayerIDInterface(p);

		let disTemplates = disabledTemplates(QueryPlayerIDInterface(p, IID_Identity).GetCiv());

		if (p == 1)
		{
			disTemplates = disTemplates.concat(["units/mace/infantry_pikeman_b", "units/mace/infantry_javelineer_b"]);
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
	for (const p of [3])
	{
		const cmpPlayer = QueryPlayerIDInterface(p);

		// neutral towards all
		for (const p_other of [1, 2, 4, 5, 6])
		{
			cmpPlayer.SetNeutral(p_other);

			const cmpPlayer_other = QueryPlayerIDInterface(p_other);
			cmpPlayer_other.SetNeutral(p);
		}
	}

	for (const p of [6]) // neutral towards allis so doesn't retreat
	{
		const cmpPlayer = QueryPlayerIDInterface(p);

		// neutral towards all
		for (const p_other of [2, 3, 4, 5])
		{
			cmpPlayer.SetNeutral(p_other);
		}
	}

	// triggers
	const data = { "enabled": true };

	// cmpTrigger.RegisterTrigger("OnResearchFinished", "ResearchFinishedAction", data);

	cmpTrigger.RegisterTrigger("OnOwnershipChanged", "OwnershipChangedAction", data);
	// cmpTrigger.RegisterTrigger("OnStructureBuilt", "StructureBuiltAction", data);

	// cmpTrigger.RegisterTrigger("OnPlayerCommand", "PlayerCommandAction", data);

	cmpTrigger.RegisterTrigger("OnInterval", "IdleUnitCheck", {
		"enabled": true,
		"delay": 30 * 1000,
		"interval": 30 * 1000,
	});

	cmpTrigger.RegisterTrigger("OnInterval", "StructureDecayCheck", {
		"enabled": true,
		"delay": 10 * 1000,
		"interval": 10 * 1000,
	});
}
