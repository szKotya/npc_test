import { Instance } from "cs_script/point_script";


const Player_Skin = "characters/models/player/custom_player/serp_hibrido.vmdl";
const map_script = "map_script";
const jetpack_hud = "jetpack_hud";
const rpg_hud = "rpg_hud";
const zmjumper_hud = "zmjumper_hud";
const misc_hud = "misc_hud";


const ITEMS_SET = new Set();
const SuperWeapons = {
    weapon_negev: { owner: () => SuperNegev_Owner, multiplier: 3 },
    weapon_awp:   { owner: () => SuperAwp_Owner,   multiplier: 10, knockback: 1200 },
    weapon_sawedoff:   { owner: () => SuperSawedoff_Owner,   multiplier: 15, knockback: 600 },
    weapon_deagle: { owner: () => SuperDeagle_Owner, headshot: 1}
};
const HS_Queue = [];


const PlayerInstancesMap = new Map();
class Player
{
    constructor(player, controller, name, slot)
    {
        this.player = player;
        this.controller = controller;
        this.player_name = name;
        this.slot = slot;
        this.Mapper = false;


        this.hasbouns = false;
        this.bonus_speed = 1.30;
        this.bonus_gravity = 0.50;


        this.damage = 0;
        this.kills = 0;
        this.infections = 0;


        this.secrets_founds = new Set();


        this.jetpack_s_count = 0;
        this.jetpack_max_s_count = 3;
        this.jetpack_can_be_picked_up = false;


        this.rpg_s_count = 0;
        this.rpg_max_s_count = 2;
        this.rpg_can_be_picked_up = false;


        this.zm_jumper_s_count = 0;
        this.zm_jumper_max_s_count = 4;
        this.zm_jumper_can_be_picked_up = false;


        this.secret_tp_time = 20.00;
        this.secret_tp_pass = false;
        this.secret_tp_deadline = 0;
    }
    SetBonus()
    {
        if(!this.hasbouns)
        {
            this.hasbouns = true;
            this.GetBonusBuff();
        }
    }
    GetBonusBuff()
    {
        if(this.hasbouns || this.Mapper)
        {
            this.SetPlayerModel();
            if(this.player?.IsValid() && this.player?.GetTeamNumber() == 3)
            {
                Instance.EntFireAtTarget({ target: this.player, input: "KeyValue", value: `speed ${this.bonus_speed}`, delay: 1.00 });
                Instance.EntFireAtTarget({ target: this.player, input: "KeyValue", value: `gravity ${this.bonus_gravity}`, delay: 1.00 });
            }
        }
    }
    SetTrueSecretTp01()
    {
        this.secret_tp_pass = true;
        this.secret_tp_deadline = Instance.GetGameTime() + this.secret_tp_time;
        Instance.EntFireAtName({ name: map_script, input: "RunScriptInput", value: "CheckSecretTp01", activator: this.player, delay: this.secret_tp_time });
    }
    SetFalseSecretTp01()
    {
        this.secret_tp_pass = false;
    }
    CheckSecretTp01()
    {
        if(!this.secret_tp_pass) return;


        if(Instance.GetGameTime() < this.secret_tp_deadline) return;


        if(this.player?.IsValid() && this.player?.IsAlive())
        {
            this.player?.TakeDamage({damage: 1, inflictor: this.player, damageFlags: 16});
        }
    }
    AddKills()
    {
        this.kills++;
    }
    AddInfections()
    {
        this.infections++;
    }
    AddDamage(n)
    {
        this.damage += n;
    }
    AddJetPackS(pos)
    {
        if(this.secrets_founds.has(JSON.stringify(pos)))
        {
            EmitSoundOnClient(this.player, "sounds/gorodok/misc/button10.vsnd");
            return;
        } 
        this.jetpack_s_count++;
        if(this.jetpack_s_count != this.jetpack_max_s_count)
        {
            Instance.EntFireAtName({ name: misc_hud, input: "SetMessage", value: `You found ${this.jetpack_s_count} of ${this.jetpack_max_s_count} secrets to unlock the JetPack.` });
            Instance.EntFireAtName({ name: misc_hud, input: "ShowHudHint", activator: this.player });
        }
        if(this.jetpack_s_count >= this.jetpack_max_s_count)
        {
            this.jetpack_can_be_picked_up = true;
            Instance.EntFireAtName({ name: jetpack_hud, input: "ShowHudHint", activator: this.player });
        }
        EmitSoundOnClient(this.player, "sounds/gorodok/misc/button3.vsnd");
        this.secrets_founds.add(JSON.stringify(pos));
    }
    AddRpgS(pos)
    {
        if(this.secrets_founds.has(JSON.stringify(pos)))
        {
            EmitSoundOnClient(this.player, "sounds/gorodok/misc/button10.vsnd");
            return;
        } 
        this.rpg_s_count++;
        if(this.rpg_s_count != this.rpg_max_s_count)
        {
            Instance.EntFireAtName({ name: misc_hud, input: "SetMessage", value: `You found ${this.rpg_s_count} of ${this.rpg_max_s_count} secrets to unlock the RPG.` });
            Instance.EntFireAtName({ name: misc_hud, input: "ShowHudHint", activator: this.player });
        }
        if(this.rpg_s_count >= this.rpg_max_s_count)
        {
            this.rpg_can_be_picked_up = true;
            Instance.EntFireAtName({ name: rpg_hud, input: "ShowHudHint", activator: this.player });
        }
        EmitSoundOnClient(this.player, "sounds/gorodok/misc/button3.vsnd");
        this.secrets_founds.add(JSON.stringify(pos));
    }
    AddZmJumperS(pos)
    {
        if(this.secrets_founds.has(JSON.stringify(pos)))
        {
            EmitSoundOnClient(this.player, "sounds/gorodok/misc/button10.vsnd");
            return;
        } 
        this.zm_jumper_s_count++;
        if(this.zm_jumper_s_count != this.zm_jumper_max_s_count)
        {
            Instance.EntFireAtName({ name: misc_hud, input: "SetMessage", value: `You found ${this.zm_jumper_s_count} of ${this.zm_jumper_max_s_count} secrets to unlock the Zm Jumper.` });
            Instance.EntFireAtName({ name: misc_hud, input: "ShowHudHint", activator: this.player });
        }
        if(this.zm_jumper_s_count >= this.zm_jumper_max_s_count)
        {
            this.zm_jumper_can_be_picked_up = true;
            Instance.EntFireAtName({ name: zmjumper_hud, input: "ShowHudHint", activator: this.player });
        }
        EmitSoundOnClient(this.player, "sounds/gorodok/misc/button3.vsnd");
        this.secrets_founds.add(JSON.stringify(pos));
    }
    SetMapper()
    {
        this.Mapper = true;
        this.jetpack_can_be_picked_up = true;
        this.rpg_can_be_picked_up = true;
        this.zm_jumper_can_be_picked_up = true;
    }
    SetPlayerModel()
    {
        if(this.player?.IsValid() && this.player?.IsAlive() && this.player?.GetTeamNumber() == 3)
        {
            Instance.EntFireAtTarget({ target: this.player, input: "SetModel", value: `${Player_Skin}` });
        }
    }
}


////////////////////////////////////////////////////////////


const bed_items = [
    {x: -2522.63, y: 1417, z: 613},
    {x: -2522.63, y: 1896, z: 613},
    {x: 1335, y: -765.916, z: 21},
    {x: 2511, y: -1367.94, z: 490},
    {x: 2122, y: -1599.72, z: 808},
    {x: 2244.48, y: -1847.64, z: 966},
    {x: 2484.01, y: -1881.88, z: 1286},
    {x: 1348.07, y: -90, z: -248},
    {yaw: 270, x: 261, y: -203, z: -251},
    {x: 2752, y: -1166.35, z: 1289},
    {x: 559, y: 189, z: -501},
    {x: 1363.13, y: 1213.86, z: -249}
];
let Bed_Max_Count = 0;
const Bed_temp_ct = "item_bed_temp";
const Bed_temp_zm = "item_zm_bed_temp";
const Bed_For_Get = {damage: 3000, infections: 3}


////////////////////////////////////////////////////////////


