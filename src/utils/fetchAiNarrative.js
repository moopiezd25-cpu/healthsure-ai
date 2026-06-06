/**
 * 请求 Vercel serverless 生成 AI 分析依据（不在前端暴露 API Key）
 */
export async function fetchAiNarrative(payload, signal) {
  const res = await fetch('/api/generateAnalysis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  })

  if (!res.ok) {
    throw new Error(`generateAnalysis failed: ${res.status}`)
  }

  const data = await res.json()
  if (!data?.text) {
    throw new Error('generateAnalysis returned empty text')
  }

  return data.text
}
