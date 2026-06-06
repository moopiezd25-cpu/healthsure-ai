import { useState, useMemo } from 'react'
import { MEDICATION_OPTIONS, BUDGET_PRESETS } from './data/mockData'
import { runAnalysis } from './utils/analyze'
import './App.css'

const HEALTH_STEP_LABELS = ['基础信息', '健康状况', '保障需求']

const ADVICE_PATHS = [
  {
    id: 'standard',
    title: '标准健康险投保路径',
    tag: '优先推荐',
    subtitle: '适合标准健康体，优先匹配百万医疗险与重疾险',
    products: ['百万医疗险', '重疾险'],
    points: [
      '综合风险较低，符合标准体预核保方向。',
      '无长期用药或重大既往症，线上智能核保通过概率较高。',
    ],
  },
  {
    id: 'manual',
    title: '人工核保确认路径',
    tag: '条件触发',
    subtitle: '如存在体检异常、既往症或住院史，则进入人工核保',
    products: ['医疗险续保', '重疾险加费/除外'],
    points: [
      '若后续补充异常健康信息，建议提交材料进行人工核保。',
      '人工核保可进一步确认除外、加费或标准承保条件。',
    ],
  },
  {
    id: 'lowbarrier',
    title: '低门槛保障补充路径',
    tag: '可选补充',
    subtitle: '适合作为基础保障补充，不作为首选路径',
    products: ['惠民保', '意外险', '住院津贴险'],
    points: [
      '可作为预算有限或保障缺口场景下的补充方案。',
      '具体责任需关注免赔额、报销比例和既往症限制。',
    ],
  },
]

const GENDER_OPTIONS = [
  { value: 'male', label: '男' },
  { value: 'female', label: '女' },
]

const BASIC_INSURANCE_OPTIONS = [
  { value: 'yes', label: '有职工/居民医保' },
  { value: 'no', label: '暂无基本医保' },
]

const OCCUPATION_OPTIONS = [
  { value: 'office', label: '办公室文职' },
  { value: 'professional', label: '专业技术' },
  { value: 'service', label: '服务行业' },
  { value: 'manual', label: '体力劳动/外勤' },
]

const HEALTH_STATUS_OPTIONS = [
  { value: 'excellent', label: '良好', desc: '无明确慢性病，近期体检无重大异常' },
  { value: 'fair', label: '轻微异常', desc: '结节、指标偏高等需随访情况' },
  { value: 'chronic', label: '慢性病管理中', desc: '高血压、糖尿病等需长期管理' },
  { value: 'major', label: '有重大既往病史', desc: '肿瘤史、心脑血管等重大病史' },
]

const DISEASE_OPTIONS = [
  { value: 'hypertension', label: '高血压' },
  { value: 'diabetes', label: '糖尿病' },
  { value: 'thyroid', label: '甲状腺结节' },
  { value: 'breast', label: '乳腺结节' },
  { value: 'hepatitis', label: '乙肝' },
  { value: 'tumor', label: '肿瘤史' },
  { value: 'cardio', label: '心脑血管疾病' },
  { value: 'other', label: '其他' },
]

const RECENT_MEDICAL_OPTIONS = [
  { value: 'none', label: '均无' },
  { value: 'hospital', label: '近两年有住院' },
  { value: 'surgery', label: '近两年有手术' },
  { value: 'abnormal', label: '近两年体检异常' },
]

const DISEASE_CONTROL_OPTIONS = [
  { value: 'stable', label: '稳定' },
  { value: 'fair', label: '一般' },
  { value: 'unstable', label: '不稳定' },
  { value: 'unknown', label: '不确定' },
]

const COVERAGE_FOCUS_OPTIONS = [
  { value: 'hospitalization', label: '住院医疗' },
  { value: 'critical', label: '重大疾病' },
  { value: 'outpatient', label: '门诊报销' },
  { value: 'cancer', label: '特药保障' },
  { value: 'accident', label: '意外医疗' },
]

const ADVICE_FOCUS_OPTIONS = [
  { value: 'insure', label: '能否投保' },
  { value: 'product', label: '适合哪类产品' },
  { value: 'claim', label: '未来理赔风险' },
  { value: 'manual', label: '是否需要人工核保' },
]

const ADVISOR_OPTIONS = [
  { value: 'no', label: '暂不需要' },
  { value: 'yes', label: '需要进一步咨询' },
]

