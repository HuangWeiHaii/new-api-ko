import { readFileSync } from 'node:fs'

const readTranslations = (path) =>
  JSON.parse(readFileSync(path, 'utf8')).translation

const classicEn = readTranslations('web/classic/src/i18n/locales/en.json')
const defaultEn = readTranslations('web/default/src/i18n/locales/en.json')
const classic = readTranslations('web/classic/src/i18n/locales/ko-KR.json')
const defaults = readTranslations('web/default/src/i18n/locales/ko.json')

const expectEqual = (actual, expected, description) => {
  if (actual !== expected) {
    throw new Error(
      `${description}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
    )
  }
}

const expectSameKeys = (source, target, description) => {
  const sourceKeys = Object.keys(source)
  const targetKeys = Object.keys(target)
  const missing = sourceKeys.filter((key) => !(key in target))
  const extra = targetKeys.filter((key) => !(key in source))
  if (missing.length || extra.length) {
    throw new Error(
      `${description}: missing=${missing.length}, extra=${extra.length}`,
    )
  }
}

const expectNoChineseValues = (translations, description, allowlist = []) => {
  const allowed = new Set(allowlist)
  const offenders = Object.entries(translations).filter(
    ([key, value]) => !allowed.has(key) && /[\u4e00-\u9fff]/.test(value),
  )
  if (offenders.length) {
    throw new Error(
      `${description}: found ${offenders.length} values with Chinese text, first=${JSON.stringify(offenders[0])}`,
    )
  }
}

expectSameKeys(classicEn, classic, 'classic Korean locale key coverage')
expectSameKeys(defaultEn, defaults, 'default Korean locale key coverage')
expectNoChineseValues(classic, 'classic Korean locale')
expectNoChineseValues(defaults, 'default Korean locale', [
  'Scan the QR code to follow the official account and reply with “验证码” to receive your verification code.',
])

const expectations = [
  [classic, '首页', '홈', 'classic top nav Home'],
  [classic, '控制台', '콘솔', 'classic top nav Console'],
  [classic, '模型广场', '모델 마켓플레이스', 'classic top nav model marketplace'],
  [classic, '文档', '문서', 'classic docs nav item'],
  [classic, '关于', '소개', 'classic about nav item'],
  [classic, '下午好', '안녕하세요', 'classic dashboard greeting'],
  [classic, '账户数据', '계정 데이터', 'classic account data card'],
  [classic, '当前余额', '현재 잔액', 'classic balance label'],
  [classic, '充值', '충전', 'classic top-up button'],
  [classic, '历史消耗', '누적 사용액', 'classic consumption label'],
  [classic, '使用统计', '사용 통계', 'classic usage stats card'],
  [classic, '请求次数', '요청 수', 'classic request count label'],
  [classic, '统计次数', '통계 수', 'classic statistics count label'],
  [classic, '模型数据分析', '모델 데이터 분석', 'classic model analysis card'],
  [classic, '模型消耗分布', '모델 사용량 분포', 'classic model distribution chart'],
  [classic, '系统公告', '시스템 공지', 'classic system notices'],
  [classic, '显示最新20条', '최신 20개 보기', 'classic latest notices badge'],
  [classic, '数据看板', '대시보드', 'classic sidebar dashboard'],
  [classic, '令牌管理', '토큰 관리', 'classic sidebar tokens'],
  [classic, '使用日志', '사용 로그', 'classic sidebar usage logs'],
  [classic, '绘图日志', '그리기 로그', 'classic sidebar drawing logs'],
  [classic, '任务日志', '작업 로그', 'classic sidebar task logs'],
  [classic, '钱包管理', '지갑 관리', 'classic sidebar wallet'],
  [classic, '个人设置', '개인 설정', 'classic sidebar personal settings'],
  [classic, '渠道管理', '채널 관리', 'classic sidebar channels'],
  [classic, '订阅管理', '구독 관리', 'classic sidebar subscriptions'],
  [classic, '模型管理', '모델 관리', 'classic sidebar models'],
  [classic, '模型部署', '모델 배포', 'classic sidebar deployments'],
  [classic, '兑换码管理', '교환 코드 관리', 'classic sidebar redemption codes'],
  [classic, '用户管理', '사용자 관리', 'classic sidebar users'],
  [classic, '系统设置', '시스템 설정', 'classic sidebar system settings'],
  [classic, '统一的', '통합', 'classic landing page heading'],
  [classic, '大模型接口网关', 'LLM API 게이트웨이', 'classic landing page product label'],
  [classic, '获取密钥', '키 받기', 'classic landing page CTA'],
  [classic, 'common.changeLanguage', '언어 변경', 'classic language button'],
  [defaults, 'Dashboard', '대시보드', 'default dashboard label'],
  [defaults, 'Console', '콘솔', 'default console label'],
  [defaults, 'Docs', '문서', 'default docs label'],
  [defaults, 'About', '소개', 'default about label'],
  [defaults, 'Current Balance', '현재 잔액', 'default current balance'],
  [defaults, 'System Settings', '시스템 설정', 'default system settings'],
  [defaults, 'Language Preferences', '언어 설정', 'default language preferences'],
]

for (const [translations, key, expected, description] of expectations) {
  expectEqual(translations[key], expected, description)
}

console.log('Korean locale checks passed')
