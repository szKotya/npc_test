import { Instance } from "cs_script/point_script"
let g_szNameFix;
let g_szNamePre = "npc_00_";

const g_aVecCalculateDistance = [
	{x: 10000, y: -10000, z: -10000},
	{x: -10000, y: 10000, z: -10000},
	{x: -10000, y: -10000, z: -10000},
	{x: 10000, y: 10000, z: -10000},

	{x: 10000, y: -10000, z: 10000},
	{x: -10000, y: 10000, z: 10000},
	{x: -10000, y: -10000, z: 10000},
	{x: 10000, y: 10000, z: 10000}]

let g_aFCalculateDistanceSelf = [
	0.0,
	0.0,
	0.0,
	0.0,
	0.0,
	0.0,
	0.0,
	0.0];

let g_fPlayBackRate = 1.00
const AnimStatus = {
	NONE: 0,
	MOVE: 1,
	ATTACK: 2,
	PARRY: 3,
	SCENE: 4,
	IDLE: 5,
}

const NPC_PATTERN_ORDER = {
	NONE: 0,
	HOLD: 1,
	PATROL: 2,
}

let g_AnimStatus;
let g_fLastTimeAttack_Time;

let g_bTracking;
let g_fSpeed;

let g_vecCenterNPC;
let g_vecCenterNPCLast;

const TARGET_MAX_DISTANCE_AFTER_RETARGET = 512;
const TARGET_SEARCH_DISTANCE = 2000;
const TARGET_SEARCH_DISTANCE_Z = 512;

const TARGET_DURATION = 25;
let g_fTargetTime;
let g_iTarget;

let g_fTargetTraceTime;
let g_vecTarget;
let g_vecTargetLast;

let g_fSonarTime;

let g_iDistanceToTarget3D;

let g_avecMovePoint;

let g_fJumpNeedValue = 0;
let g_fJumpTime;


let g_iStuckCount;

let g_bMoveForwardLastTick;
let g_iAngeYLastTick;
let g_iAngeXLastTick;

let g_iHP;

let g_iLastAttack;

let g_bParryCanBe;
let g_fParryMomentTime_Item_01;
let g_fParryMomentTime_Item_01_Duration;

let g_iHPBarID;

const STUCK_VALUE = 3;

const JUMP_TIME = 1.0;
const JUMP_NEED_VALUE = 2;
const JUMP_BASE = 14000;

const TICKRATE = 0.2;
const HP_BASE = 450;

// const SPEEDLIMIT = 350;
// let SPEED_BASE = 400;
// let SPEED_BASE_LOW = 350;

const SEE_DELAY = 0.5;
// const SPEEDLIMIT = 230;
// let SPEED_BASE = 300;
// let SPEED_BASE_LOW = 230;

const ATTACK_DELAY = 0.3;

let SPEED_BASE = 3500;
let SPEED_PATRULE = 2800;

let g_iPattern_Order;

let g_avecPatrol;
let g_iPatrolID;

const MAX_PLAYERS = 63;

function Init(szID)
{
	g_szNameFix = Number(szID);

	AddPreFix("script");
	AddPreFix("phys");
	AddPreFix("keep");
	AddPreFix("model");

	AddPreFix("tr_f");
	AddPreFix("tr_u");

	AddPreFix("push_0");
	AddPreFix("trace_trigger");
	AddPreFix("trace_maker");

	AddPreFix("sensor_00");
	AddPreFix("sensor_01");
	AddPreFix("sensor_02");
	AddPreFix("sensor_03");

	AddPreFix("sensor_04");
	AddPreFix("sensor_05");
	AddPreFix("sensor_06");
	AddPreFix("sensor_07");

	AddPreFix("hitbox");

	AddPreFix("hurt_cone");
	AddPreFix("hurt_ring");
	AddPreFix("hurt_ring_effect");
	AddPreFix("hurt");

	AddPreFix("model_explode_effect");
	AddPreFix("model_explode");

	AddPreFix("item_touch_proj_02_0");
	AddPreFix("item_touch_proj_02_1");
	AddPreFix("item_touch_proj_03");
	AddPreFix("item_touch_proj_04");

	AddPreFix("hitbox_item_00");
	AddPreFix("hitbox_item_01");
	AddPreFix("hitbox_item_05");

	AddPreFix("HP_Bar");

	g_iPattern_Order = -1;
	g_avecPatrol = [];
	Instance.EntFireBroadcast(g_szNamePre + "script", "Init_Post", "", 0.05);
}
function Init_Post()
{
	Instance.EntFireBroadcast(g_szNamePre + "sensor_00" + "_" + g_szNameFix, "KeyValue", GetOriginForSensor(0));
	Instance.EntFireBroadcast(g_szNamePre + "sensor_01" + "_" + g_szNameFix, "KeyValue", GetOriginForSensor(1));
	Instance.EntFireBroadcast(g_szNamePre + "sensor_02" + "_" + g_szNameFix, "KeyValue", GetOriginForSensor(2));
	Instance.EntFireBroadcast(g_szNamePre + "sensor_03" + "_" + g_szNameFix, "KeyValue", GetOriginForSensor(3));
	Instance.EntFireBroadcast(g_szNamePre + "sensor_04" + "_" + g_szNameFix, "KeyValue", GetOriginForSensor(4));
	Instance.EntFireBroadcast(g_szNamePre + "sensor_05" + "_" + g_szNameFix, "KeyValue", GetOriginForSensor(5));
	Instance.EntFireBroadcast(g_szNamePre + "sensor_06" + "_" + g_szNameFix, "KeyValue", GetOriginForSensor(6));
	Instance.EntFireBroadcast(g_szNamePre + "sensor_07" + "_" + g_szNameFix, "KeyValue", GetOriginForSensor(7));

	AddOutPut("hurt_ring", "OnStartTouch", "hurt", "Hurt", "", 0.00, -1);
	AddOutPut("hurt_cone", "OnStartTouch", "hurt", "Hurt", "", 0.00, -1);
	AddOutPut("hurt_ring", "OnStartTouch", "push_0", "Trigger", "", 0.00, -1);
	AddOutPut("hurt_cone", "OnStartTouch", "push_0", "Trigger", "", 0.00, -1);

	AddOutPut("trace_trigger", "OnStartTouch", "script", "PlayerTraceTrue", "", 0.00, -1);

	AddOutPut("hitbox", "OnHealthChanged", "script", "DamagePlayer", "", 0.00, -1);

	AddOutPut("sensor_00", "Distance", "script", "GetDistance_00", "", 0.00, -1);
	AddOutPut("sensor_01", "Distance", "script", "GetDistance_01", "", 0.00, -1);
	AddOutPut("sensor_02", "Distance", "script", "GetDistance_02", "", 0.00, -1);
	AddOutPut("sensor_03", "Distance", "script", "GetDistance_03", "", 0.00, -1);
	AddOutPut("sensor_04", "Distance", "script", "GetDistance_04", "", 0.00, -1);
	AddOutPut("sensor_05", "Distance", "script", "GetDistance_05", "", 0.00, -1);
	AddOutPut("sensor_06", "Distance", "script", "GetDistance_06", "", 0.00, -1);
	AddOutPut("sensor_07", "Distance", "script", "GetDistance_07", "", 0.00, -1);

	AddOutPut("item_touch_proj_02_0", "OnStartTouch", "script", "TouchProjRiffle", "", 0.00, -1);
	AddOutPut("item_touch_proj_02_1", "OnStartTouch", "script", "TouchProjSniper", "", 0.00, -1);
	AddOutPut("item_touch_proj_03", "OnStartTouch", "script", "TouchProjShotGun", "", 0.00, -1);
	AddOutPut("item_touch_proj_04", "OnStartTouch", "script", "TouchProjRailGun", "", 0.00, -1);

	Instance.EntFireBroadcast(g_szNamePre + "hitbox_item_00" + "_" + g_szNameFix, "AddOutput", "OnUser1>item_00_script>DetectNPC_00>" + g_szNamePre + "script" + "_" + g_szNameFix + ">0>-1");
	AddOutPut("hitbox_item_01", "OnUser4", "script", "TouchSonar", "", 0.00, -1);

	Instance.EntFireBroadcast(g_szNamePre + "hitbox_item_01" + "_" + g_szNameFix, "AddOutput", "OnUser1>item_01_script>DetectNPC_00>" + g_szNamePre + "script" + "_" + g_szNameFix + ">0>-1");
	Instance.EntFireBroadcast(g_szNamePre + "hitbox_item_01" + "_" + g_szNameFix, "AddOutput", "OnUser4>item_01_script>ParryNPC_00>" + g_szNamePre + "script" + "_" + g_szNameFix + ">0>-1");
	Instance.EntFireBroadcast(g_szNamePre + "hitbox_item_05" + "_" + g_szNameFix, "AddOutput", "OnUser1>item_05_script>DetectNPC_00>" + g_szNamePre + "script" + "_" + g_szNameFix + ">0>-1");

	CallFunction("GetOriginNPC_Pre", 0.01);
	CallFunction("Init_End", 0.05);
}

