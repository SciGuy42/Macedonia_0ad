warn("loading the triggers file");

// /////////////////////
// Trigger listeners //
// /////////////////////

var unitTargetClass = "Unit+!Ship";
var siegeTargetClass = "Structure";

var triggerPointsStructureResponseAttack = "B";
var triggerPointsGiftUnit = "K";
var triggerPointsPatrol = "A";
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
					"translateMessage": true
				}
			},
			"button1": {
				"caption": {
					"message": markForTranslation(option_a),
					"translateMessage": true
				},
				"tooltip": {
					"message": markForTranslation(option_a),
					"translateMessage": true
				}
			},
			"button2": {
				"caption": {
					"message": markForTranslation(option_b),
					"translateMessage": true
				},
				"tooltip": {
					"message": markForTranslation(option_b),
					"translateMessage": true
				}
			}
		}
	});

};

Trigger.prototype.StructureDecayCheck = function(data)
{
	for (const p of [7, 8])
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
	this.idleCheckCounter += 1;
	warn("idle counter = " + this.idleCheckCounter);

	for (const p of [8])
	{
		const units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Cavalry").filter(TriggerHelper.IsInWorld);

		for (const u of units)
		{
			const cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI && Math.random() < 0.25 && cmpUnitAI.IsIdle())
				this.WalkAndFightClosestTarget(u, 1, unitTargetClass);
		}

		const inf_units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Infantry").filter(TriggerHelper.IsInWorld);

		for (const u of inf_units)
		{
			const cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI && cmpUnitAI.IsIdle())
			{
				const trigger_sites = this.GetTriggerPoints(triggerPointsPatrol);
				// pick patrol sites
				const sites = [pickRandom(trigger_sites), pickRandom(trigger_sites), pickRandom(trigger_sites)];
				this.PatrolOrderList([u], p, sites);

			}
		}
	}

};

Trigger.prototype.SpawnTraders = function(data)
{
	// we spawn traders for player 6
	for (const p of [8])
	{
		// make list of own markets
		const markets_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Trade").filter(TriggerHelper.IsInWorld);

		if (markets_p.length > 0)
		{
			// make list of traders
			const traders_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Trader+!Ship").filter(TriggerHelper.IsInWorld);

			if (traders_p.length < 12)
			{
				// make list of others markets
				let markets_others = [];
				const trading_partners = [4, 5, 6, 7];
				for (const p2 of trading_partners)
				{
					if (p2 != p)
					{
						const markets_p2 = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p2), "Trade").filter(TriggerHelper.IsInWorld);

						markets_others = markets_others.concat(markets_p2);
					}
				}

				if (markets_others.length > 0)
				{

					const site = pickRandom(markets_p);

					// warn("Spawning trader for crete");
					const trader = TriggerHelper.SpawnUnits(site, "units/pers/support_trader", 1, p);

					const cmpUnitAI = Engine.QueryInterface(trader[0], IID_UnitAI);

					cmpUnitAI.UpdateWorkOrders("Trade");
					cmpUnitAI.SetupTradeRoute(pickRandom(markets_others), site, null, true);

				}
			}
		}

	}

	this.DoAfterDelay(15 * 1000, "SpawnTraders", null);
};

// garison AI entities with archers
Trigger.prototype.GarrisonEntities = function(data)
{

	// nanda garrison
	for (const p of [8])
	{
		const owner = p; // all garrison are player 8

		// fortresses
		const forts_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Fortress").filter(TriggerHelper.IsInWorld);

		for (const c of forts_p)
		{
			// spawn the garrison inside the tower
			const archers_e = TriggerHelper.SpawnUnits(c, "units/pers/arstibara", 20, owner);

			for (const a of archers_e)
			{
				const cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(c, true);
			}
		}

		// stone towers
		const towers_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "StoneTower").filter(TriggerHelper.IsInWorld);

		for (const c of towers_p)
		{
			// spawn the garrison inside the tower
			const archers_e = TriggerHelper.SpawnUnits(c, "units/pers/arstibara", 5, owner);

			for (const a of archers_e)
			{
				const cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(c, true);
			}
		}

	}

};

