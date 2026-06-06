import { useApp } from '../context/AppContext'
import { COVERAGE_OPTIONS } from '../data/mockData'
import { Layout } from '../components/Layout'
import { Card, Button, Badge, Tag, SectionTitle } from '../components/ui'
import './ProductsPage.css'

const RISK_TONE = { info: 'info', warning: 'warning' }

export function ProductsPage() {
  const { analysis, reset, setPage } = useApp()

  if (!analysis) {
    return (
      <Layout title="产品推荐" showBack>
        <Card>
          <p>暂无推荐数据。</p>
          <Button full onClick={() => setPage('home')}>
            返回首页
          </Button>
        </Card>
      </Layout>
    )
  }

  const { products, claimRisks } = analysis

  return (
    <Layout title="产品推荐" subtitle="匹配产品库与理赔风险提示" showBack showProgress>
      <SectionTitle icon="🛒" title="推荐产品" desc="按需求与核保结果匹配" />

      {products.map((p) => (
        <Card key={p.id} className="product-card">
          <div className="product-head">
            <Badge tone="info">{p.type}</Badge>
            {p.matchScore >= 55 && <Badge tone="success">高匹配</Badge>}
          </div>
          <h4 className="product-name">{p.name}</h4>
          <p className="product-premium">{p.premiumRange}</p>
          <p className="product-coverage">{p.coverage}</p>
          <p className="product-highlight">{p.highlight}</p>
          <div className="product-tags">
            {p.fitTags.map((t) => {
              const label = COVERAGE_OPTIONS.find((o) => o.value === t)?.label ?? t
              return <Tag key={t}>{label}</Tag>
            })}
          </div>
          <button type="button" className="product-cta" disabled>
            演示模式 · 暂不可投保
          </button>
        </Card>
      ))}

      <SectionTitle icon="⚠️" title="理赔风险提示" desc="投保前请务必了解" />

      {claimRisks.map((risk) => (
        <Card key={risk.id} className={`risk-card risk-card--${risk.severity}`}>
          <div className="risk-head">
            <span className="risk-icon">{risk.severity === 'warning' ? '!' : 'i'}</span>
            <h4>{risk.title}</h4>
            <Badge tone={RISK_TONE[risk.severity] || 'info'}>
              {risk.severity === 'warning' ? '注意' : '提示'}
            </Badge>
          </div>
          <p>{risk.desc}</p>
        </Card>
      ))}

      <Card className="legal-note">
        <p>
          以上产品信息来自本地 Mock 数据，预核保与推荐结果由前端规则引擎生成，不代表任何保险公司官方意见。实际投保以保险公司条款与核保结论为准。
        </p>
      </Card>

      <div className="sticky-footer">
        <Button variant="secondary" full onClick={() => setPage('advice')}>
          返回投保建议
        </Button>
        <Button variant="ghost" full onClick={reset}>
          重新评估
        </Button>
      </div>
    </Layout>
  )
}
