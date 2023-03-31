warn("loading the triggers file");

// /////////////////////
// Trigger listeners //
// /////////////////////

var unitTargetClass = "Unit+!Ship";
var siegeTargetClass = "Structure";

var triggerPointsElephantAmbush = "A";
var triggerPointsBarracksCaptives = "B";
var triggerPointsCrazedHeroes = "C";
var triggerPointsRiverBanditsQuest = "D";
var triggerPointsArcherTraining = "E";
var triggerPointsGreekColony = "F";
/* var triggerPointsArrival = "B";
var triggerPointsArcherAmbush = "C";
var triggerPointsTemple = "D";
var triggerPointsMercs = "E";
var triggerPointsElephantTraders = "F";
var triggerPointsCaveRaiders = "G";
var triggerPointsCaveRaidersTargets = "H";
var triggerPointsCaveFortress = "I";*/

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
	const use_formation = data.use_formation;

	// spawn the units
	const attackers = [];
	for (let i = 0; i < size; i++)
	{
		const unit_i = TriggerHelper.SpawnUnits(site, pickRandom(templates), 1, p);
		attackers.push(unit_i[0]);
	}

	// set formation
	if (use_formation == undefined || use_formation == true)
	{
		TriggerHelper.SetUnitFormation(p, attackers, pickRandom(unitFormations));
	}

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
	for (const p of [2, 3, 4, 5, 6, 7, 8])
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

Trigger.prototype.MonitorCrazedHeroesQuest = function(data)
{
	if (this.crazedHeroesInProgress == true)
	{
		const p = 6;
		const units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Hero").filter(TriggerHelper.IsInWorld);

		const nomad_temple = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(8), "Temple").filter(TriggerHelper.IsInWorld)[0];

		// make them attack
		for (const u of units)
		{
			const cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI)
			{
				if (cmpUnitAI.IsIdle())
				{
					this.WalkAndFightClosestTarget(u, 1, "Hero");
				}
			}

			// check if any of them are close to the gaia temple
			const d = PositionHelper.DistanceBetweenEntities(u, nomad_temple);

			if (d < 35)
			{
				this.QuestCrazedHeroesComplete();
				return;
			}
		}

		this.DoAfterDelay(5 * 1000, "MonitorCrazedHeroesQuest", null);
	}
};

Trigger.prototype.MonitorRiverBanditsQuestQuest = function(data)
{

};

Trigger.prototype.MonitorBarracksCaptivesQuest = function(data)
{
	// for barracks captives quest
	if (this.barracksCaptivesQuestStarted == true && this.barracksCaptivesQuestDone == false)
	{
		const p = 6;
		const units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Soldier").filter(TriggerHelper.IsInWorld);

		if (units.length == 0)
		{
			// quest is done, give reward
			this.QuestBarracksCaptivesComplete();
		}
		else
		{
			// make them attack
			for (const u of units)
			{
				const cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
				if (cmpUnitAI)
				{
					if (cmpUnitAI.IsIdle())
					{
						this.WalkAndFightClosestTarget(u, 1, "Hero");
					}
				}
			}

			this.DoAfterDelay(5 * 1000, "MonitorBarracksCaptivesQuest", null);
		}
	}

};

Trigger.prototype.IdleUnitCheckFast = function(data)
{

	// check for elephants
	if (this.elephantAmbushTriggered == true && this.elephantAmbushEnded == false)
	{
		// find all elephants by player 6 and make them attack
		const p = 6;
		const target_player = 1;
		const units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Elephant").filter(TriggerHelper.IsInWorld);

		// make them attack
		for (const u of units)
		{
			const cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI)
			{
				if (cmpUnitAI.IsIdle())
				{
					this.WalkAndFightClosestTarget(u, 1, "Hero");
				}
			}
		}
	}

};

Trigger.prototype.IdleUnitCheck = function(data)
{
	// warn("idle unit check");

	/* for (let p of [2])
	{

		let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Unit").filter(TriggerHelper.IsInWorld);

		//find patrol targets
		let structs = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Structure").filter(TriggerHelper.IsInWorld);

		if (structs.length > 5)
		{

			for (let u of units)
			{
				let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
				if (cmpUnitAI)
				{
					if (cmpUnitAI.IsIdle()){
						//pick patrol sites
						let sites = [pickRandom(structs),pickRandom(structs),pickRandom(structs),pickRandom(structs),pickRandom(structs)];

						this.PatrolOrderList([u],p,sites);

					}
				}
			}
		}

	}

	for (let p of [3])
	{
		let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Unit").filter(TriggerHelper.IsInWorld);

		for (let u of units)
		{
			let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI)
			{
				if (cmpUnitAI.IsIdle())
				{
					this.WalkAndFightClosestTarget(u,1,"Structure");
				}
			}
		}

	}*/
};

