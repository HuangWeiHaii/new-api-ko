import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const jobs = [
  {
    name: 'classic',
    source: 'web/classic/src/i18n/locales/en.json',
    target: 'web/classic/src/i18n/locales/ko-KR.json',
    progress: '.ko-classic-progress.json',
    legacyProgress: '.ko-translation-progress.json',
    lang: 'en',
  },
  {
    name: 'default',
    source: 'web/default/src/i18n/locales/en.json',
    target: 'web/default/src/i18n/locales/ko.json',
    progress: '.ko-default-progress.json',
    lang: 'en',
  },
]

const manual = {
  Home: '홈',
  '首页': '홈',
  Console: '콘솔',
  '控制台': '콘솔',
  Dashboard: '대시보드',
  '数据看板': '대시보드',
  Chat: '채팅',
  '聊天': '채팅',
  Playground: '플레이그라운드',
  '操练场': '플레이그라운드',
  'Model Marketplace': '모델 마켓플레이스',
  '模型广场': '모델 마켓플레이스',
  Docs: '문서',
  '文档': '문서',
  About: '소개',
  '关于': '소개',
  'Good morning': '좋은 아침입니다',
  'Good afternoon': '안녕하세요',
  'Good evening': '좋은 저녁입니다',
  '上午好': '좋은 아침입니다',
  '下午好': '안녕하세요',
  '晚上好': '좋은 저녁입니다',
  'Account Data': '계정 데이터',
  '账户数据': '계정 데이터',
  'Current balance': '현재 잔액',
  '当前余额': '현재 잔액',
  'Top Up': '충전',
  '充值': '충전',
  Consumption: '누적 사용액',
  '历史消耗': '누적 사용액',
  'Usage Statistics': '사용 통계',
  '使用统计': '사용 통계',
  'Number of Requests': '요청 수',
  '请求次数': '요청 수',
  'Statistical count': '통계 수',
  '统计次数': '통계 수',
  'Model Data Analysis': '모델 데이터 분석',
  '模型数据分析': '모델 데이터 분석',
  'Model consumption distribution': '모델 사용량 분포',
  '模型消耗分布': '모델 사용량 분포',
  Total: '합계',
  '总计': '합계',
  'System Notice': '시스템 공지',
  '系统公告': '시스템 공지',
  'Show latest 20': '최신 20개 보기',
  '显示最新20条': '최신 20개 보기',
  'Token Management': '토큰 관리',
  '令牌管理': '토큰 관리',
  'Usage Logs': '사용 로그',
  '使用日志': '사용 로그',
  'Drawing Logs': '그리기 로그',
  '绘图日志': '그리기 로그',
  'Task Logs': '작업 로그',
  '任务日志': '작업 로그',
  'Wallet Management': '지갑 관리',
  '钱包管理': '지갑 관리',
  'Personal Settings': '개인 설정',
  '个人设置': '개인 설정',
  'Channel Management': '채널 관리',
  '渠道管理': '채널 관리',
  'Subscription Management': '구독 관리',
  '订阅管理': '구독 관리',
  'Model Management': '모델 관리',
  '模型管理': '모델 관리',
  'Model Deployment': '모델 배포',
  '模型部署': '모델 배포',
  'Redemption Code Management': '교환 코드 관리',
  '兑换码管理': '교환 코드 관리',
  'User Management': '사용자 관리',
  '用户管理': '사용자 관리',
  System: '시스템',
  'System Settings': '시스템 설정',
  '系统设置': '시스템 설정',
  Unified: '통합',
  '统一的': '통합',
  'LLM API Gateway': 'LLM API 게이트웨이',
  '大模型接口网关': 'LLM API 게이트웨이',
  'Get API Key': '키 받기',
  '获取密钥': '키 받기',
  'Change language': '언어 변경',
  'common.changeLanguage': '언어 변경',
  'Language Preferences': '언어 설정',
  '语言偏好': '언어 설정',
  'Interface Language': '인터페이스 언어',
  'Select language': '언어 선택',
  'Language preference saved': '언어 설정이 저장되었습니다',
  'Failed to update settings': '설정 업데이트에 실패했습니다',
  'Data Dashboard': '데이터 대시보드',
  'Console Area': '콘솔 영역',
  Admin: '관리자',
  Administrator: '관리자',
  '管理员': '관리자',
  'Personal Center': '개인 센터',
  '个人中心': '개인 센터',
}

const brandLike = [
  /^https?:\/\//i,
  /^\/[\w-]/,
  /^[\w.-]+@[\w.-]+$/,
  /^sk-/i,
  /^gpt-/i,
  /^claude-/i,
  /^gemini-/i,
  /^o\d/i,
  /^API$/i,
  /^API Key$/i,
  /^JSON$/i,
  /^URL$/i,
  /^USD$/i,
  /^New API$/i,
  /^OpenAI$/i,
  /^Claude$/i,
  /^Gemini$/i,
  /^DeepSeek$/i,
  /^Redis$/i,
  /^PostgreSQL$/i,
]

