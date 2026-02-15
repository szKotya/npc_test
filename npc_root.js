import { Instance } from 'cs_script/point_script';

class MathUtils {
	static clamp(value, min, max) {
		return Math.min(Math.max(value, min), max);
	}
}

const RAD_TO_DEG = 180 / Math.PI;

class Vector3Utils {
	static equals(a, b) {
		return a.x === b.x && a.y === b.y && a.z === b.z;
	}
	static add(a, b) {
		return new Vec3(a.x + b.x, a.y + b.y, a.z + b.z);
	}
	static subtract(a, b) {
		return new Vec3(a.x - b.x, a.y - b.y, a.z - b.z);
	}
	static scale(vector, scale) {
		return new Vec3(vector.x * scale, vector.y * scale, vector.z * scale);
	}
	static multiply(a, b) {
		return new Vec3(a.x * b.x, a.y * b.y, a.z * b.z);
	}
	static divide(vector, divider) {
		if (typeof divider === 'number') {
			if (divider === 0)
				throw Error('Division by zero');
			return new Vec3(vector.x / divider, vector.y / divider, vector.z / divider);
		}
		else {
			if (divider.x === 0 || divider.y === 0 || divider.z === 0)
				throw Error('Division by zero');
			return new Vec3(vector.x / divider.x, vector.y / divider.y, vector.z / divider.z);
		}
	}
	static length(vector) {
		return Math.sqrt(Vector3Utils.lengthSquared(vector));
	}
	static lengthSquared(vector) {
		return vector.x ** 2 + vector.y ** 2 + vector.z ** 2;
	}
	static length2D(vector) {
		return Math.sqrt(Vector3Utils.length2DSquared(vector));
	}
	static length2DSquared(vector) {
		return vector.x ** 2 + vector.y ** 2;
	}
	static normalize(vector) {
		const length = Vector3Utils.length(vector);
		return length ? Vector3Utils.divide(vector, length) : Vec3.Zero;
	}
	static dot(a, b) {
		return a.x * b.x + a.y * b.y + a.z * b.z;
	}
	static cross(a, b) {
		return new Vec3(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);
	}
	static inverse(vector) {
		return new Vec3(-vector.x, -vector.y, -vector.z);
	}
	static distance(a, b) {
		return Vector3Utils.subtract(a, b).length;
	}
	static distanceSquared(a, b) {
		return Vector3Utils.subtract(a, b).lengthSquared;
	}
	static floor(vector) {
		return new Vec3(Math.floor(vector.x), Math.floor(vector.y), Math.floor(vector.z));
	}
	static vectorAngles(vector) {
		let yaw = 0;
		let pitch = 0;
		if (!vector.y && !vector.x) {
			if (vector.z > 0)
				pitch = -90;
			else
				pitch = 90;
		}
		else {
			yaw = Math.atan2(vector.y, vector.x) * RAD_TO_DEG;
			pitch = Math.atan2(-vector.z, Vector3Utils.length2D(vector)) * RAD_TO_DEG;
		}
		return new Euler({
			pitch,
			yaw,
			roll: 0,
		});
	}
	static lerp(a, b, fraction, clamp = true) {
		let t = fraction;
		if (clamp) {
			t = MathUtils.clamp(t, 0, 1);
		}
		// a + (b - a) * t
		return new Vec3(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, a.z + (b.z - a.z) * t);
	}
	static directionTowards(a, b) {
		return Vector3Utils.subtract(b, a).normal;
	}
	static lookAt(a, b) {
		return Vector3Utils.directionTowards(a, b).eulerAngles;
	}
	static withX(vector, x) {
		return new Vec3(x, vector.y, vector.z);
	}
	static withY(vector, y) {
		return new Vec3(vector.x, y, vector.z);
	}
	static withZ(vector, z) {
		return new Vec3(vector.x, vector.y, z);
	}
}
class Vec3 {
	x;
	y;
	z;
	static Zero = new Vec3(0, 0, 0);
	constructor(xOrVector, y, z) {
		if (typeof xOrVector === 'object') {
			this.x = xOrVector.x === 0 ? 0 : xOrVector.x;
			this.y = xOrVector.y === 0 ? 0 : xOrVector.y;
			this.z = xOrVector.z === 0 ? 0 : xOrVector.z;
		}
		else {
			this.x = xOrVector === 0 ? 0 : xOrVector;
			this.y = y === 0 ? 0 : y;
			this.z = z === 0 ? 0 : z;
		}
	}
	get length() {
		return Vector3Utils.length(this);
	}
	get lengthSquared() {
		return Vector3Utils.lengthSquared(this);
	}
	get length2D() {
		return Vector3Utils.length2D(this);
	}
	get length2DSquared() {
		return Vector3Utils.length2DSquared(this);
	}
	/**
	 * Normalizes the vector (Dividing the vector by its length to have the length be equal to 1 e.g. [0.0, 0.666, 0.333])
	 */
	get normal() {
		return Vector3Utils.normalize(this);
	}
	get inverse() {
		return Vector3Utils.inverse(this);
	}
	/**
	 * Floor (Round down) each vector component
	 */
	get floored() {
		return Vector3Utils.floor(this);
	}
	/**
	 * Calculates the angles from a forward vector
	 */
	get eulerAngles() {
		return Vector3Utils.vectorAngles(this);
	}
	toString() {
		return `Vec3: [${this.x}, ${this.y}, ${this.z}]`;
	}
	equals(vector) {
		return Vector3Utils.equals(this, vector);
	}
	add(vector) {
		return Vector3Utils.add(this, vector);
	}
	subtract(vector) {
		return Vector3Utils.subtract(this, vector);
	}
	divide(vector) {
		return Vector3Utils.divide(this, vector);
	}
	scale(scaleOrVector) {
		return typeof scaleOrVector === 'number'
			? Vector3Utils.scale(this, scaleOrVector)
			: Vector3Utils.multiply(this, scaleOrVector);
	}
	multiply(scaleOrVector) {
		return typeof scaleOrVector === 'number'
			? Vector3Utils.scale(this, scaleOrVector)
			: Vector3Utils.multiply(this, scaleOrVector);
	}
	dot(vector) {
		return Vector3Utils.dot(this, vector);
	}
	cross(vector) {
		return Vector3Utils.cross(this, vector);
	}
	distance(vector) {
		return Vector3Utils.distance(this, vector);
	}
	distanceSquared(vector) {
		return Vector3Utils.distanceSquared(this, vector);
	}
	/**
	 * Linearly interpolates the vector to a point based on a 0.0-1.0 fraction
	 * Clamp limits the fraction to [0,1]
	 */
	lerpTo(vector, fraction, clamp = true) {
		return Vector3Utils.lerp(this, vector, fraction, clamp);
	}
	/**
	 * Gets the normalized direction vector pointing towards specified point (subtracting two vectors)
	 */
	directionTowards(vector) {
		return Vector3Utils.directionTowards(this, vector);
	}
	/**
	 * Returns an angle pointing towards a point from the current vector
	 */
	lookAt(vector) {
		return Vector3Utils.lookAt(this, vector);
	}
	/**
	 * Returns the same vector but with a supplied X component
	 */
	withX(x) {
		return Vector3Utils.withX(this, x);
	}
	/**
	 * Returns the same vector but with a supplied Y component
	 */
	withY(y) {
		return Vector3Utils.withY(this, y);
	}
	/**
	 * Returns the same vector but with a supplied Z component
	 */
	withZ(z) {
		return Vector3Utils.withZ(this, z);
	}
}

