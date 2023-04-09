warn("loading the triggers file");

// /////////////////////
// Trigger listeners //
// /////////////////////

var unitTargetClass = "Unit+!Ship";
var siegeTargetClass = "Structure";

var triggerPointPatrol = "B";
var triggerPointCvilCentre = "J";
var triggerPointParolSpawn = "K";
var triggerPointAttackA = "I";
var triggerPointAttackB = "H";
var triggerPointAttackC = "G";

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
	"structures/ptol/lighthouse"

	// villagers
	// "units/" + civ + "/support_female_citizen"
];

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

// garison AI entities with archers
Trigger.prototype.GarrisonEntities = function(data)
{

	for (const p of [2, 5])
	{
		// camps
		const camps_p = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "MercenaryCamp").filter(TriggerHelper.IsInWorld);

		for (const c of camps_p)
		{
			// spawn the garrison inside the tower
			const archers_e = TriggerHelper.SpawnUnits(c, "units/pers/kardakes_hoplite", 10, p);

			for (const a of archers_e)
			{
				const cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(c, true);
			}
		}
	}
};

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

Trigger.prototype.StructureDecayCheck = function(data)
{
	for (const p of [4])
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

Trigger.prototype.SpawnHorsemanPatrol = function(data)
{
	if (this.finalAttackTriggered == false)
	{
		const p = 2; // which player

		// find how many cavalry we already have
		const units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Cavalry").filter(TriggerHelper.IsInWorld);

		// find how many camps we have -- we need more than 1 to spawn
		const camps = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "MercenaryCamp").filter(TriggerHelper.IsInWorld);

		if (units.length < 450 && camps.length > 1)
		{
			// templates, mostly archers

			const cav_templates = ["units/pers/champion_cavalry", "units/pers/champion_cavalry_archer", "units/pers/cavalry_javelineer_e", "units/pers/cavalry_javelineer_a", "units/pers/cavalry_axeman_e", "units/pers/cavalry_axeman_a", "units/pers/cavalry_spearman_e", "units/pers/cavalry_spearman_a", "units/pers/cavalry_spearman_b"];

			const sites = this.GetTriggerPoints(triggerPointPatrol);
			const sites_reversed = [];
			for (let i = sites.length - 1; i >= 0; i--)
			{
				sites_reversed.push(sites[i]);
			}

			const spawn_site = this.GetTriggerPoints(triggerPointParolSpawn)[0];

			// spawn the unit
			const unit_i = TriggerHelper.SpawnUnits(spawn_site, pickRandom(cav_templates), 1, p);

			if (Math.random() < 0.5)
				this.PatrolOrderList(unit_i, p, sites);
			else
				this.PatrolOrderList(unit_i, p, sites_reversed);
		}

		const next_spawn_interval = Math.round(Math.sqrt(units.length)) + 1;
		// warn("next spawn = "+next_spawn_interval);
		this.DoAfterDelay(next_spawn_interval * 1000, "SpawnHorsemanPatrol", null);
	}
};

Trigger.prototype.SpawnInitialPatrol = function(data)
{
	const p = 2;// which player

	const num_horsemen = 50;

	const sites = this.GetTriggerPoints(triggerPointPatrol);
	// warn("Found "+sites.length+" patrol sites");

	const sites_reversed = [];
	for (let i = sites.length - 1; i >= 0; i--)
	{
		sites_reversed.push(sites[i]);
	}

	// templates, mostly archers
	// let cav_templates = ["units/pers/champion_cavalry","units/pers/champion_cavalry_archer","units/pers/cavalry_javelineer_e","units/pers/cavalry_javelineer_a","units/pers/cavalry_axeman_e","units/pers/cavalry_axeman_a","units/pers/cavalry_spearman_e","units/pers/cavalry_spearman_a","units/pers/cavalry_spearman_b"];

	const cav_templates = ["units/pers/champion_cavalry", "units/pers/champion_cavalry_archer", "units/pers/cavalry_javelineer_e", "units/pers/cavalry_javelineer_a", "units/pers/cavalry_axeman_e", "units/pers/cavalry_axeman_a", "units/pers/cavalry_spearman_e", "units/pers/cavalry_spearman_a", "units/pers/cavalry_spearman_b"];

	for (let i = 0; i < num_horsemen; i++)
	{
		let sites_i = sites;
		if (Math.random() < 0.5)
			sites_i = sites_reversed;

		const index = Math.floor(Math.random() * sites_i.length);
		// warn("index = "+index);

		// spawn the unit
		const unit_i = TriggerHelper.SpawnUnits(sites_i[index], pickRandom(cav_templates), 1, p);

		// make it patrol
		const patrol_sites_i = [];
		let k = index + 1;

		for (let j = 0; j < sites_i.length; j++)
		{
			if (k >= sites_i.length)
				k = 0;

			patrol_sites_i.push(sites_i[k]);
			k += 1;

		}

		this.PatrolOrderList(unit_i, p, patrol_sites_i);
	}

};

