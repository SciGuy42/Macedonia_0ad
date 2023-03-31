warn("loading the triggers file");

// /////////////////////
// Trigger listeners //
// /////////////////////


var unitTargetClass = "Unit+!Ship";
var siegeTargetClass = "Structure";

var triggerPointsColony = "F";
var triggerPointsColonyAmbush = "G";
var triggerPointsTemple = "H";
var triggerPointsCavalryAttack = "A";
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
	// "units/" + civ + "/support_female_citizen"
];


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
	for (const p of [2, 4, 5, 7])
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

	// stoa remains player 1's even though it would decay
	if (this.eventStoaCaptured == true)
	{
		const p = 1;
		var cmpCapt = Engine.QueryInterface(this.stoaID, IID_Capturable);
		if (cmpCapt)
		{
			const c_points = cmpCapt.GetCapturePoints();

			// warn("capture points: "+uneval(cmpCapt.GetCapturePoints()));
			// warn("max: "+uneval(cmpCapt.GetMaxCapturePoints()));

			if (c_points[0] > 0 && c_points[p] > 0)
			{
				c_points[p] += c_points[0];
				c_points[0] = 0;
				cmpCapt.SetCapturePoints(c_points);
			}

		}
	}
};


Trigger.prototype.IdleUnitCheck = function(data)
{

	for (const p of [2])
	{
		const units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Unit").filter(TriggerHelper.IsInWorld);

		// sites
		const sites_p2 = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Structure").filter(TriggerHelper.IsInWorld);

		if (sites_p2.length >= 3)
		{
			for (const u of units)
			{
				const cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
				if (cmpUnitAI)
				{
					if (cmpUnitAI.IsIdle())
					{
						// warn("Found idle soldier");
						// this.WalkAndFightClosestTarget(u,1,unitTargetClass);

						const sites = [pickRandom(sites_p2), pickRandom(sites_p2), pickRandom(sites_p2)];

						this.PatrolOrderList([u], p, sites);

					}
				}
			}
		}
	}
};



// garison AI entities with archers
Trigger.prototype.GarrisonEntities = function(data)
{

	// mercs camp
	for (const p of [4])
	{
		// outposts
		const outposts_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Outpost").filter(TriggerHelper.IsInWorld);

		for (const c of outposts_p)
		{
			// spawn the garrison inside the tower
			const archers_e = TriggerHelper.SpawnUnits(c, "units/pers/kardakes_hoplite", 1, p);

			for (const a of archers_e)
			{
				const cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(c, true);
			}
		}

		// sentry tower
		/* let towers_s = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "SentryTower").filter(TriggerHelper.IsInWorld);

		for (let e of towers_s)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(e, "units/maur/champion_infantry_maceman",3,p);

			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(e,true);
			}
		}*/
	}

	// fortress 1 and player 7
	for (const p of [2, 7])
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

		// FORTRESS
		const forts_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Fortress").filter(TriggerHelper.IsInWorld);

		for (const e of forts_p)
		{
			// spawn the garrison inside the tower
			const archers_e = TriggerHelper.SpawnUnits(e, "units/maur/champion_infantry_maceman", 20, p);

			for (const a of archers_e)
			{
				const cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(e, true);
			}
		}

	}

	// fortress 2
	for (const p of [6])
	{
		const towers = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "StoneTower").filter(TriggerHelper.IsInWorld);

		// owner is player 7
		const owner = 7;

		for (const c of towers)
		{
			// spawn the garrison inside the tower
			const archers_e = TriggerHelper.SpawnUnits(c, "units/maur/champion_infantry_maceman", 5, owner);

			for (const a of archers_e)
			{
				const cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(c, true);
			}
		}

		// FORTRESS
		const forts_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Fortress").filter(TriggerHelper.IsInWorld);

		for (const e of forts_p)
		{
			// spawn the garrison inside the tower
			const archers_e = TriggerHelper.SpawnUnits(e, "units/maur/champion_infantry_maceman", 20, owner);

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
			const archers_e = TriggerHelper.SpawnUnits(e, "units/maur/champion_infantry_maceman", 3, owner);

			for (const a of archers_e)
			{
				const cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(e, true);
			}
		}

		// wall tower
		// let towers_w = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p), "WallTower").filter(TriggerHelper.IsInWorld);
		const towers_w = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "WallTower").filter(TriggerHelper.IsInWorld);
		for (const e of towers_w)
		{
			// spawn the garrison inside the tower
			const archers_e = TriggerHelper.SpawnUnits(e, "units/maur/infantry_archer_e", 4, owner);

			for (const a of archers_e)
			{
				const cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(e, true);
			}
		}

	}


	for (const p of [0])
	{
		const towers = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "SentryTower").filter(TriggerHelper.IsInWorld);

		for (const c of towers)
		{
			// spawn the garrison inside the tower
			const archers_e = TriggerHelper.SpawnUnits(c, "units/pers/kardakes_hoplite", 3, p);

			for (const a of archers_e)
			{
				const cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(c, true);
			}
		}

	}
};


