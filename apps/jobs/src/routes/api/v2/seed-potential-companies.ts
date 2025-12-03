import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { getDbFromContext, schema } from '../../../db/db'

export const POTENTIAL_COMPANIES = [
  // --- AI & Machine Learning (Top Priority) ---
  'openai', 'anthropic', 'cohere', 'huggingface', 'stability-ai', 'midjourney', 'runway', 'character-ai',
  'replicate', 'scale-ai', 'labelbox', 'weights-biases', 'roboflow', 'landing-ai', 'jasper', 'copy-ai',
  'synthesia', 'descript', 'elevenlabs', 'tome', 'gamma', 'perplexity', 'you-com', 'adept',
  'inflection', 'mistral', 'together-ai', 'anyscale', 'mosaicml', 'grid-ai', 'octoai', 'modal',
  'banana', 'baseten', 'cerebras', 'sambanova', 'graphcore', 'groq', 'tenstorrent', 'si-five',

  // --- Developer Tools & Infrastructure ---
  'github', 'gitlab', 'bitbucket', 'sourcegraph', 'linear', 'notion', 'coda', 'airtable',
  'retool', 'airplane', 'temporal', 'prefect', 'dagster', 'airbyte', 'fivetran', 'segment',
  'vercel', 'netlify', 'cloudflare', 'fastly', 'akamai', 'render', 'railway', 'fly-io',
  'heroku', 'digitalocean', 'linode', 'vultr', 'hetzner', 'scaleway', 'ngrok', 'tailscale',
  'warp', 'raycast', 'superhuman', 'cron', 'clockwise', 'calendly', 'savvycal', 'cal-com',
  'postman', 'insomnia', 'swagger', 'readme', 'stoplight', 'apollo-graphql', 'hasura', 'prisma',
  'drizzle-orm', 'supabase', 'planetscale', 'neon', 'cockroachdb', 'mongodb', 'redis', 'elastic',
  'snowflake', 'databricks', 'firebolt', 'clickhouse', 'timescale', 'influxdata', 'questdb', 'materialize',
  'confluent', 'redpanda', 'upstash', 'fauna', 'surrealdb', 'edgedb', 'xata', 'nhost',

  // --- Monitoring, Security & Auth ---
  'datadog', 'newrelic', 'dynatrace', 'splunk', 'sentry', 'rollbar', 'bugsnag', 'honeycomb',
  'logrocket', 'fullstory', 'hotjar', 'mixpanel', 'amplitude', 'heap', 'posthog', 'statsig',
  'launchdarkly', 'split', 'optimizely', 'vwo', 'pendo', 'walkme', 'whatfix', 'user-guiding',
  'okta', 'auth0', '1password', 'bitwarden', 'lastpass', 'dashlane', 'keeper', 'nord-security',
  'crowdstrike', 'palo-alto-networks', 'fortinet', 'zscaler', 'cloudflare-one', 'wiz', 'lacework', 'orca-security',
  'snyk', 'checkmarx', 'veracode', 'hackerone', 'bugcrowd', 'synk', 'tessian', 'abnormal-security',
  'drata', 'vanta', 'secureframe', 'sprinto', 'tugboat', 'hyperproof', 'auditboard',

  // --- Fintech & Payments ---
  'stripe', 'square', 'adyen', 'checkout', 'plaid', 'marqeta', 'affirm', 'klarna',
  'brex', 'ramp', 'mercury', 'unit', 'modern-treasury', 'increase', 'lithic', 'treasury-prime',
  'alloy', 'persona', 'socure', 'onfido', 'trulioo', 'sumsub', 'veriff', 'id-me',
  'wise', 'remitly', 'worldremit', 'flywire', 'payoneer', 'bill-com', 'expensify', 'navan',
  'robinhood', 'webull', 'public', 'acorns', 'betterment', 'wealthfront', 'sofi', 'chime',
  'current', 'monzo', 'revolut', 'n26', 'starling', 'nubank', 'uphold', 'etoro',

  // --- Crypto & Web3 ---
  'coinbase', 'kraken', 'gemini', 'blockchain', 'opensea', 'alchemy', 'quicknode', 'infura',
  'chainalysis', 'fireblocks', 'anchorage', 'ledger', 'metamask', 'rainbow', 'phantom', 'argent',
  'uniswap', 'aave', 'compound', 'makerdao', 'curve', 'lido', 'rocket-pool', 'frax',
  'polygon', 'optimism', 'arbitrum', 'zksync', 'starkware', 'scroll', 'base', 'linea',
  'solana', 'near', 'avalanche', 'cosmos', 'polkadot', 'aptos', 'sui', 'celestia',

  // --- E-commerce & Retail ---
  'shopify', 'amazon', 'ebay', 'etsy', 'wayfair', 'chewy', 'instacart', 'doordash',
  'uber-eats', 'grubhub', 'postmates', 'gopuff', 'getir', 'gorillas', 'flink', 'zepto',
  'faire', 'tundra', 'abound', 'creoate', 'ankorstore', 'order-champ', 'range-me',
  'whatnot', 'popshop-live', 'ntwrk', 'shop-shops', 'comment-sold', 'livescale', 'bambuser',

  // --- SaaS & Enterprise ---
  'salesforce', 'hubspot', 'pipedrive', 'close', 'apollo', 'outreach', 'salesloft', 'zoominfo',
  'gong', 'chorus-ai', 'clari', 'troops', 'dooly', 'grain', 'avoma', 'fathom',
  'zendesk', 'intercom', 'drift', 'front', 'helpscout', 'gorgias', 'kustomer', 'gladly',
  'atlassian', 'asana', 'monday', 'clickup', 'wrike', 'smartsheet', 'airtable', 'notion',
  'slack', 'discord', 'zoom', 'microsoft-teams', 'webex', 'miro', 'figma', 'canva',
  'loom', 'mmhmm', 'around', 'whereby', 'descript', 'otter-ai', 'fireflies', 'supernormal',

  // --- HR, Recruiting & Legal ---
  'greenhouse', 'lever', 'ashby', 'workable', 'bamboohr', 'gusto', 'rippling', 'deel',
  'remote', 'oyster', 'carta', 'pulley', 'shareworks', 'equity-zen', 'ltse', 'angelist',
  'checkr', 'goodhire', 'fountain', 'paradox', 'gem', 'hireez', 'seekout', 'humanly',
  'ironclad', 'linksquares', 'contractbook', 'juro', 'spotdraft', 'lexion', 'logikcull', 'everlaw',

  // --- Health, Bio & Science ---
  'oscar-health', 'devoted-health', 'bright-health', 'clover-health', 'cityblock', 'oak-street',
  'ro', 'hims', 'nurx', 'cerebral', 'talkspace', 'betterhelp', 'headway', 'alma',
  'modern-health', 'lyra', 'spring-health', 'carrot', 'maven', 'kindbody', 'progyny',
  'benchling', 'synthace', 'insitro', 'recursion', 'ginkgo', 'zymergen', 'twist-bioscience',
  'color', 'invitae', '23andme', 'ancestry', 'helix', 'grail', 'freenome', 'guardant',

  // --- Education & EdTech ---
  'coursera', 'udemy', 'skillshare', 'masterclass', 'pluralsight', 'datacamp', 'codecademy',
  'brilliant', 'duolingo', 'babbel', 'rosetta-stone', 'busuu', 'lingoda', 'preply',
  'outschool', 'byjus', 'vipkid', 'quizlet', 'kahoot', 'course-hero', 'chegg', 'brainly',
  'guild', 'handshake', 'multiverse', 'springboard', 'thinkful', 'general-assembly', 'lambda-school',

  // --- Gaming, Media & Entertainment ---
  'roblox', 'epic-games', 'unity', 'unreal', 'riot-games', 'activision', 'ea', 'ubisoft',
  'take-two', 'zynga', 'playtika', 'scopely', 'supercell', 'king', 'niantic', 'rec-room',
  'netflix', 'spotify', 'hulu', 'disney', 'paramount', 'peacock', 'max', 'apple-tv',
  'tiktok', 'youtube', 'twitch', 'vimeo', 'dailymotion', 'wistia', 'brightcove', 'jwplayer',
  'reddit', 'pinterest', 'snapchat', 'twitter', 'meta', 'linkedin', 'nextdoor', 'discord',

  // --- Travel, Real Estate & Logistics ---
  'airbnb', 'booking', 'expedia', 'tripadvisor', 'kayak', 'hopper', 'skyscanner', 'getyourguide',
  'zillow', 'redfin', 'compass', 'opendoor', 'offerpad', 'knock', 'homelight', 'pacaso',
  'uber', 'lyft', 'flexport', 'convoy', 'transfix', 'project44', 'fourkites', 'shippo',
  'deliverr', 'stord', 'flock-freight', 'leaf-logistics', 'coyote', 'echo', 'ch-robinson',

  // --- Climate & Hard Tech ---
  'climeworks', 'carbon-engineering', 'watershed', 'persefoni', 'patch', 'wren', 'running-tide',
  'impossible-foods', 'beyond-meat', 'oatly', 'perfect-day', 'upside-foods', 'eat-just', 'bowery',
  'tesla', 'rivian', 'lucid', 'polestar', 'waymo', 'cruise', 'zoox', 'aurora',
  'spacex', 'blue-origin', 'rocket-lab', 'astra', 'relativity-space', 'varda', 'hadrian', 'anduril'
];

export const Route = createFileRoute('/api/v2/seed-potential-companies')({
  server: {
    handlers: {
      POST: async ({ context }) => {
        try {
          const ctx = context as any
          const db = await getDbFromContext(ctx)

          let added = 0;
          let skipped = 0;

          for (const slug of POTENTIAL_COMPANIES) {
            try {
              await db.insert(schema.potentialCompanies).values({
                id: crypto.randomUUID(),
                slug,
                status: 'pending',
                checkCount: 0
              });
              added++;
            } catch (error: any) {
              if (error.message?.includes('UNIQUE constraint')) {
                skipped++;
              } else {
                console.error(`Error adding ${slug}:`, error.message);
              }
            }
          }

          return json({
            success: true,
            total: POTENTIAL_COMPANIES.length,
            added,
            skipped,
            message: `Seeded ${added} companies, skipped ${skipped} duplicates`
          });
        } catch (error) {
          console.error('Seed failed:', error)
          return json(
            {
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error occurred'
            },
            { status: 500 }
          )
        }
      }
    }
  }
})