Trigger.prototype.FlipAssets = function(data)
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

Trigger.prototype.RangeActionCivilCentre = function(data)
{
	if (this.assetTransferTriggered == false)
	{
		// warn("range action centre");
		this.ShowText("We made it! The town is now under your command. Our immediate task is to fortify it by building towers, fortresses and walls around our base. Meanwhile, we need to find the horsemen's camps and destroy them. ", "On it!", "OK");

		// flip player 3 to 1
		this.FlipAssets();
		this.assetTransferTriggered = true;

		// start rebel attacks
		this.DoAfterDelay(540 * 1000, "RebelAttackRepeat", null);
	}
};

Trigger.prototype.SpawnFarmers = function(data)
{
	const p = 4;

	const farms = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Field").filter(TriggerHelper.IsInWorld);

	const num_farmers = 20;

	for (let i = 0; i < farms.length; i++)
	{
		// spawn the unit
		const farm_i = farms[i];
		const unit_i = TriggerHelper.SpawnUnits(farm_i, "units/pers/support_female_citizen", 3, p);

		// give order
		for (const u of unit_i)
		{
			const cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI)
			{
				cmpUnitAI.Gather(farm_i, false);
			}
		}
	}
};

Trigger.prototype.TransferFood = function(data)
{
	if (this.assetTransferTriggered == true)
	{
		// warn("food transfer");

		// find out how much food player 4 has
		const cmpPlayer4 = QueryPlayerIDInterface(4);
		const resources = cmpPlayer4.GetResourceCounts();

		// add it to player 1
		const cmpPlayer1 = QueryPlayerIDInterface(1);
		cmpPlayer1.AddResource("food", resources.food);

		// remove it from player 4
		cmpPlayer4.AddResource("food", -1 * resources.food);
	}
};