Trigger.prototype.FlipAssets = function(data)
{
	// get all structures except docks
	const structures_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(3), "Structure");

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

	// start gaia attacks
	this.DoAfterDelay(60 + this.cavalryAttackInterval * 1000, "SpawnIntervalCavalryAttack", null);

};




Trigger.prototype.SpawnInterevalPatrolBazira = function(data)
{
	// fortress 1
	const p = 2;

	// check how many unitts we have
	const units_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Unit").filter(TriggerHelper.IsInWorld);

	if (units_p.length < this.maxPatrolBazira)
	{
		// spawn a patrol unit
		const templates_p2 = ["units/maur/champion_infantry_maceman", "units/maur/infantry_archer_e", "units/maur/champion_maiden", "units/maur/champion_maiden_archer", "units/maur/champion_infantry_maceman", "units/maur/champion_elephant", "units/maur/elephant_archer_e"];

		// sites
		const sites_p2 = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Structure").filter(TriggerHelper.IsInWorld);

		if (sites_p2.length >= 3)
		{
			const sites = [pickRandom(sites_p2), pickRandom(sites_p2), pickRandom(sites_p2)];

			// spawn the unit
			const unit_i = TriggerHelper.SpawnUnits(pickRandom(sites_p2), pickRandom(templates_p2), 1, p);

			this.PatrolOrderList(unit_i, p, sites);

			// warn("Spawned patrol unit for Bazira");
		}
		else
		{
			return; // no more respawns
		}

	}

	// repeat
	const next_time = Math.round(this.patrolInervalBazira * 1000);
	// warn("spawning again in "+uneval(next_time));
	this.DoAfterDelay(next_time, "SpawnInterevalPatrolBazira", null);
};


Trigger.prototype.SpawnInterevalPatrolOra = function(data)
{
	// fortress 2 but units are from
	const sites_owenr = 6;
	const p = 7;

	// check to see if p is alive
	const cmpPlayer = QueryPlayerIDInterface(p);
	if (cmpPlayer.GetState() != "active")
	{
		warn("Player 7 must be dead.");
		return;
	}

	// check how many unitts we have
	const units_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Unit").filter(TriggerHelper.IsInWorld);

	if (units_p.length < this.maxPatrolOra)
	{
		// spawn a patrol unit
		const templates_p2 = ["units/maur/champion_infantry_maceman", "units/maur/infantry_archer_e", "units/maur/champion_maiden", "units/maur/champion_maiden_archer", "units/maur/champion_infantry_maceman", "units/maur/champion_elephant", "units/maur/elephant_archer_e"];

		// sites
		const sites_p6 = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(sites_owenr), "Structure").filter(TriggerHelper.IsInWorld);

		if (sites_p6.length >= 3)
		{
			const sites = [pickRandom(sites_p6), pickRandom(sites_p6), pickRandom(sites_p6)];

			// spawn the unit
			const unit_i = TriggerHelper.SpawnUnits(pickRandom(sites_p6), pickRandom(templates_p2), 1, p);

			this.PatrolOrderList(unit_i, p, sites);

			// warn("Spawned patrol unit for Ora");
		}
		else
		{
			return; // no more respawns
		}

	}

	// repeat
	this.DoAfterDelay(this.patrolInervalOra * 1000, "SpawnInterevalPatrolOra", null);
};