const barrel_items = [
    {x: -3725.08, y: 2051.52, z: 692},
    {x: -2681.14, y: 2339.18, z: 614},
    {x: -2524.91, y: -351.361, z: 10},
    {x: -522.726, y: 709.458, z: 20},
    {x: 54, y: 770.325, z: 14},
    {x: 758.957, y: -944.25, z: 28},
    {x: 1014.38, y: -1521.75, z: 20},
    {x: 2471.3, y: -1610.72, z: 330},
    {x: 2028, y: -1616, z: 1288},
    {x: 2278, y: -1915.81, z: 1288},
    {x: 1812, y: 1006.05, z: -242},
    {x: 1399.9, y: 482.306, z: -242},
    {x: -470.851, y: -1202.71, z: -248},
    {x: -318.083, y: -1871.73, z: -244}
];
let Barrel_Max_Count = 0;
const Barrel_Temp = "item_barrel_temp";
const BarrelInstancesMap = new Map();
const BARREL_ENTITIES_MAP = {
    "item_barrel_model": "SetBarrelModel",
    "barrel_force_text": "SetBarrelText",
    "item_barrel_gameui": "SetBarrelUi",
    "item_barrel_relay": "SetBarrelRelay"
};
const BARREL_TICK_TIME = 0.25;
const Barrel_For_Get = {damage: 20000, infections: 15}


class Barrel
{
    constructor(suffix)
    {
        this.suffix = suffix;


        this.player = null;
        this.controller = null;
        this.pawn = null;
        this.player_name = null;
        this.player_slot = -1;


        this.barrel_model = null;
        this.barrel_text = null;
        this.barrel_ui = null;
        this.barrel_relay = null;


        this.barrel_spawn_temp = "barrel_exploder_temp";


        this.barrel_force = 0;
        this.barrel_max_force = 2500;
        this.barrel_force_time = 10.00;
        this.barrel_aplly_f = false;
        this.barrel_can_use = true;
        this.barrel_cd_t = 15.00;
        this.barrel_cd_c = 0.00;


        this.previous_barrel_suffix = null;
    }
    PickUpBarrel(activator)
    {
        this.SetPlayer(activator);
        const player_controller  = this.player?.GetPlayerController();
        this.SetController(player_controller);
        const player_pawn = player_controller?.GetPlayerPawn();
        this.SetPawn(player_pawn);
        const player_name = player_controller?.GetPlayerName();
        this.SetPlayerName(player_name);
        const player_slot = player_controller?.GetPlayerSlot();
        this.SetPlayerSlot(player_slot);
        this.player?.SetEntityName("item_owner"+this.suffix);
        Instance.EntFireAtTarget({ target: this.barrel_ui, input: "Activate", activator: this.player });
        this.BarrelTick();
    }
    BarrelTick()
    {
        if(!this.player || !this.player?.IsValid() || !this.player?.IsAlive() || this.player?.GetTeamNumber() != 2 || !this.controller)
        {
            BarrelInstancesMap.delete(this.suffix);
            return;
        }


        if(!this.barrel_can_use)
        {
            this.barrel_cd_c += BARREL_TICK_TIME;
            if(this.barrel_cd_c >= this.barrel_cd_t)
            {
                this.barrel_cd_c = 0.00;
                this.barrel_can_use = true;
                this.barrel_aplly_f = false;
            }
        }


        if(!this.barrel_model?.IsValid()) return;


        if(this.barrel_aplly_f && this.barrel_can_use)
        {
            const TOTAL_TIME = this.barrel_force_time;
            const TICK_TIME = BARREL_TICK_TIME;
            const MAX_FORCE = this.barrel_max_force;


            const increment = MAX_FORCE * (TICK_TIME / TOTAL_TIME);


            this.barrel_force += increment;


            if(this.barrel_force > MAX_FORCE)
            {
                this.barrel_force = MAX_FORCE;
            }
            Instance.EntFireAtTarget({ target: this.barrel_text, input: "SetMessage", value: `FORCE: ${parseInt(this.barrel_force)}` });
        }
        else
        {
            Instance.EntFireAtTarget({ target: this.barrel_text, input: "SetMessage", value: `FORCE: 0` });
        }


        Instance.EntFireAtName({ name: map_script, input: "RunScriptInput", value: "BarrelTick", activator: this.barrel_model, delay: BARREL_TICK_TIME });
    }
    ApplyForce(activator)
    {
        if(activator != this.player || !this.player?.IsValid() || this.player?.GetTeamNumber() != 2) return;
        if(!this.barrel_aplly_f)
        {
            this.barrel_aplly_f = true;
            return;
        }
        else
        {
            this.UseItem();
        }
        
    }
    UseItem()
    {
        if(!this.barrel_relay?.IsValid()) return;
        Instance.EntFireAtTarget({ target: this.barrel_relay, input: "Trigger" });


        if(!this.barrel_can_use) return;


        const barrel_ent_temp = Instance.FindEntityByName(this.barrel_spawn_temp);
        if(!barrel_ent_temp?.IsValid()) return;
        if(!this.barrel_model?.IsValid()) return;


        this.barrel_can_use = false;
        const eye_angles = this.player.GetEyeAngles();
        const forward = AngleToVector(eye_angles);
        const force = this.barrel_force;


        const velocity = {
            x: forward.x * force,
            y: forward.y * force,
            z: forward.z * force + 100
        };


        const spawn_offset = {
            x: forward.x * 32,
            y: forward.y * 32,
            z: forward.z * 32
        };


        const barrel_pos = this.barrel_model.GetAbsOrigin();
        const spawn_pos = {
            x: barrel_pos.x + spawn_offset.x,
            y: barrel_pos.y + spawn_offset.y,
            z: barrel_pos.z + spawn_offset.z
        };


        const spawned = barrel_ent_temp.ForceSpawn(spawn_pos);
        if(!spawned || spawned.length === 0) return;


        if(spawned[0]?.IsValid())
        {
            const fullName = spawned[0].GetEntityName();
            const suffix_b = fullName.match(/_\d+$/);
            this.previous_barrel_suffix = suffix_b ? suffix_b[0] : null;
        }


        for(let ent of spawned)
        {
            if(ent?.IsValid() && ent.GetEntityName()?.includes("spawn_barrel_phys"))
            {
                M_SetBaseVelocity(ent, velocity);
            }
        }


        this.barrel_force = 0;
        this.barrel_aplly_f = false;
    }
    SetPlayer(ent)
    {
        this.player = ent;
    }
    SetController(ent)
    {
        this.controller = ent;
    }
    SetPawn(ent)
    {
        this.pawn = ent;
    }
    SetPlayerName(name)
    {
        this.player_name = name;
    }
    SetPlayerSlot(slot)
    {
        this.player_slot = slot;
    }
    SetBarrelModel(ent)
    {
        this.barrel_model = ent;
    }
    SetBarrelText(ent)
    {
        this.barrel_text = ent;
    }
    SetBarrelUi(ent)
    {
        this.barrel_ui = ent;
    }
    SetBarrelRelay(ent)
    {
        this.barrel_relay = ent;
    }
}


function bindEntitiesToBarrel(BarrelInstance, entityArray) 
{
    let suffixKey = null;


    for(const ent of entityArray) 
    {
        const fullName = ent.GetEntityName();
        const suffix = fullName.match(/_\d+$/);
        const name = fullName.replace(/_\d+$/, ""); 


        if(!suffixKey && suffix?.[0]) 
        {
            suffixKey = suffix[0];
        }


        if(BARREL_ENTITIES_MAP[name]) 
        {
            const methodName = BARREL_ENTITIES_MAP[name];
            if(typeof BarrelInstance[methodName] === "function") 
            {
                BarrelInstance[methodName](ent);
                Instance.Msg(`Attached: ${name} → ${methodName}() | Full name: ${fullName}`);
            }
        } 
        else 
        {
            Instance.Msg(`Unknown entity name: ${name}`);
        }
    }


    if(suffixKey) 
    {
        BarrelInstancesMap.set(suffixKey, BarrelInstance);
        Instance.Msg(`[bindEntitiesToUfo] Added Barrel with key ${suffixKey}, total: ${BarrelInstancesMap.size}`);
    }
}


Instance.OnScriptInput("BarrelTick", ({ caller, activator }) => {
    if(activator?.IsValid())
    {
        const ent_name = activator?.GetEntityName();
        const suffix = ent_name.match(/_\d+$/);
        const BarrelInstance = BarrelInstancesMap.get(suffix?.[0]);
        if(BarrelInstance)
        {
            BarrelInstance.BarrelTick();
        }
    }
});


Instance.OnScriptInput("PickUpBarrel", ({ caller, activator }) => {
    if(caller?.IsValid() && activator?.IsValid())
    {
        const ent_name = caller?.GetEntityName();
        const suffix = ent_name.match(/_\d+$/);
        const BarrelInstance = BarrelInstancesMap.get(suffix?.[0]);
        if(BarrelInstance)
        {
            BarrelInstance.PickUpBarrel(activator);
        }
    }
});