Trigger.prototype.SpawnInterevalPatrol = function(data)
{

	const p = 8;

	// check if we have structure
	const spawn_sites = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Fortress").filter(TriggerHelper.IsInWorld);

	if (spawn_sites.length == 0)
	{
		return;
	}

	// check how many unitts we have
	const units_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Infantry").filter(TriggerHelper.IsInWorld);

	if (units_p.length < 100)
	{
		const templates = ["units/pers/infantry_archer_e", "units/pers/infantry_spearman_e", "units/pers/arstibara", "units/pers/kardakes_hoplite", "units/pers/kardakes_skirmisher"];

		const trigger_sites = this.GetTriggerPoints(triggerPointsPatrol);

		// pick patrol sites
		const sites = [pickRandom(trigger_sites), pickRandom(trigger_sites), pickRandom(trigger_sites)];

		// spawn the unit
		const unit_i = TriggerHelper.SpawnUnits(pickRandom(spawn_sites), pickRandom(templates), 1, p);

		this.PatrolOrderList(unit_i, p, sites);
	}

	// repeat
	this.DoAfterDelay(15 * 1000, "SpawnInterevalPatrol", null);
};

Trigger.prototype.SpawnAdvanceAttackSquadInterval = function(data)
{
	// which player
	const p = 6;

	// sites
	const sites = this.GetTriggerPoints(triggerPointsAdvanceAttack);

	// templates
	const templates = ["units/maur/infantry_archer_a", "units/maur/infantry_archer_b", "units/maur/infantry_spearman_a", "units/maur/infantry_spearman_b", "units/maur/infantry_spearman_b", "units/maur/infantry_swordsman_b", "units/maur/infantry_swordsman_a", "units/maur/infantry_swordsman_e", "units/maur/infantry_spearman_e"];

	// how many
	let size = 1;
	while (Math.random() > this.advanceAttackStickBreakProb)
	{
		size += 1;
	}

	// warn("attack size = "+uneval(size));
	const attackers = [];
	for (let i = 0; i < size; i++)
	{
		const unit_i = TriggerHelper.SpawnUnits(pickRandom(sites), pickRandom(templates), 1, p);
		attackers.push(unit_i[0]);
	}

	// make them attack
	const target_player = 3;

	// TODO: send to player 1 if player 3 has no structures

	const target = this.FindClosestTarget(attackers[0], target_player, "Structure");
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

	// decays
	this.advanceAttackStickBreakProb *= this.advanceAttackStickBreakProbDecay;
	this.advanceAttackInterval *= this.advanceAttackIntervalDecay;
	// warn(uneval(this.advanceAttackStickBreakProb) +"\t"+uneval(this.advanceAttackInterval))

	// increment level
	// warn("level = "+uneval(this.advanceAttackLevel));
	this.advanceAttackLevel += 1;

	// repeat
	if (this.advanceAttackLevel < this.advanceAttackMaxLevel)
	{
		const next_time = Math.round(this.advanceAttackInterval * 1000);
		// warn("spawning again in "+uneval(next_time));
		this.DoAfterDelay(next_time, "SpawnAdvanceAttackSquadInterval", null);
	}
	else  // if we run out of levels, main attack starts
	{
		// warn("advance attack done, main attack starts");
		this.eventAdvanceAttackEnded = true;
		this.StartMainAttack();
	}

};

Trigger.prototype.VictoryCheck = function(data)
{

	// check how many civil centres exist
	const ccs_p2 = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(2), "CivilCentre").filter(TriggerHelper.IsInWorld);
	const ccs_p4 = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(4), "CivilCentre").filter(TriggerHelper.IsInWorld);
	const ccs_p5 = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(5), "CivilCentre").filter(TriggerHelper.IsInWorld);
	const ccs_p6 = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(6), "CivilCentre").filter(TriggerHelper.IsInWorld);
	const forts_p8 = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(8), "Fortress").filter(TriggerHelper.IsInWorld);

	if (ccs_p2.length == 0 && ccs_p4.length == 0 && ccs_p5.length == 0 && ccs_p6.length == 0 && forts_p8.length == 0)
	{
		TriggerHelper.SetPlayerWon(1, this.VictoryTextFn, this.VictoryTextFn);

	}
	else
	{
		this.DoAfterDelay(20 * 1000, "VictoryCheck", null);
	}

};

