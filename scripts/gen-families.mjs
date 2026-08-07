// 生成 L0 词族库（数据驱动 WordFamilyCard）
// 用法: node scripts/gen-families.mjs > data/wordfamilies/l0-phonics.json
//
// 设计：
//  - 每个词族只写 [词尾, 尾音IPA, 锚点词, [成员词...], 备注]
//  - 成员词的 IPA = 首字母辅音IPA + 尾音IPA（自然拼读规律，元音已在尾音里）
//  - 中文/emoji/例句按词自动查表，缺省给通用占位
import { writeFileSync } from 'node:fs'

// 首字母 -> 辅音 IPA（覆盖英文 26 字母常见读音）
const CONS = {
  b: '/b/', c: '/k/', d: '/d/', f: '/f/', g: '/g/', h: '/h/', j: '/dʒ/',
  k: '/k/', l: '/l/', m: '/m/', n: '/n/', p: '/p/', q: '/k/', r: '/r/',
  s: '/s/', t: '/t/', v: '/v/', w: '/w/', x: '/ks/', y: '/j/', z: '/z/',
}

// 常用词中文/emoji（按需扩展）
const CN = {
  cat:'猫',bat:'蝙蝠',hat:'帽子',mat:'垫子',rat:'老鼠',sat:'坐',fat:'胖',pat:'轻拍',
  man:'男人',can:'能；罐头',fan:'扇子；粉丝',pan:'平底锅',ran:'跑(过去)',van:'面包车',tan:'晒黑',plan:'计划',
  cap:'帽子',map:'地图',nap:'小睡',tap:'轻敲',lap:'大腿',rap:'说唱',
  bag:'包',tag:'标签',rag:'破布',flag:'旗帜',
  dad:'爸爸',mad:'生气',sad:'伤心',pad:'垫',
  ham:'火腿',jam:'果酱',ram:'公羊',
  back:'背；后面',pack:'打包',sack:'麻袋',black:'黑色',
  hand:'手',land:'土地',sand:'沙子',band:'乐队',
  cash:'现金',wash:'洗',flash:'闪光',
  hen:'母鸡',pen:'钢笔',ten:'十',men:'男人们',den:'兽穴',
  net:'网',pet:'宠物',wet:'湿',vet:'兽医',set:'一套',
  bed:'床',red:'红色',fed:'喂(过去)',wed:'结婚',
  leg:'腿',egg:'蛋',peg:'挂钩',
  bell:'铃',sell:'卖',tell:'告诉',well:'好；井',
  best:'最好',rest:'休息',nest:'鸟巢',west:'西方',
  pig:'猪',big:'大',dig:'挖',wig:'假发',
  lip:'嘴唇',tip:'尖；小费',dip:'蘸',zip:'拉链',
  pin:'别针',win:'赢',tin:'罐头',bin:'垃圾桶',
  sit:'坐',fit:'合适',hit:'打',bit:'一点',
  lid:'盖子',kid:'小孩',rid:'摆脱',
  hill:'山',bill:'账单',fill:'填满',pill:'药丸',
  kick:'踢',lick:'舔',pick:'捡',stick:'棍',
  king:'国王',ring:'戒指；环',sing:'唱',wing:'翅膀',
  dog:'狗',log:'原木',fog:'雾',hog:'猪',
  top:'顶部',cop:'警察',hop:'跳',mop:'拖把',
  hot:'热',dot:'点',pot:'锅',rot:'腐烂',
  box:'盒子',fox:'狐狸',
  job:'工作',rob:'抢',cob:'玉米棒',
  rock:'岩石',lock:'锁',sock:'袜子',clock:'时钟',
  pod:'豆荚',rod:'杆',
  sun:'太阳',run:'跑',fun:'有趣',bun:'包子',gun:'枪',
  bug:'虫子',rug:'地毯',mug:'杯子',hug:'拥抱',
  cut:'切',nut:'坚果',hut:'小屋',
  tub:'浴缸',cub:'幼兽',sub:'潜水艇',
  hum:'哼唱',gum:'口香糖',
  duck:'鸭子',luck:'运气',truck:'卡车',
  jump:'跳',bump:'撞',pump:'泵',
  cake:'蛋糕',bake:'烤',lake:'湖',wake:'醒',
  gate:'大门',late:'迟到',date:'日期',plate:'盘子',
  game:'游戏',name:'名字',fame:'名声',came:'来(过去)',
  cane:'手杖',plane:'飞机',crane:'起重机',
  face:'脸',race:'赛跑',space:'空间',
  sale:'出售',tale:'故事',pale:'苍白',
  tape:'胶带',cape:'斗篷',grape:'葡萄',
  see:'看见',bee:'蜜蜂',tree:'树',three:'三',
  feet:'脚(复)',meet:'遇见',street:'街道',sweet:'甜',
  feel:'感觉',peel:'剥',wheel:'轮子',
  speak:'说',peak:'山峰',weak:'弱',
  dream:'梦',cream:'奶油',team:'队',
  bike:'自行车',like:'喜欢',pike:'梭子鱼',
  time:'时间',lime:'酸橙',dime:'一角硬币',
  line:'线',fine:'好',wine:'酒',pine:'松树',
  ride:'骑',side:'边',wide:'宽',
  rice:'米饭',nice:'好',ice:'冰',
  joke:'玩笑',coke:'可乐',poke:'戳',
  note:'笔记',vote:'投票',
  hole:'洞',role:'角色',pole:'杆',
  bone:'骨头',cone:'圆锥',stone:'石头',
  hope:'希望',rope:'绳子',cope:'应付',
  cute:'可爱',flute:'长笛',
  tune:'曲调',june:'六月',
  cube:'立方体',tube:'管子',
  all:'全部',ball:'球',call:'叫',fall:'落下',tall:'高',small:'小',wall:'墙',
  day:'天',play:'玩',say:'说',way:'路',may:'可以',lay:'放',
  go:'去',no:'不',so:'所以',go:'去',
  book:'书',look:'看',cook:'煮',hook:'钩',
  good:'好',foot:'脚',wood:'木头',
  blue:'蓝色',glue:'胶水',clue:'线索',
  rain:'雨',train:'火车',main:'主要的',pain:'疼痛',
  boat:'船',coat:'外套',goat:'山羊',float:'浮',
  house:'房子',mouse:'老鼠',mouth:'嘴',
}