Instance.OnScriptInput("ApplyForce", ({ caller, activator }) => {
    if(caller?.IsValid() && activator?.IsValid())
    {
        const ent_name = caller?.GetEntityName();
        const suffix = ent_name.match(/_\d+$/);
        const BarrelInstance = BarrelInstancesMap.get(suffix?.[0]);
        if(BarrelInstance)
        {
            BarrelInstance.ApplyForce(activator);
        }
    }
});


Instance.OnScriptInput("BarrelExplode", ({ caller, activator }) => {
    if(!caller?.IsValid()) return;


    const explosion_pos = caller.GetAbsOrigin();
    const fullName = caller.GetEntityName();
    const suffix_b_match = fullName.match(/_\d+$/); 
    const suffix_b = suffix_b_match ? suffix_b_match[0] : null;
    let attacker = null;
    for(const barrelInstance of BarrelInstancesMap.values()) 
    {
        if(barrelInstance.previous_barrel_suffix == suffix_b)
        {
            attacker = barrelInstance.player;
        }
    }


    const players = Instance.FindEntitiesByClass("player");


    for(const player of players)
    {
        if(!player?.IsValid() || !player.IsAlive()) continue;


        const player_pos = player.GetEyePosition();
        const dx = player_pos.x - explosion_pos.x;
        const dy = player_pos.y - explosion_pos.y;
        const dz = player_pos.z - explosion_pos.z;
        const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);


        let radius = 512;
        let max_damage = 200;


        if(distance > radius) continue;


        const traceResult = Instance.TraceLine({
            start: explosion_pos,
            end: player_pos,
            ignorePlayers: true
        });


        Instance.DebugLine({ start: explosion_pos, end: traceResult.end, duration: 10.00, color: {r: 255, g: 0, b: 0} });


        if(traceResult.didHit) 
        {
            const hit = traceResult.hitEntity;


            if(hit !== player) 
            {
                const classname = hit.GetClassName?.() || "";
                if(classname !== "func_button") 
                {
                    continue;
                }
            }
        }


        const damage = max_damage * (1 - (distance / radius));


        if(attacker)
        {
            player.TakeDamage({ damage: damage, attacker: attacker, inflictor: attacker?.GetActiveWeapon() });
        }
        else
        {
            player.TakeDamage({ damage: damage });
        }
    }
});


////////////////////////////////////////////////////////////


const builder_items = [
    {x: -3413.03, y: 2326.33, z: 616},
    {x: -3156.51, y: -406.743, z: 2240},
    {x: -2460.35, y: -1235.42, z: 1332},
    {x: 2701.3, y: -398.173, z: 1704},
    {x: 2712.14, y: -2106.57, z: 2024},
    {x: 1684.07, y: -1823.02, z: 1128},
    {x: 2432.61, y: -1735.49, z: 1448},
    {x: 2355.72, y: -1331.8, z: 652},
    {x: 1040.56, y: -843.48, z: 296},
    {x: -1345.06, y: -639.23, z: -248},
];


const builder_temp = "item_builder_temp";
const builderct_temp = "item_builderct_temp";
const Builder_For_Get = {damage: 30000, infections: 20}


////////////////////////////////////////////////////////////
//////////////////////////EVENTS////////////////////////////
////////////////////////////////////////////////////////////


Instance.OnBeforePlayerDamage((event) => {
    const player = event.player;
    const attacker = event.attacker;
    const weapon = event.weapon;
    let newDamage = event.damage;


    if(!player?.IsValid() || !attacker?.IsValid() || !weapon?.IsValid()) return;


    if(attacker.GetTeamNumber() !== 3 || player.GetTeamNumber() !== 2) return;


    const weaponName = weapon.GetData()?.GetName();
    const superData = SuperWeapons[weaponName];


    if(!superData) return;
    if(attacker !== superData.owner()) return;


    if(superData.multiplier) 
    {
        newDamage = event.damage * superData.multiplier;
    }


    return { damage: newDamage };
});


Instance.OnPlayerDamage((event) => {
    const player = event.player;
    const damage = event.damage;
    const attacker = event.attacker;
    const damageTypes = event.damageTypes;
    const weapon = event.weapon;
    let weaponName;
    if(weapon?.IsValid()) 
    {
        weaponName = weapon.GetData()?.GetName();
    }


    if(attacker?.GetClassName() !== "player") return;


    const attacker_controller = attacker?.GetPlayerController();
    const attacker_slot = attacker_controller?.GetPlayerSlot();


    if(player?.IsValid() && player.GetTeamNumber() === 3 && attacker?.IsValid() && attacker.GetTeamNumber() === 2 && damage > 0) 
    {
        if(weapon?.IsValid() && weaponName.includes("weapon_knife")) 
        {
            const inst = PlayerInstancesMap.get(attacker_slot);
            if(inst) 
            {
                inst.AddInfections();
            }
        }
    }
    if(player?.IsValid() && player.GetTeamNumber() === 2 && attacker?.IsValid() && attacker.GetTeamNumber() === 3 && damage > 0) 
    {
        const inst = PlayerInstancesMap.get(attacker_slot);
        if(inst) 
        {
            inst.AddDamage(damage);
        }
    }


    const superData = SuperWeapons[weaponName];


    if(superData && player?.IsValid() && attacker?.IsValid() && attacker === superData.owner() && weapon?.IsValid()) 
    {
        if(superData.headshot)
        {
            if(damageTypes != 8194 && damageTypes != 8192) return;
            HS_Queue.push({player: player, attacker: attacker, weapon: weapon});
            Instance.EntFireAtName({ name: map_script, input: "RunScriptInput", value: "ProcessHeadshotQueue", delay: 0.10 });
        }
        if(superData.knockback) 
        {


            const playerOrigin = player.GetAbsOrigin();
            const attackerOrigin = attacker.GetAbsOrigin();


            let dx = playerOrigin.x - attackerOrigin.x;
            let dy = playerOrigin.y - attackerOrigin.y;
            let dz = playerOrigin.z - attackerOrigin.z;


            const length = Math.sqrt(dx*dx + dy*dy + dz*dz) || 1;


            dx /= length;
            dy /= length;
            dz /= length;


            const pushForce = superData.knockback;


            const impulse = { x: dx * pushForce, y: dy * pushForce, z: 250 };
            M_SetBaseVelocity(player, impulse);
        }
    }
});


Instance.OnScriptInput("ProcessHeadshotQueue", ({caller, activator}) => {


    for(let i = 0; i < HS_Queue.length; i++)
    {
        const entry = HS_Queue[i];
        const player = entry.player;
        const attacker = entry.attacker;
        const weapon = entry.weapon;


        if(player?.IsValid())
        {
            player.TakeDamage({ damage: 1, damageFlags: 16, attacker: attacker, weapon: weapon, inflictor: weapon });
        }
    }


    HS_Queue.length = 0;
});


Instance.OnPlayerKill((event) => {
    const player = event.player;
    const attacker = event.attacker;
    const player_controller = player?.GetPlayerController();
    const player_slot = player_controller?.GetPlayerSlot();
    if(ITEMS_SET.has(player_slot))
    {
        ITEMS_SET.delete(player_slot);
    }
    if(attacker?.GetClassName() != "player") return;
    const attacker_controller = attacker?.GetPlayerController();
    const attacker_slot = attacker_controller?.GetPlayerSlot();
    if(player?.IsValid() && attacker?.IsValid() && player?.GetTeamNumber() == 2 && attacker?.GetTeamNumber() == 3)
    {
        const inst = PlayerInstancesMap.get(attacker_slot);
        if(inst)
        {
            inst.AddKills();
        }
    }
});


