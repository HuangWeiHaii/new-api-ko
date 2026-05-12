import { readFileSync } from 'node:fs'

const readTranslations = (path) =>
  JSON.parse(readFileSync(path, 'utf8')).translation

const classic = readTranslations('web/classic/src/i18n/locales/ko-KR.json')
const defaults = readTranslations('web/default/src/i18n/locales/ko.json')

const expectations = [
  [
    classic,
    '统一的',
    '통합',
    'classic Korean translates the landing page heading',
  ],
  [
    classic,
    '大模型接口网关',
    'LLM API 게이트웨이',
    'classic Korean translates the landing page product label',
  ],
  [
    classic,
    '更好的价格，更好的稳定性，只需要将模型基址替换为：',
    '더 나은 가격과 안정성, 구독 없이 모델 BASE URL만 다음으로 바꾸면 됩니다:',
    'classic Korean translates the landing page subtitle',
  ],
  [classic, '获取密钥', '키 받기', 'classic Korean translates the key CTA'],
  [classic, '文档', '문서', 'classic Korean translates the docs CTA'],
  [
    classic,
    '支持众多的大模型供应商',
    '다양한 LLM 제공업체 지원',
    'classic Korean translates the provider caption',
  ],
  [
    defaults,
    'Language Preferences',
    '언어 설정',
    'default Korean has a real Korean resource',
  ],
]

let failed = false
for (const [translations, key, expected, description] of expectations) {
  const actual = translations[key]
  if (actual !== expected) {
    failed = true
    console.error(`${description}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
  }
}

if (failed) {
  process.exit(1)
}

console.log('Korean locale checks passed')
