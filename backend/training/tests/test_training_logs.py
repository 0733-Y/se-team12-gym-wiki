"""T4：训练日志幂等与删除规则（ARCHITECTURE.md 4.4）。"""
from datetime import timedelta

from django.test import TestCase
from django.utils import timezone

from common.tests.helpers import make_exercise
from training.models import TrainingLog, TrainingLogItem

META = {'title': 'Push day', 'plan_goal': 'hypertrophy', 'plan_frequency': 3, 'total_count': 4,
        'exercise_name': 'Barbell Bench Press', 'focus_label': 'chest', 'sets': 4, 'reps': '8-12', 'rest': '60-90s'}


class TrainingLogTests(TestCase):
    def setUp(self):
        self.ex1 = make_exercise()
        self.ex2 = make_exercise(name='Push-Up')
        self.date = '2026-11-09'

    def put(self, ex, date=None):
        return self.client.put(f'/api/training-logs/{date or self.date}/items/{ex.id}/', META,
                               content_type='application/json')

    def delete(self, ex, date=None):
        return self.client.delete(f'/api/training-logs/{date or self.date}/items/{ex.id}/')

    def test_put_twice_is_idempotent(self):
        r1 = self.put(self.ex1)
        r2 = self.put(self.ex1)
        self.assertEqual(r1.status_code, 200)
        self.assertEqual(r2.status_code, 200)
        self.assertEqual(TrainingLog.objects.count(), 1)
        self.assertEqual(TrainingLogItem.objects.count(), 1)
        data = r2.json()['data']
        self.assertEqual(data['date'], self.date)
        self.assertEqual(data['completed_count'], 1)
        self.assertEqual(data['total_count'], 4)
        self.assertEqual(data['weekday'], 0)  # 2026-11-09 是周一，由 date 推算
        self.assertEqual(data['items'][0]['exercise_id'], self.ex1.id)

    def test_uncomplete_last_item_deletes_log(self):
        self.put(self.ex1)
        self.put(self.ex2)
        resp = self.delete(self.ex1)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['data']['completed_count'], 1)

        resp = self.delete(self.ex2)
        self.assertEqual(resp.status_code, 200)
        self.assertIsNone(resp.json()['data'])
        self.assertEqual(TrainingLog.objects.count(), 0)

    def test_day_detail_and_range(self):
        self.assertIsNone(self.client.get(f'/api/training-logs/{self.date}/').json()['data'])
        self.put(self.ex1)
        self.put(self.ex1, date='2026-11-11')
        detail = self.client.get(f'/api/training-logs/{self.date}/').json()['data']
        self.assertEqual(len(detail['items']), 1)

        resp = self.client.get('/api/training-logs/?from=2026-11-09&to=2026-11-10')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual([d['date'] for d in resp.json()['data']], ['2026-11-09'])

    def test_put_unknown_exercise_is_404(self):
        resp = self.client.put(f'/api/training-logs/{self.date}/items/99999/', META, content_type='application/json')
        self.assertEqual(resp.status_code, 404)

    def test_stats(self):
        today = timezone.localdate()
        for offset in (0, 1):
            self.put(self.ex1, date=(today - timedelta(days=offset)).isoformat())
        self.put(self.ex1, date=(today - timedelta(days=3)).isoformat())
        resp = self.client.get('/api/training-logs/stats/?days=7')
        self.assertEqual(resp.status_code, 200)
        body = resp.json()
        self.assertEqual(len(body['data']), 7)
        self.assertEqual(body['data'][-1]['date'], today.isoformat())
        self.assertEqual(body['meta'], {'days': 7, 'workout_days': 3, 'completed_total': 3, 'streak': 2})