Instance.OnRoundStart(() => {
    SuperNegev_Owner = null;
    SuperAwp_Owner = null;
    SuperSawedoff_Owner = null;
    SuperDeagle_Owner = null;
    ITEMS_SET.clear();
    BarrelInstancesMap.clear();
    HS_Queue.length = 0;
    Instance.EntFireAtName({ name: "light_d_01", input: "SetColor", value: "255 194 143" });
    Instance.EntFireAtName({ name: "light_d_01", input: "setbrightness", value: "0" });
    let players_count = Instance.FindEntitiesByClass("player").length;
    if(players_count > 0)
    {
        const bed_ct_ent = Instance.FindEntityByName(Bed_temp_ct);
        const bed_zm_ent = Instance.FindEntityByName(Bed_temp_zm);
        if(!bed_ct_ent?.IsValid() || !bed_zm_ent?.IsValid()) return;
        Bed_Max_Count = Math.floor(players_count / 10) + 1;
        if(Bed_Max_Count > bed_items.length)
        {
            Bed_Max_Count = bed_items.length;
        }
        let bed_items_s = [...bed_items];
        for(let i = 0; i < Bed_Max_Count; i++)    
        {
            let rnd = RandomInt(0, 1);


            if(bed_items_s.length === 0) return;
            const index = RandomInt(0, bed_items_s.length - 1);
            const randomItem = bed_items_s.splice(index, 1)[0];
            const yaw = randomItem.yaw ?? 0;
            if(randomItem) 
            {
                if(rnd == 0) 
                {
                    bed_ct_ent.ForceSpawn({ x: randomItem.x, y: randomItem.y, z: randomItem.z }, { pitch: 0, yaw: bed_ct_ent?.GetAbsAngles().yaw + yaw, roll: 0 });
                } 
                else 
                {
                    bed_zm_ent.ForceSpawn({ x: randomItem.x, y: randomItem.y, z: randomItem.z }, { pitch: 0, yaw: bed_zm_ent?.GetAbsAngles().yaw + yaw, roll: 0 });
                }
                Instance.Msg(`SPAWNED BED in: ${randomItem.x}, ${randomItem.y}, ${randomItem.z} ${(rnd == 0) ? `CT` : `ZM`}`);
            }
        }


        const barrel_temp = Instance.FindEntityByName(Barrel_Temp);
        if(!barrel_temp?.IsValid()) return;
        Barrel_Max_Count = Math.floor(players_count / 10) + 1;
        if(Barrel_Max_Count > barrel_items.length)
        {
            Barrel_Max_Count = barrel_items.length;
        }
        let barrel_items_s = [...barrel_items];
        for(let i = 0; i < Barrel_Max_Count; i++)    
        {
            if(barrel_items_s.length === 0) return;


            const index = RandomInt(0, barrel_items_s.length - 1);
            const randomItem = barrel_items_s.splice(index, 1)[0];
            if(randomItem) 
            {
                let spawn_temp = barrel_temp.ForceSpawn({ x: randomItem.x, y: randomItem.y, z: randomItem.z });
                const suffix = spawn_temp[0]?.GetEntityName().match(/_\d+$/)?.[0];
                const BarrelInstance = new Barrel(suffix);
                bindEntitiesToBarrel(BarrelInstance, spawn_temp);
                Instance.Msg(`SPAWN BARREL in: ${randomItem.x}, ${randomItem.y}, ${randomItem.z}`);
            }
        }


        let builder_items_s = [...builder_items];
        if(builder_items_s.length === 0) return;
        let pos_01 = builder_items_s.splice(RandomInt(0, builder_items_s.length - 1), 1)[0];
        let pos_02 = builder_items_s.splice(RandomInt(0, builder_items_s.length - 1), 1)[0];


        const builder_hu_temp_ent = Instance.FindEntityByName(builderct_temp);
        const builder_zm_temp_ent = Instance.FindEntityByName(builder_temp);


        if(!builder_hu_temp_ent?.IsValid() || !builder_zm_temp_ent?.IsValid()) return


        builder_hu_temp_ent.ForceSpawn(pos_01);
        builder_zm_temp_ent.ForceSpawn(pos_02);


        Instance.Msg(`SPAWN Builder in: ${pos_01.x}, ${pos_01.y}, ${pos_01.z} | FOR CT`);
        Instance.Msg(`SPAWN Builder in: ${pos_02.x}, ${pos_02.y}, ${pos_02.z} | FOR ZM`);
    }
});


Instance.OnPlayerReset((event) => {
    const player = event.player;
    if(player?.IsValid())
    {
        const player_controller = player?.GetPlayerController();
        const player_name = player_controller?.GetPlayerName();
        const player_slot = player_controller?.GetPlayerSlot();
        Instance.EntFireAtTarget({ target: player, input: "Alpha", value: "255" });
        Instance.EntFireAtTarget({ target: player, input: "Color", value: "255 255 255" });
        Instance.EntFireAtTarget({ target: player, input: "KeyValue", value: "gravity 1" });
        Instance.EntFireAtTarget({ target: player, input: "SetScale", value: "1" });
        Instance.EntFireAtTarget({ target: player, input: "SetDamageFilter" });
        Instance.EntFireAtTarget({ target: player, input: "FireUser4", activator: player });
        Instance.EntFireAtName( { name: "steamid", input: "TestActivator", activator: player, delay: 0.10 });
        player?.SetEntityName("player_"+player_slot);
        if(PlayerInstancesMap.has(player_slot)) 
        {
            const inst = PlayerInstancesMap.get(player_slot);
            inst.player = player;
            inst.controller = player_controller;
            inst.name = player_name;
            inst.secret_tp_pass = false;
            inst.GetBonusBuff();
        } 
        else 
        {
            PlayerInstancesMap.set(player_slot, new Player(player, player_controller, player_name, player_slot));
        }
    }
});


////////////////////////////////////////////////////////////
/////////////////////////SECRETS////////////////////////////
////////////////////////////////////////////////////////////


Instance.OnScriptInput("AddJetPackS", ({caller, activator}) => {
    if(activator && caller)
    {
        const player = activator;
        const c_pos = caller?.GetAbsOrigin();
        const player_controller = player?.GetPlayerController();
        const player_slot = player_controller?.GetPlayerSlot();
        const inst = PlayerInstancesMap.get(player_slot);
        if(inst)
        {
            inst.AddJetPackS(c_pos);
        }
    }
});


Instance.OnScriptInput("AddRpgS", ({caller, activator}) => {
    if(activator && caller)
    {
        const player = activator;
        const c_pos = caller?.GetAbsOrigin();
        const player_controller = player?.GetPlayerController();
        const player_slot = player_controller?.GetPlayerSlot();
        const inst = PlayerInstancesMap.get(player_slot);
        if(inst)
        {
            inst.AddRpgS(c_pos);
        }
    }
});


Instance.OnScriptInput("AddZmJumperS", ({caller, activator}) => {
    if(activator && caller)
    {
        const player = activator;
        const c_pos = caller?.GetAbsOrigin();
        const player_controller = player?.GetPlayerController();
        const player_slot = player_controller?.GetPlayerSlot();
        const inst = PlayerInstancesMap.get(player_slot);
        if(inst)
        {
            inst.AddZmJumperS(c_pos);
        }
    }
});


////////////////////////////////////////////////////////////
const SecretTP01_For_Get = {kills: 10}
const SecretTP01_Dest = {x: 1519.26, y: -2351.93, z: 1600}
const SecretTP01_Ang = {pitch: 0, yaw: 270, roll: 0}


Instance.OnScriptInput("SecretTeleport01", ({caller, activator}) => {
    if(activator && caller)
    {
        const player = activator;
        const c_pos = caller?.GetAbsOrigin();
        const player_controller = player?.GetPlayerController();
        const player_slot = player_controller?.GetPlayerSlot();
        const inst = PlayerInstancesMap.get(player_slot);
        if(inst)
        {
            if(inst.kills >= SecretTP01_For_Get.kills)
            {
                player?.Teleport({position: SecretTP01_Dest, angles: SecretTP01_Ang});
                inst.SetTrueSecretTp01();
            }
            else
            {
                Instance.EntFireAtName({ name: misc_hud, input: "SetMessage", value: `You need ${SecretTP01_For_Get.kills} kills (ZM) to enter.\nYour kills: ${inst.kills}` });
                Instance.EntFireAtName({ name: misc_hud, input: "ShowHudHint", activator: player });
                EmitSoundOnClient(player, "sounds/gorodok/misc/button5.vsnd");
            }
        }
    }
});


Instance.OnScriptInput("CheckSecretTp01", ({caller, activator}) => {
    if(activator)
    {
        const player = activator;
        const player_controller = player?.GetPlayerController();
        const player_slot = player_controller?.GetPlayerSlot();
        const inst = PlayerInstancesMap.get(player_slot);
        if(inst)
        {
            inst.CheckSecretTp01();
        }
    }
});


Instance.OnScriptInput("SecretTpSucces", ({caller, activator}) => {
    if(activator)
    {
        const player = activator;
        const player_controller = player?.GetPlayerController();
        const player_slot = player_controller?.GetPlayerSlot();
        const inst = PlayerInstancesMap.get(player_slot);
        if(inst)
        {
            inst.SetFalseSecretTp01();
        }
    }
});


////////////////////////////////////////////////////////////




////////////////////////////////////////////////////////////
//////////////////////PICKUP ITEMS//////////////////////////
////////////////////////////////////////////////////////////