class EulerUtils {
	static equals(a, b) {
		return a.pitch === b.pitch && a.yaw === b.yaw && a.roll === b.roll;
	}
	static normalize(angle) {
		const normalizeAngle = (angle) => {
			angle = angle % 360;
			if (angle > 180)
				return angle - 360;
			if (angle < -180)
				return angle + 360;
			return angle;
		};
		return new Euler(normalizeAngle(angle.pitch), normalizeAngle(angle.yaw), normalizeAngle(angle.roll));
	}
	static forward(angle) {
		const pitchInRad = (angle.pitch / 180) * Math.PI;
		const yawInRad = (angle.yaw / 180) * Math.PI;
		const cosPitch = Math.cos(pitchInRad);
		return new Vec3(cosPitch * Math.cos(yawInRad), cosPitch * Math.sin(yawInRad), -Math.sin(pitchInRad));
	}
	static right(angle) {
		const pitchInRad = (angle.pitch / 180) * Math.PI;
		const yawInRad = (angle.yaw / 180) * Math.PI;
		const rollInRad = (angle.roll / 180) * Math.PI;
		const sinPitch = Math.sin(pitchInRad);
		const sinYaw = Math.sin(yawInRad);
		const sinRoll = Math.sin(rollInRad);
		const cosPitch = Math.cos(pitchInRad);
		const cosYaw = Math.cos(yawInRad);
		const cosRoll = Math.cos(rollInRad);
		return new Vec3(-1 * sinRoll * sinPitch * cosYaw + -1 * cosRoll * -sinYaw, -1 * sinRoll * sinPitch * sinYaw + -1 * cosRoll * cosYaw, -1 * sinRoll * cosPitch);
	}
	static up(angle) {
		const pitchInRad = (angle.pitch / 180) * Math.PI;
		const yawInRad = (angle.yaw / 180) * Math.PI;
		const rollInRad = (angle.roll / 180) * Math.PI;
		const sinPitch = Math.sin(pitchInRad);
		const sinYaw = Math.sin(yawInRad);
		const sinRoll = Math.sin(rollInRad);
		const cosPitch = Math.cos(pitchInRad);
		const cosYaw = Math.cos(yawInRad);
		const cosRoll = Math.cos(rollInRad);
		return new Vec3(cosRoll * sinPitch * cosYaw + -sinRoll * -sinYaw, cosRoll * sinPitch * sinYaw + -sinRoll * cosYaw, cosRoll * cosPitch);
	}
	static lerp(a, b, fraction, clamp = true) {
		let t = fraction;
		if (clamp) {
			t = MathUtils.clamp(t, 0, 1);
		}
		const lerpComponent = (start, end, t) => {
			// Calculate the shortest angular distance
			let delta = end - start;
			// Normalize delta to [-180, 180] range to find shortest path
			if (delta > 180) {
				delta -= 360;
			}
			else if (delta < -180) {
				delta += 360;
			}
			// Interpolate using the shortest path
			return start + delta * t;
		};
		// a + (b - a) * t
		return new Euler(lerpComponent(a.pitch, b.pitch, t), lerpComponent(a.yaw, b.yaw, t), lerpComponent(a.roll, b.roll, t));
	}
	static withPitch(angle, pitch) {
		return new Euler(pitch, angle.yaw, angle.roll);
	}
	static withYaw(angle, yaw) {
		return new Euler(angle.pitch, yaw, angle.roll);
	}
	static withRoll(angle, roll) {
		return new Euler(angle.pitch, angle.yaw, roll);
	}
	static rotateTowards(current, target, maxStep) {
		const rotateComponent = (current, target, step) => {
			let delta = target - current;
			if (delta > 180) {
				delta -= 360;
			}
			else if (delta < -180) {
				delta += 360;
			}
			if (Math.abs(delta) <= step) {
				return target;
			}
			else {
				return current + Math.sign(delta) * step;
			}
		};
		return new Euler(rotateComponent(current.pitch, target.pitch, maxStep), rotateComponent(current.yaw, target.yaw, maxStep), rotateComponent(current.roll, target.roll, maxStep));
	}
	static clamp(angle, min, max) {
		return new Euler(MathUtils.clamp(angle.pitch, min.pitch, max.pitch), MathUtils.clamp(angle.yaw, min.yaw, max.yaw), MathUtils.clamp(angle.roll, min.roll, max.roll));
	}
}
class Euler {
	pitch;
	yaw;
	roll;
	static Zero = new Euler(0, 0, 0);
	constructor(pitchOrAngle, yaw, roll) {
		if (typeof pitchOrAngle === 'object') {
			this.pitch = pitchOrAngle.pitch === 0 ? 0 : pitchOrAngle.pitch;
			this.yaw = pitchOrAngle.yaw === 0 ? 0 : pitchOrAngle.yaw;
			this.roll = pitchOrAngle.roll === 0 ? 0 : pitchOrAngle.roll;
		}
		else {
			this.pitch = pitchOrAngle === 0 ? pitchOrAngle : pitchOrAngle;
			this.yaw = yaw === 0 ? 0 : yaw;
			this.roll = roll === 0 ? 0 : roll;
		}
	}
	/**
	 * Returns angle with every componented clamped from -180 to 180
	 */
	get normal() {
		return EulerUtils.normalize(this);
	}
	/**
	 * Returns a normalized forward direction vector
	 */
	get forward() {
		return EulerUtils.forward(this);
	}
	/**
	 * Returns a normalized backward direction vector
	 */
	get backward() {
		return this.forward.inverse;
	}
	/**
	 * Returns a normalized right direction vector
	 */
	get right() {
		return EulerUtils.right(this);
	}
	/**
	 * Returns a normalized left direction vector
	 */
	get left() {
		return this.right.inverse;
	}
	/**
	 * Returns a normalized up direction vector
	 */
	get up() {
		return EulerUtils.up(this);
	}
	/**
	 * Returns a normalized down direction vector
	 */
	get down() {
		return this.up.inverse;
	}
	toString() {
		return `Euler: [${this.pitch}, ${this.yaw}, ${this.roll}]`;
	}
	equals(angle) {
		return EulerUtils.equals(this, angle);
	}
	/**
	 * Linearly interpolates the angle to an angle based on a 0.0-1.0 fraction
	 * Clamp limits the fraction to [0,1]
	 * ! Euler angles are not suited for interpolation, prefer to use quarternions instead
	 */
	lerp(angle, fraction, clamp = true) {
		return EulerUtils.lerp(this, angle, fraction, clamp);
	}
	/**
	 * Returns the same angle but with a supplied pitch component
	 */
	withPitch(pitch) {
		return EulerUtils.withPitch(this, pitch);
	}
	/**
	 * Returns the same angle but with a supplied yaw component
	 */
	withYaw(yaw) {
		return EulerUtils.withYaw(this, yaw);
	}
	/**
	 * Returns the same angle but with a supplied roll component
	 */
	withRoll(roll) {
		return EulerUtils.withRoll(this, roll);
	}
	/**
	 * Rotates an angle towards another angle by a specific step
	 * ! Euler angles are not suited for interpolation, prefer to use quarternions instead
	 */
	rotateTowards(angle, maxStep) {
		return EulerUtils.rotateTowards(this, angle, maxStep);
	}
	/**
	 * Clamps each component (pitch, yaw, roll) between the corresponding min and max values
	 */
	clamp(min, max) {
		return EulerUtils.clamp(this, min, max);
	}
}