// garison AI entities with archers
Trigger.prototype.GarrisonEntities = function(data)
{
	for (const p of [7])
	{
		const towers = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "StoneTower").filter(TriggerHelper.IsInWorld);

		for (const c of towers)
		{
			// spawn the garrison inside the tower
			const archers_e = TriggerHelper.SpawnUnits(c, "units/pers/infantry_archer_e", 5, p);

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
			const archers_e = TriggerHelper.SpawnUnits(c, "units/pers/infantry_archer_e", 20, p);

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

	// check to see that player 2 has no units
	const ccs_2 = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(2), "CivilCentre").filter(TriggerHelper.IsInWorld);
	const ccs_3 = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(3), "CivilCentre").filter(TriggerHelper.IsInWorld);
	const ccs_5 = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(5), "CivilCentre").filter(TriggerHelper.IsInWorld);

	// warn(ccs_2.length +" "+ccs_3.length + " " + ccs_5.length);

	if (ccs_2.length <= 0 && ccs_3.length <= 0 && ccs_5.length <= 0)
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
	// RULES

	// can't capture gaia buildings (but siege is ok)
	if (data.from == 0 && data.to == 1 && this.greekColonyEvent == false)
	{
		const id = Engine.QueryInterface(data.entity, IID_Identity);
		// warn(uneval(id));
		if (id != null)
		{
			if (id.classesList.includes("Siege"))
			{
				warn("Empty block statement");
			}
			else
			{
				const health_s = Engine.QueryInterface(data.entity, IID_Health);
				health_s.Kill();

			}
		}
	}

	// if we killl gaia siege, we spawn copy
	if (data.from == 0 && data.to == -1)
	{
		const id = Engine.QueryInterface(data.entity, IID_Identity);
		// warn(uneval(id));
		if (id != null)
		{
			if (id.classesList.includes("Siege"))
			{
				const unit_i = TriggerHelper.SpawnUnits(data.entity, "units/mace/siege_lithobolos_packed", 1, 1);
			}
		}

	}

	// QUEST RELATED TRIGGERS

	if (this.elephantAmbushTriggered == true && this.elephantAmbushEnded == false)
	{
		if (data.from == 6 && data.to == -1)
		{
			const id = Engine.QueryInterface(data.entity, IID_Identity);
			// warn(uneval(id));
			if (id != null)
			{
				if (id.classesList.includes("Elephant"))
				{
					// find how many elephants remain
					const units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(6), "Elephant").filter(TriggerHelper.IsInWorld);
					// warn("elephants = "+units.length);
					if (units.length == 0)
					{
						this.elephantAmbushEnded = true;

						this.QuestElephantAmbushComplete();
					}

				}

			}
		}
	}

	if (this.riverBanditsQuestGiven == true && this.riverBanditsQuestComplete == false)
	{
		// checi if camp
		if (data.entity == this.riverBanditsCamp)
		{
			// warn("river quest done");

			// flip flag
			this.riverBanditsQuestComplete = true;

			// reward
			this.QuestRiverBanditsComplete();
		}

		// spawn cavalry with small probability
		if (data.from == 0 && data.to == -1)
		{
			const p = 0;

			// check distance from camp
			const camps = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "MercenaryCamp").filter(TriggerHelper.IsInWorld);

			if (camps.length > 0)
			{
				const camp = camps[0];

				// find distance between dead entity and camp
				const d = PositionHelper.DistanceBetweenEntities(data.entity, camp);
				// warn(d);
				if (d < 250)
				{
					// with some probability, spawn cavalry attackers from cave
					if (Math.random() < 0.125)
					{
						const templates = ["units/brit/cavalry_swordsman_a", "units/brit/champion_chariot", "units/brit/cavalry_swordsman_b", "units/brit/cavalry_swordsman_b"];

						const site = 21865; // skeleton in front of cave, can't be looked up with code

						const unit_i = TriggerHelper.SpawnUnits(site, pickRandom(templates), 1, p);

						const target_pos = TriggerHelper.GetEntityPosition2D(data.entity);

						ProcessCommand(p, {
							"type": "attack-walk",
							"entities": unit_i,
							"x": target_pos.x,
							"z": target_pos.y,
							"queued": true,
							"targetClasses": {
								"attack": "Hero"
							},
							"allowCapture": false
						});
					}
				}
			}

		}

	}

	// check if structure from persian  rebels
	if (this.rebelFortressAttackStarted == false)
	{
		if (data.from == 7 && data.to == -1)
		{
			// warn("starting rebel fortress attack");

			this.DoAfterDelay(1 * 1000, "SpawnFortressAttack", data);

			this.rebelFortressAttackStarted = true;
		}
	}

	// check if structure from persian villlages
	if ((data.from == 2 || data.from == 3 || data.from == 5) && (data.to == -1 || data.to == 1))
	{
		const id = Engine.QueryInterface(data.entity, IID_Identity);
		// warn(uneval(id));
		if (id != null)
		{
			if (id.classesList.includes("Structure"))
			{
				if (Math.random() < 0.25)
				{
					// warn("spawning structure response attack");

					// find CC of player who lost structure
					const ccs = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(data.from), "CivilCentre").filter(TriggerHelper.IsInWorld);

					const site = pickRandom(ccs);

					const templates = ["units/pers/infantry_archer_e", "units/pers/infantry_spearman_e", "units/pers/champion_infantry", "units/pers/kardakes_hoplite", "units/pers/kardakes_skirmisher"];

					// warn(uneval(id.classesList));

					const data_attack = {};
					data_attack.p = 7;
					data_attack.site = site;
					data_attack.templates = templates;
					data_attack.size = 12;
					data_attack.target_class = "Unit";
					data_attack.target_player = 1;
					data_attack.use_formation = true;

					this.DoAfterDelay(2 * 1000, "SpawnAttackSquad", data_attack);
				}
			}

		}

	}

	// check if gaia soldier
	/* if (data.from == 0 && data.to == -1)
	{
		// check class
		const id = Engine.QueryInterface(data.entity, IID_Identity);
		// warn(uneval(id));
		if (id != null)
		{
			if (id.classesList.includes("Soldier"))
			{
				// check distance

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
		cmpTechnologyManager.ResearchTechnology("heal_rate_2");
		cmpTechnologyManager.ResearchTechnology("heal_range");
		cmpTechnologyManager.ResearchTechnology("heal_range_2");

		// resistance
		cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_01");
		cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_02");
		cmpTechnologyManager.ResearchTechnology("soldier_resistance_pierce_01");
		cmpTechnologyManager.ResearchTechnology("soldier_resistance_pierce_02");

		// attack
		cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_01");
		cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_02");
		cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_03");
		cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_01");
		cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_02");
		cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_03");

		// better horses in general
		cmpTechnologyManager.ResearchTechnology("nisean_horses");

		// shared drop sites with player 4
		cmpTechnologyManager.ResearchTechnology("unlock_shared_dropsites");

	}

	/* for (let p of [2])
	{
		let cmpPlayer = QueryPlayerIDInterface(p);
		let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);

		cmpTechnologyManager.ResearchTechnology("tower_range");
		cmpTechnologyManager.ResearchTechnology("tower_watch");
		cmpTechnologyManager.ResearchTechnology("tower_murderholes");
		//cmpTechnologyManager.ResearchTechnology("tower_crenellations");
	}*/

	/* for (let p of [6])
	{
		let cmpPlayer = QueryPlayerIDInterface(p);
		let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);

		cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_01");
		cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_01");
		cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_01");

	}*/
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

Trigger.prototype.IntervalSpawnPersianGuards = function(data)
{
	for (const p of [7])
	{
		const soldiers = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Unit").filter(TriggerHelper.IsInWorld);
		// warn("found "+ soldiers.length + " soldiers");
		if (soldiers.length < 150)
		{

			const size = 3;

			// decide which persian village we guard
			const alive_players = [];

			for (const p_v of [2, 3, 5])
			{
				const cmpPlayer_v = QueryPlayerIDInterface(p_v);
				if (cmpPlayer_v.GetState() == "active")
				{
					alive_players.push(p_v);
				}
			}

			if (alive_players.length < 1)
				return;

			const target_player = pickRandom(alive_players);
			// warn("target player = "+uneval(target_player));
			for (let i = 0; i < size; i++)
			{

				// find patrol/spawn sites
				const patrol_sites = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(target_player), "Structure").filter(TriggerHelper.IsInWorld);

				if (patrol_sites.length >= 3)
				{

					const inf_templates = ["units/pers/champion_infantry", "units/pers/champion_elephant", "units/pers/arstibara", "units/pers/infantry_javelineer_e", "units/pers/infantry_archer_e", "units/pers/infantry_spearman_e", "units/pers/kardakes_hoplite", "units/pers/kardakes_skirmisher"];

					// pick patrol sites
					const sites = [pickRandom(patrol_sites), pickRandom(patrol_sites), pickRandom(patrol_sites)];

					// spawn the unit
					const unit_i = TriggerHelper.SpawnUnits(sites[0], pickRandom(inf_templates), 1, p);

					this.PatrolOrderList(unit_i, p, sites);
				}
			}
		}
	}

	this.DoAfterDelay(15 * 1000, "IntervalSpawnPersianGuards", null);

};

Trigger.prototype.IntervalSpawnMountainVillageGuards = function(data)
{
	for (const p of [5])
	{
		const soldiers = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Soldier").filter(TriggerHelper.IsInWorld);
		// warn("found "+ soldiers.length + " soldiers");
		if (soldiers.length < 85)
		{

			let size = 1;
			if (Math.random() < 0.5)
				size = 2;

			for (let i = 0; i < size; i++)
			{

				// find patrol/spawn sites
				const patrol_sites = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "House").filter(TriggerHelper.IsInWorld);

				// spawn sites
				const spawn_sites = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Barracks").filter(TriggerHelper.IsInWorld);

				if (patrol_sites.length >= 2 && spawn_sites.length > 0)
				{

					const inf_templates = ["units/brit/champion_infantry_swordsman", "units/gaul/champion_fanatic", "units/brit/infantry_javelineer_e", "units/brit/infantry_slinger_e", "units/brit/war_dog", "units/brit/infantry_spearman_e"];

					// pick patrol sites
					const sites = [pickRandom(spawn_sites), pickRandom(patrol_sites), pickRandom(patrol_sites)];

					// spawn the unit
					const unit_i = TriggerHelper.SpawnUnits(spawn_sites[0], pickRandom(inf_templates), 1, p);

					this.PatrolOrderList(unit_i, p, sites);
				}
			}
		}
	}

	this.DoAfterDelay(15 * 1000, "IntervalSpawnMountainVillageGuards", null);

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

Trigger.prototype.FinalAttack = function(data)
{
	const num_waves = 15;
	let interval_seconds = 34;
	const interval_decay = 0.975;

	// warn("final attack");

	// make player 1 neutral towards 3 as to not burden our healers
	/* for (let p of [1])
	{
		let cmpPlayer = QueryPlayerIDInterface(p);
		for (let p_other of [3])
		{
			cmpPlayer.SetNeutral(p_other);
		}
	}*/

	// randomly pick spawn site
	const spawn_sites = [this.GetTriggerPoints(triggerPointsCaveRaiders)[0], this.GetTriggerPoints(triggerPointsCaveRaiders)[1]];
	this.finalSpawnSite = pickRandom(spawn_sites);

	// wave counter
	this.waveCounter = 0;

	for (let i = 0; i < num_waves; i++)
	{

		// schedule
		this.DoAfterDelay(Math.round(interval_seconds * 1000) * (i + 1), "SpawnDesertRaiders", null);

		if (i == num_waves - 1)
		{
			const victory_check_delay = Math.round((1 + interval_seconds) * 1000) * (i + 1);
			// let victory_check_delay = 1000;
			this.DoAfterDelay(victory_check_delay, "VictoryCheck", null);
			// warn("scheduling victory check in "+victory_check_delay);

			// count how many gaia soldiers exist
			const soldiers = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(0), "Soldier").filter(TriggerHelper.IsInWorld);
			this.gaiaUnitsThreshold = soldiers.length;

			// warn("gaia soldiers threshold = "+this.gaiaUnitsThreshold);
		}

		// more
		interval_seconds *= interval_decay;
	}
};