Instance.OnScriptInput("CanPickUpJetPack", ({caller, activator}) => {
    if(activator && caller)
    {
        const player = activator;
        const player_controller = player?.GetPlayerController();
        const player_slot = player_controller?.GetPlayerSlot();
        const inst = PlayerInstancesMap.get(player_slot);
        if(inst)
        {
            if(inst.jetpack_can_be_picked_up)
            {
                Instance.EntFireAtTarget({ target: caller, input: "FireUser1", activator: player });
            }
            else
            {
                const remaining = inst.jetpack_max_s_count - inst.jetpack_s_count;
                const secretText = remaining === 1 ? "secret" : "secrets";
                Instance.EntFireAtName({ name: misc_hud, input: "SetMessage", value: `You need to find ${remaining} ${secretText} to unlock the JetPack.` });
                Instance.EntFireAtName({ name: misc_hud, input: "ShowHudHint", activator: player });
                EmitSoundOnClient(player, "sounds/gorodok/misc/button5.vsnd");
            }
        }
    }
});


Instance.OnScriptInput("CanPickUpRPG", ({caller, activator}) => {
    if(activator && caller)
    {
        const player = activator;
        const player_controller = player?.GetPlayerController();
        const player_slot = player_controller?.GetPlayerSlot();
        const inst = PlayerInstancesMap.get(player_slot);
        if(inst)
        {
            if(inst.rpg_can_be_picked_up)
            {
                Instance.EntFireAtTarget({ target: caller, input: "FireUser1", activator: player });
            }
            else
            {
                const remaining = inst.rpg_max_s_count - inst.rpg_s_count;
                const secretText = remaining === 1 ? "secret" : "secrets";
                Instance.EntFireAtName({ name: misc_hud, input: "SetMessage", value: `You need to find ${remaining} ${secretText} to unlock the JetPack.` });
                Instance.EntFireAtName({ name: misc_hud, input: "ShowHudHint", activator: player });
                EmitSoundOnClient(player, "sounds/gorodok/misc/button5.vsnd");
            }
        }
    }
});


Instance.OnScriptInput("CanPickUpZmJumper", ({caller, activator}) => {
    if(activator && caller)
    {
        const player = activator;
        const player_controller = player?.GetPlayerController();
        const player_slot = player_controller?.GetPlayerSlot();
        const inst = PlayerInstancesMap.get(player_slot);
        if(inst)
        {
            if(inst.zm_jumper_can_be_picked_up)
            {
                Instance.EntFireAtTarget({ target: caller, input: "FireUser1", activator: player });
            }
            else
            {
                const remaining = inst.zm_jumper_max_s_count - inst.zm_jumper_s_count;
                const secretText = remaining === 1 ? "secret" : "secrets";
                Instance.EntFireAtName({ name: misc_hud, input: "SetMessage", value: `You need to find ${remaining} ${secretText} to unlock the ZM Jumper.` });
                Instance.EntFireAtName({ name: misc_hud, input: "ShowHudHint", activator: player });
                EmitSoundOnClient(player, "sounds/gorodok/misc/button5.vsnd");
            }
        }
    }
});


////////////////////////////////////////////////////////////
let SuperNegev_Owner = null;
Instance.OnScriptInput("PickUpSuperNegev", ({caller, activator}) => {
    if(activator)
    {
        SuperNegev_Owner = activator;
        Instance.EntFireAtName({ name: misc_hud, input: "SetMessage", value: `Super Negev: unlimited ammo and 3x damage.` });
        Instance.EntFireAtName({ name: misc_hud, input: "ShowHudHint", activator: SuperNegev_Owner });
    }
});


Instance.OnScriptInput("CheckSuperNegev", ({caller, activator}) => {
    if(!caller?.IsValid() || !SuperNegev_Owner?.IsValid() || !SuperNegev_Owner?.IsAlive() || SuperNegev_Owner?.GetTeamNumber() != 3 || caller?.GetOwner() != SuperNegev_Owner)
    {
        SuperNegev_Owner = null;
    }
    else
    {
        if(caller?.IsValid())
        {
            Instance.EntFireAtTarget({ target: caller, input: "setammoamount", value: "150" });
        }
    }
});
////////////////////////////////////////////////////////////
let SuperAwp_Owner = null;
Instance.OnScriptInput("PickUpSuperAwp", ({caller, activator}) => {
    if(activator)
    {
        SuperAwp_Owner = activator;
        Instance.EntFireAtName({ name: misc_hud, input: "SetMessage", value: `Super AWP: increased knockback and 10x damage.` });
        Instance.EntFireAtName({ name: misc_hud, input: "ShowHudHint", activator: SuperAwp_Owner });
    }
});


Instance.OnScriptInput("CheckSuperAwp", ({caller, activator}) => {
    if(!caller?.IsValid() || !SuperAwp_Owner?.IsValid() || !SuperAwp_Owner?.IsAlive() || SuperAwp_Owner?.GetTeamNumber() != 3 || caller?.GetOwner() != SuperAwp_Owner)
    {
        SuperAwp_Owner = null;
    }
});
////////////////////////////////////////////////////////////
let SuperSawedoff_Owner = null;
const SuperSawedoff_For_Get = {damage: 100000, infections: 10, kills: 10}
Instance.OnScriptInput("PickUpSuperSawedoff", ({caller, activator}) => {
    if(activator)
    {
        SuperSawedoff_Owner = activator;
        Instance.EntFireAtName({ name: misc_hud, input: "SetMessage", value: `Super Sawedoff: very high knockback and 15× damage.` });
        Instance.EntFireAtName({ name: misc_hud, input: "ShowHudHint", activator: SuperSawedoff_Owner });
    }
});


Instance.OnScriptInput("CheckSuperSawedoff", ({caller, activator}) => {
    if(!caller?.IsValid() || !SuperSawedoff_Owner?.IsValid() || !SuperSawedoff_Owner?.IsAlive() || SuperSawedoff_Owner?.GetTeamNumber() != 3 || caller?.GetOwner() != SuperSawedoff_Owner)
    {
        SuperSawedoff_Owner = null;
    }
});


Instance.OnScriptInput("CanPickSuperSawedoff", ({caller, activator}) => {
    if(!activator || !caller) return;


    const player = activator;
    const player_controller = player?.GetPlayerController();
    const player_slot = player_controller?.GetPlayerSlot();
    const player_pawn = player_controller?.GetPlayerPawn();
    const inst = PlayerInstancesMap.get(player_slot);


    if(!player?.IsValid() || !player?.IsAlive() || player?.GetTeamNumber() != 3) return;
    if(!inst) return;


    const canPick = inst.damage >= SuperSawedoff_For_Get.damage && inst.infections >= SuperSawedoff_For_Get.infections && inst.kills >= SuperSawedoff_For_Get.kills || inst.Mapper;
    if(canPick)
    {
        if(!player_pawn.FindWeaponBySlot(0))
        {
            SuperSawedoff_Owner = player_pawn;
            player_pawn.GiveNamedItem("weapon_sawedoff");
            let main_weapon = player_pawn.FindWeaponBySlot(0);
            let particle_sawedoff = Instance.FindEntityByName("particle_super_sawedoff");
            if(main_weapon)
            {
                if(particle_sawedoff?.IsValid())
                {
                    particle_sawedoff?.Teleport({position: main_weapon?.GetAbsOrigin()});
                    particle_sawedoff?.SetParent(main_weapon);
                    Instance.EntFireAtTarget({ target: particle_sawedoff, input: "Start" });
                }
                Instance.EntFireAtTarget({ target: main_weapon, input: "AddOutput", value: "OnPlayerPickup>map_script>RunScriptInput>PickUpSuperSawedoff>0.00>-1" });
                Instance.EntFireAtTarget({ target: main_weapon, input: "AddOutput", value: "OnUser1>!self>FireUser1>>1.00>-1" });
                Instance.EntFireAtTarget({ target: main_weapon, input: "AddOutput", value: "OnUser1>map_script>RunScriptInput>CheckSuperSawedoff>0.00>-1" });
                Instance.EntFireAtTarget({ target: main_weapon, input: "FireUser1", delay: 1.00 });
                Instance.EntFireAtName({ name: "super_sawedoff", input: "Kill" });
                Instance.EntFireAtName({ name: misc_hud, input: "SetMessage", value: `Super Sawedoff: very high knockback and 15× damage.` });
                Instance.EntFireAtName({ name: misc_hud, input: "ShowHudHint", activator: SuperSawedoff_Owner });
                caller?.Remove();
            }
        }            
    } 
    else 
    {
        let message = `To pick up: ${SuperSawedoff_For_Get.damage} dmg, ${SuperSawedoff_For_Get.infections} inf, ${SuperSawedoff_For_Get.kills} zombie kills.\nYou: ${inst.damage} dmg, ${inst.infections} inf, ${inst.kills} kills.`;
        Instance.EntFireAtName({ name: misc_hud, input: "SetMessage", value: message });
        Instance.EntFireAtName({ name: misc_hud, input: "ShowHudHint", activator: player })
    }
});
////////////////////////////////////////////////////////////
let SuperDeagle_Owner = null;
const SuperDeagle_For_Get = {damage: 200000, infections: 15, kills: 12}
Instance.OnScriptInput("PickUpSuperDeagle", ({caller, activator}) => {
    if(activator)
    {
        SuperDeagle_Owner = activator;
        Instance.EntFireAtName({ name: misc_hud, input: "SetMessage", value: `Super Deagle: Headshot instant-kill` });
        Instance.EntFireAtName({ name: misc_hud, input: "ShowHudHint", activator: SuperDeagle_Owner });
    }
});