Trigger.prototype.SpawnInitialPatrol = function(data)
{

	// indian mercs
	let p = 4;// patrol for mercs
	const total_unit_count_p4 = 24;

	// sites
	const sites_p4 = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Structure").filter(TriggerHelper.IsInWorld);

	// templates
	const templates_p4 = ["units/maur/champion_infantry_maceman", "units/maur/infantry_archer_e", "units/maur/infantry_swordsman_e", "units/maur/infantry_spearman_e"];

	for (let i = 0; i < total_unit_count_p4; i++)
	{
		const sites = [pickRandom(sites_p4), pickRandom(sites_p4), pickRandom(sites_p4), pickRandom(sites_p4)];

		// spawn the unit
		const unit_i = TriggerHelper.SpawnUnits(pickRandom(sites_p4), pickRandom(templates_p4), 1, p);

		this.PatrolOrderList(unit_i, p, sites);
	}

	// fortress 1
	p = 2;
	const total_unit_count_p2 = this.initPatrolBazira;

	const templates_p2 = ["units/maur/champion_infantry_maceman", "units/maur/infantry_archer_e", "units/maur/champion_maiden", "units/maur/champion_maiden_archer", "units/maur/champion_infantry_maceman", "units/maur/champion_elephant", "units/maur/elephant_archer_e"];

	// sites
	const sites_p2 = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Structure").filter(TriggerHelper.IsInWorld);

	for (let i = 0; i < total_unit_count_p2; i++)
	{
		const sites = [pickRandom(sites_p2), pickRandom(sites_p2), pickRandom(sites_p2), pickRandom(sites_p2)];

		// spawn the unit
		const unit_i = TriggerHelper.SpawnUnits(pickRandom(sites_p2), pickRandom(templates_p2), 1, p);

		this.PatrolOrderList(unit_i, p, sites);
	}

	// indian reinforcements in fortress 2
	const sites_p6 = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(6), "Structure").filter(TriggerHelper.IsInWorld);
	p = 7;

	const total_unit_count_p7 = this.initPatrolOra;
	const templates_p7 = ["units/maur/champion_infantry_maceman", "units/maur/infantry_archer_e", "units/maur/champion_maiden", "units/maur/champion_maiden_archer", "units/maur/champion_infantry_maceman", "units/maur/champion_elephant", "units/maur/elephant_archer_e"];

	for (let i = 0; i < total_unit_count_p7; i++)
	{
		const sites = [pickRandom(sites_p6), pickRandom(sites_p6), pickRandom(sites_p6), pickRandom(sites_p6)];

		// spawn the unit
		const unit_i = TriggerHelper.SpawnUnits(pickRandom(sites_p6), pickRandom(templates_p7), 1, p);

		this.PatrolOrderList(unit_i, p, sites);
	}
};



Trigger.prototype.SpawnIntervalCavalryAttack = function(data)
{
	warn("Starting cavalry attack");


	// templates -- mostly far east horsemen
	const templates = ["units/pers/cavalry_javelineer_e", "units/pers/cavalry_spearman_e", "units/pers/cavalry_axeman_e", "units/pers/champion_cavalry", "units/pers/champion_cavalry_archer"];


	// how big each squad
	const squad_size = this.cavalrySquadSize;

	// get all sites
	const sites = this.GetTriggerPoints(triggerPointsCavalryAttack);

	for (const s of sites)
	{
		// spawn squad at site
		this.SpawnAttackSquad(0, s, templates, squad_size, "Structure", 1);
		// warn("spawning squad");
	}


	// increment and repeat
	this.cavalrySquadSize += this.cavalrySquadSizeIncrement;

	this.DoAfterDelay(this.cavalryAttackInterval * 1000, "SpawnIntervalCavalryAttack", null);

};