const HEALTH_DEMO_CASES = [
  {
    id: 'standard',
    label: '标准体用户',
    profile: {
      age: 28,
      gender: 'male',
      hasBasicInsurance: 'yes',
      occupation: 'office',
      city: '上海',
      healthStatus: 'excellent',
      diagnosedDiseases: [],
      medication: 'none',
      recentMedical: 'none',
      diseaseControl: 'stable',
      coverageNeeds: ['hospitalization', 'critical', 'accident'],
      budget: 500,
      adviceFocus: ['insure', 'product'],
      needAdvisor: 'no',
    },
  },
  {
    id: 'mild',
    label: '轻度异常体',
    profile: {
      age: 45,
      gender: 'female',
      hasBasicInsurance: 'yes',
      occupation: 'professional',
      city: '杭州',
      healthStatus: 'fair',
      diagnosedDiseases: ['thyroid'],
      medication: 'occasional',
      recentMedical: 'abnormal',
      diseaseControl: 'fair',
      coverageNeeds: ['hospitalization', 'critical', 'outpatient'],
      budget: 800,
      adviceFocus: ['product', 'manual'],
      needAdvisor: 'no',
    },
  },
  {
    id: 'high-risk',
    label: '高风险带病体',
    profile: {
      age: 62,
      gender: 'male',
      hasBasicInsurance: 'yes',
      occupation: 'manual',
      city: '',
      healthStatus: 'major',
      diagnosedDiseases: ['hypertension', 'diabetes', 'cardio'],
      medication: 'multiple',
      recentMedical: 'hospital',
      diseaseControl: 'unstable',
      coverageNeeds: ['hospitalization', 'cancer'],
      budget: 1200,
      adviceFocus: ['insure', 'claim', 'manual'],
      needAdvisor: 'yes',
    },
  },
]

const DEFAULT_PROFILE = HEALTH_DEMO_CASES[0].profile

const SENSITIVE_DISPLAY_ITEMS = [
  {
    id: 'age',
    title: '年龄与费率敏感',
    desc: '年龄越高，保费上升且核保规则更严格',
    show: (p) => p.age >= 40,
  },
  {
    id: 'chronic',
    title: '慢性病健康告知',
    desc: '需核实疾病类型、病程和控制情况',
    show: (p) =>
      ['fair', 'chronic', 'major'].includes(p.healthStatus) ||
      (p.diagnosedDiseases?.length ?? 0) > 0,
  },
  {
    id: 'medication',
    title: '长期用药记录',
    desc: '可能触发人工核保或进一步材料补充',
    show: (p) => p.medication === 'regular' || p.medication === 'multiple',
  },
  {
    id: 'complication',
    title: '并发症风险核查',
    desc: '需关注是否存在心脑血管、肾脏等并发症',
    show: (p) =>
      ['chronic', 'major'].includes(p.healthStatus) ||
      p.diagnosedDiseases?.some((d) =>
        ['hypertension', 'diabetes', 'cardio', 'tumor'].includes(d),
      ),
  },
  {
    id: 'preexisting',
    title: '既往症理赔限制',
    desc: '相关既往症可能影响未来赔付范围',
    show: (p) =>
      (p.diagnosedDiseases?.length ?? 0) > 0 ||
      p.healthStatus === 'major' ||
      p.recentMedical === 'hospital' ||
      p.recentMedical === 'surgery',
  },
]

function pickLabel(options, value) {
  return options.find((o) => o.value === value)?.label ?? '—'
}

function formatUwAdvice(status) {
  if (status === 'pass') {
    return '当前画像较接近标准体评估区间，可优先考虑常规百万医疗或重疾类产品路径，具体以保险公司核保为准。'
  }
  if (status === 'conditional') {
    return '部分标准产品可能存在加费、除外或限额承保，建议结合智能核保或人工核保进一步确认承保条件。'
  }
  return '标准健康险投保可能受限，建议优先人工核保或匹配健康告知相对宽松的低门槛保障产品。'
}

function buildDisplayRiskTags(profile) {
  const tags = []
  if (profile.age >= 55) tags.push('高龄关注')
  if (['chronic', 'major'].includes(profile.healthStatus)) tags.push('慢病管理')
  if (profile.medication && profile.medication !== 'none') tags.push('长期用药')
  if (profile.budget >= 800) tags.push('预算充足')
  else if (profile.budget <= 300) tags.push('预算有限')
  if (profile.coverageNeeds?.includes('hospitalization')) tags.push('住院医疗需求')
  if (profile.coverageNeeds?.includes('critical')) tags.push('重大疾病需求')
  return tags.length ? tags : ['保障需求待细化']
}

function buildSensitiveDisplay(profile) {
  const matched = SENSITIVE_DISPLAY_ITEMS.filter((item) => item.show(profile))
  if (matched.length >= 3) return matched.slice(0, 5)
  const fallback = SENSITIVE_DISPLAY_ITEMS.filter((item) => !matched.includes(item))
  return [...matched, ...fallback].slice(0, Math.max(3, matched.length))
}

function buildProfileSummary(profile) {
  const diseases = (profile.diagnosedDiseases || [])
    .map((d) => pickLabel(DISEASE_OPTIONS, d))
    .join('、')
  const coverage = (profile.coverageNeeds || [])
    .map((c) => pickLabel(COVERAGE_FOCUS_OPTIONS, c))
    .join('、')

  return [
    { label: '年龄', value: `${profile.age} 岁` },
    { label: '性别', value: pickLabel(GENDER_OPTIONS, profile.gender) },
    {
      label: '健康状态',
      value: pickLabel(HEALTH_STATUS_OPTIONS, profile.healthStatus),
    },
    { label: '疾病/既往病史', value: diseases || '未填报明确疾病' },
    { label: '用药情况', value: pickLabel(MEDICATION_OPTIONS, profile.medication) },
    {
      label: '疾病控制情况',
      value: pickLabel(DISEASE_CONTROL_OPTIONS, profile.diseaseControl),
    },
    { label: '保障需求', value: coverage || '—' },
    {
      label: '预算',
      value: pickLabel(BUDGET_PRESETS, profile.budget) || `${profile.budget} 元/月`,
    },
  ]
}