Trigger.prototype.FinalAttackWarning = function(data)
{
	this.ShowText("News about the destruction of the rebel fortifications has spread throughut the lands. We hear reports of rebel fighters gathering to assault our army as it crosses the desert.  We must be prepared to protect our army as the assault may come from anywhere and anytime.", "OK", "Fine");
};

Trigger.prototype.SpawnStructureDestroyedResponseAttack = function(target_pos)
{
	const p = 0;

	// warn("structure response attack");

	// check if targets exist
	const target_player = 1;
	const targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(target_player), "Unit").filter(TriggerHelper.IsInWorld);

	if (targets.length > 0)
	{
		// warn("starting attack in reesponse to structure destroyed");

		const num_waves = 5;

		for (let i = 0; i < num_waves; i++)
		{

			const templates = ["units/pers/champion_infantry", "units/pers/infantry_archer_e", "units/pers/infantry_javelineer_e", "units/pers/kardakes_hoplite", "units/pers/arstibara"];

			const base_size = 18;
			const size_increase = 5;

			// decide how many
			const size = base_size + i * size_increase;

			const data = {};

			const spawn_site = this.GetTriggerPoints(triggerPointsCaveFortress)[0];

			data.p = p;
			data.templates = templates;
			data.size = size;
			data.target_class = "Unit";
			data.target_player = 1;
			data.site = spawn_site;
			data.target_pos = target_pos;
			// warn(uneval(data));

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

			const data = {};

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

Trigger.prototype.IntervalSpawnTraders = function(data)
{
	const e = 2;

	const cmpPlayer = QueryPlayerIDInterface(e);
	if (cmpPlayer.GetState() != "active")
	{
		return;
	}

	// find how many traders we have
	const traders = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(e), "Trader").filter(TriggerHelper.IsInWorld);

	if (traders.length < 6)
	{
		// make list of own markets
		const markets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(4), "Market").filter(TriggerHelper.IsInWorld);

		for (let i = 0; i < 1; i++)
		{
			const spawn_market = pickRandom(markets);
			let target_market = spawn_market;
			while (target_market == spawn_market)
			{
				target_market = pickRandom(markets);
			}

			const trader = TriggerHelper.SpawnUnits(spawn_market, "units/pers/support_trader", 1, e);
			const cmpUnitAI = Engine.QueryInterface(trader[0], IID_UnitAI);

			cmpUnitAI.UpdateWorkOrders("Trade");
			cmpUnitAI.SetupTradeRoute(target_market, spawn_market, null, true);
		}
	}

	this.DoAfterDelay(90 * 1000, "IntervalSpawnTraders", data);

};

Trigger.prototype.SpawnDesertRaiders = function(data)
{
	// warn("desert spawn"+this.waveCounter);
	this.waveCounter += 1;
	const p = 0;

	// target sites
	const target_sites = this.GetTriggerPoints(triggerPointsCaveRaidersTargets);

	const spawn_sites = this.GetTriggerPoints(triggerPointsCaveRaiders);

	const attackers = [];
	for (let i = 0; i < 28; i++)
	{
		const templates = ["units/pers/champion_infantry", "units/pers/infantry_archer_a", "units/pers/infantry_javelineer_a", "units/pers/kardakes_hoplite", "units/pers/infantry_spearman_e", "units/pers/kardakes_skirmisher", "units/pers/arstibara", "units/pers/infantry_spearman_b"];

		// spawn the unit
		const unit_i = TriggerHelper.SpawnUnits(pickRandom(spawn_sites), pickRandom(templates), 1, p);
		attackers.push(unit_i[0]);
	}

	TriggerHelper.SetUnitFormation(p, attackers, pickRandom(unitFormations));

	// send to target
	const target_pos = TriggerHelper.GetEntityPosition2D(pickRandom(target_sites));

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

Trigger.prototype.QuestRiverBanditsComplete = function(data)
{
	// show some text, spawn more heroes
	this.ShowText("The village elders are delighted to hear the news that the bandits are no more. But they have a confession to make -- a few of your companions had been in the village all along, recovering from their wounds. They are now healed and ready to join you.\n\nIn addition, we have reason to believe that bandits with siege weapons have been spotted north up the river from here. Look for the dock of the Dohuk Village and then go up the hills -- if you're lucky, you may be able to capture some catapults. ", "Great!", "OK");

	// spawn heroes
	const ccs = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(5), "CivilCentre").filter(TriggerHelper.IsInWorld);

	const unit1 = TriggerHelper.SpawnUnits(ccs[0], "units/mace/hero_craterus", 1, 1);
	const unit2 = TriggerHelper.SpawnUnits(ccs[0], "units/athen/hero_iphicrates", 1, 1);
	const unit3 = TriggerHelper.SpawnUnits(ccs[0], "units/maur/hero_ashoka_infantry", 1, 1);
	const unit4 = TriggerHelper.SpawnUnits(ccs[0], "units/mace/hero_demetrius_i", 1, 1);

	// spawn healer
	const h = TriggerHelper.SpawnUnits(ccs[0], "units/pers/support_healer_e", 3, 5);

	// change to ally as to heal our forces
	const cmpPlayer = QueryPlayerIDInterface(5);
	cmpPlayer.SetAlly(1);

	// check if player 1 has boat to get troops back
	const ships = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "Ship").filter(TriggerHelper.IsInWorld);
	if (ships.length < 1)
	{
		// spawn boat
		const docks = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(5), "Dock").filter(TriggerHelper.IsInWorld);

		const boat = TriggerHelper.SpawnUnits(docks[0], "units/pers/ship_merchant", 1, 1);

	}

	// mark as one
	this.riverBanditsQuestComplete = true;
	this.riverBanditsQuestGiven = true; // just if debugging

};

Trigger.prototype.QuestTempleComplete = function(data)
{

	this.ShowText("The monks thank you for saving their relic. Their healers are at your service", "Great!", "OK");

	const site = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(4), "Temple").filter(TriggerHelper.IsInWorld)[0];
	const unit_i = TriggerHelper.SpawnUnits(site, "units/pers/support_healer_e", 5, 1);

	this.questTempleComplete = true;
};

Trigger.prototype.QuestCrazedHeroesComplete = function(data)
{
	this.ShowText("It was a wise decision (or lucky coincidence!) to lead your raging companions to this monastery. The local healers immediately recognize that your friends have eaten wild mushrooms and after restraining them, and maknig drink some medicine, your friends are back to normal and happy to be in your company.", "Great!", "Awesome!");

	// find any heroes of player 6
	const units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(6), "Hero").filter(TriggerHelper.IsInWorld);
	for (const u of units)
	{
		// remove them from game
		Engine.DestroyEntity(u);
	}

	// respawn them
	const nomad_temple = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(8), "Temple").filter(TriggerHelper.IsInWorld)[0];
	const unit1 = TriggerHelper.SpawnUnits(nomad_temple, "units/spart/hero_agis", 1, 1);
	const unit2 = TriggerHelper.SpawnUnits(nomad_temple, "units/spart/hero_brasidas", 1, 1);

	this.crazedHeroesInProgress = false;
	this.crazedHeroesSpawned = true; // just in case we're skipping ahead for debugging
};