Trigger.prototype.OwnershipChangedAction = function(data)
{
	// check if stoa captured
	if (data.entity == this.stoaID && data.to == 1)
	{
		// warn("Stoa captured by player 1");
		this.eventStoaCaptured = true;

		// some reward -- we get extra population
		const cmpPlayer = QueryPlayerIDInterface(1);
		const cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);

		// get population bonus
		cmpTechnologyManager.ResearchTechnology("civbonuses/maur_population");

		// spawn some skirmishers
		const unit_i = TriggerHelper.SpawnUnits(data.entity, "units/merc_thureophoros", 12, 1);

		this.ShowText("A number of Greek colonists have agreed to work for us.", "Great!", "Also great!");
	}

	// check if gaia elephant
	if (data.from == 0 && data.to == -1 && this.questTempleComplete == false)
	{
		// if elephant
		const id = Engine.QueryInterface(data.entity, IID_Identity);
		if (id)
		{
			if (id.classesList.includes("Elephant"))
			{
				this.numBanditsKilled += 1;
				// warn("Elephant killed");

				if (this.numBanditsKilled >= this.numBanditElephants)
				{
					// quest complete
					this.questTempleComplete = true;

					// warn("All elephants killed!");

					if (this.questTempleGiven == false)
					{
						// we did the quest before assigned to it, monks still give us reward

						// TODO: show text
						this.ShowText("The bandit elephant riders have been defeated. Among the loot, you find ancient religious relics. Monks from a nearby temple are happy you have recovered them and in exchange, offers some medicines and knowledge that will improve the performance of our healers", "Great", "Also great!");

						this.questTempleGiven = true;
					}
					else
					{
						// TODO: show text
						this.ShowText("The bandit elephant riders have been defeated. Among the loot, you find ancient religious relics. Monks from a nearby temple are happy you have recovered them and in exchange, offers some medicines and knowledge that will improve the performance of our healers", "Great", "Also great!");

					}

					// TODO: give reward
					this.RewardQuestTemple();
				}
			}
		}





	}


	// if market from player 2
	if (this.eventBaziraMarketDestroyed == false && data.from == 2 && (data.to == -1 || data.to == 1))
	{
		// if market
		const id = Engine.QueryInterface(data.entity, IID_Identity);
		if (id)
		{
			if (id.classesList.includes("Market"))
			{
				// warn("Bazira market destroyed.");


				this.eventBaziraMarketDestroyed = true;

				// spawning interval for patrol doubles
				this.patrolInervalBazira *= 2;
			}
		}
	}

	// if first ora structure
	if (this.eventOraStructureDestroyed == false && data.from == 6 && (data.to == -1 || data.to == 1))
	{
		// if any building
		const id = Engine.QueryInterface(data.entity, IID_Identity);
		if (id)
		{
			if (id.classesList.includes("Structure"))
			{
				// warn("Ora structure destroyed.");


				this.eventOraStructureDestroyed = true;

				// spawning interval for patrol doubles
				this.patrolInervalBazira *= 2;
			}
		}
	}

	// check if tower
	if (data.from == 2 && (data.to == -1 || data.to == 1))
	{
		// if tower
		// if any building
		// warn("player 2 lost something");
		const id = Engine.QueryInterface(data.entity, IID_Identity);
		if (id)
		{
			if (id.classesList.includes("Defensive") && id.classesList.includes("Tower"))
			{
				// warn("Bazira tower destroyed.");

				// spawning interval for patrol increases
				this.patrolInervalBazira *= 1.075;
			}
		}
	}

	// check if mercs are destroyed
	if (data.from == 4 && (data.to == -1 || data.to == 1))
	{
		const id = Engine.QueryInterface(data.entity, IID_Identity);
		if (id)
		{
			if (id.classesList.includes("Unit"))
			{
				// warn("player 4 structure destroyed");

				// see if any left
				const structs_p4 = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(data.from), "Unit").filter(TriggerHelper.IsInWorld);

				if (structs_p4.length <= 0)
				{
					// player is defeated

					// TODO: add text

					// flip city assets
					this.DoAfterDelay(2 * 1000, "FlipAssets", null);

				}
			}
		}

	}
};




Trigger.prototype.RangeActionTemple = function(data)
{

	if (this.questTempleGiven == false)
	{
		this.ShowText("The monks in this temple greet you with welcome. They are happy to assist you in your cause, but immediately they face another problem. Recently, the monastary was raided by bandits, many who are elephant riders, who are camped out on a hill not too far from here. Should you recover our stolen goods, we will help you.", "Sounds good", "I'll get on it");


		this.questTempleGiven = true;
	}

};