Trigger.prototype.SpawnSquad = function(data)
{
	const p = data.p;
	const templates = data.templates;
	const size = data.size;
	const target_player = data.target_player;
	const target_class = data.target_class;
	const spawn_site = data.spawn_site;

	// spawn the units
	const attackers = [];

	// spawn attackers
	for (let i = 0; i < size; ++i)
	{
		let template_i = pickRandom(templates);
		// TODO: must be explained what is intended here!
		if (template_i == "units/cavalry_javelineer_a")
		{
			template_i = "units/pers/cavalry_javelineer_a";
		}

		const units_i = TriggerHelper.SpawnUnits(spawn_site, template_i, 1, p);
		attackers.push(units_i[0]);
	}

	// set formation
	TriggerHelper.SetUnitFormation(p, attackers, pickRandom(unitFormations));

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

Trigger.prototype.RebelAttack = function(data)
{
	// warn("rebel attack");

	// decide which spawn sites should be used for attack
	const site_distract = pickRandom([triggerPointAttackA, triggerPointAttackB, triggerPointAttackC]);

	let site_main = -1;
	if (site_distract == triggerPointAttackA)
		site_main = pickRandom([triggerPointAttackB, triggerPointAttackC]);
	else if (site_distract == triggerPointAttackB)
		site_main = pickRandom([triggerPointAttackA, triggerPointAttackC]);
	else if (site_distract == triggerPointAttackC)
		site_main = pickRandom([triggerPointAttackA, triggerPointAttackB]);

	// warn("main = "+site_main);
	// warn("distract = "+site_distract);

	// find our population
	const cmpPlayer = QueryPlayerIDInterface(1);
	const pop = cmpPlayer.GetPopulationCount();

	// spawn distractors
	const num_squads_distractors = 3;
	const squad_size_distractor = 3 + Math.round(pop / 25) + this.attackCounter;
	const templates_distractor = ["units/pers/champion_cavalry", "units/pers/champion_cavalry_archer", "units/pers/cavalry_javelineer_e", "units/pers/cavalry_javelineer_a", "units/pers/cavalry_axeman_e", "units/pers/cavalry_axeman_a", "units/pers/cavalry_spearman_e", "units/pers/cavalry_spearman_a", "units/pers/cavalry_spearman_b"];

	for (let i = 0; i < num_squads_distractors; i++)
	{
		const data_i = {};
		data_i.p = 5;
		data_i.templates = templates_distractor;
		data_i.size = squad_size_distractor;
		data_i.target_player = 1;
		data_i.target_class = siegeTargetClass;
		data_i.spawn_site = pickRandom(this.GetTriggerPoints(site_distract));

		this.DoAfterDelay(5 * 1000, "SpawnSquad", data_i);
	}

	// spawn main force
	const num_squads = 2;
	const squad_size = 10 + Math.round(pop / 18) + 2 * this.attackCounter;

	const templates = ["units/pers/champion_cavalry_archer", "units/pers/champion_cavalry_archer", "units/pers/cavalry_javelineer_a", "units/pers/cavalry_spearman_e", "units/pers/champion_cavalry", "units/pers/champion_cavalry", "units/pers/cavalry_axeman_e", "units/pers/infantry_archer_e", "units/pers/infantry_spearman_e", "units/pers/infantry_archer_e", "units/pers/champion_infantry", "units/pers/champion_infantry", "units/pers/infantry_javelineer_e", "units/pers/infantry_spearman_b", "units/pers/infantry_spearman_b", "units/pers/siege_ram"];

	for (let i = 0; i < num_squads; i++)
	{
		const data_i = {};
		data_i.p = 5;
		data_i.templates = templates;
		data_i.size = squad_size;
		data_i.target_player = 1;
		data_i.target_class = siegeTargetClass;
		data_i.spawn_site = pickRandom(this.GetTriggerPoints(site_main));

		this.DoAfterDelay(25 * 1000, "SpawnSquad", data_i);
	}

	this.attackCounter += 1;
};

Trigger.prototype.RebelAttackRepeat = function(data)
{

	this.RebelAttack(); // call the attack

	// see if we need to reschedule
	if (this.finalAttackTriggered == false)
	{
		// decrement interval
		this.repeatAttackInterval = Math.round((this.repeatAttackInterval * 0.975)) - 1;

		// warn("next attack in "+this.repeatAttackInterval);

		this.DoAfterDelay(this.repeatAttackInterval * 1000, "RebelAttackRepeat", null);

	}

};

Trigger.prototype.VictoryTextFn = function(n)
{
	return markForPluralTranslation(
		"%(lastPlayer)s has won (game mode).",
		"%(players)s and %(lastPlayer)s have won (game mode).",
		n);

};

Trigger.prototype.VictoryCheck = function(data)
{
	// check population level
	const cmpPlayer = QueryPlayerIDInterface(5);
	const pop = cmpPlayer.GetPopulationCount();

	// warn("pop = "+pop);

	if (pop <= 10)
	{
		// victory!
		// warn("Victory!");

		TriggerHelper.SetPlayerWon(1, this.VictoryTextFn, this.VictoryTextFn);

		// TriggerHelper.DefeatPlayer(1,markForTranslation("%(player)s has been defeated (lost hero)."));
	}
	else
	{
		this.DoAfterDelay(15 * 1000, "VictoryCheck", null);
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

Trigger.prototype.IdleUnitCheck = function(data)
{
	for (const p of [2])
	{
		const units_cav = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Cavalry").filter(TriggerHelper.IsInWorld);

		for (const u of units_cav)
		{
			const cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI /* && Math.random() < 1.05*/)
			{
				if (cmpUnitAI.IsIdle())
				{

					// get trigger points
					const sites = this.GetTriggerPoints(triggerPointPatrol);

					// find closest one
					let index = -1;
					let min_distance = 10000;

					for (let i = 0; i < sites.length; i++)
					{
						const d_i = PositionHelper.DistanceBetweenEntities(u, sites[i]);
						if (d_i < min_distance)
						{
							index = i;
							min_distance = d_i;
						}
					}

					// make patrol
					// make it patrol
					const patrol_sites_i = [];
					let k = index + 1;

					for (let j = 0; j < sites.length; j++)
					{
						if (k >= sites.length)
							k = 0;

						patrol_sites_i.push(sites[k]);
						k += 1;
					}

					this.PatrolOrderList([u], p, patrol_sites_i);

					// warn("Found idle soldier");
					// this.WalkAndFightClosestTarget(u,1,"Unit");
				}
			}
		}
	}

	for (const p of [5])
	{
		const units_cav = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "Unit").filter(TriggerHelper.IsInWorld);

		for (const u of units_cav)
		{
			const cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI)
			{
				if (cmpUnitAI.IsIdle())
				{
					// warn("Found idle soldier");
					this.WalkAndFightClosestTarget(u, 1, siegeTargetClass);
				}
			}
		}
	}

};