Trigger.prototype.QuestBarracksCaptivesComplete = function(data)
{
	// spawn rescue units
	const spawn_site = this.GetTriggerPoints(triggerPointsBarracksCaptives)[0];
	const barracks_p8 = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(8), "Barracks").filter(TriggerHelper.IsInWorld);
	warn(uneval(barracks_p8));

	const unit1 = TriggerHelper.SpawnUnits(spawn_site, "units/pers/hero_xerxes_i", 1, 1);
	const unit2 = TriggerHelper.SpawnUnits(spawn_site, "units/ptol/hero_cleopatra_vii", 1, 1);

	// destroy barracks
	if (barracks_p8.length > 0)
	{
		const health_s = Engine.QueryInterface(barracks_p8[0], IID_Health);
		health_s.Kill();
	}

	this.ShowText("Among the captives held in the barracks emerge a few familiar faces. What joy to see your friends!", "Great!", "Awesome!");

	this.barracksCaptivesQuestDone = true;
};

Trigger.prototype.QuestElephantAmbushComplete = function(data)
{
	// spawn rescue units
	const site = this.GetTriggerPoints(triggerPointsElephantAmbush)[0];

	const unit1 = TriggerHelper.SpawnUnits(site, "units/kush/hero_amanirenas_infantry", 1, 1);
	const unit2 = TriggerHelper.SpawnUnits(site, "units/ptol/hero_ptolemy_iv", 1, 1);

	this.ShowText("After the last elephant has been slain, two of your companions emerge from the cave. ", "Great!", "Awesome!");

	this.elephantAmbushTriggered = true;
	this.elephantAmbushEnded = true;
};

Trigger.prototype.RangeActionGreekColony = function(data)
{
	if (this.greekColonyEvent == false)
	{
		this.greekColonyEvent = true;

		this.ShowText("Finally, we have made it to the colony! Alas, the persian rebels have made advances of their own. We have receivved news that a persian rebel party will be landing near a dock to the south -- we must prepare to meet them in battle and defend the colony! \n\nThey have now taken over the three nearby villages and are raising armies to attack us. They must be defeated!", "Great!", "OK");

		// activate persians and change diplomacy
		this.DoAfterDelay(5 * 1000, "ActivatePersianVillages", null);

		// start victory check
		this.DoAfterDelay(15 * 1000, "VictoryCheck", null);

		// flip assets
		const structs = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(4), "Structure").filter(TriggerHelper.IsInWorld);

		for (const u of structs)
		{
			var cmpOwnership = Engine.QueryInterface(u, IID_Ownership);
			cmpOwnership.SetOwner(1);
		}

		const units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(4), "Unit").filter(TriggerHelper.IsInWorld);

		for (const u of units)
		{
			var cmpOwnership = Engine.QueryInterface(u, IID_Ownership);
			cmpOwnership.SetOwner(1);
		}

		// spawn attack

		const sites = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(8), "Dock").filter(TriggerHelper.IsInWorld);

		if (sites.length > 0)
		{
			const spawn_site = sites[0];

			const data = {};
			data.p = 7;
			data.site = spawn_site;
			data.templates = ["units/pers/champion_infantry", "units/pers/champion_elephant", "units/pers/arstibara", "units/pers/infantry_javelineer_b", "units/pers/infantry_archer_b", "units/pers/infantry_spearman_b", "units/pers/infantry_spearman_b", "units/pers/kardakes_hoplite", "units/pers/kardakes_skirmisher"];
			data.size = 12;
			data.target_class = "Unit";
			data.target_player = 1;
			data.use_formation = true;

			const num_attacks = 6;

			const delay = 240;
			const delay_increment = 25;

			for (let i = 0; i < num_attacks; i++)
			{
				// warn("scheduling attack");
				this.DoAfterDelay(Math.round((delay + delay_increment * i) * 1000), "SpawnAttackSquad", data);
				data.size += 3;
			}
		}
	}
};

Trigger.prototype.RangeActionTemple = function(data)
{
	//	warn("range action temple");

	if (this.questTempleGiven == false && this.questTempleComplete == false)
	{
		this.questTempleGiven = true;

		// check if relic is picked up

		if (this.questTempleRelicTaken == true)
		{
			// complete quest
			this.QuestTempleComplete();
		}
		else
		{
			// give quest

			this.ShowText("The small monastary you encounter welcomes you. They are willing to help you with healing but first ask that you seek out an ancient relic stolen by thieves. The relic looks like a pegasus -- you won't miss it. Should you ackquire it, come back to the temple, the monks will be forever grateful.", "We'll see what we can do.", "OK");
		}
	}
	else if (this.questTempleComplete == false)
	{
		if (this.questTempleRelicTaken == true)
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
		// warn("dialog state = "+this.dialogState);

		if (this.dialogState == "archers")
		{
			if (data.cmd.answer == "button1")
			{
				// pay
				const cmpPlayer = QueryPlayerIDInterface(1);
				cmpPlayer.AddResource("metal", -500);

				// get tech
				const cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
				cmpTechnologyManager.ResearchTechnology("archery_tradition");

				this.archersTrained = true;
			}
			else
			{
				this.DoAfterDelay(30 * 1000, "ToggleArcherTraining", null);
			}
		}
		else if (this.dialogState == "barracksCaptives")
		{
			if (data.cmd.answer == "button1")
			{
				this.barracksCaptivesQuestStarted = true;

				// start attack
				const site = this.GetTriggerPoints(triggerPointsBarracksCaptives)[0];

				const templates = ["units/pers/infantry_archer_b", "units/pers/infantry_spearman_b", "units/pers/infantry_javelineer_b", "units/pers/infantry_spearman_b", "units/pers/infantry_spearman_a"];

				// warn(uneval(id.classesList));

				const data_attack = {};
				data_attack.p = 6;
				data_attack.site = site;
				data_attack.templates = templates;
				data_attack.size = 10;
				// data_attack.size = 1;
				data_attack.target_class = "Hero";
				data_attack.target_player = 1;
				data_attack.use_formation = false;

				this.DoAfterDelay(2 * 1000, "SpawnAttackSquad", data_attack);
				data_attack.size = 12;
				// data_attack.size = 2;
				this.DoAfterDelay(14 * 1000, "SpawnAttackSquad", data_attack);
				this.DoAfterDelay(16 * 1000, "MonitorBarracksCaptivesQuest", null);
			}
			else
			{
				// do nothing
			}

			this.dialogState = "none";
		}
	}
};

Trigger.prototype.ToggleArcherTraining = function(data)
{
	if (this.archerTrainingAvailable == true)
	{
		this.archerTrainingAvailable = false;
	}
	else
	{
		this.archerTrainingAvailable = true;
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
		// warn("mercs ara available now.");
	}

};

Trigger.prototype.ToggleElephantTraders = function(data)
{
	if (this.elephantsAvailable == true)
	{
		this.elephantsAvailable = false;
	}
	else
	{
		this.elephantsAvailable = true;
		// warn("elephants ara available now.");
	}

};

Trigger.prototype.RangeActionElephantTraders = function(data)
{
	// warn("range action triggered");
	// warn(uneval(data));

	if (this.elephantsAvailable == true && data.added.length > 0)
	{

		// decide on offer
		const total_cost_stone = 500;

		// check if the player has enough
		const cmpPlayer = QueryPlayerIDInterface(1);
		const resources = cmpPlayer.GetResourceCounts();
		// set the flag to false
		this.elephantsAvailable = false;

		if (resources.stone >= total_cost_stone)
		{

			const offer_text = "The traders in this outposts have some elephants for sale. They are willing to part with some for the price of 500 stone. What do you say?";

			this.ShowText(offer_text, "Yes, we need elephants", "Perhaps later");

			// set the dialog state variable
			this.dialogState = "elephant_traders";
		}
		else
		{
			this.ShowText("The traders in this village are willing to see you some elephants for 500 stone. Alas, we do not have the resources", "Very well", "We'll come back later");

			// turn on mercs in 45 seconds
			this.DoAfterDelay(45 * 1000, "ToggleElephantTraders", null);

		}

	}

};

Trigger.prototype.SpawnElephantAmbush = function(data)
{
	const p = 6;
	const k = 1;
	const site = this.GetTriggerPoints(triggerPointsElephantAmbush)[0];

	const units = TriggerHelper.SpawnUnits(site, "units/pers/champion_elephant", k, p);

	// make them attack
	for (const u of units)
	{
		this.WalkAndFightClosestTarget(u, 1, "Hero");
	}
};

