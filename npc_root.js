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

Instance.Msg("Script Loaded");
let CLEAR_ALL_INTERVAL = false;

let NPC_LIST = []

Instance.OnRoundStart(() => {
	clearTasks();
	NPC_LIST = []

	Start_Ticks()
});

function Start_Ticks()
{
	Instance.Msg("123")
	const interval = setInterval(() => {
			if (CLEAR_ALL_INTERVAL) {
				clearInterval(interval);
				return;
			}

			Tick_Text()

			}, 0.25 * 1000);

	setTimeout(() => {
		SpawnNPC(new Vec3(118, 272, 64));
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
			szText += `${NPC.szNamePref}: ${NPC.iHP_Base}/${NPC.iHP_Head}\n`
		}
	}
	else
	{
		szText = "Empty"
	}

	let x = 350
	let y = 300
	let color = { r: 127, g: 127, b: 127, a: 255 };

	Instance.DebugScreenText(szText, x, y, 1, color)
}

class NPC_BASE
{
	szNamePref;

	lMover;
	lt_f;
	lt_u;

	aHitbox_Base;
	aHitbox_Head;

	iHP_Base
	iHP_Head;

	lModel
	szBodyGroupHeadBreak

	bHasHead

	constructor(_szNamePref, _lMover, _lt_f, _lt_u)
	{
		this.szNamePref = _szNamePref;
		this.lMover = _lMover;
		this.aHitbox_Base = []
		this.aHitbox_Head = []

		this.szBodyGroupHeadBreak = undefined
		this.bHasHead = true
	}

	DamageBullet(aData)
	{
		let bHead = false
		if (aData.caller.GetEntityName().search("_b_") != -1)
		{
			bHead = true
		}
		
		let iDamager = aData.activator;
		let iDamage = 1
		if (bHead)
		{
			this.iHP_Head -= iDamage
			
			iDamage *= 2

			if (this.iHP_Head < 1)
			{
				this.BreakHead(aData.caller)
			}
		}

		this.iHP_Base -= iDamage
		if (this.iHP_Base < 1)
		{
			this.BreakBase(aData.caller)
		}
	}

	BreakHead(lHead)
	{
		Instance.Msg("123")
		Instance.EntFireAtTarget({target: lHead, input: "Kill"})
		if (this.szBodyGroupHeadBreak != undefined)
		{
			Instance.EntFireAtTarget({target: this.lModel, input: "SetBodyGroup", value: this.szBodyGroupHeadBreak})
		}
		this.aHitbox_Head = []
	}
}

function SpawnNPC(vec)
{
	Instance.Msg("SpawnNPC")
	let Template = Instance.FindEntityByName("npc_00");
	Template.ForceSpawn(vec);
}
Instance.OnScriptInput("Input_Connect_NPC_00", (Activator_Caller_Data) => {
	let szNamePref = Activator_Caller_Data.caller.GetEntityName().replace("npc_00_connect_relay", "")

	let lMover = Instance.FindEntityByName("npc_00_phys" + szNamePref)
	let lt_f = Instance.FindEntityByName("npc_00_tr_f" + szNamePref)
	let lt_u = Instance.FindEntityByName("npc_00_tr_u" + szNamePref)
	let lHitBox_Base = Instance.FindEntityByName("npc_00_hitbox_a" + szNamePref) 
	let lHitBox_Head = Instance.FindEntityByName("npc_00_hitbox_b" + szNamePref)
	let lModel = Instance.FindEntityByName("npc_00_model" + szNamePref)

	let NPC = new NPC_BASE(szNamePref, lMover);

	NPC.lt_f = lt_f
	NPC.lt_u = lt_u
	NPC.lModel = lModel
	NPC.szBodyGroupHeadBreak = "normal, 0"

	NPC.aHitbox_Base.push(lHitBox_Base)
	NPC.aHitbox_Head.push(lHitBox_Head)

	NPC.iHP_Base = 20;
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
	let CLASS_NPC = GetNPCClassByPhysBox(aData.caller);
	if (CLASS_NPC == undefined)
	{

		return
	}
	CLASS_NPC.DamageBullet(aData)
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

	return undefined;
}


function IsValidPlayer(player)
{
	return player != null && player?.IsValid() && player?.IsAlive()
}

function GetValidPlayers() 
{
	return Instance.FindEntitiesByClass("player").filter(p => IsValidPlayer(p));
}
