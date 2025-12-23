// app.js
const DATA = {
  "과학": [
    {
      id:"photosynthesis",
      name:"광합성",
      gold:"광합성이란 식물이 빛 에너지를 이용하여 이산화탄소와 물로부터 포도당을 합성하고, 그 과정에서 산소를 방출하는 생화학적 과정이다.",
      exampleAnswer:"식물이 산소를 흡수해서 에너지를 만드는 과정이다."
    },
    {
      id:"density",
      name:"밀도",
      gold:"밀도는 물질의 단위 부피당 질량을 의미하며, 같은 부피라면 질량이 클수록 밀도가 크다.",
      exampleAnswer:"밀도는 무게가 무거운 물질일수록 항상 큰 값이다."
    },
    {
      id:"newton2",
      name:"뉴턴의 제2법칙",
      gold:"뉴턴의 제2법칙은 물체에 작용하는 알짜힘이 0이 아니면 물체는 가속도 운동을 하며, 가속도의 크기는 알짜힘에 비례하고 질량에 반비례한다(F=ma).",
      exampleAnswer:"힘이 작용하면 물체는 항상 같은 속도로 움직인다."
    }
  ],
  "수학": [
    {
      id:"linear",
      name:"일차함수",
      gold:"일차함수는 y=ax+b 형태로 나타낼 수 있으며, a는 기울기, b는 y절편을 의미한다.",
      exampleAnswer:"일차함수는 그래프가 항상 곡선인 함수다."
    },
    {
      id:"prob",
      name:"확률",
      gold:"확률은 어떤 사건이 일어날 가능성을 0과 1 사이의 수로 나타낸 것이며, 경우의 수를 이용해 계산할 수 있다.",
      exampleAnswer:"확률은 결과가 많을수록 항상 커진다."
    }
  ],
  "사회": [
    {
      id:"democracy",
      name:"민주주의",
      gold:"민주주의는 국민이 주권을 가지며, 선거·참여·권력 분립 등을 통해 권력이 국민의 의사에 따라 운영되는 정치 체제이다.",
      exampleAnswer:"민주주의는 다수결만 있으면 완성되는 제도다."
    }
  ]
};

// 공유 상태 저장 키
const STATE_KEY = "conceptcheck_state_v1";
const HISTORY_KEY = "conceptcheck_history_v1";

