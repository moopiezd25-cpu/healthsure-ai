import {
  PRODUCT_CATALOG,
  CLAIM_RISK_TEMPLATES,
  COVERAGE_OPTIONS,
} from '../data/mockData'

const UNDERWRITING = {
  pass: { status: 'pass', label: '标准体通过', color: 'success', score: 85 },
  conditional: {
    status: 'conditional',
    label: '条件承保',
    color: 'warning',
    score: 62,
  },
  decline: { status: 'decline', label: '建议暂缓投保', color: 'danger', score: 38 },
}

function scoreRisk(profile) {
  let risk = 0
  const { age, healthStatus, medication } = profile

  if (age >= 60) risk += 25
  else if (age >= 50) risk += 15
  else if (age >= 40) risk += 8

  const healthMap = { excellent: 0, good: 5, fair: 18, chronic: 35 }
  risk += healthMap[healthStatus] ?? 10

  const medMap = { none: 0, occasional: 8, regular: 20, multiple: 35 }
  risk += medMap[medication] ?? 10

  return risk
}

function resolveUnderwriting(risk) {
  if (risk >= 55) return UNDERWRITING.decline
  if (risk >= 30) return UNDERWRITING.conditional
  return UNDERWRITING.pass
}

function recommendProductTypes(profile, underwriting) {
  const types = []
  const needs = profile.coverageNeeds || []
  const budget = profile.budget || 500

  if (needs.includes('hospitalization') || needs.includes('outpatient')) {
    types.push({
      type: '百万医疗',
      reason: '覆盖大额住院与社保外费用，杠杆率最高',
      priority: 1,
    })
  }

  if (needs.includes('critical') || needs.includes('cancer')) {
    if (profile.healthStatus === 'chronic' || underwriting.status === 'conditional') {
      types.push({
        type: '防癌险',
        reason: '健康告知相对宽松，适合慢病或次标体人群',
        priority: 2,
      })
    } else {
      types.push({
        type: '重疾险',
        reason: '确诊即赔，弥补收入损失与康复支出',
        priority: 2,
      })
    }
  }

  if (needs.includes('accident') || needs.includes('allowance')) {
    types.push({
      type: '意外险',
      reason: '保费低、生效快，补充意外医疗与住院津贴',
      priority: 3,
    })
  }

  if (budget < 400 && !types.find((t) => t.type === '百万医疗')) {
    types.unshift({
      type: '百万医疗',
      reason: '预算有限时优先配置高杠杆医疗险',
      priority: 1,
    })
  }

  if (types.length === 0) {
    types.push({
      type: '百万医疗',
      reason: '作为健康险配置基础，建议优先建立医疗保障',
      priority: 1,
    })
  }

  return types.sort((a, b) => a.priority - b.priority)
}

function buildReasoning(profile, risk, underwriting) {
  const reasons = []

  if (profile.age < 40) {
    reasons.push({
      icon: '✓',
      text: `年龄 ${profile.age} 岁，处于保费优势区间，建议尽早配置长期保障。`,
    })
  } else if (profile.age >= 55) {
    reasons.push({
      icon: '!',
      text: `年龄 ${profile.age} 岁，核保趋严、保费上浮，建议优先医疗险并关注防癌产品。`,
    })
  } else {
    reasons.push({
      icon: 'i',
      text: `年龄 ${profile.age} 岁，建议医疗险 + 重疾/防癌组合，平衡保费与保障深度。`,
    })
  }

  const healthLabels = {
    excellent: '健康状况良好',
    good: '健康状况一般',
    fair: '存在亚健康指标',
    chronic: '存在慢性病管理需求',
  }
  reasons.push({
    icon: profile.healthStatus === 'chronic' ? '!' : '✓',
    text: `${healthLabels[profile.healthStatus]}，${underwriting.label}。`,
  })

  if (profile.medication === 'multiple') {
    reasons.push({
      icon: '!',
      text: '多种联合用药可能触发人工核保，请准备近 6 个月病历与用药清单。',
    })
  } else if (profile.medication === 'none') {
    reasons.push({
      icon: '✓',
      text: '无长期用药记录，有利于标准体承保与较低费率。',
    })
  }

  const needCount = (profile.coverageNeeds || []).length
  reasons.push({
    icon: 'i',
    text: `已选择 ${needCount} 项保障需求，月预算约 ${profile.budget} 元，方案将按优先级匹配产品类型。`,
  })

  reasons.push({
    icon: 'AI',
    text: `综合风险评分 ${100 - risk}/100（模拟规则引擎），非真实核保结论，仅供参考。`,
  })

  return reasons
}