Instance.OnScriptInput("SetOrder", /*number*/ (szArg) =>{SetOrder(Number(szArg));})
function SetOrder(iOrder)
{
	g_iPattern_Order = iOrder;
}
Instance.OnScriptInput("SetWeapon", /*number*/ (szArg) =>{SetWeapon(Number(szArg));})
function SetWeapon(iWeaponType)
{

}
Instance.OnScriptInput("SetPatrolPoint", /*number*/ (szArg) =>{SetPatrolPoint(szArg);})
function SetPatrolPoint(szArg)
{
	szArg = szArg.split(",");

	let ID = 0;
	for (let i = 0; i < szArg.length;)
	{
		g_avecPatrol[ID] = {
			x: Number(szArg[i]),
			y: Number(szArg[i+1]),
			z: Number(szArg[i+2])}

		i += 3;
		ID++;
	}
}

Instance.OnScriptInput("Init_End", () =>{Init_End();})
function Init_End()
{
	if (g_iPattern_Order == -1)
	{
		g_iPattern_Order = NPC_PATTERN_ORDER.NONE;
	}

	g_fSonarTime = 0.0;
	g_iHPBarID = -1;
	Instance.EntFireBroadcast(g_szNamePre + "HP_Bar" + "_" + g_szNameFix, "Start");

	g_bTracking = true;
	g_fLastTimeAttack_Time = Instance.GetGameTime();

	g_fTargetTraceTime = 0.0;
	g_iStuckCount = STUCK_VALUE;

	g_avecMovePoint = -1;
	g_vecCenterNPC = -1;
	g_vecCenterNPCLast = -1;
	g_iTarget = -1;
	g_fTargetTime = 0.0;

	g_fJumpTime = -1.0;
	g_fJumpNeedValue = 0;

	g_fSpeed = 1.0;
	g_bMoveForwardLastTick = false;
	g_iAngeYLastTick = "x";
	g_iAngeXLastTick = "x";
	g_vecTargetLast = "x";
	g_iLastAttack = -1;

	g_bParryCanBe = false;
	g_fParryMomentTime_Item_01 = 0.0;
	g_fParryMomentTime_Item_01_Duration = 0.0;

	g_AnimStatus = AnimStatus.NONE;
	g_iHP = HP_BASE;

	g_iPatrolID = 0;

	CallFunction("Tick", 0.05);
}

Instance.OnScriptInput("Tick", () =>{Tick();})
function Tick()
{
	if (g_AnimStatus == AnimStatus.SCENE)
	{
		return;
	}


	Tick_Target();
	if (Tick_PreAttack())
	{
		Tick_Attack();
	}

	Tick_Movement();
	Tick_Animation();

	Tick_HPBar();
	Tick_Debug();

	CallFunction("GetOriginNPC_Pre", TICKRATE - 0.04);
	CallFunction("Tick", TICKRATE);
}

function Tick_HPBar()
{
	let iPercent = Number(g_iHP / HP_BASE).toFixed(3);

	let ID = Number(Math.floor(((16 - 0) * (1.0 - iPercent)))).toFixed(0);

	if (HP_BASE > g_iHP &&
	ID == 0)
	{
		ID = 1;
	}

	if (ID < 0)
	{
		ID = 0;
	}

	if (ID > 16)
	{
		ID = 16;
	}

	if (g_iHPBarID != ID ||
		g_iHPBarID == -1)
	{
		g_iHPBarID = ID;
		Instance.EntFireBroadcast(g_szNamePre + "HP_Bar" + "_" + g_szNameFix, "SetAlphaScale", "" + ID);
	}
}

function Tick_Target()
{
	if (g_vecCenterNPC == -1)
	{
		return;
	}

	if (IsValidTarget())
	{
		GetOriginTarget();

		let iDistance2D = GetDistanceBetweenTwoPoints2D(g_vecCenterNPC, g_vecTarget);
		let iDistanceZ = GetDistanceBetweenTwoPointsZ(g_vecCenterNPC, g_vecTarget);

		if (Instance.GetGameTime() < g_fTargetTime ||
		iDistance2D > TARGET_SEARCH_DISTANCE + 512 ||
		iDistanceZ > TARGET_SEARCH_DISTANCE_Z)
		{
			g_iTarget = -1;
		}
	}

	let aPlayers = [];
	for (let i = 0; i < MAX_PLAYERS; i++)
	{
		if (!IsValidPlayer(i))
		{
			continue;
		}

		let vecOrigin = Instance.GetPlayerPawn("" + i).GetOrigin();
		vecOrigin = (""+vecOrigin).split(",");
		if (vecOrigin.length == 0)
		{
			continue;
		}
		vecOrigin = ArrayToVector(vecOrigin);

		if (GetDistanceBetweenTwoPoints2D(g_vecCenterNPC, vecOrigin) > TARGET_SEARCH_DISTANCE ||
		GetDistanceBetweenTwoPointsZ(g_vecCenterNPC, vecOrigin) > TARGET_SEARCH_DISTANCE_Z)
		{
			continue;
		}

		aPlayers.push(i);
	}

	if (aPlayers.length == 0)
	{
		return;
	}

	if (aPlayers.length == 1)
	{
		SetTarget(aPlayers[0]);
	}
	else
	{
		SetTarget(aPlayers[GetRandomInt(0, aPlayers.length-1)]);
	}
}

function Tick_PreAttack()
{
	if (!IsValidTarget())
	{
		return false;
	}

	GetOriginTarget();
	g_iDistanceToTarget3D = GetDistanceBetweenTwoPoints3D(g_vecCenterNPC, g_vecTarget);
	return true;
}

function Tick_Attack()
{
	if ((g_AnimStatus != AnimStatus.MOVE &&
	g_AnimStatus != AnimStatus.IDLE) ||
	g_fLastTimeAttack_Time > Instance.GetGameTime() + ATTACK_DELAY ||
	!IsTargetSigh())
	{
		return;
	}


	if (g_iDistanceToTarget3D > 128)
	{
		return;
	}

	let aAttacks = [0, 1, 2, 3, 4];
	let iAttackID = aAttacks.indexOf(g_iLastAttack);
	if (iAttackID != -1)
	{
		aAttacks.splice(iAttackID, 1);
	}

	iAttackID = aAttacks[GetRandomInt(0, aAttacks.length-1)];

	switch (iAttackID)
	{
		case 0:{Attack_01();break;}
		case 1:{Attack_02();break;}
		case 2:{Attack_03();break;}
		case 3:{Attack_04();break;}
		case 4:{Attack_05();break;}
	}

	g_iLastAttack = iAttackID;

	g_fLastTimeAttack_Time = Instance.GetGameTime();
}

function Tick_Debug()
{
	let szText = "t: " + g_iTarget + " HP: " + g_iHP + " " + Number(g_iDistanceToTarget3D).toFixed(2);
	ShowHud(szText);
}