Trigger.prototype.OwnershipChangedAction = function(data)
{
	if (this.finalAttackTriggered == false)
	{
		if (data.from == 2 && (data.to == -1 || data.to == 1))
		{
			// check if camp
			const id = Engine.QueryInterface(data.entity, IID_Identity);

			if (id != null && id.classesList.includes("Structure"))
			{
				this.numCampsDestroyed++;

				// warn("camp destroyed");

				// destroy the structure
				const health_s = Engine.QueryInterface(data.entity, IID_Health);
				if (health_s)
					health_s.Kill();

				// check if we've destroyed all camps
				if (this.numCampsDestroyed == 1)
				{
					this.ShowText("Great job! Now we just need to find the second camp and those horsemen will stop bothering us.", "On it!", "OK");
				}
				if (this.numCampsDestroyed == 2)
				{
					// schedule final attack
					// warn("camps destroyed");

					this.ShowText("Great! The horsemen's camps have been destroyed. We need to get back to our base as soon as we can. Our scouts report that Spitamenes' raiders are on their way for one last assault.", "On it!", "OK");

					// stop spawning of patrol cavalry
					this.finalAttackTriggered = true;

					// spawn final attack
					this.DoAfterDelay(15 * 1000, "RebelAttack", null);
					this.DoAfterDelay(35 * 1000, "RebelAttack", null);
					this.DoAfterDelay(70 * 1000, "RebelAttack", null);
					this.DoAfterDelay(145 * 1000, "RebelAttack", null);
					this.DoAfterDelay(175 * 1000, "RebelAttack", null);

					// start checking for victory
					this.DoAfterDelay(180 * 1000, "VictoryCheck", null);

				}
			}

		}
	}
};