Trigger.prototype.RangeActionColony = function(data)
{



	if (this.eventColonyAmbush == false)
	{
		// warn(uneval(data));

		if (data.added.length >= 1 && data.currentCollection.length >= 4)
		{

			// flip flag
			this.eventColonyAmbush = true;

			// show text
			this.ShowText("You encounter a newly set-up Greek colony of veterans and adventurers who have been traveling East from back home. But things are not ok. The colony appears to have been taken over by local warriors who upon noticing you, rise to arms. We must defeat the enemies who have taken over a Greek settlement!\\Note: capturing the Greek colony will enable us to recruit mercenaries.", "So it goes.", "Oh my");

			// spawn
			const templates = ["units/maur/champion_infantry_maceman", "units/maur/infantry_archer_e", "units/maur/champion_maiden", "units/maur/champion_maiden_archer", "units/maur/infantry_spearman_e", "units/pers/infantry_javelineer_e"];

			// sites
			const spawn_sites = this.GetTriggerPoints(triggerPointsColonyAmbush);

			for (let i = 0; i < this.colonyAmbushSize; i++)
			{
				// spawn the unit
				const unit_i = TriggerHelper.SpawnUnits(pickRandom(spawn_sites), pickRandom(templates), 1, 0);
			}
		}
	}
};



Trigger.prototype.RewardQuestTemple = function(data)
{
	// warn("reward for temple quest");

	for (const p of [1])
	{

		const cmpPlayer = QueryPlayerIDInterface(p);
		const cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);

		// healer techs
		cmpTechnologyManager.ResearchTechnology("heal_rate");
		cmpTechnologyManager.ResearchTechnology("heal_rate_2");
		cmpTechnologyManager.ResearchTechnology("heal_range");
		cmpTechnologyManager.ResearchTechnology("heal_range_2");
	}

};

Trigger.prototype.ResearchTechs = function(data)
{
	for (const p of [1])
	{

		const cmpPlayer = QueryPlayerIDInterface(p);
		const cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);


		// just to make alexander faster
		cmpTechnologyManager.ResearchTechnology("cavalry_health");
		cmpTechnologyManager.ResearchTechnology("cavalry_movement_speed");
		cmpTechnologyManager.ResearchTechnology("nisean_horses");

		// healer techs
		/* cmpTechnologyManager.ResearchTechnology("heal_rate");
		cmpTechnologyManager.ResearchTechnology("heal_rate_2");
		cmpTechnologyManager.ResearchTechnology("heal_range");
		cmpTechnologyManager.ResearchTechnology("heal_range_2");*/
	}
};


Trigger.prototype.VictoryTextFn = function(n)
{
	return markForPluralTranslation(
		"%(lastPlayer)s has won (game mode).",
		"%(players)s and %(lastPlayer)s have won (game mode).",
		n);
};


Trigger.prototype.IntervalVictoryCheck = function(data)
{
	// check how many cc's Ora has
	const ccs = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(6), "CivilCentre").filter(TriggerHelper.IsInWorld);
	// warn("player 6 has "+uneval(ccs.length)+" ccs");

	// check how many towers pl 2 has
	const towers = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(2), "StoneTower").filter(TriggerHelper.IsInWorld);
	// warn("player 2 has "+uneval(towers.length)+" towers");

	if (ccs.length <= 0 && towers.length <= 0)
	{
		TriggerHelper.SetPlayerWon(1, this.VictoryTextFn, this.VictoryTextFn);
	}

	// check if we still have hero
	const heroes = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "Hero").filter(TriggerHelper.IsInWorld);

	if (heroes.length <= 0 /* && towers.length <= 0*/)
	{
		TriggerHelper.SetPlayerWon(6, this.VictoryTextFn, this.VictoryTextFn);
	}
};