function buildAnalysisNarrative(profile, riskLevel, uwStatus) {
  const health = pickLabel(HEALTH_STATUS_OPTIONS, profile.healthStatus)
  const med = pickLabel(MEDICATION_OPTIONS, profile.medication)
  const parts = [
    `综合年龄 ${profile.age} 岁、健康状态「${health}」及用药情况「${med}」等要素，系统评估为${riskLevel.label}。`,
    formatUwAdvice(uwStatus),
    '上述结论用于辅助理解可投保方向与材料准备重点，最终以保险公司核保意见及保险合同条款为准。',
  ]
  return parts.join('')
}

function getAdvicePrimaryPath(uwStatus) {
  if (uwStatus === 'pass') return 'standard'
  if (uwStatus === 'conditional') return 'manual'
  return 'lowbarrier'
}

function buildAdviceSummaryText(profile, uwStatus) {
  const base =
    'AI 根据用户年龄、健康状况、用药记录、保障需求和预算进行预核保路径分流。'
  if (uwStatus === 'pass') {
    return `${base}当前用户画像接近标准健康体，优先推荐标准百万医疗险与重疾险；若后续补充既往症、体检异常或住院史，则建议进入人工核保确认。`
  }
  if (uwStatus === 'conditional') {
    return `${base}当前用户存在亚健康指标或用药记录，标准体路径可能受限，建议同步准备人工核保材料，并可将低门槛保障作为补充方案。`
  }
  return `${base}当前用户健康风险偏高，标准健康险路径可行性较低，建议优先人工核保确认或匹配低门槛保障产品，具体以保险公司审核为准。`
}

function buildJudgmentBasis(profile) {
  const items = []
  if (profile.age < 40) {
    items.push('年龄处于费率友好区间，适合优先配置长期保障。')
  } else if (profile.age >= 55) {
    items.push('年龄偏高，费率与核保规则趋严，建议优先建立医疗保障并审慎配置重疾责任。')
  } else {
    items.push('年龄处于可配置窗口期，建议以医疗费用补偿为主、重疾收入补偿为辅。')
  }

  if (profile.healthStatus === 'excellent' || profile.healthStatus === 'good') {
    items.push('健康状况良好，标准体通过概率相对较高。')
  } else if (profile.healthStatus === 'fair') {
    items.push('存在轻微健康异常，建议关注告知完整性与人工核保可行性。')
  } else {
    items.push('存在慢病或重大既往史，核保阶段需重点核实疾病控制与并发症风险。')
  }

  if (profile.medication === 'none') {
    items.push('无长期用药记录，有利于降低核保复杂度。')
  } else {
    items.push('存在用药记录，建议与健康告知一致并备齐病历、处方等材料。')
  }

  const needCount = profile.coverageNeeds?.length ?? 0
  items.push(
    `已选择 ${needCount} 项保障需求，系统将按「医疗费用补偿优先、重疾收入补偿补充」的逻辑匹配产品类型。`,
  )
  items.push('本结果为 AI 预核保辅助建议，不构成最终承保结论。')
  return items
}

const PAGES = [
  { id: 'home', label: '首页', step: 0 },
  { id: 'health', label: '智能健康问答', step: 1 },
  { id: 'analysis', label: '健康风险画像', step: 2 },
  { id: 'advice', label: 'AI 预核保建议', step: 3 },
  { id: 'products', label: '保障方案匹配', step: 4 },
]

const PLAN_PRODUCT_TYPES = [
  {
    id: 'medical',
    name: '百万医疗险',
    defaultTag: '补充配置',
    desc: '用于覆盖住院和大额医疗费用，适合健康状况较好或可通过智能核保的用户。',
    concerns: ['健康告知', '免赔额', '医院范围', '续保条件', '既往症限制'],
  },
  {
    id: 'critical',
    name: '重疾险',
    defaultTag: '补充配置',
    desc: '用于补充重大疾病后的收入损失、康复费用和家庭开支。',
    concerns: ['保额是否足够', '等待期', '疾病定义', '健康告知严格程度'],
  },
  {
    id: 'huimin',
    name: '城市惠民保',
    defaultTag: '低门槛补充',
    desc: '适合慢病人群、年龄较高或标准商业健康险投保受限用户。',
    concerns: ['免赔额较高', '报销比例有限', '既往症赔付规则', '地区限制'],
  },
  {
    id: 'special-drug',
    name: '特药保障',
    defaultTag: '可选补充',
    desc: '适合关注肿瘤特药、创新药和高额药品费用风险的人群。',
    concerns: ['药品目录', '适用疾病范围', '院外购药规则', '是否与医疗险重复'],
  },
]

const CLAIM_RISK_POINTS = [
  '等待期内发生疾病，通常不属于赔付范围',
  '投保前已存在的疾病，可能受到既往症限制',
  '未如实健康告知，可能影响未来理赔',
  '医院等级、费用类型、免赔额和报销比例会影响实际赔付',
  '惠民保和特药险虽然投保门槛较低，但保障范围和赔付比例通常有限',
]