let idPool = 0;
let tasks = [];
function setTimeout(callback, ms) {
	const id = idPool++;
	tasks.unshift({
		id,
		atSeconds: Instance.GetGameTime() + ms / 1000,
		callback,
	});
	return id;
}
function setInterval(callback, ms) {
	const id = idPool++;
	tasks.unshift({
		id,
		everyNSeconds: ms / 1000,
		atSeconds: Instance.GetGameTime() + ms / 1000,
		callback,
	});
	return id;
}
function clearTimeout(id) {
	tasks = tasks.filter((task) => task.id !== id);
}
const clearInterval = clearTimeout;
function clearTasks() {
	tasks = [];
}
function runSchedulerTick() {
	for (let i = tasks.length - 1; i >= 0; i--) {
		const task = tasks[i];
		if (Instance.GetGameTime() < task.atSeconds)
			continue;
		if (task.everyNSeconds === undefined)
			tasks.splice(i, 1);
		else
			task.atSeconds = Instance.GetGameTime() + task.everyNSeconds;
		try {
			task.callback();
		}
		catch (err) {
			Instance.Msg('An error occurred inside a scheduler task');
			if (err instanceof Error) {
				Instance.Msg(err.message);
				Instance.Msg(err.stack ?? '<no stack>');
			}
		}
	}
}
Instance.SetThink(() => {
	// This has to run every tick
	Instance.SetNextThink(Instance.GetGameTime());
	runSchedulerTick();
});
Instance.SetNextThink(Instance.GetGameTime());
Instance.OnScriptReload({ after: (undefined$1) => {
	CLEAR_ALL_INTERVAL = false;
}});
Instance.OnRoundEnd((stuff) => {
    CLEAR_ALL_INTERVAL = true;
});

