// dev-lan 脚本共用的小工具（.sh 和 .ps1 都调用它，所以 IP 的判断只写一份）。
//   node scripts/lan-info.mjs ip            打印本机局域网 IPv4；找不到时退出码 1
//   node scripts/lan-info.mjs qr <url>      在终端打印二维码
// 环境变量 LAN_IP 可以手动指定 IP（电脑有多块网卡、自动选错时用）。
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// 虚拟网卡（虚拟机、Docker、WSL、VPN）的地址手机访问不到，要排除
const VIRTUAL = /vethernet|virtualbox|vmware|vmnet|docker|wsl|hyper-v|loopback|tailscale|zerotier|vpn|tun|tap|utun|bridge|br-|veth/i
// 先试常见的无线 / 有线网卡名
const PREFERRED = /wi-?fi|wlan|wireless|无线|en0|en1|eth|以太网|ethernet/i

const isPrivate = (ip) => /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(ip)

/** @param interfaces os.networkInterfaces() 的返回值 */
export function pickLanAddress(interfaces) {
  const candidates = []
  for (const [name, addresses] of Object.entries(interfaces)) {
    for (const info of addresses || []) {
      if (info.family !== 'IPv4' || info.internal || !isPrivate(info.address)) continue
      if (VIRTUAL.test(name)) continue
      candidates.push({ name, address: info.address })
    }
  }
  const best = (list) => list.find((c) => PREFERRED.test(c.name)) || list.find((c) => c.address.startsWith('192.168.')) || list[0]
  return best(candidates)?.address ?? null
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  const [command, arg] = process.argv.slice(2)
  if (command === 'ip') {
    const ip = process.env.LAN_IP || pickLanAddress(os.networkInterfaces())
    if (!ip) {
      console.error('No LAN address found. Connect to Wi-Fi / Ethernet, or set LAN_IP manually.')
      process.exit(1)
    }
    console.log(ip)
  } else if (command === 'qr' && arg) {
    const require = createRequire(path.join(path.dirname(fileURLToPath(import.meta.url)), '../frontend/package.json'))
    require('qrcode-terminal').generate(arg, { small: true })
  } else {
    console.error('Usage: lan-info.mjs ip | lan-info.mjs qr <url>')
    process.exit(2)
  }
}