function buildMatchConclusion(riskLevel, uwStatus) {
  if (riskLevel.level === 'low' || uwStatus === 'pass') {
    return {
      path: '标准健康险组合',
      reason: '综合风险较低，健康告知压力相对可控，适合优先走标准体保障路径。',
      limits: '若后续补充体检异常、住院史或既往症，需重新健康告知并可能调整承保条件。',
      summary:
        '当前用户健康风险较低，适合优先配置标准百万医疗险，并根据预算补充重疾险。若后续出现体检异常或既往症信息，应重新进行健康告知与核保确认。',
    }
  }
  if (riskLevel.level === 'medium' || uwStatus === 'conditional') {
    return {
      path: '智能核保 + 补充保障组合',
      reason: '存在亚健康指标或用药记录，标准体路径可能受限，需结合智能核保与补充产品。',
      limits: '人工核保可能产生加费、除外责任；低门槛产品保障深度通常有限。',
      summary:
        '当前用户属于轻度异常体画像，建议优先选择支持智能核保的百万医疗险路径，并同步评估惠民保等补充方案。最终以保险公司核保审核为准。',
    }
  }
  return {
    path: '低门槛保障优先方案',
    reason: '健康风险偏高或带病体特征明显，标准商业健康险可行性较低。',
    limits: '标准百万医疗与重疾险可能投保受限，需重点关注保障范围、既往症与赔付比例。',
    summary:
      '当前用户更适合优先比较惠民保、特药保障与慢病友好型产品，不建议仅关注标准百万医疗险。建议准备完整病历材料并咨询人工顾问。',
  }
}

function getMedicalTag(riskLevel) {
  if (riskLevel.level === 'low') return '优先推荐'
  if (riskLevel.level === 'medium') return '条件推荐'
  return '投保受限'
}

function buildNextStepAdvice(riskLevel) {
  if (riskLevel.level === 'low') {
    return '建议优先查看标准百万医疗险，并根据预算考虑补充重疾险。'
  }
  if (riskLevel.level === 'medium') {
    return '建议选择支持智能核保的产品，并准备近期体检报告、诊断记录或用药情况。'
  }
  return '建议优先比较当地惠民保、特药险和慢病友好型保障产品，不建议只关注标准百万医疗险。'
}

function getPlanProductTag(productId, riskLevel) {
  if (productId === 'medical') return getMedicalTag(riskLevel)
  return PLAN_PRODUCT_TYPES.find((p) => p.id === productId)?.defaultTag ?? '可选补充'
}

const HOME_FEATURES = [
  { num: '01', title: '智能健康问答', desc: '采集年龄、病史、用药与保障需求' },
  { num: '02', title: '健康风险画像', desc: '识别风险等级与核保敏感项' },
  { num: '03', title: 'AI 预核保建议', desc: '输出承保路径与判断依据' },
  { num: '04', title: '保障方案匹配', desc: '推荐产品类型与理赔风险提示' },
]

