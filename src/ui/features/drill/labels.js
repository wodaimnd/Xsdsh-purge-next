// Migrated from lib/redteam/client.js; API payloads and page behavior retained.


const POC_CAT_NAME = {
  rce: '远程命令执行', deserialization: '反序列化', 'file-upload': '文件上传 getshell',
  sqli: 'SQL 注入', unauthorized: '未授权访问', 'auth-bypass': '认证绕过 / 越权',
  'weak-password': '弱口令 / 爆破', ssrf: 'SSRF', xxe: 'XXE',
  'path-traversal': '目录穿越 / 任意文件读', 'info-leak': '信息泄露',
  privesc: '提权 / 横向', tunnel: '隧道 / 代理', other: '其它',
}

const POC_CAT_ORDER = Object.keys(POC_CAT_NAME)

const ROLE_LABEL = {
  plan: '主会话（指挥）', recon: '信息收集', assess: '资产梳理',
  'vuln-scan': '漏洞发现', exploit: '漏洞利用', internal: '内网渗透',
}

const TEST_LABEL = { untested: '未测试', testing: '测试中', tested: '已测试', blocked: '被封禁', abandoned: '已放弃', no_surface: '无攻击面' }

const PRI_LABEL = { high: '高', medium: '中', low: '低' }

const SEV_LABEL = { critical: '严重', high: '高危', medium: '中危', low: '低危', info: '信息' }

const STATUS_LABEL = { candidate: '待验证', confirmed: '已确认', 'false-positive': '误报', exploited: '已利用', fixed: '已修复' }

const sevClass = (s) => 'rt-sev rt-sev-' + (SEV_LABEL[s] ? s : 'info')

const STAGE_LABEL = { recon: '信息收集', vuln: '漏洞发现', exploit: '漏洞利用', access: '获得权限', pivot: '内网突破', data: '敏感数据', other: '其他' }

const FILE_KIND = { poc: 'POC', exp: 'EXP', script: '脚本', wordlist: '字典', other: '其他' }

const POC_KIND_LABEL = { poc: 'POC', exp: 'EXP', script: '脚本', template: '模板', payload: '载荷' }

const POC_SOURCE_LABEL = { web: '互联网', self: '手搓', manual: '人工', 'nuclei-template': 'nuclei 模板', kb: '知识库' }

const TEST_STATUS_LABEL = {
  untested: '未测试', testing: '测试中', tested: '已测试',
  blocked: '被封禁', abandoned: '已放弃', no_surface: '无攻击面',
}

export { POC_CAT_NAME, POC_CAT_ORDER, ROLE_LABEL, TEST_LABEL, PRI_LABEL, SEV_LABEL, STATUS_LABEL, sevClass, STAGE_LABEL, FILE_KIND, POC_KIND_LABEL, POC_SOURCE_LABEL, TEST_STATUS_LABEL };
