import { Instance } from 'cs_script/point_script';

let spudGun = "weapon_ssg08";
const freezeTime = 5;
const maxHealth = 1000;
const switchThreshold = 16;
const healthDecay = 15;
const tickRate = 1 / 4;
let players = [];
Instance.ServerCommand("sv_cheats 1");
Instance.ServerCommand("game_type 0");
Instance.ServerCommand("game_mode 0");
Instance.ServerCommand("bot_kick");
Instance.ServerCommand("bot_add");
Instance.ServerCommand("bot_add");
Instance.ServerCommand("mp_free_armor 2");
Instance.ServerCommand("mp_warmup_offline_enabled 1");
Instance.ServerCommand("mp_warmuptime 5");
Instance.ServerCommand("mp_roundtime_defuse 60");
Instance.ServerCommand("mp_roundtime 60");
Instance.ServerCommand(`mp_freezetime ${freezeTime.toString() ?? 5}`);
Instance.ServerCommand("mp_teammates_are_enemies 1");
Instance.ServerCommand("mp_auto_team_balance 0");
Instance.ServerCommand("mp_limit_teams 0");
Instance.ServerCommand("mp_maxrounds 999");
Instance.ServerCommand("mp_overtime_enable 1");
Instance.ServerCommand("mp_overtime_maxrounds 999");
Instance.ServerCommand("mp_match_end_restart 1");
Instance.ServerCommand("mp_match_end_changelevel 0");
Instance.ServerCommand("mp_autokick 0");
Instance.ServerCommand("mp_autokick_timeout 0");
Instance.ServerCommand("mp_suicide_penalty 0");
Instance.ServerCommand("mp_death_drop_gun 0");
Instance.ServerCommand("mp_death_drop_grenade 0");
Instance.ServerCommand("mp_death_drop_taser 0");
/**
 * Fetch the index and player object of the current potato holder.
 */
function getCurrentHolder() {
    for (let i = 0; i < players.length; i++) {
        const player = players[i];
        if (player.isHolder) {
            return {
                player,
                index: i
            };
        }
    }
    return { player: undefined, index: -1 };
}
/**
 * Find player with the given ID and remove them from the array.
 */
function removePlayer(id) {
    let index = null;
    for (let i = 0; i < players.length; i++) {
        const p = players[i];
        if (p.id === id) {
            index = i;
            break;
        }
    }
    if (index !== null) {
        players.splice(index, 1);
    }
}
/**
 * Set a random player as potato holder. Selected player must be alive and not the previous holder.
 */
function electRandomPlayer() {
    // If nobody is alive, return immediately
    let foundLiving = false;
    for (const player of players) {
        if (player.isAlive) {
            foundLiving = true;
        }
    }
    if (!foundLiving) {
        const { player } = getCurrentHolder();
        if (player)
            player.isHolder = false;
        return;
    }
    // Pick random players until it finds one that is alive
    let playerIndex = Math.floor(Math.random() * players.length);
    while (!players[playerIndex].isAlive) {
        playerIndex = Math.floor(Math.random() * players.length);
    }
    revokeAllPotatoes();
    players[playerIndex].isHolder = true;
}
/**
 * Subtract health from current potato holder.
 */
function decreaseHealth() {
    const { player } = getCurrentHolder();
    let aliveCount = 0;
    for (const player of players) {
        aliveCount += player.isAlive ? 1 : 0;
    }
    // Don't decrease health if only one player is alive.
    if (aliveCount === 1)
        return;
    if (!player)
        return;
    const h = player.ctrl.GetPlayerPawn()?.GetHealth();
    if (!h)
        return;
    if (h < 1) {
        // Kill player if health is 0 or less, and elect a new holder
        player.ctrl.GetPlayerPawn()?.Kill();
        player.isAlive = false;
        electRandomPlayer();
    }
    else {
        player.ctrl.GetPlayerPawn()?.SetHealth(h - healthDecay);
    }
    player.health = h;
}
/**
 * Find anyone holding a potato and revoke their holder status.
 */
function revokeAllPotatoes() {
    for (const player of players) {
        if (player.isHolder) {
            player.isHolder = false;
        }
    }
}
/**
 * Gives the spud gun to the current potato holder.
 */