function Tick_Movement()
{
	if (!IsValidTarget())
	{
		if (g_iPattern_Order != NPC_PATTERN_ORDER.PATROL)
		{
			if (g_bMoveForwardLastTick)
			{
				g_bMoveForwardLastTick = false;
				Instance.EntFireBroadcast(g_szNamePre + "tr_f" + "_" + g_szNameFix, "Deactivate", "", 0.00);
			}
			return;
		}
	}
	else
	{
		g_vecTargetLast = g_vecTarget;
		GetPlayerTrace_PreCall();
	}

	let vecMovePoint = g_vecTarget;
	let bMoveToPath = (g_avecMovePoint != -1 && !IsTargetSigh());
	if (!IsValidTarget() &&
	g_iPattern_Order == NPC_PATTERN_ORDER.PATROL)
	{
		bMoveToPath = (g_avecMovePoint != -1);
		if (GetDistanceBetweenTwoPoints3D(g_avecPatrol[g_iPatrolID], g_vecCenterNPC) <= 32)
		{
			if (++g_iPatrolID >= g_avecPatrol.length)
			{
				g_iPatrolID = 0;
			}
		}
		vecMovePoint = g_avecPatrol[g_iPatrolID];
	}

	let bStuck = false;
	let iMoveID = -1;

	if (bMoveToPath)
	{
		iMoveID = 0;

		let iDistance_00 = GetDistanceBetweenTwoPoints3D(g_avecMovePoint[0], g_avecMovePoint[1]);
		let iDistance_01 = GetDistanceBetweenTwoPoints3D(g_vecCenterNPC, g_avecMovePoint[1]);

		if (iDistance_00 - iDistance_01 > - 16)
		{
			iMoveID = 1;
		}

		if (iMoveID > 0)
		{
			if (GetDistanceBetweenTwoPoints2D(g_vecCenterNPC, g_vecCenterNPCLast) < 1 &&
			GetDistanceBetweenTwoPointsZ(g_avecMovePoint[0], g_avecMovePoint[1]) < 1)
			{
				if (--g_iStuckCount <= 0)
				{
					bStuck = true;
					g_iStuckCount = STUCK_VALUE;
					iMoveID = 0;
				}
			}
			else
			{
				g_iStuckCount = STUCK_VALUE;
			}
		}

		vecMovePoint = g_avecMovePoint[iMoveID];
	}
	else
	{
		if (GetDistanceBetweenTwoPoints3D(g_vecCenterNPC, g_vecCenterNPCLast) < 2)
		{
			if (--g_iStuckCount <= 0)
			{
				bStuck = true;
				g_iStuckCount = STUCK_VALUE;
			}
		}
		else
		{
			g_iStuckCount = STUCK_VALUE;
		}
	}

	// Выставляем поворот
	let iAngY = AngleFromTwoPoints(g_vecCenterNPC, vecMovePoint);
	let iAngX = 0;
	if ((vecMovePoint.z- g_vecCenterNPC.z) > 16)
	{
		iAngX = -30;
	}

	if ((g_iAngeYLastTick == "x" ||
		g_iAngeXLastTick == "x" ||
		g_iAngeYLastTick != iAngY ||
		g_iAngeXLastTick != iAngX) &&
		g_bTracking)
	{
		g_iAngeXLastTick = iAngX;
		g_iAngeYLastTick = iAngY;
		Instance.EntFireBroadcast(g_szNamePre + "model" + "_" + g_szNameFix, "KeyValue", "angles 0 " + iAngY + " 0");
		Instance.EntFireBroadcast(g_szNamePre + "tr_f" + "_" + g_szNameFix, "KeyValue", "angles " + iAngX + " " + iAngY + " 0");
	}

	// Включаем трастер вперед
	if (g_bMoveForwardLastTick)
	{
		g_bMoveForwardLastTick = false;

		Instance.EntFireBroadcast(g_szNamePre + "tr_f" + "_" + g_szNameFix, "Deactivate", "", 0.00);
	}

	let bMoveForward = true;
	let bMoveTargetNear = false;

	if (g_iDistanceToTarget3D < 64 &&
	IsTargetSigh())
	{
		bMoveTargetNear = true;
	}

	if (bMoveTargetNear)
	{
		bMoveForward = false;
	}

	if (Instance.GetGameTime() < g_fJumpTime)
	{
		bMoveForward = false;
	}

	if (g_iPattern_Order == NPC_PATTERN_ORDER.HOLD)
	{
		bMoveForward = false;
	}

	if (g_fSpeed <= 0.00)
	{
		bMoveForward = false;
	}

	if (bMoveForward)
	{
		if (IsPatrule())
		{
			Instance.EntFireBroadcast(g_szNamePre + "tr_f" + "_" + g_szNameFix, "KeyValue", "force " + SPEED_PATRULE * g_fSpeed, 0);
		}
		else
		{
			Instance.EntFireBroadcast(g_szNamePre + "tr_f" + "_" + g_szNameFix, "KeyValue", "force " + SPEED_BASE * g_fSpeed, 0);
		}

		Instance.EntFireBroadcast(g_szNamePre + "tr_f" + "_" + g_szNameFix, "Activate", "", 0.02);
		g_bMoveForwardLastTick = true;
	}

	if (!bMoveTargetNear &&
	g_AnimStatus == AnimStatus.MOVE)
	{
		if (Instance.GetGameTime() > g_fJumpTime)
		{
			//Для пути нав сетки
			if (bMoveToPath)
			{
				if (!bStuck)
				{
					if (GetDistanceBetweenTwoPointsZ(g_vecCenterNPC, vecMovePoint) > 8 &&
					GetDistanceBetweenTwoPoints2D(g_vecCenterNPC, vecMovePoint) < 32)
					{
						g_fJumpNeedValue++;
					}
					else
					{
						g_fJumpNeedValue = 0;
					}
				}
				else
				{
					g_fJumpNeedValue = 0;
				}
			}
			else
			{
				if (bStuck)
				{
					g_fJumpNeedValue++;
				}
			}

			if (g_fJumpNeedValue > JUMP_NEED_VALUE)
			{
				let fDelay = 0.1;
				let fDelay_Post = 0.7;

				g_fJumpNeedValue = 0;
				g_fJumpTime = Instance.GetGameTime() + JUMP_TIME;

				Instance.EntFireBroadcast(g_szNamePre + "tr_f" + "_" + g_szNameFix, "KeyValue", "angles 0 " + -iAngY + " 0", 0);
				Instance.EntFireBroadcast(g_szNamePre + "tr_f" + "_" + g_szNameFix, "KeyValue", "force 6000", 0);
				Instance.EntFireBroadcast(g_szNamePre + "tr_f" + "_" + g_szNameFix, "Activate", "", 0.02);
				Instance.EntFireBroadcast(g_szNamePre + "tr_f" + "_" + g_szNameFix, "Deactivate", "", 0.05);

				Instance.EntFireBroadcast(g_szNamePre + "tr_u" + "_" + g_szNameFix, "KeyValue", "force " + JUMP_BASE, fDelay + 0.00);
				Instance.EntFireBroadcast(g_szNamePre + "tr_u" + "_" + g_szNameFix, "Activate", "", fDelay + 0.02);

				Instance.EntFireBroadcast(g_szNamePre + "tr_f" + "_" + g_szNameFix, "KeyValue", "angles 0 " + iAngY + " 0", fDelay);
				Instance.EntFireBroadcast(g_szNamePre + "tr_f" + "_" + g_szNameFix, "KeyValue", "force 10000", fDelay_Post);
				Instance.EntFireBroadcast(g_szNamePre + "tr_f" + "_" + g_szNameFix, "Activate", "", fDelay_Post);
				Instance.EntFireBroadcast(g_szNamePre + "tr_f" + "_" + g_szNameFix, "Deactivate", "", fDelay_Post + 0.05);
			}
		}
	}

	g_vecCenterNPCLast = g_vecCenterNPC;

	GetPath_PreCall();
}

function Tick_Animation()
{
	if (g_AnimStatus == AnimStatus.ATTACK)
	{
		return;
	}

	if (g_bMoveForwardLastTick)
	{
		SetAnimationStatus(AnimStatus.MOVE, "BrawlerDroid00_NAV_Run_F");
	}
	else
	{
		SetAnimationStatus(AnimStatus.IDLE, "idle");
	}
}