Trigger.prototype.SpawnMainAttackInterval = function(data)
{
	// which player
	const p = 2;

	// templates
	const templates = ["units/maur/champion_infantry_maceman", "units/maur/champion_maiden", "units/maur/champion_maiden_archer", "units/maur/elephant_archer_e", "units/maur/infantry_swordsman_e", "units/maur/infantry_spearman_e", "units/maur/infantry_swordsman_e", "units/maur/champion_elephant"];

	// sites
	const sites = this.GetTriggerPoints(triggerPointsMainAttack);

	// spawn siege with certain probability
	let siege_prob = 0.05 * Math.pow(1.075, this.mainAttackLevel);
	if (siege_prob > 0.75)
		siege_prob = 0.75;
	// warn("siege prob = "+uneval(siege_prob));

	// for each squad
	for (let i = 0; i < Math.round(this.mainAttackNumSquads) + 2; i++)
	{
		const size = Math.round(this.mainAttackSquadSize) + 2;

		// spawn squad
		const site_i = pickRandom(sites);
		this.SpawnAttackSquad(p, site_i, templates, size, "Structure", 1);

		if (Math.random() < siege_prob)
		{
			// warn("spawning ram");
			const unit_i = TriggerHelper.SpawnUnits(site_i, "units/maur/siege_ram", 1, p);

			const cmpUnitAI = Engine.QueryInterface(unit_i[0], IID_UnitAI);
			if (cmpUnitAI)
			{
				// find closest structure
				const target = this.FindClosestTarget(unit_i[0], 1, "Structure");
				if (target)
				{
					// warn("sending elephant to attack structure");
					cmpUnitAI.Attack(target, false);
				}
				else
				{
					this.WalkAndFightClosestTarget(unit_i[0], 1, unitTargetClass);
				}
			}
		}

		// spawn elephant specifically to attack building
		if (Math.random() < 0.75)
		{
			// spawning extra elephant
			// warn("spawning elephant");
			const unit_i = TriggerHelper.SpawnUnits(site_i, "units/maur/champion_elephant", 1, p);

			const cmpUnitAI = Engine.QueryInterface(unit_i[0], IID_UnitAI);
			if (cmpUnitAI)
			{
				// find closest structure
				const target = this.FindClosestTarget(unit_i[0], 1, "Structure");
				if (target)
				{
					// warn("sending elephant to attack structure");
					cmpUnitAI.Attack(target, false);
				}
				else
				{
					this.WalkAndFightClosestTarget(unit_i[0], 1, unitTargetClass);
				}
			}

		}
	}

	// process decays and increment level
	this.mainAttackInterval *= this.mainAttackIntervalDecay;
	this.mainAttackSquadSize *= this.mainAttackSquadSizeIncrease;
	this.mainAttackNumSquads *= this.mainAttackNumSquadsIncrease;

	// warn("main level = "+uneval(this.mainAttackLevel));
	this.mainAttackLevel += 1;

	// check whether to start macedonian cavalry attack
	// IID_StatisticsTracker;

	const cmpPlayer = QueryPlayerIDInterface(p);
	const cmpStatsTracker = Engine.QueryInterface(cmpPlayer.entity, IID_StatisticsTracker);
	const units_lost = cmpStatsTracker.unitsLost.total;

	// warn("units lost = "+uneval(units_lost));

	if (units_lost > 1200)
	{
		this.StartMaceAttack();
	}

	// repeat if macedonian attack hasn't started yet
	if (this.eventMacedonianCavalryArrived == false)
	{
		const next_time = Math.round(this.mainAttackInterval * 1000);
		// warn("spawning main attack again in "+uneval(next_time));
		this.DoAfterDelay(next_time, "SpawnMainAttackInterval", null);
	}
	else
	{
		this.eventMainAttackEnded = true;
		// warn("end attacks");
	}

	/* if (this.mainAttackLevel < this.mainAttackMaxLevel)
	{
		let next_time = Math.round(this.mainAttackInterval * 1000);
		warn("spawning main attack again in "+uneval(next_time));
		this.DoAfterDelay(next_time,"SpawnMainAttackInterval",null);
	}
	else  //if we run out of levels, main attack starts
	{
		warn("main attack done");
		this.eventMainAttackEnded = true;
		this.eventMacedonianCavalryArrived = true;
	}*/
};

