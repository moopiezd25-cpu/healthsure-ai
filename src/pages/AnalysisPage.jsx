import { useApp } from '../context/AppContext'
import { Layout } from '../components/Layout'
import { Card, Button, Badge, SectionTitle } from '../components/ui'
import './AnalysisPage.css'

export function AnalysisPage() {
  const { analyzing, analysis, setPage } = useApp()

  if (analyzing) {
    return (
      <Layout title="AI 分析中" subtitle="规则引擎正在评估您的投保画像" showProgress>
        <div className="analysis-loading">
          <div className="ai-ring">
            <div className="ai-ring__inner">AI</div>
          </div>
          <p className="loading-text">正在模拟预核保判断…</p>
          <ul className="loading-steps">
            <li className="loading-step loading-step--done">解析健康告知</li>
            <li className="loading-step loading-step--active">计算风险评分</li>
            <li className="loading-step">匹配产品类型</li>
          </ul>
        </div>
      </Layout>
    )
  }

  if (!analysis) {
    return (
      <Layout title="AI 分析" showBack>
        <Card>
          <p>暂无分析结果，请先完成健康问答。</p>
          <Button full onClick={() => setPage('health')}>
            去填写问答
          </Button>
        </Card>
      </Layout>
    )
  }

  const { underwriting, reasoning, productTypes } = analysis
  const toneMap = { success: 'success', warning: 'warning', danger: 'danger' }

  return (
    <Layout title="AI 分析结果" subtitle="预核保判断与类型推荐" showBack showProgress>
      <Card highlight className="result-hero">
        <div className="result-score">
          <svg viewBox="0 0 120 120" className="score-ring">
            <circle cx="60" cy="60" r="52" className="score-ring__bg" />
            <circle
              cx="60"
              cy="60"
              r="52"
              className="score-ring__fill"
              style={{
                strokeDashoffset: 327 - (327 * underwriting.score) / 100,
              }}
            />
          </svg>
          <div className="score-center">
            <strong>{underwriting.score}</strong>
            <span>综合分</span>
          </div>
        </div>
        <div className="result-meta">
          <Badge tone={toneMap[underwriting.color]}>{underwriting.label}</Badge>
          <p className="result-hint">模拟预核保结论 · 非保险公司正式核保</p>
        </div>
      </Card>

      <SectionTitle icon="📌" title="推荐产品类型" />

      {productTypes.map((pt, i) => (
        <Card key={pt.type} className="type-card">
          <div className="type-rank">{i + 1}</div>
          <div>
            <h4>{pt.type}</h4>
            <p>{pt.reason}</p>
          </div>
        </Card>
      ))}

      <SectionTitle icon="🔍" title="判断依据" desc="基于规则引擎的推理说明" />

      <Card>
        <ul className="reason-list">
          {reasoning.map((r, i) => (
            <li key={i}>
              <span className="reason-icon">{r.icon}</span>
              <span>{r.text}</span>
            </li>
          ))}
        </ul>
      </Card>

      <div className="sticky-footer">
        <Button full onClick={() => setPage('advice')}>
          查看投保建议
        </Button>
      </div>
    </Layout>
  )
}