Instance.Msg("Script Loaded!");
let CLEAR_ALL_INTERVAL = false;

let NPC_LIST = []

const NPC_ANIM_STATUS = {
	NONE: 0,
	MOVE: 1,
	ATTACK: 2,
	IDLE: 3,
	DEATH: 4,
}

Instance.OnRoundStart(() => {
	clearTasks();
	NPC_LIST = []

	Start_Ticks()
});

function Start_Ticks()
{
	const interval = setInterval(() => {
			if (CLEAR_ALL_INTERVAL) {
				clearInterval(interval);
				return;
			}

			Tick_Text()

			}, 0.25 * 1000);

	setTimeout(() => {
		SpawnNPC(new Vec3(118, 272, 64));
		
		const PLAYERS = Instance.FindEntitiesByClass("player");
		for (const player of PLAYERS)
		{
			InitPlayer(player);
		}
		
	}, 1500);

	Instance.EntFireAtName({name: "npc_00_*", input: "Kill"})
}
Start_Ticks()


function Tick_Text()
{
	let szText = "";
	if (NPC_LIST.length > 0)
	{
		for (const NPC of NPC_LIST)
		{
			let ang = NPC.lMover.GetAbsAngles()
			szText += `${NPC.szNamePref}: ${ang.pitch}/${ang.yaw}/${ang.roll}\n`
		}
	}
	else
	{
		szText = "Empty"
	}
	// const PLAYERS = Instance.FindEntitiesByClass("player");

	// let vVel = PLAYERS[1].GetAbsVelocity()
	// szText += `${vVel.x} ${vVel.y} ${vVel.z} ${Vector3Utils.length(vVel)} `

	let x = 350
	let y = 300
	let color = { r: 255, g: 0, b: 0, a: 255 };

	Instance.DebugScreenText(szText, x, y, 0.2, color)
}