function SetAnimationStatus(iStatus, szAnim)
{
	if (g_AnimStatus != iStatus)
	{
		let fPlayback = g_fPlayBackRate;
		if (IsPatrule())
		{
			fPlayback = 0.75;
		}
		SetAnimation(szAnim, 0, fPlayback, true);
		SetDefaultAnimation(szAnim, fPlayback, true);
	}
	g_AnimStatus = iStatus;
}

function IsPatrule()
{
	if (g_iPattern_Order == NPC_PATTERN_ORDER.PATROL)
	{
		if (!IsValidTarget())
		{
			return true;
		}
	}

	return false;
}

function IsTargetSigh()
{
	return (Instance.GetGameTime() < (g_fTargetTraceTime + SEE_DELAY))
}

Instance.OnScriptInput("GetOriginNPC_Pre", () =>{GetOriginNPC_Pre();})
function GetOriginNPC_Pre()
{
	Instance.EntFireBroadcast(g_szNamePre + "sensor_00" + "_" + g_szNameFix, "FireUser1");
	Instance.EntFireBroadcast(g_szNamePre + "sensor_01" + "_" + g_szNameFix, "FireUser1");
	Instance.EntFireBroadcast(g_szNamePre + "sensor_02" + "_" + g_szNameFix, "FireUser1");
	Instance.EntFireBroadcast(g_szNamePre + "sensor_03" + "_" + g_szNameFix, "FireUser1");
	Instance.EntFireBroadcast(g_szNamePre + "sensor_04" + "_" + g_szNameFix, "FireUser1");
	Instance.EntFireBroadcast(g_szNamePre + "sensor_05" + "_" + g_szNameFix, "FireUser1");
	Instance.EntFireBroadcast(g_szNamePre + "sensor_06" + "_" + g_szNameFix, "FireUser1");
	Instance.EntFireBroadcast(g_szNamePre + "sensor_07" + "_" + g_szNameFix, "FireUser1");

	CallFunction("GetOriginNPC", 0.02)
}

Instance.OnScriptInput("AttackID", /*number*/ (ID) => {AttackID(ID)})
function AttackID(ID)
{
	ID = Number(ID);
	Instance.Msg("AttackID " + ID);

	switch (ID)
	{
		case 0:{Attack_01();break;}
		case 1:{Attack_02();break;}
		case 2:{Attack_03();break;}
		default:{break;}
	}
}

Instance.OnScriptInput("Use_Parry_Item_04", () =>{Use_Parry_Item_04();})
function Use_Parry_Item_04()
{
	if (g_bParryCanBe)
	{
		ParrySuccessfully();
	}
}

Instance.OnScriptInput("Use_Parry_Item_01", /*number*/ (ID) =>{Use_Parry_Item_01(ID);})
function Use_Parry_Item_01(ID)
{
	ID = Number(ID);
	if (g_bParryCanBe)
	{
		Instance.EntFireBroadcast("Item_01_Script", "ParrySuccessfully");
		ParrySuccessfully();
		return;
	}

	g_fParryMomentTime_Item_01 = Instance.GetGameTime();
	g_fParryMomentTime_Item_01_Duration = ID;
}

Instance.OnScriptInput("ParryStart", () =>{ParryStart();})
function ParryStart()
{
	if (g_AnimStatus != AnimStatus.ATTACK)
	{
		return;
	}

	g_bParryCanBe = true;
	Instance.Msg("PARRY START " + Instance.GetGameTime());

	if (Instance.GetGameTime() < (g_fParryMomentTime_Item_01 + g_fParryMomentTime_Item_01_Duration))
	{
		Instance.EntFireBroadcast("Item_01_Script", "ParrySuccessfully");
		ParrySuccessfully();
		return;
	}

	Instance.EntFireBroadcast(g_szNamePre + "model" + "_" + g_szNameFix, "StartGlowing");
}

Instance.OnScriptInput("ParryEnd", () =>{ParryEnd();})
function ParryEnd()
{
	if (g_AnimStatus != AnimStatus.ATTACK)
	{
		return;
	}
	Instance.Msg("PARRY END: " + Instance.GetGameTime());
	Instance.EntFireBroadcast(g_szNamePre + "model" + "_" + g_szNameFix, "StopGlowing");
	g_bParryCanBe = false;

	Instance.Msg("PARRY END: " + Instance.GetGameTime());
}

function ParrySuccessfully()
{
	g_bParryCanBe = false;
	Instance.EntFireBroadcast(g_szNamePre + "model" + "_" + g_szNameFix, "StopGlowing");
	Die();
}


function Attack_01()
{
	let fSetPlayBackRate = 1.5;
	let fDelay_00 = 0.2;
	let fDelay_01 = 0.6;
	let fDelay_02 = 1.1;
	let fDelay_Post = 2.3;

	g_AnimStatus = AnimStatus.ATTACK;

	SetSpeed(0);

	SetAnimation("brawlerDroid00_ATT_GroundSmash_01", 0.00, fSetPlayBackRate);
	CallFunction("Attack_01_00", ConvertTimeFromPlayBack(fDelay_00, fSetPlayBackRate));
	CallFunction("Attack_01_01", ConvertTimeFromPlayBack(fDelay_01, fSetPlayBackRate));
	CallFunction("Attack_01_02", ConvertTimeFromPlayBack(fDelay_02, fSetPlayBackRate));
	CallFunction("Attack_01_Post", ConvertTimeFromPlayBack(fDelay_Post, fSetPlayBackRate));
}

Instance.OnScriptInput("Attack_01_00", () =>{Attack_01_00();})
function Attack_01_00()
{
	if (g_AnimStatus != AnimStatus.ATTACK)
	{
		return;
	}

	SetSpeed(0.75);
}
Instance.OnScriptInput("Attack_01_01", () =>{Attack_01_01();})
function Attack_01_01()
{
	if (g_AnimStatus != AnimStatus.ATTACK)
	{
		return;
	}

	g_bTracking = false;
	SetSpeed(0);
}
Instance.OnScriptInput("Attack_01_02", () =>{Attack_01_02();})
function Attack_01_02()
{
	if (g_AnimStatus != AnimStatus.ATTACK)
	{
		return;
	}

	ActivateHurt(0, 30);
	Instance.EntFireBroadcast(g_szNamePre + "hurt_ring_effect" + "_" + g_szNameFix, "FireUser1");
}
Instance.OnScriptInput("Attack_01_Post", () =>{Attack_01_Post();})
function Attack_01_Post()
{
	if (g_AnimStatus != AnimStatus.ATTACK)
	{
		return;
	}
	g_bTracking = true;
	g_AnimStatus = AnimStatus.NONE;
	g_fLastTimeAttack_Time = Instance.GetGameTime();

	SetRunSpeed();
}

function Attack_02()
{
	let fSetPlayBackRate = 1.2;
	let fDelay_00 = 0.3;
	let fDelay_01 = 0.6;
	let fDelay_02 = 0.8;
	let fDelay_Post = 1.55;

	g_AnimStatus = AnimStatus.ATTACK;

	SetSpeed(0.75);

	let fDelay_Parry = 0.5;
	let fDelay_ParryEnd = 0.75;

	CallFunction("ParryStart", ConvertTimeFromPlayBack(fDelay_Parry, fSetPlayBackRate));
	CallFunction("ParryEnd", ConvertTimeFromPlayBack(fDelay_ParryEnd, fSetPlayBackRate));

	SetAnimation("BrawlerDroid00_ATT_Punch01", 0.00, fSetPlayBackRate);
	CallFunction("Attack_02_00", ConvertTimeFromPlayBack(fDelay_00, fSetPlayBackRate));
	CallFunction("Attack_02_01", ConvertTimeFromPlayBack(fDelay_01, fSetPlayBackRate));
	CallFunction("Attack_02_02", ConvertTimeFromPlayBack(fDelay_02, fSetPlayBackRate));
	CallFunction("Attack_02_Post", ConvertTimeFromPlayBack(fDelay_Post, fSetPlayBackRate));
}
Instance.OnScriptInput("Attack_02_00", () =>{Attack_02_00();})
function Attack_02_00()
{
	if (g_AnimStatus != AnimStatus.ATTACK)
	{
		return;
	}

	SetSpeed(1.5);
}

