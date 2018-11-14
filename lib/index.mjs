import Koa from 'koa'
import logger from 'koa-logger'
import PolyfillLibrary from 'polyfill-service-and-library/packages/polyfill-library'

const defaultFeatures = {
  es2015: { flags: ['gated'] },
  es2016: { flags: ['gated'] },
  es2017: { flags: ['gated'] },
  es2018: { flags: ['gated'] },
  default: { flags: ['gated'] },
  Intl: { flags: ['gated'] },
}

const polyfill = new PolyfillLibrary()

const app = new Koa()
app.use(logger())

app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    ctx.status = err.status || 500
    ctx.body = `<h1><big>🐴</big> ${ctx.status}</h1><p>${err}</p>`
  }
})

app.use(async ctx => {
  const {
    method,
    url,
    query: { features, ua, flags },
    header,
  } = ctx.request
  if (method !== 'GET') {
    ctx.throw(405, 'Only GET is supported')
  }
  const match = url.match(/\/polyfill(.min)?.js/)
  if (!match) {
    ctx.throw(404, `Unknown url ${url}. Please go to /polyfill(.min).js`)
  }
  const userAgent = ua || header['user-agent']
  const [, minified] = match
  const queryFeatures =
    features &&
    features
      .split(',')
      .filter(x => x.length)
      .map(x => x.replace(/[*/]/g, ''))
      .sort()
      .reduce((obj, feature) => {
        const [name, ...featureSpecificFlags] = feature.split('|')
        obj[name] = {
          flags: new Set(
            featureSpecificFlags.concat(flags ? flags.split(',') : [])
          ),
        }
        return obj
      }, {})
  ctx.type = 'application/javascript; charset=utf-8'
  try {
    ctx.body = await polyfill.getPolyfillString({
      minify: !!minified,
      features: queryFeatures || defaultFeatures,
      uaString: userAgent,
    })
  } catch (e) {
    ctx.throw(500, 'Polyfill error', e)
  }
})

export default app
