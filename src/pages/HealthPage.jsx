import { useApp } from '../context/AppContext'
import {
  HEALTH_OPTIONS,
  MEDICATION_OPTIONS,
  COVERAGE_OPTIONS,
  BUDGET_PRESETS,
} from '../data/mockData'
import { Layout } from '../components/Layout'
import { Card, Button, SectionTitle } from '../components/ui'
import './HealthPage.css'

export function HealthPage() {
  const { profile, updateProfile, startAnalysis } = useApp()

  const toggleNeed = (value) => {
    const needs = profile.coverageNeeds || []
    const next = needs.includes(value)
      ? needs.filter((n) => n !== value)
      : [...needs, value]
    updateProfile({ coverageNeeds: next })
  }

  const canSubmit =
    profile.age >= 18 &&
    profile.age <= 75 &&
    (profile.coverageNeeds?.length ?? 0) > 0

  return (
    <Layout
      title="健康问答"
      subtitle="请如实填写，以便生成预核保参考"
      showBack
      showProgress
    >
      <SectionTitle icon="👤" title="基本信息" desc="年龄与健康状况" />

      <Card>
        <label className="field-label">年龄</label>
        <div className="age-control">
          <button
            type="button"
            className="age-btn"
            onClick={() => updateProfile({ age: Math.max(18, profile.age - 1) })}
          >
            −
          </button>
          <span className="age-value">{profile.age} 岁</span>
          <button
            type="button"
            className="age-btn"
            onClick={() => updateProfile({ age: Math.min(75, profile.age + 1) })}
          >
            +
          </button>
        </div>
        <input
          type="range"
          min={18}
          max={75}
          value={profile.age}
          className="range-input"
          onChange={(e) => updateProfile({ age: Number(e.target.value) })}
        />
      </Card>

      <Card>
        <label className="field-label">健康状况</label>
        <div className="option-grid">
          {HEALTH_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`option-chip ${profile.healthStatus === opt.value ? 'option-chip--active' : ''}`}
              onClick={() => updateProfile({ healthStatus: opt.value })}
            >
              <strong>{opt.label}</strong>
              <span>{opt.desc}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <label className="field-label">用药情况</label>
        <div className="pill-row">
          {MEDICATION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`pill ${profile.medication === opt.value ? 'pill--active' : ''}`}
              onClick={() => updateProfile({ medication: opt.value })}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </Card>

      <SectionTitle icon="🎯" title="保障需求" desc="可多选" />

      <Card>
        <div className="coverage-grid">
          {COVERAGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`coverage-item ${profile.coverageNeeds?.includes(opt.value) ? 'coverage-item--active' : ''}`}
              onClick={() => toggleNeed(opt.value)}
            >
              <span className="coverage-icon">{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </Card>

      <SectionTitle icon="💳" title="保费预算" desc="月度可接受保费" />

      <Card>
        <div className="budget-row">
          {BUDGET_PRESETS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`budget-chip ${profile.budget === opt.value ? 'budget-chip--active' : ''}`}
              onClick={() => updateProfile({ budget: opt.value })}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </Card>

      <div className="sticky-footer">
        <Button full disabled={!canSubmit} onClick={startAnalysis}>
          提交并 AI 分析
        </Button>
      </div>
    </Layout>
  )
}