Instance.OnScriptInput("Attack_02_01", () =>{Attack_02_01();})
function Attack_02_01()
{
	if (g_AnimStatus != AnimStatus.ATTACK)
	{
		return;
	}

	SetSpeed(0);
}

Instance.OnScriptInput("Attack_02_02", () =>{Attack_02_02();})
function Attack_02_02()
{
	if (g_AnimStatus != AnimStatus.ATTACK)
	{
		return;
	}

	g_bTracking = false;
	ActivateHurt(1, 30);
}

Instance.OnScriptInput("Attack_02_Post", () =>{Attack_02_Post();})
function Attack_02_Post()
{
	if (g_AnimStatus != AnimStatus.ATTACK)
	{
		return;
	}
	g_bTracking = true;
	g_AnimStatus = AnimStatus.NONE;
	g_fLastTimeAttack_Time = Instance.GetGameTime();

	SetRunSpeed();
}
function Attack_03()
{
	let fSetPlayBackRate = 1.4;
	let fDelay_00 = 0.5;
	let fDelay_01 = 0.6;
	let fDelay_Post = 1.55;

	g_AnimStatus = AnimStatus.ATTACK;

	SetSpeed(1.0);

	let fDelay_Parry = 0.35;
	let fDelay_ParryEnd = 0.5;

	CallFunction("ParryStart", ConvertTimeFromPlayBack(fDelay_Parry, fSetPlayBackRate));
	CallFunction("ParryEnd", ConvertTimeFromPlayBack(fDelay_ParryEnd, fSetPlayBackRate));

	SetAnimation("BrawlerDroid00_ATT_Punch02", 0.00, fSetPlayBackRate);
	CallFunction("Attack_03_00", ConvertTimeFromPlayBack(fDelay_00, fSetPlayBackRate));
	CallFunction("Attack_03_01", ConvertTimeFromPlayBack(fDelay_01, fSetPlayBackRate));
	CallFunction("Attack_03_Post", ConvertTimeFromPlayBack(fDelay_Post, fSetPlayBackRate));
}
Instance.OnScriptInput("Attack_03_00", () =>{Attack_03_00();})
function Attack_03_00()
{
	if (g_AnimStatus != AnimStatus.ATTACK)
	{
		return;
	}

	g_bTracking = false;
	ActivateHurt(1, 30);
}

Instance.OnScriptInput("Attack_03_01", () =>{Attack_03_01();})
function Attack_03_01()
{
	if (g_AnimStatus != AnimStatus.ATTACK)
	{
		return;
	}

	SetSpeed(0);
}

Instance.OnScriptInput("Attack_03_Post", () =>{Attack_03_Post();})
function Attack_03_Post()
{
	if (g_AnimStatus != AnimStatus.ATTACK)
	{
		return;
	}
	g_bTracking = true;
	g_AnimStatus = AnimStatus.NONE;
	g_fLastTimeAttack_Time = Instance.GetGameTime();

	SetRunSpeed();
}
function Attack_04()
{
	let fSetPlayBackRate = 1.4;
	let fDelay_00 = 0.2;
	let fDelay_01 = 0.8;
	let fDelay_Post = 2.2;

	g_AnimStatus = AnimStatus.ATTACK;

	SetSpeed(1.0);

	let fDelay_Parry = 0.5;
	let fDelay_ParryEnd = 0.75;

	CallFunction("ParryStart", ConvertTimeFromPlayBack(fDelay_Parry, fSetPlayBackRate));
	CallFunction("ParryEnd", ConvertTimeFromPlayBack(fDelay_ParryEnd, fSetPlayBackRate));

	SetAnimation("BrawlerDroid00_ATT_Punch03", 0.00, fSetPlayBackRate);
	CallFunction("Attack_04_00", ConvertTimeFromPlayBack(fDelay_00, fSetPlayBackRate));
	CallFunction("Attack_04_01", ConvertTimeFromPlayBack(fDelay_01, fSetPlayBackRate));
	CallFunction("Attack_04_Post", ConvertTimeFromPlayBack(fDelay_Post, fSetPlayBackRate));
}
Instance.OnScriptInput("Attack_04_00", () =>{Attack_04_00();})
function Attack_04_00()
{
	if (g_AnimStatus != AnimStatus.ATTACK)
	{
		return;
	}

	SetSpeed(1.5);
}

Instance.OnScriptInput("Attack_04_01", () =>{Attack_04_01();})
function Attack_04_01()
{
	if (g_AnimStatus != AnimStatus.ATTACK)
	{
		return;
	}

	SetSpeed(0);
	ActivateHurt(1, 30);
	ActivatePush(0);
	g_bTracking = false;
}

Instance.OnScriptInput("Attack_04_Post", () =>{Attack_04_Post();})
function Attack_04_Post()
{
	if (g_AnimStatus != AnimStatus.ATTACK)
	{
		return;
	}
	g_bTracking = true;
	g_AnimStatus = AnimStatus.NONE;
	g_fLastTimeAttack_Time = Instance.GetGameTime();

	SetRunSpeed();
}

function Attack_05()
{
	let fSetPlayBackRate = 1.0;
	let fDelay_00 = 0.4 //stop
	let fDelay_01 = 0.55; //hurt
	let fDelay_02 = 0.8 //run fast
	let fDelay_03 = 1.3; //stop
	let fDelay_Post = 1.6;

	g_AnimStatus = AnimStatus.ATTACK;

	SetSpeed(1.0);

	let fDelay_Parry = 0.35;
	let fDelay_ParryEnd = 0.5;

	CallFunction("ParryStart", ConvertTimeFromPlayBack(fDelay_Parry, fSetPlayBackRate));
	CallFunction("ParryEnd", ConvertTimeFromPlayBack(fDelay_ParryEnd, fSetPlayBackRate));

	SetAnimation("BrawlerDroid00_ATT_RunBackhand", 0.00, fSetPlayBackRate);
	CallFunction("Attack_05_00", ConvertTimeFromPlayBack(fDelay_00, fSetPlayBackRate));
	CallFunction("Attack_05_01", ConvertTimeFromPlayBack(fDelay_01, fSetPlayBackRate));
	CallFunction("Attack_05_02", ConvertTimeFromPlayBack(fDelay_02, fSetPlayBackRate));
	CallFunction("Attack_05_03", ConvertTimeFromPlayBack(fDelay_03, fSetPlayBackRate));
	CallFunction("Attack_05_Post", ConvertTimeFromPlayBack(fDelay_Post, fSetPlayBackRate));
}
Instance.OnScriptInput("Attack_05_00", () =>{Attack_05_00();})
function Attack_05_00()
{
	if (g_AnimStatus != AnimStatus.ATTACK)
	{
		return;
	}

	SetSpeed(0);
}
Instance.OnScriptInput("Attack_05_01", () =>{Attack_05_01();})
function Attack_05_01()
{
	if (g_AnimStatus != AnimStatus.ATTACK)
	{
		return;
	}

	ActivateHurt(1, 30);
}
Instance.OnScriptInput("Attack_05_02", () =>{Attack_05_02();})
function Attack_05_02()
{
	if (g_AnimStatus != AnimStatus.ATTACK)
	{
		return;
	}

	SetSpeed(1.2);

}
Instance.OnScriptInput("Attack_05_03", () =>{Attack_05_03();})
function Attack_05_03()
{
	if (g_AnimStatus != AnimStatus.ATTACK)
	{
		return;
	}

	SetSpeed(0);
	g_bTracking = false;
}
Instance.OnScriptInput("Attack_05_Post", () =>{Attack_05_Post();})
function Attack_05_Post()
{
	if (g_AnimStatus != AnimStatus.ATTACK)
	{
		return;
	}
	g_bTracking = true;
	g_AnimStatus = AnimStatus.NONE;
	g_fLastTimeAttack_Time = Instance.GetGameTime();

	SetRunSpeed();
}