const g_PLAYERS = new Map();
class class_player
{
	player;
	player_controller;
	player_slot;
	player_name;

	aZombieGrab;

	constructor(_player, _player_controller, _player_slot, _player_name)
	{
		this.player = _player;
		this.player_controller = _player_controller;
		this.player_slot = _player_slot;
		this.player_name = _player_name;

		this.ResetRound()
	}

	ResetRound()
	{
		this.aZombieGrab = [];
		Instance.EntFireAtTarget({target: this.player, input: "KeyValues", value: "movetype 2" });
	}

	GrabZombieStart(szPref)
	{
		if (this.aZombieGrab.length < 1)
		{
			Instance.EntFireAtTarget({target: this.player, input: "KeyValues", value: "movetype 1" });
		}

		const ZombieGrabIndex = GetIndexInArray(szPref, this.aZombieGrab);

		if (ZombieGrabIndex == -1)
		{
			this.aZombieGrab.push(szPref);
		}
	}

	UnGrabZombieStart(szPref)
	{
		const ZombieGrabIndex = GetIndexInArray(szPref, this.aZombieGrab);
		if (ZombieGrabIndex != -1)
		{
			this.aZombieGrab.splice(ZombieGrabIndex, 1);
		}

		if (this.aZombieGrab.length < 1)
		{
			Instance.EntFireAtTarget({target: this.player, input: "KeyValues", value: "movetype 2"});
		}
	}
}

class class_npc_base
{
	szNamePref;

	lMover;
	lKeep;

	aHitbox_Base;
	aHitbox_Head;

	iHP_Base;
	iHP_Head;

	lModel;
	szBodyGroupHeadBreak;

	bHasHead;

	lTarget;

	lLastDamager;
	Ticking;
	Death;

	iNPCStatus;
	fLastAttack;

	constructor(_szNamePref)
	{
		this.szNamePref = _szNamePref;
		this.fLastAttack = 0.0;

		this.aHitbox_Base = [];
		this.aHitbox_Head = [];

		this.szBodyGroupHeadBreak = null;
		this.bHasHead = true;
		this.Death = false;
		this.iNPCStatus = NPC_ANIM_STATUS.NONE;

		this.lTarget = null;
		this.lLastDamager = null;

		const PLAYERS = Instance.FindEntitiesByClass("player");

		if (PLAYERS.length > 0)
		{
			this.lTarget = PLAYERS[1];
			this.lTarget.SetMaxHealth(900);
			this.lTarget.SetHealth(900);
		}

		this.Ticking = setInterval(() => {
			if (CLEAR_ALL_INTERVAL) {
				clearInterval(this.Ticking);
				return;
			}
			this.Tick();
		}, 0.02 * 1000);
	}

	Tick()
	{
		if (this.Death)
		{
			return
		}
	
		this.Tick_Attack();
		this.Tick_Movement();
		this.Tick_Anim();
	}