function matchProducts(profile, productTypes) {
  const typeNames = productTypes.map((t) => t.type)
  const needs = profile.coverageNeeds || []

  return PRODUCT_CATALOG.filter((p) => {
    const typeMatch = typeNames.includes(p.type)
    const needMatch = p.fitTags.some((tag) => needs.includes(tag))
    return typeMatch || needMatch
  })
    .slice(0, 4)
    .map((p) => ({
      ...p,
      matchScore:
        (typeNames.includes(p.type) ? 40 : 0) +
        p.fitTags.filter((t) => needs.includes(t)).length * 15,
    }))
    .sort((a, b) => b.matchScore - a.matchScore)
}

function buildClaimRisks(profile) {
  const risks = [CLAIM_RISK_TEMPLATES[0], CLAIM_RISK_TEMPLATES[2]]

  if (profile.healthStatus === 'chronic' || profile.healthStatus === 'fair') {
    risks.push(CLAIM_RISK_TEMPLATES[1])
  }

  if (profile.medication !== 'none') {
    risks.push(CLAIM_RISK_TEMPLATES[5])
  }

  if (profile.coverageNeeds?.includes('accident')) {
    risks.push(CLAIM_RISK_TEMPLATES[4])
  }

  risks.push(CLAIM_RISK_TEMPLATES[3])

  return [...new Map(risks.map((r) => [r.id, r])).values()]
}

function buildHealthTags(profile) {
  const tags = []
  if (profile.age < 35) tags.push({ label: '青年客群', tone: 'positive' })
  else if (profile.age >= 55) tags.push({ label: '高龄关注', tone: 'warning' })
  else tags.push({ label: '中年客群', tone: 'neutral' })

  const healthMap = {
    excellent: { label: '标准健康体', tone: 'positive' },
    good: { label: '一般健康体', tone: 'neutral' },
    fair: { label: '亚健康', tone: 'warning' },
    chronic: { label: '慢病管理', tone: 'warning' },
  }
  tags.push(healthMap[profile.healthStatus] ?? { label: '健康待评', tone: 'neutral' })

  if (profile.medication === 'none') {
    tags.push({ label: '无用药史', tone: 'positive' })
  } else if (profile.medication === 'multiple') {
    tags.push({ label: '联合用药', tone: 'warning' })
  } else {
    tags.push({ label: '有用药记录', tone: 'neutral' })
  }

  if (profile.budget >= 800) tags.push({ label: '预算充足', tone: 'positive' })
  else if (profile.budget <= 300) tags.push({ label: '预算敏感', tone: 'neutral' })

  return tags
}

function buildRiskLevel(risk) {
  const score = 100 - risk
  if (risk < 30) {
    return { level: 'low', label: '低风险', score, color: 'success' }
  }
  if (risk < 55) {
    return { level: 'medium', label: '中风险', score, color: 'warning' }
  }
  return { level: 'high', label: '高风险', score, color: 'danger' }
}

function buildSensitiveItems(profile) {
  const items = []
  if (profile.age >= 50) {
    items.push({
      title: '年龄敏感',
      desc: `${profile.age} 岁，费率上浮且核保规则趋严`,
      level: profile.age >= 60 ? 'high' : 'medium',
    })
  }
  if (profile.healthStatus === 'chronic') {
    items.push({
      title: '慢性病告知',
      desc: '需核实既往症、控制情况及并发症风险',
      level: 'high',
    })
  }
  if (profile.healthStatus === 'fair') {
    items.push({
      title: '指标异常',
      desc: '体检或复查指标异常，可能除外责任或加费',
      level: 'medium',
    })
  }
  if (profile.medication === 'regular' || profile.medication === 'multiple') {
    items.push({
      title: '用药史',
      desc: '长期用药需与健告一致，理赔时可能重点核查',
      level: profile.medication === 'multiple' ? 'high' : 'medium',
    })
  }
  if (items.length === 0) {
    items.push({
      title: '暂无明显敏感项',
      desc: '当前画像未触发常见核保红线，可标准体评估',
      level: 'low',
    })
  }
  return items
}

function buildCoverageTags(profile) {
  return (profile.coverageNeeds || []).map((value) => {
    const opt = COVERAGE_OPTIONS.find((o) => o.value === value)
    return opt
      ? { label: opt.label, icon: opt.icon }
      : { label: value, icon: '•' }
  })
}