Trigger.prototype.RangeActionCrazedHeroes = function(data)
{
	if (this.crazedHeroesSpawned == false && data.added.length > 0)
	{
		this.ShowText("As you examine the campsite, suddenly two of your comanions emerge from the forrest. But something is not right -- they do not recognize you and jump to attack you! Perhaps they've been eating wild mushrooms to survive. Only if we had a heaaler!", "Oh my!", "Run!");

		// spawn two heroes
		const spawn_site = this.GetTriggerPoints(triggerPointsCrazedHeroes)[0];

		const unit1 = TriggerHelper.SpawnUnits(spawn_site, "units/spart/hero_agis", 1, 6);
		const unit2 = TriggerHelper.SpawnUnits(spawn_site, "units/spart/hero_brasidas", 1, 6);

		this.crazedHeroesSpawned = true;
		this.crazedHeroesInProgress = true;

		this.DoAfterDelay(5 * 1000, "MonitorCrazedHeroesQuest", null);
	}
};

Trigger.prototype.RangeActionRiverBanditsQuest = function(data)
{
	if (this.riverBanditsQuestGiven == false)
	{
		this.riverBanditsQuestGiven = true;

		this.ShowText("The local elders of the village greet you with honor. They have information about some of your missing companions. But they also have a great need of you -- river bandits have been plundering their village. The elders beg you to take them out -- the bandits are located up the river, in an area accessible only by boat. Should you manage to defeat them and destroy their camp, they will gladly help recover your companions", "We'll do it", "We don't have a choice, do we?");

		// spawn boat
		const docks = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(5), "Dock").filter(TriggerHelper.IsInWorld);

		const boat = TriggerHelper.SpawnUnits(docks[0], "units/pers/ship_merchant", 1, 1);

		// spawn a villagers to just see where the enemy is
		const spawn_site = 21800;
		const u = TriggerHelper.SpawnUnits(spawn_site, "units/mace/support_female_citizen", 1, 1);

		// debug
		for (const p of [4, 6, 7])
		{
			const cmpPlayer = QueryPlayerIDInterface(p);
			const disTemplates = disabledTemplates(QueryPlayerIDInterface(p, IID_Identity).GetCiv());
			cmpPlayer.SetDisabledTemplates(disTemplates);
		}

	}

};

Trigger.prototype.RangeActionBarracksCaptives = function(data)
{

	if (this.barracksCaptivesQuestStarted == false && this.barracksCaptivesQuestDone == false && data.added.length > 0)
	{
		this.ShowText("The barracks seems eerily empty. You could try to bust down the door and pick a fight with the locals or stay clear", "We're going in!", "Let me think about this.");

		this.dialogState = "barracksCaptives";

	}

};

Trigger.prototype.RangeActionElephantAmbush = function(data)
{

	if (this.elephantAmbushTriggered == false)
	{
		// trigger ambush
		this.elephantAmbushTriggered = true;

		// spawn k elephants
		const p = 6;
		const waves = 6;

		for (let i = 0; i < waves; i++)
		{
			this.DoAfterDelay((i + 1) * 1000, "SpawnElephantAmbush", null);

		}

	}
};

Trigger.prototype.RangeActionArcherTraining = function(data)
{
	if (this.archersTrained == false && this.archerTrainingAvailable == true)
	{
		// check if we have enough money
		const cmpPlayer = QueryPlayerIDInterface(1);
		const resources = cmpPlayer.GetResourceCounts();

		if (resources.metal > 500)
		{
			this.ShowText("The archers in this camp are willing to train you in their ancient ways of archery in exchange for 500 metal", "We agree", "Perhaps later");

			// set the dialog state variable
			this.dialogState = "archers";

			this.archerTrainingAvailable = false;

		}
	}
};

Trigger.prototype.RangeActionMercs = function(data)
{

	if (this.mercsAvailable == true && data.added.length > 0)
	{
		const templates = ["units/pers/champion_cavalry_archer"];

		// decide on offer
		const total_cost_metal = 2500;

		// check if the player has enough
		const cmpPlayer = QueryPlayerIDInterface(1);
		const resources = cmpPlayer.GetResourceCounts();

		// set the flag to false
		this.mercsAvailable = false;

		if (resources.metal >= total_cost_metal)
		{

			const offer_text = "You encounter a small camp used by local mercenaries.  A number of horse-riding archers are available for hire but it will cost us 2500 metal. ";

			this.ShowText(offer_text, "Yes, we need you", "Perhaps later");

			// set the dialog state variable
			this.dialogState = "mercs";
		}
		else
		{
			this.ShowText("This small camp often has mercenaries available for hire. Unfortunaately we do not have enough metal to entice an offer", "Bummer", "We'll be back");

			// turn on mercs in 45 seconds
			this.DoAfterDelay(45 * 1000, "ToggleMercs", null);
		}

	}

};

Trigger.prototype.RangeActionArrival = function(data)
{
	for (const u of data.added)
	{
		// warn("arrived!");

		Engine.DestroyEntity(u);

		this.numTroopsArrived += 1;
	}
};

Trigger.prototype.KillStarvingSoldier = function(data)
{
	const units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(3), "Soldier+!Elephant").filter(TriggerHelper.IsInWorld);

	const u = pickRandom(units);
	const health_s = Engine.QueryInterface(u, IID_Health);
	health_s.Kill();

	this.numStarved += 1;
};

Trigger.prototype.IntervalAttritionCheck = function(data)
{

	const units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(3), "Soldier+!Elephant").filter(TriggerHelper.IsInWorld);

	// decide how many units die based on how much food we have
	let num_dead = 3;

	// check how much food we have
	let food_loss = 125; // food every 20 seconds

	const cmpPlayer = QueryPlayerIDInterface(1);
	const resources = cmpPlayer.GetResourceCounts();

	if (resources.food > 1000)
	{
		const food_loss_added = (resources.food / 1000) * 50;
		food_loss += Math.round(food_loss_added);
	}

	// warn("food loss = "+food_loss);

	if (resources.food < food_loss)
	{
		num_dead += 6;
		// cmpPlayer.AddResource("food",-1*resources.food);
	}
	else
	{
		cmpPlayer.AddResource("food", -1 * food_loss);
	}

	for (let i = 0; i < num_dead; i++)
	{
		this.DoAfterDelay((2 + Math.round(Math.random() * 6)) * 1000, "KillStarvingSoldier", null);
	}

	this.DoAfterDelay(20 * 1000, "IntervalAttritionCheck", null);

};

Trigger.prototype.SpawnPersianRebelGuards = function(data)
{
	for (const p of [6])
	{
		const size = 125;

		for (let i = 0; i < size; i++)
		{

			// find patrol/spawn sites
			const patrol_sites = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Structure").filter(TriggerHelper.IsInWorld);
			const spawn_sites = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "MercenaryCamp").filter(TriggerHelper.IsInWorld);

			const inf_templates = ["units/pers/champion_infantry", "units/pers/champion_elephant", "units/pers/arstibara", "units/pers/infantry_javelineer_e", "units/pers/infantry_archer_e", "units/pers/infantry_spearman_e", "units/pers/kardakes_hoplite", "units/pers/kardakes_skirmisher"];

			// pick patrol sites
			const sites = [pickRandom(patrol_sites), pickRandom(patrol_sites), pickRandom(patrol_sites), pickRandom(patrol_sites)];

			// spawn the unit
			const unit_i = TriggerHelper.SpawnUnits(pickRandom(spawn_sites), pickRandom(inf_templates), 1, p);

			this.PatrolOrderList(unit_i, p, sites);
		}
	}

};

Trigger.prototype.SpawnColonyPatrol = function(data)
{
	for (const p of [4])
	{
		const size = 50;

		// find spawn and patrol sites
		const patrol_sites = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Structure").filter(TriggerHelper.IsInWorld);

		for (let i = 0; i < size; i++)
		{

			const inf_templates = ["units/athen/infantry_spearman_e", "units/athen/infantry_slinger_e", "units/athen/infantry_marine_archer_e", "units/athen/infantry_javelineer_e"];

			// pick patrol sites
			const sites = [pickRandom(patrol_sites), pickRandom(patrol_sites), pickRandom(patrol_sites), pickRandom(patrol_sites)];

			// spawn the unit
			const unit_i = TriggerHelper.SpawnUnits(pickRandom(sites), pickRandom(inf_templates), 1, p);

			this.PatrolOrderList(unit_i, p, sites);
		}
	}
};

