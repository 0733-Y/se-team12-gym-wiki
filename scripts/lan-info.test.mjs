// 运行：node --test scripts/
import assert from 'node:assert/strict'
import test from 'node:test'
import { pickLanAddress } from './lan-info.mjs'

const nic = (address, internal = false) => [{ family: 'IPv4', address, internal }]

test('只有一块网卡时选它', () => {
  assert.equal(pickLanAddress({ '以太网': nic('192.168.50.142'), Loopback: nic('127.0.0.1', true) }), '192.168.50.142')
})

test('跳过虚拟网卡', () => {
  const picked = pickLanAddress({
    'vEthernet (WSL)': nic('172.20.0.1'),
    'VirtualBox Host-Only Network': nic('192.168.56.1'),
    docker0: nic('172.17.0.1'),
    'Wi-Fi': nic('192.168.0.23'),
  })
  assert.equal(picked, '192.168.0.23')
})

test('有 Wi-Fi 和其他网卡时优先 Wi-Fi 命名的', () => {
  assert.equal(pickLanAddress({ other0: nic('10.1.1.5'), 'Wi-Fi': nic('192.168.1.8') }), '192.168.1.8')
})

test('跳过非私有地址和 169.254 自动地址', () => {
  assert.equal(pickLanAddress({ eth0: nic('169.254.3.4'), eth1: nic('8.8.8.8'), wlan0: nic('10.0.0.9') }), '10.0.0.9')
})

test('没有可用地址时返回 null', () => {
  assert.equal(pickLanAddress({ lo: nic('127.0.0.1', true), 'vEthernet (WSL)': nic('172.20.0.1') }), null)
  assert.equal(pickLanAddress({}), null)
})

test('172.16–31 是私有地址，172.32 不是', () => {
  assert.equal(pickLanAddress({ eth0: nic('172.31.0.2') }), '172.31.0.2')
  assert.equal(pickLanAddress({ eth0: nic('172.32.0.2') }), null)
})
