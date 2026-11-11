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