Trigger.prototype.SpawnMountainVillageGuards = function(data)
{
	for (const p of [0])
	{
		const size = 150;

		// find spawn and patrol sites
		const camp = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "MercenaryCamp").filter(TriggerHelper.IsInWorld)[0];

		const all_structs = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Structure").filter(TriggerHelper.IsInWorld);

		// find which ones are close enough
		const patrol_sites = [];

		for (const s of all_structs)
		{
			const d = PositionHelper.DistanceBetweenEntities(s, camp);
			if (d < 150)
			{
				patrol_sites.push(s);
			}
		}

		for (let i = 0; i < size; i++)
		{

			const inf_templates = ["units/brit/champion_infantry_swordsman", "units/gaul/champion_fanatic", "units/brit/infantry_javelineer_e", "units/brit/infantry_slinger_e", "units/brit/war_dog", "units/brit/infantry_spearman_e"];

			// pick patrol sites
			const sites = [pickRandom(patrol_sites), pickRandom(patrol_sites), pickRandom(patrol_sites), pickRandom(patrol_sites)];

			// spawn the unit
			const unit_i = TriggerHelper.SpawnUnits(pickRandom(sites), pickRandom(inf_templates), 1, p);

			this.PatrolOrderList(unit_i, p, sites);
		}
	}

};

Trigger.prototype.SpawnTowerGuards = function(data)
{
	for (const p of [2])
	{
		const size = 20;

		// decide whether player 2 or player 3
		for (let i = 0; i < size; i++)
		{

			// find patrol/spawn sites
			const patrol_sites = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "StoneTower").filter(TriggerHelper.IsInWorld);

			const inf_templates = ["units/pers/champion_infantry"];

			// pick patrol sites
			const sites = [pickRandom(patrol_sites), pickRandom(patrol_sites), pickRandom(patrol_sites), pickRandom(patrol_sites), pickRandom(patrol_sites)];

			// spawn the unit
			const unit_i = TriggerHelper.SpawnUnits(pickRandom(sites), pickRandom(inf_templates), 1, p);

			this.PatrolOrderList(unit_i, p, sites);

		}
	}

};

Trigger.prototype.LoseGame = function(data)
{
	TriggerHelper.SetPlayerWon(2, this.VictoryTextFn, this.VictoryTextFn);

};

Trigger.prototype.SpawnInitialTraders = function(data)
{
	for (const p of [2, 3, 5])
	{
		const dock = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Dock").filter(TriggerHelper.IsInWorld)[0];

		const dock_others = [];
		for (const p_other of [2, 3, 5])
		{
			if (p != p_other)
			{
				dock_others.push(TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p_other), "Dock").filter(TriggerHelper.IsInWorld)[0]);
			}
		}

		for (const target_dock of dock_others)
		{

			const trader = TriggerHelper.SpawnUnits(dock, "units/pers/ship_merchant", 1, p);

			const cmpUnitAI = Engine.QueryInterface(trader[0], IID_UnitAI);

			cmpUnitAI.UpdateWorkOrders("Trade");
			cmpUnitAI.SetupTradeRoute(target_dock, dock, null, true);
		}
	}

	/* let e = 2;

	let cmpPlayer = QueryPlayerIDInterface(e);
	if (cmpPlayer.GetState() != "active")
	{
		return;
	}

	//find how many traders we have
	let traders = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(e), "Trader").filter(TriggerHelper.IsInWorld);

	if (traders.length < 6)
	{
		//make list of own markets
		let markets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(4), "Market").filter(TriggerHelper.IsInWorld);

		for (let i = 0; i < 1; i ++)
		{
			let spawn_market = pickRandom(markets);
			let target_market = spawn_market;
			while (target_market == spawn_market)
			{
				target_market = pickRandom(markets);
			}

			let trader = TriggerHelper.SpawnUnits(spawn_market,"units/pers/support_trader",1,e);
			let cmpUnitAI = Engine.QueryInterface(trader[0], IID_UnitAI);

			cmpUnitAI.UpdateWorkOrders("Trade");
			cmpUnitAI.SetupTradeRoute(target_market,spawn_market,null,true);
		}
	}

	this.DoAfterDelay(90 * 1000,"IntervalSpawnTraders",data);
		*/
};

Trigger.prototype.SpawnFortressAttack = function(data)
{
	const p = 7;
	const size = 5;
	const sites = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Fortress").filter(TriggerHelper.IsInWorld);

	if (sites.length < 1)
	{
		return;
	}

	const templates = ["units/pers/infantry_archer_a", "units/pers/infantry_spearman_b", "units/pers/champion_infantry", "units/pers/kardakes_hoplite", "units/pers/infantry_javelineer_a"];

	const attackers = [];
	for (let i = 0; i < size; i++)
	{
		const unit_i = TriggerHelper.SpawnUnits(sites[0], pickRandom(templates), 1, p);
		attackers.push(unit_i[0]);
	}

	TriggerHelper.SetUnitFormation(p, attackers, pickRandom(unitFormations));

	// make them attack
	const target = this.FindClosestTarget(attackers[0], 1, "Unit");
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

	// warn(Math.round((this.rebelFortressAttackInterval) * 1000));
	this.DoAfterDelay(Math.round((this.rebelFortressAttackInterval) * 1000), "SpawnFortressAttack", data);

	this.rebelFortressAttackInterval *= this.rebelFortressAttackIntervalDecay;
};

Trigger.prototype.SpawnArcherAmbush = function(data)
{
	const p = 2;
	const size = 20;
	const site = this.GetTriggerPoints(triggerPointsArcherAmbush)[0];

	const archers = TriggerHelper.SpawnUnits(site, "units/pers/infantry_archer_e", size, p);

	for (const u of archers)
	{
		const cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
		if (cmpUnitAI)
		{
			cmpUnitAI.SwitchToStance("standground");
		}
	}
};