function givePotato() {
    // Give holder the Scout
    const { player } = getCurrentHolder();
    if (!player || !player.isAlive)
        return;
    const pawn = player.ctrl.GetPlayerPawn();
    if (!pawn)
        return;
    const activeWeapon = pawn.GetActiveWeapon();
    if (!activeWeapon || activeWeapon !== pawn.FindWeapon(spudGun)) {
        const knife = pawn.FindWeaponBySlot(2);
        if (knife) {
            pawn.SwitchToWeapon(knife);
        }
        pawn.DestroyWeapons();
        pawn.GiveNamedItem(spudGun, true);
    }
}
/**
 * Delete the weapons of anyone not holding the potato.
 */
function forceDequipAll() {
    for (const player of players) {
        const pawn = player.ctrl.GetPlayerPawn();
        if (pawn && !player.isHolder && player.isAlive) {
            pawn.DestroyWeapons();
            const knife = pawn.FindWeaponBySlot(2);
            if (knife) {
                pawn.SwitchToWeapon(knife);
            }
        }
    }
}
/**
 * Check each player's health on the last tick against their health this tick.
 * If enough damage was received, send the potato to the victim.
 */
function checkForHit() {
    for (const player of players) {
        if (!player.isAlive) {
            // Don't even consider this fella if they're dead
            break;
        }
        const prevHealth = player.health;
        const currHealth = player.ctrl.GetPlayerPawn()?.GetHealth() ?? prevHealth;
        const damageTaken = prevHealth - currHealth;
        if (damageTaken > switchThreshold) {
            if (currHealth > 0) {
                // If damage taken was enough to cause a switch, and victim is still alive
                // Undo damage dealt by scout.
                player.ctrl.GetPlayerPawn()?.SetHealth(prevHealth);
                // Switch potato holder.
                revokeAllPotatoes();
                player.isHolder = true;
            }
            else {
                // Assign potato to someone else, as the victim is dead.
                electRandomPlayer();
            }
        }
    }
}
/**
 * Render live debug text of every player's current status
 */
function liveDebugText() {
    let verticalOffset = 400;
    for (const player of players) {
        // Default players' text is white
        let color = { r: 255, g: 255, b: 255, a: 255 };
        if (player.isHolder) {
            // Current holder's text is green
            color = { r: 127, g: 255, b: 127, a: 255 };
        }
        else if (!player.isAlive) {
            // Dead players' text is grey
            color = { r: 127, g: 127, b: 127, a: 255 };
        }
        // Show each player's name and status
        let text;
        const pawn = player.ctrl.GetPlayerPawn();
        if (pawn) {
            text = `${player.ctrl.GetPlayerName()}: {alive: ${player.isAlive}, holder: ${player.isHolder}, health: ${player.health}, score: ${player.score.toString()}`;
        }
        else {
            text = `${player.ctrl.GetPlayerName()}: No Pawn`;
        }
        // Print debug info in column
        Instance.DebugScreenText(text, 10, verticalOffset, tickRate, color);
        verticalOffset += 20;
    }
}
/**
 * Set round-start values for each player.
 */
function initPlayers() {
    for (const player of players) {
        const pawn = player.ctrl.GetPlayerPawn();
        if (pawn) {
            pawn.SetMaxHealth(maxHealth);
            pawn.SetHealth(maxHealth);
            player.health = maxHealth;
            player.isHolder = false;
            player.isAlive = true;
        }
    }
}
/**
 * Check if any players are alive.
 */
function checkIfAllDead() {
    for (const player of players) {
        if (player.isAlive)
            return;
    }
}
/**
 * Main handler for events. Triggers once every tickRate.
 */
function think() {
    let toRemove = [];
    for (const player of players) {
        if (!player.ctrl.GetPlayerPawn()?.IsValid()) {
            toRemove.push(player.id);
        }
    }
    for (const id of toRemove) {
        removePlayer(id);
    }
    decreaseHealth();
    liveDebugText();
    givePotato();
    checkForHit();
    forceDequipAll();
    Instance.SetNextThink(Instance.GetGameTime() + tickRate);
}
/**
 * On round start re-initialise the players array and pick a random player for the potato.
 * Set next think to end after freeze time.
 */
Instance.OnRoundStart(() => {
    if (Instance.IsWarmupPeriod())
        return;
    initPlayers();
    electRandomPlayer();
    Instance.SetNextThink(Instance.GetGameTime() + freezeTime);
});
/**
 * When a player arrives at the start of the round give them max health
 * and destroy their weapons.
 */