const EMOJI = {
  cat:'🐱',bat:'🦇',hat:'🎩',mat:'🟫',rat:'🐀',dog:'🐶',pig:'🐷',sun:'☀️',
  pen:'🖊️',bed:'🛏️',book:'📖',tree:'🌳',cake:'🍰',ball:'⚽',car:'🚗',
  king:'👑',queen:'👑',fish:'🐟',bird:'🐦',star:'⭐',flower:'🌸',
  apple:'🍎',egg:'🥚',milk:'🥛',water:'💧',fire:'🔥',door:'🚪',
  hand:'✋',eye:'👁️',ear:'👂',nose:'👃',mouth:'👄',foot:'🦶',
}

// 词族定义：[尾, 尾音, 锚点, [成员...], 备注, 分组]
const FAMILIES = [
  // 短元音 a
  ['-at','/æt/','cat',['bat','hat','mat','rat','sat'],'短元音 /æt/ 词族','short-a'],
  ['-an','/æn/','man',['can','fan','pan','ran','van'],'短元音 /æn/ 词族','short-a'],
  ['-ap','/æp/','cap',['map','nap','tap','lap'],'短元音 /æp/ 词族','short-a'],
  ['-ag','/æg/','bag',['tag','rag','flag'],'短元音 /æg/ 词族','short-a'],
  ['-ad','/æd/','dad',['mad','sad','pad'],'短元音 /æd/ 词族','short-a'],
  ['-am','/æm/','ham',['jam','ram'],'短元音 /æm/ 词族','short-a'],
  ['-ack','/æk/','back',['pack','sack','black'],'短元音 /æk/ 词族','short-a'],
  ['-and','/ænd/','hand',['land','sand','band'],'短元音 /ænd/ 词族','short-a'],
  ['-ash','/æʃ/','cash',['wash','flash'],'短元音 /æʃ/ 词族','short-a'],
  // 短元音 e
  ['-en','/en/','hen',['pen','ten','men','den'],'短元音 /en/ 词族','short-e'],
  ['-et','/et/','net',['pet','wet','vet','set'],'短元音 /et/ 词族','short-e'],
  ['-ed','/ed/','bed',['red','fed','wed'],'短元音 /ed/ 词族','short-e'],
  ['-eg','/eg/','leg',['egg','peg'],'短元音 /eg/ 词族','short-e'],
  ['-ell','/el/','bell',['sell','tell','well'],'短元音 /el/ 词族','short-e'],
  ['-est','/est/','best',['rest','nest','west'],'短元音 /est/ 词族','short-e'],
  // 短元音 i
  ['-ig','/ɪg/','pig',['big','dig','wig'],'短元音 /ɪg/ 词族','short-i'],
  ['-ip','/ɪp/','lip',['tip','dip','zip'],'短元音 /ɪp/ 词族','short-i'],
  ['-in','/ɪn/','pin',['win','tin','bin'],'短元音 /ɪn/ 词族','short-i'],
  ['-it','/ɪt/','sit',['fit','hit','bit'],'短元音 /ɪt/ 词族','short-i'],
  ['-id','/ɪd/','lid',['kid','rid'],'短元音 /ɪd/ 词族','short-i'],
  ['-ill','/ɪl/','hill',['bill','fill','pill'],'短元音 /ɪl/ 词族','short-i'],
  ['-ick','/ɪk/','kick',['lick','pick','stick'],'短元音 /ɪk/ 词族','short-i'],
  ['-ing','/ɪŋ/','king',['ring','sing','wing'],'短元音 /ɪŋ/ 词族','short-i'],
  // 短元音 o
  ['-og','/ɒg/','dog',['log','fog','hog'],'短元音 /ɒg/ 词族','short-o'],
  ['-op','/ɒp/','top',['cop','hop','mop'],'短元音 /ɒp/ 词族','short-o'],
  ['-ot','/ɒt/','hot',['dot','pot','rot'],'短元音 /ɒt/ 词族','short-o'],
  ['-ox','/ɒks/','box',['fox'],'短元音 /ɒks/ 词族','short-o'],
  ['-ob','/ɒb/','job',['rob','cob'],'短元音 /ɒb/ 词族','short-o'],
  ['-ock','/ɒk/','rock',['lock','sock','clock'],'短元音 /ɒk/ 词族','short-o'],
  ['-od','/ɒd/','pod',['rod'],'短元音 /ɒd/ 词族','short-o'],
  // 短元音 u
  ['-un','/ʌn/','sun',['run','fun','bun','gun'],'短元音 /ʌn/ 词族','short-u'],
  ['-ug','/ʌg/','bug',['rug','mug','hug'],'短元音 /ʌg/ 词族','short-u'],
  ['-ut','/ʌt/','cut',['nut','hut'],'短元音 /ʌt/ 词族','short-u'],
  ['-ub','/ʌb/','tub',['cub','sub'],'短元音 /ʌb/ 词族','short-u'],
  ['-um','/ʌm/','hum',['gum'],'短元音 /ʌm/ 词族','short-u'],
  ['-uck','/ʌk/','duck',['luck','truck'],'短元音 /ʌk/ 词族','short-u'],
  ['-ump','/ʌmp/','jump',['bump','pump'],'短元音 /ʌmp/ 词族','short-u'],
  // 长元音 a (magic e)
  ['-ake','/eɪk/','cake',['bake','lake','wake'],'长元音 /eɪk/ 词族','long-a'],
  ['-ate','/eɪt/','gate',['late','date','plate'],'长元音 /eɪt/ 词族','long-a'],
  ['-ame','/eɪm/','game',['name','fame','came'],'长元音 /eɪm/ 词族','long-a'],
  ['-ane','/eɪn/','cane',['plane','crane'],'长元音 /eɪn/ 词族','long-a'],
  ['-ace','/eɪs/','face',['race','space'],'长元音 /eɪs/ 词族','long-a'],
  ['-ale','/eɪl/','sale',['tale','pale'],'长元音 /eɪl/ 词族','long-a'],
  ['-ape','/eɪp/','tape',['cape','grape'],'长元音 /eɪp/ 词族','long-a'],
  // 长元音 e
  ['-ee','/iː/','see',['bee','tree','three'],'长元音 /iː/ 词族','long-e'],
  ['-eep','/iːp/','deep',['sheep','sleep','keep','jeep'],'长元音 /iːp/ 词族','long-e'],
  ['-eet','/iːt/','feet',['meet','street','sweet'],'长元音 /iːt/ 词族','long-e'],
  ['-eel','/iːl/','feel',['peel','wheel'],'长元音 /iːl/ 词族','long-e'],
  ['-eak','/iːk/','speak',['peak','weak'],'长元音 /iːk/ 词族','long-e'],
  ['-eam','/iːm/','dream',['cream','team'],'长元音 /iːm/ 词族','long-e'],
  // 长元音 i (magic e)
  ['-ike','/aɪk/','bike',['like','pike'],'长元音 /aɪk/ 词族','long-i'],
  ['-ime','/aɪm/','time',['lime','dime'],'长元音 /aɪm/ 词族','long-i'],
  ['-ine','/aɪn/','line',['fine','wine','pine'],'长元音 /aɪn/ 词族','long-i'],
  ['-ide','/aɪd/','ride',['side','wide'],'长元音 /aɪd/ 词族','long-i'],
  ['-ice','/aɪs/','rice',['nice','ice'],'长元音 /aɪs/ 词族','long-i'],
  // 长元音 o (magic e)
  ['-oke','/əʊk/','joke',['coke','poke'],'长元音 /əʊk/ 词族','long-o'],
  ['-ote','/əʊt/','note',['vote'],'长元音 /əʊt/ 词族','long-o'],
  ['-ole','/əʊl/','hole',['role','pole'],'长元音 /əʊl/ 词族','long-o'],
  ['-one','/əʊn/','bone',['cone','stone'],'长元音 /əʊn/ 词族','long-o'],
  ['-ope','/əʊp/','hope',['rope','cope'],'长元音 /əʊp/ 词族','long-o'],
  // 长元音 u (magic e)
  ['-ute','/juːt/','cute',['flute'],'长元音 /juːt/ 词族','long-u'],
  ['-une','/juːn/','tune',['june'],'长元音 /juːn/ 词族','long-u'],
  ['-ube','/juːb/','cube',['tube'],'长元音 /juːb/ 词族','long-u'],
  // 常见组合
  ['-all','/ɔːl/','ball',['call','fall','tall','small','wall'],'组合 /ɔːl/ 词族','blend'],
  ['-ay','/eɪ/','day',['play','say','way','may','lay'],'组合 /eɪ/ 词族','blend'],
  ['-ook','/ʊk/','book',['look','cook','hook'],'组合 /ʊk/ 词族','blend'],
  ['-ood','/ʊd/','good',['foot','wood'],'组合 /ʊd/ 词族','blend'],
  ['-ue','/uː/','blue',['glue','clue'],'组合 /uː/ 词族','blend'],
  ['-ain','/eɪn/','rain',['train','main','pain'],'组合 /eɪn/ 词族','blend'],
  ['-oat','/əʊt/','boat',['coat','goat','float'],'组合 /əʊt/ 词族','blend'],
  ['-ouse','/aʊs/','house',['mouse','mouth'],'组合 /aʊs/ 词族','blend'],
]

