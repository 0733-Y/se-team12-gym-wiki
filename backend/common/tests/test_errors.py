"""T6：非法参数、不存在的 id、错误日期格式 → 正确状态码与统一错误外壳。"""
from django.contrib.auth.models import AnonymousUser, User
from django.test import RequestFactory, TestCase

from common.tests.helpers import make_exercise
from common.user_context import resolve_user


class ErrorEnvelopeTests(TestCase):
    def assertError(self, resp, status, code):
        self.assertEqual(resp.status_code, status, resp.content)
        body = resp.json()
        self.assertEqual(set(body), {'error'})
        self.assertEqual(body['error']['code'], code)
        self.assertIn('message', body['error'])
        return body['error']

    def test_stats_days_not_integer(self):
        err = self.assertError(self.client.get('/api/training-logs/stats/?days=abc'), 400, 'validation_error')
        self.assertIn('days', err['fields'])

    def test_stats_days_out_of_range(self):
        self.assertError(self.client.get('/api/training-logs/stats/?days=3'), 400, 'validation_error')
        self.assertError(self.client.get('/api/training-logs/stats/?days=91'), 400, 'validation_error')

    def test_range_params(self):
        self.assertError(self.client.get('/api/training-logs/'), 400, 'validation_error')
        self.assertError(self.client.get('/api/training-logs/?from=2026-13-01&to=2026-12-01'), 400, 'validation_error')
        err = self.assertError(self.client.get('/api/training-logs/?from=2026-11-10&to=2026-11-01'),
                               400, 'validation_error')
        self.assertIn('to', err['fields'])

    def test_bad_date_in_path(self):
        self.assertError(self.client.get('/api/training-logs/2026-02-30/'), 400, 'validation_error')
        self.assertError(self.client.get('/api/training-logs/yesterday/'), 400, 'validation_error')
        ex = make_exercise()
        self.assertError(self.client.put(f'/api/training-logs/11-09-2026/items/{ex.id}/', {},
                                         content_type='application/json'), 400, 'validation_error')

    def test_unknown_ids(self):
        self.assertError(self.client.get('/api/exercises/99999/'), 404, 'not_found')
        self.assertError(self.client.post('/api/wrong-book/99999/report/', {'error_category': 'form'},
                                          content_type='application/json'), 404, 'not_found')

    def test_unknown_api_path(self):
        self.assertError(self.client.get('/api/no-such-thing/'), 404, 'not_found')

    def test_invalid_group_filter(self):
        self.assertError(self.client.get('/api/exercises/?group=wings'), 400, 'validation_error')

    def test_malformed_json(self):
        ex = make_exercise()
        resp = self.client.post(f'/api/wrong-book/{ex.id}/report/', 'not json', content_type='application/json')
        self.assertError(resp, 400, 'validation_error')

    def test_success_envelope_and_media_path(self):
        ex = make_exercise(standard_image='exercises/bench.jpg')
        body = self.client.get(f'/api/exercises/{ex.id}/').json()
        self.assertEqual(body['data']['standard_image'], '/media/exercises/bench.jpg')
        self.assertEqual(body['data']['muscle_groups'], ['chest', 'triceps'])

        make_exercise(name='Pull-Up', category='back', groups=['lats', 'biceps'])
        names = [e['name'] for e in self.client.get('/api/exercises/?group=lats').json()['data']]
        self.assertEqual(names, ['Pull-Up'])


class UserContextTests(TestCase):
    def test_anonymous_uses_demo_user(self):
        req = RequestFactory().get('/')
        req.user = AnonymousUser()
        u1 = resolve_user(req)
        u2 = resolve_user(req)
        self.assertEqual(u1.username, 'demo')
        self.assertEqual(u1.pk, u2.pk)
        self.assertEqual(User.objects.count(), 1)