const placeholderRegexes = [
  /\{\{[^}]+\}\}/g,
  /\{[A-Za-z_][A-Za-z0-9_]*\}/g,
  /`[^`]+`/g,
  /https?:\/\/[^\s"')，。]+/g,
  /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g,
]

const separator = '\n===KO_I18N_ITEM===\n'

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8')).translation
}

function stableJson(translation) {
  return JSON.stringify({ translation }, null, 2) + '\n'
}

function readProgress(job) {
  for (const path of [job.progress, job.legacyProgress, job.target]) {
    if (!path || !existsSync(path)) continue
    try {
      return readJson(path)
    } catch {
      // Continue to the next possible progress file.
    }
  }
  return {}
}

function shouldKeep(value) {
  if (!value) return true
  if (brandLike.some((re) => re.test(value))) return true
  if (/^[\s\d.,:;()[\]{}'"`~!@#$%^&*_+=|\\/<>?-]+$/.test(value)) return true
  if (/^\s*[{[]/.test(value) && /[}\]]\s*$/.test(value)) return true
  return false
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

function requestGoogle(text, lang) {
  const args = [
    '-NoProfile',
    '-Command',
    `$u='https://translate.googleapis.com/translate_a/single?client=gtx&sl=${lang}&tl=ko&dt=t&q=' + [uri]::EscapeDataString(@'
${text}
'@); (Invoke-WebRequest -UseBasicParsing -Uri $u -TimeoutSec 60).Content`,
  ]
  return execFileSync('powershell', args, {
    encoding: 'utf8',
    maxBuffer: 4 * 1024 * 1024,
  })
}

function clean(text) {
  return text.replace(/\s+([,.!?;:])/g, '$1').trim()
}

function isReusable(current, key, sourceValue) {
  return current && current !== key && current !== sourceValue && !/[\u4e00-\u9fff]/.test(current)
}

function flush(job, out) {
  writeFileSync(job.progress, stableJson(out), 'utf8')
}

function translateBatch(items, lang) {
  const protectedItems = items.map((item) => protect(item.text))
  const request = protectedItems.map((item) => item.text).join(separator)
  const body = requestGoogle(request, lang)
  const translated = parseGoogle(body)
  const rawParts = translated.split(separator.trim())

  if (rawParts.length !== items.length) {
    return null
  }

  return rawParts.map((part, index) => clean(restore(part, protectedItems[index].tokens)))
}

function translateOne(item, lang) {
  const protectedItem = protect(item.text)
  const body = requestGoogle(protectedItem.text, lang)
  return clean(restore(parseGoogle(body), protectedItem.tokens))
}

function buildPending(entries, existing) {
  const pending = []
  for (const [key, sourceValue] of entries) {
    if (Object.hasOwn(existing, key)) continue
    if (manual[key]) {
      existing[key] = manual[key]
      continue
    }
    const text = sourceValue || key
    if (manual[text]) {
      existing[key] = manual[text]
      continue
    }
    if (shouldKeep(text)) {
      existing[key] = text
      continue
    }
    pending.push({ key, text })
  }
  return pending
}

function generate(job) {
  console.log(`Generating ${job.name}`)
  const source = readJson(job.source)
  const existingTarget = readJson(job.target)
  const progress = readProgress(job)
  const out = {}

  for (const key of Object.keys(source)) {
    const current = progress[key] ?? existingTarget[key]
    if (isReusable(current, key, source[key])) {
      out[key] = current
    }
  }

  const entries = Object.entries(source)
  let pending = buildPending(entries, out)
  console.log(`${job.name}: ${Object.keys(out).length}/${entries.length} already available, ${pending.length} pending`)

  let completed = Object.keys(out).length
  const batchSize = 25
  while (pending.length > 0) {
    const batch = pending.splice(0, batchSize)
    try {
      const translated = translateBatch(batch, job.lang)
      if (!translated) throw new Error('Batch split mismatch')
      for (let i = 0; i < batch.length; i += 1) {
        out[batch[i].key] = translated[i]
      }
    } catch {
      for (const item of batch) {
        out[item.key] = translateOne(item, job.lang)
      }
    }

    completed += batch.length
    if (completed % 100 < batchSize || pending.length === 0) {
      console.log(`${job.name}: ${completed}/${entries.length}`)
      flush(job, out)
    }
  }

  writeFileSync(job.target, stableJson(out), 'utf8')
  flush(job, out)
}

for (const job of jobs) {
  generate(job)
}
