import {NextStudio} from 'next-sanity/studio'
import config from '../../../../sanity.config'
import {metadata as studioMetadata} from 'next-sanity/studio'
import {viewport as studioViewport} from 'next-sanity/studio'

export const dynamic = 'force-static'

export {studioMetadata as metadata}
export {studioViewport as viewport}

export default function StudioPage() {
  return <NextStudio config={config} />
}
