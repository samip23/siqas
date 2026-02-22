const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const SYSTEM_PROMPT = `You are a senior QA engineer with deep expertise in writing comprehensive test cases.
Given a list of business requirements, generate clear, actionable test cases that cover:
- Happy path (standard successful flow)
- Negative cases (invalid input, unauthorised access, missing data)
- Edge cases (boundary values, empty states, maximum limits)

Respond ONLY with a valid JSON array. No markdown fences, no explanation — raw JSON only.

Each test case must follow this exact schema:
{
  "id": "TC-001",
  "requirementId": "<the requirement's id field>",
  "name": "<concise test case name, max 10 words>",
  "description": "<one-sentence description of what is being verified>",
  "steps": ["Step 1: ...", "Step 2: ...", "Step 3: ..."],
  "expectedResult": "<what the system should do or display>",
  "priority": "High" | "Medium" | "Low",
  "type": "Functional" | "Negative" | "Edge Case" | "Integration"
}`

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return {
      statusCode: 503,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'ANTHROPIC_API_KEY is not configured. Add it to your Netlify environment variables.' }),
    }
  }

  let requirements
  try {
    ;({ requirements } = JSON.parse(event.body))
    if (!Array.isArray(requirements) || requirements.length === 0) throw new Error('empty')
  } catch {
    return {
      statusCode: 400,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Request body must include a non-empty requirements array.' }),
    }
  }

  const userPrompt = `Generate comprehensive test cases for the following ${requirements.length} business requirement(s). Aim for 2–3 test cases per requirement.

Requirements:
${JSON.stringify(requirements, null, 2)}

Remember: respond with ONLY a raw JSON array of test case objects.`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      return {
        statusCode: res.status,
        headers: { ...CORS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: data.error?.message ?? 'Anthropic API error.' }),
      }
    }

    const raw = data.content?.[0]?.text?.trim() ?? ''
    const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()

    let testCases
    try {
      testCases = JSON.parse(cleaned)
      if (!Array.isArray(testCases)) throw new Error('not an array')
    } catch {
      return {
        statusCode: 502,
        headers: { ...CORS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'AI returned an unexpected format. Please try again.' }),
      }
    }

    return {
      statusCode: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ testCases }),
    }
  } catch (err) {
    return {
      statusCode: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message ?? 'Unexpected error.' }),
    }
  }
}