// every function just logs when it gets fired, and shows the data
Trigger.prototype.StructureBuiltAction = function(data)
{

	// check if building by player 2 or 5
	var cmpOwnership = Engine.QueryInterface(data.building, IID_Ownership);

	if (cmpOwnership.GetOwner() == 2 || cmpOwnership.GetOwner() == 4 || cmpOwnership.GetOwner() == 5 || cmpOwnership.GetOwner() == 6)
	{
		if (this.foundations == null)
		{
			this.foundations = [];
		}

		this.foundations.push(data.foundation);

		// warn(uneval(this.foundations));
	}
};

Trigger.prototype.SpawnStructureResponseAttack = function(data)
{
	// find out how many units we have already

	const attack_size = data.attack_size;
	const target_location = data.location;
	const target_structure = data.entity;

	// site
	const sites = this.GetTriggerPoints(triggerPointsStructureResponseAttack);

	// find closest one
	let index = -1;
	let min_distance = 10000;

	for (const [i, site_] of sites.entries())
	{
		const d_i = PositionHelper.DistanceBetweenEntities(target_structure, site_);
		if (d_i < min_distance)
		{
			index = i;
			min_distance = d_i;
		}
	}

	const site = sites[index];

	// templates
	const templates = ["units/pers/cavalry_archer_a", "units/pers/cavalry_javelineer_e", "units/pers/cavalry_axeman_a", "units/pers/cavalry_axeman_e", "units/pers/champion_cavalry", "units/pers/champion_cavalry_archer", "units/pers/cavalry_spearman_a", "units/pers/cavalry_spearman_e"];

	const attackers = [];
	const p = 8;
	for (let i = 0; i < attack_size; i++)
	{
		// spawn unit
		const units_i = TriggerHelper.SpawnUnits(site, pickRandom(templates), 1, p);
		attackers.push(units_i[0]);
	}

	// set formation
	TriggerHelper.SetUnitFormation(p, attackers, pickRandom(unitFormations));

	// send to attack
	ProcessCommand(p, {
		"type": "attack-walk",
		"entities": attackers,
		"x": target_location.x,
		"z": target_location.y,
		"queued": true,
		"targetClasses": {
			"attack": unitTargetClass
		},
		"allowCapture": false
	});

};