Trigger.prototype.StatusCheck = function(data)
{
	// warn("num squads spawned = "+this.armySquadCounter);
	// warn("num lost = "+this.numTroopsDead);
	// warn("num arrived = "+this.numTroopsArrived);
	// warn("num starved = "+this.numStarved);

	const num_actual_dead = this.numTroopsDead - this.numTroopsArrived;
	// warn("num dead = "+num_actual_dead);
	const ratio = (this.numTroopsArrived - num_actual_dead) / (28 * this.armySquadCounter);
	// warn("ratio = "+ratio);

	// keep track of time
	this.elapsedMinutes += 0.5; // every 30 seconds
	// warn("elapsedMinutes = "+this.elapsedMinutes );
	this.DoAfterDelay(30 * 1000, "StatusCheck", null);

	if (num_actual_dead > 1300)
	{
		this.ShowText("We have lost too many troops. We lose. ", "Bummer", "Nooo!");

		this.DoAfterDelay(4 * 1000, "LoseGame", null);

	}

	// check for idle troops
	for (const p of [6])
	{

		const units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Unit").filter(TriggerHelper.IsInWorld);

		for (const u of units)
		{
			const cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI)
			{
				if (cmpUnitAI.IsIdle())
				{

					const patrol_sites = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Structure").filter(TriggerHelper.IsInWorld);

					// pick patrol sites
					const sites = [pickRandom(patrol_sites), pickRandom(patrol_sites), pickRandom(patrol_sites)];

					this.PatrolOrderList([u], p, sites);
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

					const target_site = this.GetTriggerPoints("B")[0];
					const target_pos = TriggerHelper.GetEntityPosition2D(target_site);

					// make walk
					ProcessCommand(p, {
						"type": "walk",
						"entities": [u],
						"x": target_pos.x,
						"z": target_pos.y,
						"queued": true
					});
				}
			}
		}
	}

	// check if green's troops are stuck
	for (const p of [3])
	{
		const units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Unit").filter(TriggerHelper.IsInWorld);
		for (const u of units)
		{
			const cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI)
			{
				// check how close the unit is to a trigger point

				// get unit position
				var cmpUnitPosition = Engine.QueryInterface(u, IID_Position).GetPosition2D();

				// get trigger point position
				const trigger_site = this.GetTriggerPoints(triggerPointsArrival)[0];
				var cmpTriggerPosition = Engine.QueryInterface(trigger_site, IID_Position).GetPosition2D();

				// look at distance between positions
				const targetDistance = PositionHelper.DistanceBetweenEntities(u, trigger_site);

				if (targetDistance < 60)
				{
					cmpUnitAI.WalkToTarget(trigger_site, false);
				}
			}
		}
	}

	// check if fortress and towers are destroyed
	if (this.finalAttackScheduled == undefined)
	{
		this.finalAttackScheduled = false;
	}

	if (this.finalAttackScheduled == false)
	{
		const forts = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(2), "Fortress").filter(TriggerHelper.IsInWorld);
		const towers = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(2), "Defensive+Tower").filter(TriggerHelper.IsInWorld);

		if (forts.length == 0 && towers.length == 0)
		{
			// warn("scheduling final attack");

			// schedule warning
			this.DoAfterDelay(4 * 60 * 1000, "FinalAttackWarning", null);

			// schedule attack
			this.DoAfterDelay(6 * 60 * 1000, "FinalAttack", null);

			// schedule final victory check

			this.finalAttackScheduled = true;
		}
		else
		{
			// if too much time has passed, lose the game
			if (this.elapsedMinutes > 60)
			{
				this.ShowText("Unfortunately, we have not been able to destroy the rebel fortifications in time. We lose.", "Bummer", "Noooo");

				this.DoAfterDelay(4 * 1000, "LoseGame", null);

			}
		}
	}
	else if (this.finalAttackScheduled == true)
	{
		// idle unit check for player 2
		const units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(0), "Infantry").filter(TriggerHelper.IsInWorld);

		for (const u of units)
		{
			const cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI)
			{
				if (cmpUnitAI.IsIdle())
				{
					// attack closes soldier
					this.WalkAndFightClosestTarget(u, 1, "Hero");
				}
			}
		}

	}

};

Trigger.prototype.SpawnTravelingArmySquad = function(data)
{
	const p = 3;

	const cmpPlayer = QueryPlayerIDInterface(p);

	if (cmpPlayer.GetState() == "defeated")
		return;

	// spawn site
	const site = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(3), "MercenaryCamp").filter(TriggerHelper.IsInWorld)[0];

	let squad_units = [];

	// melee
	const melee_template = pickRandom(["units/mace/infantry_pikeman_e", "units/mace/champion_infantry_spearman", "units/merc_thorakites"]);
	const units_melee = TriggerHelper.SpawnUnits(site, melee_template, 10, p);
	squad_units = squad_units.concat(units_melee);

	// ranged
	const ranged_template = pickRandom(["units/mace/infantry_slinger_e", "units/mace/infantry_javelineer_e", "units/mace/infantry_archer_e"]);
	const units_ranged = TriggerHelper.SpawnUnits(site, ranged_template, 10, p);
	squad_units = squad_units.concat(units_ranged);

	// cavalry
	const cav_template = pickRandom(["units/mace/champion_cavalry", "units/mace/cavalry_javelineer_e", "units/mace/cavalry_spearman_e"]);
	const units_cav = TriggerHelper.SpawnUnits(site, cav_template, 6, p);
	squad_units = squad_units.concat(units_cav);

	// some slow units
	const units_support = TriggerHelper.SpawnUnits(site, "units/sele/champion_elephant", 2, p);
	squad_units = squad_units.concat(units_support);

	// all have little health
	for (const u of squad_units)
	{
		const health_s = Engine.QueryInterface(u, IID_Health);
		health_s.SetHitpoints(5 + Math.round(Math.random() * 10));
	}

	// make formation
	TriggerHelper.SetUnitFormation(p, squad_units, pickRandom(unitFormations));

	// target site
	const target_site = this.GetTriggerPoints("B")[0];
	const target_pos = TriggerHelper.GetEntityPosition2D(target_site);

	// make walk
	ProcessCommand(p, {
		"type": "walk",
		"entities": squad_units,
		"x": target_pos.x,
		"z": target_pos.y,
		"queued": true
	});

	this.armySquadCounter += 1;

	this.DoAfterDelay(15 * 1000, "SpawnTravelingArmySquad", null);

};

Trigger.prototype.ActivatePersianVillages = function(data)
{
	for (let p of [2, 3, 5])
	{
		const cmpPlayer = QueryPlayerIDInterface(p);
		cmpPlayer.SetPopulationBonuses(300);
		cmpPlayer.SetMaxPopulation(300);

		cmpPlayer.AddResource("food", 2000);
		cmpPlayer.AddResource("wood", 2000);
		cmpPlayer.AddResource("metal", 2000);
		cmpPlayer.AddResource("stone", 2000);

		const ccs = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "CivilCentre").filter(TriggerHelper.IsInWorld);

		const site = ccs[0];

		// change diplomacy
		cmpPlayer.SetEnemy(4);
		cmpPlayer.SetEnemy(1);

		for (p of [1])
		{
			const cmpPlayer_p = QueryPlayerIDInterface(p);
			for (const p_other of [2, 3, 5])
			{
				cmpPlayer_p.SetEnemy(p_other);
			}
		}

		// let units1= TriggerHelper.SpawnUnits(site,"units/pers/infantry_archer_e",10,p);
		// let units2= TriggerHelper.SpawnUnits(site,"units/pers/infantry_spearman_e",10,p);
	}

	// we start getting patrols
	this.DoAfterDelay(15 * 1000, "IntervalSpawnPersianGuards", null);

};

Trigger.prototype.FlipSlaveOwnership = function(data)
{
	const slaves = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(5), "Support+Worker").filter(TriggerHelper.IsInWorld);

	for (const u of slaves)
	{
		var cmpOwnership = Engine.QueryInterface(u, IID_Ownership);
		cmpOwnership.SetOwner(1);
	}

	const goats = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(5), "Animal").filter(TriggerHelper.IsInWorld);

	for (const u of goats)
	{
		var cmpOwnership = Engine.QueryInterface(u, IID_Ownership);
		cmpOwnership.SetOwner(1);
	}

	this.slavesFreed = true;

	this.ShowText("You have freed a number of slaves held by the mountain folk. They are at your service.", "Great!", "OK");
};

/* Quests:
 *
 *  1. encounter with elephant ambusher's cave; need to lead elephants past walled in archers
 * 	reward: rescue 1 or 2 heroes DONE
 *
 *  2. encountaer with barracks that holds captives, gets assaulted then gets 2 heroes DONE, heroes lose about 550 hp total, mostly for melee units
 *
 *  3. up in the mountain you discover 2 heroes, however, they have gone sick from eating wild mushrooms and attack, need to lead them to a temple and then they regain their condition DONE
 *
 *  - the closest village is willing to provide information about one of your companions, in exchange need to destroy a bandit base; turns out they have found him and were healing him DONE
 * 	get about 4400 loot, mostly food wood metal with some stone, lost very few hit points with clever strategy, took about 9 minutes to destroy main camp
 *
 *  -  capture catapults from gaia DONE
 *
 *  - destroy gate over river passage DONE get about 3500 food and 3500 wood and 4000 metal, a bit of stone
 *
 *  - when reaching the greek colony, takes over and prepares for an assault
 *
 * AIs:
 *
 * 	- initial traders (2 ships per village), DONE, make about 850 per 5 minutes (170 per min)
 *

 */