	Tick_Attack()
	{
		if (!this.TargetValid() ||
		(this.fLastAttack > Instance.GetGameTime()) ||
		(this.iNPCStatus != NPC_ANIM_STATUS.NONE && this.iNPCStatus != NPC_ANIM_STATUS.MOVE))
		{
			return;
		}

		let me_Origin = this.lMover.GetAbsOrigin()
		let target_Origin = this.lTarget.GetAbsOrigin()

		let fDistance = Vector3Utils.distance(me_Origin, target_Origin)
		if (fDistance > 20)
		{
			return
		}

		this.iNPCStatus = NPC_ANIM_STATUS.ATTACK;
		this.SetAnimation("chaval1", 0.0, 1.0, true);

		const lTarget = this.lTarget;
		const szPref = this.szNamePref;
		
		const fTickrate = 0.5;
		let fDelay = 3.00;
		
		const player_class = GetPlayerClassByPlayer(lTarget);
		if (player_class != null)
		{
			player_class.GrabZombieStart(szPref)
		}

		const TimerAlpha = setInterval(() => {
			if (CLEAR_ALL_INTERVAL ||
			fDelay <= 0.0 ||
			!this.TargetValid(lTarget) ||
			this.Death)
			{
				clearInterval(TimerAlpha);
				this.iNPCStatus = NPC_ANIM_STATUS.NONE;
				this.fLastAttack = Instance.GetGameTime() + 1.0;
				if (IsValidPlayer(lTarget))
				{
					const player_class_new = GetPlayerClassByPlayer(lTarget);
					if (player_class_new != null)
					{
						player_class_new.UnGrabZombieStart(szPref)
					}
				}

				return;
			}

			let iHP = lTarget.GetHealth() - 15;
			Instance.EntFireAtTarget({target: lTarget, input: "SetHealth", value: iHP });
			fDelay -= fTickrate;

		}, fTickrate * 1000);
	}

	Tick_Anim()
	{
		if (this.iNPCStatus != NPC_ANIM_STATUS.NONE)
		{
			return;
		}
		const szMove = ["walk1", "move"]
		const iValue = GetRandomInt(0, szMove.length-1);

		this.iNPCStatus = NPC_ANIM_STATUS.MOVE;
		this.SetAnimation(szMove[iValue], 0.0, 1.0, true);
	
	}

	Tick_Movement()
	{
		if (!this.TargetValid() ||
		this.iNPCStatus != NPC_ANIM_STATUS.MOVE)
		{
			return
		}
		let me_Origin = this.lMover.GetAbsOrigin()
		let me_Angles = this.lMover.GetAbsAngles()
		let target_Origin = this.lTarget.GetAbsOrigin()

		let target_Angles = Vector3Utils.lookAt(me_Origin, target_Origin);
		target_Angles.roll = 0
		target_Angles.pitch = 0
	
		let Step = 10
		let qAngles = EulerUtils.rotateTowards(me_Angles, target_Angles, Step)

		let fDistance = Vector3Utils.distance(me_Origin, target_Origin)
		let fDistance_Limit = 10;
		let vVelocity = {x: 0, y: 0, z: 0}
		if (fDistance > fDistance_Limit)
		{
			let fSpeed = 80.0;
			let fLimit = 250.0;
			
			let me_Velocity = this.lMover.GetAbsVelocity();
			vVelocity = Vector3Utils.add(me_Velocity, (Vector3Utils.scale(EulerUtils.forward(target_Angles), fSpeed)))
			if (Vector3Utils.length(vVelocity) > fLimit)
			{
				vVelocity = {x: 0, y: 0, z: 0}
			}
		}
		
		
		if (Vector3Utils.equals({x: 0, y: 0, z: 0}, vVelocity))
		{
			this.lMover.Teleport({angles: qAngles})
		}
		else
		{
			this.lMover.Teleport({angles: qAngles, velocity: vVelocity})
		}
	}

	TargetValid()
	{
		if (!IsValidAliveCT(this.lTarget))
		{
			this.lTarget = null;
			return false;
		}

		return true
	}

	DamageBullet(aData)
	{
		let bHead = false
		if (aData.caller.GetEntityName().search("_b_") != -1)
		{
			bHead = true
		}
		
		let iDamage = 1
		
		this.lLastDamager = aData.activator
		this.HP_Checks(bHead, iDamage, aData.caller, aData.activator)
	}

	HP_Checks(bHead, iDamage, lHitbox, lDamager)
	{
		if (iDamage == -1)
		{
			iDamage = this.iHP_Base;
		}

		if (bHead)
		{
			this.iHP_Head -= iDamage
			
			iDamage *= 2

			if (this.iHP_Head < 1)
			{
				this.BreakHead(lHitbox)
			}
		}

		this.iHP_Base -= iDamage
		if (this.iHP_Base < 1)
		{
			this.BreakBase()
		}
	}