{
	const cmpTrigger = Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger);

	// some constants (that may change)
	cmpTrigger.initPatrolBazira = 20;
	cmpTrigger.maxPatrolBazira = 70;
	cmpTrigger.patrolInervalBazira = 2; // initially every 2 seconds, later it increases

	cmpTrigger.initPatrolOra = 30;
	cmpTrigger.maxPatrolOra = 120;
	cmpTrigger.patrolInervalOra = 15;

	cmpTrigger.colonyAmbushSize = 25;


	// variables related to gaia attacks
	cmpTrigger.cavalrySquadSize = 5;
	cmpTrigger.cavalrySquadSizeIncrement = 1;
	cmpTrigger.cavalryAttackInterval = 270;

	// some IDs
	cmpTrigger.stoaID = 14002;

	// some state variables
	cmpTrigger.eventStoaCaptured = false;
	cmpTrigger.eventColonyAmbush = false;
	cmpTrigger.eventBaziraMarketDestroyed = false;
	cmpTrigger.eventOraStructureDestroyed = false;


	// quests state variables
	cmpTrigger.questTempleGiven = false;
	cmpTrigger.questTempleComplete = false;
	cmpTrigger.numBanditsKilled = 0;


	// count how many gaia elephants there are
	cmpTrigger.numBanditElephants = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(0), "Elephant").filter(TriggerHelper.IsInWorld).length;
	// warn("Found "+uneval(cmpTrigger.numBanditElephants) + " elephants.");

	// start techs
	cmpTrigger.DoAfterDelay(1 * 1000, "ResearchTechs", null);

	// garrison entities
	cmpTrigger.DoAfterDelay(3 * 1000, "GarrisonEntities", null);

	// initial patrol
	cmpTrigger.DoAfterDelay(5 * 1000, "SpawnInitialPatrol", null);

	// repeat patrols
	cmpTrigger.DoAfterDelay((20 + cmpTrigger.patrolInervalBazira) * 1000, "SpawnInterevalPatrolBazira", null);
	cmpTrigger.DoAfterDelay((cmpTrigger.patrolInervalOra) * 1000, "SpawnInterevalPatrolOra", null);


	// debug
	// cmpTrigger.DoAfterDelay(15 * 1000,"FlipAssets",null);



	// disable templates
	for (const p of [1, 2, 3, 4, 5, 6, 7])
	{
		const cmpPlayer = QueryPlayerIDInterface(p);

		// disable templates -- nobody can build a cc
		const disTemplates = ["structures/" + QueryPlayerIDInterface(p, IID_Identity).GetCiv() + "/civil_centre", "structures/" + QueryPlayerIDInterface(p, IID_Identity).GetCiv() + "/dock"];
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

	// set diplomacy

	// player 5 is neutral to all
	const cmpPlayer5 = QueryPlayerIDInterface(5);
	for (const p of [1, 2, 3, 4, 6, 7])
	{
		const cmpPlayer_p = QueryPlayerIDInterface(p);
		cmpPlayer_p.SetNeutral(5);
		cmpPlayer5.SetNeutral(p);
	}

	// player 4 is neutral towards 2 and 6, and 7
	const cmpPlayer4 = QueryPlayerIDInterface(4);
	for (const p of [2, 6, 7])
	{
		const cmpPlayer_p = QueryPlayerIDInterface(p);
		cmpPlayer_p.SetNeutral(4);
		cmpPlayer4.SetNeutral(p);
	}

	// triggers
	const data = { "enabled": true };
	cmpTrigger.RegisterTrigger("OnOwnershipChanged", "OwnershipChangedAction", data);
	// cmpTrigger.RegisterTrigger("OnPlayerCommand", "PlayerCommandAction", data);


	cmpTrigger.RegisterTrigger("OnInterval", "IdleUnitCheck", {
		"enabled": true,
		"delay": 60 * 1000,
		"interval": 60 * 1000,
	});

	cmpTrigger.RegisterTrigger("OnRange", "RangeActionColony", {
		"entities": cmpTrigger.GetTriggerPoints(triggerPointsColony), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 45,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});

	cmpTrigger.RegisterTrigger("OnRange", "RangeActionTemple", {
		"entities": cmpTrigger.GetTriggerPoints(triggerPointsTemple), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 35,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});




	cmpTrigger.RegisterTrigger("OnInterval", "IntervalVictoryCheck", {
		"enabled": true,
		"delay": 15 * 1000,
		"interval": 15 * 1000,
	});

	cmpTrigger.RegisterTrigger("OnInterval", "StructureDecayCheck", {
		"enabled": true,
		"delay": 10 * 1000,
		"interval": 10 * 1000,
	});
}