Trigger.prototype.OwnershipChangedAction = function(data)
{

	// check if players 2, 4 or 5 lost a structure
	if ((data.from == 2 || data.from == 4 || data.from == 5 || data.from == 6) && data.to == -1)
	{
		const id = Engine.QueryInterface(data.entity, IID_Identity);
		if (id != null && id.classesList.includes("Structure"))
		{
			// warn(uneval(id));

			// check if foundation
			const fnd = Engine.QueryInterface(data.entity, IID_Foundation);
			if (fnd)
			{
				// warn("foundation = "+uneval(fnd));
			}
			else
			{
				// warn("not foundation");

				// spawn cavalry attack
				const p = 8;
				const structs_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Fortress").filter(TriggerHelper.IsInWorld);

				if (structs_p.length > 0 && Math.random() < 1.0)
				{
					const cavalry = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Cavalry").filter(TriggerHelper.IsInWorld);

					if (cavalry.length < 150)
					{
						// spawn attack
						const data_attack = {};
						data_attack.attack_size = 15;

						var cmpTargetPosition = Engine.QueryInterface(data.entity, IID_Position).GetPosition2D();
						data_attack.location = cmpTargetPosition;

						data_attack.entity = data.entity;

						this.SpawnStructureResponseAttack(data_attack);

					}

				}
			}
		}

		/* if (this.foundations && !this.foundations.includes(data.entity))
		{
			const id = Engine.QueryInterface(data.entity, IID_Identity);
			if (id != null && id.classesList.includes("Structure") && Math.random() < 0.5 && this.warEnded == false)
			{
				// if player 6 is alive, possibly send an attack force
				const p = 6;
				const cmpPlayer = QueryPlayerIDInterface(p);
				// warn(uneval(cmpPlayer.GetState()));

				// check also if they have structures
				const structs_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Structure").filter(TriggerHelper.IsInWorld);

				if (cmpPlayer.GetState() == "active" && structs_p.length > 0)
				{
					const cavalry = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Cavalry").filter(TriggerHelper.IsInWorld);

					if (cavalry.length < 150)
					{
						// spawn attack
						const data_attack = {};
						data_attack.attack_size = 15;

						var cmpTargetPosition = Engine.QueryInterface(data.entity, IID_Position).GetPosition2D();
						data_attack.location = cmpTargetPosition;

						this.SpawnStructureResponseAttack(data_attack);

					}

				}
			}
		}
		else
		{
			// warn("foundation destroyed");
		}*/

	}

	// check if we built a civil centre
	/* if (data.from == -1 && data.to == 1)
	{

	}*/

	/* if (data.entity == 5251 && this.eventAdvanceAttackStarted == false) // brit tower, used as debug trigger
	{
		this.eventAdvanceAttackStarted = true;
		this.StartAdvanceAttack();
	}
	else if (data.entity == 5252 && this.eventMacedonianCavalryArrived == false) // brit tower, used as debug trigger
	{
		this.eventMacedonianCavalryArrived = true;
		this.StartMaceAttack();
	}*/

	/* if (data.from == 0 && data.to == 1) // we captured a gaia structure, there is only 1 so...
	{
		// spawn some bolt shooters
		const siege = TriggerHelper.SpawnUnits(data.entity, "units/mace/siege_oxybeles_packed", 5, 1);

		// warn("spawned siege");
		// destroy building
		const health_s = Engine.QueryInterface(data.entity, IID_Health);
		health_s.Kill();
	}*/
};

Trigger.prototype.ResearchTechs = function(data)
{
	// for playere 1
	for (const p of [1])
	{

		const cmpPlayer = QueryPlayerIDInterface(p);
		const cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);

		// just to make alexander faster
		cmpTechnologyManager.ResearchTechnology("cavalry_movement_speed");

		// healer techs
		cmpTechnologyManager.ResearchTechnology("heal_rate");
		cmpTechnologyManager.ResearchTechnology("heal_range");

		// resistance and attack
		cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_01");
		cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_01");

		// better horses
		cmpTechnologyManager.ResearchTechnology("nisean_horses");
	}

	for (const p of [8]) // mercs
	{

		const cmpPlayer = QueryPlayerIDInterface(p);
		const cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);

		cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_01");
		cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_02");
		cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_01");
		cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_03");

		// trader techs
		cmpTechnologyManager.ResearchTechnology("trade_gain_01");
		cmpTechnologyManager.ResearchTechnology("trade_gain_02");
	}
};

Trigger.prototype.VictoryTextFn = function(n)
{
	return markForPluralTranslation(
		"%(lastPlayer)s has won (game mode).",
		"%(players)s and %(lastPlayer)s have won (game mode).",
		n);
};

Trigger.prototype.RangeActionGiftUnit = function(data)
{
	for (const u of data.added)
	{
		var cmpOwnership = Engine.QueryInterface(u, IID_Ownership);
		cmpOwnership.SetOwner(3);
	}

};