function SetSpeed(fValue)
{
	g_fSpeed = fValue;
	if (g_fSpeed > 0.00)
	{
		g_bMoveForwardLastTick = true;
		Instance.EntFireBroadcast(g_szNamePre + "tr_f" + "_" + g_szNameFix, "Deactivate", "", 0.00);
		Instance.EntFireBroadcast(g_szNamePre + "tr_f" + "_" + g_szNameFix, "KeyValue", "force " + SPEED_BASE * g_fSpeed, 0);
		Instance.EntFireBroadcast(g_szNamePre + "tr_f" + "_" + g_szNameFix, "Activate", "", 0.02);
	}
	else
	{
		g_bMoveForwardLastTick = false;
		Instance.EntFireBroadcast(g_szNamePre + "tr_f" + "_" + g_szNameFix, "Deactivate", "", 0.00);
	}
}

function SetRunSpeed()
{
	SetSpeed(1.00);
}

function ConvertTimeFromPlayBack(fTime, fSetPlayBackRate = -1)
{
	if (fSetPlayBackRate == -1)
	{
		return fTime / g_fPlayBackRate;
	}
	else
	{
		return fTime / fSetPlayBackRate;
	}
}

function SetAnimation(szName, fDelay = 0.00, fRate = 1.00, bLoop = false)
{
	if (bLoop)
	{
		Instance.EntFireBroadcast(g_szNamePre + "model" + "_" + g_szNameFix, "SetAnimationLooping", szName, fDelay);
	}
	else
	{
		Instance.EntFireBroadcast(g_szNamePre + "model" + "_" + g_szNameFix, "SetAnimationNotLooping", szName, fDelay);
	}
	Instance.EntFireBroadcast(g_szNamePre + "model" + "_" + g_szNameFix, "SetPlayBackRate", fRate, fDelay);
}

function SetDefaultAnimation(szName, fDelay = 0.00, bLoop = true)
{
	if (bLoop)
	{
		Instance.EntFireBroadcast(g_szNamePre + "model" + "_" + g_szNameFix, "SetDefaultAnimationLooping", szName, fDelay);
	}
	else
	{
		Instance.EntFireBroadcast(g_szNamePre + "model" + "_" + g_szNameFix, "SetDefaultAnimationNotLooping", szName, fDelay);
	}
}

function ActivatePush(ID, fDelay = 0.0)
{
	let szHurtHame;
	switch (ID)
	{
		case 0: {szHurtHame = "0";break;}
		case 1: {szHurtHame = "1";break;}
		default: {szHurtHame = -1;break;}
	}

	if (szHurtHame == -1)
	{
		return;
	}

	Instance.EntFireBroadcast(g_szNamePre + "push" + "_" + szHurtHame + "_" + g_szNameFix, "FireUser1", "", fDelay);
}

function ActivateHurt(ID, iDamage, fDelay = 0.0)
{
	let szHurtHame;
	switch (ID)
	{
		case 0: {szHurtHame = "ring";break;}
		case 1: {szHurtHame = "cone";break;}
		default: {szHurtHame = -1;break;}
	}

	if (szHurtHame == -1)
	{
		return;
	}

	Instance.EntFireBroadcast(g_szNamePre + "hurt" + "_" + g_szNameFix, "KeyValue", "damage " + iDamage, fDelay);
	Instance.EntFireBroadcast(g_szNamePre + "hurt" + "_" + szHurtHame + "_" + g_szNameFix, "FireUser1", "", fDelay);
}

Instance.OnScriptInput("TouchProjRiffle", () =>{TouchProjRiffle();})
function TouchProjRiffle()
{
	const szCallback = g_szNamePre + "script" + "_" + g_szNameFix;
	Instance.EntFireBroadcast("Item_02_Script", "HitNPC_00_Riffle", szCallback);
}

Instance.OnScriptInput("TouchProjSniper", () =>{TouchProjSniper();})
function TouchProjSniper()
{
	const szCallback = g_szNamePre + "script" + "_" + g_szNameFix;
	Instance.EntFireBroadcast("Item_02_Script", "HitNPC_00_Sniper", szCallback);
}

Instance.OnScriptInput("TouchProjShotGun", () =>{TouchProjShotGun();})
function TouchProjShotGun()
{
	const szCallback = g_szNamePre + "script" + "_" + g_szNameFix;
	Instance.EntFireBroadcast("Item_03_Script", "HitNPC_00", szCallback);
}
Instance.OnScriptInput("TouchProjRailGun", () =>{TouchProjRailGun();})
function TouchProjRailGun()
{
	const szCallback = g_szNamePre + "script" + "_" + g_szNameFix;
	Instance.EntFireBroadcast("Item_04_Script", "HitNPC_00", szCallback);
}

Instance.OnScriptInput("DamagePlayer", () =>{TakeDamage(1);})
Instance.OnScriptInput("DamageItem", /*number*/ (ID) =>{TakeDamage(Number(ID));})

function TakeDamage(iDamage)
{
	if (g_fSonarTime > Instance.GetGameTime())
	{
		iDamage += iDamage;
	}

	g_iHP -= iDamage
	if (g_iHP <= 0)
	{
		Die();
	}
}

function Die()
{
	if (g_AnimStatus == AnimStatus.SCENE)
	{
		return;
	}

	g_AnimStatus = AnimStatus.SCENE;
	Instance.EntFireBroadcast(g_szNamePre + "HP_Bar" + "_" + g_szNameFix, "Kill");
	Instance.EntFireBroadcast(g_szNamePre + "sensor_00" + "_" + g_szNameFix, "Kill");
	Instance.EntFireBroadcast(g_szNamePre + "sensor_01" + "_" + g_szNameFix, "Kill");
	Instance.EntFireBroadcast(g_szNamePre + "sensor_02" + "_" + g_szNameFix, "Kill");
	Instance.EntFireBroadcast(g_szNamePre + "sensor_03" + "_" + g_szNameFix, "Kill");
	Instance.EntFireBroadcast(g_szNamePre + "sensor_04" + "_" + g_szNameFix, "Kill");
	Instance.EntFireBroadcast(g_szNamePre + "sensor_05" + "_" + g_szNameFix, "Kill");
	Instance.EntFireBroadcast(g_szNamePre + "sensor_06" + "_" + g_szNameFix, "Kill");
	Instance.EntFireBroadcast(g_szNamePre + "sensor_07" + "_" + g_szNameFix, "Kill");

	Instance.EntFireBroadcast(g_szNamePre + "trace_maker" + "_" + g_szNameFix, "Kill");
	Instance.EntFireBroadcast(g_szNamePre + "push_0" + "_" + g_szNameFix, "Kill");

	Instance.EntFireBroadcast(g_szNamePre + "hurt" + "_" + g_szNameFix, "Kill");
	Instance.EntFireBroadcast(g_szNamePre + "hurt_ring" + "_" + g_szNameFix, "Kill");
	Instance.EntFireBroadcast(g_szNamePre + "hurt_cone" + "_" + g_szNameFix, "Kill");
	Instance.EntFireBroadcast(g_szNamePre + "trace_trigger" + "_" + g_szNameFix, "Kill");
	Instance.EntFireBroadcast(g_szNamePre + "hitbox" + "_" + g_szNameFix, "Kill");

	Instance.EntFireBroadcast(g_szNamePre + "hitbox_item_00" + "_" + g_szNameFix, "Kill");
	Instance.EntFireBroadcast(g_szNamePre + "hitbox_item_01" + "_" + g_szNameFix, "Kill");
	Instance.EntFireBroadcast(g_szNamePre + "hitbox_item_05" + "_" + g_szNameFix, "Kill");

	Instance.EntFireBroadcast(g_szNamePre + "tr_u" + "_" + g_szNameFix, "Kill");

	Instance.EntFireBroadcast(g_szNamePre + "hitbox_item_00" + "_" + g_szNameFix, "Kill");
	Instance.EntFireBroadcast(g_szNamePre + "hitbox_item_01" + "_" + g_szNameFix, "Kill");
	Instance.EntFireBroadcast(g_szNamePre + "hitbox_item_05" + "_" + g_szNameFix, "Kill");

	Instance.EntFireBroadcast(g_szNamePre + "item_touch_proj_02_0" + "_" + g_szNameFix, "Kill");
	Instance.EntFireBroadcast(g_szNamePre + "item_touch_proj_02_1" + "_" + g_szNameFix, "Kill");
	Instance.EntFireBroadcast(g_szNamePre + "item_touch_proj_03" + "_" + g_szNameFix, "Kill");
	Instance.EntFireBroadcast(g_szNamePre + "item_touch_proj_04" + "_" + g_szNameFix, "Kill");

	Instance.EntFireBroadcast(g_szNamePre + "tr_f" + "_" + g_szNameFix, "Deactivate", "", 0);
	Instance.EntFireBroadcast(g_szNamePre + "tr_f" + "_" + g_szNameFix, "KeyValue", "angles 0 " + -g_iAngeYLastTick + " 0", 0);
	Instance.EntFireBroadcast(g_szNamePre + "tr_f" + "_" + g_szNameFix, "KeyValue", "force 10000", 0);
	Instance.EntFireBroadcast(g_szNamePre + "tr_f" + "_" + g_szNameFix, "Activate", "", 0.02);
	Instance.EntFireBroadcast(g_szNamePre + "tr_f" + "_" + g_szNameFix, "Deactivate", "", 0.15);
	Instance.EntFireBroadcast(g_szNamePre + "tr_f" + "_" + g_szNameFix, "Kill", "", 0.15);

	SetAnimation("brawlerDroid00_Death", 0.00, 1.00);
	Instance.EntFireBroadcast(g_szNamePre + "model" + "_" + g_szNameFix, "SetDefaultAnimationLooping", "");

	Instance.EntFireBroadcast(g_szNamePre + "script" + "_" + g_szNameFix, "Kill");
	Instance.EntFireBroadcast(g_szNamePre + "model" + "_" + g_szNameFix, "FireUser1", "", 5.0);
	Instance.EntFireBroadcast(g_szNamePre + "phys" + "_" + g_szNameFix, "Kill", "", 5.05);
	Instance.EntFireBroadcast(g_szNamePre + "keep" + "_" + g_szNameFix, "Kill", "", 5.05);

	Instance.EntFireBroadcast(g_szNamePre + "model_explode_effect" + "_" + g_szNameFix, "FireUser1", "", 2.55);
	Instance.EntFireBroadcast(g_szNamePre + "model_explode" + "_" + g_szNameFix, "FireUser1", "", 2.55);
}