	GetDeathAnim()
	{
		const szDeath = [ 	"deaf",
							"dead2",
							"dead",]
		const iValue = GetRandomInt(0, szDeath.length-1);

		this.SetAnimation(szDeath[iValue]);
		this.SetDefaultAnimation(szDeath[iValue], 0.00, false);
		
		return undefined;
	}


	SetAnimation(szName, fDelay = 0.00, fRate = 1.00, bLoop = false)
	{
		if (bLoop)
		{
			Instance.EntFireAtTarget({target: this.lModel, input: "SetAnimationLooping", value: szName, delay: fDelay});
		}
		else
		{
			Instance.EntFireAtTarget({target: this.lModel, input: "SetAnimationNotLooping", value: szName, delay: fDelay});
		}
		Instance.EntFireAtTarget({target: this.lModel, input: "SetPlayBackRate", value: fRate, delay: fDelay});
	}

	SetDefaultAnimation(szName, fDelay = 0.00, bLoop = true)
	{
		if (bLoop)
		{
			Instance.EntFireAtTarget({target: this.lModel, input: "SetIdleAnimationLooping", value: szName, delay: fDelay});
		}
		else
		{
			Instance.EntFireAtTarget({target: this.lModel, input: "SetIdleAnimationNotLooping", value: szName, delay: fDelay});
		}
	}


	KillBase()
	{
		clearTimeout(this.Ticking)
		RemoveNPC(this.szNamePref)
		this.Death = true;

		for (const Hitbox of this.aHitbox_Base)
		{
			Instance.EntFireAtTarget({target: Hitbox, input: "Kill"})
		}

		for (const Hitbox of this.aHitbox_Head)
		{
			Instance.EntFireAtTarget({target: Hitbox, input: "Kill"})
		}
	}

	KillBaseFull()
	{
		Instance.EntFireAtTarget({target: this.lKeep, input: "Kill"})
		Instance.EntFireAtTarget({target: this.lMover, input: "Kill"})
		Instance.EntFireAtTarget({target: this.lModel, input: "Kill"})
	}

	Kill()
	{
		if (this.Death)
		{
			return
		}
		this.KillBase()
		this.KillBaseFull()
	}

	KillFade()
	{
		if (this.Death)
		{
			return
		}
		this.KillBase()

		let fDelay = this.GetDeathAnim();
		if (fDelay == undefined)
		{
			fDelay = 5.0;
		}
		
		const DelayFade = setTimeout(() => {
			if (CLEAR_ALL_INTERVAL) {
				clearInterval(DelayFade);
				return;
			}
			let iAlpha = 255
			const TimerAlpha = setInterval(() => {

			if (CLEAR_ALL_INTERVAL ||
				iAlpha < 50)
			{
				clearInterval(TimerAlpha);

				this.KillBaseFull();
				return;
			}
			iAlpha -= 3;
			Instance.EntFireAtTarget({target: this.lModel, input: "Alpha", value: "" + iAlpha})
		}, 0.05 * 1000);

		}, fDelay * 1000);
	}

	BreakBase()
	{
		this.KillFade()
	}

	BreakHead(lHead)
	{
		Instance.EntFireAtTarget({target: lHead, input: "Kill"})
		if (this.szBodyGroupHeadBreak != null)
		{
			Instance.EntFireAtTarget({target: this.lModel, input: "SetBodyGroup", value: this.szBodyGroupHeadBreak})
		}
		this.aHitbox_Head = []

		this.bHasHead = false;
		const lLastDamager = this.lLastDamager 
		
		const DelayDeath = setTimeout(() => {
			if (CLEAR_ALL_INTERVAL) {
				clearInterval(DelayDeath);
				return;
			}
			this.HP_Checks(false, -1, lHead, lLastDamager)
		}, 3000);
	}
}

function SpawnNPC(vec)
{
	Instance.Msg("SpawnNPC")
	let Template = Instance.FindEntityByName("npc_00");
	Template.ForceSpawn(vec);
}

function RemoveNPC(szNamePref)
{
	for (let i = 0; i < NPC_LIST.length; i++)
	{
		if (NPC_LIST[i].szNamePref == szNamePref)
		{
			NPC_LIST.splice(i, 1);
			return
		}
	}
}
Instance.OnPlayerDisconnect((hEvent) => {
	g_PLAYERS.delete(hEvent.playerSlot);
});