export function loadState(){
  try{
    const raw = localStorage.getItem(STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  }catch{ return null; }
}
export function saveState(state){
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}
export function clearState(){
  localStorage.removeItem(STATE_KEY);
}

export function loadHistory(){
  try{
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  }catch{ return []; }
}
export function saveHistory(items){
  localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
}

export function nowStamp(){
  const d = new Date();
  const pad = (n)=> String(n).padStart(2,"0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function levelLabel(lv){
  return lv==="elementary"?"초등": lv==="middle"?"중등":"고등";
}

export function safeJson(obj){
  return JSON.stringify(obj, null, 2);
}

export function escapeHtml(str){
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

// ✅ Demo 모드: "정답(유사키워드 충분)만 정답 처리, 나머지 전부 오답"
export function demoDiagnose(conceptName, gold, answer){
  const a = (answer || "").toLowerCase();
  const g = (gold || "").toLowerCase();
  const trimmed = (answer || "").trim();

  // 0) 모름/회피/비관련 답변 즉시 오답 처리
  const dontKnowPatterns = [
    "몰라", "모르", "모르겠", "잘 모르", "잘모르", "모르겠어", "모르겠습니다", "모름",
    "idk", "unknown", "no idea",
    "니가", "네가", "너가", "설명해봐", "설명해봐라", "설명해줘", "설명해 주세요",
    "해줘", "해봐", "해봐라", "해봐요", "해보세요",
    "알려줘", "알려 주세요", "가르쳐줘", "가르쳐 주세요",
    "말해줘", "말해 주세요",
    "뭐야?", "뭔데", "뭐냐", "뭐임", "뭔가요"
  ];
  const isDontKnow =
    trimmed.length === 0 ||
    trimmed.length < 4 ||
    dontKnowPatterns.some(p => a.includes(p));

  if (isDontKnow) {
    return {
      student_summary: "학습자가 개념을 아직 설명하기 어려워하거나, 올바른 답변을 작성하지 않았어요.",
      understanding_level: "low",
      is_correct: false,
      misconceptions: [{
        type: "missing_info",
        issue: "개념의 정의/핵심 요소가 답변에 거의 포함되지 않았어요(무응답/회피 포함).",
        evidence: `답변: "${trimmed || "(빈 답변)"}"`
      }],
      feedback:
        "괜찮아요. 지금 답변은 개념 설명으로 보기 어려워요.\n" +
        "기준 설명에서 핵심 키워드(재료/조건/결과)를 표시한 뒤,\n" +
        "그 키워드 2~3개를 포함해서 1~2문장으로 다시 써보세요.",
      correct_explanation: (gold || "").trim(),
      next_questions: [
        "기준 설명에서 '재료(무엇을 사용하나)'는 무엇인가요?",
        "이 과정의 '결과물(무엇이 만들어지고 무엇이 나오는가)'은 무엇인가요?",
        "핵심 키워드 2~3개를 포함해 1문장으로 다시 설명해보세요."
      ],
      study_tips: [
        "정의를 '재료 → 과정/조건 → 결과' 순서로 바꿔 말해보면 이해가 쉬워요.",
        "헷갈리는 단어(흡수/방출 등)는 흐름(입력→출력)으로 정리해보세요."
      ]
    };
  }

  // 1) 공통 유사도(키워드 겹침) 기반 정답/오답 판정
  const stop = new Set([
    "이다","하는","하고","에서","으로","부터","과정","의미","통해","등","및","때","것","수",
    "를","을","은","는","이","가","에","와","과","로","도","만","좀","더","요","다","해","줘"
  ]);
  const tokenize = (s) =>
    (s || "")
      .split(/[^가-힣a-z0-9]+/i)
      .map(w => w.trim())
      .filter(w => w && w.length >= 2 && !stop.has(w));

  const goldWords = tokenize(g);
  const ansWords  = tokenize(a);

  const goldUnique = [...new Set(goldWords)];
  const ansSet = new Set(ansWords);

  const TOP_N = 14;
  const goldTop = goldUnique.slice(0, TOP_N);

  const overlapCount = goldTop.filter(w => ansSet.has(w)).length;
  const overlapRatio = goldTop.length ? overlapCount / goldTop.length : 0;

  const PASS_COUNT = 3;
  const PASS_RATIO = 0.28;
  const passesSimilarity = (overlapCount >= PASS_COUNT) || (overlapRatio >= PASS_RATIO);

  // 2) 개념별 오개념 규칙(오답 사유 강화)
  let misconceptions = [];

  if(conceptName.includes("광합성")){
    if(a.includes("산소") && (a.includes("흡수") || a.includes("들이마") || a.includes("마신"))){
      misconceptions.push({
        type:"concept_confusion",
        issue:"광합성에서 산소의 역할을 혼동하고 있어요(흡수 vs 방출).",
        evidence:"답변에서 '산소를 흡수'라고 표현했어요."
      });
    }
    if(a.includes("에너지") && (a.includes("만들") || a.includes("생성"))){
      misconceptions.push({
        type:"partial_understanding",
        issue:"에너지와 생성물(포도당) 관계가 모호하게 설명됐어요.",
        evidence:"'에너지를 만드는/생성'처럼 표현했어요."
      });
    }
  } else if(conceptName.includes("민주주의")){
    if(a.includes("다수결") && (a.includes("만") || a.includes("이면") || a.includes("끝"))){
      misconceptions.push({
        type:"missing_info",
        issue:"민주주의는 다수결 외에도 기본권, 참여, 권력분립 등이 함께 필요해요.",
        evidence:"답변에서 다수결만으로 충분하다고 말했어요."
      });
    }
  } else if(conceptName.includes("밀도")){
    if(a.includes("항상") || a.includes("무조건") || a.includes("무조건적")){
      misconceptions.push({
        type:"wrong_causality",
        issue:"밀도는 '무거움'만으로 결정되지 않고 질량/부피 비율이에요.",
        evidence:"'항상/무조건' 같은 단정 표현이 있어요."
      });
    }
  }

  // 3) 최종 정답 판정
  let isCorrect = passesSimilarity;
  if (misconceptions.length > 0) isCorrect = false;

  let understanding_level;
  if (isCorrect) understanding_level = "high";
  else if (!passesSimilarity) understanding_level = "low";
  else understanding_level = "medium";

  if (!isCorrect && misconceptions.length === 0) {
    misconceptions.push({
      type: "missing_info",
      issue: "기준 설명의 핵심 요소(정의/재료/조건/결과)가 충분히 포함되지 않았어요.",
      evidence: `겹친 키워드 수: ${overlapCount}/${goldTop.length} (비율 ${(overlapRatio*100).toFixed(0)}%)`
    });
  }

  const student_summary =
    isCorrect
      ? "학습자는 핵심 개념을 비교적 정확하게 이해하고 있어요."
      : "학습자가 개념을 아직 설명하기 어려워하거나, 올바른 답변을 작성하지 않았어요.";

  const correct_explanation = (gold || "").trim();

  const feedback = isCorrect
    ? "좋아요! 기준 설명의 핵심 요소가 답변에 잘 반영되어 있어요. 이제 예시를 하나 들어 설명해보면 이해가 더 단단해집니다."
    : [
        "아직 기준 설명의 핵심 요소가 충분히 반영되지 않았어요.",
        ...misconceptions.map((m,i)=>`${i+1}) ${m.issue}`),
        "",
        "아래의 '올바른 개념 설명'을 읽고, 핵심 키워드 2~3개를 포함해서 1~2문장으로 다시 작성해보세요."
      ].join("\n");

  const next_questions = isCorrect
    ? [
        "핵심 정의를 예시(상황/문제)와 함께 설명해볼 수 있나요?",
        "이 개념과 헷갈리기 쉬운 개념은 무엇인가요? 차이를 말해보세요."
      ]
    : [
        "기준 설명에서 핵심 키워드 2~3개는 무엇인가요?",
        "그 키워드를 포함해 한 문장으로 다시 설명해보세요.",
        "재료/조건/결과를 나눠서 각각 한 문장으로 정리해보세요."
      ];

  const study_tips = isCorrect
    ? ["개념을 문제 상황에 적용해보며 연습문제 3개를 풀어보는 것을 추천해요."]
    : [
        "정의 문장에서 '재료/조건/결과(또는 구성요소)'를 표시해보세요.",
        "헷갈리는 단어(흡수/방출 등)는 입력→출력 흐름으로 표로 정리해보세요."
      ];

  return {
    student_summary,
    understanding_level,
    is_correct: isCorrect,
    misconceptions,
    feedback,
    correct_explanation,
    next_questions,
    study_tips
  };
}

export function getConcept(subject, conceptId){
  const arr = DATA[subject] || [];
  return arr.find(c => c.id === conceptId) || null;
}
export function subjects(){
  return Object.keys(DATA);
}
export function conceptsOf(subject){
  return DATA[subject] || [];
}
