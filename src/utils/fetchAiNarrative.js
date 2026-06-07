/**
 * 请求 Vercel serverless 生成 AI 分析依据（不在前端暴露 API Key）
 */
export async function fetchAiNarrative(payload) {
  const res = await fetch('/api/generateAnalysis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  let data = {}
  try {
    data = await res.json()
  } catch {
    data = {}
  }

  if (!res.ok) {
    const err = new Error(data.error || `generateAnalysis failed: ${res.status}`)
    err.status = data?.status ?? res.status
    err.details = data
    throw err
  }

  const text = data?.analysis ?? data?.text
  if (!text) {
    const err = new Error('generateAnalysis returned empty analysis')
    err.status = res.status
    throw err
  }

  return text
}
