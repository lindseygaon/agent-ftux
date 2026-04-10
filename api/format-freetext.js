import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { section, context, freetext } = req.body
  if (!freetext?.trim()) return res.status(200).json({ formatted: '' })

  const sectionPrompts = {
    fraudSignals: `You are formatting additional fraud signal rules for an audit agent configuration document.
The user has described, in their own words, additional fraud signals they want the audit agent to flag.
Convert their input into 1-5 concise bullet points or markdown table rows that fit naturally after this existing table:

| Signal | Enabled | Risk Level |
|--------|---------|------------|
(existing rows omitted)

For each signal identified, output a markdown table row in exactly this format:
| <signal description> | Yes | <High/Medium/Low> |

Assign risk levels based on severity: High for clear fraud indicators, Medium for suspicious patterns, Low for procedural concerns.
Return ONLY the markdown table rows, one per line, no explanation.`,

    spendingAnomalies: `You are formatting additional spending anomaly rules for an audit agent configuration document.
The user has described, in their own words, additional anomalies they want the audit agent to flag.
Convert their input into concise markdown table rows that fit naturally after this existing table:

| Anomaly | Enabled | Threshold | Risk Level |
|---------|---------|-----------|------------|
(existing rows omitted)

For each anomaly identified, output a markdown table row in exactly this format:
| <anomaly description> | Yes | <threshold or —> | <High/Medium/Low> |

Return ONLY the markdown table rows, one per line, no explanation.`,

    autoClose: `You are formatting additional auto-close rules for a case review SOP document.
The user has described, in their own words, additional conditions under which cases should be automatically closed without human review.
Convert their input into concise bullet points.

Format each rule as a single bullet point starting with "- ".
Be specific and actionable. Do not include rules that would auto-close fraud signals.
Return ONLY the bullet points, one per line, no explanation.`
  }

  const systemPrompt = sectionPrompts[section]
  if (!systemPrompt) return res.status(400).json({ error: 'Invalid section' })

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: `${systemPrompt}

${context ? `Context about this company's setup: ${context}\n\n` : ''}User input: ${freetext}`
        }
      ]
    })

    res.status(200).json({ formatted: message.content[0].text.trim() })
  } catch (err) {
    console.error('format-freetext error:', err)
    res.status(500).json({ error: 'Failed to format freetext' })
  }
}
