export const HEALTH_OPTIONS = [
  { value: 'excellent', label: '良好', desc: '无慢性病，体检正常' },
  { value: 'good', label: '一般', desc: '偶有小毛病，不影响生活' },
  { value: 'fair', label: '亚健康', desc: '有指标异常或需定期复查' },
  { value: 'chronic', label: '慢性病', desc: '高血压、糖尿病等需长期管理' },
]

export const MEDICATION_OPTIONS = [
  { value: 'none', label: '无用药' },
  { value: 'occasional', label: '偶尔用药' },
  { value: 'regular', label: '长期单药' },
  { value: 'multiple', label: '多种联合用药' },
]

export const COVERAGE_OPTIONS = [
  { value: 'hospitalization', label: '住院医疗', icon: '🏥' },
  { value: 'critical', label: '重大疾病', icon: '💊' },
  { value: 'cancer', label: '恶性肿瘤', icon: '🎗️' },
  { value: 'outpatient', label: '门诊报销', icon: '🩺' },
  { value: 'accident', label: '意外医疗', icon: '🛡️' },
  { value: 'allowance', label: '住院津贴', icon: '💰' },
]

export const BUDGET_PRESETS = [
  { value: 200, label: '200元/月' },
  { value: 500, label: '500元/月' },
  { value: 800, label: '800元/月' },
  { value: 1200, label: '1200元/月' },
  { value: 2000, label: '2000元+/月' },
]

/** 演示用 mock 用户案例 */
export const MOCK_USER_CASES = [
  {
    id: 'case-young',
    name: '案例 A · 年轻白领',
    tag: '标准体',
    summary: '28 岁 · 健康良好 · 无用药 · 预算 500 元/月',
    profile: {
      age: 28,
      healthStatus: 'excellent',
      medication: 'none',
      budget: 500,
      coverageNeeds: ['hospitalization', 'critical', 'accident'],
    },
  },
  {
    id: 'case-middle',
    name: '案例 B · 中年父母',
    tag: '亚健康',
    summary: '45 岁 · 亚健康 · 偶尔用药 · 预算 800 元/月',
    profile: {
      age: 45,
      healthStatus: 'fair',
      medication: 'occasional',
      budget: 800,
      coverageNeeds: ['hospitalization', 'critical', 'outpatient', 'allowance'],
    },
  },
  {
    id: 'case-senior',
    name: '案例 C · 慢病长辈',
    tag: '需关注',
    summary: '62 岁 · 慢性病 · 多种用药 · 预算 1200 元/月',
    profile: {
      age: 62,
      healthStatus: 'chronic',
      medication: 'multiple',
      budget: 1200,
      coverageNeeds: ['hospitalization', 'cancer', 'allowance'],
    },
  },
]

export const PRODUCT_CATALOG = [
  {
    id: 'med-basic',
    type: '百万医疗',
    name: '安心百万医疗险（基础版）',
    premiumRange: '198–398元/年',
    coverage: '一般医疗 300 万 · 重疾医疗 600 万',
    highlight: '免赔额 1 万，社保内外均可报',
    fitTags: ['hospitalization', 'outpatient'],
    riskLevel: 'low',
  },
  {
    id: 'med-plus',
    type: '百万医疗',
    name: '尊享百万医疗险（优选版）',
    premiumRange: '468–888元/年',
    coverage: '一般医疗 400 万 · 特需医疗可选',
    highlight: '0 免赔可选，质子重离子覆盖',
    fitTags: ['hospitalization', 'cancer', 'critical'],
    riskLevel: 'low',
  },
  {
    id: 'critical-std',
    type: '重疾险',
    name: '守护人生重大疾病保险',
    premiumRange: '3,200–8,600元/年',
    coverage: '120 种重疾 + 40 种轻症 · 多次赔付',
    highlight: '确诊即赔，保障至 70 岁/终身可选',
    fitTags: ['critical', 'cancer'],
    riskLevel: 'medium',
  },
  {
    id: 'critical-lite',
    type: '重疾险',
    name: '轻享重疾保障计划',
    premiumRange: '1,680–4,200元/年',
    coverage: '28 种高发重疾 · 单次赔付',
    highlight: '保费友好，适合预算有限人群',
    fitTags: ['critical'],
    riskLevel: 'medium',
  },
  {
    id: 'cancer-only',
    type: '防癌险',
    name: '安康恶性肿瘤保险',
    premiumRange: '680–2,400元/年',
    coverage: '恶性肿瘤确诊金 + 住院津贴',
    highlight: '健康告知宽松，慢病人群可投保',
    fitTags: ['cancer', 'hospitalization'],
    riskLevel: 'medium',
  },
  {
    id: 'accident-pack',
    type: '意外险',
    name: '全年无忧意外医疗组合',
    premiumRange: '128–298元/年',
    coverage: '意外身故/伤残 50 万 · 意外医疗 5 万',
    highlight: '含猝死责任，住院津贴附加',
    fitTags: ['accident', 'allowance'],
    riskLevel: 'low',
  },
]

export const CLAIM_RISK_TEMPLATES = [
  {
    id: 'waiting',
    title: '等待期免责',
    desc: '投保后 30–90 天内确诊疾病，通常不予赔付。建议等待期后再进行大额医疗支出规划。',
    severity: 'info',
  },
  {
    id: 'preexisting',
    title: '既往症告知',
    desc: '投保前已确诊或已有症状的疾病，可能列为除外责任。请如实填写健康告知，避免理赔纠纷。',
    severity: 'warning',
  },
  {
    id: 'deductible',
    title: '免赔额与报销比例',
    desc: '百万医疗险常有 1 万元免赔额，社保报销后剩余部分才进入商保计算，需预留自付资金。',
    severity: 'info',
  },
  {
    id: 'non-medical',
    title: '非医疗必要费用',
    desc: '美容、体检、康复护理（部分产品除外）等通常不在保障范围，理赔时易被拒。',
    severity: 'info',
  },
  {
    id: 'occupation',
    title: '职业与运动限制',
    desc: '高风险职业或极限运动导致的意外，意外险可能免责或加费承保，请核对条款。',
    severity: 'warning',
  },
  {
    id: 'medication',
    title: '用药与诊疗记录',
    desc: '理赔需提供完整病历、处方及发票。长期用药未在告知中体现，可能影响核保与赔付。',
    severity: 'warning',
  },
]