Trigger.prototype.ResearchTechs = function(data)
{
	for (const p of [1])
	{

		const cmpPlayer = QueryPlayerIDInterface(p);
		const cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);

		if (p == 1)
		{

			cmpTechnologyManager.ResearchTechnology("nisean_horses");
			cmpTechnologyManager.ResearchTechnology("cavalry_movement_speed");
			cmpTechnologyManager.ResearchTechnology("cavalry_health");

			cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_01");
			cmpTechnologyManager.ResearchTechnology("soldier_attack_melee_02");
			cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_01");
			cmpTechnologyManager.ResearchTechnology("soldier_attack_ranged_02");

			cmpTechnologyManager.ResearchTechnology("soldier_resistance_hack_01");
			cmpTechnologyManager.ResearchTechnology("soldier_resistance_pierce_01");

			// give some trade gains
			cmpTechnologyManager.ResearchTechnology("trade_gain_01");
			cmpTechnologyManager.ResearchTechnology("trade_gain_02");
		}
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

{
	// notes
	/* it takes about 5000 stone to build the wall
	 * another 1200 to get all tower upgrades
	 */

	const cmpTrigger = Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger);

	// some constants
	cmpTrigger.spawnPatrolInterval = 10;
	cmpTrigger.repeatAttackInterval = 480;

	// state variables
	cmpTrigger.assetTransferTriggered = false;
	cmpTrigger.numCampsDestroyed = 0;
	cmpTrigger.finalAttackTriggered = false;
	cmpTrigger.attackCounter = 0;

	// garrison entities
	cmpTrigger.DoAfterDelay(5 * 1000, "GarrisonEntities", null);

	// spawn patrol
	cmpTrigger.DoAfterDelay(5 * 1000, "SpawnInitialPatrol", null);

	// repeat spawn patrol
	cmpTrigger.DoAfterDelay(5 * 1000, "SpawnHorsemanPatrol", null);

	// spawn farmers
	cmpTrigger.DoAfterDelay(5 * 1000, "SpawnFarmers", null);

	// start techs
	cmpTrigger.DoAfterDelay(1 * 1000, "ResearchTechs", null);

	// debug
	// cmpTrigger.DoAfterDelay(5 * 1000,"RebelAttack",null);

	// disable templates and add some techs
	for (const p of [1, 2, 3, 4])
	{
		const cmpPlayer = QueryPlayerIDInterface(p);

		// disable templates
		let disTemplates = ["structures/" + QueryPlayerIDInterface(p, IID_Identity).GetCiv() + "/civil_centre", "structures/" + QueryPlayerIDInterface(p, IID_Identity).GetCiv() + "/dock"];

		const hero_templates = TriggerHelper.GetTemplateNamesByClasses("Hero", QueryPlayerIDInterface(p, IID_Identity).GetCiv(), undefined, undefined, true);
		disTemplates = disTemplates.concat(hero_templates);

		if (p == 3)
			disTemplates = disTemplates.concat(disabledTemplates(QueryPlayerIDInterface(p, IID_Identity).GetCiv()));

		cmpPlayer.SetDisabledTemplates(disTemplates);

		const cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);

		cmpTechnologyManager.ResearchTechnology("phase_town_generic");
		cmpTechnologyManager.ResearchTechnology("phase_city_generic");

		if (p == 1)
		{
			cmpTechnologyManager.ResearchTechnology("unlock_shared_los");
			cmpPlayer.SetPopulationBonuses(300);
		}
	}

	// set diplomacy
	const cmpPlayer2 = QueryPlayerIDInterface(2);
	cmpPlayer2.SetNeutral(4);

	const cmpPlayer5 = QueryPlayerIDInterface(5);
	cmpPlayer5.SetNeutral(4);

	const cmpPlayer4 = QueryPlayerIDInterface(4);
	cmpPlayer4.SetNeutral(2);
	cmpPlayer4.SetAlly(1);
	cmpPlayer4.SetAlly(3);

	const cmpPlayer1 = QueryPlayerIDInterface(1);
	cmpPlayer1.SetAlly(4);
	cmpPlayer1.SetAlly(3);

	const cmpPlayer3 = QueryPlayerIDInterface(3);
	cmpPlayer3.SetAlly(4);
	cmpPlayer3.SetAlly(1);

	const data = { "enabled": true };
	cmpTrigger.RegisterTrigger("OnOwnershipChanged", "OwnershipChangedAction", data);

	cmpTrigger.RegisterTrigger("OnInterval", "StructureDecayCheck", {
		"enabled": true,
		"delay": 10 * 1000,
		"interval": 10 * 1000
	});

	cmpTrigger.RegisterTrigger("OnInterval", "TransferFood", {
		"enabled": true,
		"delay": 10 * 1000,
		"interval": 30 * 1000
	});

	cmpTrigger.RegisterTrigger("OnInterval", "IdleUnitCheck", {
		"enabled": true,
		"delay": 5 * 1000,
		"interval": 45 * 1000
	});

	cmpTrigger.RegisterTrigger("OnRange", "RangeActionCivilCentre", {
		"entities": cmpTrigger.GetTriggerPoints(triggerPointCvilCentre), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 25,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});

}