function ipaOf(word, suffixSound) {
  const first = word[0].toLowerCase()
  const c = (CONS[first] || '/?/').replace(/\//g, '')
  const s = suffixSound.replace(/\//g, '')
  return '/' + c + s + '/'
}
function emojiOf(word) { return EMOJI[word] || '📘' }
function cnOf(word) { return CN[word] || '（释义待补）' }
function exampleOf(word, cn) {
  // 通用且不会犯语法错误的背面参考：单词 — 释义
  return `“${word}” — ${cn}`
}

const out = FAMILIES.map(([phonics, sound, anchorWord, members, note, group], i) => {
  const anchor = {
    word: anchorWord,
    ipa: ipaOf(anchorWord, sound),
    cn: cnOf(anchorWord),
    image: emojiOf(anchorWord),
    example: exampleOf(anchorWord),
  }
  const mem = members.map(w => ({
    word: w,
    ipa: ipaOf(w, sound),
    cn: cnOf(w),
    image: emojiOf(w),
    example: exampleOf(w),
  }))
  return {
    id: 'wf-' + String(i + 1).padStart(3, '0'),
    phonics,
    sound,
    level: 'L0',
    group,
    anchor,
    members: mem,
    note,
  }
})

const json = JSON.stringify(out, null, 2) + '\n'
writeFileSync('data/wordfamilies/l0-phonics.json', json)
console.log(`生成 ${out.length} 个词族，共 ${out.reduce((n,f)=>n+f.members.length+1,0)} 词`)