function buildAdviceChannels(profile, risk, underwriting) {
  const standardReasons = []
  const manualReasons = []
  const lowReasons = []

  if (underwriting.status === 'pass') {
    standardReasons.push('综合风险较低，百万医疗与重疾险可走标准体流程。')
    standardReasons.push('无显著既往症与用药红线，线上智能核保通过概率较高。')
    manualReasons.push('若近期有体检异常或住院史，仍建议走人工核保确认。')
    lowReasons.push('意外险可作为补充，非当前首选路径。')
  } else if (underwriting.status === 'conditional') {
    standardReasons.push('部分标准产品可能加费、除外或限额承保。')
    manualReasons.push('建议提交病历、用药清单，由核保员评估承保条件。')
    manualReasons.push('医疗险续保与重疾保额核定需重点关注。')
    lowReasons.push('防癌险、意外险健康告知相对宽松，适合作为过渡配置。')
  } else {
    standardReasons.push('标准重疾险/医疗险承保概率较低，不建议优先尝试。')
    manualReasons.push('需完整健康材料，由保险公司个案核定。')
    lowReasons.push('优先配置告知宽松的防癌险与意外险，建立基础保障。')
    lowReasons.push('建议 6 个月后复查指标，再评估标准体产品。')
  }

  if (profile.age >= 55) {
    manualReasons.push(`年龄 ${profile.age} 岁，多数重疾产品需人工核保。`)
  }
  if (profile.medication === 'multiple') {
    manualReasons.push('多种联合用药将触发用药史与并发症核查。')
    lowReasons.push('慢病人群可优先考虑防癌专项产品。')
  }

  let standardStatus = 'recommended'
  let manualStatus = 'optional'
  let lowStatus = 'optional'

  if (underwriting.status === 'pass') {
    standardStatus = 'recommended'
    manualStatus = 'optional'
    lowStatus = 'optional'
  } else if (underwriting.status === 'conditional') {
    standardStatus = 'optional'
    manualStatus = 'recommended'
    lowStatus = 'recommended'
  } else {
    standardStatus = 'limited'
    manualStatus = 'recommended'
    lowStatus = 'recommended'
  }

  return [
    {
      id: 'standard',
      title: '可正常投保',
      desc: '标准健告、线上流程为主',
      products: ['百万医疗险', '重疾险（标准体）'],
      status: standardStatus,
      reasons: standardReasons,
    },
    {
      id: 'manual',
      title: '建议人工核保',
      desc: '提交资料、个案核定承保条件',
      products: ['医疗险续保', '重疾险（加费/除外）', '智能核保未通过件'],
      status: manualStatus,
      reasons: manualReasons,
    },
    {
      id: 'lowbarrier',
      title: '建议低门槛产品',
      desc: '健告宽松、慢病/高龄友好',
      products: ['防癌险', '意外险', '住院津贴险'],
      status: lowStatus,
      reasons: lowReasons,
    },
  ]
}

export function runAnalysis(profile) {
  const risk = scoreRisk(profile)
  const underwriting = { ...resolveUnderwriting(risk), riskScore: risk }
  const productTypes = recommendProductTypes(profile, underwriting)
  const reasoning = buildReasoning(profile, risk, underwriting)
  const products = matchProducts(profile, productTypes)
  const claimRisks = buildClaimRisks(profile)

  const analysisView = {
    healthTags: buildHealthTags(profile),
    riskLevel: buildRiskLevel(risk),
    sensitiveItems: buildSensitiveItems(profile),
    coverageTags: buildCoverageTags(profile),
    underwriting,
  }

  const adviceChannels = buildAdviceChannels(profile, risk, underwriting)

  const adviceSummary =
    underwriting.status === 'pass'
      ? '建议以百万医疗为基础，按预算补充重疾或防癌保障，并保留 3–6 个月医疗备用金。'
      : underwriting.status === 'conditional'
        ? '建议优先投保健康告知宽松的防癌险与意外险，医疗险可申请智能核保或人工核保。'
        : '当前风险偏高，建议先完善健康告知材料，6 个月后复查再评估，或咨询专业顾问。'

  const budgetAllocation = buildBudgetAllocation(profile, productTypes)

  return {
    underwriting,
    productTypes,
    reasoning,
    products,
    claimRisks,
    adviceSummary,
    budgetAllocation,
    analysisView,
    adviceChannels,
    analyzedAt: new Date().toISOString(),
  }
}

function buildBudgetAllocation(profile, productTypes) {
  const total = profile.budget || 500
  const items = []

  const medShare = productTypes.some((t) => t.type === '百万医疗') ? 0.35 : 0
  const criticalShare = productTypes.some(
    (t) => t.type === '重疾险' || t.type === '防癌险',
  )
    ? 0.5
    : 0
  const accidentShare = productTypes.some((t) => t.type === '意外险') ? 0.15 : 0
  let remain = 1

  if (medShare) {
    items.push({ name: '百万医疗', percent: 35, amount: Math.round(total * 0.35) })
    remain -= 0.35
  }
  if (criticalShare) {
    const pct = Math.round(remain * 100)
    items.push({
      name: productTypes.find((t) => t.type === '防癌险') ? '防癌险' : '重疾险',
      percent: pct,
      amount: Math.round(total * remain),
    })
    remain = 0
  }
  if (accidentShare && remain > 0) {
    items.push({
      name: '意外险',
      percent: Math.round(remain * 100),
      amount: Math.round(total * remain),
    })
  }

  if (items.length === 0) {
    items.push({ name: '医疗保障', percent: 100, amount: total })
  }

  return items
}