Instance.OnScriptInput("CheckSuperDeagle", ({caller, activator}) => {
    if(!caller?.IsValid() || !SuperDeagle_Owner?.IsValid() || !SuperDeagle_Owner?.IsAlive() || SuperDeagle_Owner?.GetTeamNumber() != 3 || caller?.GetOwner() != SuperDeagle_Owner)
    {
        SuperDeagle_Owner = null;
    }
});


Instance.OnScriptInput("CanPickSuperDeagle", ({caller, activator}) => {
    if(!activator || !caller) return;


    const player = activator;
    const player_controller = player?.GetPlayerController();
    const player_slot = player_controller?.GetPlayerSlot();
    const player_pawn = player_controller?.GetPlayerPawn();
    const inst = PlayerInstancesMap.get(player_slot);


    if(!player?.IsValid() || !player?.IsAlive() || player?.GetTeamNumber() != 3) return;
    if(!inst) return;


    const canPick = inst.damage >= SuperDeagle_For_Get.damage && inst.infections >= SuperDeagle_For_Get.infections && inst.kills >= SuperDeagle_For_Get.kills || inst.Mapper;
    if(canPick)
    {
        if(!player_pawn.FindWeaponBySlot(1))
        {
            SuperDeagle_Owner = player_pawn;
            player_pawn.GiveNamedItem("weapon_deagle");
            let main_weapon = player_pawn.FindWeaponBySlot(1);
            let particle_deagle = Instance.FindEntityByName("particle_super_deagle");
            if(main_weapon)
            {
                if(particle_deagle?.IsValid())
                {
                    particle_deagle?.Teleport({position: main_weapon?.GetAbsOrigin()});
                    particle_deagle?.SetParent(main_weapon);
                    Instance.EntFireAtTarget({ target: particle_deagle, input: "Start" });
                }
                Instance.EntFireAtTarget({ target: main_weapon, input: "AddOutput", value: "OnPlayerPickup>map_script>RunScriptInput>PickUpSuperDeagle>0.00>-1" });
                Instance.EntFireAtTarget({ target: main_weapon, input: "AddOutput", value: "OnUser1>!self>FireUser1>>1.00>-1" });
                Instance.EntFireAtTarget({ target: main_weapon, input: "AddOutput", value: "OnUser1>map_script>RunScriptInput>CheckSuperDeagle>0.00>-1" });
                Instance.EntFireAtTarget({ target: main_weapon, input: "FireUser1", delay: 1.00 });
                Instance.EntFireAtName({ name: misc_hud, input: "SetMessage", value: `Super Deagle: Headshot instant-kill` });
                Instance.EntFireAtName({ name: misc_hud, input: "ShowHudHint", activator: SuperDeagle_Owner });
                Instance.EntFireAtName({ name: "super_deagle", input: "Kill" });
                caller?.Remove();
            }
        }            
    } 
    else 
    {
        let message = `To pick up: ${SuperDeagle_For_Get.damage} dmg, ${SuperDeagle_For_Get.infections} inf, ${SuperDeagle_For_Get.kills} zombie kills.\nYou: ${inst.damage} dmg, ${inst.infections} inf, ${inst.kills} kills.`;
        Instance.EntFireAtName({ name: misc_hud, input: "SetMessage", value: message });
        Instance.EntFireAtName({ name: misc_hud, input: "ShowHudHint", activator: player })
    }
});
////////////////////////////////////////////////////////////
let Shovel_Owner = null;
const Shovel_Damage = 2500;
const Shovel_Push = 1200;
const Shovel_For_Get = {damage: 5000, infections: 3}


Instance.OnScriptInput("PickUpShovel", ({caller, activator}) => {
    if(activator)
    {
        Shovel_Owner = activator;
        Instance.EntFireAtName({ name: misc_hud, input: "SetMessage", value: `Shovel: Pushes zombies and deals 2500 damage.` });
        Instance.EntFireAtName({ name: misc_hud, input: "ShowHudHint", activator: Shovel_Owner });
    }
});


Instance.OnScriptInput("CheckShovel", ({caller, activator}) => {
    if(!caller?.IsValid() || !Shovel_Owner?.IsValid() || !Shovel_Owner?.IsAlive() || Shovel_Owner?.GetTeamNumber() != 3 || caller?.GetOwner() != Shovel_Owner)
    {
        Shovel_Owner = null;
    }
});


Instance.OnScriptInput("CanPickShovel", ({caller, activator}) => {
    if(!activator || !caller) return;


    const player = activator;
    const player_controller = player?.GetPlayerController();
    const player_slot = player_controller?.GetPlayerSlot();
    const player_pawn = player_controller?.GetPlayerPawn();
    const inst = PlayerInstancesMap.get(player_slot);


    if(!player?.IsValid() || !player?.IsAlive() || player?.GetTeamNumber() != 3) return;
    if(!inst) return;


    const canPick = inst.damage >= Shovel_For_Get.damage || inst.infections >= Shovel_For_Get.infections || inst.Mapper;
    if(canPick)
    {
        if(!player_pawn.FindWeaponBySlot(1))
        {
            Shovel_Owner = player;
            player_pawn.GiveNamedItem("weapon_elite");
            let main_weapon = player_pawn.FindWeaponBySlot(1);
            let shovel_button = Instance.FindEntityByName("item_shovel_button");
            if(main_weapon && shovel_button?.IsValid())
            {
                Instance.EntFireAtTarget({ target: shovel_button, input: "Press" });
                const origin = main_weapon.GetAbsOrigin();
                const angles = main_weapon.GetAbsAngles();
                const { forward, right, up } = AngleVectors(angles);
                const offset = {forward:40, right:1, up:40, pitchOffset:0, yawOffset:180, rollOffset:0}
                const offsetPos = {
                    x: origin.x + forward.x*offset.forward + right.x*offset.right + up.x*offset.up,
                    y: origin.y + forward.y*offset.forward + right.y*offset.right + up.y*offset.up,
                    z: origin.z + forward.z*offset.forward + right.z*offset.right + up.z*offset.up
                };
                const offsetang = { pitch: angles.pitch + offset.pitchOffset, yaw: angles.yaw + offset.yawOffset, roll: angles.roll + offset.rollOffset };


                shovel_button.Teleport({position: offsetPos, angles: offsetang});
                shovel_button.SetParent(main_weapon);
                Instance.EntFireAtName({ name: `shovel_weapon`, input: "Kill", delay: 0.5 });


                Instance.EntFireAtTarget({ target: main_weapon, input: "AddOutput", value: "OnPlayerPickup>map_script>RunScriptInput>PickUpShovel>0.00>-1" });
                Instance.EntFireAtTarget({ target: main_weapon, input: "AddOutput", value: "OnUser1>!self>FireUser1>>1.00>-1" });
                Instance.EntFireAtTarget({ target: main_weapon, input: "AddOutput", value: "OnUser1>map_script>RunScriptInput>CheckShovel>0.00>-1" });
                Instance.EntFireAtTarget({ target: main_weapon, input: "FireUser1", delay: 1.00 });


                Instance.EntFireAtName({ name: misc_hud, input: "SetMessage", value: `Shovel: Pushes zombies and deals 2500 damage.` });
                Instance.EntFireAtName({ name: misc_hud, input: "ShowHudHint", activator: Shovel_Owner });


                let message = "";
                let player_name = player_controller?.GetPlayerName();
                if(player_name)
                {
                    message = `*** ${player_name} has picked up Shovel ***`;
                }
                else
                {
                    message = `*** Shovel has been picked. ***`;
                }
                Instance.ServerCommand(`say ${message}`);
                caller?.Remove();
            }
        }            
    } 
    else 
    {
        let message = `To pick up: ${Shovel_For_Get.damage} dmg or ${Shovel_For_Get.infections} inf.\nYou: ${inst.damage} dmg, ${inst.infections} inf.`;
        Instance.EntFireAtName({ name: misc_hud, input: "SetMessage", value: message });
        Instance.EntFireAtName({ name: misc_hud, input: "ShowHudHint", activator: player })
    }
});


