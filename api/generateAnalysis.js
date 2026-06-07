/**
 * Vercel Serverless — 环境变量（仅服务端，勿用 VITE_ 前缀）：
 * GEMINI_API_KEY  在 Vercel Project Settings → Environment Variables 中配置
 */

const GEMINI_MODEL = 'gemini-2.0-flash'
const GEMINI_ENV_KEY = 'GEMINI_API_KEY'

function getGeminiApiKey() {
  const value = process.env[GEMINI_ENV_KEY]
  if (typeof value !== 'string') return ''
  return value.trim()
}

function buildPrompt({ profile, riskLevel, uwStatus, profileSummary, sensitiveItems }) {
  const summaryText = (profileSummary || [])
    .map((r) => `${r.label}：${r.value}`)
    .join('；')
  const sensitiveText = (sensitiveItems || [])
    .map((s) => `${s.title}（${s.desc}）`)
    .join('；')

  return `你是一位健康险预核保顾问。请根据以下用户画像，撰写一段中文「分析依据」说明。

【用户摘要】
${summaryText || '无'}

【系统评估】
综合风险等级：${riskLevel?.label || '未知'}（${riskLevel?.level || ''}）
预核保状态：${uwStatus || '未知'}

【核保敏感项】
${sensitiveText || '暂无明显敏感项'}

【原始字段】
年龄：${profile?.age}；用药：${profile?.medication}；预算：${profile?.budget}元/月；保障需求：${(profile?.coverageNeeds || []).join('、')}

【写作要求】
1. 字数 120-180 字，一段完整中文，不要分点列表
2. 语气专业、谨慎，像健康险预核保顾问
3. 必须解释为何属于当前低/中/高风险等级
4. 必须提及年龄、既往症/慢病、用药、预算、保障需求等核保敏感因素（结合数据有则写）
5. 禁止使用「保证投保」「保证理赔」「一定能买」「一定能赔」等绝对化表述
6. 必须包含「AI 预核保辅助建议」和「最终以保险公司核保和正式合同为准」等合规表达
7. 只输出正文，不要标题、不要 markdown`
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = getGeminiApiKey()
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' })
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const prompt = buildPrompt(body)

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 320,
          },
        }),
      },
    )

    if (!geminiRes.ok) {
      const errText = await geminiRes.text()
      console.error('Gemini API error:', geminiRes.status, errText)
      return res.status(502).json({ error: 'Gemini API request failed' })
    }

    const data = await geminiRes.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

    if (!text) {
      return res.status(502).json({ error: 'Empty response from Gemini' })
    }

    return res.status(200).json({ text })
  } catch (err) {
    console.error('generateAnalysis error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
