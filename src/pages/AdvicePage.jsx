import { useApp } from '../context/AppContext'
import { Layout } from '../components/Layout'
import { Card, Button, SectionTitle } from '../components/ui'
import './AdvicePage.css'

export function AdvicePage() {
  const { analysis, profile, setPage } = useApp()

  if (!analysis) {
    return (
      <Layout title="投保建议" showBack>
        <Card>
          <p>请先完成 AI 分析。</p>
          <Button full onClick={() => setPage('health')}>
            开始评估
          </Button>
        </Card>
      </Layout>
    )
  }

  const { adviceSummary, budgetAllocation, underwriting, productTypes } = analysis

  return (
    <Layout title="投保建议" subtitle="个性化配置方案摘要" showBack showProgress>
      <Card highlight>
        <p className="advice-summary">{adviceSummary}</p>
      </Card>

      <SectionTitle icon="📐" title="预算分配建议" desc={`基于月预算 ${profile.budget} 元`} />

      <Card>
        <div className="budget-bars">
          {budgetAllocation.map((item) => (
            <div key={item.name} className="budget-bar-item">
              <div className="budget-bar-head">
                <span>{item.name}</span>
                <strong>约 {item.amount} 元/月</strong>
              </div>
              <div className="budget-bar-track">
                <div
                  className="budget-bar-fill"
                  style={{ width: `${item.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <SectionTitle icon="✅" title="配置优先级" />

      <Card>
        <ol className="priority-list">
          {productTypes.map((pt, i) => (
            <li key={pt.type}>
              <span className="priority-num">{i + 1}</span>
              <div>
                <strong>{pt.type}</strong>
                <p>{pt.reason}</p>
              </div>
            </li>
          ))}
        </ol>
      </Card>

      <SectionTitle icon="📝" title="下一步行动" />

      <Card>
        <ul className="action-list">
          <li>
            {underwriting.status === 'pass'
              ? '可优先在线投保百万医疗，并补充重疾/防癌保障。'
              : '建议准备体检报告与病历，尝试智能核保或人工核保通道。'}
          </li>
          <li>仔细阅读健康告知与免责条款，确保理赔预期一致。</li>
          <li>保留社保连续缴纳，商保理赔通常需社保结算单。</li>
        </ul>
      </Card>

      <div className="sticky-footer">
        <Button full onClick={() => setPage('products')}>
          查看产品推荐与风险提示
        </Button>
      </div>
    </Layout>
  )
}