Instance.OnScriptInput("ShovelDoDamage", ({caller, activator}) => {
    if(activator?.IsValid())
    {
        const player = activator;
        const attacker = Shovel_Owner;
        if(attacker?.IsValid() && attacker?.IsAlive() && attacker?.GetTeamNumber() == 3)
        {
            const attackerOrigin = attacker.GetAbsOrigin();
            const playerOrigin   = player.GetAbsOrigin();


            EmitSoundOnClient(player, "sounds/gorodok/shovel/shovel_impact.vsnd");
            EmitSoundOnClient(attacker, "sounds/gorodok/shovel/shovel_impact.vsnd");


            player?.TakeDamage({damage: Shovel_Damage, damageFlags: 32, attacker: attacker, inflictor: attacker?.GetActiveWeapon(), weapon: attacker?.GetActiveWeapon()});


            let dx = playerOrigin.x - attackerOrigin.x;
            let dy = playerOrigin.y - attackerOrigin.y;
            let dz = playerOrigin.z - attackerOrigin.z;


            const length = Math.sqrt(dx*dx + dy*dy + dz*dz) || 1;


            dx /= length;
            dy /= length;
            dz /= length;


            const pushForce = Shovel_Push;
            const impulse = {
                x: dx * pushForce,
                y: dy * pushForce,
                z: 300
            };


            M_SetBaseVelocity(player, impulse);
        }
    }
});




////////////////////////////////////////////////////////////
/////////////////////////ITEM_BED///////////////////////////
////////////////////////////////////////////////////////////
Instance.OnScriptInput("CanPickUpBed", ({caller, activator}) => {
    if(!activator || !caller) return;


    const player = activator;
    const player_controller = player?.GetPlayerController();
    const player_tname = player?.GetEntityName();
    const player_slot = player_controller?.GetPlayerSlot();
    const player_pawn = player_controller?.GetPlayerPawn();
    const inst = PlayerInstancesMap.get(player_slot);


    if(!inst || ITEMS_SET.has(player_slot)) return;


    const canPick = inst.damage >= Bed_For_Get.damage || inst.infections >= Bed_For_Get.infections || inst.Mapper;
    const ent_name = caller?.GetEntityName();
    const suffix = ent_name?.match(/_\d+$/);


    if(canPick) 
    {
        if(ent_name?.includes("item_bed_stripper_zm") && player?.GetTeamNumber() == 2 && !player_tname?.includes("item_owner")) 
        {
            giveAndAttachWeapon("Bed", player_controller, player_pawn, caller, player_slot, 2, "weapon_knife", "item_zm_bed_weapon", "item_zm_bed_button", suffix);
        } 
        else if(ent_name?.includes("item_bed_stripper_hu") && player?.GetTeamNumber() == 3) 
        {
            giveAndAttachWeapon("Bed", player_controller, player_pawn, caller, player_slot, 1, "weapon_elite", "item_bed_weapon", "item_bed_button", suffix);
        }
    } 
    else 
    {
        let message = `To pick up: ${Bed_For_Get.damage} dmg or ${Bed_For_Get.infections} inf.\nYou: ${inst.damage} dmg, ${inst.infections} inf.`;
        if(ent_name?.includes("item_bed_stripper_hu") && player?.GetTeamNumber() == 3) 
        {
            Instance.EntFireAtName({ name: misc_hud, input: "SetMessage", value: message });
            Instance.EntFireAtName({ name: misc_hud, input: "ShowHudHint", activator: player });
        }
        else if(ent_name?.includes("item_bed_stripper_zm") && player?.GetTeamNumber() == 2)
        {
            Instance.EntFireAtName({ name: misc_hud, input: "SetMessage", value: message });
            Instance.EntFireAtName({ name: misc_hud, input: "ShowHudHint", activator: player })
        }
    }
});


Instance.OnScriptInput("BedPushUp650", ({caller, activator}) => {
    if(activator)
    {
        const player = activator;
        M_SetBaseVelocity(player, {x: 0, y: 0, z: 650});
    }
});


////////////////////////////////////////////////////////////
////////////////////////ITEM_BARREL/////////////////////////
////////////////////////////////////////////////////////////
Instance.OnScriptInput("CanPickUpBarrel", ({caller, activator}) => {
    if(!activator || !caller) return;


    const player = activator;
    const player_controller = player?.GetPlayerController();
    const player_tname = player?.GetEntityName();
    const player_slot = player_controller?.GetPlayerSlot();
    const player_pawn = player_controller?.GetPlayerPawn();
    const inst = PlayerInstancesMap.get(player_slot);


    if(!inst || ITEMS_SET.has(player_slot)) return;


    const canPick = inst.damage >= Barrel_For_Get.damage || inst.infections >= Barrel_For_Get.infections || inst.Mapper;
    const ent_name = caller?.GetEntityName();
    const suffix = ent_name?.match(/_\d+$/);


    if(canPick) 
    {
        if(player?.GetTeamNumber() == 2 && !player_tname?.includes("item_owner")) 
        {
            giveAndAttachWeapon("Barrel", player_controller, player_pawn, caller, player_slot, 2, "weapon_knife", "item_barrel_weapon", "item_barrel_button", suffix, {forward:30, right:1, up:60, pitchOffset:270, yawOffset:0, rollOffset:0});
        } 
    } 
    else 
    {
        let message = `To pick up: ${Barrel_For_Get.damage} dmg or ${Barrel_For_Get.infections} inf.\nYou: ${inst.damage} dmg, ${inst.infections} inf.`;
        if(player?.GetTeamNumber() == 2)
        {
            Instance.EntFireAtName({ name: misc_hud, input: "SetMessage", value: message });
            Instance.EntFireAtName({ name: misc_hud, input: "ShowHudHint", activator: player })
        }
    }
});


////////////////////////////////////////////////////////////
///////////////////////ITEM_BUILDER/////////////////////////
////////////////////////////////////////////////////////////


Instance.OnScriptInput("CanPickUpBuilder", ({caller, activator}) => {
    if(!activator || !caller) return;


    const player = activator;
    const player_controller = player?.GetPlayerController();
    const player_tname = player?.GetEntityName();
    const player_slot = player_controller?.GetPlayerSlot();
    const player_pawn = player_controller?.GetPlayerPawn();
    const inst = PlayerInstancesMap.get(player_slot);


    if(!inst || ITEMS_SET.has(player_slot)) return;


    const canPick = inst.damage >= Builder_For_Get.damage || inst.infections >= Builder_For_Get.infections || inst.Mapper;
    const ent_name = caller?.GetEntityName();
    const suffix = ent_name?.match(/_\d+$/);


    if(canPick) 
    {
        if(ent_name?.includes("item_builder_stripper_zm") && player?.GetTeamNumber() == 2 && !player_tname?.includes("item_owner")) 
        {
            giveAndAttachWeapon("Builder", player_controller, player_pawn, caller, player_slot, 2, "weapon_knife", "item_builder_weapon", "item_builder_button", suffix, {forward:60, right:-5, up:50, pitchOffset:270, yawOffset:0, rollOffset:0});
        } 
        else if(ent_name?.includes("item_builder_stripper_hu") && player?.GetTeamNumber() == 3) 
        {
            giveAndAttachWeapon("Builder", player_controller, player_pawn, caller, player_slot, 1, "weapon_elite", "item_builderct_weapon", "item_builderct_button", suffix, {forward:60, right:-5, up:50, pitchOffset:270, yawOffset:0, rollOffset:0});
        }
    } 
    else 
    {
        let message = `To pick up: ${Builder_For_Get.damage} dmg or ${Builder_For_Get.infections} inf.\nYou: ${inst.damage} dmg, ${inst.infections} inf.`;
        if(ent_name?.includes("item_builder_stripper_hu") && player?.GetTeamNumber() == 3) 
        {
            Instance.EntFireAtName({ name: misc_hud, input: "SetMessage", value: message });
            Instance.EntFireAtName({ name: misc_hud, input: "ShowHudHint", activator: player });
        }
        else if(ent_name?.includes("item_builder_stripper_zm") && player?.GetTeamNumber() == 2)
        {
            Instance.EntFireAtName({ name: misc_hud, input: "SetMessage", value: message });
            Instance.EntFireAtName({ name: misc_hud, input: "ShowHudHint", activator: player })
        }
    }
});