Trigger.prototype.IntervalCheckIndianCCs = function(data)
{
	const ccs_pl2 = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(2), "CivilCentre").filter(TriggerHelper.IsInWorld);
	const ccs_pl5 = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(5), "CivilCentre").filter(TriggerHelper.IsInWorld);

	if (ccs_pl2.length + ccs_pl5.length <= 2)
	{
		this.ShowText("Great! We have sent the Nanda a message they will not forget! They have agreed to keep current borders and will no longer attack us. Trade can resume.", "Great!", "Well done!");

		// go back to neutral again
		this.warEnded = true;

		const nanda_empire_players = [2, 5, 6, 7];
		const macedonian_players = [1, 3];

		for (const p of nanda_empire_players)
		{
			const cmpPlayer_p = QueryPlayerIDInterface(p);

			for (const p2 of macedonian_players)
			{
				cmpPlayer_p.SetNeutral(p2);
				const cmpPlayer_p2 = QueryPlayerIDInterface(p2);
				cmpPlayer_p2.SetNeutral(p);
			}
		}

		// TO DO: start final insurrection
		this.DoAfterDelay(20 * 1000, "StartMutinyInsurrection", null);
	}
	else
	{
		this.DoAfterDelay(20 * 1000, "IntervalCheckIndianCCs", null);
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
	cmpTrigger.idleCheckCounter = 0;

	// start techs
	cmpTrigger.DoAfterDelay(1 * 1000, "ResearchTechs", null);

	// garrison entities
	cmpTrigger.DoAfterDelay(3 * 1000, "GarrisonEntities", null);

	// start patrol spawns
	cmpTrigger.DoAfterDelay(10 * 1000, "SpawnInterevalPatrol", null);

	// start traders
	cmpTrigger.DoAfterDelay(5 * 1000, "SpawnTraders", null);

	// victory check
	cmpTrigger.DoAfterDelay(20 * 1000, "VictoryCheck", null);

	// disable templates
	for (const p of [1, 2, 3, 4, 5, 6, 7, 8])
	{
		const cmpPlayer = QueryPlayerIDInterface(p);

		// disable templates -- nobody can build docks or civil centre

		if (p == 7 || p == 8)
		{

			const disTemplates = disabledTemplates(QueryPlayerIDInterface(p, IID_Identity).GetCiv());
			cmpPlayer.SetDisabledTemplates(disTemplates);

		}

		// add some tech
		const cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);

		if (p != 3)
		{
			cmpTechnologyManager.ResearchTechnology("phase_town_generic");
			cmpTechnologyManager.ResearchTechnology("phase_city_generic");
		}
		else
		{
			cmpTechnologyManager.ResearchTechnology("phase_town_athen");
			cmpTechnologyManager.ResearchTechnology("phase_city_athen");
		}

		// no pop limit
		if (p == 1)
		{
			cmpTechnologyManager.ResearchTechnology("unlock_shared_los");
			cmpPlayer.SetPopulationBonuses(300);
		}

	}

	// diplomacy
	for (const p of [1, 2, 3, 4, 5, 6, 8])
	{
		const cmpPlayer = QueryPlayerIDInterface(p);
		cmpPlayer.SetNeutral(7);

		const cmpPlayer_traders = QueryPlayerIDInterface(7);
		cmpPlayer_traders.SetNeutral(p);
	}

	// triggers
	const data = { "enabled": true };

	cmpTrigger.RegisterTrigger("OnRange", "RangeActionGiftUnit", {
		"entities": cmpTrigger.GetTriggerPoints(triggerPointsGiftUnit), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 10,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});

	cmpTrigger.RegisterTrigger("OnOwnershipChanged", "OwnershipChangedAction", data);
	// cmpTrigger.RegisterTrigger("OnStructureBuilt", "StructureBuiltAction", data);

	// cmpTrigger.RegisterTrigger("OnPlayerCommand", "PlayerCommandAction", data);

	cmpTrigger.RegisterTrigger("OnInterval", "IdleUnitCheck", {
		"enabled": true,
		"delay": 30 * 1000,
		"interval": 30 * 1000
	});

	cmpTrigger.RegisterTrigger("OnInterval", "StructureDecayCheck", {
		"enabled": true,
		"delay": 10 * 1000,
		"interval": 10 * 1000
	});
}
