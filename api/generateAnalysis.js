const GEMINI_MODEL = 'gemini-3.5-flash'
const GEMINI_TIMEOUT_MS = 10_000

function getApiKey() {
  const key = process.env.GEMINI_API_KEY
  return typeof key === 'string' ? key.trim() : ''
}

function buildPrompt(profile) {
  const age = profile.age ?? '未知'
  const health = profile.healthStatus ?? '未知'
  const medication = profile.medication ?? '未知'
  const budget = profile.budget ?? '未知'
  const needs = Array.isArray(profile.coverageNeeds)
    ? profile.coverageNeeds.join('、')
    : '未知'

  return `你是健康险预核保顾问。根据用户画像写一段中文分析依据（120-180字）。
年龄${age}岁，健康${health}，用药${medication}，预算${budget}元/月，保障需求${needs}。
须解释风险等级原因，提及核保敏感项，语气专业谨慎。
禁止「保证投保」「保证理赔」「一定能买」。
须含「AI预核保辅助建议」和「最终以保险公司核保和正式合同为准」。
只输出正文。`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = getApiKey()
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' })
  }

  try {
    const body =
      typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
    const profile = body.profile || body

    if (!profile || typeof profile !== 'object' || Object.keys(profile).length === 0) {
      return res.status(400).json({ error: 'Missing profile' })
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS)

    let response
    try {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts: [{ text: buildPrompt(profile) }] }],
            generationConfig: {
              temperature: 0.5,
              maxOutputTokens: 320,
            },
          }),
        },
      )
    } finally {
      clearTimeout(timeoutId)
    }

    let data = null
    try {
      data = await response.json()
    } catch {
      data = { parseError: 'Response was not valid JSON' }
    }

    if (!response.ok) {
      return res.status(502).json({
        error: 'Gemini API error',
        status: response.status,
        details: data,
      })
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
    if (!text) {
      return res.status(502).json({
        error: 'Gemini API error',
        status: response.status,
        details: data ?? { message: 'Empty response from Gemini' },
      })
    }

    return res.status(200).json({
      analysis: text,
      source: 'gemini',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return res.status(500).json({
      error: 'Server error',
      details: message,
    })
  }
}
