import { Instance } from 'cs_script/point_script';
//674

// 1 Тит Андроник (1591–1592) — самая кровавая и ранняя проба пера.
// 2 Ромео и Джульетта (1595–1596) — лирическая трагедия.
// 3 Гамлет (1599–1601) 
// 4 Отелло (1603–1604)
// 5 Король Лир (1605–1606)
// 6 Макбет (1606)
// 8 Антоний и Клеопатра (1606)
// 9 Кориолан (1607–1608)
// 0 Тимон Афинский (1607–1608)
Instance.Msg(`asd`)
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
}

Instance.Msg(`45`)
let g_hButtons = [];
let g_iCode = "";
let g_iPressCode = "";
let g_vecButtonsSpawn = new Vec3(1512, -280, 42);
let g_Dir_x = 0;
let g_Dir_y = -1;
let g_Size = 16;

Instance.Msg(`IzxcT`)

function OnRoundStart()
{
	Instance.EntFireAtName({name: "shq_script", input: "RunScriptInput", value: "Init"})
}

Instance.OnScriptInput("Init", (Activator_Caller_Data) => {Init()})

function Init()
{
	Instance.Msg(`INIT SCRIPT`)
	let aButtons = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09"];

	g_iCode = "";
	g_iPressCode = "";

	for (let i = 0; i < 6; i++)
	{
		const iRandomValue = GetRandomInt(0, aButtons.length);
		const szName = "shq_block_" + aButtons[iRandomValue];
		const Ent = Instance.FindEntityByName(szName);
		g_iCode += aButtons[iRandomValue][1];

		aButtons.splice(iRandomValue, 1);
		const vecSet = new Vec3(g_vecButtonsSpawn.x + g_hButtons.length * g_Dir_x * g_Size, g_vecButtonsSpawn.y + g_hButtons.length * g_Dir_y * g_Size, g_vecButtonsSpawn.z)

		Instance.EntFireAtTarget({ target: Ent, input: "KeyValue", value: `origin ${vecSet.x} ${vecSet.y} ${vecSet.z}`});

		Instance.Msg(`520 ${g_vecButtonsSpawn.y + g_hButtons.length * g_Dir_y * g_Size}`)
		g_hButtons.push(Ent);
		Instance.Msg(`INIT SCRIPT ${vecSet.x} ${vecSet.y} ${vecSet.z} `)
	}
	Instance.Msg(`123`)
	Instance.EntFireAtName({name: "shq_original", input: "SetMessage", value: g_iCode})
	Instance.Msg(`zxc`)
	//123
	Instance.Msg(`${g_iCode}`);
}

function PressButton(ID)
{
	if (ID == -1) //RESET
	{
		g_iPressCode = ""
		Instance.EntFireAtName({name: "shq_pass", input: "SetMessage", value: g_iPressCode})
		Instance.EntFireAtName({name: "shq_pass", input: "FireUser3"})
		return;
	}

	if (ID == -2) //ENTER
	{
		if (g_iPressCode == g_iCode)
		{
			g_iPressCode = ""
			Instance.EntFireAtName({name: "shq_pass", input: "FireUser1"})
		}

		return;
	}

	g_iPressCode += ID;

	if (g_iPressCode.length > 6)
	{
		let arr = g_iPressCode.split('');  // Convert to array
		arr.splice(0, 1);                  // Now splice works
		g_iPressCode = arr.join('');       // Convert back to string: "234567"
	}

	if (g_iPressCode.length == 6)
	{
		PressButton(-2);
	}

	Instance.EntFireAtName({name: "shq_pass", input: "SetMessage", value: "" + g_iPressCode})
}

Instance.OnScriptInput("Button_00", (Activator_Caller_Data) => {
	PressButton(0);
})
Instance.OnScriptInput("Button_01", (Activator_Caller_Data) => {
	PressButton(1);
})
Instance.OnScriptInput("Button_02", (Activator_Caller_Data) => {
	PressButton(2);
})
Instance.OnScriptInput("Button_03", (Activator_Caller_Data) => {
	PressButton(3);
})
Instance.OnScriptInput("Button_04", (Activator_Caller_Data) => {
	PressButton(4);
})
Instance.OnScriptInput("Button_05", (Activator_Caller_Data) => {
	PressButton(5);
})
Instance.OnScriptInput("Button_06", (Activator_Caller_Data) => {
	PressButton(6);
})
Instance.OnScriptInput("Button_07", (Activator_Caller_Data) => {
	PressButton(7);
})
Instance.OnScriptInput("Button_08", (Activator_Caller_Data) => {
	PressButton(8);
})
Instance.OnScriptInput("Button_09", (Activator_Caller_Data) => {
	PressButton(9);
})
Instance.OnScriptInput("Button_R", (Activator_Caller_Data) => {
	PressButton(-1);
})

function GetRandomInt(min, max)
{
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

Instance.OnRoundStart(() => {
	OnRoundStart();
});


OnRoundStart();