Instance.OnPlayerActivate((player) => {
    const pawn = player.GetPlayerPawn();
    if (!pawn)
        return;
    pawn.SetMaxHealth(maxHealth);
    const newPlayer = {
        ctrl: player,
        health: maxHealth,
        id: player.GetPlayerSlot(),
        isHolder: false,
        isAlive: false,
        score: 0,
    };
    players.push(newPlayer);
});
const items = {};
items.revolver = "weapon_revolver";
items.scout = "weapon_ssg08";
items.scout = "weapon_ssg08";
items.deagle = "weapon_deagle";
items.mag7 = "weapon_mag7";
items.awp = "weapon_awp";
/**
 * Chat commands to add or remove bots, and change the spud gun.
 * TODO: make this temporary.
 */
Instance.OnPlayerChat((speaker, team, text) => {
    // /change revolver
    if (text.startsWith("/change")) {
        const weaponName = text.split(" ")[1];
        const weaponCommand = items[weaponName];
        if (weaponCommand) {
            spudGun = weaponCommand;
        }
    }
    else if (text.startsWith("/bot")) {
        // Used to manage bots - would use console but the v2 is really unstable
        // on my machine and it makes me want to cry.
        const action = text.split(" ")[1];
        if (action === "add") {
            Instance.ServerCommand("bot_add");
        }
        else if (action === "kick") {
            Instance.ServerCommand("bot_kick");
        }
    }
});
/**
 * When a player disconnects remove them from the players array.
 */
Instance.OnPlayerDisconnect((playerSlot) => {
    removePlayer(playerSlot);
});
/**
 * On player death update the .isAlive property.
 */
Instance.OnPlayerKill((v, info) => {
    const slotNo = v.GetOriginalPlayerController().GetPlayerSlot();
    for (const player of players) {
        if (player.id === slotNo) {
            player.isAlive = false;
            if (player.isHolder) {
                electRandomPlayer();
            }
        }
    }
    checkIfAllDead();
});
/**
 * Give all living players 1 point at round end and announce scores
 */
Instance.OnRoundEnd((_) => {
    let text = "Rounds Survived: ";
    let components = [];
    for (const player of players) {
        if (player.isAlive) {
            player.score++;
        }
        components.push(`${player.score.toString()} - ${player.ctrl.GetPlayerName()}`);
    }
    text += components.join(" | ");
    Instance.ServerCommand(`say ${text}`);
});
Instance.OnGunFire((weapon) => {
    const shooterPawn = weapon.GetOwner();
    const { player } = getCurrentHolder();
    const holderPawn = player?.ctrl.GetPlayerPawn();
    if (!player || !shooterPawn || !holderPawn || shooterPawn !== holderPawn) {
        // we don't care about this shot
        return;
    }
    const start = shooterPawn.GetEyePosition();
    const direction = shooterPawn.GetEyeAngles();
    const pitch = direction.pitch * Math.PI / 180;
    const yaw = direction.yaw * Math.PI / 180;
    const dx = Math.cos(pitch) * Math.cos(yaw);
    const dy = Math.cos(pitch) * Math.sin(yaw);
    const dz = -Math.sin(pitch);
    const muliplier = 1000;
    const end = {
        x: start.x + dx * muliplier,
        y: start.y + dy * muliplier,
        z: start.z + dz * muliplier,
    };
    Instance.DebugLine(start, end, 10, { r: 255, g: 0, b: 0, a: 255 });
    const interacts = 0;
    const conf = {
        interacts,
    };
    const res = Instance.GetTraceHit(start, end, conf);
    const hitEntity = res.hitEnt;
    let text;
    if (hitEntity) {
        const className = hitEntity.GetClassName();
        const entityName = hitEntity.GetEntityName();
        const teamNo = hitEntity.GetTeamNumber();
        text = `Class: ${className}, Entity: ${entityName}, Number: ${teamNo}, Shooter: ${player.ctrl.GetPlayerName()}`;
    }
    else {
        text = `No Entity Hit - normal: ${res.normal}`;
    }
    Instance.DebugScreenText(text, 500, 500, 2, { r: 255, g: 255, b: 255, a: 255 });
});
// Begin hot potato'ing.
Instance.SetThink(think);