Instance.OnPlayerReset((hEvent) => {
	const player = hEvent.player;
	if (!player?.IsValid())
	{
		return;
	}

	InitPlayer(player);
})

function InitPlayer(player)
{
	const player_controller = player.GetPlayerController();
	const player_name = player_controller?.GetPlayerName();
	const player_slot = player_controller?.GetPlayerSlot();
	if (!g_PLAYERS.has(player_slot))
	{
		g_PLAYERS.set(player_slot, new class_player(player, player_controller, player_slot, player_name));
		return;
	}

	const player_class = g_PLAYERS.get(player_slot);
	player_class.player = player;
	player_class.player_controller = player_controller;
	player_class.player_slot = player_slot;
	player_class.player_name = player_name;

	player_class.ResetRound();
}

Instance.OnScriptInput("Tes", (Activator_Caller_Data) => {
	let player_class = GetPlayerClassByPlayer(Activator_Caller_Data.activator);
	if (player_class == null)
	{
		return;
	}
	Instance.Msg("123 " + player_class.player_name);
})

Instance.OnScriptInput("Input_Connect_NPC_00", (Activator_Caller_Data) => {
	let szNamePref = Activator_Caller_Data.caller.GetEntityName().replace("npc_00_connect_relay", "")

	let lMover = Instance.FindEntityByName("npc_00_phys" + szNamePref)

	let lHitBox_Base = Instance.FindEntityByName("npc_00_hitbox_a" + szNamePref) 
	let lHitBox_Head = Instance.FindEntityByName("npc_00_hitbox_b" + szNamePref)
	let lModel = Instance.FindEntityByName("npc_00_model" + szNamePref)
	let lKeep = Instance.FindEntityByName("npc_00_keep" + szNamePref)

	let NPC = new class_npc_base(szNamePref);

	NPC.lMover = lMover;
	NPC.lKeep = lKeep;
	NPC.lModel = lModel
	NPC.szBodyGroupHeadBreak = "normal, 0"

	NPC.aHitbox_Base.push(lHitBox_Base)
	NPC.aHitbox_Head.push(lHitBox_Head)

	NPC.iHP_Base = 10;
	NPC.iHP_Head = 2;

	Instance.ConnectOutput(lHitBox_Base, "OnHealthChanged", (Activator_Caller_Data) => {
		Input_Damage_NPC(Activator_Caller_Data);
	});
	Instance.ConnectOutput(lHitBox_Head, "OnHealthChanged", (Activator_Caller_Data) => {
		Input_Damage_NPC(Activator_Caller_Data);
	});
	NPC_LIST.push(NPC);
})

function Input_Damage_NPC(aData)
{
	let class_NPC = GetNPCClassByPhysBox(aData.caller);
	if (class_NPC == null)
	{
		return
	}
	class_NPC.DamageBullet(aData)
}

function GetPlayerClassByPlayer(player)
{
	const player_controller = player?.GetPlayerController();
	if (player_controller?.IsValid())
	{
		const player_slot = player_controller.GetPlayerSlot();
		if (g_PLAYERS.has(player_slot))
		{
			return g_PLAYERS.get(player_slot);
		}
	}
	return null;
}

function GetIndexInArray(value, array)
{
	for (let i = 0; i < array.length; i++)
	{
		if (array[i] == value)
		{
			return i;
		}
	}

	return -1;
}

function GetNPCClassByPhysBox(Phys)
{
	for (let i = 0; i < NPC_LIST.length; i++)
	{
		for (let a = 0; a < NPC_LIST[i].aHitbox_Head.length; a++)
		{
			if (NPC_LIST[i].aHitbox_Head[a] == Phys)
			{
				return NPC_LIST[i];
			}
		}

		for (let a = 0; a < NPC_LIST[i].aHitbox_Base.length; a++)
		{
			if (NPC_LIST[i].aHitbox_Base[a] == Phys)
			{
				return NPC_LIST[i];
			}
		}
	}

	return null;
}

function IsValidAliveCT(player)
{
	return (player != null && player.IsValid() && player.IsAlive() && player.GetTeamNumber() == 3)
}

function IsValidPlayer(player)
{
	return (player != null && player.IsValid() && player.IsAlive())
}

function GetValidPlayers() 
{
	return Instance.FindEntitiesByClass("player").filter(p => IsValidPlayer(p));
}

function GetRandomInt(min, max)
{
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}