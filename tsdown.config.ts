import { clientBundle } from '../tsdown.client.ts'

export default clientBundle(
  '@deepseek-ai/dsh-beautify',
  ['lib/types/index.js', 'lib/types/invariant.js'],
)
