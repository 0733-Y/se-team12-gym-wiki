from django.conf import settings
from django.test import SimpleTestCase


class P0SettingsTests(SimpleTestCase):
    """P0：确认项目骨架配置符合 ARCHITECTURE.md 4.5 节。"""

    def test_time_zone_is_seoul(self):
        self.assertEqual(settings.TIME_ZONE, 'Asia/Seoul')

    def test_apps_installed(self):
        for app in ('rest_framework', 'corsheaders', 'common', 'exercises', 'feedback', 'training'):
            self.assertIn(app, settings.INSTALLED_APPS)

    def test_cors_default_origin(self):
        self.assertIn('http://localhost:5173', settings.CORS_ALLOWED_ORIGINS)

    def test_media_root(self):
        self.assertEqual(settings.MEDIA_ROOT, settings.BASE_DIR / 'media')
        self.assertEqual(settings.MEDIA_URL, '/media/')

    def test_admin_reachable(self):
        resp = self.client.get('/admin/login/')
        self.assertEqual(resp.status_code, 200)


class DatabaseNameTests(SimpleTestCase):
    """GYM_DB_NAME 决定用哪个 SQLite 文件（端到端测试用单独的库）。"""

    def _db_name(self, env):
        # 设置在导入时读环境变量，所以起一个新进程来看结果
        import os
        import subprocess
        import sys
        from pathlib import Path

        code = (
            'import django; from django.conf import settings; django.setup(); '
            "print(settings.DATABASES['default']['NAME'])"
        )
        full_env = {key: value for key, value in os.environ.items() if key != 'GYM_DB_NAME'}
        full_env.update({'DJANGO_SETTINGS_MODULE': 'config.settings', **env})
        out = subprocess.run([sys.executable, '-c', code], cwd=settings.BASE_DIR, env=full_env,
                             capture_output=True, text=True, check=True)
        return Path(out.stdout.strip()).name

    def test_default_is_dev_database(self):
        self.assertEqual(self._db_name({}), 'db.sqlite3')

    def test_env_selects_other_file(self):
        self.assertEqual(self._db_name({'GYM_DB_NAME': 'db.e2e.sqlite3'}), 'db.e2e.sqlite3')


class AllowedHostsTests(SimpleTestCase):
    """DJANGO_ALLOWED_HOSTS 在默认的本机地址之外追加局域网 IP（scripts/dev-lan）。"""

    def _hosts(self, value):
        import os
        import subprocess
        import sys

        code = (
            'import django; from django.conf import settings; django.setup(); '
            "print(','.join(settings.ALLOWED_HOSTS))"
        )
        env = {key: val for key, val in os.environ.items() if key != 'DJANGO_ALLOWED_HOSTS'}
        env['DJANGO_SETTINGS_MODULE'] = 'config.settings'
        if value is not None:
            env['DJANGO_ALLOWED_HOSTS'] = value
        out = subprocess.run([sys.executable, '-c', code], cwd=settings.BASE_DIR, env=env,
                             capture_output=True, text=True, check=True)
        return out.stdout.strip().split(',')

    def test_default_has_only_local_hosts(self):
        self.assertEqual(self._hosts(None), ['127.0.0.1', 'localhost', 'testserver'])

    def test_env_adds_lan_ip(self):
        hosts = self._hosts(' 192.168.50.142 , ,10.0.0.7')
        self.assertEqual(hosts, ['127.0.0.1', 'localhost', 'testserver', '192.168.50.142', '10.0.0.7'])
