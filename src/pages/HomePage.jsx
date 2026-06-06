import { useApp } from '../context/AppContext'
import { Layout } from '../components/Layout'
import { Card, Button } from '../components/ui'
import './HomePage.css'

const FEATURES = [
  { icon: '📋', title: '健康信息采集', desc: '年龄、健康状况、用药与预算' },
  { icon: '🤖', title: '智能预核保', desc: '规则引擎模拟 AI 核保判断' },
  { icon: '📊', title: '产品类型推荐', desc: '医疗 / 重疾 / 防癌 / 意外组合' },
  { icon: '⚠️', title: '理赔风险提示', desc: '等待期、既往症、免赔额等要点' },
]

export function HomePage() {
  const { setPage } = useApp()

  return (
    <Layout title="健康险智能投保顾问" hideHeader>
      <div className="home">
        <div className="home-hero">
          <div className="home-logo">HS</div>
          <h1 className="home-title">
            HealthSure AI
            <span>健康险智能投保顾问</span>
          </h1>
          <p className="home-desc">
            基于模拟 AI 规则引擎，为您提供预核保判断、产品推荐与理赔风险洞察。纯前端演示，无真实承保效力。
          </p>
        </div>

        <Card className="home-stats">
          <div className="stat-item">
            <strong>5</strong>
            <span>步完成评估</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <strong>6+</strong>
            <span>款产品库</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <strong>AI</strong>
            <span>规则分析</span>
          </div>
        </Card>

        <div className="home-features">
          {FEATURES.map((f) => (
            <div key={f.title} className="feature-row">
              <span className="feature-icon">{f.icon}</span>
              <div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="home-cta">
          <Button full onClick={() => setPage('health')}>
            开始智能投保评估
          </Button>
          <p className="home-disclaimer">
            本演示仅供面试与技术展示，不构成保险销售或核保承诺
          </p>
        </div>
      </div>
    </Layout>
  )
}