Instance.OnScriptInput("GetOriginNPC", () =>{GetOriginNPC();})
function GetOriginNPC()
{
	let A = [];
	let B = [];

	for (let i = 0; i < 8; i++)
	{
		for (let j = i + 1; j < 8; j++)
		{
			const xi = g_aVecCalculateDistance[i].x;
			const yi = g_aVecCalculateDistance[i].y;
			const zi = g_aVecCalculateDistance[i].z;
			const di = g_aFCalculateDistanceSelf[i];

			const xj = g_aVecCalculateDistance[j].x;
			const yj = g_aVecCalculateDistance[j].y;
			const zj = g_aVecCalculateDistance[j].z;
			const dj = g_aFCalculateDistanceSelf[j];

			A.push([2*(xi-xj), 2*(yi-yj), 2*(zi-zj)]);
			B.push(xi*xi + yi*yi + zi*zi - di*di - (xj*xj + yj*yj + zj*zj) + dj*dj);
		}
	}

	g_vecCenterNPC = GetOriginNPC_00(A, B);
	g_vecCenterNPC = {
		x: g_vecCenterNPC.x,
		y: g_vecCenterNPC.y,
		z: Number(g_vecCenterNPC.z) + Number(48)}
}

function GetOriginNPC_00(A, B)
{
	const AT = GetOriginNPC_01(A);
	const ATA = GetOriginNPC_02(AT, A);
	const ATB = GetOriginNPC_03(AT, B);

	const solutionVec = GetOriginNPC_04(ATA, ATB);

	return {
		x: solutionVec[0].toFixed(2),
		y: solutionVec[1].toFixed(2),
		z: solutionVec[2].toFixed(2)};
}

function GetOriginNPC_01(matrix) {
	const rows = matrix.length;
	const cols = matrix[0].length;
	const result = [];
	for (let j = 0; j < cols; j++) {
		result[j] = [];
		for (let i = 0; i < rows; i++) {
			result[j][i] = matrix[i][j];
		}
	}

	return result;
}

function GetOriginNPC_02(A, B) {
	const rowsA = A.length;
	const colsA = A[0].length;
	const rowsB = B.length;
	const colsB = B[0].length;

	if (colsA !== rowsB) {
		return -1;
	}

	const result = [];
	for (let i = 0; i < rowsA; i++) {
		result[i] = [];
		for (let j = 0; j < colsB; j++) {
			let sum = 0;
			for (let k = 0; k < colsA; k++) {
				sum += A[i][k] * B[k][j];
			}
			result[i][j] = sum;
		}
	}
	return result;
}

function GetOriginNPC_03(A, v) {
	const rowsA = A.length;
	const colsA = A[0].length;

	if (colsA !== v.length) {
		return -1;
	}

	const result = [];
	for (let i=0; i<rowsA; i++) {
		let sum=0;
		for (let j=0;j<colsA;j++) {
			sum += A[i][j]*v[j];
		}
		result[i]=sum;
	}
	return result;
}

function GetOriginNPC_04(A, b) {
	let M = [
		[...A[0]],
		[...A[1]],
		[...A[2]]
	];

	let v = [...b];

	for (let i=0; i<3; i++) {
		let maxEl= Math.abs(M[i][i]);
		let maxRow=i;
		for(let k=i+1;k<3;k++){
			if(Math.abs(M[k][i]) > maxEl){
				maxEl=Math.abs(M[k][i]);
				maxRow=k;
			}
		}

		[M[i], M[maxRow]]=[M[maxRow], M[i]];
		[v[i], v[maxRow]]=[v[maxRow], v[i]];

		for(let k=i+1;k<3;k++){
			let c= M[k][i]/M[i][i];
			for(let j=i;j<3;j++){
				M[k][j]-=c*M[i][j];
			}
			v[k]-=c*v[i];
		}
	}

	const x=[0,0,0];
	for(let i=2;i>=0;i--){
		let sum= v[i];
		for(let j=i+1;j<3;j++){
			sum -= M[i][j]*x[j];
		}
		x[i]=sum/M[i][i];
	}

	return x;
}

function AddOutPut(szName, szOutPut, szTarget, szOperation, szValue, fDelay, iRepit)
{
	Instance.EntFireBroadcast(g_szNamePre + szName + "_" + g_szNameFix, "AddOutput", szOutPut + ">" + g_szNamePre + szTarget + "_" + g_szNameFix + ">" + szOperation + ">" + szValue + ">" + fDelay + ">" + iRepit);
}

function AddPreFix(szName)
{
	Instance.EntFireBroadcast("" + g_szNamePre + szName, "KeyValue", "targetname " + g_szNamePre + szName + "_" + g_szNameFix);
}

function GetOriginForSensor(ID)
{
	return "origin " + g_aVecCalculateDistance[ID].x + " " + g_aVecCalculateDistance[ID].y + " " + g_aVecCalculateDistance[ID].z;
}

Instance.OnScriptInput("Init", /*number*/ (szID) => {Init(szID)})
Instance.OnScriptInput("Init_Post", () => {Init_Post()})