function App() {
  const [page, setPage] = useState('home')
  const [profile, setProfile] = useState({
    ...DEFAULT_PROFILE,
    coverageNeeds: [...DEFAULT_PROFILE.coverageNeeds],
    diagnosedDiseases: [...DEFAULT_PROFILE.diagnosedDiseases],
    adviceFocus: [...DEFAULT_PROFILE.adviceFocus],
  })
  const [activeCaseId, setActiveCaseId] = useState(null)
  const [healthStep, setHealthStep] = useState(1)
  const [caseMenuOpen, setCaseMenuOpen] = useState(false)
  const [planFeedback, setPlanFeedback] = useState(null)
  const current = PAGES.find((p) => p.id === page) ?? PAGES[0]
  const stepIndex = PAGES.findIndex((p) => p.id === page)

  const applyCase = (caseItem) => {
    const p = caseItem.profile
    setProfile({
      ...p,
      coverageNeeds: [...p.coverageNeeds],
      diagnosedDiseases: [...(p.diagnosedDiseases || [])],
      adviceFocus: [...(p.adviceFocus || [])],
    })
    setActiveCaseId(caseItem.id)
    setCaseMenuOpen(false)
  }

  const updateProfile = (patch) => {
    setActiveCaseId(null)
    setProfile((prev) => ({ ...prev, ...patch }))
  }

  const toggleCoverage = (value) => {
    setActiveCaseId(null)
    setProfile((prev) => {
      const needs = prev.coverageNeeds
      const next = needs.includes(value)
        ? needs.filter((n) => n !== value)
        : [...needs, value]
      return { ...prev, coverageNeeds: next }
    })
  }

  const toggleDisease = (value) => {
    setActiveCaseId(null)
    setProfile((prev) => {
      const list = prev.diagnosedDiseases || []
      const next = list.includes(value)
        ? list.filter((d) => d !== value)
        : [...list, value]
      return { ...prev, diagnosedDiseases: next }
    })
  }

  const toggleAdviceFocus = (value) => {
    setActiveCaseId(null)
    setProfile((prev) => {
      const list = prev.adviceFocus || []
      const next = list.includes(value)
        ? list.filter((v) => v !== value)
        : [...list, value]
      return { ...prev, adviceFocus: next }
    })
  }

  const canHealthStep1 =
    profile.age >= 18 && profile.age <= 75 && profile.gender && profile.hasBasicInsurance && profile.occupation

  const canHealthStep2 =
    profile.healthStatus && profile.medication && profile.recentMedical && profile.diseaseControl

  const canSubmitHealth =
    profile.coverageNeeds.length > 0 &&
    profile.budget &&
    (profile.adviceFocus?.length ?? 0) > 0 &&
    profile.needAdvisor

  const analysisProfile = useMemo(
    () => ({
      ...profile,
      healthStatus: profile.healthStatus === 'major' ? 'chronic' : profile.healthStatus,
    }),
    [profile],
  )

  const analysisResult = useMemo(() => runAnalysis(analysisProfile), [analysisProfile])

  const handleHeaderBack = () => {
    if (page === 'health' && healthStep > 1) {
      setHealthStep((s) => s - 1)
      return
    }
    setPage(PAGES[Math.max(0, stepIndex - 1)].id)
  }

  const { analysisView } = analysisResult

  const insurabilityScore = Math.min(
    10,
    Math.max(1, Math.round(analysisView.riskLevel.score / 10)),
  )
  const uwStatus = analysisView.underwriting.status
  const displayRiskTags = buildDisplayRiskTags(profile)
  const displaySensitive = buildSensitiveDisplay(profile)
  const profileSummary = buildProfileSummary(profile)
  const analysisNarrative = buildAnalysisNarrative(
    profile,
    analysisView.riskLevel,
    uwStatus,
  )
  const advicePrimaryPath = getAdvicePrimaryPath(uwStatus)
  const adviceSummaryText = buildAdviceSummaryText(profile, uwStatus)
  const judgmentBasis = buildJudgmentBasis(profile)
  const matchConclusion = buildMatchConclusion(analysisView.riskLevel, uwStatus)
  const nextStepAdvice = buildNextStepAdvice(analysisView.riskLevel)

  return (
    <div
      className={`app${page === 'home' ? ' app--home' : ''}${page === 'health' ? ' app--health' : ''}${page === 'analysis' ? ' app--analysis' : ''}${page === 'advice' ? ' app--advice' : ''}${page === 'products' ? ' app--products' : ''}`}
    >
      <div
        className={`phone${page === 'home' ? ' phone--home' : ''}${page === 'health' ? ' phone--health' : ''}${page === 'analysis' ? ' phone--analysis' : ''}${page === 'advice' ? ' phone--advice' : ''}${page === 'products' ? ' phone--products' : ''}`}
      >
        {page !== 'home' && (
          <header
            className={`header${page === 'health' || page === 'analysis' || page === 'advice' || page === 'products' ? ' header--health' : ''}`}
          >
            <button
              type="button"
              className="header-back"
              onClick={handleHeaderBack}
              aria-label="返回"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className="header-body">
              <p className="header-brand">HealthSure AI</p>
              <h1 className="header-title">{current.label}</h1>
            </div>
            {page === 'health' ? (
              <div className="health-case-wrap">
                <button
                  type="button"
                  className="health-case-btn"
                  onClick={() => setCaseMenuOpen((v) => !v)}
                >
                  演示案例
                </button>
                {caseMenuOpen && (
                  <div className="health-case-menu">
                    {HEALTH_DEMO_CASES.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        className="health-case-menu__item"
                        onClick={() => applyCase(c)}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <span className="header-step">{current.step}/4</span>
            )}
          </header>
        )}

        {page === 'health' && (
          <div className="health-progress">
            <div className="health-progress__track">
              <div
                className="health-progress__fill"
                style={{ width: `${(healthStep / 3) * 100}%` }}
              />
            </div>
            <p className="health-progress__label">
              步骤 {healthStep}/3 · {HEALTH_STEP_LABELS[healthStep - 1]}
            </p>
          </div>
        )}

        {page !== 'home' &&
          page !== 'health' &&
          page !== 'analysis' &&
          page !== 'advice' &&
          page !== 'products' && (
          <div className="step-bar" aria-hidden>
            {PAGES.filter((p) => p.step > 0).map((p) => (
              <span
                key={p.id}
                className={`step-dot ${stepIndex >= PAGES.findIndex((x) => x.id === p.id) ? 'step-dot--on' : ''} ${page === p.id ? 'step-dot--current' : ''}`}
              />
            ))}
          </div>
        )}

        <main className="main">
          {page === 'home' && (
            <section className="home">
              <div className="home-hero">
                <div className="home-logo">
                  <span>HS</span>
                </div>
                <h1>
                  HealthSure AI
                  <span>健康险智能投保顾问</span>
                </h1>
                <p className="home-lead">
                  基于用户健康状况与保障需求，生成健康风险画像、预核保建议、产品类型匹配和理赔风险提示。
                </p>
              </div>

              <div className="home-body">
                <div className="home-features">
                  {HOME_FEATURES.map((f) => (
                    <div key={f.num} className="home-feature">
                      <span className="home-feature__num">{f.num}</span>
                      <div>
                        <strong>{f.title}</strong>
                        <p>{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="btn btn-home-cta"
                  onClick={() => {
                    setHealthStep(1)
                    setPage('health')
                  }}
                >
                  开始智能投保评估
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                    <path d="M3 9h12M10 4l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <p className="home-note">演示版，不构成真实保险销售或核保承诺</p>
              </div>
            </section>
          )}

          {page === 'health' && (
            <section className="health-page">
              {activeCaseId && (
                <p className="health-case-tip">
                  已载入演示案例，可继续修改。最终以保险公司核保和合同条款为准。
                </p>
              )}

              <p className="health-intro">
                请如实填写信息，用于生成 AI 预核保与保障路径建议（辅助判断，非承保承诺）。
              </p>

              {healthStep === 1 && (
                <div className="health-step">
                  <div className="health-q-card">
                    <h3 className="health-q-title">年龄</h3>
                    <div className="health-age">
                      <button type="button" className="health-age-btn" onClick={() => updateProfile({ age: Math.max(18, profile.age - 1) })}>−</button>
                      <span>{profile.age} 岁</span>
                      <button type="button" className="health-age-btn" onClick={() => updateProfile({ age: Math.min(75, profile.age + 1) })}>+</button>
                    </div>
                    <input type="range" className="health-range" min={18} max={75} value={profile.age} onChange={(e) => updateProfile({ age: Number(e.target.value) })} />
                  </div>
                  <div className="health-q-card">
                    <h3 className="health-q-title">性别</h3>
                    <div className="health-pills">
                      {GENDER_OPTIONS.map((opt) => (
                        <button key={opt.value} type="button" className={`health-pill ${profile.gender === opt.value ? 'health-pill--on' : ''}`} onClick={() => updateProfile({ gender: opt.value })}>{opt.label}</button>
                      ))}
                    </div>
                  </div>
                  <div className="health-q-card">
                    <h3 className="health-q-title">是否有基本医保</h3>
                    <div className="health-pills">
                      {BASIC_INSURANCE_OPTIONS.map((opt) => (
                        <button key={opt.value} type="button" className={`health-pill ${profile.hasBasicInsurance === opt.value ? 'health-pill--on' : ''}`} onClick={() => updateProfile({ hasBasicInsurance: opt.value })}>{opt.label}</button>
                      ))}
                    </div>
                  </div>
                  <div className="health-q-card">
                    <h3 className="health-q-title">职业类型</h3>
                    <div className="health-pills health-pills--wrap">
                      {OCCUPATION_OPTIONS.map((opt) => (
                        <button key={opt.value} type="button" className={`health-pill ${profile.occupation === opt.value ? 'health-pill--on' : ''}`} onClick={() => updateProfile({ occupation: opt.value })}>{opt.label}</button>
                      ))}
                    </div>
                  </div>
                  <div className="health-q-card">
                    <h3 className="health-q-title">所在城市或地区</h3>
                    <p className="health-q-hint">选填，用于保障方案参考</p>
                    <input type="text" className="health-input" placeholder="如：上海、深圳" value={profile.city || ''} onChange={(e) => updateProfile({ city: e.target.value })} />
                  </div>
                </div>
              )}

              {healthStep === 2 && (
                <div className="health-step">
                  <div className="health-q-card">
                    <h3 className="health-q-title">当前健康状态</h3>
                    <div className="health-opts">
                      {HEALTH_STATUS_OPTIONS.map((opt) => (
                        <button key={opt.value} type="button" className={`health-opt ${profile.healthStatus === opt.value ? 'health-opt--on' : ''}`} onClick={() => updateProfile({ healthStatus: opt.value })}>
                          <strong>{opt.label}</strong><span>{opt.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="health-q-card">
                    <h3 className="health-q-title">是否有已确诊疾病</h3>
                    <p className="health-q-hint">可多选，无则跳过</p>
                    <div className="health-pills health-pills--wrap">
                      {DISEASE_OPTIONS.map((opt) => (
                        <button key={opt.value} type="button" className={`health-pill ${profile.diagnosedDiseases?.includes(opt.value) ? 'health-pill--on' : ''}`} onClick={() => toggleDisease(opt.value)}>{opt.label}</button>
                      ))}
                    </div>
                  </div>
                  <div className="health-q-card">
                    <h3 className="health-q-title">是否长期用药</h3>
                    <div className="health-pills health-pills--wrap">
                      {MEDICATION_OPTIONS.map((opt) => (
                        <button key={opt.value} type="button" className={`health-pill ${profile.medication === opt.value ? 'health-pill--on' : ''}`} onClick={() => updateProfile({ medication: opt.value })}>{opt.label}</button>
                      ))}
                    </div>
                  </div>
                  <div className="health-q-card">
                    <h3 className="health-q-title">近两年是否住院、手术或体检异常</h3>
                    <div className="health-pills health-pills--wrap">
                      {RECENT_MEDICAL_OPTIONS.map((opt) => (
                        <button key={opt.value} type="button" className={`health-pill ${profile.recentMedical === opt.value ? 'health-pill--on' : ''}`} onClick={() => updateProfile({ recentMedical: opt.value })}>{opt.label}</button>
                      ))}
                    </div>
                  </div>
                  <div className="health-q-card">
                    <h3 className="health-q-title">疾病控制情况</h3>
                    <div className="health-pills health-pills--wrap">
                      {DISEASE_CONTROL_OPTIONS.map((opt) => (
                        <button key={opt.value} type="button" className={`health-pill ${profile.diseaseControl === opt.value ? 'health-pill--on' : ''}`} onClick={() => updateProfile({ diseaseControl: opt.value })}>{opt.label}</button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {healthStep === 3 && (
                <div className="health-step">
                  <div className="health-q-card">
                    <h3 className="health-q-title">最关注的保障</h3>
                    <p className="health-q-hint">可多选，至少一项</p>
                    <div className="health-pills health-pills--wrap">
                      {COVERAGE_FOCUS_OPTIONS.map((opt) => (
                        <button key={opt.value} type="button" className={`health-pill ${profile.coverageNeeds.includes(opt.value) ? 'health-pill--on' : ''}`} onClick={() => toggleCoverage(opt.value)}>{opt.label}</button>
                      ))}
                    </div>
                  </div>
                  <div className="health-q-card">
                    <h3 className="health-q-title">月度可接受保费</h3>
                    <div className="health-pills health-pills--wrap">
                      {BUDGET_PRESETS.map((opt) => (
                        <button key={opt.value} type="button" className={`health-pill ${profile.budget === opt.value ? 'health-pill--on' : ''}`} onClick={() => updateProfile({ budget: opt.value })}>{opt.label}</button>
                      ))}
                    </div>
                  </div>
                  <div className="health-q-card">
                    <h3 className="health-q-title">更希望获得的建议</h3>
                    <p className="health-q-hint">可多选</p>
                    <div className="health-pills health-pills--wrap">
                      {ADVICE_FOCUS_OPTIONS.map((opt) => (
                        <button key={opt.value} type="button" className={`health-pill ${profile.adviceFocus?.includes(opt.value) ? 'health-pill--on' : ''}`} onClick={() => toggleAdviceFocus(opt.value)}>{opt.label}</button>
                      ))}
                    </div>
                  </div>
                  <div className="health-q-card">
                    <h3 className="health-q-title">是否愿意转人工顾问</h3>
                    <div className="health-pills">
                      {ADVISOR_OPTIONS.map((opt) => (
                        <button key={opt.value} type="button" className={`health-pill ${profile.needAdvisor === opt.value ? 'health-pill--on' : ''}`} onClick={() => updateProfile({ needAdvisor: opt.value })}>{opt.label}</button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <p className="health-disclaimer">
                本问答仅用于生成 AI 预核保与保障适配建议，不构成最终承保结论。
              </p>

              <div className="health-footer">
                {healthStep > 1 && (
                  <button type="button" className="health-btn health-btn--ghost" onClick={() => setHealthStep((s) => s - 1)}>上一步</button>
                )}
                {healthStep < 3 && (
                  <button type="button" className="health-btn health-btn--primary" disabled={healthStep === 1 ? !canHealthStep1 : !canHealthStep2} onClick={() => setHealthStep((s) => s + 1)}>下一步</button>
                )}
                {healthStep === 3 && (
                  <button type="button" className="health-btn health-btn--primary" disabled={!canSubmitHealth} onClick={() => setPage('analysis')}>提交并进入 AI 分析</button>
                )}
              </div>
            </section>
          )}

          {page === 'analysis' && (
            <section className="analysis-page">
              <p className="analysis-intro">
                AI 将健康问答转化为核保可用的风险画像，用于辅助生成预核保建议与保障路径匹配。
              </p>

              <div className="analysis-card">
                <h3 className="analysis-card__title">综合风险评估</h3>
                <div
                  className={`analysis-risk analysis-risk--${analysisView.riskLevel.level}`}
                >
                  <div className="analysis-risk__row">
                    <span className="analysis-risk__label">综合风险等级</span>
                    <strong>{analysisView.riskLevel.label}</strong>
                  </div>
                  <div className="analysis-risk__row">
                    <span className="analysis-risk__label">健康可保评分</span>
                    <strong>{insurabilityScore}/10</strong>
                  </div>
                </div>
                <div className="analysis-uw">
                  <span className="analysis-uw__label">预核保建议</span>
                  <p>{formatUwAdvice(uwStatus)}</p>
                </div>
                <p className="analysis-note">
                  该结果仅为 AI 预核保辅助判断，不构成最终承保结论。
                </p>
              </div>

              <div className="analysis-card">
                <h3 className="analysis-card__title">用户输入摘要</h3>
                <dl className="analysis-summary">
                  {profileSummary.map((row) => (
                    <div key={row.label} className="analysis-summary__row">
                      <dt>{row.label}</dt>
                      <dd>{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="analysis-card">
                <h3 className="analysis-card__title">健康风险标签</h3>
                <div className="analysis-tags">
                  {displayRiskTags.map((tag) => (
                    <span key={tag} className="analysis-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="analysis-card">
                <h3 className="analysis-card__title">核保敏感项</h3>
                <ul className="analysis-sensitive">
                  {displaySensitive.map((item) => (
                    <li key={item.id}>
                      <strong>{item.title}</strong>
                      <span>{item.desc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="analysis-card">
                <h3 className="analysis-card__title">AI 分析依据</h3>
                <p className="analysis-narrative">{analysisNarrative}</p>
              </div>

              <button
                type="button"
                className="analysis-cta"
                onClick={() => setPage('advice')}
              >
                查看预核保建议
              </button>
            </section>
          )}

          {page === 'advice' && (
            <section className="advice-page">
              <p className="advice-intro">
                根据健康风险画像，AI 将用户分流至不同承保路径，并解释推荐依据。
              </p>

              {ADVICE_PATHS.map((path) => (
                <div
                  key={path.id}
                  className={`advice-path${advicePrimaryPath === path.id ? ' advice-path--primary' : ''}`}
                >
                  <div className="advice-path__head">
                    <h3 className="advice-path__title">{path.title}</h3>
                    <span
                      className={`advice-path__tag${path.tag === '优先推荐' ? ' advice-path__tag--rec' : ''}`}
                    >
                      {path.tag}
                    </span>
                  </div>
                  <p className="advice-path__subtitle">{path.subtitle}</p>
                  <div className="advice-path__products">
                    {path.products.map((p) => (
                      <span key={p} className="advice-path__product">
                        {p}
                      </span>
                    ))}
                  </div>
                  <ul className="advice-path__points">
                    {path.points.map((pt) => (
                      <li key={pt}>{pt}</li>
                    ))}
                  </ul>
                </div>
              ))}

              <div className="advice-card">
                <h3 className="advice-card__title">AI 推荐总结</h3>
                <p className="advice-card__text">{adviceSummaryText}</p>
              </div>

              <div className="advice-card">
                <h3 className="advice-card__title">综合判断依据</h3>
                <ul className="advice-basis">
                  {judgmentBasis.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                className="advice-cta"
                onClick={() => setPage('products')}
              >
                查看产品推荐与风险提示
              </button>
            </section>
          )}

          {page === 'products' && (
            <section className="plan-page">
              <p className="plan-intro">
                基于健康风险画像与预核保建议，匹配适合的保障路径，并提示关键理赔风险。
              </p>

              <div className="plan-card plan-card--highlight">
                <h3 className="plan-card__title">AI 保障路径建议</h3>
                <dl className="plan-match">
                  <div className="plan-match__row">
                    <dt>推荐路径</dt>
                    <dd>{matchConclusion.path}</dd>
                  </div>
                  <div className="plan-match__row plan-match__row--block">
                    <dt>适合原因</dt>
                    <dd>{matchConclusion.reason}</dd>
                  </div>
                  <div className="plan-match__row plan-match__row--block">
                    <dt>需要注意的限制</dt>
                    <dd>{matchConclusion.limits}</dd>
                  </div>
                </dl>
                <p className="plan-match__summary">{matchConclusion.summary}</p>
              </div>

              <h3 className="plan-section-title">推荐保障组合</h3>
              {PLAN_PRODUCT_TYPES.map((product) => (
                <div key={product.id} className="plan-card">
                  <div className="plan-card__head">
                    <h4 className="plan-card__name">{product.name}</h4>
                    <span
                      className={`plan-tag${getPlanProductTag(product.id, analysisView.riskLevel) === '优先推荐' ? ' plan-tag--rec' : ''}`}
                    >
                      {getPlanProductTag(product.id, analysisView.riskLevel)}
                    </span>
                  </div>
                  <p className="plan-card__desc">{product.desc}</p>
                  <p className="plan-card__concern-label">关注点</p>
                  <ul className="plan-concerns">
                    {product.concerns.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </div>
              ))}

              <div className="plan-card">
                <h3 className="plan-card__title">重点理赔风险提示</h3>
                <ul className="plan-risks">
                  {CLAIM_RISK_POINTS.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>

              <div className="plan-card">
                <h3 className="plan-card__title">下一步建议</h3>
                <p className="plan-card__text">{nextStepAdvice}</p>
              </div>

              <div className="plan-feedback">
                <h3 className="plan-feedback__title">这个建议对你有帮助吗？</h3>
                <div className="plan-feedback__btns">
                  <button
                    type="button"
                    className="plan-feedback__btn"
                    onClick={() => setPlanFeedback('helpful')}
                  >
                    有帮助
                  </button>
                  <button
                    type="button"
                    className="plan-feedback__btn"
                    onClick={() => setPlanFeedback('confused')}
                  >
                    看不懂
                  </button>
                  <button
                    type="button"
                    className="plan-feedback__btn"
                    onClick={() => setPlanFeedback('advisor')}
                  >
                    想联系人工顾问
                  </button>
                </div>
                {planFeedback && (
                  <p className="plan-feedback__done">
                    已记录反馈，后续可用于优化保障匹配逻辑。
                  </p>
                )}
              </div>

              <p className="plan-disclaimer">
                本页面仅为 AI 预核保与保障路径匹配建议，不构成保险销售、最终承保结论或理赔承诺。实际投保与理赔结果以保险公司核保审核及正式保险合同为准。
              </p>
            </section>
          )}
        </main>

        {page !== 'home' && (
          <nav className="tabs" aria-label="页面导航">
            {PAGES.filter((p) => p.step > 0).map((p) => (
              <button
                key={p.id}
                type="button"
                className={`tab ${page === p.id ? 'tab--active' : ''}`}
                onClick={() => setPage(p.id)}
              >
                <span className="tab-num">{p.step}</span>
                <span className="tab-label">{p.label}</span>
              </button>
            ))}
          </nav>
        )}
      </div>
    </div>
  )
}

export default App