////////////////////////////////////////////////////////////
//////////////////////////MISC//////////////////////////////
////////////////////////////////////////////////////////////


Instance.OnPlayerDisconnect((event) => {
    PlayerInstancesMap.delete(event.playerSlot);
});


Instance.OnScriptInput("SetBonus", ({caller, activator}) => {
    if(activator && caller)
    {
        const player = activator;
        const player_controller = player?.GetPlayerController();
        const player_slot = player_controller?.GetPlayerSlot();
        const inst = PlayerInstancesMap.get(player_slot);
        if(inst) 
        {
            inst.SetBonus();
            Instance.EntFireAtTarget({ target: caller, input: "FireUser1" });
        }
    }
});


Instance.OnScriptInput("SetMapper", ({caller, activator}) => {
    if(activator)
    {
        const player = activator;
        const player_controller = player?.GetPlayerController();
        const player_slot = player_controller?.GetPlayerSlot();
        const inst = PlayerInstancesMap.get(player_slot);
        if(inst && !inst.Mapper) 
        {
            inst.SetMapper();
        }
    }
});


function IsValidPlayerTeam(player, team)
{
    return player != null && player?.IsValid() && player?.IsAlive() && player?.GetTeamNumber() == team
}


function IsValidPlayer(player)
{
    return player != null && player?.IsValid() && player?.IsAlive()
}


function GetValidPlayers() 
{
    return Instance.FindEntitiesByClass("player").filter(p => IsValidPlayer(p));
}


function GetValidPlayersCT() 
{
    return Instance.FindEntitiesByClass("player").filter(p => IsValidPlayerTeam(p, 3));
}


function GetValidPlayersZM() 
{
    return Instance.FindEntitiesByClass("player").filter(p => IsValidPlayerTeam(p, 2));
}


function GetValidPlayersInRange(origin, range, team = 3) 
{
    return Instance.FindEntitiesByClass("player").filter(p => IsValidPlayerTeam(p, team) && VectorDistance(p.GetAbsOrigin(), origin) <= range);
}


function EmitSoundOnClients(sound)
{
    let players = GetValidPlayers();
    for(let i = 0; i < players.length; i++)
    {
        let player = players[i];
        let player_c = player?.GetPlayerController();
        let player_s = player_c?.GetPlayerSlot();
        Instance.ClientCommand(player_s, "play "+sound);
    }
}


function EmitSoundOnClient(client, sound)
{
    let player = client;
    if(IsValidPlayer(player))
    {
        let player_c = player?.GetPlayerController();
        let player_s = player_c?.GetPlayerSlot();
        Instance.ClientCommand(player_s, "play "+sound);
    }
}


function StopSoundOnClients()
{
    let players = GetValidPlayers();
    for(let i = 0; i < players.length; i++)
    {
        let player = players[i];
        let player_c = player?.GetPlayerController();
        let player_s = player_c?.GetPlayerSlot();
        Instance.ClientCommand(player_s, "stopsound");
    }
}


function StopSoundOnClient(client)
{
    let player = client;
    if(IsValidPlayer(player))
    {
        let player_c = player?.GetPlayerController();
        let player_s = player_c?.GetPlayerSlot();
        Instance.ClientCommand(player_s, "stopsound");
    }
}


function M_SetAbsVelocity(ent, velocity)
{
    ent?.Teleport({velocity: velocity});
}


function M_SetBaseVelocity(ent, velocity)
{
    ent?.Teleport({velocity: {
            x: ent?.GetAbsVelocity().x + velocity.x, 
            y: ent?.GetAbsVelocity().y + velocity.y, 
            z: ent?.GetAbsVelocity().z + velocity.z
        }
    });
}




function RandomInt(min, max) 
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function RandomFloat(min, max) 
{
    return Math.random() * (max - min) + min;
}


function AngleVectors(ang)
{
    const pitch = ang.pitch * Math.PI / 180;
    const yaw   = ang.yaw   * Math.PI / 180;
    const roll  = ang.roll  * Math.PI / 180;


    const sp = Math.sin(pitch);
    const cp = Math.cos(pitch);


    const sy = Math.sin(yaw);
    const cy = Math.cos(yaw);


    const sr = Math.sin(roll);
    const cr = Math.cos(roll);


    const forward = {
        x: cp * cy,
        y: cp * sy,
        z: -sp,
    };


    const right = {
        x: -sr * sp * cy + -cr * -sy,
        y: -sr * sp * sy + -cr *  cy,
        z: -sr * cp,
    };


    const up = {
        x: cr * sp * cy + -sr * -sy,
        y: cr * sp * sy + -sr *  cy,
        z: cr * cp,
    };


    return { forward, right, up };
}


Instance.OnScriptInput("UseItem", ({caller, activator}) => {
    if(caller?.IsValid())
    {
        if(caller?.GetParent()?.GetOwner() == activator)
        {
            Instance.EntFireAtTarget({ target: caller, input: "FireUser1", activator: activator });
        }
    }
});


function giveAndAttachWeapon(item_name, player_controller, player_pawn, caller, player_slot, slot, weaponName, weapon_name_ent, button_name, suffix, offset = {forward:48, right:1, up:40, pitchOffset:270, yawOffset:0, rollOffset:0}) 
{
    let weapon = player_pawn?.FindWeaponBySlot(slot);
    if(slot == 1 && weapon) return;
    if(!weapon) 
    {
        player_pawn.GiveNamedItem(weaponName);
        weapon = player_pawn?.FindWeaponBySlot(slot);
    }
    const origin = weapon.GetAbsOrigin();
    const angles = weapon.GetAbsAngles();
    const { forward, right, up } = AngleVectors(angles);
    const offsetPos = {
        x: origin.x + forward.x*offset.forward + right.x*offset.right + up.x*offset.up,
        y: origin.y + forward.y*offset.forward + right.y*offset.right + up.y*offset.up,
        z: origin.z + forward.z*offset.forward + right.z*offset.right + up.z*offset.up
    };
    const offsetang = { pitch: angles.pitch + offset.pitchOffset, yaw: angles.yaw + offset.yawOffset, roll: angles.roll + offset.rollOffset };
    if(!suffix)
    {
        suffix = "";
    }
    let item_button = Instance.FindEntityByName(button_name+suffix);
    if(item_button?.IsValid()) 
    {
        item_button.Teleport({position: offsetPos, angles: offsetang});
        item_button.SetParent(weapon);
        Instance.EntFireAtName({ name: `${weapon_name_ent}${suffix}`, input: "Kill", delay: 0.5 });
        if(item_name === "Barrel")
        {
            Instance.EntFireAtName({ name: `item_barrel_model${suffix}`, input: "FireUser1", activator: player_pawn });
        }
        if(item_name === "Builder")
        {
            Instance.EntFireAtTarget({ target: item_button, input: "FireUser2", activator: player_pawn });
            Instance.ConnectOutput(weapon, "OnPlayerPickup", ({caller, activator}) => {
                Instance.EntFireAtTarget({ target: item_button, input: "FireUser2", activator: activator });
            });
        }
        caller.Remove();
        let message = "";
        let player_name = player_controller?.GetPlayerName();
        if(player_name)
        {
            message = `*** ${player_name} has picked up ${item_name} ***`;
        }
        else
        {
            message = `*** ${item_name} has been picked. ***`;
        }
        Instance.ServerCommand(`say ${message}`);
        if(slot == 2)
        {
            ITEMS_SET.add(player_slot);
        }
    }
}


function AngleToVector(angles)
{
    const rad = (deg) => deg * (Math.PI / 180);


    const pitch = rad(angles.pitch);
    const yaw = rad(angles.yaw);


    const x = Math.cos(pitch) * Math.cos(yaw);
    const y = Math.cos(pitch) * Math.sin(yaw);
    const z = -Math.sin(pitch);


    return {x, y, z};
}


Instance.OnScriptInput("TestAllHP", ({caller, activator}) => {
    const players = Instance.FindEntitiesByClass("player");
    if(players.length > 0)
    {
        for(let i = 0; i < players.length; i++)
        {
            let player = players[i];
            if(player?.IsValid())
            {
                player?.SetHealth(1000000);
            }
        }
    }
});


Instance.OnScriptInput("TestDoDamage", ({caller, activator}) => {
    const players = Instance.FindEntitiesByClass("player");
    if(players.length > 0)
    {
        let rnd_player = players[RandomInt(0, players.length - 1)];
        let rnd_player_2 = players[RandomInt(0, players.length - 1)];
        rnd_player?.TakeDamage({ damage: 1, damageFlags: 16, attacker: rnd_player_2, weapon: rnd_player_2?.GetActiveWeapon() });
    }
});
