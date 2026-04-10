import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { policyText } = req.body
  if (!policyText) return res.status(400).json({ error: 'Missing policyText' })

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `You are analyzing a corporate expense policy document to extract structured configuration values for an audit and review agent.

Given the policy text below, extract the following values if they are explicitly stated or strongly implied. Return a JSON object with only the fields you can confidently extract — omit any field you're uncertain about.

Fields to extract:
- spendCategories: array of any of ["travel", "software", "procurement", "marketing", "office"] that are mentioned as relevant spend areas
- reviewHighAmount: number — the dollar threshold above which expenses require approval or special review
- autoCloseAmount: number — any small-dollar threshold below which violations might be waived
- anomalyLateDays: number — the number of days after which a late submission is flagged
- reviewRiskTolerance: "low" | "medium" | "high" — inferred from how strict the policy language is

Return ONLY valid JSON with no explanation, no markdown, no code fences. Example:
{"reviewHighAmount": 500, "spendCategories": ["travel", "software"], "anomalyLateDays": 30}

Policy text:
${policyText.slice(0, 8000)}`
        }
      ]
    })

    const raw = message.content[0].text.trim()
    const extracted = JSON.parse(raw)
    res.status(200).json({ extracted })
  } catch (err) {
    console.error('parse-policy error:', err)
    res.status(500).json({ error: 'Failed to parse policy' })
  }
}