Instance.OnScriptInput("GetDistance_00", /*number*/ (ID) =>{GetDistance_00(ID);})
function GetDistance_00(ID)
{
	g_aFCalculateDistanceSelf[0] = Number(ID);
}
Instance.OnScriptInput("GetDistance_01", /*number*/ (ID) =>{GetDistance_01(ID);})
function GetDistance_01(ID)
{
	g_aFCalculateDistanceSelf[1] = Number(ID);
}
Instance.OnScriptInput("GetDistance_02", /*number*/ (ID) =>{GetDistance_02(ID);})
function GetDistance_02(ID)
{
	g_aFCalculateDistanceSelf[2] = Number(ID);
}
Instance.OnScriptInput("GetDistance_03", /*number*/ (ID) =>{GetDistance_03(ID);})
function GetDistance_03(ID)
{
	g_aFCalculateDistanceSelf[3] = Number(ID);
}
Instance.OnScriptInput("GetDistance_04", /*number*/ (ID) =>{GetDistance_04(ID);})
function GetDistance_04(ID)
{
	g_aFCalculateDistanceSelf[4] = Number(ID);
}
Instance.OnScriptInput("GetDistance_05", /*number*/ (ID) =>{GetDistance_05(ID);})
function GetDistance_05(ID)
{
	g_aFCalculateDistanceSelf[5] = Number(ID);
}
Instance.OnScriptInput("GetDistance_06", /*number*/ (ID) =>{GetDistance_06(ID);})
function GetDistance_06(ID)
{
	g_aFCalculateDistanceSelf[6] = Number(ID);
}
Instance.OnScriptInput("GetDistance_07", /*number*/ (ID) =>{GetDistance_07(ID);})
function GetDistance_07(ID)
{
	g_aFCalculateDistanceSelf[7] = Number(ID);
}

function CallFunction(szFuncname, fDelay = 0.00, szDelay = "")
{
	Instance.EntFireBroadcast(g_szNamePre + "script" + "_" + g_szNameFix, "" + szFuncname, "" + szDelay, fDelay);
}

Instance.OnScriptInput("SetTarget", /*number*/ (ID) =>{SetTarget(Number(ID));})
function SetTarget(ID)
{
	g_iTarget = ID;
	g_vecTargetLast = "x";
	g_fTargetTime = Instance.GetGameTime() + TARGET_DURATION;
}

function IsValidTarget()
{
	if (g_iTarget != -1)
	{
		if (IsValidPlayer(g_iTarget))
		{
			return true;
		}
	}

	g_iTarget = -1;
	return false;
}

function IsValidPlayer(slot)
{
	let player = Instance.GetPlayerPawn("" + slot);
	if (player)
	{
		if(player.FindWeaponBySlot(2) && player.GetTeamNumber() == 3)
		{
			return true;
		}
	}

	return false;
}

function GetOriginTarget()
{
	g_vecTarget = Instance.GetPlayerPawn("" + g_iTarget).GetOrigin();
	g_vecTarget = (""+g_vecTarget).split(",");
	g_vecTarget = ArrayToVector(g_vecTarget);

	let sX = Number(g_vecTarget.x).toFixed(2);
	let sY = Number(g_vecTarget.y).toFixed(2);
	let sZ = Number(g_vecTarget.z).toFixed(2);

	g_vecTarget = {x: sX,
						y:	sY,
						z: (Number(sZ) + Number(48))};
}

function ArrayToVector(aArray)
{
	return {x: aArray[0], y: aArray[1], z: aArray[2]};
}
function GetDistanceBetweenTwoPointsZ(vec1, vec2)
{
	return Math.sqrt(Math.pow((vec1.z-vec2.z), 2));
}
function GetDistanceBetweenTwoPoints2D(vec1, vec2)
{
	return Math.sqrt(Math.pow((vec1.x-vec2.x), 2) + Math.pow((vec1.y-vec2.y), 2));
}
function GetDistanceBetweenTwoPoints3D(vec1, vec2)
{
	return Math.sqrt(Math.pow((vec1.x-vec2.x), 2) + Math.pow((vec1.y-vec2.y), 2) + Math.pow((vec1.z-vec2.z), 2));
}
function VectorToText(vec)
{
	return "" + vec.x + " " + vec.y + " " + vec.z;
}
function AngleFromTwoPoints(vec1, vec2)
{
	return ((Math.atan2(vec2.y - vec1.y, vec2.x - vec1.x) * 180) / Math.PI).toFixed(1);
}
function AngleFromTwoPointsX(vec1, vec2)
{
	return ((Math.atan2(vec1.z - vec2.z, Math.sqrt((vec1.x - vec2.x) * (vec1.x - vec2.x) + (vec1.y - vec2.y) * (vec1.y - vec2.y))) * 180) / Math.PI).toFixed(1);;
}
function ShowHud(szText)
{
	Instance.EntFireBroadcast("debug_hud", "SetMessage", "" + szText);
	Instance.EntFireBroadcast("Debug_HudDisplay", "FireUser1");
}

function GetRandomInt(min, max)
{
	const minCeiled = Math.ceil(min);
	const maxFloored = Math.floor(max);
	return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled)
}

function GetPlayerTrace_PreCall()
{
	Instance.EntFireBroadcast(g_szNamePre + "trace_maker" + "_" + g_szNameFix, "KeyValue", "origin " + VectorToText(g_vecTarget));
	Instance.EntFireBroadcast(g_szNamePre + "trace_maker" + "_" + g_szNameFix, "KeyValue", "angles " + AngleFromTwoPointsX(g_vecTarget, g_vecCenterNPC) + " " + AngleFromTwoPoints(g_vecTarget, g_vecCenterNPC) + " 0");
	Instance.EntFireBroadcast(g_szNamePre + "trace_trigger" + "_" + g_szNameFix, "KeyValue", "origin " + VectorToText(g_vecCenterNPC));
	Instance.EntFireBroadcast(g_szNamePre + "trace_maker" + "_" + g_szNameFix, "ForceSpawn", "", 0.02);
}

Instance.OnScriptInput("PlayerTraceTrue", () => {PlayerTraceTrue()})
function PlayerTraceTrue()
{
	g_fTargetTraceTime = Instance.GetGameTime();
}

function GetPath_PreCall()
{
	CallFunction("GetPath", (TICKRATE - 0.04));
}
Instance.OnScriptInput("GetPath", () => {GetPath()})
function GetPath()
{
	if (IsValidTarget())
	{
		GetOriginTarget();

		let szMessage = g_szNamePre + "script" + "_" + g_szNameFix + `,${g_vecCenterNPC.x},${g_vecCenterNPC.y},${g_vecCenterNPC.z},${g_vecTarget.x},${g_vecTarget.y},${g_vecTarget.z}`;
		Instance.EntFireBroadcast("@nav_script", "GetPathForNPC", szMessage, 0.00);
	}
	else if (g_iPattern_Order == NPC_PATTERN_ORDER.PATROL)
	{
		let szMessage = g_szNamePre + "script" + "_" + g_szNameFix + `,${g_vecCenterNPC.x},${g_vecCenterNPC.y},${g_vecCenterNPC.z},${g_avecPatrol[g_iPatrolID].x},${g_avecPatrol[g_iPatrolID].y},${g_avecPatrol[g_iPatrolID].z}`;
		Instance.EntFireBroadcast("@nav_script", "GetPathForNPC", szMessage, 0.00);
	}
}

Instance.OnScriptInput("GetPath_Callback", /*number*/ (szArg) =>{GetPath_Callback(szArg)})
function GetPath_Callback(szArg)
{
	if (szArg == "-2" ||
		szArg == "-1" ||
		szArg == "0")
	{
		g_avecMovePoint = -1;
		return;
	}

	szArg = szArg.split(",");

	g_avecMovePoint = [];
	let ID = 0;
	for (let i = 0; i < szArg.length;)
	{
		g_avecMovePoint[ID] = {
			x: Number(szArg[i]),
			y: Number(szArg[i+1]),
			z: Number(szArg[i+2])}

		i += 3;
		ID++;
	}
}

function TextInChat(szText, fDelay = 0.00)
{
	Instance.EntFireBroadcast("cmd", "Command", "say " + szText, fDelay);
}

Instance.OnScriptInput("TouchSonar", () =>{TouchSonar()})
function TouchSonar()
{
	g_fSonarTime = Instance.GetGameTime() + 15.0;
}