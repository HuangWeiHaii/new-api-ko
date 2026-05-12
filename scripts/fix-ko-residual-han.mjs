import { readFileSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const targetPath = 'web/classic/src/i18n/locales/ko-KR.json'
const zhPath = 'web/classic/src/i18n/locales/zh-CN.json'
const target = JSON.parse(readFileSync(targetPath, 'utf8')).translation
const zh = JSON.parse(readFileSync(zhPath, 'utf8')).translation

const manual = {
  '（共 {{total}} 个，省略 {{omit}} 个）': '총 {{total}}개, {{omit}}개 생략',
  '（共 {{total}} 个）': '총 {{total}}개',
  '{{count}} 项操作': '{{count}}개 작업',
  'API 密钥 (沙盒)': 'API 키(샌드박스)',
  'API 密钥 (生产)': 'API 키(프로덕션)',
  'RSA 私钥 (沙盒)': 'RSA 개인 키(샌드박스)',
  'RSA 私钥 (生产)': 'RSA 개인 키(프로덕션)',
  'Waffo API 参数，可空，例如：CREDITCARD,DEBITCARD（最多64位）': 'Waffo API 매개변수, 비워 둘 수 있음. 예: CREDITCARD,DEBITCARD(최대 64자)',
  'Waffo API 参数，可空（最多64位）': 'Waffo API 매개변수, 비워 둘 수 있음(최대 64자)',
  'Waffo 充值的最低数量，默认 1': 'Waffo 충전 최소 수량, 기본값 1',
  'Waffo 公钥 (沙盒)': 'Waffo 공개 키(샌드박스)',
  'Waffo 公钥 (生产)': 'Waffo 공개 키(프로덕션)',
  'Waffo 商户 ID': 'Waffo 판매자 ID',
  '例如：Credit Card': '예: Credit Card',
  '沙盒': '샌드박스',
  '生产': '프로덕션',
  '默认': '기본값',
  '单价 (USD)': '단가(USD)',
  '删除已选 {{selected}} / {{total}}': '선택 항목 삭제 {{selected}} / {{total}}',
  '新增已选 {{selected}} / {{total}}': '선택 항목 추가 {{selected}} / {{total}}',
}

const placeholderRegexes = [
  /\{\{[^}]+\}\}/g,
  /\{[A-Za-z_][A-Za-z0-9_]*\}/g,
  /`[^`]+`/g,
  /https?:\/\/[^\s"')，。]+/g,
  /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g,
]

function stableJson(translation) {
  return JSON.stringify({ translation }, null, 2) + '\n'
}

function protect(text) {
  const tokens = []
  let result = text
  for (const re of placeholderRegexes) {
    result = result.replace(re, (match) => {
      const token = `__PH${tokens.length}__`
      tokens.push([token, match])
      return token
    })
  }
  return { text: result, tokens }
}

function restore(text, tokens) {
  let result = text
  for (const [token, value] of tokens) {
    result = result.replaceAll(token, value)
    result = result.replaceAll(token.toLowerCase(), value)
  }
  return result
}

function parseGoogle(body) {
  const data = JSON.parse(body)
  if (!Array.isArray(data?.[0])) return ''
  return data[0].map((part) => part?.[0] || '').join('')
}

function requestGoogle(text) {
  const args = [
    '-NoProfile',
    '-Command',
    `$u='https://translate.googleapis.com/translate_a/single?client=gtx&sl=zh-CN&tl=ko&dt=t&q=' + [uri]::EscapeDataString(@'
${text}
'@); (Invoke-WebRequest -UseBasicParsing -Uri $u -TimeoutSec 60).Content`,
  ]
  return execFileSync('powershell', args, {
    encoding: 'utf8',
    maxBuffer: 4 * 1024 * 1024,
  })
}

function sourceFor(key) {
  if (zh[key]) return zh[key]
  return zh[key.replace(/_(one|other)$/, '')] || key.replace(/_(one|other)$/, '')
}

function translateChinese(text) {
  if (manual[text]) return manual[text]
  const { text: protectedText, tokens } = protect(text)
  const translated = parseGoogle(requestGoogle(protectedText))
  return restore(translated, tokens).replace(/\s+([,.!?;:])/g, '$1').trim()
}

let changed = 0
for (const [key, value] of Object.entries(target)) {
  if (!/[\u4e00-\u9fff]/.test(value)) continue
  const suffix = key.match(/_(one|other)$/)?.[0] || ''
  const source = sourceFor(key)
  const translated = translateChinese(source)
  target[key] = translated + suffix
  changed += 1
}

writeFileSync(targetPath, stableJson(target), 'utf8')
console.log(`Re-translated ${changed} residual Chinese values`)
