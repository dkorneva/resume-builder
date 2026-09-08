import OpenAI from 'openai'

const ai = new OpenAI({
	apiKey: process.env.CLOUDFLARE_API_TOKEN,
	baseURL: `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/v1`,
})

export default ai