{

	const cmpTrigger = Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger);

	// some state variables
	cmpTrigger.dialogState = "none";

	cmpTrigger.elephantAmbushTriggered = false;
	cmpTrigger.elephantAmbushEnded = false;

	cmpTrigger.barracksCaptivesQuestStarted = false;
	cmpTrigger.barracksCaptivesQuestDone = false;

	cmpTrigger.crazedHeroesSpawned = false;
	cmpTrigger.crazedHeroesInProgress = false;

	cmpTrigger.riverBanditsQuestGiven = false;
	cmpTrigger.riverBanditsQuestComplete = false;
	cmpTrigger.riverBanditsCamp = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(0), "MercenaryCamp").filter(TriggerHelper.IsInWorld)[0];

	cmpTrigger.archersTrained = false;
	cmpTrigger.archerTrainingAvailable = true;

	cmpTrigger.rebelFortressAttackStarted = false;
	cmpTrigger.rebelFortressAttackInterval = 6.0;
	cmpTrigger.rebelFortressAttackIntervalDecay = 0.995;

	cmpTrigger.greekColonyEvent = false;

	// debug
	// cmpTrigger.riverBanditsQuestGiven = true;

	// start techs
	cmpTrigger.DoAfterDelay(2 * 1000, "ResearchTechs", null);

	// garrisons
	cmpTrigger.DoAfterDelay(4 * 1000, "GarrisonEntities", null);

	// patrols
	cmpTrigger.DoAfterDelay(6 * 1000, "SpawnMountainVillageGuards", null);
	cmpTrigger.DoAfterDelay(8 * 1000, "SpawnColonyPatrol", null);

	// traders
	cmpTrigger.DoAfterDelay(10 * 1000, "SpawnInitialTraders", null);

	// debug
	// cmpTrigger.DoAfterDelay(6 * 1000,"QuestElephantAmbushComplete",null);
	// cmpTrigger.DoAfterDelay(8 * 1000,"QuestBarracksCaptivesComplete",null);
	// cmpTrigger.DoAfterDelay(8 * 1000,"QuestRiverBanditsComplete",null);
	// cmpTrigger.DoAfterDelay(10 * 1000,"ActivatePersianVillages",null);
	// cmpTrigger.DoAfterDelay(10 * 1000,"ActivatePersianVillages",null);

	// army starts moving

	// spawn initial patrols
	// cmpTrigger.DoAfterDelay(5 * 1000,"SpawnTowerGuards",null);
	// cmpTrigger.DoAfterDelay(6 * 1000,"SpawnMountainVillageGuards",null);
	// cmpTrigger.DoAfterDelay(7 * 1000,"SpawnPersianRebelGuards",null);

	// some repeat patrols
	// cmpTrigger.DoAfterDelay(5 * 1000,"IntervalSpawnMountainVillageGuards",null);
	// cmpTrigger.DoAfterDelay(5 * 1000,"IntervalSpawnPersianGuards",null);

	// start patrol spawns
	// cmpTrigger.DoAfterDelay(10 * 1000,"IntervalSpawnGuards",null);

	// repeat attacks
	// cmpTrigger.DoAfterDelay(45 * 1000,"IntervalSpawnFanatics",null);

	// victory check
	// cmpTrigger.DoAfterDelay(10 * 1000,"VictoryCheck",null);

	// interval
	// cmpTrigger.DoAfterDelay(10 * 1000,"SpawnDesertRaiders",null);
	// cmpTrigger.DoAfterDelay(30 * 1000,"StatusCheck",null);

	// disable templates
	for (const p of [1, 2, 3, 4, 5, 6, 7])
	{
		const cmpPlayer = QueryPlayerIDInterface(p);

		const disTemplates = disabledTemplates(QueryPlayerIDInterface(p, IID_Identity).GetCiv());

		if (p == 4 || p == 6 || p == 7)
			cmpPlayer.SetDisabledTemplates(disTemplates);

		// add some tech
		const cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);

		cmpTechnologyManager.ResearchTechnology("phase_town_generic");
		cmpTechnologyManager.ResearchTechnology("phase_city_generic");

		// no pop limit
		if (p == 1)
		{
			// cmpTechnologyManager.ResearchTechnology("unlock_shared_los");
			cmpPlayer.SetPopulationBonuses(300);
		}
		else if (p == 2 || p == 3 || p == 5 || p == 8 || p == 4)
		{
			cmpPlayer.SetPopulationBonuses(0);
		}
	}

	// diplomacy

	// player 2,3, and 5 are neutral towards a few players
	for (const p of [2, 3, 5])
	{
		const cmpPlayer = QueryPlayerIDInterface(p);
		for (const p_other of [1])
		{
			cmpPlayer.SetNeutral(p_other);
			const cmpPlayer_other = QueryPlayerIDInterface(p_other);
			cmpPlayer_other.SetNeutral(p);
		}
	}

	// play 1 considers the persian villages as allies at the start
	for (const p of [1])
	{
		const cmpPlayer = QueryPlayerIDInterface(p);
		for (const p_other of [2, 3, 5])
		{
			cmpPlayer.SetAlly(p_other);
		}
	}

	// player 6 is neutral towards all allies so he doesn't try to retreat troops
	for (const p of [6])
	{
		const cmpPlayer = QueryPlayerIDInterface(p);
		for (const p_other of [2, 3, 5, 7])
		{
			cmpPlayer.SetNeutral(p_other);
		}
	}

	// player 8 is allies with everyone
	for (const p of [8])
	{
		const cmpPlayer = QueryPlayerIDInterface(p);
		for (const p_other of [1, 2, 3, 4, 5, 7])
		{
			cmpPlayer.SetAlly(p_other);
			const cmpPlayer_other = QueryPlayerIDInterface(p_other);
			cmpPlayer_other.SetAlly(p);
		}
	}

	// triggers
	const data = { "enabled": true };

	cmpTrigger.RegisterTrigger("OnRange", "RangeActionElephantAmbush", {
		"entities": cmpTrigger.GetTriggerPoints(triggerPointsElephantAmbush), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 25,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});

	cmpTrigger.RegisterTrigger("OnRange", "RangeActionBarracksCaptives", {
		"entities": cmpTrigger.GetTriggerPoints(triggerPointsBarracksCaptives), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 15,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});

	cmpTrigger.RegisterTrigger("OnRange", "RangeActionCrazedHeroes", {
		"entities": cmpTrigger.GetTriggerPoints(triggerPointsCrazedHeroes), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 15,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});

	cmpTrigger.RegisterTrigger("OnRange", "RangeActionRiverBanditsQuest", {
		"entities": cmpTrigger.GetTriggerPoints(triggerPointsRiverBanditsQuest), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 25,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});

	cmpTrigger.RegisterTrigger("OnRange", "RangeActionArcherTraining", {
		"entities": cmpTrigger.GetTriggerPoints(triggerPointsArcherTraining), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 25,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});

	cmpTrigger.RegisterTrigger("OnRange", "RangeActionGreekColony", {
		"entities": cmpTrigger.GetTriggerPoints(triggerPointsGreekColony), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 25,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});

	// temple
	/* cmpTrigger.RegisterTrigger("OnRange", "RangeActionTemple", {
		"entities": cmpTrigger.GetTriggerPoints(triggerPointsTemple), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 20,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});*/

	// mercs
	/* cmpTrigger.RegisterTrigger("OnRange", "RangeActionMercs", {
		"entities": cmpTrigger.GetTriggerPoints(triggerPointsMercs), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 18,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});*/

	// elephant traders
	/* cmpTrigger.RegisterTrigger("OnRange", "RangeActionElephantTraders", {
		"entities": cmpTrigger.GetTriggerPoints(triggerPointsElephantTraders), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 18,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});*/

	cmpTrigger.RegisterTrigger("OnOwnershipChanged", "OwnershipChangedAction", data);
	// cmpTrigger.RegisterTrigger("OnStructureBuilt", "StructureBuiltAction", data);
	cmpTrigger.RegisterTrigger("OnPlayerCommand", "PlayerCommandAction", data);

	cmpTrigger.RegisterTrigger("OnInterval", "IdleUnitCheck", {
		"enabled": true,
		"delay": 5 * 1000,
		"interval": 30 * 1000,
	});

	cmpTrigger.RegisterTrigger("OnInterval", "IdleUnitCheckFast", {
		"enabled": true,
		"delay": 5 * 1000,
		"interval": 5 * 1000,
	});

	cmpTrigger.RegisterTrigger("OnInterval", "StructureDecayCheck", {
		"enabled": true,
		"delay": 10 * 1000,
		"interval": 10 * 1000,
	});
}
